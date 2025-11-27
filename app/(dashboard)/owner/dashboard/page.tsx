'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Owner Dashboard Page
 *
 * Redirects owner users to the inbox, which serves as their
 * primary landing page for accessing all system features.
 * Owners have full access to all functionality from the inbox.
 */
export default function OwnerDashboard() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to inbox (primary landing page for owner role)
    router.push('/inbox')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B79FF] mx-auto mb-4"></div>
        <p className="text-neutral-600">Redirecting to Inbox...</p>
      </div>
    </div>
  )
}
