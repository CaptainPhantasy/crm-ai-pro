/**
 * Voice Context Management
 * Tracks conversation context and resolves references
 */

export interface VoiceContext {
  lastJobId?: string
  lastContactId?: string
  lastConversationId?: string
  lastInvoiceId?: string
  conversationHistory?: Array<{ role: string; content: string; timestamp: number }>
  currentEntity?: {
    type: 'job' | 'contact' | 'conversation' | 'invoice'
    id: string
  }
}

// Store context (in-memory, should be moved to session/database in production)
const contextStore = new Map<string, VoiceContext>()

/**
 * Get context for account/user
 */
export function getContext(accountId: string, userId?: string): VoiceContext {
  const key = userId ? `${accountId}:${userId}` : accountId
  return contextStore.get(key) || {}
}

/**
 * Update context
 */
export function updateContext(
  accountId: string,
  updates: Partial<VoiceContext>,
  userId?: string
): VoiceContext {
  const key = userId ? `${accountId}:${userId}` : accountId
  const current = getContext(accountId, userId)
  const updated = { ...current, ...updates }
  contextStore.set(key, updated)
  return updated
}

/**
 * Resolve reference in command
 */
export function resolveReference(
  reference: string,
  context: VoiceContext
): { type: string; id: string } | null {
  const lower = reference.toLowerCase().trim()
  
  // Direct references
  if (lower === 'it' || lower === 'its' || lower === 'that' || lower === 'this') {
    if (context.currentEntity) {
      return { type: context.currentEntity.type, id: context.currentEntity.id }
    }
  }
  
  // Type-specific references
  if (lower.includes('job') && (lower.includes('last') || lower.includes('that') || lower.includes('this'))) {
    if (context.lastJobId) {
      return { type: 'job', id: context.lastJobId }
    }
  }
  
  if (lower.includes('contact') && (lower.includes('last') || lower.includes('that') || lower.includes('this'))) {
    if (context.lastContactId) {
      return { type: 'contact', id: context.lastContactId }
    }
  }
  
  if (lower.includes('conversation') && (lower.includes('last') || lower.includes('that') || lower.includes('this'))) {
    if (context.lastConversationId) {
      return { type: 'conversation', id: context.lastConversationId }
    }
  }
  
  if (lower.includes('invoice') && (lower.includes('last') || lower.includes('that') || lower.includes('this'))) {
    if (context.lastInvoiceId) {
      return { type: 'invoice', id: context.lastInvoiceId }
    }
  }
  
  return null
}

/**
 * Add to conversation history
 */
export function addToHistory(
  accountId: string,
  role: string,
  content: string,
  userId?: string
): void {
  const context = getContext(accountId, userId)
  const history = context.conversationHistory || []
  history.push({
    role,
    content,
    timestamp: Date.now(),
  })
  
  // Keep only last 10 messages
  if (history.length > 10) {
    history.shift()
  }
  
  updateContext(accountId, { conversationHistory: history }, userId)
}

/**
 * Get conversation history summary
 */
export function getHistorySummary(context: VoiceContext, maxLength: number = 500): string {
  if (!context.conversationHistory || context.conversationHistory.length === 0) {
    return ''
  }
  
  const recent = context.conversationHistory.slice(-5) // Last 5 messages
  const summary = recent.map(m => `${m.role}: ${m.content}`).join('\n')
  
  if (summary.length > maxLength) {
    return summary.substring(0, maxLength) + '...'
  }
  
  return summary
}

/**
 * Clear context
 */
export function clearContext(accountId: string, userId?: string): void {
  const key = userId ? `${accountId}:${userId}` : accountId
  contextStore.delete(key)
}

