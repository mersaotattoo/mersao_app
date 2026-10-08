'use client'
import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SplashScreen from './SplashScreen'
import Header from './Header'
import Dock, { TABS } from './Dock'
import GoldCursor from './GoldCursor'
import PortfolioTab from './tabs/PortfolioTab'
import VideosTab from './tabs/VideosTab'
import StudioTab from './tabs/StudioTab'
import PromosTab from './tabs/PromosTab'
import OrcamentoTab from './tabs/OrcamentoTab'
import type { SecaoKey, SiteData } from '@/lib/types'

const SPLASH_KEY = 'mersao:splash-at'
const SPLASH_TTL = 24 * 60 * 60 * 1000 // a abertura toca de novo após 24h (ou com ?splash na URL)

export default function SiteApp({ data }: { data: SiteData }) {
  const { perfil, portfolio, promocoes, videos } = data
  const [splash, setSplash] = useState<'pending' | 'play' | 'off'>('pending')
  const [revealed, setRevealed] = useState(false)
  const [tab, setTab] = useState<SecaoKey>('portfolio')
  const [prefill, setPrefill] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const tabs = TABS.filter((t) => perfil.secoes_visiveis[t.key])
  const active: SecaoKey = tabs.some((t) => t.key === tab) ? tab : tabs[0]?.key ?? 'portfolio'

  useEffect(() => {
    try {
      const force = new URLSearchParams(window.location.search).has('splash')
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const last = Number(localStorage.getItem(SPLASH_KEY) || 0)
      if (!reduce && (force || Date.now() - last > SPLASH_TTL)) {
        localStorage.setItem(SPLASH_KEY, String(Date.now()))
        setSplash('play')
        return
      }
    } catch {
      /* sem localStorage: segue sem abertura */
    }
    setSplash('off')
    setRevealed(true)
  }, [])

  const goTo = useCallback((k: SecaoKey) => {
    setTab(k)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const notify = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3200)
  }, [])

  return (
    <>
      {/* cobertura preta enquanto decidimos se toca a abertura (evita "piscar" o site) */}
      <AnimatePresence>
        {splash === 'pending' && (
          <motion.div key="cover" className="fixed inset-0 z-[101] bg-obsidian" exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
        )}
      </AnimatePresence>

      {splash === 'play' && (
        <SplashScreen nome={perfil.nome} onOpen={() => setRevealed(true)} onDone={() => setSplash('off')} />
      )}

      <GoldCursor />
      <Header perfil={perfil} />

      <motion.main
        initial={false}
        animate={{ opacity: revealed ? 1 : 0, scale: revealed ? 1 : 0.95 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[2] mx-auto max-w-[1200px] pb-40 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[calc(var(--safe-t)+104px)] md:px-8 md:pt-[calc(var(--safe-t)+130px)]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            {active === 'portfolio' && <PortfolioTab perfil={perfil} items={portfolio} goTo={goTo} />}
            {active === 'videos' && <VideosTab videos={videos} />}
            {active === 'studio' && <StudioTab perfil={perfil} />}
            {active === 'promos' && (
              <PromosTab
                promos={promocoes}
                onReserve={(nome) => {
                  setPrefill(nome)
                  goTo('orcamento')
                }}
              />
            )}
            {active === 'orcamento' && <OrcamentoTab perfil={perfil} prefill={prefill} notify={notify} />}
          </motion.div>
        </AnimatePresence>
      </motion.main>

      <Dock tabs={tabs} active={active} onSelect={goTo} />

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            role="status"
            className="glass fixed inset-x-4 bottom-[calc(var(--safe-b)+96px)] z-[60] mx-auto max-w-sm rounded-2xl px-5 py-3.5 text-center text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
