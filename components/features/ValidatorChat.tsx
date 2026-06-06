'use client'

import { CheckCircle2 } from 'lucide-react'
import AIChatInterface from './AIChatInterface'

const STARTERS = [
  'Validate my idea: a B2B SaaS for managing GST compliance for Indian MSMEs',
  'I want to build a D2C protein supplement brand for Tier-2 city gym-goers',
  'Should I build a hyperlocal services marketplace for domestic workers in Bangalore?',
  'My idea: an AI tutor for vernacular-medium students in Class 9-12. Is there a market?',
]

export default function ValidatorChat() {
  return (
    <AIChatInterface
      feature="validator"
      title="Business Validator"
      description="A brutal GO / KILL / PIVOT verdict on your startup idea."
      icon={<CheckCircle2 className="w-5 h-5" strokeWidth={1.75} />}
      starters={STARTERS}
      accentColor="accent"
    />
  )
}
