'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PLAN_PRICES, PLAN_NAMES } from '@/lib/constants'
import type { Plan } from '@/types'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

const PLANS = [
  {
    id: 'free' as Plan,
    features: ['1 Business Validation / one time', '1 Competitor Research / one time', '1 Ideas session / one time', '1 Pitch Evaluation / one time', '5 AI Chat messages / one time'],
  },
  {
    id: 'builder' as Plan,
    features: [
      '5 Business Validations / day',
      '5 Competitor Research / day',
      '5 Ideas sessions / day',
      '5 Pitch Evaluations / day',
      '10 AI Chat messages / day',
      'All Indian languages',
      'Saved reports — unlimited',
    ],
  },
  {
    id: 'founder_pro' as Plan,
    features: [
      '10 Business Validations / day',
      '10 Competitor Research / day',
      '10 Ideas sessions / day',
      '10 Pitch Evaluations / day',
      '15 AI Chat messages / day',
      'Priority AI',
      'Export reports as PDF',
      'Early access',
    ],
  },
]

export default function PricingPage() {
  const { profile, refreshProfile } = useAuth()
  const [paying, setPaying] = useState<Plan | null>(null)
  const [payError, setPayError] = useState<string | null>(null)

  const handleUpgrade = async (plan: Plan) => {
    if (plan === 'free') return
    setPaying(plan)
    setPayError(null)

    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()
      if (!res.ok || !data.orderId) {
        throw new Error(data.error || 'Could not create order. Please try again.')
      }

      const { orderId, amount } = data

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)

      script.onerror = () => {
        setPaying(null)
        setPayError('Could not load payment gateway. Check your connection and try again.')
      }

      script.onload = () => {
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount,
          currency: 'INR',
          order_id: orderId,
          name: 'Thinkior AI',
          description: `${PLAN_NAMES[plan]} Plan`,
          theme: { color: '#3FE0B0' },
          handler: async (response: Record<string, string>) => {
            try {
              const verifyRes = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...response, plan }),
              })
              if (!verifyRes.ok) throw new Error('Payment verification failed.')
              await refreshProfile()
            } catch {
              setPayError('Payment recorded but plan update failed. Contact support.')
            } finally {
              setPaying(null)
            }
          },
          modal: { ondismiss: () => setPaying(null) },
        })
        rzp.open()
      }
    } catch (err) {
      setPaying(null)
      setPayError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
    }
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <p className="eyebrow mb-3">Plans</p>
        <h1 className="font-display font-bold text-3xl text-fg tracking-tighter leading-tight mb-2">
          Choose your plan
        </h1>
        <p className="text-sm text-fg-dim">
          Current plan:{' '}
          <span className="text-accent font-medium">
            {PLAN_NAMES[profile?.plan ?? 'free']}
          </span>
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrentPlan = profile?.plan === plan.id
          const isHighlighted = plan.id === 'founder_pro'
          const price = PLAN_PRICES[plan.id]

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 flex flex-col transition-all duration-500 ${
                isHighlighted
                  ? 'bg-bg-elevated border-2 border-accent shadow-glow-accent'
                  : 'card-premium hover:bg-bg-elevated'
              }`}
            >
              {isHighlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-bg px-3 py-1 font-mono text-[10px] tracking-caps uppercase font-semibold rounded-full">
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display font-semibold text-xl text-fg mb-3 tracking-tight">
                  {PLAN_NAMES[plan.id]}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-4xl text-fg tabular tracking-tighter">
                    ₹{price}
                  </span>
                  {price > 0 && (
                    <span className="text-fg-muted text-sm ml-1">/mo</span>
                  )}
                </div>
              </div>

              <div className="h-px w-full bg-line mb-6" />

              <ul className="space-y-2.5 flex-1 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-fg leading-snug">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        isHighlighted ? 'text-accent' : 'text-fg-dim'
                      }`}
                      strokeWidth={2.5}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <div className="w-full text-center bg-bg text-fg-muted font-mono text-[11px] tracking-caps uppercase py-3 rounded-md border border-line">
                  Current plan
                </div>
              ) : plan.id === 'free' ? (
                <div className="w-full text-center bg-bg text-fg-muted font-mono text-[11px] tracking-caps uppercase py-3 rounded-md border border-line">
                  Free forever
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={paying !== null}
                  className={`btn-shine group w-full flex items-center justify-center gap-2 font-semibold text-sm py-3 rounded-md transition-all duration-300 disabled:opacity-60 ${
                    isHighlighted
                      ? 'bg-accent text-bg hover:bg-accent-hover'
                      : 'bg-bg border border-line hover:border-line-strong text-fg'
                  }`}
                >
                  {paying === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    `Upgrade to ${PLAN_NAMES[plan.id]}`
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {payError && (
        <p className="text-sm text-red-400 text-center bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {payError}
        </p>
      )}

      <p className="text-xs text-fg-muted text-center">
        All payments via Razorpay
      </p>
    </div>
  )
}
