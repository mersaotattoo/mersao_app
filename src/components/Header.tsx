'use client'
import { Instagram, MapPin, MessageCircle } from 'lucide-react'
import { HapticLink } from './HapticButton'
import { waLink } from '@/lib/format'
import type { Perfil } from '@/lib/types'

export default function Header({ perfil }: { perfil: Perfil }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 pt-[var(--safe-t)]">
      <div className="mx-auto mt-3 flex max-w-[1200px] items-center justify-between gap-3 px-4">
        <div className="glass flex min-w-0 items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 sm:pr-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-gold/40 bg-coal">
            {perfil.foto_perfil_url ? (
              <img src={perfil.foto_perfil_url} alt={perfil.nome} className="h-full w-full object-cover" />
            ) : (
              <span className="gold-text font-display text-xl">M</span>
            )}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-[1rem] sm:text-[1.05rem]">{perfil.nome}</p>
            <p className="flex items-center gap-1 truncate text-[0.72rem] text-mute">
              <MapPin className="h-3 w-3" strokeWidth={1.6} />
              {perfil.cidade}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {perfil.instagram && (
            <HapticLink
              variant="glass"
              haptic="tap"
              href={`https://instagram.com/${perfil.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="!h-11 !w-11 !p-0"
            >
              <Instagram className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </HapticLink>
          )}
          <HapticLink
            variant="glass"
            href={waLink(perfil.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Falar no WhatsApp"
            className="!h-11 !w-11 !p-0 sm:!w-auto sm:!px-5"
          >
            <MessageCircle className="h-[18px] w-[18px] text-gold" strokeWidth={1.6} />
            <span className="hidden text-sm sm:inline">WhatsApp</span>
          </HapticLink>
        </div>
      </div>
    </header>
  )
}
