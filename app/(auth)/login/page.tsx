'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

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
      {/* Mesh background */}
      <div className="mesh-bg" />

      {/* Left: form */}
      <div className="flex items-center justify-center px-5 sm:px-8 py-12 lg:py-0 relative">
        <div className="w-full max-w-sm animate-fade-in">
          <Link href="/" className="inline-flex items-baseline gap-2 mb-12">
            <span className="wordmark text-fg text-2xl">Thinkior</span>
            <span className="wordmark-ai text-[22px]">Ai</span>
          </Link>

          <h1 className="font-display font-bold text-4xl text-fg tracking-tighter leading-[1.05] mb-3">
            Welcome back,<br />
            <span className="font-serif-italic font-normal text-accent">founder.</span>
          </h1>
          <p className="text-base text-fg-dim mb-9 leading-relaxed">
            Pick up where you left off.
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
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
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
              className="btn-shine group w-full flex items-center justify-center gap-2 bg-fg text-bg hover:bg-fg/90 disabled:opacity-50 font-semibold py-3.5 rounded-md transition-all mt-6"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-fg-muted mt-8">
            New to Thinkior?{' '}
            <Link
              href="/signup"
              className="text-accent hover:text-accent-hover transition-colors font-medium"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right: visual */}
      <div className="hidden lg:flex items-center justify-center px-12 border-l border-line bg-bg-sub relative overflow-hidden">
        <div className="mesh-bg" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative max-w-md">
          <div className="inline-flex items-center gap-2 bg-bg-card border border-line rounded-full px-3 py-1.5 mb-8">
            <Sparkles className="w-3 h-3 text-accent" />
            <span className="text-xs text-fg-dim">1,832 founders, 47 cities</span>
          </div>

          <blockquote className="font-display font-medium text-3xl text-fg leading-[1.2] tracking-tight mb-8">
            &ldquo;Most founder failures aren&apos;t failures of effort. They&apos;re failures of
            <span className="text-accent"> honest counsel</span> at the moment it mattered most.&rdquo;
          </blockquote>

          <div className="flex items-center gap-3 pt-6 border-t border-line">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-signal-insight flex items-center justify-center font-display font-bold text-bg">
              T
            </div>
            <div>
              <p className="font-display font-semibold text-sm text-fg leading-tight">Thinkior AI</p>
              <p className="text-xs text-fg-muted mt-0.5 font-mono uppercase tracking-wider">
                The Founder Brief · 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
