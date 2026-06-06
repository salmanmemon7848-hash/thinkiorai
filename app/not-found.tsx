import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-5 relative overflow-hidden">
      <div className="mesh-bg" />
      <div className="text-center max-w-md relative animate-fade-in">
        <p className="font-mono text-xs uppercase tracking-caps text-fg-muted mb-4">
          Error · 404
        </p>
        <h1 className="font-display font-bold text-[clamp(6rem,18vw,11rem)] text-fg leading-[0.85] tracking-tighter mb-6 tabular">
          404
        </h1>
        <p className="font-display font-semibold text-2xl text-fg leading-tight mb-3 tracking-tight">
          This page doesn&apos;t exist.
        </p>
        <p className="text-base text-fg-dim mb-9 leading-relaxed">
          But your startup idea does — let&apos;s validate it instead.
        </p>
        <Link
          href="/"
          className="btn-shine group inline-flex items-center gap-2 bg-fg text-bg hover:bg-fg/90 font-semibold text-sm px-6 py-3 rounded-md transition-all"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>
      </div>
    </div>
  )
}
