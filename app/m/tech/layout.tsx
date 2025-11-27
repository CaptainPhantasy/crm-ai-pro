'use client'

import { useOfflineSync } from '@/lib/hooks/use-offline-sync'

export default function TechLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isOnline, isSyncing, pendingCount } = useOfflineSync()

  return (
    <>
      {/* Offline indicator banner */}
      {!isOnline && (
        <div className="bg-yellow-600 text-white px-4 py-2 text-center text-sm font-medium fixed top-0 left-0 right-0 z-50">
          Offline Mode - {pendingCount} item{pendingCount !== 1 ? 's' : ''} pending sync
        </div>
      )}

      {/* Syncing indicator */}
      {isSyncing && (
        <div className="bg-blue-600 text-white px-4 py-2 text-center text-sm font-medium fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          Syncing {pendingCount} item{pendingCount !== 1 ? 's' : ''}...
        </div>
      )}

      {/* Add padding to prevent content from being hidden under fixed banners */}
      <div className={isOnline && !isSyncing ? '' : 'pt-10'}>
        {children}
      </div>
    </>
  )
}
