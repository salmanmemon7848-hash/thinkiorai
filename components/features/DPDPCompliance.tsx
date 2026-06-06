'use client'

/**
 * THINKIOR AI — DPDP ACT 2023 COMPLIANCE SYSTEM
 * ─────────────────────────────────────────────────────────────────
 * ConsentBanner — shows once on first login, saves to Supabase
 * DataDeletionSection — for Settings page (DPDP right to erasure)
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Types ────────────────────────────────────────────────────────
interface ConsentState {
  functional: boolean
  analytics: boolean
  marketing: boolean
  timestamp: string
  version: string
}

const CONSENT_VERSION = '1.0'

// ════════════════════════════════════════════════════════════════
// CONSENT BANNER COMPONENT
// ════════════════════════════════════════════════════════════════

interface ConsentBannerProps {
  onComplete: () => void
}

export function ConsentBanner({ onComplete }: ConsentBannerProps) {
  const supabase = createClient()
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('thinkior_consent_version')
    if (stored !== CONSENT_VERSION) {
      setTimeout(() => setVisible(true), 800)
    } else {
      onComplete()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveConsent = async (accepted: boolean) => {
    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const consent: ConsentState = {
      functional: true,
      analytics: accepted ? analytics : false,
      marketing: accepted ? marketing : false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    }

    if (user) {
      await supabase.from('user_consents').upsert({
        user_id: user.id,
        ...consent,
        consent_version: CONSENT_VERSION,
        consented_at: consent.timestamp,
      })
    }

    localStorage.setItem('thinkior_consent_version', CONSENT_VERSION)
    localStorage.setItem('thinkior_consent', JSON.stringify(consent))

    setVisible(false)
    setTimeout(onComplete, 300)
    setSaving(false)
  }

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div className="consent-backdrop" aria-hidden="true" />

      <div
        className="consent-banner"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
      >
        <div className="consent-inner">
          {/* Top line */}
          <div className="consent-top">
            <div className="consent-brand">
              <span className="consent-icon">🔒</span>
              <span className="consent-title" id="consent-title">
                Before we start
              </span>
            </div>
            <span className="consent-badge">DPDP Act 2023</span>
          </div>

          {/* Plain-language notice */}
          <p className="consent-body">
            Thinkior stores your startup idea and AI conversations to personalise your experience.
            We <strong>never sell your data</strong> or use it to train AI models without your
            consent. Your ideas are encrypted at rest.
          </p>

          {/* Expandable details */}
          <button
            className="consent-expand-btn"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? 'Hide details ↑' : 'What exactly do we store? ↓'}
          </button>

          {expanded && (
            <div className="consent-details">
              <div className="consent-data-item">
                <div className="consent-data-dot required" />
                <div>
                  <strong>Required (always on)</strong>
                  <p>
                    Your account info, startup profile, AI conversations. Needed to run the product.
                    Stored in Supabase (Mumbai region, India). Deleted when you delete your account.
                  </p>
                </div>
              </div>

              <div className="consent-data-item">
                <div className="consent-toggle-wrap">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="toggle-input"
                    />
                    <span className="toggle-track">
                      <span className="toggle-thumb" />
                    </span>
                  </label>
                </div>
                <div>
                  <strong>Usage analytics (optional)</strong>
                  <p>
                    Which features you use, how often. Helps us improve Thinkior. Anonymous — not
                    linked to your idea content.
                  </p>
                </div>
              </div>

              <div className="consent-data-item">
                <div className="consent-toggle-wrap">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      className="toggle-input"
                    />
                    <span className="toggle-track">
                      <span className="toggle-thumb" />
                    </span>
                  </label>
                </div>
                <div>
                  <strong>Product updates (optional)</strong>
                  <p>
                    Emails about new features, India startup insights. Max 2/month. Unsubscribe any
                    time.
                  </p>
                </div>
              </div>

              <div className="consent-legal">
                <p>
                  You can delete your data anytime from Settings → Privacy. Questions? Email{' '}
                  <a href="mailto:privacy@thinkior.ai">privacy@thinkior.ai</a>
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="consent-actions">
            <button
              className="consent-btn-secondary"
              onClick={() => saveConsent(false)}
              disabled={saving}
            >
              Essential only
            </button>
            <button
              className="consent-btn-primary"
              onClick={() => saveConsent(true)}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Accept & continue →'}
            </button>
          </div>

          <p className="consent-fine">
            By continuing you agree to our{' '}
            <a href="/privacy" target="_blank">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/terms" target="_blank">
              Terms of Service
            </a>
            .
          </p>
        </div>
      </div>

      <style jsx>{`
        .consent-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(10, 10, 11, 0.6);
          backdrop-filter: blur(4px);
          z-index: 998;
        }
        .consent-banner {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 32px);
          max-width: 560px;
          z-index: 999;
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
        }
        .consent-inner {
          background: #17171b;
          border: 1px solid #2a2a30;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
        }
        .consent-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .consent-brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .consent-icon {
          font-size: 16px;
        }
        .consent-title {
          font-size: 15px;
          font-weight: 700;
          color: #f0f0f0;
        }
        .consent-badge {
          font-size: 10px;
          font-weight: 700;
          color: #3fe0b0;
          background: rgba(63, 224, 176, 0.12);
          border: 1px solid rgba(63, 224, 176, 0.25);
          padding: 3px 8px;
          border-radius: 100px;
          letter-spacing: 0.5px;
        }
        .consent-body {
          font-size: 13px;
          color: #888;
          line-height: 1.6;
          margin: 0 0 12px;
        }
        .consent-body strong {
          color: #c0c0c0;
        }
        .consent-expand-btn {
          font-size: 12px;
          color: #3fe0b0;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-bottom: 0;
        }
        .consent-details {
          margin-top: 16px;
          border-top: 1px solid #2a2a30;
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .consent-data-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .consent-data-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 5px;
        }
        .consent-data-dot.required {
          background: #3fe0b0;
        }
        .consent-data-item strong {
          font-size: 13px;
          color: #c0c0c0;
          display: block;
          margin-bottom: 3px;
        }
        .consent-data-item p {
          font-size: 12px;
          color: #555;
          line-height: 1.5;
          margin: 0;
        }
        .consent-toggle-wrap {
          flex-shrink: 0;
          padding-top: 2px;
        }
        .toggle-label {
          display: block;
          cursor: pointer;
        }
        .toggle-input {
          display: none;
        }
        .toggle-track {
          display: block;
          width: 32px;
          height: 18px;
          background: #2a2a30;
          border-radius: 9px;
          position: relative;
          transition: background 0.2s;
        }
        .toggle-input:checked + .toggle-track {
          background: #3fe0b0;
        }
        .toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.2s;
        }
        .toggle-input:checked + .toggle-track .toggle-thumb {
          transform: translateX(14px);
        }
        .consent-legal {
          background: #0f0f12;
          border-radius: 8px;
          padding: 10px 12px;
        }
        .consent-legal p {
          font-size: 11px;
          color: #444;
          margin: 0;
        }
        .consent-legal a {
          color: #3fe0b0;
          text-decoration: none;
        }
        .consent-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .consent-btn-secondary {
          flex: 1;
          padding: 12px;
          background: #0f0f12;
          border: 1px solid #2a2a30;
          color: #888;
          font-size: 13px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .consent-btn-secondary:hover {
          border-color: #444;
          color: #c0c0c0;
        }
        .consent-btn-primary {
          flex: 2;
          padding: 12px;
          background: #3fe0b0;
          border: none;
          color: #0a0a0b;
          font-size: 13px;
          font-weight: 700;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .consent-btn-primary:hover {
          background: #34cba0;
        }
        .consent-btn-primary:disabled,
        .consent-btn-secondary:disabled {
          opacity: 0.5;
        }
        .consent-fine {
          font-size: 11px;
          color: #333;
          text-align: center;
          margin: 12px 0 0;
        }
        .consent-fine a {
          color: #444;
        }
        @media (max-width: 480px) {
          .consent-actions {
            flex-direction: column;
          }
          .consent-btn-secondary,
          .consent-btn-primary {
            flex: none;
          }
        }
      `}</style>
    </>
  )
}

// ════════════════════════════════════════════════════════════════
// DATA DELETION COMPONENT (required by DPDP Act)
// Add to Settings page
// ════════════════════════════════════════════════════════════════

export function DataDeletionSection() {
  const supabase = createClient()
  const [deleting, setDeleting] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [done, setDone] = useState(false)

  const requestDeletion = async () => {
    setDeleting(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Log deletion request (for compliance audit trail)
    await supabase.from('data_deletion_requests').insert({
      user_id: user.id,
      requested_at: new Date().toISOString(),
      status: 'pending',
    })

    // Immediately clear founder data
    await supabase.from('founder_profiles').delete().eq('user_id', user.id)
    await supabase.from('founder_sessions').delete().eq('user_id', user.id)
    await supabase.from('user_consents').delete().eq('user_id', user.id)

    localStorage.removeItem('thinkior_consent')
    localStorage.removeItem('thinkior_consent_version')

    setDone(true)
    setTimeout(() => supabase.auth.signOut(), 2000)
  }

  if (done) {
    return (
      <p className="text-accent text-sm">✓ Your data has been deleted. Signing you out…</p>
    )
  }

  return (
    <div className="border-t border-line pt-6 mt-6">
      <h3 className="text-signal-rose text-sm font-bold mb-2">Delete my data</h3>
      <p className="text-fg-muted text-[13px] mb-4">
        Permanently deletes your startup profile, all AI sessions, and your account. This cannot be
        undone. As required by DPDP Act 2023.
      </p>
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="bg-signal-rose/10 border border-signal-rose/30 text-signal-rose px-[18px] py-[10px] rounded-lg text-[13px] cursor-pointer hover:bg-signal-rose/20 transition-colors"
        >
          Request data deletion
        </button>
      ) : (
        <div className="flex gap-[10px]">
          <button
            onClick={() => setConfirm(false)}
            className="bg-bg-card border border-line text-fg-muted px-4 py-[10px] rounded-lg text-[13px] cursor-pointer hover:border-fg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={requestDeletion}
            disabled={deleting}
            className="bg-signal-rose border-none text-bg px-[18px] py-[10px] rounded-lg text-[13px] font-bold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Yes, delete everything'}
          </button>
        </div>
      )}
    </div>
  )
}
