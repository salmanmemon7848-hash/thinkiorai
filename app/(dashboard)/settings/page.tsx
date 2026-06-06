'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import PlanBadge from '@/components/shared/PlanBadge'
import type { Plan } from '@/types'
import { LogOut, Mail, Calendar, User } from 'lucide-react'
import { DataDeletionSection } from '@/components/features/DPDPCompliance'

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="space-y-10 max-w-3xl animate-fade-in">
      <div>
        <p className="eyebrow mb-3">Account</p>
        <h1 className="font-display font-bold text-3xl text-fg tracking-tighter leading-tight">
          Settings
        </h1>
      </div>

      {/* Profile card */}
      <section>
        <h2 className="font-display font-semibold text-base text-fg mb-4 tracking-tight">
          Profile
        </h2>
        <div className="card-premium rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-accent to-signal-insight flex items-center justify-center font-display font-bold text-xl text-bg">
              {(profile?.name ?? user?.email ?? 'F').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-lg text-fg leading-tight tracking-tight">
                {profile?.name ?? 'Founder'}
              </p>
              <p className="text-sm text-fg-muted mt-1 font-mono">{user?.email}</p>
            </div>
            <PlanBadge plan={(profile?.plan ?? 'free') as Plan} />
          </div>
        </div>
      </section>

      {/* Account details */}
      <section>
        <h2 className="font-display font-semibold text-base text-fg mb-4 tracking-tight">
          Details
        </h2>
        <div className="card-premium rounded-xl overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-4 border-b border-line-soft">
            <User className="w-4 h-4 text-fg-muted flex-shrink-0" />
            <span className="text-sm text-fg flex-1">Display name</span>
            <span className="text-sm text-fg-dim font-mono">{profile?.name ?? '—'}</span>
          </div>
          <div className="flex items-center gap-4 px-5 py-4 border-b border-line-soft">
            <Calendar className="w-4 h-4 text-fg-muted flex-shrink-0" />
            <span className="text-sm text-fg flex-1">Member since</span>
            <span className="text-sm text-fg-dim font-mono tabular">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            <Mail className="w-4 h-4 text-fg-muted flex-shrink-0" />
            <span className="text-sm text-fg flex-1">Support</span>
            <a
              href="mailto:hello@thinkior.com"
              className="text-sm text-accent hover:text-accent-hover transition-colors font-mono"
            >
              hello@thinkior.com
            </a>
          </div>
        </div>
      </section>

      {/* Privacy — DPDP Act 2023 */}
      <section>
        <h2 className="font-display font-semibold text-base text-fg mb-4 tracking-tight">
          Privacy
        </h2>
        <div className="card-premium rounded-xl p-6">
          <p className="text-sm text-fg-dim mb-2">
            Your data is stored securely in India (Mumbai region). You have full control over your data
            as guaranteed by the DPDP Act 2023.
          </p>
          <DataDeletionSection />
        </div>
      </section>

      {/* Sign out */}
      <section className="pt-4 border-t border-line">
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2.5 text-signal-rose hover:bg-signal-rose/10 border border-signal-rose/30 hover:border-signal-rose font-medium text-sm px-5 py-2.5 rounded-md transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </section>
    </div>
  )
}
