'use client'

import { useState, useEffect } from 'react'
import { User, TrendingUp, Target, DollarSign, Settings } from 'lucide-react'

export default function SalesProfilePage() {
  const [user, setUser] = useState<any>(null)
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
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
      </header>

      {/* Profile Card */}
      <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-[var(--color-accent-primary)] flex items-center justify-center text-2xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <div className="text-xl font-bold">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-gray-400">{user?.email}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--color-accent-primary)]">
              {stats.dealsWon}
            </div>
            <div className="text-xs text-gray-400">Deals Won</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--color-accent-primary)]">
              ${(stats.totalRevenue / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-gray-400">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--color-accent-primary)]">
              {stats.conversionRate}%
            </div>
            <div className="text-xs text-gray-400">Conv. Rate</div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <h2 className="text-lg font-bold mb-3">Settings</h2>
        <button className="w-full bg-[var(--color-bg-secondary)] rounded-xl p-4 text-left flex items-center gap-3 active:bg-gray-700">
          <Settings className="w-5 h-5" />
          <span>App Settings</span>
        </button>
      </div>
    </div>
  )
}
