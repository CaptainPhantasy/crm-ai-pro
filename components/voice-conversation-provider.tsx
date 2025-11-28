'use client'

import { createContext, useContext, useRef, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useConversation } from '@elevenlabs/react'

/**
 * VoiceConversationProvider
 *
 * Provides a SINGLE shared conversation instance for the entire application.
 * This prevents multiple components from creating duplicate WebRTC sessions.
 *
 * **Architecture:**
 * - ONE conversation instance per user session
 * - Client-side tools registered here (navigation, UI actions, etc.)
 * - UI components (like VoiceAgentWidget) consume this context for controls
 */

const AGENT_ID = 'agent_6501katrbe2re0c834kfes3hvk2d'

interface VoiceConversationContextValue {
  conversation: ReturnType<typeof useConversation>
  startSessionWithTools: () => Promise<void>
}

const VoiceConversationContext = createContext<VoiceConversationContextValue | null>(null)

export function VoiceConversationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const sessionStarted = useRef(false)

  const conversation = useConversation({
    onConnect: () => {
      console.log('[VoiceConversation] Connected to voice agent')
    },
    onDisconnect: () => {
      console.log('[VoiceConversation] Disconnected from voice agent')
      sessionStarted.current = false
    },
    onError: (error) => {
      console.error('[VoiceConversation] Error:', error)
    },
    onStatusChange: (status) => {
      console.log('[VoiceConversation] Status:', status)
    },
  })

  /**
   * Start ElevenLabs session with client-side tools
   * This should only be called ONCE when the user initiates a voice call
   */
  const startSessionWithTools = async () => {
    console.error('🚨 startSessionWithTools() CALLED')

    if (sessionStarted.current) {
      console.error('⚠️ Session already started - aborting')
      console.log('[VoiceConversation] Session already started')
      return
    }

    try {
      sessionStarted.current = true
      console.error('🚨 REGISTERING CLIENT TOOLS NOW...')

      // Define client-side tools that execute in the browser
      const clientTools = {
        navigation: {
          description: 'Navigate to a different page in the CRM application',
          parameters: {
            type: 'object' as const,
            properties: {
              route: {
                type: 'string' as const,
                description: 'The route to navigate to (e.g., /jobs, /settings, /contacts)',
              },
            },
            required: ['route'],
          },
          handler: async (params: { route: string }) => {
            // 🚨 LOUD DEBUGGING - This MUST appear if client tools are registered
            console.error("🚨 VOICE BRIDGE RECEIVED SIGNAL:", params.route)
            console.error("🚨 CLIENT TOOL HANDLER EXECUTING IN BROWSER")

            let { route } = params
            let target = route.toLowerCase().trim()

            // ==========================================
            // SMART ALIASING: Mobile PWA Routes
            // ==========================================

            // Tech Routes
            if (target.includes('tech') && (target.includes('dashboard') || target.includes('home'))) {
              target = '/m/tech/dashboard'
            } else if (target.includes('tech') && target.includes('map')) {
              target = '/m/tech/map'
            } else if (target.includes('tech') && target.includes('job')) {
              // If job ID is provided, extract it, otherwise go to job list
              const jobIdMatch = target.match(/job[\/\s]+(\d+)/)
              if (jobIdMatch) {
                target = `/m/tech/job/${jobIdMatch[1]}`
              } else {
                target = '/m/tech/dashboard' // Default to dashboard if no ID
              }
            } else if (target.includes('tech') && target.includes('profile')) {
              target = '/m/tech/profile'
            }

            // Sales Routes
            else if (target.includes('sales') && (target.includes('dashboard') || target.includes('home'))) {
              target = '/m/sales/dashboard'
            } else if (target.includes('sales') && target.includes('lead')) {
              target = '/m/sales/leads'
            } else if (target.includes('sales') && target.includes('briefing')) {
              // If contact ID is provided, extract it
              const contactIdMatch = target.match(/briefing[\/\s]+([a-f0-9\-]+)/)
              if (contactIdMatch) {
                target = `/m/sales/briefing/${contactIdMatch[1]}`
              } else {
                target = '/m/sales/leads' // Default to leads if no ID
              }
            } else if (target.includes('sales') && target.includes('meeting')) {
              // If meeting ID is provided, extract it
              const meetingIdMatch = target.match(/meeting[\/\s]+([a-f0-9\-]+)/)
              if (meetingIdMatch) {
                target = `/m/sales/meeting/${meetingIdMatch[1]}`
              } else {
                target = '/m/sales/dashboard' // Default to dashboard if no ID
              }
            } else if (target.includes('sales') && target.includes('profile')) {
              target = '/m/sales/profile'
            }

            // Owner Routes
            else if (target.includes('owner') && (target.includes('dashboard') || target.includes('home'))) {
              target = '/m/owner/dashboard'
            }

            // Generic Dashboard (try to infer from current route)
            else if (target === 'dashboard' || target === '/dashboard') {
              // If user is currently on a mobile route, stay in mobile context
              if (pathname.startsWith('/m/tech')) {
                target = '/m/tech/dashboard'
              } else if (pathname.startsWith('/m/sales')) {
                target = '/m/sales/dashboard'
              } else if (pathname.startsWith('/m/owner')) {
                target = '/m/owner/dashboard'
              } else {
                // Default to original route (desktop or generic)
                target = route
              }
            }

            // If no alias matched, use the original route
            else {
              target = route
            }

            // Safety: Ensure leading slash
            if (!target.startsWith('/')) {
              target = `/${target}`
            }

            console.log(`[VoiceNavigation] Route requested: "${route}" → Navigating to: ${target}`)

            // Perform client-side navigation using Next.js router
            router.push(target)

            // Return success message to Agent
            return {
              success: true,
              message: `Navigated to ${target}`,
              previousRoute: pathname,
              newRoute: target,
              originalRequest: route,
            }
          },
        },

        get_current_page: {
          description: 'Get the current page/route the user is on',
          parameters: {
            type: 'object' as const,
            properties: {},
          },
          handler: async () => {
            console.log(`[VoiceNavigation] Current page: ${pathname}`)

            return {
              currentRoute: pathname,
              message: `User is currently on ${pathname}`,
            }
          },
        },

        scroll_to_section: {
          description: 'Scroll to a specific section on the current page',
          parameters: {
            type: 'object' as const,
            properties: {
              sectionId: {
                type: 'string' as const,
                description: 'The HTML ID of the section to scroll to',
              },
            },
            required: ['sectionId'],
          },
          handler: async (params: { sectionId: string }) => {
            const { sectionId } = params

            console.log(`[VoiceNavigation] Scrolling to: ${sectionId}`)

            const element = document.getElementById(sectionId)

            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
              return {
                success: true,
                message: `Scrolled to section: ${sectionId}`,
              }
            } else {
              return {
                success: false,
                message: `Section not found: ${sectionId}`,
              }
            }
          },
        },

        trigger_ui_action: {
          description: 'Trigger a UI action like opening a modal, showing a tooltip, etc.',
          parameters: {
            type: 'object' as const,
            properties: {
              action: {
                type: 'string' as const,
                description: 'The UI action to trigger (e.g., "open_create_job_modal", "show_notifications")',
              },
              payload: {
                type: 'object' as const,
                description: 'Optional payload data for the action',
              },
            },
            required: ['action'],
          },
          handler: async (params: { action: string; payload?: Record<string, unknown> }) => {
            const { action, payload } = params

            console.log(`[VoiceNavigation] Triggering UI action: ${action}`, payload)

            // Dispatch custom event that UI components can listen to
            const event = new CustomEvent('voice-ui-action', {
              detail: { action, payload },
            })
            window.dispatchEvent(event)

            return {
              success: true,
              message: `Triggered UI action: ${action}`,
              action,
              payload,
            }
          },
        },

        open_new_tab: {
          description: 'Open a URL in a new browser tab',
          parameters: {
            type: 'object' as const,
            properties: {
              url: {
                type: 'string' as const,
                description: 'The URL to open',
              },
            },
            required: ['url'],
          },
          handler: async (params: { url: string }) => {
            const { url } = params

            console.log(`[VoiceNavigation] Opening new tab: ${url}`)

            window.open(url, '_blank', 'noopener,noreferrer')

            return {
              success: true,
              message: `Opened ${url} in new tab`,
            }
          },
        },
      }

      // Start session with client tools
      console.log("🚀 STARTING SESSION... Registering Client Tools:", Object.keys(clientTools))
      console.error('🚨 Navigation tool handler type:', typeof clientTools.navigation.handler)

      await conversation.startSession({
        agentId: AGENT_ID,
        clientTools: clientTools // <--- THIS is the critical payload
      })

      console.log("✅ Session Started Successfully")
      console.log('[VoiceConversation] Client tools registered:', Object.keys(clientTools))
    } catch (error) {
      console.error('[VoiceConversation] Failed to start session:', error)
      sessionStarted.current = false
      throw error
    }
  }

  return (
    <VoiceConversationContext.Provider value={{ conversation, startSessionWithTools }}>
      {children}
    </VoiceConversationContext.Provider>
  )
}

/**
 * Hook to access the shared voice conversation
 */
export function useVoiceConversation() {
  const context = useContext(VoiceConversationContext)

  if (!context) {
    throw new Error('useVoiceConversation must be used within VoiceConversationProvider')
  }

  return context
}
