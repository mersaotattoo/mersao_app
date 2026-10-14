'use client'
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Gem, Play, ShieldCheck, Snowflake } from 'lucide-react'
import Heading from '@/components/Heading'
import Lightbox from '@/components/Lightbox'
import { HapticLink } from '@/components/HapticButton'
import { FAQ } from '@/lib/defaults'
import { haptics } from '@/lib/haptics'
import type { Perfil, StudioItem } from '@/lib/types'

const DIFERENCIAIS = [
  { Icon: ShieldCheck, t: 'Biossegurança rigorosa', d: 'Materiais descartáveis, lacrados na sua frente, e esterilização em autoclave.' },
  { Icon: Gem, t: 'Materiais premium', d: 'Tintas e agulhas das melhores marcas, para um traço firme e uma cicatrização limpa.' },
  { Icon: Snowflake, t: 'Ambiente climatizado', d: 'Um espaço reservado e confortável, pensado para sessões longas.' },
]

/** Um quadrado da galeria: foto, ou vídeo que toca ao passar o mouse. */
function StudioTile({ item, onOpen }: { item: StudioItem; onOpen: () => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  const ehVideo = item.tipo === 'video'
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onOpen}
      onMouseEnter={() => {
        if (ehVideo) ref.current?.play().catch(() => undefined)
      }}
      onMouseLeave={() => {
        const el = ref.current
        if (ehVideo && el) {
          el.pause()
          el.currentTime = 0.1
        }
      }}
      aria-label={item.titulo ?? (ehVideo ? 'Abrir vídeo do estúdio' : 'Abrir foto do estúdio')}
      data-cursor
      className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/[0.07] bg-coal text-left"
    >
      {ehVideo ? (
        <video
          ref={ref}
          src={item.poster_url ? item.url : `${item.url}#t=0.1`}
          poster={item.poster_url ?? undefined}
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.03]"
        />
      ) : (
        <img
          src={item.url}
          alt={item.titulo ?? 'Estúdio Mersão Tattoo'}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
      {ehVideo && (
        <span className="glass absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-opacity group-hover:opacity-0">
          <Play className="h-5 w-5 translate-x-[1px] fill-gold-light text-gold-light" strokeWidth={0} />
        </span>
      )}
      {item.titulo && <p className="absolute inset-x-4 bottom-4 font-display text-[1rem] italic">{item.titulo}</p>}
    </motion.button>
  )
}

export default function StudioTab({ perfil, midia }: { perfil: Perfil; midia: StudioItem[] }) {
  const [open, setOpen] = useState<number | null>(0)
  const [lb, setLb] = useState<number | null>(null)
  const q = encodeURIComponent(perfil.endereco || perfil.cidade)

  return (
    <div>
      <Heading title="O estúdio" sub={perfil.bio} />

      {/* GALERIA DO ESPAÇO (fotos e vídeos enviados pelo painel, aba Studio) */}
      {midia.length > 0 && (
        <section className="mb-14 md:mb-20" aria-label="Fotos e vídeos do estúdio">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
            {midia.map((m, i) => (
              <StudioTile
                key={m.id}
                item={m}
                onOpen={() => {
                  haptics.tap()
                  setLb(i)
                }}
              />
            ))}
          </div>
        </section>
      )}

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

      <Lightbox
        items={midia.map((m) => ({
          type: m.tipo === 'video' ? ('video' as const) : ('image' as const),
          src: m.url,
          poster: m.poster_url,
          caption: m.titulo,
        }))}
        index={lb}
        onClose={() => setLb(null)}
        onIndex={setLb}
      />
    </div>
  )
}
