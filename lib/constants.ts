import type { PlanLimits, Plan } from '@/types'

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    validator: 1,    // 1 Business Validation / one time
    competitor: 1,   // 1 Competitor Research / one time
    ideas: 1,        // 1 Ideas session / one time
    pitch: 1,        // 1 Pitch Evaluation / one time
    chat: 5,         // 5 AI Chat messages / one time
    report: 1,
  },
  builder: {
    validator: 5,    // 5 Business Validations / day
    competitor: 5,   // 5 Competitor Research / day
    ideas: 5,        // 5 Ideas sessions / day
    pitch: 5,        // 5 Pitch Evaluations / day
    chat: 10,        // 10 AI Chat messages / day
    report: 5,
  },
  founder_pro: {
    validator: 10,   // 10 Business Validations / day
    competitor: 10,  // 10 Competitor Research / day
    ideas: 10,       // 10 Ideas sessions / day
    pitch: 10,       // 10 Pitch Evaluations / day
    chat: 15,        // 15 AI Chat messages / day
    report: 10,
  },
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
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://thinkior.com'
export const CONTACT_EMAIL = 'hello@thinkior.com'
