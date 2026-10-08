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
