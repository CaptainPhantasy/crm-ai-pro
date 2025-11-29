'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Phone, MessageSquare, Users, Clock } from 'lucide-react'
import { BigButton, BigButtonGrid } from '@/components/mobile/big-button'
import { Card } from '@/components/ui/card'

interface Escalation {
  id: string
  jobId: string
  customerName: string
  customerPhone: string
  techName: string
  jobDescription: string
  rating: number
  createdAt: string
  notes?: string
}

interface Stats {
  jobsToday: number
  jobsCompleted: number
  escalationsToday: number
  avgRating: number
}

export default function OfficeDashboard() {
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [stats, setStats] = useState<Stats>({
    jobsToday: 0,
    jobsCompleted: 0,
    escalationsToday: 0,
    avgRating: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    // Poll for new escalations every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [clearancesRes, statsRes] = await Promise.all([
        fetch('/api/office/clearances'),
        fetch('/api/office/stats'),
      ])
      
      if (clearancesRes.ok) {
        const data = await clearancesRes.json()
        setEscalations(data.pending || [])
      }
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearance = async (escalationId: string, notes: string) => {
    try {
      const res = await fetch(`/api/office/clearances/${escalationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, resolved: true }),
      })
      
      if (res.ok) {
        setEscalations(prev => prev.filter(e => e.id !== escalationId))
      }
    } catch (error) {
      console.error('Failed to clear:', error)
      alert('Failed to mark as resolved')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-accent-primary)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] p-4 pb-24">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Office Dashboard</h1>
        <p className="text-[var(--color-text-secondary)]">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          })}
        </p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-6">
          <div className="text-[var(--color-text-secondary)] text-sm">Jobs Today</div>
          <div className="text-2xl font-bold">
            {stats.jobsCompleted}/{stats.jobsToday}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-[var(--color-text-secondary)] text-sm">Avg Rating</div>
          <div className="text-2xl font-bold text-yellow-400">
            {stats.avgRating.toFixed(1)} ⭐
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {escalations.length > 0 && (
        <Card className="p-6 mb-6 border border-red-500/50 bg-[var(--color-bg-surface)]">
          <div className="flex items-center gap-2 text-red-400 font-bold">
            <AlertTriangle className="w-5 h-5" />
            {escalations.length} Escalation{escalations.length !== 1 ? 's' : ''} Need Attention
          </div>
        </Card>
      )}

      {/* Escalation Queue */}
      <h2 className="text-xl font-bold mb-4">Needs Your Attention</h2>
      <div className="space-y-4 mb-8">
        {escalations.map((item) => (
          <EscalationCard
            key={item.id}
            item={item}
            onClear={(notes) => handleClearance(item.id, notes)}
          />
        ))}
        
        {escalations.length === 0 && (
          <Card className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <p className="text-[var(--color-text-secondary)]">All clear! No escalations pending.</p>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <BigButtonGrid>
        <BigButton
          icon={Phone}
          label="CALL LOG"
          sublabel="View recent calls"
        />
        <BigButton
          icon={MessageSquare}
          label="SEND SMS"
          sublabel="Quick message"
        />
        <BigButton
          icon={Users}
          label="TECH STATUS"
          sublabel="Where is everyone"
        />
        <BigButton
          icon={Clock}
          label="SCHEDULE"
          sublabel="Today's jobs"
        />
      </BigButtonGrid>
    </div>
  )
}

function EscalationCard({ 
  item, 
  onClear 
}: { 
  item: Escalation
  onClear: (notes: string) => void 
}) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleResolve = async () => {
    if (!notes.trim()) {
      alert('Please add resolution notes')
      return
    }
    setProcessing(true)
    await onClear(notes)
    setProcessing(false)
  }

  return (
    <Card className="overflow-hidden hover:shadow-card-hover transition-all duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="font-bold text-lg">{item.customerName}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-red-400 font-bold">
                Rating: {item.rating}/5
              </span>
              <span className="text-[var(--color-text-subtle)]">•</span>
              <span className="text-[var(--color-text-secondary)] text-sm">
                {new Date(item.createdAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="text-[var(--color-text-secondary)] text-sm mt-1">
              {item.techName} • {item.jobDescription}
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 bg-[var(--color-accent-primary)] rounded-lg font-bold text-sm"
          >
            {expanded ? 'Close' : 'Handle'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--color-border)] p-6 space-y-4">
          {/* Call Button */}
          <a
            href={`tel:${item.customerPhone}`}
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-xl font-bold text-lg"
          >
            <Phone className="w-5 h-5" />
            Call {item.customerName}
          </a>

          {/* Notes */}
          <div>
            <label className="block text-[var(--color-text-secondary)] text-sm mb-2">
              Resolution Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was discussed? How was it resolved?"
              className="w-full bg-[var(--input-bg)] rounded-xl p-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-subtle)] resize-none border border-[var(--color-border)]"
              rows={3}
            />
          </div>

          {/* Resolve Button */}
          <BigButton
            onClick={handleResolve}
            icon={CheckCircle}
            label={processing ? 'SAVING...' : 'MARK RESOLVED'}
            variant="success"
            disabled={processing || !notes.trim()}
          />
        </div>
      )}
    </Card>
  )
}

