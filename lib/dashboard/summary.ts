/**
 * THINKIOR — DASHBOARD SUMMARY
 * ─────────────────────────────────────────────────────────────────
 * Pure-function module: takes the raw Supabase rows for a user
 * and computes the dashboard's derived state.
 *
 * Why server-side:
 *   - Single round trip
 *   - No waterfall, no skeleton flash
 *   - Easy to reason about: deterministic input → deterministic output
 *
 * Output:
 *   DashboardSummary
 *     .hero            → greeting + headline + sub + primary/secondary CTA
 *     .founderProgress → % and a phase label
 *     .kpis            → 4 cards (Startup Score / Verdict / Next Action / Progress)
 *     .commandCenter   → "your control panel" card (state, latest result, next action, next tool)
 *     .nextStep        → personalized recommended action
 *     .tools           → tool cards with last-used hints
 *     .activity        → activity feed entries
 * ─────────────────────────────────────────────────────────────────
 */

// ── Inputs (raw shape we expect from Supabase) ────────────────

export interface DashboardSession {
  id: string
  module: 'validator' | 'competitor' | 'ideas' | 'pitch' | 'chat' | 'report' | string
  session_title: string | null
  verdict: string | null
  score: number | null
  score_100: number | null
  card_kind: string | null
  card_data: Record<string, unknown> | null
  created_at: string
}

export interface DashboardReport {
  id: string
  business_name: string | null
  report_type: string
  industry: string
  stage: string | null
  created_at: string
}

export interface DashboardActivity {
  id: string
  feature: string
  title: string | null
  summary: string | null
  created_at: string
}

export interface DashboardFounderProfile {
  founder_name: string | null
  idea_name: string | null
  idea_description: string | null
  domain: string | null
  target_customer: string | null
  city: string | null
  stage: string | null
  onboarding_completed: boolean | null
  created_at?: string
  updated_at?: string
}

export interface DashboardInput {
  profile: DashboardFounderProfile | null
  sessions: DashboardSession[]
  reports: DashboardReport[]
  activity: DashboardActivity[]
  /** Created-at of the auth.users row, when available. */
  userCreatedAt: string | null
  /** User's display name from auth metadata / profiles. */
  displayName: string
  plan: 'free' | 'builder' | 'founder_pro'
}

// ── Output ────────────────────────────────────────────────────

export type GreetingTone = 'fresh' | 'returning' | 'active' | 'veteran'

export interface DashboardSummary {
  /** First-name greeting + tone */
  firstName: string
  greeting: string
  tone: GreetingTone

  /** Hero headline + sub + CTAs */
  heroHeadline: string
  heroSub: string
  heroPrimary: { label: string; href: string }
  heroSecondary: { label: string; href: string }

  /** Founder progress — phase + percentage */
  founderProgress: {
    pct: number
    label: string
    stepsDone: number
    stepsTotal: number
    phase: 'onboarding' | 'idea' | 'research' | 'fundraising' | 'scaling'
  }

  /** 4 KPI cards (the new top strip) */
  kpis: {
    startupScore: { value: number | null; label: string; tone: 'go' | 'pivot' | 'kill' | 'none' }
    currentVerdict: { verdict: string | null; module: string | null; createdAt: string | null }
    nextAction: { label: string; href: string; helper: string }
    founderProgress: { pct: number; label: string; days: number }
  }

  /** The "Founder command center" big card */
  commandCenter: {
    state: { label: string; helper: string }
    latestResult: {
      label: string
      verdict: string | null
      score: number | null
      score_100: number | null
      module: string
      headline: string | null
      createdAt: string
    } | null
    nextAction: { label: string; helper: string; href: string }
    nextTool: {
      label: string
      href: string
      reason: string
    }
  }

  /** Recommended next step (the "what should I do next" panel) */
  nextStep: {
    title: string
    reason: string
    cta: { label: string; href: string }
    accent: 'accent' | 'pivot' | 'rose' | 'insight' | 'violet'
  }

  /** Tool cards (the existing grid) */
  tools: ToolCard[]

  /** Activity feed entries */
  activity: DashboardActivity[]
}

export interface ToolCard {
  id: string
  label: string
  outcome: string
  href: string
  accent: 'accent' | 'insight' | 'pivot' | 'violet' | 'fg'
  iconKey: ToolIconKey
  /** When the founder last used this tool, formatted as "2d ago". */
  lastUsed: string | null
  /** Optional result hint shown under the outcome line. */
  lastResult: string | null
}

export type ToolIconKey =
  | 'validator'
  | 'competitor'
  | 'ideas'
  | 'pitch'
  | 'reports'
  | 'chat'

// ── Helpers ────────────────────────────────────────────────────

const TOOL_LABEL: Record<ToolIconKey, string> = {
  validator: 'Business Validator',
  competitor: 'Competitor Intel',
  ideas: 'Ideas Desk',
  pitch: 'Pitch Evaluator',
  reports: 'Business Reports',
  chat: 'Co-founder Desk',
}

function timeAgoShort(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

/** Calendar-day delta between two dates, +1 so "same day" = 1. */
function calendarDaysBetween(from: Date, to: Date): number {
  const aMidnight = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const bMidnight = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.floor((bMidnight - aMidnight) / 86_400_000) + 1
}

function firstName(displayName: string): string {
  const trimmed = displayName.trim()
  if (!trimmed) return 'Founder'
  // "Rohan Mehta" → "Rohan"
  return trimmed.split(/\s+/)[0] || 'Founder'
}

function pickHourGreeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'Burning the midnight oil'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Late night'
}

function scoreTone(score100: number | null): 'go' | 'pivot' | 'kill' | 'none' {
  if (score100 == null) return 'none'
  if (score100 >= 75) return 'go'
  if (score100 >= 55) return 'pivot'
  return 'kill'
}

function verdictTone(verdict: string | null): 'go' | 'pivot' | 'kill' | 'none' {
  if (!verdict) return 'none'
  const v = verdict.toUpperCase()
  if (v === 'GO' || v === 'SEED' || v === 'ANGEL' || v === 'BUILD') return 'go'
  if (v === 'KILL' || v === 'NOT_READY' || v === 'DONT_START_YET') return 'kill'
  return 'pivot'
}

function toneClass(tone: 'go' | 'pivot' | 'kill' | 'none'): string {
  if (tone === 'go') return 'text-signal-go'
  if (tone === 'kill') return 'text-signal-rose'
  if (tone === 'pivot') return 'text-signal-pivot'
  return 'text-fg-dim'
}

function toneBgClass(tone: 'go' | 'pivot' | 'kill' | 'none'): string {
  if (tone === 'go') return 'bg-signal-go/15 text-signal-go border-signal-go/30'
  if (tone === 'kill') return 'bg-signal-rose/15 text-signal-rose border-signal-rose/30'
  if (tone === 'pivot') return 'bg-signal-pivot/15 text-signal-pivot border-signal-pivot/30'
  return 'bg-bg-card text-fg-muted border-line'
}

function pickResultText(s: DashboardSession): string {
  // Build a short, result-focused line for the activity feed.
  const c = s.card_data
  if (c?.headline && typeof c.headline === 'string') return c.headline
  if (c?.tagline && typeof c.tagline === 'string') return c.tagline
  if (c?.first_customer && typeof c.first_customer === 'string')
    return `First customer: ${c.first_customer}`
  if (c?.red_flag && typeof c.red_flag === 'string') return c.red_flag
  const ws = c?.weakest_slide as { topic?: string } | undefined
  if (ws?.topic && typeof ws.topic === 'string')
    return `Weakest slide: ${ws.topic}`
  return s.session_title || '—'
}

// ── The summary function ──────────────────────────────────────

export function buildDashboardSummary(input: DashboardInput): DashboardSummary {
  const { profile, sessions, reports, activity, userCreatedAt, displayName, plan } = input
  const _name = firstName(displayName)

  // ── Progress + phase ───────────────────────────────────────
  // 5 founder phases, each worth 20% of the journey.
  const hasOnboarding = !!profile?.onboarding_completed
  const hasValidator = sessions.some((s) => s.module === 'validator')
  const hasCompetitor = sessions.some((s) => s.module === 'competitor')
  const hasPitch = sessions.some((s) => s.module === 'pitch')
  const hasReport = reports.length > 0

  let phase: DashboardSummary['founderProgress']['phase']
  if (!hasOnboarding) phase = 'onboarding'
  else if (!hasValidator) phase = 'idea'
  else if (!hasCompetitor) phase = 'research'
  else if (!hasPitch) phase = 'fundraising'
  else phase = 'scaling'

  let stepsDone = 0
  if (hasOnboarding) stepsDone += 1
  if (hasValidator) stepsDone += 1
  if (hasCompetitor) stepsDone += 1
  if (hasPitch) stepsDone += 1
  if (hasReport) stepsDone += 1

  const stepsTotal = 5
  const pct = Math.round((stepsDone / stepsTotal) * 100)

  const phaseLabel: Record<typeof phase, string> = {
    onboarding: 'Getting set up',
    idea: 'Validating the idea',
    research: 'Researching the field',
    fundraising: 'Pitching investors',
    scaling: 'Building & scaling',
  }

  const daysAsFounder = userCreatedAt
    ? Math.max(1, calendarDaysBetween(new Date(userCreatedAt), new Date()))
    : 1

  // ── Latest result ──────────────────────────────────────────
  // Priority: most recent validator/competitor/pitch session
  const priorityModules = ['validator', 'pitch', 'competitor', 'ideas', 'report']
  const latest = sessions
    .filter((s) => priorityModules.includes(s.module))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  const latestValidator = sessions
    .filter((s) => s.module === 'validator')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  // ── Hero greeting + headline ──────────────────────────────
  const greetingText = pickHourGreeting()
  let tone: GreetingTone
  if (sessions.length === 0) tone = 'fresh'
  else if (stepsDone <= 2) tone = 'returning'
  else if (stepsDone <= 4) tone = 'active'
  else tone = 'veteran'

  let heroHeadline: string
  let heroSub: string
  let heroPrimary: { label: string; href: string }
  let heroSecondary: { label: string; href: string }

  if (tone === 'fresh') {
    heroHeadline = 'Let&apos;s find out if your idea is real.'
    heroSub =
      'Start with the Business Validator. 30 seconds. You&apos;ll leave with a clear GO / KILL / PIVOT verdict and a 7-day plan.'
    heroPrimary = { label: 'Run Validator', href: '/validator' }
    heroSecondary = { label: 'Or browse tools', href: '/dashboard#tools' }
  } else if (tone === 'returning') {
    const lastValidatorLabel = latestValidator
      ? `Your last Validator verdict was ${latestValidator.verdict || 'PIVOT'}.`
      : 'You started strong.'
    heroHeadline = 'Pick up where you left off.'
    heroSub = `${lastValidatorLabel} ${nextActionSentence(phase, latestValidator)}`
    heroPrimary = phasePrimary(phase, hasValidator)
    heroSecondary = { label: 'Co-founder Desk', href: '/chat' }
  } else if (tone === 'active') {
    heroHeadline = 'You&apos;re building real conviction.'
    heroSub = `${profile?.idea_name ? `${profile.idea_name} — ` : ''}Nice momentum. ${nextActionSentence(phase, latestValidator)}`
    heroPrimary = phasePrimary(phase, hasValidator)
    heroSecondary = { label: 'See your work', href: '/dashboard#activity' }
  } else {
    heroHeadline = 'You&apos;ve got a working system.'
    heroSub = 'You&apos;ve validated, mapped competitors, and scored your pitch. Keep refining — or generate an investor-grade report.'
    heroPrimary = { label: 'Generate report', href: '/reports/new' }
    heroSecondary = { label: 'Chat with co-founder', href: '/chat' }
  }

  // ── KPIs ───────────────────────────────────────────────────
  const startupScoreValue = latestValidator?.score_100 ?? null
  const startupScoreTone = scoreTone(startupScoreValue)

  const currentVerdict = latestValidator
    ? {
        verdict: latestValidator.verdict,
        module: 'validator',
        createdAt: latestValidator.created_at,
      }
    : null

  const nextActionKpi = pickNextAction({
    phase,
    hasValidator,
    hasCompetitor,
    hasPitch,
    hasReport,
    latest: latestValidator || null,
  })

  const kpis = {
    startupScore: {
      value: startupScoreValue,
      label: startupScoreValue == null ? 'Not scored yet' : `${startupScoreValue}/100`,
      tone: startupScoreTone,
    },
    currentVerdict: {
      verdict: currentVerdict?.verdict ?? null,
      module: currentVerdict?.module ?? null,
      createdAt: currentVerdict?.createdAt ?? null,
    },
    nextAction: nextActionKpi,
    founderProgress: {
      pct,
      label: phaseLabel[phase],
      days: daysAsFounder,
    },
  }

  // ── Command center ─────────────────────────────────────────
  const stateLabel: Record<typeof phase, string> = {
    onboarding: 'Just getting set up',
    idea: 'Validating the idea',
    research: 'Mapping the market',
    fundraising: 'Pitching investors',
    scaling: 'Building & scaling',
  }

  const commandCenter = {
    state: {
      label: stateLabel[phase],
      helper:
        phase === 'onboarding'
          ? 'Complete onboarding to unlock personalized advice.'
          : phase === 'idea'
            ? 'The Validator is the fastest way to know if this is real.'
            : phase === 'research'
              ? 'Now that you have a verdict, know who you&apos;re fighting.'
              : phase === 'fundraising'
                ? 'Your idea checks out. Now the deck needs to be bulletproof.'
                : 'You&apos;re in the top tier. Time to write the strategy memo.',
    },
    latestResult: latest
      ? {
          label: pickResultText(latest),
          verdict: latest.verdict,
          score: latest.score,
          score_100: latest.score_100,
          module: latest.module,
          headline: (latest.card_data?.headline as string) || null,
          createdAt: latest.created_at,
        }
      : null,
    nextAction: {
      label: nextActionKpi.label,
      helper: nextActionKpi.helper,
      href: nextActionKpi.href,
    },
    nextTool: pickNextTool({
      phase,
      hasValidator,
      hasCompetitor,
      hasPitch,
      hasReport,
    }),
  }

  // ── Recommended next step ─────────────────────────────────
  const nextStep = buildNextStep({
    phase,
    hasValidator,
    hasCompetitor,
    hasPitch,
    hasReport,
    latest: latestValidator || null,
  })

  // ── Tools (with last-used / last-result hints) ────────────
  const lastByTool: Record<ToolIconKey, DashboardSession | null> = {
    validator: null,
    competitor: null,
    ideas: null,
    pitch: null,
    reports: null,
    chat: null,
  }
  for (const s of sessions) {
    if (s.module === 'validator' && !lastByTool.validator) lastByTool.validator = s
    if (s.module === 'competitor' && !lastByTool.competitor) lastByTool.competitor = s
    if (s.module === 'ideas' && !lastByTool.ideas) lastByTool.ideas = s
    if (s.module === 'pitch' && !lastByTool.pitch) lastByTool.pitch = s
  }
  if (reports.length > 0) {
    const latestReport = reports[0]
    lastByTool.reports = {
      id: latestReport.id,
      module: 'report',
      session_title: latestReport.business_name,
      verdict: null,
      score: null,
      score_100: null,
      card_kind: null,
      card_data: null,
      created_at: latestReport.created_at,
    }
  }

  const tools: ToolCard[] = [
    {
      id: 'validator',
      iconKey: 'validator',
      label: TOOL_LABEL.validator,
      outcome: 'Get a GO / KILL / PIVOT verdict in 30s',
      href: '/validator',
      accent: 'accent',
      lastUsed: lastByTool.validator ? timeAgoShort(lastByTool.validator.created_at) : null,
      lastResult: lastByTool.validator
        ? formatResultHint(lastByTool.validator)
        : null,
    },
    {
      id: 'competitor',
      iconKey: 'competitor',
      label: TOOL_LABEL.competitor,
      outcome: 'Map the battlefield, find the gap',
      href: '/competitor',
      accent: 'insight',
      lastUsed: lastByTool.competitor ? timeAgoShort(lastByTool.competitor.created_at) : null,
      lastResult: lastByTool.competitor
        ? formatResultHint(lastByTool.competitor)
        : null,
    },
    {
      id: 'ideas',
      iconKey: 'ideas',
      label: TOOL_LABEL.ideas,
      outcome: 'Turn vague thinking into a 7-day plan',
      href: '/ideas',
      accent: 'pivot',
      lastUsed: lastByTool.ideas ? timeAgoShort(lastByTool.ideas.created_at) : null,
      lastResult: lastByTool.ideas ? formatResultHint(lastByTool.ideas) : null,
    },
    {
      id: 'pitch',
      iconKey: 'pitch',
      label: TOOL_LABEL.pitch,
      outcome: 'Score your deck, fix the weakest slide',
      href: '/pitch',
      accent: 'violet',
      lastUsed: lastByTool.pitch ? timeAgoShort(lastByTool.pitch.created_at) : null,
      lastResult: lastByTool.pitch ? formatResultHint(lastByTool.pitch) : null,
    },
    {
      id: 'reports',
      iconKey: 'reports',
      label: TOOL_LABEL.reports,
      outcome: 'Investor-grade strategy memo',
      href: '/reports',
      accent: 'accent',
      lastUsed: lastByTool.reports ? timeAgoShort(lastByTool.reports.created_at) : null,
      lastResult: lastByTool.reports ? 'Last report ready' : null,
    },
    {
      id: 'chat',
      iconKey: 'chat',
      label: TOOL_LABEL.chat,
      outcome: 'Always-on co-founder, with memory',
      href: '/chat',
      accent: 'fg',
      lastUsed: null,
      lastResult: null,
    },
  ]

  return {
    firstName: _name,
    greeting: greetingText,
    tone,
    heroHeadline,
    heroSub,
    heroPrimary,
    heroSecondary,
    founderProgress: {
      pct,
      label: phaseLabel[phase],
      stepsDone,
      stepsTotal,
      phase,
    },
    kpis,
    commandCenter,
    nextStep,
    tools,
    activity,
  }
}

// ── Internal helpers ─────────────────────────────────────────

function nextActionSentence(
  phase: DashboardSummary['founderProgress']['phase'],
  latest: DashboardSession | null
): string {
  switch (phase) {
    case 'onboarding':
      return 'Tell us about your idea so the tools can be tuned to it.'
    case 'idea':
      return 'Run the Validator — that&apos;s the fastest path to conviction.'
    case 'research':
      return latest
        ? 'Next, see who you&apos;re up against. Competitor Intel will show you the gap.'
        : 'Map the field next — Competitor Intel will show you where to plant your flag.'
    case 'fundraising':
      return 'Score your pitch deck. The Pitch Evaluator will tell you what kills your raise.'
    case 'scaling':
      return 'Generate a Founder Pro report and send it to your next investor.'
  }
}

function phasePrimary(
  phase: DashboardSummary['founderProgress']['phase'],
  hasValidator: boolean
): { label: string; href: string } {
  switch (phase) {
    case 'onboarding':
      return { label: 'Finish setup', href: '/onboarding' }
    case 'idea':
      return { label: 'Run Validator', href: '/validator' }
    case 'research':
      return { label: 'Map competitors', href: '/competitor' }
    case 'fundraising':
      return { label: 'Score my pitch', href: '/pitch' }
    case 'scaling':
      return { label: 'Generate report', href: '/reports/new' }
  }
  // Fallback: shouldn't hit
  return hasValidator
    ? { label: 'Open Validator', href: '/validator' }
    : { label: 'Run Validator', href: '/validator' }
}

function pickNextAction(args: {
  phase: DashboardSummary['founderProgress']['phase']
  hasValidator: boolean
  hasCompetitor: boolean
  hasPitch: boolean
  hasReport: boolean
  latest: DashboardSession | null
}): { label: string; href: string; helper: string } {
  if (!args.hasValidator) {
    return {
      label: 'Run Business Validator',
      href: '/validator',
      helper: '30 seconds · GO / KILL / PIVOT · India-specific',
    }
  }
  if (!args.hasCompetitor) {
    return {
      label: 'Map your competitors',
      href: '/competitor',
      helper: 'See the battlefield, find the gap',
    }
  }
  if (!args.hasPitch) {
    return {
      label: 'Score your pitch deck',
      href: '/pitch',
      helper: 'Investor-grade review in 30s',
    }
  }
  if (!args.hasReport) {
    return {
      label: 'Generate Founder Pro report',
      href: '/reports/new',
      helper: 'Investor-grade strategy memo',
    }
  }
  return {
    label: 'Chat with co-founder',
    href: '/chat',
    helper: 'Refine strategy, GTM, fundraising',
  }
}

function pickNextTool(args: {
  phase: DashboardSummary['founderProgress']['phase']
  hasValidator: boolean
  hasCompetitor: boolean
  hasPitch: boolean
  hasReport: boolean
}): { label: string; href: string; reason: string } {
  if (!args.hasValidator)
    return {
      label: 'Business Validator',
      href: '/validator',
      reason: 'The fastest way to know if this is real.',
    }
  if (!args.hasCompetitor)
    return {
      label: 'Competitor Intel',
      href: '/competitor',
      reason: 'See who you&apos;re fighting and where the gap is.',
    }
  if (!args.hasPitch)
    return {
      label: 'Pitch Evaluator',
      href: '/pitch',
      reason: 'Get investor-grade feedback on your deck.',
    }
  if (!args.hasReport)
    return {
      label: 'Business Reports',
      href: '/reports',
      reason: 'A strategy memo an investor can read in 5 minutes.',
    }
  return {
    label: 'Co-founder Desk',
    href: '/chat',
    reason: 'Ongoing advice that remembers everything you&apos;ve run.',
  }
}

function buildNextStep(args: {
  phase: DashboardSummary['founderProgress']['phase']
  hasValidator: boolean
  hasCompetitor: boolean
  hasPitch: boolean
  hasReport: boolean
  latest: DashboardSession | null
}): DashboardSummary['nextStep'] {
  if (!args.hasValidator) {
    return {
      title: 'You haven&apos;t validated your idea yet.',
      reason:
        'A 30-second Validator run gives you a clear GO / KILL / PIVOT verdict and a 7-day plan. Everything else is more useful after you have that.',
      cta: { label: 'Run Validator', href: '/validator' },
      accent: 'accent',
    }
  }

  const verdict = args.latest?.verdict?.toUpperCase() || ''
  if (verdict === 'KILL') {
    return {
      title: 'Your last verdict was KILL.',
      reason:
        'Don&apos;t stop — the data shows you exactly what to change. Open the latest result and look at the "KILL → PIVOT" ladder. Most KILLs are pivotable.',
      cta: { label: 'Open last Validator', href: '/validator' },
      accent: 'rose',
    }
  }

  if (verdict === 'PIVOT') {
    return {
      title: 'Your last verdict was PIVOT.',
      reason:
        'The pain is real, but the approach has a flaw. Look at the "PIVOT → GO" ladder in your last result — that&apos;s the change that unlocks the next level.',
      cta: { label: 'Open last Validator', href: '/validator' },
      accent: 'pivot',
    }
  }

  if (verdict === 'GO' && !args.hasCompetitor) {
    return {
      title: 'You have a GO. Now protect it.',
      reason:
        'Your idea checks out. Before you build, see who you&apos;re up against. Competitor Intel maps the field and tells you where to plant your flag.',
      cta: { label: 'Map competitors', href: '/competitor' },
      accent: 'insight',
    }
  }

  if (args.hasCompetitor && !args.hasPitch) {
    return {
      title: 'You have a verdict and a competitor map.',
      reason:
        'Time to stress-test the deck. The Pitch Evaluator scores every slide and tells you what kills your raise.',
      cta: { label: 'Score my pitch', href: '/pitch' },
      accent: 'violet',
    }
  }

  if (args.hasPitch && !args.hasReport) {
    const score100 = args.latest?.score_100
    if (score100 != null && score100 < 60) {
      return {
        title: `Your last pitch scored ${score100}/100.`,
        reason:
          'Below 60 means investors will pass. Tighten the deck using the Pitch Evaluator&apos;s rewrite, then come back. When you&apos;re above 70, generate the report.',
        cta: { label: 'Improve pitch', href: '/pitch' },
        accent: 'rose',
      }
    }
    return {
      title: 'Your pitch is solid. Package it.',
      reason:
        'A Founder Pro report turns all your work into an investor-grade strategy memo. Use it for fundraising, co-founder alignment, or just to see the whole picture.',
      cta: { label: 'Generate report', href: '/reports/new' },
      accent: 'accent',
    }
  }

  return {
    title: 'You&apos;ve got a working founder system.',
    reason:
      'Validator ✓ · Competitor ✓ · Pitch ✓ · Report ✓. Use the Co-founder Desk for ongoing strategy, GTM, and fundraising — it remembers everything you&apos;ve run.',
    cta: { label: 'Open Co-founder Desk', href: '/chat' },
    accent: 'accent',
  }
}

function formatResultHint(s: DashboardSession): string {
  const v = s.verdict ? `${s.verdict}` : ''
  const score = s.score_100 != null ? ` · ${s.score_100}/100` : s.score != null ? ` · ${s.score}/10` : ''
  const base = `${v}${score}`.trim()
  if (!base) return 'Last run saved'
  // Truncate to one line
  if (s.session_title && s.session_title.length < 60) {
    return `${base} · ${s.session_title}`
  }
  return base
}

export { toneClass, toneBgClass, timeAgoShort }
