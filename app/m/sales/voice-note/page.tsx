'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, MicOff, Save, ArrowLeft } from 'lucide-react'
import { BigButton } from '@/components/mobile/big-button'
import { VoiceButton } from '@/components/mobile/voice-button'

export default function VoiceNotePage() {
  const router = useRouter()
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [duration, setDuration] = useState(0)
  const [saving, setSaving] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const initializeRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' '
          } else {
            interimTranscript += result[0].transcript
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please enable it in settings.')
        }
      }

      recognitionRef.current.onend = () => {
        if (isRecording && !isPaused) {
          recognitionRef.current?.start()
        }
      }
    }
  }

  const startRecording = () => {
    if (!recognitionRef.current) {
      initializeRecording()
    }

    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser')
      return
    }

    setIsRecording(true)
    setIsPaused(false)
    recognitionRef.current.start()

    timerRef.current = setInterval(() => {
      setDuration(d => d + 1)
    }, 1000)
  }

  const pauseRecording = () => {
    setIsPaused(true)
    recognitionRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const resumeRecording = () => {
    setIsPaused(false)
    recognitionRef.current?.start()
    timerRef.current = setInterval(() => {
      setDuration(d => d + 1)
    }, 1000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    setIsPaused(false)
    recognitionRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const saveNote = async () => {
    if (!transcript.trim()) {
      alert('No voice note to save')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/meetings/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: transcript,
          type: 'voice_note',
          durationMinutes: Math.ceil(duration / 60),
        }),
      })

      if (response.ok) {
        alert('Voice note saved successfully!')
        router.push('/m/sales/dashboard')
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save voice note. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white flex flex-col">
      {/* Header */}
      <header className="bg-[var(--color-bg-secondary)] p-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <div className="font-bold">Voice Note</div>
          <div className="text-3xl font-mono text-[var(--color-accent-primary)]">{formatTime(duration)}</div>
        </div>
        <div className={`w-4 h-4 rounded-full ${
          isRecording
            ? isPaused
              ? 'bg-yellow-500'
              : 'bg-red-500 animate-pulse'
            : 'bg-gray-600'
        }`} />
      </header>

      {/* Transcript area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 min-h-[300px]">
          {transcript ? (
            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
              {transcript}
            </p>
          ) : (
            <p className="text-gray-500 text-center py-12">
              {isRecording
                ? 'Listening... Start speaking'
                : 'Tap START to begin recording'}
            </p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3 bg-[var(--color-bg-primary)]">
        {!isRecording ? (
          <BigButton
            onClick={startRecording}
            icon={Mic}
            label="START RECORDING"
            sublabel="Tap to begin voice note"
            variant="success"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {isPaused ? (
              <BigButton
                onClick={resumeRecording}
                icon={Mic}
                label="RESUME"
                variant="success"
              />
            ) : (
              <BigButton
                onClick={pauseRecording}
                icon={MicOff}
                label="PAUSE"
                variant="warning"
              />
            )}
            <BigButton
              onClick={stopRecording}
              icon={MicOff}
              label="STOP"
              variant="danger"
            />
          </div>
        )}

        {transcript && !isRecording && (
          <BigButton
            onClick={saveNote}
            icon={Save}
            label={saving ? 'SAVING...' : 'SAVE NOTE'}
            disabled={saving}
            variant="primary"
          />
        )}
      </div>

      {/* Voice Command Button */}
      <VoiceButton />
    </div>
  )
}