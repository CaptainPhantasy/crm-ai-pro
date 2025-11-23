'use client'

import { useState, useEffect } from 'react'
import { SelectionState, parseSelection, formatSelectionPrompt, SelectionItem } from '@/lib/voice-selection'

interface VoiceSelectionDialogProps {
  selectionState: SelectionState | null
  onSelect: (item: SelectionItem) => void
  onCancel: () => void
  visible: boolean
}

export function VoiceSelectionDialog({
  selectionState,
  onSelect,
  onCancel,
  visible,
}: VoiceSelectionDialogProps) {
  const [listening, setListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('Speech recognition not available')
      return
    }

    const rec = new SpeechRecognition()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      if (selectionState) {
        const selected = parseSelection(transcript, selectionState)
        if (selected) {
          onSelect(selected)
          setListening(false)
        }
      }
    }

    rec.onerror = () => {
      setListening(false)
    }

    rec.onend = () => {
      setListening(false)
    }

    setRecognition(rec)
  }, [selectionState, onSelect])

  const startListening = () => {
    if (recognition && !listening) {
      recognition.start()
      setListening(true)
    }
  }

  const stopListening = () => {
    if (recognition && listening) {
      recognition.stop()
      setListening(false)
    }
  }

  if (!visible || !selectionState) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Select an option</h3>
        
        <p className="text-sm text-gray-600 mb-4">
          {formatSelectionPrompt(selectionState)}
        </p>

        <div className="space-y-2 mb-4">
          {selectionState.items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50"
            >
              <span className="font-medium">#{item.index}</span> {item.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={listening ? stopListening : startListening}
            className={`flex-1 px-4 py-2 rounded ${
              listening
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {listening ? 'Stop Listening' : 'Speak Selection'}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        {listening && (
          <p className="mt-4 text-sm text-center text-gray-500">
            Listening... Say the number or name
          </p>
        )}
      </div>
    </div>
  )
}

