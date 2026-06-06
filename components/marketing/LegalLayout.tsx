import Link from 'next/link'
import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'

interface LegalLayoutProps {
  eyebrow: string
  title: string
  subtitle?: string
  lastUpdated: string
  children: React.ReactNode
}

export default function LegalLayout({ eyebrow, title, subtitle, lastUpdated, children }: LegalLayoutProps) {
  return (
    <main className="min-h-screen bg-bg">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-14 border-b border-line relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-accent/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-[800px] mx-auto px-5 sm:px-6 relative">
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-fg tracking-tighter leading-tight mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-fg-dim max-w-xl leading-relaxed">{subtitle}</p>
          )}
          <p className="text-xs text-fg-muted font-mono mt-6 uppercase tracking-wider">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="py-16">
        <div className="max-w-[800px] mx-auto px-5 sm:px-6">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-fg-muted hover:text-fg-dim transition-colors font-mono uppercase tracking-wider mb-10"
          >
            ← Back to home
          </Link>
          <div className="prose-legal">{children}</div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
