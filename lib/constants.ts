import type { PlanLimits, Plan } from '@/types'

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    validator: 1,    // 1 free Business Validation / lifetime
    competitor: 1,   // 1 free Competitor Intel run / lifetime
    ideas: 1,        // 1 free Ideas session / lifetime
    pitch: 1,        // 1 free Pitch Evaluation / lifetime
    chat: 5,         // 5 AI Chat messages / lifetime
    report: 0,       // Locked — Founder Pro only
  },
  builder: {
    validator: 5,    // 5 Business Validations / day
    competitor: 5,   // 5 Competitor Research / day
    ideas: 5,        // 5 Ideas sessions / day
    pitch: 5,        // 5 Pitch Evaluations / day
    chat: 10,        // 10 AI Chat messages / day
    report: 0,       // Locked — Founder Pro only
  },
  founder_pro: {
    validator: 10,   // 10 Business Validations / day
    competitor: 10,  // 10 Competitor Research / day
    ideas: 10,       // 10 Ideas sessions / day
    pitch: 10,       // 10 Pitch Evaluations / day
    chat: 15,        // 15 AI Chat messages / day
    report: 3,       // 3 Business Reports / day
  },
}

/**
 * Plan-gated features — features that require a minimum plan tier regardless
 * of daily quota. The route handlers check this BEFORE checking the daily
 * count so locked plans return a clear "upgrade required" error.
 *
 * As of Phase 2: competitor research is NOT plan-gated. Free users get
 * 1 lifetime run, then the freemium gate takes over. This makes the
 * funnel smoother — they get a taste before being asked to pay.
 */
export const PLAN_GATED_FEATURES: Partial<Record<keyof PlanLimits, Plan>> = {
  report: 'founder_pro',     // free + builder cannot use business reports
}

export const PLAN_PRICES: Record<Plan, number> = {
  free: 0,
  builder: 299,
  founder_pro: 599,
}

export const PLAN_NAMES: Record<Plan, string> = {
  free: 'Free',
  builder: 'Builder',
  founder_pro: 'Founder Pro',
}

export const FEATURE_NAMES: Record<string, string> = {
  validator: 'Business Validator',
  competitor: 'Competitor Research',
  ideas: 'Business Ideas',
  pitch: 'Pitch Deck Evaluator',
  chat: 'AI Chat',
  report: 'Business Report',
}

export const APP_NAME = 'Thinkior AI'
export const APP_TAGLINE = 'Your idea deserves the truth.'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://thinkiorai.com'
export const CONTACT_EMAIL = 'hello@thinkior.com'
