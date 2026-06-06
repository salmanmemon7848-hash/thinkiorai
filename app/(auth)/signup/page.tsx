'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'

const PERKS = [
  'Brutal GO / KILL / PIVOT verdicts',
  'Real Indian competitor intelligence',
  'Unit economics in ₹, regulation explained',
  'No credit card required',
]

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg grid lg:grid-cols-2 relative overflow-hidden">
      <div className="mesh-bg" />

      {/* Left: visual */}
      <div className="hidden lg:flex items-center justify-center px-12 border-r border-line bg-bg-sub relative overflow-hidden order-2 lg:order-1">
        <div className="mesh-bg" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative max-w-md">
          <p className="eyebrow mb-6">Welcome</p>
          <h2 className="font-display font-bold text-4xl text-fg leading-[1.05] tracking-tighter mb-6">
            Join{' '}
            <span className="font-serif-italic font-normal text-accent">1,832 founders</span><br />
            in 47 Indian cities.
          </h2>
          <p className="text-base text-fg-dim leading-relaxed mb-10">
            Thinkior is not another AI app. It&apos;s an AI co-founder — honest
            counsel, in <span className="text-fg font-mono">₹</span>, for the
            Indian founder.
          </p>
          <ul className="space-y-3.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-fg-dim">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center px-5 sm:px-8 py-12 lg:py-0 order-1 lg:order-2 relative">
        <div className="w-full max-w-sm animate-fade-in">
          <Link href="/" className="inline-flex items-baseline gap-2 mb-12">
            <span className="wordmark text-fg text-2xl">Thinkior</span>
            <span className="wordmark-ai text-[22px]">Ai</span>
          </Link>

          <h1 className="font-display font-bold text-4xl text-fg tracking-tighter leading-[1.05] mb-3">
            Start your <span className="font-serif-italic font-normal text-accent">brief</span>.
          </h1>
          <p className="text-base text-fg-dim mb-9 leading-relaxed">
            Free. No card. 60 seconds to your first verdict.
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-bg-card hover:bg-bg-elevated border border-line hover:border-line-strong text-fg font-medium text-sm py-3 rounded-md transition-all disabled:opacity-60 mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs text-fg-muted font-mono uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-fg-muted block mb-2">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                required
                className="w-full bg-bg-card border border-line rounded-md px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-fg-muted block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@startup.in"
                required
                className="w-full bg-bg-card border border-line rounded-md px-4 py-3 text-sm text-fg placeholder:text-fg-muted focus:border-accent outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-fg-muted block mb-2">
                Password <span className="opacity-60">· min 8 chars</span>
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full bg-bg-card border border-line rounded-md px-4 py-3 pr-10 text-sm text-fg placeholder:text-fg-muted focus:border-accent outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-signal-rose/10 border border-signal-rose/30 rounded-md px-4 py-3">
                <p className="text-sm text-signal-rose">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-shine group w-full flex items-center justify-center gap-2 bg-accent text-bg hover:bg-accent-hover disabled:opacity-50 font-semibold py-3.5 rounded-md transition-all mt-6 shadow-glow-accent"
            >
              {loading ? (
                'Creating account...'
              ) : (
                <>
                  Create free account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            <p className="text-xs text-fg-muted text-center leading-relaxed">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-fg-dim hover:text-fg underline-offset-2 underline">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-fg-dim hover:text-fg underline-offset-2 underline">Privacy</Link>.
            </p>
          </form>

          <p className="text-center text-sm text-fg-muted mt-8">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-accent hover:text-accent-hover transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
