'use client'
import { useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { motion } from 'framer-motion'
import Heading from '../Heading'
import Lightbox from '../Lightbox'
import { haptics } from '@/lib/haptics'
import type { VideoItem } from '@/lib/types'

function VideoCard({ v, onOpen }: { v: VideoItem; onOpen: () => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onOpen}
      onMouseEnter={() => ref.current?.play().catch(() => undefined)}
      onMouseLeave={() => {
        const el = ref.current
        if (el) {
          el.pause()
          el.currentTime = 0.1
        }
      }}
      data-cursor
      className="group relative aspect-[9/16] overflow-hidden rounded-3xl border border-white/[0.07] bg-coal text-left"
    >
      <video
        ref={ref}
        src={v.poster_url ? v.video_url : `${v.video_url}#t=0.1`}
        poster={v.poster_url ?? undefined}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/5 to-transparent" />
      <span className="glass absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-opacity group-hover:opacity-0">
        <Play className="h-5 w-5 translate-x-[1px] fill-gold-light text-gold-light" strokeWidth={0} />
      </span>
      {v.titulo && <p className="absolute inset-x-4 bottom-4 font-display text-[1rem] italic">{v.titulo}</p>}
    </motion.button>
  )
}

export default function VideosTab({ videos }: { videos: VideoItem[] }) {
  const [lb, setLb] = useState<number | null>(null)
  return (
    <div>
      <Heading title="O processo, de perto" sub="Bastidores reais: o traço sendo construído, do primeiro risco ao acabamento." />
      {videos.length === 0 ? (
        <p className="glass rounded-3xl p-8 text-center text-mute">Em breve, novos vídeos do estúdio.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
          {videos.map((v, i) => (
            <VideoCard
              key={v.id}
              v={v}
              onOpen={() => {
                haptics.tap()
                setLb(i)
              }}
            />
          ))}
        </div>
      )}
      <Lightbox
        items={videos.map((v) => ({ type: 'video', src: v.video_url, poster: v.poster_url, caption: v.titulo }))}
        index={lb}
        onClose={() => setLb(null)}
        onIndex={setLb}
      />
    </div>
  )
}
