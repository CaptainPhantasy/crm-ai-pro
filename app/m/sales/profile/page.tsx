'use client'

import { useState, useEffect } from 'react'
import { User, TrendingUp, Target, DollarSign, Settings, Menu } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MobileSidebar, MobileMenuButton } from '@/components/mobile/mobile-sidebar'
import { SalesBottomNav } from '@/components/mobile/bottom-nav'

export default function SalesProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    dealsWon: 0,
    totalRevenue: 0,
    conversionRate: 0,
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/sales/profile')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] p-4 pb-24">
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="sales" />

      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <MobileMenuButton onClick={() => setSidebarOpen(true)} />
      </header>

      {/* Profile Card */}
      <Card className="p-6 mb-6 shadow-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-[var(--color-accent-primary)] flex items-center justify-center text-2xl font-bold shadow-glow">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <div className="text-xl font-bold">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-[var(--color-text-secondary)]">{user?.email}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--color-accent-primary)]">
              {stats.dealsWon}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">Deals Won</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--color-accent-primary)]">
              ${(stats.totalRevenue / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--color-accent-primary)]">
              {stats.conversionRate}%
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">Conv. Rate</div>
          </div>
        </div>
      </Card>

      {/* Settings */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold mb-3">Settings</h2>
        <Card className="p-4 shadow-card hover:shadow-card-hover transition-all duration-200">
          <button className="w-full text-left flex items-center gap-3">
            <Settings className="w-5 h-5 text-[var(--color-text-secondary)]" />
            <span className="text-[var(--color-text-primary)]">App Settings</span>
          </button>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <SalesBottomNav />
    </div>
  )
}
