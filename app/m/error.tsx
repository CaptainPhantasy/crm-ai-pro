'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function MobileError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Mobile Error:', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[50vh] p-6 text-center bg-background">
            <div className="bg-red-50 p-3 rounded-full mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground text-sm mb-6">
                {error.message || 'An unexpected error occurred.'}
            </p>
            <Button
                onClick={reset}
                size="sm"
                className="gap-2"
            >
                <RefreshCw className="h-4 w-4" />
                Try Again
            </Button>
        </div>
    )
}
