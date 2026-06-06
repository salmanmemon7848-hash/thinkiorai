'use client'

import { Search } from 'lucide-react'
import AIChatInterface from './AIChatInterface'

const STARTERS = [
  'Who are the real competitors for a mental health app for Indian college students?',
  'Research the Indian EdTech market for skill-based short courses',
  'Find competitors for a FinTech app helping unorganised sector workers get credit',
  'Map the D2C beauty market in India — who are the players and what are they missing?',
]

export default function CompetitorChat() {
  return (
    <AIChatInterface
      feature="competitor"
      title="Competitor Intel"
      description="Map your battlefield — Indian competitors, weaknesses, and white space."
      icon={<Search className="w-5 h-5" strokeWidth={1.75} />}
      starters={STARTERS}
      accentColor="insight"
    />
  )
}
