
export interface ReportInput {
  reportType: string
  businessName?: string
  industry: string
  businessStage: string
  businessDescription?: string
  productService?: string
  targetMarket?: string
  currentRevenue?: string
  mainChallenge?: string
  goals?: string
  teamSize?: string
  location?: string
  fundingStatus?: string
  uniqueAdvantage?: string
}

const JSON_SCHEMA = `{
  "meta": {
    "business_name": "string",
    "industry": "string",
    "stage": "string",
    "report_type": "string",
    "generated_at": "ISO date string",
    "executive_tagline": "one sentence"
  },
  "executive_summary": {
    "overview": "3-4 paragraphs",
    "key_highlights": ["5-7 bullets"],
    "verdict": "Strong Opportunity | Needs Refinement | High Risk - with 2-3 sentence reasoning"
  },
  "business_overview": {
    "description": "",
    "mission": "",
    "vision": "",
    "value_proposition": "",
    "business_model": "",
    "revenue_streams": ["..."],
    "stage_analysis": ""
  },
  "market_analysis": {
    "market_overview": "",
    "market_size": { "tam": "", "sam": "", "som": "", "growth_rate": "" },
    "market_trends": ["5-7 trends from search data"],
    "market_drivers": ["3-5"],
    "market_challenges": ["3-5"],
    "target_customer": {
      "primary_segment": "",
      "secondary_segment": "",
      "customer_pain_points": ["..."],
      "buying_behavior": ""
    }
  },
  "marketing_engine": {
    "positioning": "",
    "audience": "",
    "platform_roles": [{ "platform": "Instagram|Facebook|YouTube|LinkedIn", "role": "", "content_formats": ["..."] }],
    "content_pillars": ["..."],
    "launch_experiments": [{ "experiment": "", "success_metric": "", "timeline": "" }]
  },
  "swot_analysis": {
    "strengths": ["5-7"], "weaknesses": ["5-7"], "opportunities": ["5-7"], "threats": ["5-7"]
  },
  "marketing_strategy": {
    "positioning_statement": "",
    "brand_strategy": "",
    "go_to_market": "",
    "channels": [
      { "channel": "", "priority": "High|Medium|Low", "rationale": "", "tactics": ["3-4"] }
    ],
    "content_strategy": "",
    "growth_loops": ["2-3"],
    "customer_acquisition": "",
    "retention_strategy": ""
  },
  "growth_strategy": {
    "short_term_wins": ["5 specific next-90-day actions"],
    "medium_term_goals": ["months 4-12"],
    "long_term_vision": ["12-36 months"],
    "growth_levers": ["top 5"],
    "expansion_opportunities": ["..."],
    "partnership_opportunities": ["..."]
  },
  "financial_analysis": {
    "revenue_model_assessment": "",
    "unit_economics": { "cac_estimate": "", "ltv_estimate": "", "ltv_cac_ratio": "", "payback_period": "" },
    "cost_structure": "",
    "funding_assessment": "",
    "financial_projections_narrative": "",
    "key_financial_risks": ["3-5"]
  },
  "kpis_and_metrics": {
    "north_star_metric": "",
    "primary_kpis": [
      { "metric": "", "target": "", "frequency": "Daily|Weekly|Monthly", "why_it_matters": "" }
    ],
    "vanity_metrics_to_avoid": ["..."]
  },
  "action_plan": {
    "immediate_actions": [
      { "action": "", "owner": "", "timeline": "", "impact": "High|Medium|Low", "effort": "High|Medium|Low" }
    ],
    "strategic_priorities": ["top 3 ranked"]
  },
  "roadmap": {
    "phase_1": { "title": "", "timeline": "Month 1-3", "goals": ["3-5"], "milestones": ["..."] },
    "phase_2": { "title": "", "timeline": "Month 4-9", "goals": ["3-5"], "milestones": ["..."] },
    "phase_3": { "title": "", "timeline": "Month 10-18", "goals": ["3-5"], "milestones": ["..."] }
  },
  "risks_and_mitigation": [
    { "risk": "", "severity": "High|Medium|Low", "probability": "High|Medium|Low", "mitigation": "" }
  ],
  "recommendations": {
    "top_3_priorities": ["..."],
    "quick_wins": ["3-5 this week"],
    "avoid": ["3-5 common mistakes - direct"],
    "closing_advice": "2-3 sentence motivating, honest close"
  }
}`

export function getReportSystemPrompt(input: ReportInput): string {
  return `You are Thinkior AI — India's AI co-founder. Generate investor-grade business reports as a single valid JSON object matching the schema below. No markdown, no preamble, only raw JSON.

SCHEMA (every key required, use "" or [] if unknown):
${JSON_SCHEMA}

RULES: Use the founder's selected market context. Be specific and honest. Do not invent current market facts or competitor claims. The verdict must start with "Strong opportunity", "Proceed with caution", or "High risk". Return ONLY the JSON.`
}

export function buildReportSearchQueries(input: ReportInput): string[] {
  return [
    `${input.industry} India market size trends 2025`,
    `${input.industry} social media marketing strategy startup`,
    `${input.industry} India startup growth opportunities`,
  ]
}

export function buildReportUserPrompt(input: ReportInput, searchContext: string): string {
  return `FOUNDER INPUT:
- Report Type: ${input.reportType}
- Business Name: ${input.businessName || 'Not provided'}
- Industry: ${input.industry}
- Stage: ${input.businessStage}
- Description: ${input.businessDescription || 'Not provided'}
- Product/Service: ${input.productService || 'Not provided'}
- Target Market: ${input.targetMarket || 'Not provided'}
- Current Revenue: ${input.currentRevenue || 'Not provided'}
- Main Challenge: ${input.mainChallenge || 'Not provided'}
- Goals: ${input.goals || 'Not provided'}
- Team Size: ${input.teamSize || 'Not provided'}
- Location: ${input.location || 'Not provided'}
- Funding: ${input.fundingStatus || 'Not provided'}
- Unique Advantage: ${input.uniqueAdvantage || 'Not provided'}

LIVE WEB SEARCH RESULTS (use only for broad market context; do not make unsupported competitor or trend claims):
${searchContext || '(no live results available — rely on your own knowledge)'}

Generate the complete professional business report JSON now. Set meta.generated_at to "${new Date().toISOString()}".`
}
