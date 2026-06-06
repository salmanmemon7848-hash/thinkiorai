'use client'

import { Presentation } from 'lucide-react'
import AIChatInterface from './AIChatInterface'

const STARTERS = [
  'Evaluate my pitch: [paste your pitch deck content or key bullet points]',
  "I'm pitching to angels next week — what are the 3 things that will kill my pitch?",
  'Help me rewrite my market size slide — investors always question it',
  'My traction slide is weak. I have 200 signups but 0 paying customers. What do I say?',
]

export default function PitchChat() {
  return (
    <AIChatInterface
      feature="pitch"
      title="Pitch Evaluator"
      description="Score your pitch like a YC partner × Blume VC. Honest. Specific. Actionable."
      icon={<Presentation className="w-5 h-5" strokeWidth={1.75} />}
      starters={STARTERS}
      accentColor="violet"
    />
  )
}
