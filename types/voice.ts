// Types for voice demo and voice command features

export interface VoiceMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  toolCalls?: Array<{
    name: string
    arguments: Record<string, unknown>
  }>
  result?: unknown
  error?: string
}

export interface VoiceCommandRequest {
  command: string
  context?: Record<string, unknown>
}

export interface VoiceCommandResponse {
  success: boolean
  message: string
  action?: {
    type: string
    data: Record<string, unknown>
  }
  error?: string
}

