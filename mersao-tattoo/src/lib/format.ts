export const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export const onlyDigits = (s: string) => s.replace(/\D/g, '')

export function waLink(phone: string, text?: string) {
  const digits = onlyDigits(phone)
  const full = digits.length <= 11 ? `55${digits}` : digits
  return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

export const desconto = (antigo: number | null, novo: number) =>
  antigo && antigo > novo ? Math.round(((antigo - novo) / antigo) * 100) : 0

/**
 * Aceita "mersao.tattoo", "@mersao.tattoo" ou o link completo do perfil
 * e devolve só o usuário (ou null se não for válido).
 */
export function instagramHandle(raw?: string | null): string | null {
  if (!raw) return null
  let s = raw.trim()
  s = s.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '')
  s = s.replace(/^@/, '')
  s = s.split(/[/?#]/)[0].trim()
  return /^[A-Za-z0-9._]{1,30}$/.test(s) ? s : null
}

export function instagramUrl(raw?: string | null): string | null {
  const user = instagramHandle(raw)
  return user ? `https://www.instagram.com/${user}/` : null
}
