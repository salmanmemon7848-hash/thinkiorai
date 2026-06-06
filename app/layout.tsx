import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

// Inter as Geist substitute (Geist is not yet stable in all next/font versions —
// Inter at the right tracking is what Linear uses and looks identical at display sizes)
const geist = Inter({
  subsets: ['latin'],
  variable: '--font-geist',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const geistMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const instrument = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument',
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Thinkior AI — Intelligence for Indian Founders',
  description:
    "The AI co-founder for early-stage Indian founders. Brutal verdicts, real competitor intelligence, unit economics in ₹ — built for the way India actually builds startups.",
  keywords: ['startup', 'India', 'founder', 'AI co-founder', 'business intelligence', 'venture'],
  authors: [{ name: 'Thinkior AI' }],
  openGraph: {
    title: 'Thinkior AI — Intelligence for Indian Founders',
    description: 'The AI co-founder for early-stage Indian founders.',
    url: 'https://thinkior.com',
    siteName: 'Thinkior AI',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`}
    >
      <body className="bg-bg text-fg antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
