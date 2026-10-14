'use client'
import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { haptics, type HapticKind } from '@/lib/haptics'

type Variant = 'gold' | 'ghost' | 'glass'

const base =
  'inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[0.92rem] font-medium tracking-wide select-none disabled:opacity-60 disabled:pointer-events-none'
const variants: Record<Variant, string> = {
  gold: 'bg-gradient-to-b from-gold-light via-gold to-gold-dark text-obsidian shadow-gold',
  ghost: 'border border-gold/35 text-gold-light hover:bg-gold/10',
  glass: 'glass text-bone hover:bg-white/[0.07]',
}

// "Batida" física: vibra o celular (Android) e faz o botão ceder e voltar como um pulso.
const press = { type: 'spring', stiffness: 700, damping: 18 } as const

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant
  haptic?: HapticKind
}

export const HapticButton = forwardRef<HTMLButtonElement, ButtonProps>(function HapticButton(
  { variant = 'gold', haptic = 'heartbeat', className = '', onClick, children, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.015 }}
      transition={press}
      onClick={(e) => {
        haptics[haptic]()
        onClick?.(e)
      }}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children as React.ReactNode}
    </motion.button>
  )
})

interface LinkProps extends HTMLMotionProps<'a'> {
  variant?: Variant
  haptic?: HapticKind
}

export const HapticLink = forwardRef<HTMLAnchorElement, LinkProps>(function HapticLink(
  { variant = 'gold', haptic = 'heartbeat', className = '', onClick, children, ...rest },
  ref,
) {
  return (
    <motion.a
      ref={ref}
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.015 }}
      transition={press}
      onClick={(e) => {
        haptics[haptic]()
        onClick?.(e)
      }}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children as React.ReactNode}
    </motion.a>
  )
})
