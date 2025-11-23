'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function LoadingScreen() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Show loading screen for 6 seconds, then always redirect to login
    const timer = setTimeout(() => {
      router.replace('/login')
    }, 6000)

    return () => clearTimeout(timer)
  }, [router])

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-secondary overflow-hidden circuit-pattern">
      <div className="relative w-full h-full">
        <Image
          src="/assets/loading screen.jpeg"
          alt="Loading CRM-AI PRO"
          fill
          className="object-contain"
          priority
          quality={100}
          sizes="100vw"
        />
      </div>
    </div>
  )
}

