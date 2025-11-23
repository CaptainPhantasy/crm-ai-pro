/**
 * Voice Navigation Utilities
 * Handles voice-based navigation commands
 */

export interface NavigationCommand {
  route: string
  action: 'open' | 'close' | 'switch'
  entityId?: string
  entityType?: 'job' | 'contact' | 'conversation' | 'invoice'
}

export interface RouteMapping {
  [key: string]: string
}

// Map voice commands to routes
export const ROUTE_MAPPINGS: RouteMapping = {
  jobs: '/jobs',
  job: '/jobs',
  contacts: '/contacts',
  contact: '/contacts',
  inbox: '/inbox',
  conversations: '/inbox',
  analytics: '/analytics',
  dashboard: '/dashboard',
  settings: '/settings',
  invoices: '/invoices',
  invoice: '/invoices',
  payments: '/payments',
  payment: '/payments',
  campaigns: '/campaigns',
  campaign: '/campaigns',
}

/**
 * Parse navigation command from voice response
 */
export function parseNavigationCommand(response: any): NavigationCommand | null {
  if (response.navigation) {
    return response.navigation as NavigationCommand
  }
  return null
}

/**
 * Get route path from voice command
 */
export function getRouteFromCommand(command: string): string | null {
  const lower = command.toLowerCase().trim()
  
  // Direct mappings
  for (const [key, route] of Object.entries(ROUTE_MAPPINGS)) {
    if (lower.includes(key)) {
      return route
    }
  }
  
  // Pattern matching
  if (lower.match(/go to|show me|open|navigate to/)) {
    for (const [key, route] of Object.entries(ROUTE_MAPPINGS)) {
      if (lower.includes(key)) {
        return route
      }
    }
  }
  
  return null
}

/**
 * Extract entity ID and type from command
 */
export function extractEntityFromCommand(command: string): { id?: string; type?: string } {
  const lower = command.toLowerCase()
  
  // Match patterns like "job 123", "contact john", "invoice 456"
  const jobMatch = lower.match(/job\s+([a-z0-9-]+)/i)
  if (jobMatch) {
    return { id: jobMatch[1], type: 'job' }
  }
  
  const contactMatch = lower.match(/contact\s+([a-z\s]+)/i)
  if (contactMatch) {
    return { id: contactMatch[1].trim(), type: 'contact' }
  }
  
  const invoiceMatch = lower.match(/invoice\s+([a-z0-9-]+)/i)
  if (invoiceMatch) {
    return { id: invoiceMatch[1], type: 'invoice' }
  }
  
  const conversationMatch = lower.match(/conversation\s+([a-z0-9-]+)/i)
  if (conversationMatch) {
    return { id: conversationMatch[1], type: 'conversation' }
  }
  
  return {}
}

