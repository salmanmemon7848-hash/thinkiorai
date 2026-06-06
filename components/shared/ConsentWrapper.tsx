'use client'

import { useState } from 'react'
import { ConsentBanner } from '@/components/features/DPDPCompliance'

export default function ConsentWrapper({ children }: { children: React.ReactNode }) {
  const [consentReady, setConsentReady] = useState(false)

  return (
    <>
      {!consentReady && <ConsentBanner onComplete={() => setConsentReady(true)} />}
      {children}
    </>
  )
}
