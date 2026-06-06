import type { PlanLimits, Plan } from '@/types'

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    validator: 2,
    competitor: 1,
    ideas: 3,
    pitch: 1,
    chat: 10,
    report: 1,
  },
  builder: {
    validator: 10,
    competitor: 5,
    ideas: 15,
    pitch: 5,
    chat: 30,
    report: 5,
  },
  founder_pro: {
    validator: 30,
    competitor: 20,
    ideas: 50,
    pitch: 20,
    chat: 100,
    report: 20,
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
