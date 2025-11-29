'use client'

import { useOfflineSync } from '@/lib/hooks/use-offline-sync'
import { useGpsTracking } from '@/lib/hooks/use-gps-tracking'
import { TechBottomNav } from '@/components/mobile/bottom-nav'

export default function TechLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isOnline, isSyncing, pendingCount } = useOfflineSync()
  useGpsTracking() // Initialize GPS tracking

  return (
    <>
      {/* Offline indicator banner */}
      {!isOnline && (
        <div className="bg-amber-500/20 text-amber-400 px-4 py-2 text-center text-sm font-medium fixed top-0 left-0 right-0 z-50 shadow-elevated">
          Offline Mode - {pendingCount} item{pendingCount !== 1 ? 's' : ''} pending sync
        </div>
      )}

      {/* Syncing indicator */}
      {isSyncing && (
        <div className="bg-[var(--color-accent-primary)] text-white px-4 py-2 text-center text-sm font-medium fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          Syncing {pendingCount} item{pendingCount !== 1 ? 's' : ''}...
        </div>
      )}

      {/* Add padding to prevent content from being hidden under fixed banners */}
      <div className={`pb-20 ${isOnline && !isSyncing ? '' : 'pt-10'}`}>
        {children}
      </div>
      <TechBottomNav />
    </>
  )
}
