'use client'

import { useEffect, useState, useCallback } from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import type { TechLocation, JobLocation } from '@/types/dispatch'
import { techStatusColors, jobStatusColors } from '@/types/dispatch'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MapPin, RefreshCw, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TechDetailPanel } from '@/components/dispatch/TechDetailPanel'
import JobDetailPanel from '@/components/dispatch/JobDetailPanel'
import TechListSidebar from '@/components/dispatch/TechListSidebar'
import { AssignTechDialog } from '@/components/dispatch/AssignTechDialog'
import { toast } from '@/lib/toast'

// Default map center (Indianapolis - adjust based on business location)
const DEFAULT_CENTER = {
  lat: 39.7684,
  lng: -86.1581
}

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: 'calc(100vh - 200px)',
  minHeight: '600px'
}

export default function DispatchMapPage() {
  // Tech state
  const [techs, setTechs] = useState<TechLocation[]>([])
  const [selectedTech, setSelectedTech] = useState<TechLocation | null>(null)
  const [hoveredTechId, setHoveredTechId] = useState<string | null>(null)

  // Job state
  const [jobs, setJobs] = useState<JobLocation[]>([])
  const [selectedJob, setSelectedJob] = useState<JobLocation | null>(null)
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null)

  // Dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assignDialogJob, setAssignDialogJob] = useState<JobLocation | null>(null)

  // Map state
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER)
  const [zoom, setZoom] = useState(12)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)

  // Fetch tech locations
  const fetchTechs = useCallback(async () => {
    try {
      const res = await fetch('/api/dispatch/techs')
      if (res.ok) {
        const data = await res.json()
        setTechs(data.techs)

        // Auto-center map on first tech with location
        if (data.techs.length > 0 && data.techs[0].lastLocation) {
          setMapCenter({
            lat: data.techs[0].lastLocation.lat,
            lng: data.techs[0].lastLocation.lng
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch tech locations:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch active jobs
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/dispatch/jobs/active')
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
        console.log('Fetched jobs:', data.jobs?.length || 0)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    }
  }, [])

  // Refresh all data
  const refreshAllData = useCallback(() => {
    fetchTechs()
    fetchJobs()
  }, [fetchTechs, fetchJobs])

  useEffect(() => {
    fetchTechs()
    fetchJobs()
  }, [fetchTechs, fetchJobs])

  // Real-time GPS updates (Phase 2) and Job updates (Phase 3)
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) return

    // Dynamic import to avoid SSR issues
    import('@supabase/supabase-js').then(({ createClient }) => {
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Subscribe to GPS log inserts
      const gpsChannel = supabase
        .channel('dispatch_gps_updates')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'gps_logs'
        }, (payload) => {
          const newGpsLog = payload.new as any

          // Update tech location in state
          setTechs(prevTechs => prevTechs.map(tech => {
            if (tech.id === newGpsLog.user_id) {
              return {
                ...tech,
                lastLocation: {
                  lat: parseFloat(newGpsLog.latitude),
                  lng: parseFloat(newGpsLog.longitude),
                  accuracy: newGpsLog.accuracy ? parseFloat(newGpsLog.accuracy) : 0,
                  updatedAt: newGpsLog.created_at
                }
              }
            }
            return tech
          }))

          console.log('📍 Real-time GPS update received for user:', newGpsLog.user_id)
        })
        .subscribe()

      // Subscribe to job updates
      const jobChannel = supabase
        .channel('dispatch_job_updates')
        .on('postgres_changes', {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'jobs'
        }, (payload) => {
          console.log('🔔 Job update received:', payload)
          // Refresh jobs when any job changes
          fetchJobs()
        })
        .subscribe()

      // Cleanup on unmount
      return () => {
        supabase.removeChannel(gpsChannel)
        supabase.removeChannel(jobChannel)
      }
    })
  }, [fetchJobs])

  // Event handlers
  const handleTechClick = (tech: TechLocation) => {
    setSelectedTech(tech)
    setSelectedJob(null) // Close job panel if open
    if (tech.lastLocation && mapInstance) {
      mapInstance.panTo({ lat: tech.lastLocation.lat, lng: tech.lastLocation.lng })
      mapInstance.setZoom(14)
    }
  }

  const handleJobClick = (job: JobLocation) => {
    setSelectedJob(job)
    setSelectedTech(null) // Close tech panel if open
    if (job.location && mapInstance) {
      mapInstance.panTo({ lat: job.location.lat, lng: job.location.lng })
      mapInstance.setZoom(14)
    }
  }

  const handleTechHover = (techId: string | null) => {
    setHoveredTechId(techId)
  }

  const handleJobHover = (jobId: string | null) => {
    setHoveredJobId(jobId)
  }

  const handleAssignJob = (techId: string) => {
    // Find current job if selected, or prompt to select a job
    if (selectedJob) {
      setAssignDialogJob(selectedJob)
      setAssignDialogOpen(true)
    } else {
      toast({
        title: 'No Job Selected',
        description: 'Please select a job from the map first',
        variant: 'warning',
      })
    }
  }

  const handleAssignTechToJob = (jobId: string, techId: string) => {
    setAssignDialogJob(jobs.find(j => j.id === jobId) || null)
    setAssignDialogOpen(true)
  }

  const handleJobAssignment = async (jobId: string, techId: string) => {
    try {
      const response = await fetch(`/api/dispatch/jobs/${jobId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ techId, notifyTech: true })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Assignment failed')
      }

      toast({
        title: 'Tech Assigned',
        description: 'Job assignment successful',
        variant: 'success',
      })

      // Refresh data
      refreshAllData()
      setAssignDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Assignment Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'error',
      })
      throw error // Re-throw for dialog to handle
    }
  }

  const handleNavigate = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(url, '_blank')
  }

  // Get marker icon based on tech status (circular markers)
  const getTechMarkerIcon = (status: TechLocation['status']) => {
    return {
      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
      fillColor: techStatusColors[status].marker,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 10,
    }
  }

  // Get marker icon based on job status (pin markers)
  const getJobMarkerIcon = (status: JobLocation['status']) => {
    return {
      path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
      fillColor: jobStatusColors[status].marker,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 1.2,
      anchor: new google.maps.Point(0, 0),
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dispatch map...</p>
        </div>
      </div>
    )
  }

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!googleMapsApiKey) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Configuration Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Instructions:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Go to Google Cloud Console</li>
                <li>Enable Maps JavaScript API</li>
                <li>Create an API key</li>
                <li>Add it to .env.local as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
              </ol>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col relative">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Dispatch Map</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{techs.length} tech{techs.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {jobs.length} job{jobs.length !== 1 ? 's' : ''}
            </span>
          </div>
          <Button onClick={refreshAllData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-50 border-b p-4 z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {techs.filter(t => t.status === 'on_job').length}
              </div>
              <div className="text-sm text-gray-600">On Job</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">
                {techs.filter(t => t.status === 'en_route').length}
              </div>
              <div className="text-sm text-gray-600">En Route</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">
                {techs.filter(t => t.status === 'idle').length}
              </div>
              <div className="text-sm text-gray-600">Idle</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-gray-600">
                {techs.filter(t => t.status === 'offline').length}
              </div>
              <div className="text-sm text-gray-600">Offline</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">
                {jobs.filter(j => !j.assignedTech).length}
              </div>
              <div className="text-sm text-gray-600">Unassigned Jobs</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Tech List Sidebar */}
        <TechListSidebar
          techs={techs}
          onTechClick={handleTechClick}
          onTechHover={handleTechHover}
          selectedTechId={selectedTech?.id || null}
          selectedJobId={selectedJob?.id || null}
          selectedJobLocation={selectedJob?.location || null}
        />

        {/* Map */}
        <div className="flex-1 relative">
          <LoadScript googleMapsApiKey={googleMapsApiKey}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCenter}
              zoom={zoom}
              onLoad={(map) => setMapInstance(map)}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
              }}
            >
              {/* Tech Markers */}
              {techs.map((tech) => {
                if (!tech.lastLocation) return null

                return (
                  <Marker
                    key={`tech-${tech.id}`}
                    position={{
                      lat: tech.lastLocation.lat,
                      lng: tech.lastLocation.lng
                    }}
                    icon={getTechMarkerIcon(tech.status)}
                    onClick={() => handleTechClick(tech)}
                    title={tech.name}
                  />
                )
              })}

              {/* Job Markers */}
              {jobs.map((job) => {
                if (!job.location) return null

                return (
                  <Marker
                    key={`job-${job.id}`}
                    position={{
                      lat: job.location.lat,
                      lng: job.location.lng
                    }}
                    icon={getJobMarkerIcon(job.status)}
                    onClick={() => handleJobClick(job)}
                    title={`${job.description} - ${job.customer.name}`}
                  />
                )
              })}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>

      {/* Tech Detail Panel */}
      {selectedTech && (
        <TechDetailPanel
          tech={selectedTech}
          onClose={() => setSelectedTech(null)}
          onAssignJob={handleAssignJob}
          onNavigate={handleNavigate}
        />
      )}

      {/* Job Detail Panel */}
      {selectedJob && (
        <JobDetailPanel
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onAssignTech={handleAssignTechToJob}
          onNavigate={handleNavigate}
          availableTechs={techs}
        />
      )}

      {/* Assign Tech Dialog */}
      <AssignTechDialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false)
          setAssignDialogJob(null)
        }}
        job={assignDialogJob}
        techs={techs}
        onAssign={handleJobAssignment}
      />
    </div>
  )
}
