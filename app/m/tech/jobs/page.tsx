'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock, Wrench, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TechBottomNav } from '@/components/mobile/bottom-nav'
import { MobileSidebar, MobileMenuButton } from '@/components/mobile/mobile-sidebar'
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

export default function TechJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/tech/jobs')
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
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
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Jobs</h1>
          <p className="text-[var(--color-text-secondary)]">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        <MobileMenuButton onClick={() => setSidebarOpen(true)} />
      </header>

      {/* Job List */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/m/tech/job/${job.id}`}
            className="block"
          >
            <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-bold text-lg">
                    {job.contact.firstName} {job.contact.lastName}
                  </div>
                  <div className="text-[var(--color-text-secondary)] text-sm mt-1">{job.description}</div>
                  
                  <div className="flex items-center gap-2 text-[var(--color-text-subtle)] text-sm mt-3">
                    <MapPin className="w-4 h-4" />
                    <span>{job.contact.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 text-[var(--color-text-subtle)] text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(job.scheduledStart)}</span>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      job.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      job.status === 'in_progress' ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] border-[var(--color-accent-primary)]/30' :
                      job.status === 'en_route' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-[var(--color-bg-surface)]/50 text-[var(--color-text-subtle)] border-[var(--color-border)]'
                    }`}>
                      {job.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--color-text-subtle)]" />
              </div>
            </Card>
          </Link>
        ))}

        {jobs.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-[var(--color-text-subtle)]">
              No jobs scheduled
            </div>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <TechBottomNav />
    </div>
  )
}