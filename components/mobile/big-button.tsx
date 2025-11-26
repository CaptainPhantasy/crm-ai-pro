'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BigButtonProps {
  icon?: LucideIcon
  label: string
  sublabel?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  disabled?: boolean
  onClick?: () => void
  className?: string
}

const variantStyles = {
  default: 'bg-gray-800 text-white border-gray-700',
  primary: 'bg-blue-600 text-white border-blue-500',
  success: 'bg-green-600 text-white border-green-500',
  warning: 'bg-amber-600 text-white border-amber-500',
  danger: 'bg-red-600 text-white border-red-500',
}

/**
 * BigButton - Mobile-optimized button for field technicians
 * 
 * Features:
 * - 60px minimum height for glove-friendly tapping
 * - Large touch target (full width)
 * - High contrast colors
 * - Optional icon and sublabel
 */
export function BigButton({
  icon: Icon,
  label,
  sublabel,
  variant = 'default',
  disabled = false,
  onClick,
  className,
}: BigButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full min-h-[60px] px-6 py-4 rounded-2xl border-2',
        'flex items-center justify-center gap-3',
        'font-bold text-lg uppercase tracking-wide',
        'transition-all duration-150 active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        className
      )}
    >
      {Icon && <Icon className="w-6 h-6 flex-shrink-0" />}
      <div className="flex flex-col items-start">
        <span>{label}</span>
        {sublabel && (
          <span className="text-xs font-normal opacity-80 normal-case">
            {sublabel}
          </span>
        )}
      </div>
    </button>
  )
}

/**
 * BigButtonGrid - Grid layout for multiple BigButtons
 */
export function BigButtonGrid({ children, columns = 2 }: { children: React.ReactNode; columns?: 1 | 2 }) {
  return (
    <div className={cn(
      'grid gap-4',
      columns === 1 ? 'grid-cols-1' : 'grid-cols-2'
    )}>
      {children}
    </div>
  )
}

