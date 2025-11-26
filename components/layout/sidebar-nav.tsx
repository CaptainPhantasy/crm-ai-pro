'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Mail,
  Briefcase,
  Users,
  BarChart3,
  DollarSign,
  Settings as SettingsIcon,
  Send,
  FileText,
  Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VoiceAgentWidget } from '@/components/voice-agent/voice-agent-widget'

const navItems = [
  { label: "Inbox", icon: Mail, href: "/inbox" },
  { label: "Jobs", icon: Briefcase, href: "/jobs" },
  { label: "Contacts", icon: Users, href: "/contacts" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Finance", icon: DollarSign, href: "/finance/dashboard" },
]

const marketingItems = [
  { label: "Campaigns", icon: Send, href: "/marketing/campaigns" },
  { label: "Templates", icon: FileText, href: "/marketing/email-templates" },
  { label: "Tags", icon: Tag, href: "/marketing/tags" },
]

const adminItems = [
  { label: "Settings", icon: SettingsIcon, href: "/admin/settings" },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/inbox') {
    return pathname === '/inbox'
  }
  if (href === '/jobs') {
    return pathname === '/jobs' || pathname.startsWith('/jobs/')
  }
  if (href === '/contacts') {
    return pathname === '/contacts' || pathname.startsWith('/contacts/')
  }
  if (href === '/analytics') {
    return pathname === '/analytics' || pathname.startsWith('/analytics/')
  }
  if (href === '/finance') {
    return pathname === '/finance' || pathname.startsWith('/finance/')
  }
  if (href === '/marketing/campaigns') {
    return pathname === '/marketing/campaigns' || pathname.startsWith('/marketing/campaigns')
  }
  if (href === '/marketing/email-templates') {
    return pathname === '/marketing/email-templates'
  }
  if (href === '/marketing/tags') {
    return pathname === '/marketing/tags'
  }
  if (href === '/admin/settings') {
    return pathname === '/admin/settings' || pathname.startsWith('/admin/settings')
  }
  return false
}

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="w-60 border-r border-theme-border bg-theme-surface flex flex-col">
      {/* Logo */}
      <div className="flex items-center px-3 py-4 border-b border-theme-border">
        <span className="text-2xl font-bold tracking-tight text-theme-primary">CRM-AI PRO</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-6">
        {/* Core Section */}
        <div className="space-y-3">
          <p className="text-xs uppercase text-theme-secondary px-1">Core</p>
          <nav className="space-y-1">
            {navItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive(pathname, item.href)
                    ? "bg-theme-accent-secondary/20 text-theme-accent-primary border border-theme-accent-primary"
                    : "text-theme-secondary hover:bg-theme-surface hover:text-theme-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Marketing Section */}
        <div className="space-y-3">
          <p className="text-xs uppercase text-theme-secondary px-1">Marketing</p>
          <nav className="space-y-1">
            {marketingItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive(pathname, item.href)
                    ? "bg-theme-accent-secondary/20 text-theme-accent-primary border border-theme-accent-primary"
                    : "text-theme-secondary hover:bg-theme-surface hover:text-theme-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Admin Section */}
        <div className="space-y-3">
          <p className="text-xs uppercase text-theme-secondary px-1">Admin</p>
          <nav className="space-y-1">
            {adminItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive(pathname, item.href)
                    ? "bg-theme-accent-secondary/20 text-theme-accent-primary border border-theme-accent-primary"
                    : "text-theme-secondary hover:bg-theme-surface hover:text-theme-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Voice Agent Widget - positioned at bottom */}
      <VoiceAgentWidget />
    </aside>
  )
}
