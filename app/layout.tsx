import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'
import { GoogleAnalytics } from '@next/third-parties/google'
import { AuthProvider } from '@/contexts/AuthContext'
import StructuredData from '@/components/seo/StructuredData'

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
  metadataBase: new URL('https://www.thinkiorai.com'),
  title: {
    default: 'Thinkior AI — Intelligence for Indian Founders',
    template: '%s — Thinkior AI',
  },
  description:
    'AI co-founder for Indian founders. Indian competitor intel, TAM/SAM/SOM in ₹, regulatory risks, unit economics. Investor-grade reports in 60s.',
  keywords: [
    'AI co-founder',
    'Indian startup',
    'business validator',
    'competitor analysis',
    'pitch evaluation',
    'startup India',
    'founder tools',
    'business intelligence',
    'TAM SAM SOM',
    '₹ unit economics',
    'thinkior',
  ],
  authors: [{ name: 'Thinkior AI', url: 'https://www.thinkiorai.com' }],
  creator: 'Salman Memon',
  publisher: 'Thinkior AI',
  alternates: {
    canonical: 'https://www.thinkiorai.com',
  },
  openGraph: {
    title: 'Thinkior AI — Intelligence for Indian Founders',
    description:
      'AI co-founder for Indian founders. Indian competitor intel, TAM/SAM/SOM in ₹, regulatory risks, unit economics. Investor-grade reports in 60s.',
    url: 'https://www.thinkiorai.com',
    siteName: 'Thinkior AI',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thinkior AI — Intelligence for Indian Founders',
    description:
      'AI co-founder for Indian founders. Indian competitor intel, TAM/SAM/SOM in ₹, regulatory risks, unit economics. Investor-grade reports in 60s.',
    creator: '@thinkiorai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'Business & Finance',
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
        <StructuredData />
        <GoogleAnalytics gaId="G-QWQW588B0K" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
