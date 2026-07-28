/**
 * THINKIOR — STRUCTURED CARD SCHEMAS
 * ─────────────────────────────────────────────────────────────────
 * The frontend parses `<!-- THINKIOR_CARD: {...} -->` and
 * `<!-- THINKIOR_PREVIEW: {...} -->` blocks out of LLM responses and
 * renders them as rich components. These Zod schemas define the
 * contract; any field that doesn't validate falls back to a degraded
 * render with a clear error to the user.
 * ─────────────────────────────────────────────────────────────────
 */

import { z } from 'zod'

// ── Validator Card (full report) ───────────────────────────────

export const ValidatorScoresSchema = z.object({
  market: z.number().int().min(0).max(100),
  competition: z.number().int().min(0).max(100),
  execution: z.number().int().min(0).max(100),
  monetization: z.number().int().min(0).max(100),
  // NOTE: risk is INVERTED — 100 means very LOW risk
  risk: z.number().int().min(0).max(100),
})
export type ValidatorScores = z.infer<typeof ValidatorScoresSchema>

export const ValidatorIndiaBlockSchema = z.object({
  tam: z.string().max(200).default(''),
  sam: z.string().max(200).default(''),
  som_year1: z.string().max(200).default(''),
  regulatory: z.string().max(200).default(''),
  unit_econ: z.string().max(200).default(''),
  geo_fit: z.string().max(200).default(''),
})
export type ValidatorIndiaBlock = z.infer<typeof ValidatorIndiaBlockSchema>

export const ValidatorCardSchema = z.object({
  score: z.number().int().min(0).max(100),
  verdict: z.enum(['GO', 'PIVOT', 'KILL']),
  confidence: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  tagline: z.string().max(140).default(''),
  scores: ValidatorScoresSchema,
  why_this_score: z.string().max(500).default(''),
  kill_to_pivot: z.string().max(300).nullable().default(null),
  pivot_to_go: z.string().max(300).nullable().default(null),
  next_7_days: z.array(z.string().max(140)).length(3).default(['', '', '']),
  india: ValidatorIndiaBlockSchema,
  first_customer: z.string().max(200).default(''),
  first_revenue: z.string().max(200).default(''),
})
export type ValidatorCard = z.infer<typeof ValidatorCardSchema>

// ── Fast Preview Card (free teaser) ───────────────────────────

export const ValidatorPreviewSchema = z.object({
  score: z.number().int().min(0).max(100),
  verdict: z.enum(['GO', 'PIVOT', 'KILL']),
  tagline: z.string().max(110).default(''),
  reasons: z.array(z.string().max(110)).length(3).default(['', '', '']),
  tip: z.string().max(140).default(''),
})
export type ValidatorPreview = z.infer<typeof ValidatorPreviewSchema>

// ── Competitor Card (battlefield map) ──────────────────────────

export const CompetitorEntrySchema = z.object({
  name: z.string().max(80).default(''),
  type: z.enum(['Direct', 'Indirect', 'Global']).default('Direct'),
  one_liner: z.string().max(160).default(''),
  weakness: z.string().max(160).default(''),
  funding: z.string().max(160).default(''),
  why_matters: z.string().max(200).default(''),
})
export type CompetitorEntry = z.infer<typeof CompetitorEntrySchema>

export const CompetitorBattlefieldSchema = z.object({
  leader: z.string().max(120).default(''),
  niche: z.array(z.string().max(120)).max(4).default([]),
  weak: z.array(z.string().max(120)).max(4).default([]),
  unmet: z.string().max(280).default(''),
})
export type CompetitorBattlefield = z.infer<typeof CompetitorBattlefieldSchema>

export const CompetitorPricingSchema = z.object({
  range: z.string().max(160).default(''),
  gap: z.string().max(200).default(''),
})
export type CompetitorPricing = z.infer<typeof CompetitorPricingSchema>

export const CompetitorPositioningSchema = z.object({
  compete_where: z.string().max(240).default(''),
  dont_compete_where: z.string().max(240).default(''),
  angle_to_own: z.string().max(200).default(''),
  first_audience: z.string().max(240).default(''),
})
export type CompetitorPositioning = z.infer<typeof CompetitorPositioningSchema>

export const CompetitorCardSchema = z.object({
  headline: z.string().max(160).default(''),
  battlefield: CompetitorBattlefieldSchema,
  competitors: z.array(CompetitorEntrySchema).min(1).max(8).default([]),
  pricing: CompetitorPricingSchema,
  complaints: z.array(z.string().max(160)).max(4).default([]),
  positioning: CompetitorPositioningSchema,
  white_space: z.string().max(280).default(''),
})
export type CompetitorCard = z.infer<typeof CompetitorCardSchema>

// ── Pitch Card (investor-grade scorecard) ──────────────────────

// ── Ideas Card (5-question flow OR specific plan + decision) ───

export const IdeasQuestionSchema = z.object({
  q: z.string().max(220).default(''),
  why: z.string().max(140).default(''),
})
export type IdeasQuestion = z.infer<typeof IdeasQuestionSchema>

export const IdeasCardSchema = z
  .object({
    mode: z.enum(['vague', 'specific']),

    // Vague mode
    questions: z.array(IdeasQuestionSchema).length(5).optional(),

    // Specific mode
    first_customer: z.string().max(240).optional(),
    first_product: z.string().max(240).optional(),
    first_offer: z.string().max(240).optional(),
    first_pricing: z.string().max(240).optional(),
    first_revenue: z.string().max(280).optional(),
    launch_channel: z.string().max(240).optional(),

    // Common
    decision: z.enum(['build', 'pivot', 'dont_start_yet']),
    decision_reason: z.string().max(240).default(''),
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'vague') {
      if (!data.questions || data.questions.length !== 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'vague mode requires exactly 5 questions',
          path: ['questions'],
        })
      }
    }
    if (data.mode === 'specific') {
      const required = [
        'first_customer',
        'first_product',
        'first_offer',
        'first_pricing',
        'first_revenue',
        'launch_channel',
      ] as const
      for (const k of required) {
        if (!data[k] || (data[k] as string).trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `specific mode requires ${k}`,
            path: [k],
          })
        }
      }
    }
  })
export type IdeasCard = z.infer<typeof IdeasCardSchema>
