'use client'
import { Instagram } from 'lucide-react'
import { HapticLink } from './HapticButton'
import { instagramHandle, instagramUrl } from '@/lib/format'

interface Props {
  /** usuário do Instagram (aceita com ou sem @ ou o link do perfil) */
  handle: string | null | undefined
  /** versão só com o botão, sem o cartão de chamada */
  compact?: boolean
  className?: string
}

/** Chamada para seguir o estúdio no Instagram; o botão abre o perfil em outra aba/app. */
export default function InstagramCTA({ handle, compact = false, className = '' }: Props) {
  const user = instagramHandle(handle)
  const href = instagramUrl(handle)
  if (!user || !href) return null

  const botao = (
    <HapticLink
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variant={compact ? 'ghost' : 'gold'}
      haptic="tap"
      aria-label={`Seguir @${user} no Instagram`}
      className="shrink-0"
    >
      <Instagram className="h-[18px] w-[18px]" strokeWidth={1.6} />
      Seguir @{user}
    </HapticLink>
  )

  if (compact) return <div className={className}>{botao}</div>

  return (
    <div className={`glass flex flex-col items-center gap-5 rounded-3xl px-6 py-8 text-center sm:flex-row sm:justify-between sm:px-9 sm:text-left ${className}`}>
      <div className="max-w-md">
        <p className="font-display text-2xl leading-snug">Acompanhe os trabalhos no Instagram</p>
        <p className="mt-1.5 text-sm leading-relaxed text-mute">Tatuagens novas, bastidores e horários abertos, direto no perfil do estúdio.</p>
      </div>
      {botao}
    </div>
  )
}
