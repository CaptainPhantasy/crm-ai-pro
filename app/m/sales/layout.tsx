'use client'

import { SalesBottomNav } from '@/components/mobile/bottom-nav'

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="pb-20">
        {children}
      </div>
      <SalesBottomNav />
    </>
  )
}
