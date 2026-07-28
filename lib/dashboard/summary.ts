export interface DashboardSession {
  id: string
  module: 'validator' | 'marketing' | 'ideas' | 'leads' | 'chat' | 'report' | string
  session_title: string | null
  verdict: string | null
  score: number | null
  score_100: number | null
  card_kind: string | null
  card_data: Record<string, unknown> | null
  created_at: string
}

export interface DashboardReport { id: string; business_name: string | null; report_type: string; industry: string; stage: string | null; created_at: string }
export interface DashboardActivity { id: string; feature: string; title: string | null; summary: string | null; created_at: string }
export interface DashboardFounderProfile { founder_name: string | null; idea_name: string | null; idea_description: string | null; domain: string | null; target_customer: string | null; city: string | null; stage: string | null; onboarding_completed: boolean | null; created_at?: string; updated_at?: string }
export interface DashboardInput { profile: DashboardFounderProfile | null; sessions: DashboardSession[]; reports: DashboardReport[]; activity: DashboardActivity[]; userCreatedAt: string | null; displayName: string; plan: 'free' | 'builder' | 'founder_pro' }

export type GreetingTone = 'fresh' | 'returning' | 'active' | 'veteran'
type Phase = 'onboarding' | 'idea' | 'research' | 'sales' | 'scaling'
export type ToolIconKey = 'validator' | 'marketing' | 'ideas' | 'leads' | 'reports' | 'chat'
export interface ToolCard { id: string; label: string; outcome: string; href: string; accent: 'accent' | 'insight' | 'pivot' | 'violet' | 'fg'; iconKey: ToolIconKey; lastUsed: string | null; lastResult: string | null }
export interface DashboardSummary {
  firstName: string; greeting: string; tone: GreetingTone
  heroHeadline: string; heroSub: string; heroPrimary: { label: string; href: string }; heroSecondary: { label: string; href: string }
  founderProgress: { pct: number; label: string; stepsDone: number; stepsTotal: number; phase: Phase }
  kpis: { startupScore: { value: number | null; label: string; tone: 'go' | 'pivot' | 'kill' | 'none' }; currentVerdict: { verdict: string | null; module: string | null; createdAt: string | null }; nextAction: { label: string; href: string; helper: string }; founderProgress: { pct: number; label: string; days: number } }
  commandCenter: { state: { label: string; helper: string }; latestResult: { label: string; verdict: string | null; score: number | null; score_100: number | null; module: string; headline: string | null; createdAt: string } | null; nextAction: { label: string; helper: string; href: string }; nextTool: { label: string; href: string; reason: string } }
  nextStep: { title: string; reason: string; cta: { label: string; href: string }; accent: 'accent' | 'pivot' | 'rose' | 'insight' | 'violet' }
  tools: ToolCard[]; activity: DashboardActivity[]
}

const labels: Record<ToolIconKey, string> = { validator: 'Business Validator', marketing: 'Marketing Engine', ideas: 'Ideas Desk', leads: 'Leads Finder', reports: 'Business Reports', chat: 'Co-founder Desk' }
export function timeAgoShort(iso: string) { const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000)); if (minutes < 1) return 'just now'; if (minutes < 60) return `${minutes}m ago`; if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`; return `${Math.floor(minutes / 1440)}d ago` }
export function toneClass(tone: 'go' | 'pivot' | 'kill' | 'none') { return tone === 'go' ? 'text-signal-go' : tone === 'pivot' ? 'text-signal-pivot' : tone === 'kill' ? 'text-signal-rose' : 'text-fg-muted' }
export function toneBgClass(tone: 'go' | 'pivot' | 'kill' | 'none') { return tone === 'go' ? 'bg-signal-go/15 text-signal-go border-signal-go/30' : tone === 'pivot' ? 'bg-signal-pivot/15 text-signal-pivot border-signal-pivot/30' : tone === 'kill' ? 'bg-signal-rose/15 text-signal-rose border-signal-rose/30' : 'bg-bg-card text-fg-muted border-line' }

function phaseAction(phase: Phase) {
  if (phase === 'onboarding') return { label: 'Finish setup', href: '/onboarding', helper: 'Tell Thinkior who you are building for.' }
  if (phase === 'idea') return { label: 'Run Business Validator', href: '/validator', helper: 'Test the riskiest assumption before building.' }
  if (phase === 'research') return { label: 'Create marketing roadmap', href: '/marketing', helper: 'Turn your business context into a practical social plan.' }
  if (phase === 'sales') return { label: 'Find leads', href: '/leads', helper: 'Find source-backed people worth talking to.' }
  return { label: 'Open Founder Workspace', href: '/workspace', helper: 'Review learning and choose the next test.' }
}

function phaseTool(phase: Phase) {
  if (phase === 'onboarding') return { label: 'Founder Workspace', href: '/workspace', reason: 'Set the context that makes each recommendation useful.' }
  if (phase === 'idea') return { label: 'Business Validator', href: '/validator', reason: 'Clarify the customer problem and riskiest assumption.' }
  if (phase === 'research') return { label: 'Marketing Engine', href: '/marketing', reason: 'Build your first focused social-media roadmap.' }
  if (phase === 'sales') return { label: 'Leads Finder', href: '/leads', reason: 'Turn your research into customer or investor conversations.' }
  return { label: 'Co-founder Desk', href: '/chat', reason: 'Use the context you have built to decide what is next.' }
}

export function buildDashboardSummary(input: DashboardInput): DashboardSummary {
  const hasOnboarding = !!input.profile?.onboarding_completed
  const hasValidator = input.sessions.some((s) => s.module === 'validator')
  const hasMarketing = input.sessions.some((s) => s.module === 'marketing')
  const hasLeads = input.sessions.some((s) => s.module === 'leads')
  const hasReport = input.reports.length > 0
  const phase: Phase = !hasOnboarding ? 'onboarding' : !hasValidator ? 'idea' : !hasMarketing ? 'research' : !hasLeads ? 'sales' : 'scaling'
  const stepsDone = [hasOnboarding, hasValidator, hasMarketing, hasLeads, hasReport].filter(Boolean).length
  const phaseLabel: Record<Phase, string> = { onboarding: 'Getting set up', idea: 'Validating the idea', research: 'Researching the field', sales: 'Finding conversations', scaling: 'Learning and growing' }
  const firstName = input.displayName.trim().split(/\s+/)[0] || 'Founder'
  const hour = new Date().getHours(); const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const tone: GreetingTone = input.sessions.length === 0 ? 'fresh' : stepsDone < 3 ? 'returning' : stepsDone < 5 ? 'active' : 'veteran'
  const latest = input.sessions.filter((s) => ['validator', 'marketing', 'ideas', 'leads'].includes(s.module)).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))[0] || null
  const latestValidator = input.sessions.filter((s) => s.module === 'validator').sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))[0] || null
  const score = latestValidator?.score_100 ?? null
  const scoreTone = score == null ? 'none' : score >= 75 ? 'go' : score >= 50 ? 'pivot' : 'kill'
  const action = phaseAction(phase); const nextTool = phaseTool(phase)
  const resultLabel = latest ? ((latest.card_data?.headline as string | undefined) || (latest.card_data?.tagline as string | undefined) || latest.session_title || 'Last result saved') : null
  const days = input.userCreatedAt ? Math.max(1, Math.ceil((Date.now() - +new Date(input.userCreatedAt)) / 86400000)) : 1
  const tools = ([
    { id: 'validator', iconKey: 'validator', label: labels.validator, outcome: 'Get a clear evidence-backed verdict', href: '/validator', accent: 'accent' },
    { id: 'marketing', iconKey: 'marketing', label: labels.marketing, outcome: 'Build a practical social growth roadmap', href: '/marketing', accent: 'accent' },
    { id: 'ideas', iconKey: 'ideas', label: labels.ideas, outcome: 'Turn a vague idea into validation steps', href: '/ideas', accent: 'pivot' },
    { id: 'leads', iconKey: 'leads', label: labels.leads, outcome: 'Find source-backed people worth talking to', href: '/leads', accent: 'accent' },
    { id: 'reports', iconKey: 'reports', label: labels.reports, outcome: 'Turn evidence into a practical brief', href: '/reports', accent: 'accent' },
    { id: 'chat', iconKey: 'chat', label: labels.chat, outcome: 'Get context-aware founder guidance', href: '/chat', accent: 'fg' },
  ] satisfies Array<Omit<ToolCard, 'lastUsed' | 'lastResult'>>).map((tool): ToolCard => { const last = input.sessions.find((session) => session.module === tool.id); return { ...tool, lastUsed: last ? timeAgoShort(last.created_at) : null, lastResult: last ? (last.session_title || 'Last run saved') : null } })
  return {
    firstName, greeting, tone,
    heroHeadline: tone === 'fresh' ? 'Make your next business decision clearer.' : 'Keep turning evidence into action.',
    heroSub: phase === 'sales' ? 'You have research. Now find the people who can teach you whether it matters.' : action.helper,
    heroPrimary: { label: action.label, href: action.href }, heroSecondary: { label: 'Founder Workspace', href: '/workspace' },
    founderProgress: { pct: Math.round(stepsDone / 5 * 100), label: phaseLabel[phase], stepsDone, stepsTotal: 5, phase },
    kpis: { startupScore: { value: score, label: score == null ? 'Not scored yet' : `${score}/100`, tone: scoreTone }, currentVerdict: { verdict: latestValidator?.verdict || null, module: latestValidator ? 'validator' : null, createdAt: latestValidator?.created_at || null }, nextAction: action, founderProgress: { pct: Math.round(stepsDone / 5 * 100), label: phaseLabel[phase], days } },
    commandCenter: { state: { label: phaseLabel[phase], helper: action.helper }, latestResult: latest && resultLabel ? { label: resultLabel, verdict: latest.verdict, score: latest.score, score_100: latest.score_100, module: latest.module, headline: (latest.card_data?.headline as string | undefined) || null, createdAt: latest.created_at } : null, nextAction: action, nextTool },
    nextStep: { title: action.label, reason: action.helper, cta: { label: action.label, href: action.href }, accent: phase === 'sales' ? 'insight' : 'accent' },
    tools, activity: input.activity,
  }
}
