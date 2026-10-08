'use client'
import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { haptics } from '@/lib/haptics'

/** Vídeo criativo em formato retrato (9:16), tipo Reels. Toca mudo e em loop quando aparece na tela. */
export default function ReelPlayer({ src, poster }: { src: string; poster?: string | null }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => undefined)
        else v.pause()
      },
      { threshold: 0.35 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [src])

  const toggle = () => {
    const v = ref.current
    if (!v) return
    haptics.tap()
    v.muted = !v.muted
    setMuted(v.muted)
    if (!v.muted) v.play().catch(() => undefined)
  }

  return (
    <div className="mx-auto w-[min(74vw,330px)] rounded-[2rem] bg-gradient-to-b from-gold/45 via-white/10 to-gold/20 p-px shadow-deep md:mx-0 md:w-auto md:h-[min(74dvh,640px)] aspect-[9/16]">
      <div className="relative h-full w-full overflow-hidden rounded-[calc(2rem-1px)] bg-coal">
        <video
          ref={ref}
          src={src}
          poster={poster ?? undefined}
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-obsidian/80 to-transparent" />
        <button
          onClick={toggle}
          aria-label={muted ? 'Ativar som' : 'Desativar som'}
          className="glass absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full"
        >
          {muted ? <VolumeX className="h-4 w-4" strokeWidth={1.6} /> : <Volume2 className="h-4 w-4 text-gold" strokeWidth={1.6} />}
        </button>
      </div>
    </div>
  )
}
