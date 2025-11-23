/**
 * Voice Date/Time Parsing Utilities
 * Parses natural language date/time expressions into ISO 8601 format
 */

/**
 * Parse relative date expressions like "today", "tomorrow", "next week"
 */
export function parseRelativeDate(dateStr: string): string | null {
  const lower = dateStr.toLowerCase().trim()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  if (lower === 'today') {
    return today.toISOString().split('T')[0]
  }
  if (lower === 'tomorrow') {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }
  if (lower === 'yesterday') {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }
  if (lower.includes('next week')) {
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    return nextWeek.toISOString().split('T')[0]
  }
  if (lower.includes('next month')) {
    const nextMonth = new Date(today)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return nextMonth.toISOString().split('T')[0]
  }
  if (lower.includes('in ') && lower.includes(' days')) {
    const daysMatch = lower.match(/in (\d+) days?/i)
    if (daysMatch) {
      const days = parseInt(daysMatch[1])
      const future = new Date(today)
      future.setDate(future.getDate() + days)
      return future.toISOString().split('T')[0]
    }
  }
  
  // Try to parse as ISO date
  try {
    const parsed = new Date(dateStr)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0]
    }
  } catch {}
  
  return null
}

/**
 * Parse time expressions like "2pm", "14:00", "tomorrow at 2pm"
 */
export function parseTime(timeStr: string): string | null {
  const lower = timeStr.toLowerCase().trim()
  
  // Match "2pm", "2 pm", "14:00", etc.
  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (timeMatch) {
    let hours = parseInt(timeMatch[1])
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0
    const ampm = timeMatch[3]?.toLowerCase()
    
    if (ampm === 'pm' && hours !== 12) {
      hours += 12
    } else if (ampm === 'am' && hours === 12) {
      hours = 0
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
  }
  
  return null
}

/**
 * Parse date and time together like "tomorrow at 2pm"
 */
export function parseDateTime(dateTimeStr: string): { date: string; time: string } | null {
  const lower = dateTimeStr.toLowerCase().trim()
  
  // Extract date part
  let datePart = lower
  let timePart = ''
  
  if (lower.includes(' at ')) {
    const parts = lower.split(' at ')
    datePart = parts[0]
    timePart = parts[1]
  } else if (lower.match(/\d{1,2}(am|pm)/i)) {
    // Time at the end
    const timeMatch = lower.match(/(\d{1,2}(am|pm))/i)
    if (timeMatch) {
      timePart = timeMatch[1]
      datePart = lower.replace(timeMatch[0], '').trim()
    }
  }
  
  const date = parseRelativeDate(datePart) || new Date().toISOString().split('T')[0]
  const time = timePart ? parseTime(timePart) : null
  
  if (time) {
    return { date, time }
  }
  
  return { date, time: '00:00:00' }
}

/**
 * Convert parsed date/time to ISO 8601 datetime string
 */
export function toISO8601(date: string, time?: string): string {
  const timeStr = time || '00:00:00'
  return `${date}T${timeStr}`
}

