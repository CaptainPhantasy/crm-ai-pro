'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { VoiceNavigator } from './voice-navigator'
import { VoiceSelectionDialog } from './voice-selection-dialog'
import { parseNavigationCommand, NavigationCommand } from '@/lib/voice-navigation'
import { createSelectionState, SelectionState, SelectionItem } from '@/lib/voice-selection'
import { getContext, updateContext, addToHistory } from '@/lib/voice-context'

interface VoiceCommandHandlerProps {
  accountId: string
  userId?: string
}

export function VoiceCommandHandler({ accountId, userId }: VoiceCommandHandlerProps) {
  const router = useRouter()
  const [navigationCommand, setNavigationCommand] = useState<NavigationCommand | null>(null)
  const [selectionState, setSelectionState] = useState<SelectionState | null>(null)
  const [showSelection, setShowSelection] = useState(false)

  const handleVoiceResponse = useCallback(async (response: any) => {
    // Add to conversation history
    addToHistory(accountId, 'assistant', response.response || 'Command executed', userId)

    // Update context with last accessed entities
    if (response.jobId || response.job) {
      updateContext(accountId, {
        lastJobId: response.jobId || response.job?.id,
        currentEntity: { type: 'job', id: response.jobId || response.job?.id },
      }, userId)
    }
    if (response.contactId || response.contact) {
      updateContext(accountId, {
        lastContactId: response.contactId || response.contact?.id,
        currentEntity: { type: 'contact', id: response.contactId || response.contact?.id },
      }, userId)
    }
    if (response.conversationId || response.conversation) {
      updateContext(accountId, {
        lastConversationId: response.conversationId || response.conversation?.id,
        currentEntity: { type: 'conversation', id: response.conversationId || response.conversation?.id },
      }, userId)
    }

    // Handle navigation
    const navCmd = parseNavigationCommand(response)
    if (navCmd) {
      setNavigationCommand(navCmd)
    }

    // Handle selection prompts (multiple results)
    if (response.contacts && response.contacts.length > 1) {
      const state = createSelectionState(response.contacts, 'contacts', 'first_name')
      setSelectionState(state)
      setShowSelection(true)
    } else if (response.jobs && response.jobs.length > 1) {
      const state = createSelectionState(response.jobs, 'jobs', 'description')
      setSelectionState(state)
      setShowSelection(true)
    } else if (response.conversations && response.conversations.length > 1) {
      const state = createSelectionState(response.conversations, 'conversations', 'subject')
      setSelectionState(state)
      setShowSelection(true)
    }
  }, [accountId, userId])

  const handleSelection = useCallback((item: SelectionItem) => {
    setShowSelection(false)
    // Use the selected item for the next command
    // This would typically trigger a follow-up command with the selected ID
    console.log('Selected:', item)
  }, [])

  return (
    <>
      <VoiceNavigator navigationCommand={navigationCommand} />
      <VoiceSelectionDialog
        selectionState={selectionState}
        onSelect={handleSelection}
        onCancel={() => setShowSelection(false)}
        visible={showSelection}
      />
    </>
  )
}

