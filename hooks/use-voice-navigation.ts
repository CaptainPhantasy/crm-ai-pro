'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Default account ID - matches the MCP server default
// TODO: Make this dynamic based on logged-in user
const DEFAULT_ACCOUNT_ID = 'fde73a6a-ea84-46a7-803b-a3ae7cc09d00'

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

/**
 * Hook that listens for voice navigation commands from the ElevenLabs agent
 * via Supabase Realtime and executes them by navigating to the requested page.
 * Also provides voice button controls for manual voice input.
 *
 * @param accountId - The account ID to listen for commands (defaults to DEFAULT_ACCOUNT_ID)
 */
export function useVoiceNavigation(accountId: string = DEFAULT_ACCOUNT_ID) {
  const router = useRouter()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const recognitionRef = useRef<any>(null)
  const supabase = createClient()
  const [isListening, setIsListening] = useState(false)

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
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [accountId, router, supabase])

  const startListening = () => {
    // Check for Web Speech API support
    if (globalThis.window === undefined) return
    if (!('webkitSpeechRecognition' in globalThis) && !('SpeechRecognition' in globalThis)) {
      alert('Voice input not supported in this browser')
      return
    }

    const SpeechRecognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      console.log('[VoiceNavigation] Started listening')
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
      console.log('[VoiceNavigation] Voice input:', transcript)

      // Here you could add command parsing logic
      // For now, just log the transcript
      // In the future, this could trigger navigation or actions
    }

    recognition.onerror = (event: any) => {
      console.error('[VoiceNavigation] Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      console.log('[VoiceNavigation] Stopped listening')
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }

  return {
    isListening,
    startListening,
    stopListening,
  }
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

