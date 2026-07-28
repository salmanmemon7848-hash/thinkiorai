import { z } from 'zod'

const sourceRefSchema = z.object({
  sourceIndex: z.number().int().positive(),
  fact: z.string().trim().min(8).max(320),
})

export const leadModelSchema = z.object({
  name: z.string().trim().min(2).max(140),
  website: z.string().url().nullable().optional(),
  location: z.string().trim().max(140).nullable().optional(),
  fit: z.string().trim().min(16).max(360),
  confidence: z.enum(['source_backed', 'ai_inferred']),
  contactPath: z.string().trim().min(2).max(80),
  contactUrl: z.string().url().nullable().optional(),
  evidence: z.array(sourceRefSchema).min(1).max(3),
})

export const leadSearchModelSchema = z.object({
  summary: z.string().trim().max(360).default(''),
  leads: z.array(leadModelSchema).max(10),
})

export type LeadModelResult = z.infer<typeof leadSearchModelSchema>

export function requestedLeadCount(input: string): number | null {
  const match = input.match(/\b(10|[1-9])\s+(?:qualified\s+|relevant\s+)?leads?\b/i)
  return match ? Number(match[1]) : null
}

export function isSafePublicUrl(value: string | null | undefined): value is string {
  if (!value) return false
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}
