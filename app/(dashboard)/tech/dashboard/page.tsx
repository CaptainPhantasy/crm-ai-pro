'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, CheckCircle, Navigation, Camera, Phone } from 'lucide-react'
import { Job } from '@/types'
import { ErrorBoundary } from '@/components/error-boundary'

// Import Tabs components
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function TechDashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState({
    today: 0,
    completed: 0,
    inProgress: 0,
    revenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('today')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchJobs()
  }, [activeTab])

  async function fetchJobs() {
    try {
      setLoading(true)
      const date = activeTab === 'today' ? new Date().toISOString().split('T')[0] : null
      const status = activeTab === 'completed' ? 'completed' : activeTab === 'upcoming' ? 'scheduled' : null
      
      let url = '/api/tech/jobs'
      const params = new URLSearchParams()
      if (date) params.append('date', date)
      if (status) params.append('status', status)
      if (params.toString()) url += '?' + params.toString()

      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
        if (data.stats) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus(jobId: string, newStatus: 'en_route' | 'in_progress' | 'completed') {
    try {
      const response = await fetch(`/api/tech/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(`Job status updated to ${newStatus}!${data.emailSent ? ' Customer has been notified.' : ''}`)
        fetchJobs() // Refresh
      } else {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }))
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update job status')
    }
  }

  async function handleNavigate(address: string) {
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(address)}`
    window.open(mapsUrl, '_blank')
  }

  async function handleCallDispatch() {
    alert('Call Dispatch - This would initiate a call to dispatch.')
  }

  async function handleUploadPhoto(jobId?: string) {
    if (jobId) {
      // Upload photo for specific job
      setSelectedJobId(jobId)
      fileInputRef.current?.click()
    } else {
      // Upload photo button in header - need to select job first
      const jobId = prompt('Enter Job ID to upload photo for:')
      if (jobId) {
        setSelectedJobId(jobId)
        fileInputRef.current?.click()
      }
    }
  }

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !selectedJobId) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    try {
      setUploadingPhoto(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/jobs/${selectedJobId}/upload-photo`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Photo uploaded successfully! URL: ${data.url}`)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setSelectedJobId(null)
      } else {
        const data = await response.json().catch(() => ({ error: 'Failed to upload photo' }))
        alert(`Error: ${data.error || 'Failed to upload photo'}`)
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge style={{ backgroundColor: '#F0F4FF', color: '#3366FF', borderColor: 'rgba(51, 102, 255, 0.2)', borderWidth: '1px' }}>Scheduled</Badge>
      case 'en_route':
        return <Badge style={{ backgroundColor: '#FFF4E8', color: '#FF8D29', borderColor: 'rgba(255, 141, 41, 0.2)', borderWidth: '1px' }}>En Route</Badge>
      case 'in_progress':
        return <Badge style={{ backgroundColor: '#FFFEEC', color: '#FFD92E', borderColor: 'rgba(255, 217, 46, 0.2)', borderWidth: '1px' }}>In Progress</Badge>
      case 'completed':
        return <Badge style={{ backgroundColor: '#EAFCF1', color: '#37C856', borderColor: 'rgba(55, 200, 86, 0.2)', borderWidth: '1px' }}>Completed</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <ErrorBoundary context="tech-dashboard">
    <div className="p-6 space-y-6 bg-theme-primary">
      {/* Vibrant Header */}
      <div 
        className="flex items-center justify-between p-6 rounded-xl border-2 bg-theme-surface border-theme"
      >
        <div>
          <h1 className="text-2xl font-semibold text-theme-primary">
            Tech Dashboard
          </h1>
          <p className="text-sm text-theme-secondary mt-1 font-medium">Field technician work management</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="font-medium shadow-sm hover:bg-[#E6F7F9]"
            style={{ 
              borderColor: '#22B9CA', 
              color: '#22B9CA',
              borderWidth: '2px'
            }}
            onClick={handleCallDispatch}
          >
            <Phone className="w-4 h-4 mr-2" />
            Call Dispatch
          </Button>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button 
              className="text-white shadow-md font-medium hover:opacity-90 disabled:opacity-50"
              style={{ 
                background: 'linear-gradient(to right, #4B79FF, #3366FF)'
              }}
              onClick={() => handleUploadPhoto()}
              disabled={uploadingPhoto}
            >
              <Camera className="w-4 h-4 mr-2" />
              {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats - Enhanced with icons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="shadow-md hover:shadow-lg transition-shadow"
          style={{ borderLeftWidth: '4px', borderLeftColor: '#3366FF' }}
        >
          <div style={{ background: 'linear-gradient(to bottom right, #EBF0FF, white, rgba(235, 240, 255, 0.5))' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-neutral-600">Today's Jobs</CardTitle>
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#3366FF' }}
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-theme-accent-primary">{stats.today}</div>
              <p className="text-xs font-medium mt-1 text-theme-secondary">3 remaining</p>
            </CardContent>
          </div>
        </Card>
        <Card 
          className="shadow-md hover:shadow-lg transition-shadow bg-theme-surface border-theme"
          style={{ borderLeftWidth: '4px', borderLeftColor: 'var(--color-accent-primary)' }}
        >
          <div className="bg-theme-surface">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-theme-secondary">Completed</CardTitle>
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#56D470' }}
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-theme-accent-primary">{stats.completed}</div>
              <p className="text-xs font-medium mt-1 text-theme-secondary">This week: 12</p>
            </CardContent>
          </div>
        </Card>
        <Card 
          className="shadow-md hover:shadow-lg transition-shadow bg-theme-surface border-theme"
          style={{ borderLeftWidth: '4px', borderLeftColor: 'var(--color-accent-primary)' }}
        >
          <div className="bg-theme-surface">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-theme-secondary">In Progress</CardTitle>
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#FFA24D' }}
                >
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-theme-accent-primary">{stats.inProgress}</div>
              <p className="text-xs font-medium mt-1 text-theme-secondary">Active now</p>
            </CardContent>
          </div>
        </Card>
        <Card 
          className="shadow-md hover:shadow-lg transition-shadow bg-theme-surface border-theme"
          style={{ borderLeftWidth: '4px', borderLeftColor: 'var(--color-accent-primary)' }}
        >
          <div className="bg-theme-surface">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-theme-secondary">Revenue</CardTitle>
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#EE46BC' }}
                >
                  <span className="text-white font-bold text-sm">$</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-theme-accent-primary">${(stats.revenue / 100).toFixed(2)}</div>
              <p className="text-xs font-medium mt-1 text-theme-secondary">Today</p>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-theme-surface p-1 border border-theme">
          <TabsTrigger 
            value="today" 
            className="font-medium data-[state=active]:shadow-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#EBF0FF] data-[state=active]:to-white data-[state=active]:text-[#3366FF]"
          >
            Today
          </TabsTrigger>
          <TabsTrigger 
            value="upcoming" 
            className="font-medium data-[state=active]:shadow-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFF4E8] data-[state=active]:to-white data-[state=active]:text-[#FF8D29]"
          >
            Upcoming
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="font-medium data-[state=active]:shadow-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#EAFCF1] data-[state=active]:to-white data-[state=active]:text-[#37C856]"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card className="border-2 border-theme shadow-md bg-theme-surface">
            <CardHeader 
              className="border-b border-theme bg-theme-surface"
            >
              <CardTitle className="text-theme-primary">Today's Schedule</CardTitle>
              <CardDescription className="text-theme-secondary">Your jobs for today</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8 text-theme-secondary">Loading jobs...</div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8 text-theme-secondary">No jobs scheduled for today</div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job, index) => {
                    const gradients = [
                      'linear-gradient(to right, #EBF0FF, white)',
                      'linear-gradient(to right, #EAFCF1, white)',
                      'linear-gradient(to right, #FFF4E8, white)',
                    ]
                    const address = job.contact?.address || 'Address not provided'
                    const scheduledTime = job.scheduled_start 
                      ? new Date(job.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Time TBD'
                    
                    return (
                      <Card 
                        key={job.id} 
                        className="border-2 shadow-sm hover:shadow-md hover:border-[#3366FF] transition-all"
                        style={{ 
                          borderColor: '#E4E7EC',
                          background: gradients[index % 3]
                        }}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-sm"
                                  style={{ 
                                    background: 'linear-gradient(to bottom right, #EBF0FF, #C8D7FF)',
                                    borderColor: '#AECBFF'
                                  }}
                                >
                                  <CheckCircle className="w-6 h-6" style={{ color: '#3366FF' }} />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg text-theme-primary">
                                    {job.contact?.first_name} {job.contact?.last_name}
                                  </h3>
                                  <p className="text-sm text-theme-secondary font-medium">{job.description || 'Service call'}</p>
                                </div>
                                {getStatusBadge(job.status || 'scheduled')}
                              </div>
                              <div className="flex items-center gap-6 text-sm">
                                <span 
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium"
                                  style={{ backgroundColor: '#FFF5F5', color: '#FF7070' }}
                                >
                                  <MapPin className="w-4 h-4" />
                                  {address}
                                </span>
                                <span 
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium"
                                  style={{ backgroundColor: '#E6F7F9', color: '#22B9CA' }}
                                >
                                  <Clock className="w-4 h-4" />
                                  {scheduledTime}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button 
                                size="sm" 
                                className="text-white shadow-md font-medium hover:opacity-90"
                                style={{ 
                                  background: 'linear-gradient(to right, #3366FF, #4B79FF)'
                                }}
                                onClick={() => handleNavigate(address)}
                              >
                                <Navigation className="w-4 h-4 mr-2" />
                                Navigate
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                className="font-medium shadow-sm hover:bg-[#FDF2F9]"
                                style={{ 
                                  borderColor: '#EE46BC',
                                  borderWidth: '2px',
                                  color: '#EE46BC'
                                }}
                                onClick={() => handleUploadPhoto(job.id)}
                                disabled={uploadingPhoto}
                              >
                                <Camera className="w-4 h-4 mr-2" />
                                {uploadingPhoto && selectedJobId === job.id ? 'Uploading...' : 'Photo'}
                              </Button>
                              {job.status === 'scheduled' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="font-medium shadow-sm hover:bg-[#EAFCF1]"
                                  style={{ 
                                    borderColor: '#56D470',
                                    borderWidth: '2px',
                                    color: '#37C856'
                                  }}
                                  onClick={() => handleUpdateStatus(job.id, 'en_route')}
                                >
                                  Start Job
                                </Button>
                              )}
                              {job.status === 'en_route' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="font-medium shadow-sm hover:bg-[#FFFEEC]"
                                  style={{ 
                                    borderColor: '#FFD92E',
                                    borderWidth: '2px',
                                    color: '#FFD92E'
                                  }}
                                  onClick={() => handleUpdateStatus(job.id, 'in_progress')}
                                >
                                  In Progress
                                </Button>
                              )}
                              {job.status === 'in_progress' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="font-medium shadow-sm hover:bg-[#EAFCF1]"
                                  style={{ 
                                    borderColor: '#56D470',
                                    borderWidth: '2px',
                                    color: '#37C856'
                                  }}
                                  onClick={() => handleUpdateStatus(job.id, 'completed')}
                                >
                                  Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card className="border-2 border-theme shadow-md bg-theme-surface">
            <CardHeader 
              className="border-b border-theme bg-theme-surface"
            >
              <CardTitle className="text-theme-primary">Upcoming Jobs</CardTitle>
              <CardDescription className="text-theme-secondary">Your scheduled work for the week</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-theme-secondary">Loading...</div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-theme-surface">
                    <Clock className="w-8 h-8 text-theme-accent-primary" />
                  </div>
                  <p className="text-theme-secondary font-medium">No upcoming jobs scheduled</p>
                  <p className="text-sm text-theme-subtle mt-1">Check back later for new assignments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card className="border-2 border-theme shadow-md bg-theme-surface">
            <CardHeader 
              className="border-b border-theme bg-theme-surface"
            >
              <CardTitle className="text-theme-primary">Completed Jobs</CardTitle>
              <CardDescription className="text-theme-secondary">Your finished work</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-theme-secondary">Loading...</div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-theme-surface">
                    <CheckCircle className="w-8 h-8 text-theme-accent-primary" />
                  </div>
                  <p className="text-theme-secondary font-medium">No completed jobs to display</p>
                  <p className="text-sm text-theme-subtle mt-1">Completed jobs will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="p-4 border border-theme rounded-lg bg-theme-surface">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-theme-primary">{job.contact?.first_name} {job.contact?.last_name}</h3>
                          <p className="text-sm text-theme-secondary">{job.description}</p>
                        </div>
                        {getStatusBadge(job.status || 'completed')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </ErrorBoundary>
  )
}
