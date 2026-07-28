/**
 * THINKIOR — REPORT TEMPLATES
 * ─────────────────────────────────────────────────────────────────
 * Curated set of 5 high-leverage report templates. Each template
 * customises the wizard's questions and steers the AI prompt toward
 * a specific, well-defined output.
 *
 * Why 5, not 8: founder attention is finite. 5 focused templates
 * beat 8 generic ones. Each one answers a specific question a
 * founder actually has.
 *
 * The ReportWizard uses `templateId` instead of the old `reportType`
 * string. The AI still receives a `reportType` field (human-readable)
 * but the wizard pre-fills / hides / surfaces specific questions
 * based on the template.
 * ─────────────────────────────────────────────────────────────────
 */

import {
  FileText,
  Map,
  Rocket,
  Megaphone,
  Presentation,
  type LucideIcon,
} from 'lucide-react'

export interface ReportTemplate {
  id: string
  /** Human-readable name shown in the wizard picker */
  name: string
  /** One-line description for the wizard card */
  tagline: string
  /** What question this report answers for the founder */
  question: string
  /** Report type string sent to the AI prompt (keeps backward compat) */
  reportType: string
  /** Icon for the picker */
  icon: LucideIcon
  /** Tone colour for the picker card */
  tone: 'accent' | 'pivot' | 'insight' | 'violet' | 'rose'
  /** Steps the wizard will surface for this template. Some are
   *  required, some optional, some hidden entirely. */
  steps: WizardStepConfig[]
}

export interface WizardStepConfig {
  /** Step key — matches a field in the form */
  key: string
  /** Label shown in the step header */
  title: string
  /** Helper text below the title */
  subtitle: string
  /** Is the field required to proceed? */
  required: boolean
  /** Is the field shown at all? */
  visible: boolean
  /** Render mode: 'text' (single line input) or 'textarea' or 'chips' */
  render: 'text' | 'textarea' | 'chips'
  /** Placeholder text for text/textarea */
  placeholder?: string
  /** Optional chip options (when render === 'chips') */
  options?: string[]
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'market',
    name: 'Market Report',
    tagline: 'How big is this market, and is it growing?',
    question: 'Is this market worth my next 3 years?',
    reportType: 'Market Analysis Report',
    icon: Map,
    tone: 'insight',
    steps: [
      {
        key: 'businessName',
        title: 'Business name',
        subtitle: 'Optional — leave blank for an industry-only report',
        required: false,
        visible: true,
        render: 'text',
        placeholder: 'e.g. Thinkior AI',
      },
      {
        key: 'industry',
        title: 'Industry or niche',
        subtitle: 'Be as specific as you can — "B2B SaaS for CA firms" beats "tech"',
        required: true,
        visible: true,
        render: 'text',
        placeholder: 'e.g. AI SaaS, EdTech, D2C, HealthTech…',
      },
      {
        key: 'businessStage',
        title: 'Stage',
        subtitle: 'Where are you in the journey?',
        required: true,
        visible: true,
        render: 'chips',
        options: [
          'Idea Stage',
          'MVP Stage',
          'Pre-Revenue',
          'Early Revenue',
          'Growth Stage',
          'Scaling',
        ],
      },
      {
        key: 'targetMarket',
        title: 'Target customer',
        subtitle: 'The specific person, not the vertical',
        required: true,
        visible: true,
        render: 'textarea',
        placeholder:
          'e.g. 35-year-old owner of a 3-person CA firm in Pune, doing GST for 80 SMB clients a month.',
      },
      {
        key: 'competitors',
        title: 'Known competitors',
        subtitle: 'Comma separated. AI will fill in the rest',
        required: false,
        visible: true,
        render: 'text',
        placeholder: 'e.g. Razorpay, ClearTax, Zoho Books',
      },
      {
        key: 'location',
        title: 'Geography',
        subtitle: 'Where does the customer live?',
        required: false,
        visible: true,
        render: 'text',
        placeholder: 'India (pan-India), Mumbai only, Tier-2 cities, Global…',
      },
    ],
  },
  {
    id: 'gtm',
    name: 'Go-To-Market Report',
    tagline: 'How do I reach the first 100 paying customers?',
    question: 'What is the fastest, cheapest way to get paying customers?',
    reportType: 'Go-To-Market Strategy Report',
    icon: Rocket,
    tone: 'accent',
    steps: [
      {
        key: 'businessName',
        title: 'Business name',
        subtitle: 'Helps the report use your brand in the strategy',
        required: false,
        visible: true,
        render: 'text',
        placeholder: 'e.g. Thinkior AI',
      },
      {
        key: 'industry',
        title: 'Industry or niche',
        subtitle: 'Be as specific as you can',
        required: true,
        visible: true,
        render: 'text',
        placeholder: 'e.g. AI SaaS, EdTech, D2C, HealthTech…',
      },
      {
        key: 'businessStage',
        title: 'Stage',
        subtitle: 'Where are you in the journey?',
        required: true,
        visible: true,
        render: 'chips',
        options: [
          'Idea Stage',
          'MVP Stage',
          'Pre-Revenue',
          'Early Revenue',
          'Growth Stage',
          'Scaling',
        ],
      },
      {
        key: 'productService',
        title: 'Product or service',
        subtitle: 'What you actually sell',
        required: true,
        visible: true,
        render: 'textarea',
        placeholder: 'e.g. AI-powered GST compliance SaaS at ₹999/month for CA firms.',
      },
      {
        key: 'targetMarket',
        title: 'Target customer',
        subtitle: 'The specific person, not the vertical',
        required: true,
        visible: true,
        render: 'textarea',
        placeholder: 'e.g. CA firms in Tier-2 cities, 5-20 clients, currently using Excel.',
      },
      {
        key: 'mainChallenge',
        title: 'Biggest GTM challenge',
        subtitle: 'What is blocking distribution?',
        required: true,
        visible: true,
        render: 'textarea',
        placeholder:
          'e.g. We have 50 signups but 0 paying customers. We tried LinkedIn outbound and Meta ads — CAC is ₹4,500.',
      },
      {
        key: 'teamSize',
        title: 'Team size',
        subtitle: 'How many people are working on this?',
        required: false,
        visible: true,
        render: 'chips',
        options: ['Solo Founder', '2–3 People', '4–10 People', '11–50 People', '50+ People'],
      },
    ],
  },
  {
    id: 'validation',
    name: 'Startup Validation Report',
    tagline: 'Is this idea worth building?',
    question: 'Should I keep building, or stop?',
    reportType: 'Startup Validation Report',
    icon: FileText,
    tone: 'pivot',
    steps: [
      {
        key: 'businessName',
        title: 'Working name for the idea',
        subtitle: 'Optional — codename is fine',
        required: false,
        visible: true,
        render: 'text',
        placeholder: 'e.g. Project K, My New SaaS',
      },
      {
        key: 'industry',
        title: 'Industry or niche',
        subtitle: 'Be as specific as you can',
        required: true,
        visible: true,
        render: 'text',
        placeholder: 'e.g. AI tutor for vernacular students',
      },
      {
        key: 'businessStage',
        title: 'Stage',
        subtitle: 'Where are you in the journey?',
        required: true,
        visible: true,
        render: 'chips',
        options: [
          'Idea Stage',
          'MVP Stage',
          'Pre-Revenue',
          'Early Revenue',
          'Growth Stage',
          'Scaling',
        ],
      },
      {
        key: 'businessDescription',
        title: 'Idea in 2-3 sentences',
        subtitle: 'What is it, who is it for, why now?',
        required: true,
        visible: true,
        render: 'textarea',
        placeholder:
          'e.g. An AI tutor in Hindi + Tamil for Class 9-12 students in government schools. We use RAG over NCERT textbooks and charge ₹99/month.',
      },
      {
        key: 'mainChallenge',
        title: 'What worries you most about this idea?',
        subtitle: 'Your gut feeling — the report will pressure-test it',
        required: true,
        visible: true,
        render: 'textarea',
        placeholder:
          'e.g. Distribution to government schools is impossible, parents won\'t pay, and Jio is rumored to be building something similar.',
      },
    ],
  },
  {
    id: 'marketing_strategy',
    name: 'Marketing Strategy Report',
    tagline: 'Who should you reach and what should you publish?',
    question: 'How do I build a focused social-media plan?',
    reportType: 'Marketing Strategy Report',
    icon: Megaphone,
    tone: 'insight',
    steps: [
      {
        key: 'businessName',
        title: 'Business name',
        subtitle: 'Optional — codename is fine',
        required: false,
        visible: true,
        render: 'text',
        placeholder: 'e.g. Thinkior AI',
      },
      {
        key: 'industry',
        title: 'Industry or niche',
        subtitle: 'Be as specific as you can',
        required: true,
        visible: true,
        render: 'text',
        placeholder: 'e.g. AI SaaS, EdTech, D2C, HealthTech…',
      },
      {
        key: 'businessStage',
        title: 'Stage',
        subtitle: 'Where are you in the journey?',
        required: true,
        visible: true,
        render: 'chips',
        options: [
          'Idea Stage',
          'MVP Stage',
          'Pre-Revenue',
          'Early Revenue',
          'Growth Stage',
          'Scaling',
        ],
      },
      {
        key: 'targetMarket',
        title: 'Target customer',
        subtitle: 'The specific person, not the vertical',
        required: true,
        visible: true,
        render: 'textarea',
        placeholder: 'e.g. CA firms in Tier-2 cities, 5-20 clients, currently using Excel.',
      },
      {
        key: 'currentChannels',
        title: 'Current marketing channels',
        subtitle: 'What are you already using, if anything?',
        required: false,
        visible: true,
        render: 'text',
        placeholder: 'e.g. Instagram, LinkedIn, founder referrals',
      },
      {
        key: 'uniqueAdvantage',
        title: 'Your unfair advantage',
        subtitle: 'What do you have that they don\'t?',
        required: true,
        visible: true,
        render: 'textarea',
        placeholder:
          'e.g. 10 years at CAs in my family, 2,000 CA contacts on WhatsApp, native Hindi + Tamil support.',
      },
    ],
  },
  {
    id: 'pitch_readiness',
    name: 'Pitch Readiness Report',
    tagline: 'Am I ready to raise?',
    question: 'Will a Blume or Peak XV partner write me a cheque?',
    reportType: 'Investment Readiness Report',
    icon: Presentation,
    tone: 'violet',
    steps: [
      {
        key: 'businessName',
        title: 'Business name',
        subtitle: 'What investors will see',
        required: true,
        visible: true,
        render: 'text',
        placeholder: 'e.g. Thinkior AI',
      },
      {
        key: 'industry',
        title: 'Industry or niche',
        subtitle: 'Be as specific as you can',
        required: true,
        visible: true,
        render: 'text',
        placeholder: 'e.g. AI SaaS, EdTech, D2C, HealthTech…',
      },
      {
        key: 'businessStage',
        title: 'Stage',
        subtitle: 'Where are you in the journey?',
        required: true,
        visible: true,
        render: 'chips',
        options: [
          'Idea Stage',
          'MVP Stage',
          'Pre-Revenue',
          'Early Revenue',
          'Growth Stage',
          'Scaling',
        ],
      },
      {
        key: 'currentRevenue',
        title: 'Current monthly revenue',
        subtitle: 'Be honest — investors can verify',
        required: true,
        visible: true,
        render: 'chips',
        options: [
          'No Revenue',
          'Under ₹1L/month',
          '₹1L–₹10L/month',
          '₹10L–₹50L/month',
          '₹50L+/month',
        ],
      },
      {
        key: 'fundingStatus',
        title: 'Current funding status',
        subtitle: 'Where are you in the raise journey?',
        required: true,
        visible: true,
        render: 'chips',
        options: [
          'Bootstrapped',
          'Friends & Family',
          'Pre-Seed',
          'Seed',
          'Series A or above',
          'Seeking Funding',
        ],
      },
      {
        key: 'goals',
        title: 'What does success look like?',
        subtitle: 'What are you pitching for?',
        required: true,
        visible: true,
        render: 'textarea',
        placeholder:
          'e.g. Raising ₹4 Cr seed from Blume to reach ₹1 Cr MRR in 12 months and expand to South India.',
      },
    ],
  },
]

export function getTemplateById(id: string): ReportTemplate | null {
  return REPORT_TEMPLATES.find((t) => t.id === id) ?? null
}

export function getDefaultTemplate(): ReportTemplate {
  return REPORT_TEMPLATES[0]
}
