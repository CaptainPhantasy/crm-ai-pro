'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Default account ID - matches the MCP server default
// TODO: Make this dynamic based on logged-in user
const DEFAULT_ACCOUNT_ID = 'fde73a6a-ea84-46a7-803b-a3ae7cc09d00'

/**
 * Hook that listens for voice navigation commands from the ElevenLabs agent
 * via Supabase Realtime and executes them by navigating to the requested page.
 * 
 * @param accountId - The account ID to listen for commands (defaults to DEFAULT_ACCOUNT_ID)
 */
export function useVoiceNavigation(accountId: string = DEFAULT_ACCOUNT_ID) {
  const router = useRouter()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Always subscribe - we have a default account ID
    if (!accountId) return // Safety check, but should always have value

    // Subscribe to new navigation commands
    const channel = supabase
      .channel(`voice-nav-${accountId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'voice_navigation_commands',
          filter: `account_id=eq.${accountId}`,
        },
        async (payload) => {
          const command = payload.new as {
            id: string
            page: string
            params: Record<string, any>
            executed: boolean
          }

          // Skip if already executed
          if (command.executed) return

          console.log('[VoiceNavigation] Received command:', command.page)

          // Navigate to the page
          router.push(command.page)

          // Mark command as executed
          await supabase
            .from('voice_navigation_commands')
            .update({ 
              executed: true, 
              executed_at: new Date().toISOString() 
            })
            .eq('id', command.id)

          console.log('[VoiceNavigation] Navigated to:', command.page)
        }
      )
      .subscribe((status) => {
        console.log('[VoiceNavigation] Subscription status:', status)
      })

    channelRef.current = channel

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [accountId, router, supabase])

  return null
}

/**
 * Provider component that enables voice navigation globally
 * Place this in your root layout or dashboard layout
 */
export function VoiceNavigationProvider({ 
  accountId = DEFAULT_ACCOUNT_ID 
}: { 
  accountId?: string 
}) {
  useVoiceNavigation(accountId)
  return null
}

