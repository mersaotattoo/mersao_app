import { createClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env'
import { DEFAULT_PERFIL, DEFAULT_PORTFOLIO, DEFAULT_PROMOS, DEFAULT_SECOES } from '../defaults'
import type { Perfil, PortfolioItem, Promocao, SiteData, VideoItem } from '../types'

// Busca os dados públicos do site. Se o Supabase não estiver configurado
// (ou ainda vazio), usa o conteúdo padrão para o site nunca ficar em branco.
export async function getSiteData(): Promise<SiteData> {
  const fallback: SiteData = {
    perfil: DEFAULT_PERFIL,
    portfolio: DEFAULT_PORTFOLIO,
    promocoes: DEFAULT_PROMOS,
    videos: [],
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return fallback

  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })
    const [perfil, portfolio, promocoes, videos] = await Promise.all([
      sb.from('configuracoes_perfil').select('*').eq('id', 1).maybeSingle(),
      sb.from('portfolio').select('*').order('ordem', { ascending: true }),
      sb.from('promocoes').select('*').order('ordem', { ascending: true }),
      sb.from('videos').select('*').order('ordem', { ascending: true }),
    ])

    const p = (perfil.data as Perfil | null) ?? DEFAULT_PERFIL
    const port = (portfolio.data as PortfolioItem[] | null) ?? []
    const promo = (promocoes.data as Promocao[] | null) ?? []

    return {
      perfil: { ...DEFAULT_PERFIL, ...p, secoes_visiveis: { ...DEFAULT_SECOES, ...(p.secoes_visiveis ?? {}) } },
      // Se o banco está vazio, mostra o conteúdo de exemplo; se já tem fotos, só as suas.
      portfolio: port.length ? port : DEFAULT_PORTFOLIO,
      promocoes: promo.length || perfil.data ? promo : DEFAULT_PROMOS,
      videos: (videos.data as VideoItem[] | null) ?? [],
    }
  } catch {
    return fallback
  }
}
