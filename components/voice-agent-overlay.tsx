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
    // DISABLED: Using React SDK instead of embed widget
    // The voice agent is now implemented using @elevenlabs/react in VoiceAgentWidget
    // and integrated directly into the sidebar navigation
    
    // Strict Mode guard - only initialize once
    if (initialized.current) return
    initialized.current = true

    // Destroy any existing old embed widget instances
    destroyVoiceWidget()
    
    // Also remove any widget containers that might exist in the DOM
    const existingContainer = document.getElementById('elevenlabs-voice-widget-root')
    if (existingContainer) {
      existingContainer.remove()
    }
    
    // Remove any elevenlabs-convai elements that might be floating around
    const convaiElements = document.querySelectorAll('elevenlabs-convai')
    convaiElements.forEach(el => el.remove())
    
    // Remove the ElevenLabs embed script if it exists
    const embedScript = document.querySelector('script[src*="elevenlabs"][src*="convai-widget-embed"]')
    if (embedScript) {
      embedScript.remove()
    }
  }, [])

  // Render nothing - the widget DOM is managed by voice-widget-manager.ts
  return null
}
