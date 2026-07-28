import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'

export const metadata: Metadata = {
  title: 'About the Founder — Thinkior AI',
  description:
    'Salman Memon, 16, is the solo founder of Thinkior AI — an AI co-founder platform built for Indian startup founders, launched from Gariyaband, Chhattisgarh.',
}

/* ─── data ──────────────────────────────────────────────────────────────── */

const TOOLS = [
  'Business Validator',
  'Marketing Engine',
  'Ideas Desk',
  'Leads Finder',
  'Co-founder Desk',
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-bg">
      <Navbar />

      {/* ── 1. Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 border-b border-line relative overflow-hidden">
        {/* Subtle tint blob */}
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-accent/[0.04] to-transparent pointer-events-none" />

        <div className="max-w-[800px] mx-auto px-5 sm:px-6 relative">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-fg-muted hover:text-fg-dim transition-colors font-mono uppercase tracking-wider mb-10"
          >
            ← Back to home
          </Link>

          {/* Name */}
          <h1 className="font-display font-bold text-5xl md:text-6xl text-fg tracking-tighter leading-none mb-3">
            Salman Memon
          </h1>

          {/* Role */}
          <p className="text-xl text-fg-dim mb-6 font-medium">
            Founder, Thinkior AI
          </p>

          {/* Pills */}
          <div className="flex flex-wrap gap-2 mb-10">
            {['16 years old', 'Gariyaband, Chhattisgarh', 'Solo founder'].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-line bg-bg-card text-xs text-fg-dim font-mono tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-line" />
        </div>
      </section>

      {/* ── 2. The Story ──────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-line">
        <div className="max-w-[800px] mx-auto px-5 sm:px-6">
          <p className="eyebrow mb-5">The story</p>

          <div className="space-y-5 text-[15px] text-fg-dim leading-relaxed">
            <p>
              My name is Salman Memon. I am 16 years old, a Class 12th student from
              Gariyaband, Chhattisgarh — a small town most people have never heard of.
              I am the founder of Thinkior AI, an AI co-founder platform built
              specifically for Indian startup founders.
            </p>
            <p>
              Like many aspiring founders, I once had a startup idea I believed in. But
              when I tried to validate it — to understand the real Indian market, the
              competitors, the unit economics in ₹ — I found nothing useful. ChatGPT was
              encouraging but vague. There were no tools that understood GST, Tier-2
              cities, or Indian startup ecosystems. That pain became the product.
            </p>
            <p>
              I taught myself to build using a mix of self-learning and AI tools. Within
              a few weeks, Thinkior AI was live — with a Business Validator, Competitor
              Intel engine, Leads Finder, Ideas Desk, and a Co-founder Desk available
              24/7 in Hindi, Hinglish, or English. No co-founder. No funding. No office.
              Just a Class 12th student with a laptop in Chhattisgarh.
            </p>
            <p>
              My vision is clear: build India&apos;s most trusted startup intelligence
              platform — and prove that world-class products can be built from small
              towns too. Gariyaband is not a limitation. It is part of the story.
            </p>
          </div>

          {/* Quote card */}
          <blockquote className="mt-10 p-6 rounded-xl border border-line-strong bg-bg-elevated relative">
            {/* Accent left rule */}
            <div className="absolute left-0 top-6 bottom-6 w-[3px] bg-accent rounded-full" />
            <p className="font-serif-italic text-lg text-fg leading-relaxed pl-1">
              &ldquo;I didn&apos;t build Thinkior AI because I read about the problem. I built
              it because I lived it.&rdquo;
            </p>
            <p className="mt-3 text-sm text-fg-muted font-mono pl-1">— Salman Memon</p>
          </blockquote>
        </div>
      </section>

      {/* ── 3. What I built ───────────────────────────────────────────────── */}
      <section className="py-16 border-b border-line">
        <div className="max-w-[800px] mx-auto px-5 sm:px-6">
          <p className="eyebrow mb-6">What I built</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {TOOLS.map((tool, i) => (
              <div
                key={tool}
                className="card-premium rounded-xl px-5 py-4 flex items-center gap-3 group hover:bg-bg-elevated transition-all duration-300"
              >
                {/* Numbered dot */}
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center font-mono text-[10px] text-accent">
                  {i + 1}
                </span>
                <span className="text-[14px] text-fg font-medium">{tool}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Passion & vision ───────────────────────────────────────────── */}
      <section className="py-16 border-b border-line">
        <div className="max-w-[800px] mx-auto px-5 sm:px-6">
          <p className="eyebrow mb-6">What drives me</p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="card-premium rounded-xl p-6 hover:bg-bg-elevated transition-all duration-300">
              <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent"
                >
                  <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-base text-fg tracking-tight mb-2">
                AI &amp; Technology
              </h3>
              <p className="text-[14px] text-fg-dim leading-relaxed">
                Building at the intersection of AI and real Indian problems.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card-premium rounded-xl p-6 hover:bg-bg-elevated transition-all duration-300">
              <div className="w-8 h-8 rounded-lg bg-signal-pivot/15 border border-signal-pivot/30 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-signal-pivot"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-base text-fg tracking-tight mb-2">
                Small-town India
              </h3>
              <p className="text-[14px] text-fg-dim leading-relaxed">
                Proving that Gariyaband, Chhattisgarh can ship products used across
                47 cities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CTA ────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-[800px] mx-auto px-5 sm:px-6 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-fg tracking-tighter leading-tight mb-3">
            Build something people actually want.
          </h2>
          <p className="text-[15px] text-fg-dim mb-8">
            Thinkior AI is free to start. No credit card needed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="btn-shine group inline-flex items-center gap-2 bg-fg text-bg hover:bg-fg/90 font-semibold text-[14px] px-6 py-3 rounded-md transition-all"
            >
              Try Thinkior AI
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:translate-x-0.5 transition-transform"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="mailto:hello@thinkior.com"
              className="inline-flex items-center gap-2 border border-line hover:border-line-strong bg-bg-card hover:bg-bg-elevated text-fg-dim hover:text-fg font-medium text-[14px] px-6 py-3 rounded-md transition-all"
            >
              Get in touch
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
