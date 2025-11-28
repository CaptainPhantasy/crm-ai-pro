'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  MapPin, Camera, Star, Gift, PenTool,
  CheckCircle, AlertTriangle, ArrowLeft, Phone, Navigation
} from 'lucide-react'
import { BigButton, BigButtonGrid } from '@/components/mobile/big-button'
import { VoiceButton } from '@/components/mobile/voice-button'
import { gpsTracker } from '@/lib/gps/tracker'
import { saveGateCompletionOffline, type OfflineGateCompletion } from '@/lib/offline/db'
import SignatureCanvas from 'react-signature-canvas'

type GateStage = 
  | 'arrival'
  | 'before_photos'
  | 'work_complete'
  | 'after_photos'
  | 'satisfaction'
  | 'review_request'
  | 'signature'
  | 'done'

interface Job {
  id: string
  description: string
  status: string
  contact: {
    id: string
    firstName: string
    lastName: string
    address: string
    phone: string
  }
}

interface GateState {
  arrivalLogged: boolean
  beforePhotos: string[]
  afterPhotos: string[]
  satisfactionRating: number | null
  reviewRequested: boolean
  discountApplied: number | null
  signatureData: string | null
}

export default function TechJobPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStage, setCurrentStage] = useState<GateStage>('arrival')
  const [gateState, setGateState] = useState<GateState>({
    arrivalLogged: false,
    beforePhotos: [],
    afterPhotos: [],
    satisfactionRating: null,
    reviewRequested: false,
    discountApplied: null,
    signatureData: null,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const signatureRef = useRef<SignatureCanvas>(null)

  useEffect(() => {
    fetchJob()
  }, [jobId])

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/tech/jobs/${jobId}`)
      if (res.ok) {
        const data = await res.json()
        setJob(data.job)
        // Restore gate state if exists
        if (data.gates) {
          // Map existing gate completions to state
        }
      }
    } catch (error) {
      console.error('Failed to fetch job:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleArrival = async () => {
    setIsProcessing(true)
    try {
      await gpsTracker.logArrival(jobId, { stage: 'arrival' })

      const gateData = {
        jobId,
        stageName: 'arrival',
        metadata: { gpsLogged: true },
      }

      // Try online first
      try {
        await fetch('/api/tech/gates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gateData),
        })
      } catch (error) {
        // If offline, save to IndexedDB
        if (!navigator.onLine) {
          const offlineGate: OfflineGateCompletion = {
            id: crypto.randomUUID(),
            localId: crypto.randomUUID(),
            jobId: jobId,
            stageName: 'arrival',
            status: 'completed',
            metadata: { gpsLogged: true },
            syncStatus: 'pending',
            lastModified: Date.now(),
          }
          await saveGateCompletionOffline(offlineGate)
        } else {
          throw error
        }
      }

      setGateState(prev => ({ ...prev, arrivalLogged: true }))
      setCurrentStage('before_photos')
    } catch (error) {
      alert('Failed to log arrival. Please check GPS permissions.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePhotoCapture = async (type: 'before' | 'after') => {
    fileInputRef.current?.click()
    // The actual upload happens in handleFileChange
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('jobId', jobId)
      formData.append('type', currentStage === 'before_photos' ? 'before' : 'after')

      const res = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (currentStage === 'before_photos') {
          setGateState(prev => ({
            ...prev,
            beforePhotos: [...prev.beforePhotos, data.url],
          }))
        } else {
          setGateState(prev => ({
            ...prev,
            afterPhotos: [...prev.afterPhotos, data.url],
          }))
        }
      }
    } catch (error) {
      console.error('Failed to upload photo:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const proceedFromPhotos = async (type: 'before' | 'after') => {
    const photos = type === 'before' ? gateState.beforePhotos : gateState.afterPhotos
    if (photos.length === 0) {
      alert(`Please take at least one ${type} photo`)
      return
    }

    const gateData = {
      jobId,
      stageName: `${type}_photos`,
      metadata: { photoCount: photos.length },
    }

    try {
      await fetch('/api/tech/gates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gateData),
      })
    } catch (error) {
      // If offline, save to IndexedDB
      if (!navigator.onLine) {
        const offlineGate: OfflineGateCompletion = {
          id: crypto.randomUUID(),
          localId: crypto.randomUUID(),
          jobId: jobId,
          stageName: `${type}_photos`,
          status: 'completed',
          metadata: { photoCount: photos.length },
          syncStatus: 'pending',
          lastModified: Date.now(),
        }
        await saveGateCompletionOffline(offlineGate)
      } else {
        throw error
      }
    }

    setCurrentStage(type === 'before' ? 'work_complete' : 'satisfaction')
  }

  const handleWorkComplete = async () => {
    const gateData = {
      jobId,
      stageName: 'work_complete',
    }

    try {
      await fetch('/api/tech/gates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gateData),
      })
    } catch (error) {
      // If offline, save to IndexedDB
      if (!navigator.onLine) {
        const offlineGate: OfflineGateCompletion = {
          id: crypto.randomUUID(),
          localId: crypto.randomUUID(),
          jobId: jobId,
          stageName: 'work_complete',
          status: 'completed',
          metadata: {},
          syncStatus: 'pending',
          lastModified: Date.now(),
        }
        await saveGateCompletionOffline(offlineGate)
      } else {
        throw error
      }
    }

    setCurrentStage('after_photos')
  }

  const handleSatisfactionRating = async (rating: number) => {
    setGateState(prev => ({ ...prev, satisfactionRating: rating }))

    if (rating <= 3) {
      // Escalate to manager
      const gateData = {
        jobId,
        stageName: 'satisfaction',
        metadata: { rating, escalated: true },
        requiresException: true,
      }

      try {
        await fetch('/api/tech/gates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gateData),
        })
      } catch (error) {
        if (!navigator.onLine) {
          const offlineGate: OfflineGateCompletion = {
            id: crypto.randomUUID(),
            localId: crypto.randomUUID(),
            jobId: jobId,
            stageName: 'satisfaction',
            status: 'completed',
            satisfactionRating: rating,
            metadata: { rating, escalated: true },
            syncStatus: 'pending',
            lastModified: Date.now(),
          }
          await saveGateCompletionOffline(offlineGate)
        } else {
          throw error
        }
      }

      alert('Manager has been notified. They will contact the customer.')
      setCurrentStage('signature')
    } else {
      const gateData = {
        jobId,
        stageName: 'satisfaction',
        metadata: { rating },
      }

      try {
        await fetch('/api/tech/gates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gateData),
        })
      } catch (error) {
        if (!navigator.onLine) {
          const offlineGate: OfflineGateCompletion = {
            id: crypto.randomUUID(),
            localId: crypto.randomUUID(),
            jobId: jobId,
            stageName: 'satisfaction',
            status: 'completed',
            satisfactionRating: rating,
            metadata: { rating },
            syncStatus: 'pending',
            lastModified: Date.now(),
          }
          await saveGateCompletionOffline(offlineGate)
        } else {
          throw error
        }
      }

      setCurrentStage('review_request')
    }
  }

  const handleReviewRequest = async (accepted: boolean, discount: number | null) => {
    setGateState(prev => ({
      ...prev,
      reviewRequested: accepted,
      discountApplied: discount,
    }))

    const gateData = {
      jobId,
      stageName: 'review_request',
      metadata: { accepted, discount },
    }

    try {
      await fetch('/api/tech/gates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gateData),
      })
    } catch (error) {
      if (!navigator.onLine) {
        const offlineGate: OfflineGateCompletion = {
          id: crypto.randomUUID(),
          localId: crypto.randomUUID(),
          jobId: jobId,
          stageName: 'review_request',
          status: 'completed',
          metadata: { accepted, discount },
          syncStatus: 'pending',
          lastModified: Date.now(),
        }
        await saveGateCompletionOffline(offlineGate)
      } else {
        throw error
      }
    }

    setCurrentStage('signature')
  }

  const handleSignature = async () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      alert('Please provide a signature first')
      return
    }

    setIsProcessing(true)
    try {
      // Get signature as data URL
      const signatureData = signatureRef.current.toDataURL('image/png')
      let signatureUrl = signatureData // Default to data URL for offline

      // Try to upload signature if online
      try {
        const blob = await (await fetch(signatureData)).blob()
        const formData = new FormData()
        formData.append('photo', blob, 'signature.png')
        formData.append('jobId', jobId)
        formData.append('type', 'signature')

        const photoRes = await fetch('/api/photos', {
          method: 'POST',
          body: formData,
        })

        if (photoRes.ok) {
          const photoData = await photoRes.json()
          signatureUrl = photoData.url
        }
      } catch (photoError) {
        // Photo upload failed, but we'll still save the gate with data URL
        console.warn('Signature photo upload failed, saving offline:', photoError)
      }

      // Log GPS departure
      await gpsTracker.logDeparture(jobId, { stage: 'completion' })

      const gateData = {
        jobId,
        stageName: 'signature',
        metadata: {
          signatureUrl: signatureUrl,
          signedAt: new Date().toISOString()
        },
      }

      // Complete gate with signature URL
      try {
        await fetch('/api/tech/gates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gateData),
        })
      } catch (error) {
        if (!navigator.onLine) {
          const offlineGate: OfflineGateCompletion = {
            id: crypto.randomUUID(),
            localId: crypto.randomUUID(),
            jobId: jobId,
            stageName: 'signature',
            status: 'completed',
            metadata: {
              signatureUrl: signatureUrl,
              signedAt: new Date().toISOString()
            },
            syncStatus: 'pending',
            lastModified: Date.now(),
          }
          await saveGateCompletionOffline(offlineGate)
        } else {
          throw error
        }
      }

      // Mark job complete
      try {
        await fetch(`/api/tech/jobs/${jobId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' }),
        })
      } catch (error) {
        // Job status update can fail offline - will be updated when gate syncs
        console.warn('Job completion update failed:', error)
      }

      setGateState(prev => ({ ...prev, signatureData: signatureData }))
      setCurrentStage('done')
    } catch (error) {
      console.error('Signature error:', error)
      alert('Failed to save signature. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const clearSignature = () => {
    signatureRef.current?.clear()
    setHasSignature(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-accent-primary)]" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center text-white">
        Job not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white">
      {/* Header */}
      <header className="bg-[var(--color-bg-secondary)] p-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <div className="font-bold">{job.contact.firstName} {job.contact.lastName}</div>
          <div className="text-gray-400 text-sm">{job.description}</div>
        </div>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(job.contact.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-[var(--color-accent-primary)] rounded-full"
          aria-label="Navigate to address"
        >
          <Navigation className="w-5 h-5" />
        </a>
        <a href={`tel:${job.contact.phone}`} className="p-2 bg-green-600 rounded-full" aria-label="Call customer">
          <Phone className="w-5 h-5" />
        </a>
      </header>

      {/* Hidden file input for photos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Gate Content */}
      <div className="p-4">
        {/* GATE 1: Arrival */}
        {currentStage === 'arrival' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <MapPin className="w-16 h-16 mx-auto text-[var(--color-accent-primary)] mb-4" />
              <h2 className="text-2xl font-bold mb-2">Confirm Arrival</h2>
              <p className="text-gray-400">{job.contact.address}</p>
            </div>
            <BigButton
              icon={MapPin}
              label="I'VE ARRIVED"
              sublabel="GPS location will be logged"
              variant="success"
              onClick={handleArrival}
              disabled={isProcessing}
            />
          </div>
        )}

        {/* GATE 2: Before Photos */}
        {currentStage === 'before_photos' && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <Camera className="w-16 h-16 mx-auto text-amber-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Before Photos</h2>
              <p className="text-gray-400">Take photos of the work area before starting</p>
            </div>
            
            {/* Photo thumbnails */}
            {gateState.beforePhotos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {gateState.beforePhotos.map((url, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-700 rounded-lg flex-shrink-0">
                    <img src={url} alt={`Before ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            <BigButtonGrid columns={1}>
              <BigButton
                icon={Camera}
                label="TAKE PHOTO"
                sublabel={`${gateState.beforePhotos.length} photo(s) taken`}
                variant="warning"
                onClick={() => handlePhotoCapture('before')}
                disabled={isProcessing}
              />
              <BigButton
                icon={CheckCircle}
                label="CONTINUE"
                variant="success"
                onClick={() => proceedFromPhotos('before')}
                disabled={gateState.beforePhotos.length === 0}
              />
            </BigButtonGrid>
          </div>
        )}

        {/* GATE 3: Work Complete */}
        {currentStage === 'work_complete' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Work Complete?</h2>
              <p className="text-gray-400">Confirm when you've finished the job</p>
            </div>
            <BigButton
              icon={CheckCircle}
              label="WORK IS COMPLETE"
              variant="success"
              onClick={handleWorkComplete}
            />
          </div>
        )}

        {/* GATE 4: After Photos */}
        {currentStage === 'after_photos' && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <Camera className="w-16 h-16 mx-auto text-green-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">After Photos</h2>
              <p className="text-gray-400">Document the completed work</p>
            </div>

            {gateState.afterPhotos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {gateState.afterPhotos.map((url, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-700 rounded-lg flex-shrink-0">
                    <img src={url} alt={`After ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            <BigButtonGrid columns={1}>
              <BigButton
                icon={Camera}
                label="TAKE PHOTO"
                sublabel={`${gateState.afterPhotos.length} photo(s) taken`}
                variant="warning"
                onClick={() => handlePhotoCapture('after')}
                disabled={isProcessing}
              />
              <BigButton
                icon={CheckCircle}
                label="CONTINUE"
                variant="success"
                onClick={() => proceedFromPhotos('after')}
                disabled={gateState.afterPhotos.length === 0}
              />
            </BigButtonGrid>
          </div>
        )}

        {/* GATE 5: Satisfaction Rating */}
        {currentStage === 'satisfaction' && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <Star className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Customer Satisfaction</h2>
              <p className="text-gray-400">How satisfied is the customer?</p>
            </div>
            
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleSatisfactionRating(rating)}
                  className={`w-14 h-14 rounded-full text-2xl font-bold transition-all ${
                    rating <= 3 
                      ? 'bg-red-900 hover:bg-red-800 border-2 border-red-500' 
                      : 'bg-green-900 hover:bg-green-800 border-2 border-green-500'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            
            <p className="text-center text-gray-500 text-sm">
              Ratings 1-3 will notify the manager
            </p>
          </div>
        )}

        {/* GATE 6: Review Request */}
        {currentStage === 'review_request' && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <Gift className="w-16 h-16 mx-auto text-purple-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Leave a Review?</h2>
              <p className="text-gray-400">
                Offer a discount for a Google review
              </p>
            </div>

            <BigButtonGrid columns={1}>
              <BigButton
                icon={Gift}
                label="YES - 5% OFF"
                sublabel="Customer will leave a review"
                variant="success"
                onClick={() => handleReviewRequest(true, 5)}
              />
              <BigButton
                label="NO THANKS"
                sublabel="Skip the review request"
                onClick={() => handleReviewRequest(false, null)}
              />
            </BigButtonGrid>
          </div>
        )}

        {/* GATE 7: Signature */}
        {currentStage === 'signature' && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <PenTool className="w-16 h-16 mx-auto text-[var(--color-accent-primary)] mb-4" />
              <h2 className="text-2xl font-bold mb-2">Customer Signature</h2>
              <p className="text-gray-400">Please sign to confirm work completion</p>
            </div>

            <div className="bg-white rounded-xl overflow-hidden">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: 'w-full h-48 touch-none',
                  style: { touchAction: 'none' }
                }}
                backgroundColor="white"
                penColor="black"
                minWidth={1}
                maxWidth={3}
                onEnd={() => setHasSignature(true)}
              />
            </div>

            {hasSignature && (
              <button
                onClick={clearSignature}
                className="w-full py-2 text-gray-400 text-sm underline"
              >
                Clear Signature
              </button>
            )}

            <BigButtonGrid columns={1}>
              <BigButton
                icon={CheckCircle}
                label="COMPLETE JOB"
                sublabel={hasSignature ? "Signature captured" : "Sign above to continue"}
                variant="success"
                onClick={handleSignature}
                disabled={isProcessing || !hasSignature}
              />
            </BigButtonGrid>
          </div>
        )}

        {/* DONE */}
        {currentStage === 'done' && (
          <div className="space-y-6 text-center py-12">
            <CheckCircle className="w-24 h-24 mx-auto text-green-400" />
            <h2 className="text-3xl font-bold">Job Complete!</h2>
            <p className="text-gray-400">Great work. GPS departure logged.</p>
            <BigButton
              label="BACK TO DASHBOARD"
              variant="primary"
              onClick={() => router.push('/tech/dashboard')}
            />
          </div>
        )}
      </div>

      {/* Voice Command Button */}
      <VoiceButton />
    </div>
  )
}

