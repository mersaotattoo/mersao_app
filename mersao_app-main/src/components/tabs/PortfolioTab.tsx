'use client'
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { HapticButton } from '../HapticButton'
import ReelPlayer from '../ReelPlayer'
import Lightbox from '../Lightbox'
import InstagramCTA from '../InstagramCTA'
import { REVIEWS } from '@/lib/defaults'
import { haptics } from '@/lib/haptics'
import type { Categoria, Perfil, PortfolioItem, SecaoKey } from '@/lib/types'

interface Props {
  perfil: Perfil
  items: PortfolioItem[]
  categorias: Categoria[]
  goTo: (k: SecaoKey) => void
}

const TODOS = 'todos'

export default function PortfolioTab({ perfil, items, categorias, goTo }: Props) {
  const s = perfil.secoes_visiveis
  const [filtro, setFiltro] = useState<string>(TODOS)
  const [lb, setLb] = useState<number | null>(null)

  // Só mostramos categorias que têm pelo menos uma foto (sem filtros vazios).
  const chips = useMemo(() => {
    const usadas = new Set(items.map((i) => i.categoria_id).filter((id): id is string => Boolean(id)))
    return categorias.filter((c) => usadas.has(c.id))
  }, [items, categorias])

  const temSemCategoria = items.some((i) => !i.categoria_id)
  const mostrarFiltros = chips.length >= 2 || (chips.length === 1 && temSemCategoria)

  // Se a categoria escolhida sumiu (ex.: foi excluída no painel), volta para "Todos".
  const ativo = chips.some((c) => c.id === filtro) ? filtro : TODOS
  const visiveis = ativo === TODOS ? items : items.filter((i) => i.categoria_id === ativo)
  const showReel = s.reel && Boolean(perfil.video_hero_url)

  return (
    <div>
      {/* HERO — o vídeo retrato é a peça central */}
      <section className={`grid items-center gap-10 md:gap-16 ${showReel ? 'md:grid-cols-[1fr_auto]' : ''}`}>
        <div className="max-w-xl">
          <h1 className="font-display text-[2.15rem] leading-[1.06] min-[380px]:text-[2.6rem] sm:text-6xl md:text-[4.2rem]">
            Arte exclusiva
            <br />
            na sua pele.
          </h1>
          <p className="mt-3 font-display text-[1.35rem] italic text-gold md:text-2xl">Cuidado em cada traço.</p>
          <p className="mt-6 max-w-md text-[0.97rem] leading-relaxed text-bone/70">{perfil.bio}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            {s.orcamento && <HapticButton onClick={() => goTo('orcamento')}>Solicitar orçamento</HapticButton>}
            {s.videos && (
              <HapticButton variant="ghost" onClick={() => goTo('videos')}>
                Ver o processo
              </HapticButton>
            )}
          </div>
        </div>

        {showReel && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <ReelPlayer src={perfil.video_hero_url as string} poster={perfil.video_hero_poster_url} />
          </motion.div>
        )}
      </section>

      {/* GALERIA */}
      <section className="mt-20 md:mt-28">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl md:text-4xl">Trabalhos selecionados</h2>
          {mostrarFiltros && (
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por categoria">
              {[{ id: TODOS, nome: 'Todos' }, ...chips].map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={ativo === c.id}
                  onClick={() => {
                    haptics.tap()
                    setFiltro(c.id)
                  }}
                  className={`rounded-full border px-4 py-1.5 text-[0.82rem] transition-colors ${
                    ativo === c.id ? 'border-gold/50 bg-gold/10 text-gold-light' : 'border-white/10 text-mute hover:text-bone'
                  }`}
                >
                  {c.nome}
                </button>
              ))}
            </div>
          )}
        </div>

        {items.length === 0 && (
          <p className="glass rounded-3xl p-8 text-center text-mute">Os trabalhos do estúdio entram aqui em breve.</p>
        )}

        <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visiveis.map((it, i) => (
              <motion.button
                layout
                key={it.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  haptics.tap()
                  setLb(i)
                }}
                data-cursor
                className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-white/[0.07] bg-coal text-left"
              >
                <img
                  src={it.imagem_url}
                  alt={it.titulo ?? 'Tatuagem'}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {it.titulo && (
                  <p className="absolute inset-x-4 bottom-4 translate-y-2 font-display text-[0.98rem] italic opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {it.titulo}
                  </p>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        <InstagramCTA handle={perfil.instagram} className="mt-12 md:mt-16" />
      </section>

      {/* DEPOIMENTOS */}
      {s.depoimentos && (
        <section className="mt-20 md:mt-28">
          <h2 className="mb-8 font-display text-3xl md:text-4xl">Quem já viveu a experiência</h2>
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {REVIEWS.map((r) => (
              <figure key={r.nome} className="glass rounded-3xl p-7">
                <div className="mb-4 flex gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="font-display text-[1.05rem] italic leading-relaxed text-bone/85">“{r.texto}”</blockquote>
                <figcaption className="mt-5 text-sm text-mute">{r.nome}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <Lightbox
        items={visiveis.map((v) => ({ type: 'image', src: v.imagem_url, caption: v.titulo }))}
        index={lb}
        onClose={() => setLb(null)}
        onIndex={setLb}
      />
    </div>
  )
}
