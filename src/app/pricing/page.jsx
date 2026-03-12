'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

// ── Plan data ────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Free',
    tagline: 'For personal sketches',
    monthlyPrice: 0,
    annualPrice: 0,
    color: '#4A90D9',
    highlight: false,
    features: [
      'Unlimited local canvases',
      'All shape & drawing tools',
      'PNG, SVG, PDF export',
      'LixScript diagrams',
      '1 shared link at a time',
      'Community support',
    ],
    cta: 'Start Sketching',
    ctaHref: '/c/new',
  },
  {
    name: 'Pro',
    tagline: 'For power users & freelancers',
    monthlyPrice: 8,
    annualPrice: 6,
    color: '#8B88E8',
    highlight: true,
    features: [
      'Everything in Free',
      'Unlimited shared links',
      'Real-time collaboration (up to 10)',
      'Cloud auto-save & history',
      'Custom fonts & themes',
      'Priority support',
    ],
    cta: 'Get Pro',
    ctaHref: null,
  },
  {
    name: 'Team',
    tagline: 'For teams & organizations',
    monthlyPrice: 16,
    annualPrice: 12,
    color: '#D99BF0',
    highlight: false,
    features: [
      'Everything in Pro',
      'Unlimited collaborators',
      'Team workspaces & permissions',
      'Admin dashboard & analytics',
      'SSO / SAML authentication',
      'Dedicated support & SLA',
    ],
    cta: 'Contact Us',
    ctaHref: null,
  },
]

// ── Dot grid background ──────────────────────────────────────────────────────

function DotGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" width="100%" height="100%">
      <defs>
        <pattern id="pricing-dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.8" fill="rgba(139, 136, 232, 0.15)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pricing-dot-grid)" />
    </svg>
  )
}

// ── RoughJS card border ──────────────────────────────────────────────────────

function RoughCard({ children, color, highlight, className = '' }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    let raf
    const draw = async () => {
      const rough = (await import('roughjs')).default
      const { width, height } = container.getBoundingClientRect()
      canvas.width = width * 2
      canvas.height = height * 2
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      const rc = rough.canvas(canvas)
      const ctx = canvas.getContext('2d')
      ctx.scale(2, 2)
      ctx.clearRect(0, 0, width, height)

      rc.rectangle(4, 4, width - 8, height - 8, {
        stroke: color,
        strokeWidth: highlight ? 2 : 1.2,
        roughness: 1.2,
        bowing: 0.6,
        fill: highlight ? `${color}08` : 'transparent',
        fillStyle: 'solid',
      })
    }

    raf = requestAnimationFrame(draw)
    const ro = new ResizeObserver(() => { raf = requestAnimationFrame(draw) })
    ro.observe(container)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [color, highlight])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ── RoughJS underline ────────────────────────────────────────────────────────

function RoughUnderline({ width = 120, color = '#8B88E8' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draw = async () => {
      const rough = (await import('roughjs')).default
      canvas.width = width * 2
      canvas.height = 16
      canvas.style.width = width + 'px'
      canvas.style.height = '8px'
      const rc = rough.canvas(canvas)
      const ctx = canvas.getContext('2d')
      ctx.scale(2, 2)
      rc.line(0, 4, width, 4, { stroke: color, strokeWidth: 1.5, roughness: 1.5 })
    }
    draw()
  }, [width, color])

  return <canvas ref={canvasRef} className="block mx-auto mt-1" />
}

// ── RoughJS toggle switch ────────────────────────────────────────────────────

function RoughToggle({ isAnnual, onToggle }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draw = async () => {
      const rough = (await import('roughjs')).default
      const w = 56
      const h = 28
      canvas.width = w * 2
      canvas.height = h * 2
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      const rc = rough.canvas(canvas)
      const ctx = canvas.getContext('2d')
      ctx.scale(2, 2)
      ctx.clearRect(0, 0, w, h)

      // Track
      rc.rectangle(2, 2, w - 4, h - 4, {
        stroke: '#8B88E8',
        strokeWidth: 1.2,
        roughness: 1,
        bowing: 0.5,
        fill: isAnnual ? '#8B88E820' : 'transparent',
        fillStyle: 'solid',
      })

      // Knob
      const knobX = isAnnual ? w - 16 : 16
      rc.circle(knobX, h / 2, 16, {
        stroke: '#8B88E8',
        strokeWidth: 1.5,
        roughness: 0.8,
        fill: '#8B88E8',
        fillStyle: 'solid',
      })
    }
    draw()
  }, [isAnnual])

  return (
    <canvas
      ref={canvasRef}
      className="cursor-pointer"
      onClick={onToggle}
    />
  )
}

// ── RoughJS checkmark bullet ─────────────────────────────────────────────────

function RoughCheck({ color }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draw = async () => {
      const rough = (await import('roughjs')).default
      canvas.width = 24
      canvas.height = 24
      canvas.style.width = '12px'
      canvas.style.height = '12px'
      const rc = rough.canvas(canvas)
      const ctx = canvas.getContext('2d')
      ctx.scale(2, 2)
      rc.line(2, 6, 5, 10, { stroke: color, strokeWidth: 1.5, roughness: 0.5 })
      rc.line(5, 10, 10, 2, { stroke: color, strokeWidth: 1.5, roughness: 0.5 })
    }
    draw()
  }, [color])

  return <canvas ref={canvasRef} className="shrink-0 mt-0.5" />
}

// ── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, isAnnual, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
    >
      <RoughCard color={plan.color} highlight={plan.highlight} className="h-full">
        <div className="p-6 flex flex-col h-full min-h-[420px]">
          {/* Badge */}
          {plan.highlight && (
            <div className="mb-3">
              <span
                className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-medium"
                style={{ color: plan.color, backgroundColor: `${plan.color}15` }}
              >
                Most Popular
              </span>
            </div>
          )}

          {/* Name & tagline */}
          <h3
            className="text-xl font-medium font-[lixFont]"
            style={{ color: plan.color }}
          >
            {plan.name}
          </h3>
          <p className="text-text-dim text-xs mt-1 mb-4">{plan.tagline}</p>

          {/* Price */}
          <div className="mb-5">
            <div className="flex items-end gap-1">
              <span className="text-3xl font-medium text-text-primary font-[lixFont]">
                {price === 0 ? 'Free' : `$${price}`}
              </span>
              {price > 0 && (
                <span className="text-text-dim text-xs mb-1">/ month</span>
              )}
            </div>
            {isAnnual && price > 0 && (
              <p className="text-[10px] mt-1" style={{ color: plan.color }}>
                Billed ${price * 12}/year — save ${(plan.monthlyPrice - plan.annualPrice) * 12}/yr
              </p>
            )}
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-2.5 mb-6 flex-1">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-text-secondary text-xs leading-relaxed">
                <RoughCheck color={plan.color} />
                {feature}
              </li>
            ))}
          </ul>

          {/* CTA */}
          {plan.ctaHref ? (
            <Link
              href={plan.ctaHref}
              className="block w-full text-center py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: plan.highlight ? plan.color : 'transparent',
                color: plan.highlight ? '#fff' : plan.color,
                border: plan.highlight ? 'none' : `1.5px solid ${plan.color}40`,
              }}
            >
              {plan.cta}
            </Link>
          ) : (
            <button
              disabled
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 opacity-60 cursor-not-allowed"
              style={{
                backgroundColor: plan.highlight ? plan.color : 'transparent',
                color: plan.highlight ? '#fff' : plan.color,
                border: plan.highlight ? 'none' : `1.5px solid ${plan.color}40`,
              }}
            >
              {plan.cta}
            </button>
          )}
        </div>
      </RoughCard>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true)
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true })

  return (
    <div className="relative min-h-screen bg-[#0a0a12] text-text-primary overflow-hidden">
      <DotGrid />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
          animate={headerInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-text-dim text-xs hover:text-text-secondary transition-colors mb-8"
          >
            <i className="bx bx-arrow-back text-sm" />
            Back to home
          </Link>

          <h1 className="text-3xl md:text-4xl font-medium font-[lixFont] text-text-primary mb-3">
            Simple pricing
          </h1>
          <RoughUnderline width={160} color="#8B88E8" />
          <p className="text-text-dim text-sm mt-4 max-w-md mx-auto leading-relaxed">
            LixSketch is free and open source. Paid plans add collaboration, cloud storage, and team features.
          </p>

          {/* Alpha banner */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <i className="bx bx-flask text-amber-400 text-sm" />
            <span className="text-amber-300/90 text-xs">
              Pricing is tentative — LixSketch is currently in <strong>alpha</strong>. All features are free during the preview.
            </span>
          </div>

          {/* Monthly / Annual toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-xs transition-colors ${!isAnnual ? 'text-text-primary' : 'text-text-dim'}`}>
              Monthly
            </span>
            <RoughToggle isAnnual={isAnnual} onToggle={() => setIsAnnual(!isAnnual)} />
            <span className={`text-xs transition-colors ${isAnnual ? 'text-text-primary' : 'text-text-dim'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="text-[10px] text-[#8B88E8] bg-[#8B88E8]/10 px-2 py-0.5 rounded-full">
                Save 25%
              </span>
            )}
          </div>
        </motion.div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} isAnnual={isAnnual} index={i} />
          ))}
        </div>

        {/* FAQ / comparison */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-lg font-[lixFont] text-text-primary mb-2">All plans include</h2>
          <RoughUnderline width={140} color="#4A90D9" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-3xl mx-auto">
            {[
              { icon: 'bx-pencil', label: 'All drawing tools' },
              { icon: 'bx-code-alt', label: 'LixScript DSL' },
              { icon: 'bx-export', label: 'PNG / SVG / PDF' },
              { icon: 'bx-lock-alt', label: 'E2E encryption' },
              { icon: 'bx-git-branch', label: 'Open source' },
              { icon: 'bx-palette', label: 'RoughJS aesthetic' },
              { icon: 'bx-undo', label: 'Undo / redo' },
              { icon: 'bx-fullscreen', label: 'Infinite canvas' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-text-dim text-xs">
                <i className={`bx ${item.icon} text-sm text-[#8B88E8]`} />
                {item.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-text-dim text-xs mb-4">
            Questions? Want a custom plan? Reach out on{' '}
            <a
              href="https://github.com/elixpo/lixsketch/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8B88E8] hover:underline"
            >
              GitHub Discussions
            </a>
          </p>
          <Link
            href="/c/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#8B88E8] hover:bg-[#7a77d6] text-white text-sm rounded-lg transition-all duration-200"
          >
            <i className="bx bx-pencil text-sm" />
            Start Sketching — It's Free
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
