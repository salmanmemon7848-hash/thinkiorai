import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg-sub">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-14">
        {/* Top grid */}
        <div className="grid lg:grid-cols-12 gap-10 pb-10 mb-10 border-b border-line">
          {/* Brand col */}
          <div className="lg:col-span-5">
            <Link href="/" className="flex items-baseline gap-2 mb-5">
              <span className="wordmark text-fg text-2xl">Thinkior</span>
              <span className="wordmark-ai text-[22px]">Ai</span>
            </Link>
            <p className="text-sm text-fg-dim leading-relaxed max-w-sm mb-5">
              The AI co-founder for Indian founders.
              Brutal verdicts, real Indian intelligence — built for the way India
              actually builds startups.
            </p>
            <div className="flex items-center gap-2 text-xs text-fg-muted font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
              <span className="uppercase tracking-wider">All systems operational</span>
            </div>
          </div>

          {/* Product col */}
          <div className="lg:col-span-2">
            <p className="eyebrow mb-4">Product</p>
            <ul className="space-y-2.5">
              <li><Link href="#features" className="text-sm text-fg-dim hover:text-fg transition-colors">Tools</Link></li>
              <li><Link href="#how-it-works" className="text-sm text-fg-dim hover:text-fg transition-colors">How it works</Link></li>
              <li><Link href="#pricing" className="text-sm text-fg-dim hover:text-fg transition-colors">Pricing</Link></li>
              <li><Link href="#faq" className="text-sm text-fg-dim hover:text-fg transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Account col */}
          <div className="lg:col-span-2">
            <p className="eyebrow mb-4">Account</p>
            <ul className="space-y-2.5">
              <li><Link href="/login" className="text-sm text-fg-dim hover:text-fg transition-colors">Sign in</Link></li>
              <li><Link href="/signup" className="text-sm text-fg-dim hover:text-fg transition-colors">Get started</Link></li>
              <li><Link href="/dashboard" className="text-sm text-fg-dim hover:text-fg transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Connect col */}
          <div className="lg:col-span-3">
            <p className="eyebrow mb-4">Connect</p>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:hello@thinkior.com" className="text-sm text-fg hover:text-accent transition-colors">
                  hello@thinkior.com
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/thinkiorai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-fg-dim hover:text-fg transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/company/thinkiorai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-fg-dim hover:text-fg transition-colors"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-fg-muted">
            © {new Date().getFullYear()} Thinkior AI. Built in India, for India&apos;s founders.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-fg-muted hover:text-fg-dim transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-fg-muted hover:text-fg-dim transition-colors">
              Terms
            </Link>
            <span className="text-xs text-fg-muted font-mono">v 3.0</span>
          </div>
        </div>
      </div>

      {/* Giant wordmark backdrop */}
      <div className="overflow-hidden border-t border-line">
        <div className="text-center py-10">
          <span
            className="font-display font-black tracking-tighter text-fg/[0.04] leading-none select-none"
            style={{ fontSize: 'clamp(6rem, 22vw, 20rem)' }}
          >
            Thinkior
          </span>
        </div>
      </div>
    </footer>
  )
}
