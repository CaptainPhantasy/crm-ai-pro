'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  MapPin, Camera, Star, Gift, PenTool, 
  CheckCircle, AlertTriangle, ArrowLeft, Phone
} from 'lucide-react'
import { BigButton, BigButtonGrid } from '@/components/mobile/big-button'
import { gpsTracker } from '@/lib/gps/tracker'

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
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
      
      await fetch('/api/tech/gates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          stageName: 'arrival',
          metadata: { gpsLogged: true },
        }),
      })
      
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

    await fetch('/api/tech/gates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId,
        stageName: `${type}_photos`,
        metadata: { photoCount: photos.length },
      }),
    })

    setCurrentStage(type === 'before' ? 'work_complete' : 'satisfaction')
  }

  const handleWorkComplete = async () => {
    await fetch('/api/tech/gates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId,
        stageName: 'work_complete',
      }),
    })
    setCurrentStage('after_photos')
  }

  const handleSatisfactionRating = async (rating: number) => {
    setGateState(prev => ({ ...prev, satisfactionRating: rating }))
    
    if (rating <= 3) {
      // Escalate to manager
      await fetch('/api/tech/gates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          stageName: 'satisfaction',
          metadata: { rating, escalated: true },
          requiresException: true,
        }),
      })
      alert('Manager has been notified. They will contact the customer.')
      setCurrentStage('signature')
    } else {
      await fetch('/api/tech/gates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          stageName: 'satisfaction',
          metadata: { rating },
        }),
      })
      setCurrentStage('review_request')
    }
  }

  const handleReviewRequest = async (accepted: boolean, discount: number | null) => {
    setGateState(prev => ({
      ...prev,
      reviewRequested: accepted,
      discountApplied: discount,
    }))

    await fetch('/api/tech/gates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId,
        stageName: 'review_request',
        metadata: { accepted, discount },
      }),
    })

    setCurrentStage('signature')
  }

  const handleSignature = async () => {
    // In production, implement actual signature capture
    const signatureData = 'signature_placeholder'
    
    setIsProcessing(true)
    try {
      await gpsTracker.logDeparture(jobId, { stage: 'completion' })
      
      await fetch('/api/tech/gates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          stageName: 'signature',
          metadata: { signatureData },
        }),
      })

      // Mark job complete
      await fetch(`/api/tech/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })

      setCurrentStage('done')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Job not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <div className="font-bold">{job.contact.firstName} {job.contact.lastName}</div>
          <div className="text-gray-400 text-sm">{job.description}</div>
        </div>
        <a href={`tel:${job.contact.phone}`} className="p-2 bg-green-600 rounded-full">
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
              <MapPin className="w-16 h-16 mx-auto text-blue-400 mb-4" />
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
              <PenTool className="w-16 h-16 mx-auto text-blue-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Customer Signature</h2>
              <p className="text-gray-400">Please sign to confirm work completion</p>
            </div>

            <div className="bg-white rounded-xl h-48 relative">
              <canvas
                ref={canvasRef}
                className="w-full h-full rounded-xl"
              />
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                Sign here
              </div>
            </div>

            <BigButton
              icon={CheckCircle}
              label="COMPLETE JOB"
              variant="success"
              onClick={handleSignature}
              disabled={isProcessing}
            />
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
    </div>
  )
}

