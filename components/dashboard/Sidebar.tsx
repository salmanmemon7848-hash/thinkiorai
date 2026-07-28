'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  CheckCircle2,
  Megaphone,
  Lightbulb,
  Target,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  FileText,
  Lock,
  Compass,
  Command,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/contexts/AuthContext'
import PlanBadge from '@/components/shared/PlanBadge'
import type { Plan } from '@/types'

type NavItem = {
  icon: typeof LayoutDashboard
  label: string
  href: string
  accent?: string
  lockFor?: Plan[]
}

const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Overview',
    items: [
      { icon: Compass, label: 'Founder Workspace', href: '/workspace' },
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    label: 'Founder OS',
    items: [
      { icon: CheckCircle2, label: 'Business Validator', href: '/validator', accent: 'accent' },
      { icon: Megaphone, label: 'Marketing Engine', href: '/marketing', accent: 'accent' },
      { icon: Lightbulb, label: 'Ideas Desk', href: '/ideas', accent: 'signal-pivot' },
      { icon: Target, label: 'Leads Finder', href: '/leads', accent: 'accent' },
      { icon: FileText, label: 'Business Reports', href: '/reports', accent: 'accent', lockFor: ['free', 'builder'] as Plan[] },
      { icon: MessageSquare, label: 'Co-founder Desk', href: '/chat', accent: 'fg' },
    ],
  },
]

const BOTTOM_ITEMS = [
  { icon: CreditCard, label: 'Plan & billing', href: '/pricing' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

interface SidebarProps {
  userName: string
  userEmail: string
  plan: string
}

const ACCENT_VAR: Record<string, string> = {
  accent: '--accent',
  'signal-insight': '--signal-insight',
  'signal-pivot': '--signal-pivot',
  'signal-violet': '--signal-violet',
  fg: '--fg',
}

function SidebarContent({
  userName,
  userEmail,
  plan,
  onClose,
}: SidebarProps & { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="flex flex-col h-full bg-bg-sub border-r border-line relative">
      {/* Header / wordmark */}
      <div className="px-5 pt-5 pb-4">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-baseline gap-1.5 group"
        >
          <span className="wordmark text-fg text-[20px] tracking-tight">Thinkior</span>
          <span className="wordmark-ai text-[18px]">Ai</span>
        </Link>
        <p className="text-[10.5px] font-mono uppercase tracking-caps text-fg-faint mt-1.5">
          Founder OS
        </p>
      </div>

      {/* Quick command is intentionally hidden until it has real command handling. */}
      {false && (
      <div className="px-3">
        <button className="w-full flex items-center justify-between gap-2 bg-bg-card hover:bg-bg-elevated border border-line hover:border-line-strong rounded-md px-3 py-2 transition-colors text-left group">
          <div className="flex items-center gap-2 min-w-0">
            <Command className="w-3.5 h-3.5 text-fg-muted flex-shrink-0" />
            <span className="text-[12.5px] text-fg-dim group-hover:text-fg truncate transition-colors">
              Quick command
            </span>
          </div>
          <span className="kbd flex-shrink-0">⌘K</span>
        </button>
      </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            <p className="eyebrow px-2 mb-2 text-fg-faint">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + '/')
                const Icon = item.icon
                const isLocked = item.lockFor?.includes(plan as Plan)
                const accentVar = item.accent ? ACCENT_VAR[item.accent] : null
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'group flex items-center gap-3 px-2.5 py-2 rounded-md text-[13px] transition-all duration-150 relative',
                      active
                        ? 'bg-bg-card text-fg'
                        : 'text-fg-dim hover:text-fg hover:bg-bg-card/60'
                    )}
                  >
                    {active && (
                      <>
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />
                        <span
                          className="absolute inset-0 rounded-md pointer-events-none"
                          style={{
                            background:
                              'linear-gradient(90deg, color-mix(in srgb, var(--accent) 8%, transparent), transparent 60%)',
                          }}
                          aria-hidden="true"
                        />
                      </>
                    )}
                    <Icon
                      className="w-4 h-4 flex-shrink-0 transition-colors"
                      strokeWidth={1.75}
                      style={
                        active && accentVar
                          ? { color: `var(${accentVar})` }
                          : undefined
                      }
                    />
                    <span className="flex-1 truncate font-medium">{item.label}</span>
                    {isLocked && (
                      <Lock
                        className="w-3 h-3 text-fg-faint flex-shrink-0"
                        strokeWidth={2}
                        aria-label="Locked feature"
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-line mt-4">
          <div className="space-y-0.5">
            {BOTTOM_ITEMS.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center gap-3 px-2.5 py-2 rounded-md text-[13px] transition-colors',
                    active
                      ? 'bg-bg-card text-fg'
                      : 'text-fg-dim hover:text-fg hover:bg-bg-card/60'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                  <span className="flex-1 font-medium">{item.label}</span>
                  <ChevronRight className="w-3 h-3 text-fg-faint opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Upgrade card (free users) */}
      {plan === 'free' && (
        <div className="mx-3 mb-3">
          <Link
            href="/pricing"
            className="block card-premium rounded-lg p-3.5 hover:bg-bg-elevated transition-colors group relative overflow-hidden"
          >
            <span
              className="absolute inset-x-0 top-0 h-px bg-accent/30"
              aria-hidden="true"
            />
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-[10.5px] font-mono uppercase tracking-caps text-accent font-semibold">
                Upgrade to Builder
              </span>
            </div>
            <p className="text-[12.5px] text-fg leading-snug mb-3">
              More queries, all languages, saved reports.
            </p>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent group-hover:gap-2 transition-all">
              See plans
              <span className="text-base leading-none">→</span>
            </span>
          </Link>
        </div>
      )}

      {/* User footer */}
      <div className="border-t border-line bg-bg">
        <div className="flex items-center gap-2.5 px-3 py-3">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-accent to-signal-insight flex items-center justify-center font-display font-semibold text-[12px] text-bg flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-medium text-fg truncate leading-tight">
              {userName}
            </p>
            <div className="mt-0.5">
              <PlanBadge plan={plan as Plan} />
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-fg-muted hover:text-signal-rose transition-colors p-1.5 rounded hover:bg-bg-card"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ userName, userEmail, plan }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex fixed top-0 left-0 h-full w-[260px] z-40">
        <SidebarContent userName={userName} userEmail={userEmail} plan={plan} />
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-bg-card border border-line rounded-md flex items-center justify-center text-fg-dim hover:text-fg"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-[260px] h-full animate-fade-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-fg-dim hover:text-fg"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent
              userName={userName}
              userEmail={userEmail}
              plan={plan}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
