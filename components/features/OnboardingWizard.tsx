'use client'

/**
 * THINKIOR AI — ONBOARDING WIZARD (3 STEPS)
 * ─────────────────────────────────────────────────────────────────
 * Step 1: Your name + startup name + idea description
 * Step 2: Which domain / space
 * Step 3: Who is your first customer
 * Saves to Supabase `founder_profiles` table.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ────────────────────────────────────────────────────────
interface FounderProfile {
  user_id: string
  founder_name: string
  idea_name: string
  idea_description: string
  domain: string
  target_customer: string
  onboarding_completed: boolean
  created_at?: string
}

// ── Constants ────────────────────────────────────────────────────
const DOMAINS = [
  'FinTech / Payments',
  'EdTech',
  'HealthTech / MedTech',
  'AgriTech',
  'D2C / E-Commerce',
  'SaaS / B2B Software',
  'Logistics / Supply Chain',
  'CleanTech / EV',
  'FoodTech',
  'Real Estate / PropTech',
  'Gaming / Entertainment',
  'Other',
]

const STEPS = [
  {
    id: 'intro',
    title: 'Tell us about you',
    subtitle: 'Your name and the startup idea you want to validate.',
  },
  {
    id: 'domain',
    title: 'Which space are you in?',
    subtitle: 'Pick the closest category to your startup.',
  },
  {
    id: 'customer',
    title: "Who's your first customer?",
    subtitle: "Not 'everyone'. The one person who needs this most.",
  },
]

// ── Main Component ───────────────────────────────────────────────
export default function OnboardingWizard() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [profile, setProfile] = useState<Partial<FounderProfile>>({
    founder_name: '',
    idea_name: '',
    idea_description: '',
    domain: '',
    target_customer: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        // Pre-fill name from auth metadata if available
        const authName = data.user.user_metadata?.full_name || ''
        if (authName) {
          setProfile((prev) => ({ ...prev, founder_name: authName }))
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const progress = ((step + 1) / STEPS.length) * 100

  const update = (key: keyof FounderProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return (
          (profile.founder_name?.trim().length ?? 0) >= 2 &&
          (profile.idea_name?.trim().length ?? 0) >= 2 &&
          (profile.idea_description?.trim().length ?? 0) >= 10
        )
      case 1:
        return !!profile.domain
      case 2:
        return (profile.target_customer?.trim().length ?? 0) >= 5
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (!canProceed()) return
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      await handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { error } = await supabase.from('founder_profiles').upsert({
        user_id: userId,
        founder_name: profile.founder_name,
        idea_name: profile.idea_name,
        idea_description: profile.idea_description,
        domain: profile.domain,
        target_customer: profile.target_customer,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
      })
      if (error) throw error
      router.push('/dashboard')
    } catch {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    if (!userId) return
    await supabase.from('founder_profiles').upsert({
      user_id: userId,
      onboarding_completed: true,
      created_at: new Date().toISOString(),
    })
    router.push('/dashboard')
  }

  return (
    <div className="onboarding-root">
      {/* Mesh background */}
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-orb mesh-orb-1" />
        <div className="mesh-orb mesh-orb-2" />
      </div>

      <div className="onboarding-container">
        {/* Header */}
        <div className="onboarding-header">
          <div className="brand-mark">
            <span className="brand-icon">⚡</span>
            <span className="brand-name">Thinkior</span>
          </div>
          <button className="skip-btn" onClick={handleSkip}>
            Skip for now
          </button>
        </div>

        {/* Step indicators */}
        <div className="step-dots">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemax={STEPS.length}
        >
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="progress-label">
          Step {step + 1} of {STEPS.length}
        </p>

        {/* Step card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="step-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <h1 className="step-title">{STEPS[step].title}</h1>
            <p className="step-subtitle">{STEPS[step].subtitle}</p>

            <div className="step-content">
              {/* ── Step 0: Intro — name + startup + idea ── */}
              {step === 0 && (
                <div className="input-group">
                  <div className="field-wrap">
                    <label className="field-label">Your name</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="e.g. Rohan Mehta"
                      value={profile.founder_name ?? ''}
                      onChange={(e) => update('founder_name', e.target.value)}
                      maxLength={60}
                      autoFocus
                    />
                  </div>

                  <div className="field-wrap">
                    <label className="field-label">Startup name</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="e.g. KiranaOS, MediBot, GreenRide"
                      value={profile.idea_name ?? ''}
                      onChange={(e) => update('idea_name', e.target.value)}
                      maxLength={80}
                    />
                  </div>

                  <div className="field-wrap">
                    <label className="field-label">What problem are you solving?</label>
                    <textarea
                      className="textarea-input"
                      placeholder="Describe what problem you're solving and who you're solving it for. Be specific."
                      value={profile.idea_description ?? ''}
                      onChange={(e) => update('idea_description', e.target.value)}
                      rows={4}
                      maxLength={500}
                    />
                    <div className="char-count">{profile.idea_description?.length ?? 0}/500</div>
                  </div>
                </div>
              )}

              {/* ── Step 1: Domain ── */}
              {step === 1 && (
                <div className="chip-grid">
                  {DOMAINS.map((d) => (
                    <button
                      key={d}
                      className={`chip ${profile.domain === d ? 'chip-selected' : ''}`}
                      onClick={() => update('domain', d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Step 2: Target customer ── */}
              {step === 2 && (
                <div className="input-group">
                  <textarea
                    className="textarea-input"
                    placeholder="e.g. A 35-year-old kirana store owner in Tier-2 cities who is losing customers to Blinkit but can't afford a tech team."
                    value={profile.target_customer ?? ''}
                    onChange={(e) => update('target_customer', e.target.value)}
                    rows={5}
                    maxLength={400}
                    autoFocus
                  />
                  <div className="customer-hint">
                    💡 The more specific you are, the sharper Thinkior&apos;s analysis will be.
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              className={`cta-btn ${!canProceed() ? 'cta-disabled' : ''}`}
              onClick={handleNext}
              disabled={!canProceed() || loading}
            >
              {loading
                ? 'Setting up your workspace…'
                : step === STEPS.length - 1
                  ? 'Enter Thinkior →'
                  : 'Continue →'}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Styles */}
      <style jsx>{`
        .onboarding-root {
          min-height: 100vh;
          background: #0a0a0b;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }
        .mesh-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .mesh-orb { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.18; }
        .mesh-orb-1 { width: 600px; height: 600px; background: #3fe0b0; top: -200px; right: -200px; animation: spin1 18s linear infinite; }
        .mesh-orb-2 { width: 500px; height: 500px; background: #a78bfa; bottom: -180px; left: -150px; animation: spin2 24s linear infinite reverse; }
        @keyframes spin1 { to { transform: rotate(360deg); } }
        @keyframes spin2 { to { transform: rotate(360deg); } }
        .onboarding-container { width: 100%; max-width: 560px; position: relative; z-index: 1; }
        .onboarding-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
        .brand-mark { display: flex; align-items: center; gap: 8px; }
        .brand-icon { font-size: 20px; }
        .brand-name { font-size: 18px; font-weight: 700; color: #3fe0b0; letter-spacing: -0.5px; }
        .skip-btn { font-size: 13px; color: #555; background: none; border: none; cursor: pointer; padding: 4px 8px; transition: color 0.2s; }
        .skip-btn:hover { color: #888; }

        /* Step dots */
        .step-dots { display: flex; gap: 8px; margin-bottom: 16px; justify-content: center; }
        .step-dot { width: 28px; height: 4px; border-radius: 2px; background: #1e1e22; transition: all 0.3s ease; }
        .step-dot.active { background: #3fe0b0; width: 48px; }
        .step-dot.done { background: #3fe0b0; opacity: 0.4; }

        .progress-track { height: 2px; background: #1e1e22; border-radius: 2px; overflow: hidden; margin-bottom: 6px; }
        .progress-fill { height: 100%; background: linear-gradient(to right, #3fe0b0, #7dd3fc); border-radius: 2px; transition: width 0.5s ease; }
        .progress-label { font-size: 11px; color: #444; margin-bottom: 20px; text-align: right; }

        .step-card { background: #17171b; border: 1px solid #2a2a30; border-radius: 20px; padding: 40px 36px; }
        .step-title { font-size: 26px; font-weight: 700; color: #f0f0f0; letter-spacing: -0.8px; margin: 0 0 8px; line-height: 1.2; }
        .step-subtitle { font-size: 14px; color: #555; margin: 0 0 28px; }

        .input-group { display: flex; flex-direction: column; gap: 16px; }
        .field-wrap { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 12px; font-weight: 600; color: #666; letter-spacing: 0.3px; text-transform: uppercase; }
        .text-input, .textarea-input { width: 100%; background: #0f0f12; border: 1px solid #2a2a30; border-radius: 12px; color: #e0e0e0; font-size: 15px; padding: 14px 16px; outline: none; transition: border-color 0.2s; font-family: inherit; resize: none; box-sizing: border-box; }
        .text-input:focus, .textarea-input:focus { border-color: #3fe0b0; }
        .text-input::placeholder, .textarea-input::placeholder { color: #333; }
        .char-count { font-size: 11px; color: #333; text-align: right; }
        .customer-hint { font-size: 13px; color: #3fe0b0; background: rgba(63, 224, 176, 0.08); border-radius: 8px; padding: 10px 14px; }

        .chip-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .chip { background: #0f0f12; border: 1px solid #2a2a30; border-radius: 100px; color: #888; font-size: 13px; padding: 8px 16px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .chip:hover { border-color: #3fe0b0; color: #3fe0b0; }
        .chip-selected { background: rgba(63, 224, 176, 0.12); border-color: #3fe0b0; color: #3fe0b0; }

        .cta-btn { margin-top: 32px; width: 100%; background: #3fe0b0; color: #0a0a0b; font-size: 15px; font-weight: 700; padding: 16px; border: none; border-radius: 12px; cursor: pointer; transition: all 0.2s; letter-spacing: -0.3px; }
        .cta-btn:hover:not(.cta-disabled) { background: #34cba0; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(63, 224, 176, 0.25); }
        .cta-disabled { opacity: 0.35; cursor: not-allowed; }

        @media (max-width: 600px) {
          .step-card { padding: 28px 20px; }
          .step-title { font-size: 22px; }
        }
      `}</style>
    </div>
  )
}
