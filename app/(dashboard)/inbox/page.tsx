'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ConversationList } from '@/components/dashboard/conversation-list'
import { MessageThread } from '@/components/dashboard/message-thread'
import { ConversationSidebar } from '@/components/inbox/conversation-sidebar'
import { getQueryParamWithFallback } from '@/lib/query-params'
import { ErrorBoundary } from '@/components/error-boundary'

function InboxPageContent() {
  const searchParams = useSearchParams()
  // Support both ?id= and ?conversation= for backward compatibility
  // Prefer ?conversation= going forward
  const conversationId = getQueryParamWithFallback(searchParams, 'conversation', ['id'])

  const sidebarClasses = conversationId ? 'hidden md:flex' : 'flex'
  const mainChatClasses = conversationId ? 'flex' : 'hidden md:flex'

  return (
    <ErrorBoundary context="inbox">
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-theme-secondary">
      {/* Sidebar - Always visible on desktop, hidden on mobile if thread selected */}
      <div className={`${sidebarClasses} w-full md:w-80 h-full flex-shrink-0 border-r-2 border-theme-border`}>
        <ConversationList />
      </div>

      {/* Main Chat Area - Hidden on mobile if no thread selected */}
      <div className={`${mainChatClasses} flex-1 h-full min-w-0`}>
        {conversationId ? (
          <MessageThread conversationId={conversationId} />
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-theme-subtle bg-theme-card">
            <div className="text-center">
              <p className="text-lg font-medium text-white mb-2">No conversation selected</p>
              <p className="text-sm text-theme-subtle">Select a conversation from the sidebar to view messages</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Right Sidebar */}
      <ConversationSidebar conversationId={conversationId} />
      </div>
    </ErrorBoundary>
  )
}

export default function InboxPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-theme-secondary">
        <div className="w-full md:w-80 h-full flex-shrink-0 border-r-2 border-theme-border bg-theme-card">
          <div className="p-4 space-y-4">
            <div className="h-16 bg-theme-secondary rounded animate-pulse border-2 border-theme-border" />
            <div className="h-16 bg-theme-secondary rounded animate-pulse border-2 border-theme-border" />
            <div className="h-16 bg-theme-secondary rounded animate-pulse border-2 border-theme-border" />
          </div>
        </div>
        <div className="flex-1 h-full bg-theme-card flex items-center justify-center">
          <div className="text-theme-subtle">Loading...</div>
        </div>
      </div>
    }>
      <InboxPageContent />
    </Suspense>
  )
}

