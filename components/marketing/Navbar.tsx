'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const NAV_LINKS = [
  { label: 'Product', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass border-b border-line py-2.5'
          : 'bg-transparent py-4'
      )}
    >
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6 flex items-center justify-between gap-8">
        {/* Wordmark */}
        <Link href="/" className="flex items-baseline gap-1.5 group">
          <span className="wordmark text-fg text-[22px]">Thinkior</span>
          <span className="wordmark-ai text-[20px]">Ai</span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[13.5px] text-fg-dim hover:text-fg transition-colors font-medium px-3.5 py-2 rounded-md hover:bg-bg-card"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="text-[13.5px] text-fg-dim hover:text-fg transition-colors font-medium px-3.5 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="btn-shine group inline-flex items-center gap-1.5 bg-fg text-bg hover:bg-fg/90 font-medium text-[13.5px] px-4 py-2 rounded-md transition-all"
          >
            Get started
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-fg-dim hover:text-fg p-2"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t border-line px-5 py-6 flex flex-col gap-4 animate-fade-in-down">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-base text-fg-dim hover:text-fg transition-colors font-medium"
            >
              {item.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-line">
            <Link
              href="/login"
              className="text-base text-fg-dim text-center py-2.5"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-fg text-bg font-medium py-3 rounded-md text-sm"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
