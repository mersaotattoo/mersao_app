/**
 * Pixels de anúncios (Meta, Google, TikTok).
 * Por segurança o site aceita APENAS os IDs (nunca código colado): o ID é validado aqui
 * e também por uma regra no banco de dados, e só então entra nos scripts oficiais.
 */

export interface Pixels {
  meta: string | null
  google: string | null
  tiktok: string | null
}

const RE_META = /^[0-9]{10,20}$/
const RE_GOOGLE = /^(G|GT|AW)-[A-Za-z0-9]{4,20}$/
const RE_TIKTOK = /^[A-Za-z0-9]{10,30}$/

const limpa = (raw: unknown) => (typeof raw === 'string' ? raw.trim() : '')

export function cleanMetaId(raw: unknown): string | null {
  const v = limpa(raw)
  return RE_META.test(v) ? v : null
}

export function cleanGoogleId(raw: unknown): string | null {
  const v = limpa(raw).toUpperCase()
  return RE_GOOGLE.test(v) ? v : null
}

export function cleanTiktokId(raw: unknown): string | null {
  const v = limpa(raw)
  return RE_TIKTOK.test(v) ? v : null
}

export function pixelsFromPerfil(p: {
  pixel_meta_id?: string | null
  pixel_google_id?: string | null
  pixel_tiktok_id?: string | null
}): Pixels {
  return {
    meta: cleanMetaId(p.pixel_meta_id),
    google: cleanGoogleId(p.pixel_google_id),
    tiktok: cleanTiktokId(p.pixel_tiktok_id),
  }
}

type PixelWindow = Window & {
  fbq?: (...args: unknown[]) => void
  gtag?: (...args: unknown[]) => void
  ttq?: { track: (evento: string, dados?: Record<string, unknown>) => void }
}

/** Avisa os pixels que alguém pediu um orçamento (conversão). Não faz nada se não houver pixel. */
export function trackLead() {
  try {
    const w = window as PixelWindow
    w.fbq?.('track', 'Lead')
    w.gtag?.('event', 'generate_lead')
    w.ttq?.track('Contact')
  } catch {
    /* rastreamento nunca pode atrapalhar o pedido */
  }
}
