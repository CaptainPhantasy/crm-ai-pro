'use client'

import React from 'react'

export function MobileLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Mobile-optimized container */}
        <main className="safe-area-inset">
          {children}
        </main>
      </div>
    </>
  )
}
