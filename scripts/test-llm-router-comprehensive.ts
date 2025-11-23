import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

interface TestCase {
  useCase: string
  prompt: string
  expectedProvider?: string
  description: string
}

async function testLLMRouter() {
  console.log('🧪 Comprehensive LLM Router Testing\n')

  const baseUrl = `${supabaseUrl}/functions/v1/llm-router`
  const headers = {
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  }

  const testCases: TestCase[] = [
    {
      useCase: 'draft',
      prompt: 'Write a professional email to a customer about a scheduled appointment.',
      expectedProvider: 'openai',
      description: 'Draft generation (should use GPT-4o-mini)'
    },
    {
      useCase: 'summary',
      prompt: 'Summarize this conversation in 2 sentences.',
      expectedProvider: 'openai',
      description: 'Summary generation (should use GPT-4o-mini or haiku)'
    },
    {
      useCase: 'complex',
      prompt: 'Analyze this complex technical problem and provide a detailed solution.',
      expectedProvider: 'anthropic',
      description: 'Complex tasks (should prefer Claude if available)'
    },
    {
      useCase: 'general',
      prompt: 'Answer this general question about plumbing.',
      expectedProvider: 'openai',
      description: 'General queries (should use default)'
    },
  ]

  const results: any[] = []

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.description}`)
    console.log(`   Use case: ${testCase.useCase}`)
    
    try {
      const startTime = Date.now()
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          useCase: testCase.useCase,
          prompt: testCase.prompt,
          maxTokens: 100,
        }),
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      if (response.ok && data.text) {
        const provider = data.provider || 'unknown'
        const model = data.model || 'unknown'
        const tokens = data.usage?.total_tokens || 'N/A'
        
        console.log(`   ✅ SUCCESS`)
        console.log(`   Provider: ${provider}`)
        console.log(`   Model: ${model}`)
        console.log(`   Tokens: ${tokens}`)
        console.log(`   Duration: ${duration}ms`)
        console.log(`   Response: ${data.text.substring(0, 100)}...`)

        results.push({
          testCase: testCase.description,
          success: true,
          provider,
          model,
          tokens,
          duration,
          responseLength: data.text.length,
        })

        // Check if provider matches expectation
        if (testCase.expectedProvider && !provider.includes(testCase.expectedProvider)) {
          console.log(`   ⚠️  Expected ${testCase.expectedProvider}, got ${provider}`)
        }
      } else {
        console.log(`   ❌ FAILED`)
        console.log(`   Status: ${response.status}`)
        console.log(`   Error: ${data.error || JSON.stringify(data)}`)
        results.push({
          testCase: testCase.description,
          success: false,
          error: data.error || 'Unknown error',
        })
      }
    } catch (error: any) {
      console.log(`   ❌ ERROR: ${error.message}`)
      results.push({
        testCase: testCase.description,
        success: false,
        error: error.message,
      })
    }
  }

  // Test fallback chain
  console.log(`\n\n🔄 Testing Fallback Chain...`)
  console.log(`   Testing with invalid use case (should fallback to default)...`)
  
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        useCase: 'invalid-use-case-12345',
        prompt: 'Test fallback',
      }),
    })

    const data = await response.json()
    if (response.ok && data.text) {
      console.log(`   ✅ Fallback working - Provider: ${data.provider || 'default'}`)
      results.push({
        testCase: 'Fallback chain',
        success: true,
        provider: data.provider,
      })
    } else {
      console.log(`   ⚠️  Fallback may not be working: ${data.error}`)
      results.push({
        testCase: 'Fallback chain',
        success: false,
        error: data.error,
      })
    }
  } catch (error: any) {
    console.log(`   ❌ Fallback test error: ${error.message}`)
    results.push({
      testCase: 'Fallback chain',
      success: false,
      error: error.message,
    })
  }

  // Summary
  console.log(`\n\n📊 Test Summary:`)
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  console.log(`   ✅ Successful: ${successful}/${results.length}`)
  console.log(`   ❌ Failed: ${failed}/${results.length}`)

  if (successful > 0) {
    const avgDuration = results
      .filter(r => r.duration)
      .reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.duration).length
    console.log(`   ⏱️  Average duration: ${Math.round(avgDuration)}ms`)
  }

  const providers = [...new Set(results.filter(r => r.provider).map(r => r.provider))]
  console.log(`   🔌 Providers used: ${providers.join(', ')}`)

  return results
}

testLLMRouter().catch(console.error)

