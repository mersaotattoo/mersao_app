'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clapperboard, Gem, LayoutGrid, PenTool, Sparkles, type LucideIcon } from 'lucide-react'
import { haptics } from '@/lib/haptics'
import type { SecaoKey } from '@/lib/types'

export const TABS: { key: SecaoKey; label: string; Icon: LucideIcon }[] = [
  { key: 'portfolio', label: 'Portfólio', Icon: LayoutGrid },
  { key: 'videos', label: 'Vídeos', Icon: Clapperboard },
  { key: 'studio', label: 'Studio', Icon: Gem },
  { key: 'promos', label: 'Promos', Icon: Sparkles },
  { key: 'orcamento', label: 'Orçamento', Icon: PenTool },
]

function DockButton({ tab, active, onSelect }: { tab: (typeof TABS)[number]; active: boolean; onSelect: () => void }) {
  const [pulse, setPulse] = useState(0)
  const { Icon } = tab
  return (
    <motion.button
      type="button"
      onClick={() => {
        haptics.heartbeat()
        setPulse((n) => n + 1)
        onSelect()
      }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 700, damping: 18 }}
      aria-current={active ? 'page' : undefined}
      aria-label={tab.label}
      className={`relative flex min-w-0 flex-1 flex-col items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-2.5 transition-colors min-[400px]:px-3 md:flex-none md:flex-row md:gap-2.5 md:px-5 md:py-3 ${
        active ? 'text-gold-light' : 'text-mute hover:text-bone'
      }`}
    >
      {active && (
        <motion.span
          layoutId="dock-pill"
          className="absolute inset-0 rounded-full bg-gold/[0.11] ring-1 ring-gold/25"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      )}
      <motion.span
        key={pulse}
        className="relative"
        animate={pulse ? { scale: [1, 1.3, 0.92, 1.1, 1] } : undefined}
        transition={{ duration: 0.5, times: [0, 0.2, 0.45, 0.7, 1] }}
      >
        <Icon className="h-[19px] w-[19px] md:h-[17px] md:w-[17px]" strokeWidth={1.6} />
      </motion.span>
      <span className="relative text-[0.58rem] tracking-wide min-[400px]:text-[0.62rem] md:text-[0.82rem]">{tab.label}</span>
    </motion.button>
  )
}

export default function Dock({
  tabs,
  active,
  onSelect,
}: {
  tabs: (typeof TABS)[number][]
  active: SecaoKey
  onSelect: (k: SecaoKey) => void
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--safe-b)+12px)] z-50 flex justify-center px-3">
      <motion.nav
        aria-label="Navegação principal"
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 22, delay: 0.1 }}
        className="glass pointer-events-auto flex max-w-[calc(100vw-1rem)] items-center gap-0.5 rounded-full p-1.5 shadow-deep md:gap-1 md:p-2"
      >
        {tabs.map((t) => (
          <DockButton key={t.key} tab={t} active={t.key === active} onSelect={() => onSelect(t.key)} />
        ))}
      </motion.nav>
    </div>
  )
}
