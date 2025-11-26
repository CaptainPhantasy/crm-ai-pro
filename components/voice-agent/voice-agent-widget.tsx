'use client'

import { useState } from 'react'
import { useConversation } from '@elevenlabs/react'
import { Phone, PhoneOff, Volume2, VolumeX, Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const AGENT_ID = 'agent_6501katrbe2re0c834kfes3hvk2d'

export function VoiceAgentWidget() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [micMuted, setMicMuted] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [isConnecting, setIsConnecting] = useState(false)

  const conversation = useConversation({
    micMuted,
    volume,
    onConnect: () => {
      setIsConnecting(false)
      console.log('[VoiceAgent] Connected')
    },
    onDisconnect: () => {
      setIsConnecting(false)
      console.log('[VoiceAgent] Disconnected')
    },
    onError: (error) => {
      setIsConnecting(false)
      console.error('[VoiceAgent] Error:', error)
    },
    onStatusChange: (status) => {
      console.log('[VoiceAgent] Status:', status)
    },
  })

  const { status, isSpeaking } = conversation

  const isConnected = status === 'connected'

  const handleStartCall = async () => {
    try {
      setIsConnecting(true)
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: 'webrtc',
      })
      setIsExpanded(true)
    } catch (error) {
      console.error('[VoiceAgent] Failed to start session:', error)
      setIsConnecting(false)
    }
  }

  const handleEndCall = async () => {
    try {
      await conversation.endSession()
      setIsExpanded(false)
    } catch (error) {
      console.error('[VoiceAgent] Failed to end session:', error)
    }
  }

  const toggleMic = () => {
    setMicMuted(!micMuted)
  }

  const toggleVolume = () => {
    setVolume(volume > 0 ? 0 : 0.8)
  }

  return (
    <div className="w-full px-3 py-3 border-t border-theme-border bg-theme-surface">
      {!isExpanded ? (
        // Collapsed state - just the start button
        <Button
          onClick={handleStartCall}
          disabled={isConnecting}
          className={cn(
            "w-full flex items-center justify-center gap-2 h-10",
            "bg-theme-accent-primary hover:bg-theme-accent-primary/90",
            "text-white font-medium",
            "transition-all"
          )}
        >
          <Phone className="h-4 w-4" />
          {isConnecting ? 'Connecting...' : 'Start a call'}
        </Button>
      ) : (
        // Expanded state - full controls
        <div className="space-y-3">
          {/* Status indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  isConnected
                    ? isSpeaking
                      ? "bg-green-500 animate-pulse"
                      : "bg-green-500"
                    : "bg-gray-400"
                )}
              />
              <span className="text-xs text-theme-secondary">
                {isConnected
                  ? isSpeaking
                    ? 'Agent speaking...'
                    : 'Connected'
                  : 'Disconnected'}
              </span>
            </div>
            <Button
              onClick={handleEndCall}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-theme-secondary hover:text-theme-primary"
            >
              <PhoneOff className="h-3 w-3" />
            </Button>
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleMic}
              variant="outline"
              size="sm"
              className={cn(
                "flex-1 h-8",
                micMuted && "bg-red-500/10 border-red-500/50 text-red-500"
              )}
            >
              {micMuted ? (
                <>
                  <MicOff className="h-3 w-3 mr-1" />
                  <span className="text-xs">Unmute</span>
                </>
              ) : (
                <>
                  <Mic className="h-3 w-3 mr-1" />
                  <span className="text-xs">Mute</span>
                </>
              )}
            </Button>
            <Button
              onClick={toggleVolume}
              variant="outline"
              size="sm"
              className={cn(
                "flex-1 h-8",
                volume === 0 && "bg-orange-500/10 border-orange-500/50 text-orange-500"
              )}
            >
              {volume === 0 ? (
                <>
                  <VolumeX className="h-3 w-3 mr-1" />
                  <span className="text-xs">Unmute</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3 mr-1" />
                  <span className="text-xs">Volume</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

