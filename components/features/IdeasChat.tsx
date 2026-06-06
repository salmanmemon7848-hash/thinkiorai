'use client'

import { Lightbulb } from 'lucide-react'
import AIChatInterface from './AIChatInterface'

const STARTERS = [
  'I have an idea for a WhatsApp-based accounting tool for kirana stores — help me develop it',
  "I want to build in the AgriTech space but don't have a specific idea yet",
  "My idea is struggling — I think I need to pivot. Here's what I've built so far...",
  'Help me find startup ideas in the ₹299–499/month B2B SaaS space for Indian SMEs',
]

export default function IdeasChat() {
  return (
    <AIChatInterface
      feature="ideas"
      title="Ideas Desk"
      description="Develop, stress-test, and find the shortest path to first revenue."
      icon={<Lightbulb className="w-5 h-5" strokeWidth={1.75} />}
      starters={STARTERS}
      accentColor="pivot"
    />
  )
}
