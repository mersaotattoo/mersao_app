'use client'
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/** Anel dourado que acompanha o mouse (só no computador; no celular não aparece). */
export default function GoldCursor() {
  const [enabled, setEnabled] = useState(false)
  const [hover, setHover] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 })

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    setEnabled(true)
    const move = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setHover(Boolean((e.target as HTMLElement | null)?.closest('a,button,[data-cursor]')))
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [x, y])

  if (!enabled) return null
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] -ml-[3px] -mt-[3px] h-[6px] w-[6px] rounded-full bg-gold"
        style={{ x, y }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] -ml-4 -mt-4 h-8 w-8 rounded-full border border-gold/60"
        style={{ x: sx, y: sy }}
        animate={{ scale: hover ? 1.9 : 1, backgroundColor: hover ? 'rgba(214,188,138,0.10)' : 'rgba(214,188,138,0)' }}
        transition={{ duration: 0.25 }}
      />
    </>
  )
}
