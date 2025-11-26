'use client'

import { useEffect, useRef } from 'react'
import { initializeVoiceWidget, destroyVoiceWidget } from '@/lib/voice-widget-manager'

// TypeScript: Declare the custom ElevenLabs element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { 'agent-id': string }
    }
  }
}

/**
 * VoiceAgentOverlay
 * 
 * This component acts as a "trigger" to initialize the voice widget.
 * The actual widget DOM lives OUTSIDE of React entirely (managed by voice-widget-manager.ts).
 * 
 * WHY: React's reconciliation can reset custom elements even with React.memo and portals.
 * The only way to preserve an active call across route changes is complete DOM isolation.
 * 
 * This component:
 * - Calls initializeVoiceWidget() once on mount
 * - Renders NOTHING (the widget is created by vanilla JS)
 * - Never causes re-renders that could affect the widget
 */
export function VoiceAgentOverlay() {
  const initialized = useRef(false)

  useEffect(() => {
    // Strict Mode guard - only initialize once
    if (initialized.current) return
    initialized.current = true

    // Initialize the widget using vanilla JS (completely outside React)
    initializeVoiceWidget()

    // Optional: Cleanup on logout (uncomment if needed)
    // return () => {
    //   destroyVoiceWidget()
    // }
  }, [])

  // Render nothing - the widget DOM is managed by voice-widget-manager.ts
  return null
}
