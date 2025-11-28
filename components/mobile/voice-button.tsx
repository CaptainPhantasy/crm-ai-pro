'use client'

import { useState } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { useVoiceNavigation } from '@/hooks/use-voice-navigation'

/**
 * VoiceButton - Floating voice command button for mobile interfaces
 *
 * Features:
 * - Fixed position above bottom navigation
 * - Animated pulse when listening
 * - Touch-optimized with visual feedback
 * - Integrates with voice navigation system
 *
 * @example
 * ```tsx
 * <VoiceButton />
 * ```
 */
export function VoiceButton() {
  const { isListening, startListening, stopListening } = useVoiceNavigation()
  const [isPressed, setIsPressed] = useState(false)

  const handlePress = () => {
    setIsPressed(true)
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleRelease = () => {
    setIsPressed(false)
  }

  return (
    <button
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
      className={`
        fixed bottom-20 right-4 z-40
        w-14 h-14 rounded-full
        flex items-center justify-center
        transition-all duration-200
        shadow-lg
        ${isListening
          ? 'bg-red-500 scale-110 animate-pulse'
          : 'bg-[var(--color-accent-primary)]'
        }
        ${isPressed ? 'scale-95' : 'scale-100'}
        active:scale-95
      `}
      aria-label={isListening ? 'Stop listening' : 'Start voice command'}
    >
      {isListening ? (
        <MicOff className="w-6 h-6 text-white" />
      ) : (
        <Mic className="w-6 h-6 text-white" />
      )}
    </button>
  )
}
