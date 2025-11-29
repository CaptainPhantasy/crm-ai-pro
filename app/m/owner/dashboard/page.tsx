'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Users, Star, TrendingUp, AlertTriangle, MapPin, Clock, Menu } from 'lucide-react'
import { BigButton } from '@/components/mobile/big-button'
import { MobileSidebar, MobileMenuButton } from '@/components/mobile/mobile-sidebar'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface Stats {
  todayRevenue: number
  weekRevenue: number
  monthRevenue: number
  jobsToday: number
  jobsCompleted: number
  avgRating: number
  reviewsCollected: number
  techsActive: number
  techsTotal: number
  alerts: Array<{
    id: string
    type: string
    message: string
    severity: 'info' | 'warning' | 'critical'
  }>
}

interface TechStatus {
  id: string
  name: string
  status: 'idle' | 'en_route' | 'on_job' | 'offline'
  currentJob?: string
  lastLocation?: {
    lat: number
    lng: number
    updatedAt: string
  }
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState<Stats>({
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    jobsToday: 0,
    jobsCompleted: 0,
    avgRating: 0,
    reviewsCollected: 0,
    techsActive: 0,
    techsTotal: 0,
    alerts: [],
  })
  const [techs, setTechs] = useState<TechStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    // Refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/owner/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats || stats)
        setTechs(data.techs || [])
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-accent-primary)]" />
      </div>
    )
  }

  const jobProgress = stats.jobsToday > 0
    ? (stats.jobsCompleted / stats.jobsToday) * 100
    : 0

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] p-4 pb-24">
      {/* Mobile Sidebar - Owner doesn't have a dedicated sidebar, but we can add one if needed */}
      <MobileSidebar isOpen={false} onClose={() => {}} role="tech" />

      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-[var(--color-text-secondary)]">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </header>

      {/* Alerts */}
      {stats.alerts.length > 0 && (
        <Card className="p-6 mb-6 border border-red-500/50 bg-[var(--color-bg-surface)]">
          <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
            <AlertTriangle className="w-5 h-5" />
            {stats.alerts.length} item(s) need attention
          </div>
          <ul className="space-y-1">
            {stats.alerts.slice(0, 3).map((alert) => (
              <li key={alert.id} className="text-[var(--color-text-secondary)] text-sm">
                • {alert.message}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          icon={DollarSign}
          label="Today"
          value={`$${stats.todayRevenue.toLocaleString()}`}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="This Week"
          value={`$${stats.weekRevenue.toLocaleString()}`}
          color="accent"
        />
        <StatCard
          icon={Star}
          label="Avg Rating"
          value={stats.avgRating.toFixed(1)}
          sublabel={`${stats.reviewsCollected} reviews`}
          color="yellow"
        />
        <StatCard
          icon={Users}
          label="Team Active"
          value={`${stats.techsActive}/${stats.techsTotal}`}
          color="purple"
        />
      </div>

      {/* Jobs Progress */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between mb-2">
          <span className="font-bold">Today's Jobs</span>
          <span className="text-[var(--color-text-secondary)]">
            {stats.jobsCompleted}/{stats.jobsToday}
          </span>
        </div>
        <div className="h-3 bg-[var(--color-bg-surface)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-accent-primary)] to-green-500 transition-all duration-500"
            style={{ width: `${jobProgress}%` }}
          />
        </div>
        <div className="text-right text-sm text-[var(--color-text-subtle)] mt-1">
          {jobProgress.toFixed(0)}% complete
        </div>
      </Card>

      {/* Team Status */}
      <h2 className="text-xl font-bold mb-4">Team Status</h2>
      <div className="space-y-3 mb-6">
        {techs.map((tech) => (
          <Card key={tech.id} className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">{tech.name}</div>
                {tech.currentJob && (
                  <div className="text-[var(--color-text-secondary)] text-sm">{tech.currentJob}</div>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                tech.status === 'on_job' ? 'bg-green-500/20 text-green-400' :
                tech.status === 'en_route' ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]' :
                tech.status === 'idle' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-[var(--color-bg-surface)]/50 text-[var(--color-text-subtle)]'
              }`}>
                {tech.status.replace('_', ' ')}
              </div>
            </div>
            {tech.lastLocation && (
              <div className="flex items-center gap-1 text-[var(--color-text-subtle)] text-xs mt-2">
                <MapPin className="w-3 h-3" />
                <span>
                  Updated {new Date(tech.lastLocation.updatedAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </Card>
        ))}

        {techs.length === 0 && (
          <Card className="text-center py-8">
            <div className="text-[var(--color-text-subtle)]">
              No team members found
            </div>
          </Card>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/owner/reports">
          <BigButton
            icon={TrendingUp}
            label="REPORTS"
            sublabel="Analytics & trends"
          />
        </Link>
        <Link href="/owner/schedule">
          <BigButton
            icon={Clock}
            label="SCHEDULE"
            sublabel="View all jobs"
          />
        </Link>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color
}: {
  icon: React.ElementType
  label: string
  value: string
  sublabel?: string
  color: 'green' | 'accent' | 'yellow' | 'purple'
}) {
  const colors = {
    green: 'text-green-400',
    accent: 'text-[var(--color-accent-primary)]',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
  }

  return (
    <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
      <Icon className={`w-6 h-6 ${colors[color]} mb-2`} />
      <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
      <div className="text-[var(--color-text-secondary)] text-sm">{label}</div>
      {sublabel && <div className="text-[var(--color-text-subtle)] text-xs">{sublabel}</div>}
    </Card>
  )
}

