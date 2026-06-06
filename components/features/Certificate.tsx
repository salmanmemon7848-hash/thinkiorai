'use client'

/**
 * THINKIOR AI — VALIDATION CERTIFICATE
 * Premium ivory + emerald design. Captured as high-res PNG for sharing.
 */

import { useState } from 'react'

interface CertificateData {
  founder_name: string
  startup_name: string
  idea_description: string
  domain: string
  confidence: 'High' | 'Medium' | 'Low'
  verdict: 'GO'
  validated_at?: string
  certificate_id?: string
}

const BRAND = {
  ink: '#0E1A24',
  inkSoft: '#3A4A56',
  inkMuted: '#6B7A85',
  emerald: '#0F8B6C',
  emeraldDeep: '#0A6850',
  emeraldLight: '#3FE0B0',
  gold: '#B8893A',
  goldSoft: '#D9B86A',
  paper: '#F7F2E8',
  paperEdge: '#EFE7D3',
}

function generateCertId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return (
    'TH-' +
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') +
    '-' +
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  )
}

// ════════════════════════════════════════════════════════════════
// CERTIFICATE CARD (captured as PNG)
// ════════════════════════════════════════════════════════════════

function CertificateCard({ data, certId }: { data: CertificateData; certId: string }) {
  const dateStr = data.validated_at
    ? new Date(data.validated_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

  return (
    <div
      id="thinkior-certificate"
      style={{
        width: '1000px',
        height: '700px',
        background: `linear-gradient(135deg, ${BRAND.paper} 0%, ${BRAND.paperEdge} 100%)`,
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: 'relative',
        overflow: 'hidden',
        color: BRAND.ink,
        boxShadow: 'inset 0 0 140px rgba(14,26,36,0.06)',
      }}
    >
      {/* ── Outer hairline frame ── */}
      <div
        style={{
          position: 'absolute',
          inset: '24px',
          border: `1px solid ${BRAND.gold}`,
          opacity: 0.55,
          pointerEvents: 'none',
        }}
      />
      {/* ── Inner emerald frame ── */}
      <div
        style={{
          position: 'absolute',
          inset: '34px',
          border: `2px solid ${BRAND.emerald}`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Corner ornaments ── */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => {
        const isTop = pos.startsWith('t')
        const isLeft = pos.endsWith('l')
        return (
          <div
            key={pos}
            style={{
              position: 'absolute',
              [isTop ? 'top' : 'bottom']: '26px',
              [isLeft ? 'left' : 'right']: '26px',
              width: '60px',
              height: '60px',
              pointerEvents: 'none',
            }}
          >
            <svg width="60" height="60" viewBox="0 0 60 60">
              <g
                stroke={BRAND.gold}
                strokeWidth="1.2"
                fill="none"
                opacity="0.85"
                transform={`
                  ${!isLeft ? 'scale(-1,1) translate(-60,0)' : ''}
                  ${!isTop ? 'scale(1,-1) translate(0,-60)' : ''}
                `.trim()}
              >
                <path d="M8 8 L8 28 M8 8 L28 8" />
                <path d="M14 14 L14 22 M14 14 L22 14" />
                <circle cx="8" cy="8" r="2.5" fill={BRAND.gold} />
              </g>
            </svg>
          </div>
        )
      })}

      {/* ── Giant monogram watermark "T" ── */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '520px',
          fontFamily: "'Instrument Serif', 'Playfair Display', Georgia, serif",
          color: BRAND.emerald,
          opacity: 0.035,
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: '-0.05em',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        T
      </div>

      {/* ── Diagonal "VALIDATED" stamp watermark ── */}
      <div
        style={{
          position: 'absolute',
          top: '46%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-18deg)',
          fontSize: '22px',
          fontFamily: "'Inter', sans-serif",
          color: BRAND.emerald,
          opacity: 0.08,
          fontWeight: 800,
          letterSpacing: '0.8em',
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        VALIDATED · VALIDATED · VALIDATED
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '70px 90px 60px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
        }}
      >
        {/* ─── Header: brand lockup ─── */}
        <div style={{ marginBottom: '18px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '6px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke={BRAND.emerald} strokeWidth="1.5" />
              <path
                d="M7 12.5 L10.5 16 L17 9"
                fill="none"
                stroke={BRAND.emerald}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                color: BRAND.emerald,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
              }}
            >
              Thinkior&nbsp;AI
            </span>
          </div>
          <div
            style={{
              fontSize: '10px',
              color: BRAND.inkMuted,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            India's AI Co-Founder · Est. 2026
          </div>
        </div>

        {/* ─── Title ─── */}
        <h1
          style={{
            fontFamily: "'Instrument Serif', 'Playfair Display', Georgia, serif",
            fontSize: '54px',
            color: BRAND.ink,
            margin: '4px 0 2px',
            fontWeight: 400,
            fontStyle: 'italic',
            lineHeight: 1.05,
            letterSpacing: '-0.005em',
          }}
        >
          Certificate of Validation
        </h1>

        {/* ─── Divider ─── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            margin: '10px 0 26px',
          }}
        >
          <div style={{ width: '64px', height: '1px', background: BRAND.gold, opacity: 0.6 }} />
          <div
            style={{
              width: '8px',
              height: '8px',
              transform: 'rotate(45deg)',
              background: BRAND.gold,
            }}
          />
          <div style={{ width: '64px', height: '1px', background: BRAND.gold, opacity: 0.6 }} />
        </div>

        {/* ─── Awarded to ─── */}
        <p
          style={{
            fontSize: '11px',
            color: BRAND.inkMuted,
            letterSpacing: '0.36em',
            textTransform: 'uppercase',
            margin: '0 0 14px',
            fontWeight: 600,
          }}
        >
          This certifies that
        </p>

        {/* Founder name */}
        <h2
          style={{
            fontFamily: "'Instrument Serif', 'Playfair Display', Georgia, serif",
            fontSize: '46px',
            color: BRAND.ink,
            margin: '0 0 8px',
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '0.005em',
          }}
        >
          {data.founder_name}
        </h2>

        <p
          style={{
            fontSize: '13.5px',
            color: BRAND.inkSoft,
            margin: '0 0 18px',
            lineHeight: 1.6,
            maxWidth: '640px',
            alignSelf: 'center',
          }}
        >
          has successfully validated their venture through Thinkior AI's rigorous
          market-fit framework — earning a definitive&nbsp;
          <span style={{ fontWeight: 700, color: BRAND.emeraldDeep }}>GO Verdict</span>
          &nbsp;with&nbsp;
          <span style={{ fontWeight: 700, color: BRAND.emeraldDeep }}>High Confidence</span>.
        </p>

        {/* Startup name in elegant container */}
        <div
          style={{
            alignSelf: 'center',
            padding: '12px 36px',
            background: 'rgba(15,139,108,0.06)',
            border: `1px solid ${BRAND.emerald}`,
            borderRadius: '2px',
            marginBottom: '14px',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: '9px',
              color: BRAND.emeraldDeep,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: '4px',
            }}
          >
            The Venture
          </div>
          <div
            style={{
              fontFamily: "'Instrument Serif', 'Playfair Display', Georgia, serif",
              fontSize: '30px',
              color: BRAND.ink,
              fontWeight: 400,
              letterSpacing: '0.01em',
              lineHeight: 1.1,
            }}
          >
            {data.startup_name}
          </div>
          <div
            style={{
              fontSize: '10.5px',
              color: BRAND.inkMuted,
              marginTop: '6px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {data.domain}
          </div>
        </div>

        <div style={{ flexGrow: 1 }} />

        {/* ─── Footer: signature · seal · date ─── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'end',
            gap: '24px',
            marginTop: '6px',
          }}
        >
          {/* Left: AI signature */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: "'Instrument Serif', 'Playfair Display', Georgia, serif",
                fontSize: '26px',
                color: BRAND.emeraldDeep,
                fontStyle: 'italic',
                fontWeight: 400,
                marginBottom: '4px',
                height: '36px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              Thinkior&nbsp;AI
            </div>
            <div
              style={{
                borderTop: `1px solid ${BRAND.inkSoft}`,
                paddingTop: '6px',
                fontSize: '9px',
                color: BRAND.inkMuted,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Authorized Validator
            </div>
          </div>

          {/* Center: Medallion seal */}
          <div
            style={{
              position: 'relative',
              width: '128px',
              height: '128px',
              marginBottom: '-18px',
            }}
          >
            {/* Outer ring */}
            <svg width="128" height="128" viewBox="0 0 128 128" style={{ position: 'absolute', inset: 0 }}>
              {/* outer decorative ring */}
              <circle cx="64" cy="64" r="62" fill={BRAND.paper} stroke={BRAND.gold} strokeWidth="1.5" />
              <circle cx="64" cy="64" r="58" fill="none" stroke={BRAND.gold} strokeWidth="0.6" />
              {/* inner emerald disk */}
              <circle cx="64" cy="64" r="50" fill={BRAND.emeraldDeep} />
              <circle cx="64" cy="64" r="46" fill="none" stroke={BRAND.goldSoft} strokeWidth="0.8" />
              {/* sunburst rays */}
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 360) / 24
                return (
                  <line
                    key={i}
                    x1="64"
                    y1="6"
                    x2="64"
                    y2="12"
                    stroke={BRAND.gold}
                    strokeWidth="1"
                    transform={`rotate(${angle} 64 64)`}
                  />
                )
              })}
              {/* curved verify text */}
              <defs>
                <path id="cert-arc" d="M 64,64 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
              </defs>
            </svg>

            {/* Inner content */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: BRAND.paper,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '8px',
                  letterSpacing: '0.3em',
                  fontWeight: 700,
                  opacity: 0.85,
                  marginBottom: '-2px',
                }}
              >
                HIGH
              </div>
              <div
                style={{
                  fontFamily: "'Instrument Serif', 'Playfair Display', Georgia, serif",
                  fontSize: '34px',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  lineHeight: 1,
                  color: BRAND.emeraldLight,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                GO
              </div>
              <div
                style={{
                  fontSize: '7.5px',
                  letterSpacing: '0.32em',
                  fontWeight: 700,
                  marginTop: '2px',
                  opacity: 0.85,
                }}
              >
                VERDICT
              </div>
              <div
                style={{
                  width: '32px',
                  height: '1px',
                  background: BRAND.goldSoft,
                  margin: '4px 0 2px',
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  fontSize: '6.5px',
                  letterSpacing: '0.25em',
                  fontWeight: 600,
                  opacity: 0.75,
                }}
              >
                THINKIOR · IN
              </div>
            </div>

            {/* Ribbon tail */}
            <div
              style={{
                position: 'absolute',
                bottom: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '54px',
                height: '36px',
                background: BRAND.emeraldDeep,
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 70%, 0 100%)',
                zIndex: -1,
              }}
            />
          </div>

          {/* Right: Date + cert ID */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: "'Instrument Serif', 'Playfair Display', Georgia, serif",
                fontSize: '22px',
                color: BRAND.ink,
                fontStyle: 'italic',
                fontWeight: 400,
                marginBottom: '4px',
                height: '36px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              {dateStr}
            </div>
            <div
              style={{
                borderTop: `1px solid ${BRAND.inkSoft}`,
                paddingTop: '6px',
                fontSize: '9px',
                color: BRAND.inkMuted,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Date of Issue
            </div>
          </div>
        </div>

        {/* ─── Verification footer ─── */}
        <div
          style={{
            marginTop: '22px',
            paddingTop: '14px',
            borderTop: `1px dashed ${BRAND.gold}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '9px',
            color: BRAND.inkMuted,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 600,
            opacity: 0.95,
          }}
        >
          <span>Cert ID · {certId}</span>
          <span>Verify at thinkior.ai/verify</span>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// MODAL
// ════════════════════════════════════════════════════════════════

interface CertificateModalProps {
  data: CertificateData
  onClose: () => void
}

export function CertificateModal({ data, onClose }: CertificateModalProps) {
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const certId = data.certificate_id ?? generateCertId()

  const downloadPNG = async () => {
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const element = document.getElementById('thinkior-certificate')
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: BRAND.paper,
        logging: false,
      })

      const link = document.createElement('a')
      const safeName = data.startup_name.replace(/[^a-z0-9]+/gi, '-').slice(0, 30)
      link.download = `Thinkior-Validated-${safeName}-${certId}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setDownloaded(true)
    } catch {
      // download failed silently — user can retry
    }
    setDownloading(false)
  }

  const shareWhatsApp = async () => {
    await downloadPNG()

    const message = encodeURIComponent(
      `🎉 My startup *${data.startup_name}* just got officially validated by Thinkior AI — India's AI co-founder.\n\n` +
        `✅ Verdict: GO (High Confidence)\n` +
        `🏷️ Domain: ${data.domain}\n` +
        `🔖 Cert ID: ${certId}\n\n` +
        `Try it for your idea → https://thinkior.ai`
    )

    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10,10,11,0.88)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
          width: 'min(1060px, 96vw)',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '16px',
          background: '#0F0F12',
          border: '1px solid #2A2A30',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #2A2A30',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 700,
                color: '#F0F0F0',
                letterSpacing: '-0.01em',
              }}
            >
              Your Official Validation Certificate
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#7A7A82' }}>
              GO Verdict · High Confidence · Issued by Thinkior AI
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: '#1A1A1F',
              border: '1px solid #2A2A30',
              color: '#888',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Certificate preview */}
        <div
          style={{
            padding: '28px',
            background: '#0A0A0B',
            overflowX: 'auto',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              minWidth: '1000px',
              transform: 'scale(0.92)',
              transformOrigin: 'top center',
            }}
          >
            <CertificateCard data={data} certId={certId} />
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            padding: '18px 24px',
            borderTop: '1px solid #2A2A30',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <button
            onClick={shareWhatsApp}
            disabled={downloading}
            style={{
              flex: 2,
              background: '#25D366',
              border: 'none',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              padding: '13px 20px',
              borderRadius: '10px',
              cursor: downloading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {downloading ? 'Preparing…' : 'Share on WhatsApp'}
          </button>

          <button
            onClick={downloadPNG}
            disabled={downloading}
            style={{
              flex: 1,
              background: 'transparent',
              border: '1px solid #3FE0B0',
              color: '#3FE0B0',
              fontSize: '14px',
              fontWeight: 700,
              padding: '13px 20px',
              borderRadius: '10px',
              cursor: downloading ? 'wait' : 'pointer',
            }}
          >
            {downloaded ? '✓ Downloaded' : downloading ? '…' : 'Download PNG'}
          </button>
        </div>
      </div>
    </>
  )
}

// ════════════════════════════════════════════════════════════════
// TRIGGER BUTTON
// ════════════════════════════════════════════════════════════════

interface CertificateTriggerProps {
  data: CertificateData
}

export function CertificateTrigger({ data }: CertificateTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'linear-gradient(135deg, #3FE0B0 0%, #0F8B6C 100%)',
          border: 'none',
          color: '#0A0A0B',
          padding: '13px 22px',
          borderRadius: '12px',
          fontSize: '13.5px',
          fontWeight: 700,
          letterSpacing: '0.01em',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 6px 22px rgba(63,224,176,0.28)',
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="9" r="6" stroke="#0A0A0B" strokeWidth="1.8" />
          <path d="M9 13 L7 22 L12 19 L17 22 L15 13" stroke="#0A0A0B" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 9 L11 11 L15 7" stroke="#0A0A0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        View Official Certificate
      </button>

      {open && <CertificateModal data={data} onClose={() => setOpen(false)} />}
    </>
  )
}
