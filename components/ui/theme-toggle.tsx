'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { getThemeManager, type Theme } from '@/lib/theme-manager'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const manager = getThemeManager()
    setTheme(manager.getTheme())

    const unsubscribe = manager.onThemeChange((newTheme) => {
      setTheme(newTheme)
    })

    return unsubscribe
  }, [])

  const handleClick = () => {
    const manager = getThemeManager()
    manager.cycleTheme()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      handleClick()
    }
  }

  if (!mounted) {
    // Return a placeholder to prevent layout shift
    return (
      <div 
        className={cn(
          "relative inline-flex items-center justify-between w-[120px] h-10 bg-theme-surface border-2 border-theme rounded-[20px] p-1",
          className
        )}
        aria-hidden="true"
      />
    )
  }

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative inline-flex items-center justify-between w-[120px] h-10 bg-theme-surface backdrop-blur-sm border-2 border-theme rounded-[20px] p-1 cursor-pointer transition-all duration-300",
        "hover:border-theme-accent-primary hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:ring-offset-2 focus:ring-offset-theme-primary",
        className
      )}
      role="radiogroup"
      aria-label="Select theme"
      aria-pressed={false}
    >
      {/* Icons Track */}
      <div className="absolute inset-0 flex items-center justify-around pointer-events-none px-2">
        <Sun 
          className={cn(
            "w-5 h-5 transition-opacity duration-200",
            theme === 'warm' 
              ? "opacity-100 text-theme-accent-primary" 
              : "opacity-40 text-theme-secondary"
          )}
          aria-hidden="true"
        />
        <Monitor 
          className={cn(
            "w-5 h-5 transition-opacity duration-200",
            theme === 'system' 
              ? "opacity-100 text-theme-accent-primary" 
              : "opacity-40 text-theme-secondary"
          )}
          aria-hidden="true"
        />
        <Moon 
          className={cn(
            "w-5 h-5 transition-opacity duration-200",
            theme === 'midnight' 
              ? "opacity-100 text-theme-accent-primary" 
              : "opacity-40 text-theme-secondary"
          )}
          aria-hidden="true"
        />
      </div>

      {/* Indicator */}
      <div
        className={cn(
          "absolute w-8 h-8 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] shadow-glow flex items-center justify-center",
          "bg-gradient-to-br from-theme-accent-primary to-theme-accent-secondary",
          theme === 'warm' && "translate-x-0",
          theme === 'system' && "translate-x-[40px]",
          theme === 'midnight' && "translate-x-[80px]"
        )}
        aria-hidden="true"
      >
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
    </button>
  )
}

