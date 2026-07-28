import { z } from 'zod'

export const marketingPlatformSchema = z.enum(['instagram', 'facebook', 'youtube', 'linkedin'])
export const marketingPackStatusSchema = z.enum(['planned', 'created', 'published', 'learned'])

export const marketingBriefSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  offer: z.string().trim().min(8).max(1000),
  audience: z.string().trim().min(5).max(500),
  country: z.string().trim().min(2).max(100),
  goal: z.string().trim().min(2).max(120),
  capacity: z.string().trim().min(2).max(120),
  stage: z.string().trim().min(2).max(120),
  currentChannels: z.string().trim().max(500).optional().default(''),
  platforms: z.array(marketingPlatformSchema).min(1).max(4),
})

export const roadmapModelSchema = z.object({
  objective: z.string().min(5).max(220),
  positioning: z.string().min(10).max(700),
  audienceInsight: z.string().min(10).max(700),
  contentPillars: z.array(z.string().min(3).max(140)).min(3).max(5),
  platformRoles: z.object({
    instagram: z.string().min(5).max(280).optional(),
    facebook: z.string().min(5).max(280).optional(),
    youtube: z.string().min(5).max(280).optional(),
    linkedin: z.string().min(5).max(280).optional(),
  }),
  weeklyFocus: z.string().min(5).max(300),
})

export const contentRequestSchema = z.object({
  roadmapId: z.string().uuid().nullable().optional(),
  platform: marketingPlatformSchema,
  contentType: z.string().trim().min(2).max(80),
  objective: z.string().trim().min(3).max(220),
})

export const contentPackModelSchema = z.object({
  title: z.string().min(4).max(150),
  hook: z.string().min(4).max(350),
  script: z.string().min(10).max(3000),
  shotGuide: z.string().min(10).max(2200),
  caption: z.string().min(4).max(2200),
  cta: z.string().min(2).max(400),
  publishWindow: z.string().min(3).max(180),
  rationale: z.string().min(10).max(900),
  posterPrompt: z.string().min(10).max(2500),
})

export const packUpdateSchema = z.object({
  id: z.string().uuid(),
  status: marketingPackStatusSchema.optional(),
  scheduledFor: z.string().datetime().nullable().optional(),
  content: z.record(z.string()).optional(),
}).refine((value) => value.status || value.scheduledFor !== undefined || value.content, { message: 'No changes supplied.' })

export const reviewSchema = z.object({
  roadmapId: z.string().uuid().nullable().optional(),
  views: z.coerce.number().int().min(0).max(100000000),
  engagement: z.coerce.number().int().min(0).max(100000000),
  leads: z.coerce.number().int().min(0).max(10000000),
  sales: z.coerce.number().int().min(0).max(10000000),
  notes: z.string().trim().max(2000).optional().default(''),
})

export const reviewModelSchema = z.object({ nextPriority: z.string().min(5).max(500) })
