'use client'
import { useMemo, useState } from 'react'
import { Maximize2 } from 'lucide-react'
import Heading from '@/components/Heading'
import Lightbox from '@/components/Lightbox'
import { HapticButton } from '@/components/HapticButton'
import { brl, desconto } from '@/lib/format'
import { haptics } from '@/lib/haptics'
import type { Promocao } from '@/lib/types'

export default function PromosTab({ promos, onReserve }: { promos: Promocao[]; onReserve: (nome: string) => void }) {
  const [lb, setLb] = useState<number | null>(null)

  // só as promoções que têm imagem entram na visualização ampliada (setas / deslizar para ver as outras)
  const comImagem = useMemo(() => promos.filter((p) => Boolean(p.imagem_url)), [promos])
  const itensLightbox = useMemo(
    () =>
      comImagem.map((p) => ({
        type: 'image' as const,
        src: p.imagem_url as string,
        caption: `${p.nome} · ${brl(p.preco_novo)}`,
      })),
    [comImagem],
  )

  const abrir = (id: string) => {
    const i = comImagem.findIndex((p) => p.id === id)
    if (i < 0) return
    haptics.tap()
    setLb(i)
  }

  return (
    <div>
      <Heading title="Flashes e promoções" sub="Desenhos prontos, para tatuar no tamanho combinado. Vagas limitadas." />
      {promos.length === 0 ? (
        <p className="glass rounded-3xl p-8 text-center text-mute">Nenhuma promoção no momento. Volte em breve.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-7">
          {promos.map((p) => {
            const off = desconto(p.preco_antigo, p.preco_novo)
            return (
              <article key={p.id} className="glass group overflow-hidden rounded-3xl">
                {p.imagem_url ? (
                  <button
                    type="button"
                    onClick={() => abrir(p.id)}
                    aria-label={`Ver a arte completa: ${p.nome}`}
                    data-cursor
                    className="relative block aspect-[4/5] w-full overflow-hidden bg-coal text-left"
                  >
                    {/* fundo desfocado com a própria arte: preenche o quadro sem cortar nada */}
                    <img
                      src={p.imagem_url}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
                    />
                    {/* a arte inteira, sem corte */}
                    <img
                      src={p.imagem_url}
                      alt={p.nome}
                      loading="lazy"
                      decoding="async"
                      className="relative h-full w-full object-contain transition-transform duration-[900ms] group-hover:scale-[1.03]"
                    />
                    {off > 0 && (
                      <span className="absolute left-4 top-4 rounded-full bg-obsidian/80 px-3 py-1 text-xs tracking-wide text-gold-light backdrop-blur">
                        −{off}%
                      </span>
                    )}
                    <span className="glass absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.7rem] text-bone/90">
                      <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.6} />
                      Ver arte completa
                    </span>
                  </button>
                ) : (
                  <div className="relative aspect-[4/5] bg-coal">
                    {off > 0 && (
                      <span className="absolute left-4 top-4 rounded-full bg-obsidian/80 px-3 py-1 text-xs tracking-wide text-gold-light backdrop-blur">
                        −{off}%
                      </span>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-display text-[1.35rem]">{p.nome}</h3>
                  <p className="mt-2 flex items-baseline gap-3">
                    {p.preco_antigo && <span className="text-sm text-mute line-through">{brl(p.preco_antigo)}</span>}
                    <span className="gold-text font-display text-3xl">{brl(p.preco_novo)}</span>
                  </p>
                  <HapticButton className="mt-6 w-full" onClick={() => onReserve(p.nome)}>
                    Reservar esta arte
                  </HapticButton>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Lightbox items={itensLightbox} index={lb} onClose={() => setLb(null)} onIndex={setLb} />
    </div>
  )
}
