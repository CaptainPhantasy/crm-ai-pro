import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { streamText, generateText } from 'ai'
import { getAuthenticatedSession } from '@/lib/auth-helper'
import { sanitizeObject, maskApiKey } from '@/lib/llm/security/key-manager'
import { getMemoryCache } from '@/lib/llm/cache/memory-cache'
import { CachedProviderRepository } from '@/lib/llm/cache/provider-cache'
import { getAuditQueue } from '@/lib/llm/audit'
import { getMetricsCollector, estimateCost } from '@/lib/llm/metrics'
import { ResilientProvider, ErrorHandler } from '@/lib/llm/resilience'
import { getRateLimiter } from '@/lib/llm/rate-limiting'
import { getBudgetTracker, CostEstimator } from '@/lib/llm/cost'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ================================================================
// Performance Optimization - Phase 2E
// ================================================================

// Initialize cache (singleton)
const cache = getMemoryCache()

// ================================================================
// Security Utilities
// ================================================================

/**
 * Sanitizes error messages to prevent API key leakage
 */
function sanitizeError(error: any): string {
  const message = error?.message || String(error)

  // Remove API key patterns from error messages
  // IMPORTANT: Check sk-ant- BEFORE sk- to avoid partial matches
  return message
    .replace(/sk-ant-[a-zA-Z0-9_-]+/g, 'sk-ant-***')
    .replace(/sk-proj-[a-zA-Z0-9_-]+/g, 'sk-proj-***')
    .replace(/sk-[a-zA-Z0-9_-]+/g, 'sk-***')
    .replace(/Bearer\s+[a-zA-Z0-9_-]+/g, 'Bearer ***')
    .replace(/api[_-]?key["\s:=]+[a-zA-Z0-9_-]+/gi, 'api_key=***')
}

/**
 * Logs errors with sanitized output
 */
function logError(context: string, error: any, metadata?: Record<string, any>) {
  const sanitizedError = sanitizeError(error)
  const sanitizedMetadata = metadata ? sanitizeObject(metadata) : {}

  console.error(`[LLM Router] ${context}:`, {
    error: sanitizedError,
    ...sanitizedMetadata,
    timestamp: new Date().toISOString(),
  })
}

// Tool format: OpenAI format (with type: 'function') or AI SDK format (direct)
type ToolFormat = 
  | { type: 'function'; function: { name: string; description: string; parameters: any } }
  | { description: string; parameters: any }

interface LLMRouterRequest {
  accountId?: string
  useCase?: 'draft' | 'summary' | 'complex' | 'vision' | 'general' | 'voice'
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
  modelOverride?: string // Optional: force specific model
  stream?: boolean // Whether to stream the response
  tools?: Record<string, ToolFormat> // Tools for function calling
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } } // Tool choice strategy
  maxSteps?: number // Maximum tool calling steps (for multi-step)
}

interface LLMProvider {
  id: string
  name: string
  provider: string
  model: string
  api_key_encrypted?: string
  is_default: boolean
  use_case: string[]
  max_tokens: number
  is_active: boolean
}

export async function POST(request: Request) {
  try {
    // Check for service role authentication (for edge function calls)
    const authHeader = request.headers.get('authorization')
    const isServiceRole = authHeader?.startsWith('Bearer ') && 
      authHeader.substring(7) === process.env.SUPABASE_SERVICE_ROLE_KEY
    
    // Authenticate user (skip if service role)
    let auth = null
    if (!isServiceRole) {
      auth = await getAuthenticatedSession(request)
      if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore
            }
          },
        },
      }
    )

    // Get user's account_id (skip if service role - accountId must be provided in body)
    let userAccountId: string | null = null
    if (!isServiceRole && auth) {
      const { data: user } = await supabase
        .from('users')
        .select('account_id')
        .eq('id', auth.user.id)
        .single()
      userAccountId = user?.account_id || null
    }

    const body: LLMRouterRequest = await request.json()
    const { 
      accountId, 
      useCase = 'general', 
      prompt, 
      systemPrompt, 
      maxTokens, 
      temperature, 
      modelOverride, 
      stream = false,
      tools,
      toolChoice = 'auto',
      maxSteps = 1
    } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const finalAccountId = accountId || userAccountId

    // Service role calls must provide accountId
    if (isServiceRole && !finalAccountId) {
      return NextResponse.json({ error: 'accountId is required for service role calls' }, { status: 400 })
    }

    // ================================================================
    // Rate Limiting Check - Phase 3J
    // ================================================================
    if (finalAccountId) {
      const rateLimiter = getRateLimiter()
      const rateLimitResult = rateLimiter.checkLimit(finalAccountId)

      if (rateLimitResult !== true) {
        return NextResponse.json(
          {
            error: rateLimitResult.message,
            code: rateLimitResult.code,
            retryAfterMs: rateLimitResult.retryAfterMs,
          },
          {
            status: rateLimitResult.status,
            headers: {
              'Retry-After': Math.ceil(rateLimitResult.retryAfterMs / 1000).toString(),
            },
          }
        )
      }
    }

    // Initialize cached provider repository (Phase 2E - Performance)
    const providerRepo = new CachedProviderRepository(supabase, cache)

    // Get LLM provider for this use case (with caching)
    let provider: LLMProvider | null = null

    if (modelOverride) {
      // Find specific model - get all providers and filter in memory
      const allProviders = await providerRepo.getProviders(finalAccountId)
      const matchingProviders = allProviders.filter(p => p.model === modelOverride)

      // Prefer account-specific over global
      provider = matchingProviders.sort((a, b) => {
        if (a.account_id && !b.account_id) return -1
        if (!a.account_id && b.account_id) return 1
        return 0
      })[0] || null
    } else {
      // Find provider by use case using cached repository
      const useCaseProviders = await providerRepo.getProvidersByUseCase(useCase, finalAccountId)

      // Sort providers: account-specific first, then by preference
      if (useCaseProviders.length > 0) {
        const sorted = useCaseProviders.sort((a: LLMProvider, b: LLMProvider) => {
          // 1. Prefer account-specific over global
          if (a.account_id && !b.account_id) return -1
          if (!a.account_id && b.account_id) return 1

          // 2. For complex: prefer Claude Sonnet over OpenAI GPT-4o
          if (useCase === 'complex') {
            const aIsClaude = a.provider === 'anthropic'
            const bIsClaude = b.provider === 'anthropic'
            if (aIsClaude && !bIsClaude) return -1
            if (!aIsClaude && bIsClaude) return 1
            // If both are Claude or both are not, prefer non-default
            if (!a.is_default && b.is_default) return -1
            if (a.is_default && !b.is_default) return 1
          }

          // 3. For draft/summary: prefer Haiku (alphabetically first: claude-haiku-4-5)
          if (useCase === 'draft' || useCase === 'summary') {
            return a.model.localeCompare(b.model)
          }

          // 4. For voice: prefer GPT-4o-mini (lowest latency) over Claude Haiku
          if (useCase === 'voice') {
            const aIsGPT4oMini = a.model === 'gpt-4o-mini'
            const bIsGPT4oMini = b.model === 'gpt-4o-mini'
            if (aIsGPT4oMini && !bIsGPT4oMini) return -1
            if (!aIsGPT4oMini && bIsGPT4oMini) return 1
            // If neither or both, prefer OpenAI (lower latency than Anthropic)
            if (a.provider === 'openai' && b.provider !== 'openai') return -1
            if (a.provider !== 'openai' && b.provider === 'openai') return 1
          }

          // 5. Otherwise prefer non-default
          if (!a.is_default && b.is_default) return -1
          if (a.is_default && !b.is_default) return 1

          return 0
        })

        provider = sorted[0] as LLMProvider
      }

      // Fallback to default if no use-case match
      if (!provider) {
        provider = await providerRepo.getDefaultProvider(finalAccountId)
      }
    }

    // Fallback to OpenAI if no provider found
    if (!provider) {
      provider = {
        id: 'default',
        name: 'openai-gpt4o-mini',
        provider: 'openai',
        model: 'gpt-4o-mini',
        is_default: true,
        use_case: ['draft', 'summary', 'general'],
        max_tokens: maxTokens || 1000,
        is_active: true,
      } as LLMProvider
    }

    // Get API key - prefer env var, fallback to database
    let apiKey: string | undefined
    if (provider.provider === 'openai') {
      apiKey = process.env.OPENAI_API_KEY
    } else if (provider.provider === 'anthropic') {
      apiKey = process.env.ANTHROPIC_API_KEY
    }

    // Fallback to database key if env var not set
    if (!apiKey && provider.api_key_encrypted) {
      apiKey = provider.api_key_encrypted
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: `API key not found for provider: ${provider.provider}. Please set ${provider.provider.toUpperCase()}_API_KEY in .env.local` },
        { status: 400 }
      )
    }

    const finalMaxTokens = maxTokens || provider.max_tokens || 1000
    const finalTemperature = temperature ?? 0.7

    // ================================================================
    // Budget Check - Phase 3J
    // ================================================================
    if (finalAccountId) {
      // Estimate cost based on approximate token usage
      // Rough estimate: 4 characters = 1 token
      const estimatedInputTokens = Math.ceil((prompt.length + (systemPrompt?.length || 0)) / 4)
      const estimatedOutputTokens = Math.ceil(finalMaxTokens * 0.5) // Assume 50% of max tokens will be used
      const estimatedCost = CostEstimator.estimateCost(
        provider.model,
        estimatedInputTokens,
        estimatedOutputTokens
      )

      const budgetTracker = getBudgetTracker()
      const budgetResult = budgetTracker.trackCost(finalAccountId, estimatedCost, provider.model)

      if (budgetResult !== { allowed: true }) {
        // Budget exceeded
        return NextResponse.json(
          {
            error: budgetResult.message,
            code: budgetResult.code,
            budgetStatus: budgetResult.budgetStatus,
          },
          { status: budgetResult.status }
        )
      }

      // Log budget status if approaching limits
      const budgetStatus = budgetTracker.getStatus(finalAccountId)
      if (budgetStatus.alerts.length > 0) {
        console.warn('[LLM Router] Budget alerts:', {
          accountId: finalAccountId,
          alerts: budgetStatus.alerts,
        })
      }
    }

    // Convert OpenAI format tools to AI SDK format if needed
    const convertedTools = tools ? Object.entries(tools).reduce((acc, [key, tool]) => {
      // If OpenAI format (has type: 'function'), extract function properties
      if ('type' in tool && tool.type === 'function' && 'function' in tool) {
        acc[key] = {
          description: tool.function.description,
          parameters: tool.function.parameters,
        }
      } else {
        // Already in AI SDK format
        acc[key] = tool as { description: string; parameters: any }
      }
      return acc
    }, {} as Record<string, { description: string; parameters: any }>) : undefined

    // Route to appropriate LLM provider
    if (provider.provider === 'openai') {
      const model = openai(provider.model, { apiKey })

      if (stream) {
        const result = streamText({
          model,
          system: systemPrompt,
          prompt,
          maxTokens: finalMaxTokens,
          temperature: finalTemperature,
          tools: convertedTools,
          toolChoice: toolChoice === 'none' ? 'none' : toolChoice === 'auto' ? 'auto' : toolChoice,
          maxSteps: convertedTools ? maxSteps : undefined,
        })

        return result.toDataStreamResponse()
      } else {
        // Phase 2D: Wrap with resilience layer (retry + circuit breaker)
        const metricsStartTime = Date.now()
        let lastAttempt = 0

        const resilient = new ResilientProvider(
          async () => {
            lastAttempt++
            return await generateText({
              model,
              system: systemPrompt,
              prompt,
              maxTokens: finalMaxTokens,
              temperature: finalTemperature,
              tools: convertedTools,
              toolChoice: toolChoice === 'none' ? 'none' : toolChoice === 'auto' ? 'auto' : toolChoice,
              maxSteps: convertedTools ? maxSteps : undefined,
            })
          },
          {
            maxRetries: 3,
            initialRetryDelay: 100,
            maxRetryDelay: 5000,
            backoffMultiplier: 2,
            circuitBreakerThreshold: 5,
            cooldownPeriod: 60_000,
          }
        )

        const result = await resilient.execute()

        // Metrics: Record success (Phase 2F - Non-blocking)
        const metricsCollector = getMetricsCollector()
        const metricsLatency = Date.now() - metricsStartTime
        const metricsCost = estimateCost(result.usage?.totalTokens || 0, provider.name)
        metricsCollector.recordSuccess(
          provider.name,
          metricsLatency,
          result.usage?.totalTokens || 0,
          metricsCost
        )

        // Log to audit trail (Phase 2E - Async, non-blocking)
        if (finalAccountId) {
          const auditQueue = getAuditQueue(supabase)
          auditQueue.enqueue({
            type: 'llm_request',
            accountId: finalAccountId,
            provider: provider.provider,
            model: provider.model,
            timestamp: new Date(),
            metadata: {
              use_case: useCase,
              tokens_used: result.usage?.totalTokens || 0,
              tool_calls: result.toolCalls?.length || 0,
              prompt_length: prompt.length,
              has_tools: !!tools,
              attempts: lastAttempt, // Track retry attempts
            },
          })
        }

        return NextResponse.json({
          success: true,
          text: result.text,
          provider: provider.name,
          model: provider.model,
          toolCalls: result.toolCalls?.map(tc => ({
            toolCallId: tc.toolCallId,
            toolName: tc.toolName,
            args: tc.args,
          })) || [],
          usage: {
            totalTokens: result.usage?.totalTokens || 0,
            promptTokens: result.usage?.promptTokens || 0,
            completionTokens: result.usage?.completionTokens || 0,
          },
        })
      }
    } else if (provider.provider === 'anthropic') {
      // Map database model names to AI SDK model names
      const modelName = provider.model.startsWith('claude-3-5-sonnet')
        ? 'claude-sonnet-4-5'  // Map to supported model name
        : provider.model

      const model = anthropic(modelName, { apiKey })

      if (stream) {
        const result = streamText({
          model,
          system: systemPrompt,
          prompt,
          maxTokens: finalMaxTokens,
          temperature: finalTemperature,
          tools: convertedTools,
          toolChoice: toolChoice === 'none' ? 'none' : toolChoice === 'auto' ? 'auto' : toolChoice,
          maxSteps: convertedTools ? maxSteps : undefined,
        })

        return result.toDataStreamResponse()
      } else {
        // Phase 2D: Wrap with resilience layer (retry + circuit breaker)
        const metricsStartTime = Date.now()
        let lastAttempt = 0

        const resilient = new ResilientProvider(
          async () => {
            lastAttempt++
            return await generateText({
              model,
              system: systemPrompt,
              prompt,
              maxTokens: finalMaxTokens,
              temperature: finalTemperature,
              tools: convertedTools,
              toolChoice: toolChoice === 'none' ? 'none' : toolChoice === 'auto' ? 'auto' : toolChoice,
              maxSteps: convertedTools ? maxSteps : undefined,
            })
          },
          {
            maxRetries: 3,
            initialRetryDelay: 100,
            maxRetryDelay: 5000,
            backoffMultiplier: 2,
            circuitBreakerThreshold: 5,
            cooldownPeriod: 60_000,
          }
        )

        const result = await resilient.execute()

        // Metrics: Record success (Phase 2F - Non-blocking)
        const metricsCollector = getMetricsCollector()
        const metricsLatency = Date.now() - metricsStartTime
        const metricsCost = estimateCost(result.usage?.totalTokens || 0, provider.name)
        metricsCollector.recordSuccess(
          provider.name,
          metricsLatency,
          result.usage?.totalTokens || 0,
          metricsCost
        )

        // Log to audit trail (Phase 2E - Async, non-blocking)
        if (finalAccountId) {
          const auditQueue = getAuditQueue(supabase)
          auditQueue.enqueue({
            type: 'llm_request',
            accountId: finalAccountId,
            provider: provider.provider,
            model: provider.model,
            timestamp: new Date(),
            metadata: {
              use_case: useCase,
              tokens_used: result.usage?.totalTokens || 0,
              tool_calls: result.toolCalls?.length || 0,
              prompt_length: prompt.length,
              has_tools: !!tools,
              attempts: lastAttempt, // Track retry attempts
            },
          })
        }

        return NextResponse.json({
          success: true,
          text: result.text,
          provider: provider.name,
          model: provider.model,
          toolCalls: result.toolCalls?.map(tc => ({
            toolCallId: tc.toolCallId,
            toolName: tc.toolName,
            args: tc.args,
          })) || [],
          usage: {
            totalTokens: result.usage?.totalTokens || 0,
            promptTokens: result.usage?.promptTokens || 0,
            completionTokens: result.usage?.completionTokens || 0,
          },
        })
      }
    } else {
      return NextResponse.json(
        { error: `Unsupported provider: ${provider.provider}. Supported providers: openai, anthropic` },
        { status: 400 }
      )
    }
  } catch (error: any) {
    // Phase 2D: Use centralized error handler for all errors
    // This provides:
    // - Proper HTTP status codes
    // - Structured error responses
    // - Error classification (retryable vs non-retryable)
    // - Sanitized error messages
    const errorStartTime = Date.now()
    logError('Request failed', error, {
      hasPrompt: !!request.body,
      userAgent: request.headers.get('user-agent'),
      errorCode: ErrorHandler.getErrorCode(error),
    })

    // Metrics: Record failure (Phase 2F - Non-blocking)
    if (provider?.name) {
      const metricsCollector = getMetricsCollector()
      const errorLatency = Date.now() - errorStartTime
      metricsCollector.recordFailure(
        provider.name,
        errorLatency,
        error
      )
    }

    // Use ErrorHandler for structured, safe response
    return ErrorHandler.handle(error)
  }
}

