'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function LoadingScreen() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setMounted(true)
    
    // Show loading screen for 7 seconds, then always redirect to login
    const timer = setTimeout(() => {
      router.replace('/login')
    }, 7000)

    return () => clearTimeout(timer)
  }, [router])

  useEffect(() => {
    if (mounted && videoRef.current) {
      // Ensure video plays when component mounts
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Video play failed, but don't crash the app
          console.warn('Video autoplay failed:', error)
        })
      }
    }
  }, [mounted])

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-theme-secondary" />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-theme-secondary overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-contain"
        aria-label="Loading CRM-AI PRO"
        onError={(e) => {
          console.error('Video loading error:', e)
        }}
        onLoadedData={() => {
          // Video loaded successfully
          if (videoRef.current) {
            videoRef.current.play().catch(() => {
              // Ignore play errors
            })
          }
        }}
      >
        <source
          src="/assets/hero/splashvideo.MP4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

