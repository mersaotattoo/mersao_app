'use client'
/**
 * ABERTURA — máquina de tatuagem.
 * A agulha vibra, a máquina percorre a pele e deixa um traço de tinta dourada (a barra de progresso).
 * Quando o traço termina, a abertura some em fade e revela o site, que já está montado por baixo.
 *
 * O desenho está em TattooMachine.tsx (SVG + CSS puro): leve, sem WebGL e sem bibliotecas extras.
 */
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import TattooMachine, { TATTOO_DRAW_MS } from '@/components/TattooMachine'
import { haptics } from '@/lib/haptics'

interface Props {
  nome?: string
  /** disparado quando a abertura começa a sumir (o site já pode aparecer) */
  onOpen?: () => void
  /** disparado quando tudo terminou (pode desmontar) */
  onDone: () => void
}

export default function SplashScreen({ nome = 'Mersão Tattoo', onOpen, onDone }: Props) {
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

  const finish = (fadeMs: number) => {
    setOpen(true)
    openRef.current?.()
    haptics.tattoo()
    later(() => doneRef.current(), fadeMs)
  }

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    later(() => haptics.tattoo(), 450) // a máquina "liga"
    later(() => setCanSkip(true), 600)
    later(() => finish(1000), TATTOO_DRAW_MS + 350)

    return () => {
      document.body.style.overflow = prev
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const skip = () => {
    if (open) return
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    finish(700)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-obsidian bg-[radial-gradient(ellipse_at_50%_42%,rgba(214,188,138,0.11),transparent_62%)] px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: open ? 0 : 1 }}
      transition={{ duration: open ? 0.95 : 0.4, ease: 'easeInOut' }}
      aria-hidden
    >
      <TattooMachine className="w-[min(94vw,640px)]" />

      <motion.div
        className="mt-2 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
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
    </motion.div>
  )
}
