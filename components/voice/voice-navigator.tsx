'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { parseNavigationCommand, NavigationCommand } from '@/lib/voice-navigation'

interface VoiceNavigatorProps {
  navigationCommand: NavigationCommand | null
  onNavigate?: () => void
}

export function VoiceNavigator({ navigationCommand, onNavigate }: VoiceNavigatorProps) {
  const router = useRouter()

  useEffect(() => {
    if (!navigationCommand) return

    const { route, action, entityId, entityType } = navigationCommand

    if (action === 'open') {
      if (entityId && entityType) {
        // Open specific entity (e.g., job detail modal)
        // This would trigger a modal or detail view
        // For now, navigate to the entity page
        router.push(`/${route}/${entityId}`)
      } else {
        // Navigate to route
        router.push(route)
      }
    } else if (action === 'close') {
      // Close current modal or go back
      router.back()
    } else if (action === 'switch') {
      // Switch tabs/views within current page
      router.push(route)
    }

    onNavigate?.()
  }, [navigationCommand, router, onNavigate])

  return null
}

