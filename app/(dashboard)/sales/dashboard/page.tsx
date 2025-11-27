'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, User, Clock, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

/**
 * Sales Dashboard Page (Desktop View)
 *
 * Provides sales representatives with a desktop-optimized view of their
 * meetings, leads, and quick actions. Mobile users are automatically
 * redirected to the mobile-optimized version.
 */
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Sales Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Your meetings and leads for today</p>
        </div>
        <Button asChild className="bg-[#4B79FF] hover:bg-[#3366FF] text-white">
          <Link href="/contacts/new">
            <Plus className="w-4 h-4 mr-2" />
            New Lead
          </Link>
        </Button>
      </div>

      {/* Next Meeting Card */}
      {nextMeeting && (
        <Card className="border-l-4 border-l-[#4B79FF] shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#4B79FF]" />
              Next Meeting
            </CardTitle>
            <CardDescription>Coming up soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold text-lg">{nextMeeting.title}</p>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <User className="w-4 h-4" />
                <span>{nextMeeting.contactName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Calendar className="w-4 h-4" />
                <span>{formatTime(nextMeeting.scheduledAt)}</span>
              </div>
              {nextMeeting.location && (
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <MapPin className="w-4 h-4" />
                  <span>{nextMeeting.location}</span>
                </div>
              )}
              <div className="pt-4">
                <Button asChild className="w-full bg-[#4B79FF] hover:bg-[#3366FF]">
                  <Link href={`/meetings/${nextMeeting.id}`}>
                    View Meeting Details
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Schedule */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>All meetings for today</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-neutral-500">Loading meetings...</div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No meetings scheduled for today
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  href={`/meetings/${meeting.id}`}
                  className="block p-4 border rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{meeting.title}</p>
                      <div className="flex items-center gap-3 text-sm text-neutral-600">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {meeting.contactName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatTime(meeting.scheduledAt)}
                        </span>
                      </div>
                      {meeting.location && (
                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {meeting.location}
                        </p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {meeting.meetingType}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/contacts">
            <CardContent className="pt-6">
              <User className="w-8 h-8 text-[#4B79FF] mb-3" />
              <h3 className="font-semibold mb-1">Contacts</h3>
              <p className="text-sm text-neutral-600">View and manage your contacts</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/calendar">
            <CardContent className="pt-6">
              <Calendar className="w-8 h-8 text-[#4B79FF] mb-3" />
              <h3 className="font-semibold mb-1">Calendar</h3>
              <p className="text-sm text-neutral-600">View your schedule</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/analytics">
            <CardContent className="pt-6">
              <MapPin className="w-8 h-8 text-[#4B79FF] mb-3" />
              <h3 className="font-semibold mb-1">Analytics</h3>
              <p className="text-sm text-neutral-600">Track your performance</p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}
