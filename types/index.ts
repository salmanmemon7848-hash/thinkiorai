export type Plan = 'free' | 'builder' | 'founder_pro'

export type Feature =
  | 'validator'
  | 'competitor'
  | 'ideas'
  | 'pitch'
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
  competitor: number
  ideas: number
  pitch: number
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
