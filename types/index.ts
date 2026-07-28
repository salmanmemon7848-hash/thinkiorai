export type Plan = 'free' | 'builder' | 'founder_pro'

export type Feature =
  | 'validator'
  | 'marketing'
  | 'ideas'
  | 'leads'
  | 'chat'
  | 'report'

export interface UserProfile {
  id: string
  email: string | null
  name: string | null
  avatar_url: string | null
  plan: Plan
  plan_expires_at: string | null
  created_at: string
  updated_at: string
}

export interface PlanLimits {
  validator: number
  marketing: number
  ideas: number
  leads: number
  chat: number
  report: number
}

export interface BusinessReport {
  id: string
  user_id: string
  business_name: string | null
  report_type: string
  industry: string
  stage: string | null
  input_data: Record<string, unknown>
  report_data: Record<string, unknown>
  created_at: string
}

export interface DailyUsage {
  id: string
  user_id: string
  feature: Feature
  date: string
  count: number
}

export interface ActivityLog {
  id: string
  user_id: string
  feature: Feature
  title: string | null
  summary: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface SavedReport {
  id: string
  user_id: string
  feature: Feature
  title: string
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  sources?: ResearchSource[]
}

export interface ResearchSource {
  title: string
  url: string
  snippet: string
  confidence: 'high' | 'medium' | 'low'
  retrievedAt: string
}

export type EvidenceStatus = 'verified' | 'unverified' | 'assumption'
export type EvidenceConfidence = 'high' | 'medium' | 'low'

export interface FounderEvidence {
  id: string
  title: string
  claim: string
  kind: string
  source_url: string | null
  source_title: string | null
  source_date: string | null
  confidence: EvidenceConfidence
  status: EvidenceStatus
  notes: string | null
  created_at: string
}

export interface FounderExperiment {
  id: string
  title: string
  hypothesis: string | null
  success_metric: string | null
  resource_url: string | null
  resource_title: string | null
  due_date: string | null
  status: 'planned' | 'running' | 'complete' | 'stopped'
  outcome: string | null
  created_at: string
}

export type LeadType = 'customer' | 'investor'
export type LeadStage = 'saved' | 'contacted' | 'replied' | 'not_a_fit'
export type LeadConfidence = 'source_backed' | 'ai_inferred'

export interface LeadEvidence {
  title: string
  url: string
  fact: string
  sourceDate: string | null
  retrievedAt: string
}

export interface LeadCandidate {
  name: string
  website: string | null
  location: string | null
  fit: string
  confidence: LeadConfidence
  contactPath: string
  contactUrl: string | null
  evidence: LeadEvidence[]
}

export interface FounderLead extends LeadCandidate {
  id: string
  search_id: string | null
  lead_type: LeadType
  stage: LeadStage
  notes: string | null
  follow_up_at: string | null
  created_at: string
  updated_at: string
}

export type MarketingPlatform = 'instagram' | 'facebook' | 'youtube' | 'linkedin'
export type MarketingPackStatus = 'planned' | 'created' | 'published' | 'learned'

export interface MarketingProfile {
  id: string
  business_name: string | null
  offer: string
  audience: string
  country: string
  goal: string
  capacity: string
  stage: string
  current_channels: string | null
  platforms: MarketingPlatform[]
  strategy: Record<string, unknown>
  starter_used_at: string | null
  created_at: string
  updated_at: string
}

export interface MarketingRoadmap {
  id: string
  week_start: string
  revision: number
  objective: string
  strategy: Record<string, unknown>
  created_at: string
}

export interface MarketingContentPack {
  id: string
  roadmap_id: string | null
  platform: MarketingPlatform
  content_type: string
  title: string
  objective: string
  scheduled_for: string | null
  status: MarketingPackStatus
  content: Record<string, string>
  created_at: string
  updated_at: string
}

export interface MarketingReview {
  id: string
  roadmap_id: string | null
  views: number
  engagement: number
  leads: number
  sales: number
  notes: string | null
  next_priority: string | null
  created_at: string
}

export interface AIRequest {
  feature: Feature
  messages: ChatMessage[]
  context?: string
}

export interface AIResponse {
  result: string
  provider: string | null
  fallbackTriggered: boolean
  sources?: ResearchSource[]
}

export interface FeatureGateProps {
  feature: Feature
  children: React.ReactNode
  fallback?: React.ReactNode
}

export interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  badge?: string
}

export interface PricingPlan {
  id: Plan
  name: string
  price: number
  period: string
  description: string
  features: string[]
  limits: PlanLimits
  cta: string
  highlighted: boolean
}
