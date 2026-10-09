'use client'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { haptics } from '@/lib/haptics'

export interface LightboxItem {
  type: 'image' | 'video'
  src: string
  caption?: string | null
  poster?: string | null
}

interface Props {
  items: LightboxItem[]
  index: number | null
  onClose: () => void
  onIndex: (i: number) => void
}

export default function Lightbox({ items, index, onClose, onIndex }: Props) {
  const open = index !== null && items[index]
  const go = (d: number) => {
    if (index === null) return
    haptics.tap()
    onIndex((index + d + items.length) % items.length)
  }

  useEffect(() => {
    if (index === null) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const item = open ? items[index as number] : null

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="lb"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-obsidian/92 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="glass absolute right-4 top-[calc(var(--safe-t)+16px)] z-10 grid h-11 w-11 place-items-center rounded-full"
          >
            <X className="h-5 w-5" strokeWidth={1.6} />
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); go(-1) }}
                aria-label="Anterior"
                className="glass absolute left-3 z-10 hidden h-12 w-12 place-items-center rounded-full md:grid"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.6} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); go(1) }}
                aria-label="Próxima"
                className="glass absolute right-3 z-10 hidden h-12 w-12 place-items-center rounded-full md:grid"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.6} />
              </button>
            </>
          )}

          <motion.div
            key={item.src}
            className="flex max-h-[88dvh] max-w-[94vw] flex-col items-center"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            drag={item.type === 'image' ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) go(1)
              else if (info.offset.x > 80) go(-1)
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {item.type === 'image' ? (
              <img src={item.src} alt={item.caption ?? ''} draggable={false} className="max-h-[78dvh] max-w-[94vw] rounded-2xl object-contain" />
            ) : (
              <video
                src={item.src}
                poster={item.poster ?? undefined}
                controls
                autoPlay
                playsInline
                className="aspect-[9/16] max-h-[82dvh] max-w-[94vw] rounded-2xl bg-coal object-contain"
              />
            )}
            {item.caption && <p className="mt-4 text-center font-display text-lg italic text-bone/80">{item.caption}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
