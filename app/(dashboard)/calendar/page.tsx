'use client'

import { CalendarView } from '@/components/calendar/calendar-view'
import { CalendarIntegration } from '@/components/conversations/calendar-integration'
import { useState } from 'react'

export default function CalendarPage() {
  const [createEventOpen, setCreateEventOpen] = useState(false)

  function handleEventClick(event: any) {
    // Navigate to event details or open modal
    console.log('Event clicked:', event)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Calendar</h1>
        <CalendarIntegration
          defaultTitle=""
          defaultStartTime=""
          defaultEndTime=""
        />
      </div>

      <CalendarView
        onEventClick={handleEventClick}
        onCreateEvent={() => setCreateEventOpen(true)}
      />

      {createEventOpen && (
        <CalendarIntegration
          defaultTitle=""
          defaultStartTime=""
          defaultEndTime=""
        />
      )}
    </div>
  )
}

