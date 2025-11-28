'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, Clock } from 'lucide-react'

interface Job {
  id: string
  description: string
  contact: {
    firstName: string
    lastName: string
    address: string
    lat?: number
    lng?: number
  }
  scheduledStart: string
  status: string
}

export default function TechMapPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

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

  const openInMaps = (address: string) => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-accent-primary)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Job Locations</h1>
        <p className="text-gray-400">{jobs.length} jobs today</p>
      </header>

      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="bg-[var(--color-bg-secondary)] rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold">
                  {job.contact.firstName} {job.contact.lastName}
                </div>
                <div className="text-gray-400 text-sm">{job.description}</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                job.status === 'completed' ? 'bg-green-900 text-green-400' :
                job.status === 'in_progress' ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]' :
                'bg-gray-700 text-gray-400'
              }`}>
                {job.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-start gap-2 text-gray-300 text-sm mb-3">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{job.contact.address}</span>
            </div>

            <button
              onClick={() => openInMaps(job.contact.address)}
              className="w-full bg-[var(--color-accent-primary)] text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium active:scale-95 transition-transform"
            >
              <Navigation className="w-4 h-4" />
              Navigate
            </button>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No jobs for today</p>
          </div>
        )}
      </div>
    </div>
  )
}
