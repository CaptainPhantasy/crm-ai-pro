'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, DollarSign, Clock, User, Plus, Download, CheckSquare } from 'lucide-react'
import { Job } from '@/types'
import { CreateJobDialog } from '@/components/jobs/create-job-dialog'
import { JobDetailModal } from '@/components/jobs/job-detail-modal'
import { BulkAssignDialog } from '@/components/jobs/bulk-assign-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExportButton } from '@/components/export/export-button'
import { useModalState } from '@/hooks/use-modal-state'
import { toast, error as toastError, success as toastSuccess, warning as toastWarning } from '@/lib/toast'
import { confirmDialog } from '@/lib/confirm'
import { ErrorBoundary } from '@/components/error-boundary'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function JobsPageContent() {
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [createJobOpen, setCreateJobOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  
  // Use modal state hook to sync with URL query parameter
  const { isOpen: detailModalOpen, modalId: urlJobId, open: openModal, close: closeModal } = useModalState('id', {
    onOpen: (id) => {
      setSelectedJobId(id)
    },
    onClose: () => {
      setSelectedJobId(null)
    }
  })
  
  // Sync selectedJobId with URL param
  useEffect(() => {
    if (urlJobId && urlJobId !== selectedJobId) {
      setSelectedJobId(urlJobId)
    } else if (!urlJobId && selectedJobId) {
      setSelectedJobId(null)
    }
  }, [urlJobId, selectedJobId])
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set())
  const [bulkStatusUpdating, setBulkStatusUpdating] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    revenue: 0
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  // Handle query parameter on mount and when it changes
  useEffect(() => {
    const jobIdParam = searchParams.get('id')
    if (jobIdParam && jobIdParam !== selectedJobId) {
      setSelectedJobId(jobIdParam)
      openModal(jobIdParam)
    }
  }, [searchParams])

  async function fetchJobs() {
    try {
      setLoading(true)
      // Add cache control for faster subsequent loads
      const response = await fetch('/api/jobs', {
        next: { revalidate: 30 }, // Cache for 30 seconds
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
        }
      })
      
      if (!response.ok) {
        // API failed, but continue with empty state
        console.warn('API call failed, using empty state')
        setJobs([])
        setStats({ total: 0, completed: 0, inProgress: 0, revenue: 0 })
        return
      }
      
      if (response.ok) {
      const data = await response.json()
      setJobs(data.jobs || [])
      
      // Calculate stats efficiently with useMemo-like optimization
      const jobsArray = data.jobs || []
      const total = jobsArray.length
      let completed = 0
      let inProgress = 0
      let revenue = 0
      
      for (const job of jobsArray) {
        if (job.status === 'completed') completed++
        if (job.status === 'in_progress') inProgress++
        revenue += job.total_amount || 0
      }
      
      setStats({ total, completed, inProgress, revenue })
      }
    } catch (error) {
      // API failed, but continue with empty state
      console.error('Error fetching jobs:', error)
      setJobs([])
      setStats({ total: 0, completed: 0, inProgress: 0, revenue: 0 })
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateJob() {
    setCreateJobOpen(true)
  }

  async function handleViewJob(jobId: string) {
    setSelectedJobId(jobId)
    openModal(jobId)
  }

  async function handleSeedDatabase() {
    const confirmed = await confirmDialog({
      title: 'Seed Test Data',
      description: 'This will populate the database with test data. Continue?',
      variant: 'default',
    })
    
    if (!confirmed) {
      return
    }

    setSeeding(true)
    try {
      const response = await fetch('/api/seed', { method: 'POST' })
      
      if (response.ok) {
        const data = await response.json()
        toastSuccess(
          'Database seeded successfully!',
          `Summary: ${data.summary.contacts} contacts, ${data.summary.conversations} conversations, ${data.summary.jobs} jobs, ${data.summary.messages} messages`
        )
        fetchJobs() // Refresh
      } else {
        const data = await response.json().catch(() => ({}))
        toastError(
          'Failed to seed database',
          data.error || data.details || 'If data already exists, this is normal. Try refreshing the page.'
        )
      }
    } catch (error: any) {
      console.error('Error seeding database:', error)
      toastError(
        'Failed to seed database',
        error.message || 'Network error. Make sure the server is running and try again.'
      )
    } finally {
      setSeeding(false)
    }
  }


  function handleToggleJobSelection(jobId: string) {
    const newSelected = new Set(selectedJobIds)
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId)
    } else {
      newSelected.add(jobId)
    }
    setSelectedJobIds(newSelected)
  }

  function handleSelectAllJobs() {
    if (selectedJobIds.size === jobs.length) {
      setSelectedJobIds(new Set())
    } else {
      setSelectedJobIds(new Set(jobs.map(j => j.id)))
    }
  }

  function handleClearSelection() {
    setSelectedJobIds(new Set())
  }

  async function handleBulkStatusUpdate(status: string) {
    if (selectedJobIds.size === 0) return

    setBulkStatusUpdating(true)
    try {
      const response = await fetch('/api/jobs/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'status',
          jobIds: Array.from(selectedJobIds),
          status,
        }),
      })

      if (response.ok) {
      const data = await response.json()
        if (data.success) {
        const successCount = data.results.filter((r: { success: boolean }) => r.success).length
        const failedCount = data.results.length - successCount
        if (failedCount === 0) {
            toastSuccess(`Updated ${successCount} job(s) to ${status}`)
        } else {
            toastWarning(
            `Updated ${successCount} job(s)`,
            `${failedCount} job(s) failed to update`
          )
        }
        setSelectedJobIds(new Set())
        fetchJobs()
      } else {
          toastError('Failed to update jobs', data.error || 'Unknown error occurred')
        }
      } else {
        const data = await response.json().catch(() => ({}))
        toastError('Failed to update jobs', data.error || 'Unknown error occurred')
      }
    } catch (error) {
      console.error('Error updating job status:', error)
      toastError('Failed to update job status', 'Network error. Please try again.')
    } finally {
      setBulkStatusUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': 
        return { bg: 'bg-theme-card', text: 'text-theme-accent-primary', border: 'border-theme-accent-primary' }
      case 'in_progress': 
        return { bg: 'bg-theme-card', text: 'text-theme-accent-primary', border: 'border-theme-accent-primary' }
      case 'completed': 
        return { bg: 'bg-theme-card', text: 'text-theme-accent-secondary', border: 'border-theme-accent-secondary' }
      case 'en_route':
        return { bg: 'bg-theme-card', text: 'text-theme-accent-secondary', border: 'border-theme-accent-secondary' }
      default: 
        return { bg: 'bg-theme-card', text: 'text-theme-subtle', border: 'border-theme-border' }
    }
  }

  // Always render the page structure, even if data loading fails
  return (
    <ErrorBoundary context="jobs">
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Jobs</h1>
          <p className="text-sm text-theme-subtle mt-1">Manage work orders and schedules</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSeedDatabase}
            variant="secondary"
            className="text-sm"
            disabled={seeding}
          >
            {seeding ? 'Seeding...' : 'Seed Test Data'}
          </Button>
          {jobs.length > 0 && (
            <>
              <ExportButton endpoint="jobs" />
              {selectedJobIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-theme-subtle">{selectedJobIds.size} selected</span>
                  <Select onValueChange={handleBulkStatusUpdate} disabled={bulkStatusUpdating}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="en_route">En Route</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => setBulkAssignOpen(true)}
                    variant="outline"
                  >
                    Assign Tech
                  </Button>
                  <Button 
                    onClick={handleClearSelection}
                    variant="ghost"
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
              )}
              {selectedJobIds.size === 0 && (
                <Button 
                  onClick={() => setBulkAssignOpen(true)}
                  variant="outline"
                >
                  Bulk Assign
                </Button>
              )}
            </>
          )}
          <Button 
            onClick={handleCreateJob}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Button>
        </div>
      </div>

      <CreateJobDialog 
        open={createJobOpen} 
        onOpenChange={setCreateJobOpen}
        onSuccess={fetchJobs}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-theme-accent-primary shadow-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-theme-subtle">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-white">{stats.total}</div>
            <p className="text-xs text-theme-accent-secondary mt-1 font-medium">+12% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-theme-accent-secondary shadow-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-theme-subtle">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-white">{stats.completed}</div>
            <p className="text-xs text-theme-accent-secondary mt-1 font-medium">75% completion rate</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-theme-accent-primary shadow-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-theme-subtle">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-white">{stats.inProgress}</div>
            <p className="text-xs text-theme-accent-primary mt-1 font-medium">Active now</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-theme-accent-secondary shadow-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-theme-subtle">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-white">${(stats.revenue / 100).toFixed(2)}</div>
            <p className="text-xs text-theme-accent-secondary mt-1 font-medium">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <Card className="shadow-md border-theme-border">
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription className="text-theme-subtle/70">View and manage your work orders</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-2 border-theme-border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-theme-subtle/50">No jobs found. Create your first job!</div>
          ) : (
            <div className="space-y-4">
              {jobs.length > 0 && (
                <div className="flex items-center gap-2 pb-2 border-b border-theme-border">
                  <Checkbox
                    checked={selectedJobIds.size === jobs.length && jobs.length > 0}
                    onCheckedChange={handleSelectAllJobs}
                  />
                  <span className="text-sm text-theme-subtle">
                    {selectedJobIds.size > 0 ? `${selectedJobIds.size} selected` : 'Select all'}
                  </span>
                </div>
              )}
                  {jobs.map((job) => {
                const colors = getStatusColor(job.status || 'lead')
                return (
                  <div
                    key={job.id}
                    className={cn(
                      "flex items-center justify-between p-4 border-2 rounded-lg transition-all relative overflow-hidden",
                      selectedJobIds.has(job.id) 
                        ? "border-theme-accent-primary bg-theme-secondary/10 shadow-glow" 
                        : "border-theme-border hover:border-theme-accent-primary hover:bg-theme-secondary"
                    )}
                    onClick={(e) => {
                      // Allow clicking the row to toggle selection, unless clicking a button/checkbox
                      if (
                        e.target instanceof HTMLElement && 
                        !e.target.closest('button') && 
                        !e.target.closest('[role="checkbox"]')
                      ) {
                         handleToggleJobSelection(job.id)
                      }
                    }}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Checkbox
                        checked={selectedJobIds.has(job.id)}
                        onCheckedChange={() => handleToggleJobSelection(job.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center bg-theme-secondary border border-theme-border"
                      >
                        <User className="w-6 h-6 text-theme-accent-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">
                            {job.contact?.first_name} {job.contact?.last_name}
                          </h3>
                          <Badge 
                            variant={
                              job.status === 'completed' ? 'secondary' :
                              job.status === 'in_progress' ? 'default' :
                              job.status === 'en_route' ? 'default' : 'outline'
                            }
                            className={cn(
                                job.status === 'en_route' && "border-theme-accent-secondary text-theme-accent-secondary"
                            )}
                          >
                            {job.status?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-theme-subtle/70">
                          {job.contact?.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-theme-accent-primary" />
                              {job.contact.address}
                            </span>
                          )}
                          {job.scheduled_start && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-theme-accent-primary" />
                              {new Date(job.scheduled_start).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {job.description && (
                          <p className="text-sm text-theme-subtle/50 mt-1 truncate max-w-md">{job.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {job.total_amount && (
                        <div className="text-right">
                          <div className="font-semibold text-white flex items-center gap-1 justify-end">
                            <DollarSign className="w-4 h-4 text-theme-accent-secondary" />
                            {(job.total_amount / 100).toFixed(2)}
                          </div>
                          <div className="text-xs text-theme-subtle/50">Total</div>
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewJob(job.id)
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Detail Modal */}
      <JobDetailModal
        open={detailModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeModal()
          } else {
            if (selectedJobId) {
              openModal(selectedJobId)
            }
          }
        }}
        jobId={selectedJobId}
      />

      {/* Bulk Assign Dialog */}
      <BulkAssignDialog
        open={bulkAssignOpen}
        onOpenChange={setBulkAssignOpen}
        jobs={selectedJobIds.size > 0 ? jobs.filter(j => selectedJobIds.has(j.id)) : jobs}
        onSuccess={() => {
          setSelectedJobIds(new Set())
          fetchJobs()
        }}
      />
      </div>
    </ErrorBoundary>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Jobs</h1>
            <p className="text-sm text-theme-subtle mt-1">Manage work orders and schedules</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-2 border-theme-border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  )
}
