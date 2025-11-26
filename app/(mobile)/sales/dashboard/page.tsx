'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Mic, User, Clock, Plus } from 'lucide-react'
import { BigButton, BigButtonGrid } from '@/components/mobile/big-button'
import Link from 'next/link'

interface Meeting {
  id: string
  title: string
  contactId: string
  contactName: string
  location: string
  scheduledAt: string
  meetingType: string
}

export default function SalesDashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [nextMeeting, setNextMeeting] = useState<Meeting | null>(null)

  useEffect(() => {
    fetchTodaysMeetings()
  }, [])

  const fetchTodaysMeetings = async () => {
    try {
      const res = await fetch('/api/meetings?today=true')
      if (res.ok) {
        const data = await res.json()
        setMeetings(data.meetings || [])
        
        // Find next upcoming meeting
        const now = new Date()
        const upcoming = data.meetings?.find((m: Meeting) => 
          new Date(m.scheduledAt) > now
        )
        setNextMeeting(upcoming || data.meetings?.[0] || null)
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning!'
    if (hour < 17) return 'Good Afternoon!'
    return 'Good Evening!'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{getGreeting()}</h1>
        <p className="text-gray-400">
          {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} today
        </p>
      </header>

      {/* Next Meeting Card */}
      {nextMeeting && (
        <div className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 border border-blue-500/50 rounded-2xl p-5 mb-6">
          <div className="text-blue-300 text-sm font-bold mb-2">NEXT UP</div>
          <div className="text-2xl font-bold mb-1">{nextMeeting.contactName}</div>
          {nextMeeting.title && (
            <div className="text-gray-300 mb-3">{nextMeeting.title}</div>
          )}
          
          <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
            <Clock className="w-4 h-4" />
            <span>{formatTime(nextMeeting.scheduledAt)}</span>
          </div>
          {nextMeeting.location && (
            <div className="flex items-center gap-2 text-gray-300 text-sm mb-4">
              <MapPin className="w-4 h-4" />
              <span>{nextMeeting.location}</span>
            </div>
          )}

          <BigButtonGrid>
            <Link href={`/sales/briefing/${nextMeeting.contactId}`}>
              <BigButton
                icon={User}
                label="BRIEFING"
                variant="primary"
              />
            </Link>
            <Link href={`/sales/meeting/${nextMeeting.id}`}>
              <BigButton
                icon={Mic}
                label="START"
                variant="success"
              />
            </Link>
          </BigButtonGrid>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-6">
        <BigButtonGrid>
          <Link href="/sales/meeting/new">
            <BigButton
              icon={Plus}
              label="NEW MEETING"
              sublabel="Start recording"
            />
          </Link>
          <Link href="/sales/voice-note">
            <BigButton
              icon={Mic}
              label="VOICE NOTE"
              sublabel="Quick memo"
              variant="warning"
            />
          </Link>
        </BigButtonGrid>
      </div>

      {/* Today's Schedule */}
      <h2 className="text-xl font-bold mb-4">Today's Schedule</h2>
      <div className="space-y-3">
        {meetings.map((meeting) => (
          <Link 
            key={meeting.id}
            href={`/sales/meeting/${meeting.id}`}
            className="block bg-gray-800 rounded-xl p-4 active:bg-gray-700 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold">{meeting.contactName}</div>
                {meeting.title && (
                  <div className="text-gray-400 text-sm">{meeting.title}</div>
                )}
                <div className="flex items-center gap-4 mt-2 text-gray-500 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(meeting.scheduledAt)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
                    {meeting.meetingType}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {meetings.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No meetings scheduled for today</p>
            <p className="text-sm mt-2">Tap "New Meeting" to start recording</p>
          </div>
        )}
      </div>
    </div>
  )
}

