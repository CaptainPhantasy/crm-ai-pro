'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User, DollarSign, Phone, Mail, MapPin, Clock, Star, AlertCircle } from 'lucide-react'
import { BigButton } from '@/components/mobile/big-button'

interface Briefing {
  contact: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
  }
  profile: {
    familyNotes?: string
    preferences?: string
    interests?: string[]
  }
  recentJobs: Array<{
    id: string
    description: string
    status: string
    totalAmount: number
    completedAt?: string
  }>
  totalSpent: number
  meetingHistory: Array<{
    id: string
    date: string
    summary: string
    sentiment: string
  }>
  openIssues: string[]
  suggestedTopics: string[]
}

export default function SalesBriefingPage() {
  const params = useParams()
  const router = useRouter()
  const contactId = params.contactId as string

  const [briefing, setBriefing] = useState<Briefing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBriefing()
  }, [contactId])

  const fetchBriefing = async () => {
    try {
      const res = await fetch(`/api/sales/briefing/${contactId}`)
      if (res.ok) {
        const data = await res.json()
        setBriefing(data.briefing)
      }
    } catch (error) {
      console.error('Failed to fetch briefing:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Preparing your briefing...</p>
        </div>
      </div>
    )
  }

  if (!briefing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <p>Could not load briefing</p>
          <button onClick={() => router.back()} className="mt-4 text-blue-400">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      {/* Header */}
      <header className="bg-gradient-to-b from-blue-900 to-gray-900 p-4 pb-8">
        <button onClick={() => router.back()} className="p-2 -ml-2 mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
            {briefing.contact.firstName[0]}{briefing.contact.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {briefing.contact.firstName} {briefing.contact.lastName}
            </h1>
            <div className="flex items-center gap-2 text-blue-300">
              <DollarSign className="w-4 h-4" />
              <span>${briefing.totalSpent.toLocaleString()} lifetime</span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Quick Contact */}
        <div className="grid grid-cols-2 gap-3">
          <a href={`tel:${briefing.contact.phone}`}>
            <BigButton icon={Phone} label="CALL" variant="success" />
          </a>
          <a href={`mailto:${briefing.contact.email}`}>
            <BigButton icon={Mail} label="EMAIL" variant="primary" />
          </a>
        </div>

        {/* Open Issues Alert */}
        {briefing.openIssues.length > 0 && (
          <div className="bg-red-900/50 border border-red-500 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
              <AlertCircle className="w-5 h-5" />
              Open Issues
            </div>
            <ul className="space-y-1 text-gray-300">
              {briefing.openIssues.map((issue, i) => (
                <li key={i}>• {issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Personal Notes */}
        {(briefing.profile.familyNotes || briefing.profile.preferences) && (
          <div className="bg-gray-800 rounded-xl p-4">
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Personal Notes
            </h2>
            {briefing.profile.familyNotes && (
              <p className="text-gray-300 mb-2">
                <span className="text-gray-500">Family: </span>
                {briefing.profile.familyNotes}
              </p>
            )}
            {briefing.profile.preferences && (
              <p className="text-gray-300">
                <span className="text-gray-500">Preferences: </span>
                {briefing.profile.preferences}
              </p>
            )}
          </div>
        )}

        {/* Suggested Topics */}
        {briefing.suggestedTopics.length > 0 && (
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-4 border border-purple-500/30">
            <h2 className="font-bold text-lg mb-3">💡 Suggested Topics</h2>
            <ul className="space-y-2">
              {briefing.suggestedTopics.map((topic, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-200">
                  <span className="text-purple-400">→</span>
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent Jobs */}
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="font-bold text-lg mb-3">Recent Work</h2>
          {briefing.recentJobs.length > 0 ? (
            <div className="space-y-3">
              {briefing.recentJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="flex justify-between items-center">
                  <div>
                    <div className="text-gray-200">{job.description}</div>
                    <div className="text-gray-500 text-sm">
                      {job.completedAt && new Date(job.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-green-400 font-bold">
                    ${job.totalAmount?.toLocaleString() || '0'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No previous jobs</p>
          )}
        </div>

        {/* Meeting History */}
        {briefing.meetingHistory.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-4">
            <h2 className="font-bold text-lg mb-3">Previous Meetings</h2>
            <div className="space-y-3">
              {briefing.meetingHistory.slice(0, 3).map((meeting) => (
                <div key={meeting.id} className="border-l-2 border-blue-500 pl-3">
                  <div className="text-gray-500 text-sm">{meeting.date}</div>
                  <div className="text-gray-200">{meeting.summary}</div>
                  <div className={`text-sm ${
                    meeting.sentiment === 'positive' ? 'text-green-400' :
                    meeting.sentiment === 'negative' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {meeting.sentiment}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Details */}
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="font-bold text-lg mb-3">Contact Info</h2>
          <div className="space-y-2 text-gray-300">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              {briefing.contact.phone}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              {briefing.contact.email}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              {briefing.contact.address}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

