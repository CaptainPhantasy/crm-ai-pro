'use client'

import { useState, useRef, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mic, MicOff, Send, Loader2, CheckCircle2, XCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VoiceMessage } from '@/types/voice'
import { VoiceCommandHandler } from '@/components/voice/voice-command-handler'
import { getContext, updateContext, addToHistory } from '@/lib/voice-context'

export default function VoiceDemoPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [transcription, setTranscription] = useState('')
  const [accountId, setAccountId] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Get account ID - use hardcoded demo account for now
    async function getAccount() {
      try {
        // Try to get account from session first
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('account_id')
            .eq('id', session.user.id)
            .single()
          
          if (!userError && user?.account_id) {
            setAccountId(user.account_id)
            return
          }
        }
        
        // Fallback: get first account
        const { data: accounts, error: accountsError } = await supabase
          .from('accounts')
          .select('id')
          .limit(1)
        
        if (!accountsError && accounts?.[0]?.id) {
          setAccountId(accounts[0].id)
        } else {
          // Use known demo account
          setAccountId('fde73a6a-ea84-46a7-803b-a3ae7cc09d00')
        }
      } catch (error) {
        console.error('Error getting account:', error)
        // Use known demo account as fallback
        setAccountId('fde73a6a-ea84-46a7-803b-a3ae7cc09d00')
      }
    }
    // Set account immediately as fallback, then try to get real one
    setAccountId('fde73a6a-ea84-46a7-803b-a3ae7cc09d00')
    getAccount()

    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results as SpeechRecognitionResultList)
            .map((result: SpeechRecognitionResult) => result[0].transcript)
            .join('')
          setTranscription(transcript)
        }

        recognition.onend = () => {
          setIsRecording(false)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsRecording(false)
        }

        recognitionRef.current = recognition
      }

      // Initialize speech synthesis
      synthRef.current = window.speechSynthesis
    }

    // Welcome message
    setMessages([{
      id: 'welcome',
      role: 'system',
      content: 'Voice Agent Demo - Speak or type a command to control the CRM',
      timestamp: new Date()
    }])
  }, [supabase])

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start()
      setIsRecording(true)
      setTranscription('')
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      synthRef.current.speak(utterance)
    }
  }

  const sendCommand = async (text: string) => {
    if (!text.trim() || !accountId) return

    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setTranscription('')
    setIsProcessing(true)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const { data: { session } } = await supabase.auth.getSession()
      
      // Get context for this account/user
      const context = getContext(accountId, session?.user?.id)
      
      // Get service role key from API route (we'll create a proxy)
      const response = await fetch('/api/voice-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          transcription: text,
          context: {
            lastJobId: context.lastJobId,
            lastContactId: context.lastContactId,
            lastConversationId: context.lastConversationId,
            conversationHistory: context.conversationHistory?.slice(-5).map(m => ({
              role: m.role,
              content: m.content,
            })),
          },
        }),
      })

      if (response.ok) {
      const data = await response.json()
        if (data.success) {
        const assistantMessage: VoiceMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response || 'Command executed successfully',
          timestamp: new Date(),
          toolCalls: data.toolCalls || (data.action ? [{ name: data.action, arguments: data.params || {} }] : undefined),
          result: data.result || data,
        }
        setMessages(prev => [...prev, assistantMessage])
        
        // Update context with last accessed entities
        if (data.jobId || data.job) {
          updateContext(accountId, {
            lastJobId: data.jobId || data.job?.id,
            currentEntity: { type: 'job', id: data.jobId || data.job?.id },
          }, session?.user?.id)
        }
        if (data.contactId || data.contact) {
          updateContext(accountId, {
            lastContactId: data.contactId || data.contact?.id,
            currentEntity: { type: 'contact', id: data.contactId || data.contact?.id },
          }, session?.user?.id)
        }
        if (data.conversationId || data.conversation) {
          updateContext(accountId, {
            lastConversationId: data.conversationId || data.conversation?.id,
            currentEntity: { type: 'conversation', id: data.conversationId || data.conversation?.id },
          }, session?.user?.id)
        }
        
        // Add to conversation history
        addToHistory(accountId, 'assistant', data.response || 'Command executed', session?.user?.id)
        
        // Speak the response
        speak(assistantMessage.content)
      } else {
          const errorMessage: VoiceMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.error || 'Failed to process command',
            timestamp: new Date(),
            error: data.error || 'Unknown error',
          }
          setMessages(prev => [...prev, errorMessage])
        }
      } else {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMessage: VoiceMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.error || 'Failed to process command',
          timestamp: new Date(),
          error: data.error || 'Unknown error',
        }
        setMessages(prev => [...prev, errorMessage])
        speak('Sorry, I encountered an error processing that command.')
      }
    } catch (error: any) {
      const errorMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
        error: error.message,
      }
      setMessages(prev => [...prev, errorMessage])
      speak('Sorry, I encountered an error.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (transcription.trim()) {
      sendCommand(transcription)
    }
  }

  return (
    <>
      {accountId && <VoiceCommandHandler accountId={accountId} />}
      <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-600" />
            Voice Agent Demo
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Speak or type commands to control your CRM. Try: "Create a job for John Smith to fix a leaky faucet"
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden max-w-6xl w-full mx-auto p-4">
        <div className="h-full flex flex-col gap-4">
          {/* Messages */}
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-900">Conversation</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg p-3',
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : msg.role === 'system'
                        ? 'bg-gray-100 text-gray-700 border'
                        : msg.error
                        ? 'bg-red-50 text-red-900 border border-red-200'
                        : 'bg-white text-gray-900 border shadow-sm'
                    )}
                  >
                    <div className="text-sm font-medium mb-1">
                      {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : 'Voice Agent'}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-600 mb-1">Tool Calls:</div>
                        {msg.toolCalls.map((call, idx) => (
                          <div key={idx} className="text-xs bg-blue-50 p-2 rounded mt-1">
                            <div className="font-mono font-semibold text-blue-900">{call.name}</div>
                            <div className="text-gray-600 mt-1">
                              {JSON.stringify(call.arguments, null, 2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.result && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs font-semibold text-green-600 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Result:
                        </div>
                        <div className="text-xs bg-green-50 p-2 rounded mt-1 text-gray-700">
                          {JSON.stringify(msg.result, null, 2).substring(0, 200)}
                          {JSON.stringify(msg.result, null, 2).length > 200 && '...'}
                        </div>
                      </div>
                    )}

                    {msg.error && (
                      <div className="mt-2 pt-2 border-t border-red-200">
                        <div className="text-xs font-semibold text-red-600 mb-1 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Error:
                        </div>
                        <div className="text-xs text-red-700">{msg.error}</div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white border rounded-lg p-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span className="text-sm text-gray-600">Processing command...</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Input */}
          <Card className="p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  placeholder={isRecording ? 'Listening...' : 'Type or speak a command...'}
                  className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  disabled={isProcessing || isRecording}
                />
                {isRecording && (
                  <div className="absolute top-2 right-2 flex items-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    <span className="text-xs font-medium">Recording</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {recognitionRef.current ? (
                  <Button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    variant={isRecording ? 'destructive' : 'outline'}
                    className="px-4"
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Record
                      </>
                    )}
                  </Button>
                ) : null}
                <Button
                  type="submit"
                  disabled={!transcription.trim() || isProcessing || !accountId}
                  className="px-6"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </form>
            {!accountId && (
              <div className="mt-2 text-xs text-amber-600">
                ⚠️ Loading account...
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
    </>
  )
}

