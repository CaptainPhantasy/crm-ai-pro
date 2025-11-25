'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function VoiceAgentOverlay() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load ElevenLabs script
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed'
    script.async = true
    script.type = 'text/javascript'
    document.head.appendChild(script)

    return () => {
      // Cleanup script when component unmounts
      const existingScript = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  if (!mounted) return null

  // Render the ElevenLabs widget as a portal to document.body
  // This ensures it persists across page navigation
  return createPortal(
    <elevenlabs-convai agent-id="agent_6501katrbe2re0c834kfes3hvk2d" />,
    document.body
  )
}
