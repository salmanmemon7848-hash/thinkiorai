import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, Instagram, Linkedin, ArrowRight } from 'lucide-react'
import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: 'Contact Us — Thinkior AI',
  description: 'Get in touch with the Thinkior AI team.',
}

const CONTACT_ITEMS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@thinkior.com',
    href: 'mailto:hello@thinkior.com',
    description: 'Best for support, billing questions, and general enquiries. We aim to reply within 1–2 business days.',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@thinkiorai',
    href: 'https://instagram.com/thinkiorai',
    description: 'Follow us for product updates, founder stories, and behind-the-scenes.',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'Thinkior AI',
    href: 'https://linkedin.com/company/thinkiorai',
    description: 'Connect with us on LinkedIn for company news and announcements.',
  },
]

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-bg">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-14 border-b border-line relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-accent/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-[800px] mx-auto px-5 sm:px-6 relative">
          <p className="eyebrow mb-4">Contact</p>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-fg tracking-tighter leading-tight mb-4">
            Get in touch
          </h1>
          <p className="text-lg text-fg-dim max-w-xl leading-relaxed">
            Have a question, feedback, or need help with your account? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-16">
        <div className="max-w-[800px] mx-auto px-5 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-fg-muted hover:text-fg-dim transition-colors font-mono uppercase tracking-wider mb-10"
          >
            ← Back to home
          </Link>

          <div className="space-y-4">
            {CONTACT_ITEMS.map(({ icon: Icon, label, value, href, description }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group flex items-start gap-5 p-6 rounded-2xl bg-bg-card border border-line hover:border-line-strong hover:bg-bg-elevated transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-bg-elevated border border-line flex items-center justify-center flex-shrink-0 group-hover:border-accent/30 group-hover:bg-accent/5 transition-all">
                  <Icon className="w-5 h-5 text-fg-dim group-hover:text-accent transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-fg-muted font-mono uppercase tracking-wider mb-1">{label}</p>
                  <p className="font-display font-semibold text-fg text-lg tracking-tight group-hover:text-accent transition-colors">
                    {value}
                  </p>
                  <p className="text-sm text-fg-dim mt-1.5 leading-relaxed">{description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-fg-muted mt-1 flex-shrink-0 group-hover:text-fg-dim group-hover:translate-x-0.5 transition-all" />
              </a>
            ))}
          </div>

          {/* Support note */}
          <div className="mt-10 p-6 rounded-2xl border border-line bg-bg-surface">
            <p className="text-sm text-fg-dim leading-relaxed">
              <span className="text-fg font-medium">Before reaching out</span> — check our{' '}
              <Link href="/#faq" className="text-accent hover:text-accent-hover transition-colors">
                FAQ section
              </Link>{' '}
              on the homepage. It covers common questions about plans, usage limits, and billing. For account-related issues, you can also manage your subscription directly from{' '}
              <Link href="/settings" className="text-accent hover:text-accent-hover transition-colors">
                Settings
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
