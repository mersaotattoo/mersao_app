'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Gem, ShieldCheck, Snowflake } from 'lucide-react'
import Heading from '../Heading'
import { HapticLink } from '../HapticButton'
import { FAQ } from '@/lib/defaults'
import { haptics } from '@/lib/haptics'
import type { Perfil } from '@/lib/types'

const DIFERENCIAIS = [
  { Icon: ShieldCheck, t: 'Biossegurança rigorosa', d: 'Materiais descartáveis, lacrados na sua frente, e esterilização em autoclave.' },
  { Icon: Gem, t: 'Materiais premium', d: 'Tintas e agulhas das melhores marcas, para um traço firme e uma cicatrização limpa.' },
  { Icon: Snowflake, t: 'Ambiente climatizado', d: 'Um espaço reservado e confortável, pensado para sessões longas.' },
]

export default function StudioTab({ perfil }: { perfil: Perfil }) {
  const [open, setOpen] = useState<number | null>(0)
  const q = encodeURIComponent(perfil.endereco || perfil.cidade)

  return (
    <div>
      <Heading title="O estúdio" sub={perfil.bio} />

      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div className="glass relative min-h-[300px] overflow-hidden rounded-3xl md:min-h-[420px]">
          <iframe
            title="Mapa do estúdio"
            src={`https://www.google.com/maps?q=${q}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0"
            style={{ filter: 'grayscale(1) invert(.92) contrast(.88) brightness(.9)' }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
          <HapticLink
            variant="glass"
            href={`https://www.google.com/maps/search/?api=1&query=${q}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 left-4 !py-2.5 text-sm"
          >
            Abrir rota
          </HapticLink>
        </div>

        <div className="flex flex-col gap-4">
          {DIFERENCIAIS.map(({ Icon, t, d }) => (
            <div key={t} className="glass flex gap-5 rounded-3xl p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/30 text-gold">
                <Icon className="h-5 w-5" strokeWidth={1.4} />
              </span>
              <div>
                <h3 className="font-display text-xl">{t}</h3>
                <p className="mt-1.5 text-[0.92rem] leading-relaxed text-mute">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="mx-auto mt-20 max-w-3xl">
        <h2 className="mb-8 font-display text-3xl md:text-4xl">Cuidados e dúvidas</h2>
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {FAQ.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q}>
                <button
                  onClick={() => {
                    haptics.tap()
                    setOpen(isOpen ? null : i)
                  }}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className={`font-display text-[1.1rem] transition-colors ${isOpen ? 'text-gold-light' : ''}`}>{f.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-gold">
                    <ChevronDown className="h-5 w-5" strokeWidth={1.5} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-8 text-[0.95rem] leading-relaxed text-mute">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
