/**
 * Voice Selection Utilities
 * Handles voice-based selection from multiple results
 */

export interface SelectionItem {
  id: string
  name: string
  index: number
  data?: any
}

export interface SelectionState {
  items: SelectionItem[]
  query: string
  timestamp: number
}

// Store last selection state (in-memory, should be moved to context/session in production)
let lastSelectionState: SelectionState | null = null

/**
 * Create selection state from results
 */
export function createSelectionState(items: any[], query: string, nameField: string = 'name'): SelectionState {
  const selectionItems: SelectionItem[] = items.map((item, index) => ({
    id: item.id || item.contactId || item.jobId || item.conversationId || String(index),
    name: item[nameField] || item.first_name || item.description || `Item ${index + 1}`,
    index: index + 1,
    data: item,
  }))
  
  const state: SelectionState = {
    items: selectionItems,
    query,
    timestamp: Date.now(),
  }
  
  lastSelectionState = state
  return state
}

/**
 * Parse selection from voice command
 */
export function parseSelection(command: string, state: SelectionState | null = null): SelectionItem | null {
  const lower = command.toLowerCase().trim()
  const currentState = state || lastSelectionState
  
  if (!currentState || currentState.items.length === 0) {
    return null
  }
  
  // Match "first", "second", "third", etc.
  const ordinalMatch = lower.match(/(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|one|two|three|four|five)/)
  if (ordinalMatch) {
    const ordinals: { [key: string]: number } = {
      first: 1, second: 2, third: 3, fourth: 4, fifth: 5,
      '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5,
      one: 1, two: 2, three: 3, four: 4, five: 5,
    }
    const index = ordinals[ordinalMatch[1].toLowerCase()]
    if (index && index <= currentState.items.length) {
      return currentState.items[index - 1]
    }
  }
  
  // Match "number 1", "number 2", etc.
  const numberMatch = lower.match(/number\s+(\d+)|#(\d+)|(\d+)/)
  if (numberMatch) {
    const num = parseInt(numberMatch[1] || numberMatch[2] || numberMatch[3])
    if (num > 0 && num <= currentState.items.length) {
      return currentState.items[num - 1]
    }
  }
  
  // Match by name
  for (const item of currentState.items) {
    if (lower.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(lower)) {
      return item
    }
  }
  
  return null
}

/**
 * Format selection prompt for voice
 */
export function formatSelectionPrompt(state: SelectionState): string {
  if (state.items.length === 0) {
    return 'No items found.'
  }
  
  if (state.items.length === 1) {
    return `Found 1 item: ${state.items[0].name}.`
  }
  
  if (state.items.length <= 5) {
    const itemsList = state.items.map((item, i) => `Number ${i + 1}: ${item.name}`).join('. ')
    return `Found ${state.items.length} items: ${itemsList}. Which one would you like?`
  }
  
  const itemsList = state.items.slice(0, 5).map((item, i) => `Number ${i + 1}: ${item.name}`).join('. ')
  return `Found ${state.items.length} items. Here are the first 5: ${itemsList}. Which one would you like?`
}

/**
 * Get last selection state
 */
export function getLastSelectionState(): SelectionState | null {
  return lastSelectionState
}

/**
 * Clear selection state
 */
export function clearSelectionState(): void {
  lastSelectionState = null
}

