import type { SupabaseClient } from '@supabase/supabase-js'

export const MAX_VIDEO_MB = 50
export const BUCKET = 'midia'

/** Reduz e converte a foto para WebP antes de enviar (site mais rápido, menos espaço). */
export async function compressImage(file: File, maxSize = 1800, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith('image/')) return file
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, maxSize / Math.max(bmp.width, bmp.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', quality))
    return blob ?? file
  } catch {
    return file
  }
}

/** Captura o primeiro quadro do vídeo para usar como capa. */
export function captureVideoPoster(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const v = document.createElement('video')
    let finished = false
    const done = (b: Blob | null) => {
      if (finished) return
      finished = true
      URL.revokeObjectURL(url)
      resolve(b)
    }
    v.muted = true
    v.playsInline = true
    v.preload = 'metadata'
    v.src = url
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(0.6, (v.duration || 1) / 2)
    }
    v.onseeked = () => {
      try {
        const s = Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight))
        const c = document.createElement('canvas')
        c.width = Math.round(v.videoWidth * s)
        c.height = Math.round(v.videoHeight * s)
        c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height)
        c.toBlob((b) => done(b), 'image/webp', 0.8)
      } catch {
        done(null)
      }
    }
    v.onerror = () => done(null)
    window.setTimeout(() => done(null), 9000)
  })
}

async function put(sb: SupabaseClient, blob: Blob, folder: string, ext: string, contentType: string) {
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await sb.storage.from(BUCKET).upload(path, blob, {
    contentType,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw new Error(error.message)
  return { path, url: sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl }
}

export async function uploadImage(sb: SupabaseClient, file: File, folder: string, maxSize = 1800) {
  const blob = await compressImage(file, maxSize)
  const webp = blob.type === 'image/webp'
  const ext = webp ? 'webp' : file.name.split('.').pop()?.toLowerCase() || 'jpg'
  return put(sb, blob, folder, ext, webp ? 'image/webp' : file.type || 'image/jpeg')
}

export async function uploadVideo(sb: SupabaseClient, file: File, folder: string) {
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
    throw new Error(
      `Vídeo com ${(file.size / 1048576).toFixed(0)} MB. O limite é ${MAX_VIDEO_MB} MB: comprima o vídeo antes de enviar.`,
    )
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
  const video = await put(sb, file, folder, ext, file.type || 'video/mp4')
  let poster: { path: string; url: string } | null = null
  const posterBlob = await captureVideoPoster(file)
  if (posterBlob) poster = await put(sb, posterBlob, `${folder}/capas`, 'webp', 'image/webp')
  return { video, poster }
}

export function pathFromUrl(url: string | null | undefined) {
  if (!url) return null
  const marker = `/object/public/${BUCKET}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length))
}

export async function removeFiles(sb: SupabaseClient, paths: Array<string | null | undefined>) {
  const list = paths.filter((p): p is string => Boolean(p))
  if (list.length) await sb.storage.from(BUCKET).remove(list)
}
