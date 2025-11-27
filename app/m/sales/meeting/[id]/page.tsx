'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Save, X, User, Pause, Play } from 'lucide-react'
import { BigButton } from '@/components/mobile/big-button'
import { useParams, useRouter } from 'next/navigation'

export default function MeetingTranscriptionPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = params.id as string
  const isNewMeeting = meetingId === 'new'

  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [duration, setDuration] = useState(0)
  const [contact, setContact] = useState<{ id: string; name: string } | null>(null)
  const [saving, setSaving] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Initialize Web Speech API
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
        // Restart if still recording (for continuous transcription)
        if (isRecording && !isPaused) {
          recognitionRef.current?.start()
        }
      }
    }

    // Load existing meeting if not new
    if (!isNewMeeting) {
      fetchMeeting()
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      recognitionRef.current?.stop()
    }
  }, [])

  const fetchMeeting = async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`)
      if (res.ok) {
        const data = await res.json()
        setContact(data.meeting?.contact)
        if (data.meeting?.transcript) {
          setTranscript(data.meeting.transcript)
        }
      }
    } catch (error) {
      console.error('Failed to fetch meeting:', error)
    }
  }

  const startRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser')
      return
    }

    setIsRecording(true)
    setIsPaused(false)
    recognitionRef.current.start()
    
    // Start timer
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

  const saveMeeting = async () => {
    if (!transcript.trim()) {
      alert('No transcript to save')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contact?.id,
          transcript,
          meetingType: 'in_person',
          durationMinutes: Math.ceil(duration / 60),
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Build AI results message
        let message = 'Meeting saved successfully!\n\n'

        if (data.analysis) {
          message += '🤖 AI ANALYSIS\n'
          message += '─'.repeat(40) + '\n\n'

          if (data.analysis.summary) {
            message += `📝 Summary:\n${data.analysis.summary}\n\n`
          }

          if (data.analysis.actionItems && data.analysis.actionItems.length > 0) {
            message += `✅ Action Items (${data.analysis.actionItems.length}):\n`
            data.analysis.actionItems.forEach((item: string, i: number) => {
              message += `${i + 1}. ${item}\n`
            })
            message += '\n'
          }

          if (data.analysis.sentiment) {
            const sentimentEmoji = {
              positive: '😊',
              neutral: '😐',
              negative: '😞',
              mixed: '🤔'
            }[data.analysis.sentiment] || '📊'
            message += `${sentimentEmoji} Sentiment: ${data.analysis.sentiment}\n\n`
          }

          if (data.analysis.nextSteps) {
            message += `🎯 Next Steps:\n${data.analysis.nextSteps}\n`
          }
        } else {
          message += 'Note: AI analysis was not available, but your transcript was saved.'
        }

        alert(message)
        router.push('/m/sales/dashboard')
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save meeting. Please try again.')
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex items-center justify-between safe-area-top">
        <button 
          onClick={() => {
            if (transcript && !confirm('Discard this recording?')) return
            router.back()
          }} 
          className="p-2"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-center">
          <div className="font-bold">
            {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Meeting Mode'}
          </div>
          <div className="text-3xl font-mono text-blue-400">{formatTime(duration)}</div>
        </div>
        <div className={`w-4 h-4 rounded-full ${
          isRecording 
            ? isPaused 
              ? 'bg-yellow-500' 
              : 'bg-red-500 animate-pulse' 
            : 'bg-gray-600'
        }`} />
      </header>

      {/* Contact info */}
      {contact && (
        <div className="bg-gray-800/50 px-4 py-2 flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{contact.name}</span>
        </div>
      )}

      {/* Transcript area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="bg-gray-800 rounded-xl p-4 min-h-[300px]">
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
      <div className="p-4 space-y-3 safe-area-bottom bg-gray-900">
        {!isRecording ? (
          <BigButton
            onClick={startRecording}
            icon={Mic}
            label="START RECORDING"
            sublabel="Tap to begin transcription"
            variant="success"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {isPaused ? (
              <BigButton
                onClick={resumeRecording}
                icon={Play}
                label="RESUME"
                variant="success"
              />
            ) : (
              <BigButton
                onClick={pauseRecording}
                icon={Pause}
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
            onClick={saveMeeting}
            icon={Save}
            label={saving ? 'SAVING...' : 'SAVE & ANALYZE'}
            sublabel="AI will extract action items"
            variant="primary"
            disabled={saving}
          />
        )}
      </div>
    </div>
  )
}

