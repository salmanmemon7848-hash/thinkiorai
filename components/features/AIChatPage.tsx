'use client'

import { MessageSquare } from 'lucide-react'
import AIChatInterface from './AIChatInterface'

const STARTERS = [
  'When should I raise my first round vs stay bootstrapped?',
  'How do I find my first 10 B2B customers in India with zero budget?',
  "What's the best way to structure equity for my first hire in India?",
  'Walk me through registering under DPIIT Startup India — what are the actual benefits?',
]

export default function AIChatPage() {
  return (
    <AIChatInterface
      feature="chat"
      title="Co-founder Desk"
      description="Your always-on co-founder. Strategy, fundraising, ops, GTM — with Indian context."
      icon={<MessageSquare className="w-5 h-5" strokeWidth={1.75} />}
      starters={STARTERS}
      accentColor="fg"
    />
  )
}
