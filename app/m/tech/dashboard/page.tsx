'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock, Wrench, ChevronRight, Menu } from 'lucide-react'
import { BigButton } from '@/components/mobile/big-button'
import { VoiceButton } from '@/components/mobile/voice-button'
import { MobileSidebar, MobileMenuButton } from '@/components/mobile/mobile-sidebar'
import { Card } from '@/components/ui/card'
import { TechBottomNav } from '@/components/mobile/bottom-nav'
import Link from 'next/link'

interface Job {
  id: string
  description: string
  status: string
  scheduledStart: string
  contact: {
    firstName: string
    lastName: string
    address: string
    phone: string
  }
}

export default function TechDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [currentJob, setCurrentJob] = useState<Job | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchMyJobs()
  }, [])

  const fetchMyJobs = async () => {
    try {
      const res = await fetch('/api/tech/jobs')
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
        // Find current in-progress job
        const inProgress = data.jobs?.find((j: Job) =>
          j.status === 'in_progress' || j.status === 'en_route'
        )
        setCurrentJob(inProgress || data.jobs?.[0] || null)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
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
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="tech" />

      {/* Header */}
      <header className="mobile-header mb-4 flex items-center justify-between">
        <div>
          <h1 className="mobile-title">My Jobs</h1>
          <p className="text-[var(--color-text-secondary)]">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
        <MobileMenuButton onClick={() => setSidebarOpen(true)} />
      </header>

      {/* Current Job Card */}
      {currentJob && (
        <div className="mobile-card mb-4 border border-[var(--color-accent-primary)]/50 mobile-card-hover">
          <div className="text-[var(--color-accent-primary)] text-sm font-bold mb-2">
            {currentJob.status === 'in_progress' ? '🔧 IN PROGRESS' : '📍 NEXT UP'}
          </div>
          <div className="text-xl font-bold mb-1">
            {currentJob.contact.firstName} {currentJob.contact.lastName}
          </div>
          <div className="text-[var(--color-text-secondary)] mb-3">{currentJob.description}</div>

          <div className="flex items-center gap-2 text-[var(--color-text-subtle)] text-sm mb-2">
            <MapPin className="w-4 h-4" />
            <span>{currentJob.contact.address}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-text-subtle)] text-sm mb-4">
            <Clock className="w-4 h-4" />
            <span>{formatTime(currentJob.scheduledStart)}</span>
          </div>

          <Link href={`/m/tech/job/${currentJob.id}`}>
            <BigButton
              icon={Wrench}
              label={currentJob.status === 'in_progress' ? 'CONTINUE JOB' : 'START JOB'}
              variant="success"
            />
          </Link>
        </div>
      )}

      {/* Job List */}
      <h2 className="mobile-subtitle mb-3">Today's Schedule</h2>
      <div className="space-y-3">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/m/tech/job/${job.id}`}
            className="block"
          >
            <div className="mobile-card mobile-card-hover">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-bold">
                    {job.contact.firstName} {job.contact.lastName}
                  </div>
                  <div className="text-[var(--color-text-secondary)] text-sm">{job.description}</div>
                  <div className="flex items-center gap-4 mt-2 text-[var(--color-text-subtle)] text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(job.scheduledStart)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      job.status === 'in_progress' ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]' :
                      'bg-[var(--color-bg-surface)] text-[var(--color-text-subtle)]'
                    }`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--color-text-subtle)]" />
              </div>
            </div>
          </Link>
        ))}

        {jobs.length === 0 && (
          <div className="mobile-card text-center">
            <div className="text-[var(--color-text-subtle)]">
              No jobs scheduled for today
            </div>
          </div>
        )}
      </div>

      {/* Voice Command Button */}
      <VoiceButton />

      {/* Bottom Navigation */}
      <TechBottomNav />
    </div>
  )
}