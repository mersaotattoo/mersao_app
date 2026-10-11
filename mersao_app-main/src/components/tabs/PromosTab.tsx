'use client'
import Heading from '../Heading'
import { HapticButton } from '../HapticButton'
import { brl, desconto } from '@/lib/format'
import type { Promocao } from '@/lib/types'

export default function PromosTab({ promos, onReserve }: { promos: Promocao[]; onReserve: (nome: string) => void }) {
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
                <div className="relative aspect-[4/3] overflow-hidden bg-coal">
                  {p.imagem_url && (
                    <img
                      src={p.imagem_url}
                      alt={p.nome}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]"
                    />
                  )}
                  {off > 0 && (
                    <span className="absolute left-4 top-4 rounded-full bg-obsidian/80 px-3 py-1 text-xs tracking-wide text-gold-light backdrop-blur">
                      −{off}%
                    </span>
                  )}
                </div>
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
    </div>
  )
}
