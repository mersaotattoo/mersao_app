'use client'
/**
 * ABERTURA CINEMÁTICA — "Cofre de relojoaria".
 * Duas portas de obsidiana, cada uma com metade de uma engrenagem de relógio gravada,
 * giram em sincronia, travam com um pulso de vibração e se abrem em 3D (perspectiva real)
 * para revelar o site, que já está montado por baixo.
 *
 * Feita só com Framer Motion + SVG: leve, funciona em qualquer celular e não precisa de WebGL.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import { haptics } from '@/lib/haptics'

/** Gera o contorno de uma engrenagem com dentes trapezoidais. */
function gearPath(teeth: number, rOut: number, rRoot: number) {
  const step = (Math.PI * 2) / teeth
  const pt = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`
  const pts: string[] = []
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    pts.push(pt(rRoot, a), pt(rOut, a + step * 0.14), pt(rOut, a + step * 0.38), pt(rRoot, a + step * 0.52))
  }
  return `M${pts.join('L')}Z`
}

const OUTER = gearPath(44, 492, 452)
const INNER = gearPath(26, 292, 262)

/** Marcações finas de "bezel" de relógio. */
function Ticks() {
  const items = useMemo(
    () =>
      Array.from({ length: 120 }, (_, i) => {
        const a = (i / 120) * Math.PI * 2
        const major = i % 10 === 0
        const r1 = major ? 392 : 400
        const r2 = 412
        return { x1: r1 * Math.cos(a), y1: r1 * Math.sin(a), x2: r2 * Math.cos(a), y2: r2 * Math.sin(a), major }
      }),
    [],
  )
  return (
    <g stroke="#D6BC8A" strokeLinecap="round">
      {items.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.major ? 2 : 1} opacity={t.major ? 0.7 : 0.32} />
      ))}
    </g>
  )
}

const GearDefs = ({ uid }: { uid: string }) => (
  <defs>
    <linearGradient id={`gold-${uid}`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#F3E7C6" />
      <stop offset="0.5" stopColor="#B8975A" />
      <stop offset="1" stopColor="#6B5530" />
    </linearGradient>
    <radialGradient id={`body-${uid}`} cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#1d1d20" />
      <stop offset="1" stopColor="#0d0d0f" />
    </radialGradient>
  </defs>
)

/** Camadas da engrenagem (metade visível em cada porta). */
function GearFace({ uid, rot, rotInner }: { uid: string; rot: MotionValue<number>; rotInner: MotionValue<number> }) {
  return (
    <div className="absolute inset-0">
      {/* anel fixo com marcações */}
      <svg viewBox="-500 -500 1000 1000" className="absolute inset-0 h-full w-full">
        <GearDefs uid={`s${uid}`} />
        <circle r="428" fill="none" stroke="#D6BC8A" strokeOpacity="0.18" />
        <Ticks />
      </svg>

      {/* engrenagem externa */}
      <motion.div style={{ rotate: rot }} className="absolute inset-0">
        <svg viewBox="-500 -500 1000 1000" className="h-full w-full">
          <GearDefs uid={`o${uid}`} />
          <path d={OUTER} fill={`url(#body-o${uid})`} stroke={`url(#gold-o${uid})`} strokeWidth="2.2" strokeOpacity="0.9" />
          <circle r="372" fill="none" stroke={`url(#gold-o${uid})`} strokeWidth="1.2" strokeOpacity="0.55" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2
            return <circle key={i} cx={316 * Math.cos(a)} cy={316 * Math.sin(a)} r="38" fill="#0A0A0B" stroke={`url(#gold-o${uid})`} strokeWidth="1.2" strokeOpacity="0.6" />
          })}
        </svg>
      </motion.div>

      {/* engrenagem interna (gira ao contrário) */}
      <motion.div style={{ rotate: rotInner }} className="absolute inset-0">
        <svg viewBox="-500 -500 1000 1000" className="h-full w-full">
          <GearDefs uid={`i${uid}`} />
          <path d={INNER} fill={`url(#body-i${uid})`} stroke={`url(#gold-i${uid})`} strokeWidth="2" strokeOpacity="0.95" />
          <circle r="212" fill="none" stroke={`url(#gold-i${uid})`} strokeWidth="1" strokeOpacity="0.5" />
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2
            return <circle key={i} cx={150 * Math.cos(a)} cy={150 * Math.sin(a)} r="24" fill="#0A0A0B" stroke={`url(#gold-i${uid})`} strokeWidth="1" strokeOpacity="0.55" />
          })}
        </svg>
      </motion.div>
    </div>
  )
}

interface Props {
  nome?: string
  /** disparado quando as portas começam a abrir */
  onOpen?: () => void
  /** disparado quando tudo terminou (pode desmontar) */
  onDone: () => void
}

const GEAR_SIZE = 'w-[min(96vw,90dvh,920px)] h-[min(96vw,90dvh,920px)]'
const DOOR_BG = 'linear-gradient(180deg, #0c0c0e 0%, #131316 50%, #0a0a0b 100%)'

export default function SplashScreen({ nome = 'Mersão Tattoo', onOpen, onDone }: Props) {
  const rot = useMotionValue(0)
  const rotInner = useTransform(rot, (v) => -v * 1.7)
  const [open, setOpen] = useState(false)
  const [canSkip, setCanSkip] = useState(false)
  const timers = useRef<number[]>([])
  const openRef = useRef(onOpen)
  const doneRef = useRef(onDone)
  openRef.current = onOpen
  doneRef.current = onDone

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  const triggerOpen = (finishIn: number) => {
    setOpen(true)
    openRef.current?.()
    haptics.tattoo()
    later(() => doneRef.current(), finishIn)
  }

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const ctrl = animate(rot, 150, { duration: 3.3, ease: [0.5, 0, 0.2, 1] })
    // batimentos que aceleram, como um coração antes de abrir
    ;[450, 1150, 1750, 2250, 2600].forEach((t) => later(() => haptics.heartbeat(), t))
    later(() => setCanSkip(true), 600)
    later(() => triggerOpen(1900), 3150)

    return () => {
      document.body.style.overflow = prev
      ctrl.stop()
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const skip = () => {
    if (open) return
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    triggerOpen(1100)
  }

  const doorTransition = { duration: open ? 1.7 : 0, ease: [0.77, 0, 0.18, 1] as const }

  return (
    <div className="fixed inset-0 z-[100]" style={{ perspective: '1900px' }} aria-hidden>
      {/* PORTA ESQUERDA */}
      <motion.div
        className="absolute inset-y-0 left-0 w-[50.3%] overflow-hidden"
        style={{ originX: 0, originY: 0.5, background: DOOR_BG }}
        animate={{ rotateY: open ? 100 : 0, filter: open ? 'brightness(0.3)' : 'brightness(1)' }}
        transition={doorTransition}
      >
        <div className={`absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 ${GEAR_SIZE}`}>
          <GearFace uid="L" rot={rot} rotInner={rotInner} />
        </div>
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gold/[0.07] to-transparent" />
      </motion.div>

      {/* PORTA DIREITA */}
      <motion.div
        className="absolute inset-y-0 right-0 w-[50.3%] overflow-hidden"
        style={{ originX: 1, originY: 0.5, background: DOOR_BG }}
        animate={{ rotateY: open ? -100 : 0, filter: open ? 'brightness(0.3)' : 'brightness(1)' }}
        transition={doorTransition}
      >
        <div className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 ${GEAR_SIZE}`}>
          <GearFace uid="R" rot={rot} rotInner={rotInner} />
        </div>
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gold/[0.07] to-transparent" />
      </motion.div>

      {/* fio de luz na emenda */}
      <motion.div
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gold to-transparent"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={open ? { scaleY: 1, opacity: 0 } : { scaleY: 1, opacity: 0.8 }}
        transition={{ duration: open ? 0.5 : 1.4, ease: 'easeOut' }}
      />

      {/* emblema central */}
      <motion.div
        className="absolute left-1/2 top-1/2 grid h-[clamp(96px,22vmin,168px)] w-[clamp(96px,22vmin,168px)] -translate-x-1/2 -translate-y-1/2 place-items-center"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={open ? { opacity: 0, scale: 1.5 } : { opacity: 1, scale: 1 }}
        transition={{ duration: open ? 0.6 : 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-0 rounded-full bg-obsidian/85 shadow-[0_0_60px_rgba(0,0,0,.9)] backdrop-blur-sm" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="47" fill="none" stroke="#D6BC8A" strokeOpacity="0.2" strokeWidth="0.8" />
          <motion.circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="#D6BC8A"
            strokeWidth="1.2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: [0.5, 0, 0.2, 1] }}
          />
        </svg>
        <span className="gold-text relative font-display text-[clamp(2.2rem,8vmin,3.6rem)] leading-none">M</span>
      </motion.div>

      {/* assinatura */}
      <motion.div
        className="absolute inset-x-0 bottom-[11%] text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={open ? { opacity: 0, y: -6 } : { opacity: 1, y: 0 }}
        transition={{ duration: open ? 0.4 : 1, delay: open ? 0 : 0.5 }}
      >
        <p className="font-cinzel text-[0.8rem] tracking-[0.5em] text-gold/90 sm:text-sm">{nome.toUpperCase()}</p>
        <p className="mt-2 font-display text-sm italic text-bone/60">Arte exclusiva na pele</p>
      </motion.div>

      {canSkip && !open && (
        <button
          onClick={skip}
          className="absolute bottom-[calc(var(--safe-b)+22px)] right-5 rounded-full px-4 py-2 text-xs tracking-widest text-mute transition-colors hover:text-gold-light"
        >
          PULAR
        </button>
      )}
    </div>
  )
}
