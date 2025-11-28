'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock, Wrench, ChevronRight } from 'lucide-react'
import { BigButton } from '@/components/mobile/big-button'
import { VoiceButton } from '@/components/mobile/voice-button'
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
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white p-4 pb-24">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold">My Jobs</h1>
        <p className="text-gray-400">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })}
        </p>
      </header>

      {/* Current Job Card */}
      {currentJob && (
        <div className="bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)] rounded-2xl p-4 mb-6">
          <div className="text-[var(--color-accent-primary)] text-sm font-bold mb-2">
            {currentJob.status === 'in_progress' ? '🔧 IN PROGRESS' : '📍 NEXT UP'}
          </div>
          <div className="text-xl font-bold mb-1">
            {currentJob.contact.firstName} {currentJob.contact.lastName}
          </div>
          <div className="text-gray-300 mb-3">{currentJob.description}</div>
          
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <MapPin className="w-4 h-4" />
            <span>{currentJob.contact.address}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
            <Clock className="w-4 h-4" />
            <span>{formatTime(currentJob.scheduledStart)}</span>
          </div>

          <Link href={`/tech/job/${currentJob.id}`}>
            <BigButton
              icon={Wrench}
              label={currentJob.status === 'in_progress' ? 'CONTINUE JOB' : 'START JOB'}
              variant="success"
            />
          </Link>
        </div>
      )}

      {/* Job List */}
      <h2 className="text-lg font-bold mb-3">Today's Schedule</h2>
      <div className="space-y-3">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/tech/job/${job.id}`}
            className="block bg-[var(--color-bg-secondary)] rounded-xl p-4 active:bg-gray-700 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-bold">
                  {job.contact.firstName} {job.contact.lastName}
                </div>
                <div className="text-gray-400 text-sm">{job.description}</div>
                <div className="flex items-center gap-4 mt-2 text-gray-500 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(job.scheduledStart)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    job.status === 'completed' ? 'bg-green-900 text-green-400' :
                    job.status === 'in_progress' ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </div>
          </Link>
        ))}

        {jobs.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No jobs scheduled for today
          </div>
        )}
      </div>

      {/* Voice Command Button */}
      <VoiceButton />
    </div>
  )
}

