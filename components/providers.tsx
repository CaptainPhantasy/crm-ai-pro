"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ConfirmDialogProvider } from '@/lib/confirm'
import { VoiceConversationProvider } from '@/components/voice-conversation-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <ConfirmDialogProvider>
        <VoiceConversationProvider>
          {children}
        </VoiceConversationProvider>
      </ConfirmDialogProvider>
    </QueryClientProvider>
  )
}

