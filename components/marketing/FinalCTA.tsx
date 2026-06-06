import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function FinalCTA() {
  return (
    <section className="relative py-24 md:py-36 border-t border-line overflow-hidden">
      {/* Gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%]">
          <div className="absolute top-0 left-1/4 w-2/3 h-full bg-accent/15 blur-[100px] rounded-full animate-glow-pulse" />
          <div className="absolute bottom-0 right-1/4 w-1/2 h-2/3 bg-signal-violet/10 blur-[80px] rounded-full animate-glow-pulse" style={{ animationDelay: '4s' }} />
        </div>
      </div>
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="relative max-w-[1240px] mx-auto px-5 sm:px-6 text-center">
        <p className="eyebrow mb-6">Bahut ho gaya planning</p>

        <h2 className="font-display font-bold text-[clamp(2.5rem,8vw,5.5rem)] text-fg leading-[0.95] tracking-tighter mb-7 max-w-4xl mx-auto">
          Build something{' '}
          <span className="font-serif-italic font-normal text-accent">
            people actually want
          </span>
          .
        </h2>

        <p className="text-lg md:text-xl text-fg-dim max-w-2xl mx-auto mb-12 leading-relaxed">
          Free to start. No credit card. Your idea is sixty seconds away from
          the truth — and the next twelve months of your life will be better for it.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link
            href="/signup"
            className="btn-shine group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent text-bg hover:bg-accent-hover font-semibold text-base px-7 py-4 rounded-lg transition-all duration-300 shadow-glow-strong"
          >
            Validate your idea now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto text-fg-dim hover:text-fg text-base font-medium px-6 py-4"
          >
            Already a member?
          </Link>
        </div>

        <p className="text-xs text-fg-muted font-mono uppercase tracking-wider">
          Join 1,832 Indian founders · 47 cities · ₹0 wasted on wrong builds
        </p>
      </div>
    </section>
  )
}
