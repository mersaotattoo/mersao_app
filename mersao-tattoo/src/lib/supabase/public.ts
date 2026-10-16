import { createClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env'
import {
  DEFAULT_CATEGORIAS,
  DEFAULT_INSTAGRAM,
  DEFAULT_PERFIL,
  DEFAULT_PORTFOLIO,
  DEFAULT_PROMOS,
  DEFAULT_SECOES,
} from '@/lib/defaults'
import { instagramHandle } from '@/lib/format'
import { cleanGoogleId, cleanMetaId, cleanTiktokId } from '@/lib/pixels'
import type { Categoria, Perfil, PortfolioItem, Promocao, SiteData, StudioItem, VideoItem } from '@/lib/types'

/**
 * Busca os dados públicos do site no Supabase (cache curto de 60 s, limpo na hora
 * pelo painel ao salvar), para que tudo o que for salvo apareça no site rapidamente.
 *
 * - Supabase NÃO configurado (sem .env): usa o conteúdo de exemplo, para o site não ficar em branco.
 * - Supabase configurado: mostra sempre os dados reais. Se uma consulta falhar,
 *   o erro vai para o log do servidor (Netlify > Functions) e aquela lista fica vazia
 *   (nunca mostramos fotos de exemplo para visitantes reais).
 */
export async function getSiteData(): Promise<SiteData> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[site] Variáveis NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes: exibindo conteúdo de exemplo.')
    return {
      perfil: DEFAULT_PERFIL,
      categorias: DEFAULT_CATEGORIAS,
      portfolio: DEFAULT_PORTFOLIO,
      promocoes: DEFAULT_PROMOS,
      videos: [],
      studio: [],
    }
  }

  const empty: SiteData = { perfil: DEFAULT_PERFIL, categorias: [], portfolio: [], promocoes: [], videos: [], studio: [] }

  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      // Cache de no máximo 60 s. O painel limpa este cache (tag "site") sempre que você salva algo.
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, next: { revalidate: 60, tags: ['site'] } }),
      },
    })

    const [perfil, categorias, portfolio, promocoes, videos, studio] = await Promise.all([
      sb.from('configuracoes_perfil').select('*').eq('id', 1).maybeSingle(),
      sb.from('categorias').select('*').order('ordem', { ascending: true }),
      sb.from('portfolio').select('*').order('ordem', { ascending: true }),
      sb.from('promocoes').select('*').order('ordem', { ascending: true }),
      sb.from('videos').select('*').order('ordem', { ascending: true }),
      sb.from('studio_midia').select('*').order('ordem', { ascending: true }),
    ])

    const falhas: [string, { message: string } | null][] = [
      ['configuracoes_perfil', perfil.error],
      ['categorias', categorias.error],
      ['portfolio', portfolio.error],
      ['promocoes', promocoes.error],
      ['videos', videos.error],
      ['studio_midia', studio.error],
    ]
    for (const [tabela, erro] of falhas) {
      if (erro) console.error(`[site] Falha ao ler "${tabela}": ${erro.message}`)
    }

    const p = (perfil.data as Partial<Perfil> | null) ?? {}
    const itens = ((portfolio.data as PortfolioItem[] | null) ?? []).map((it) => ({
      ...it,
      categoria_id: it.categoria_id ?? null,
    }))

    return {
      perfil: {
        ...DEFAULT_PERFIL,
        ...p,
        nome: p.nome || DEFAULT_PERFIL.nome,
        cidade: p.cidade || DEFAULT_PERFIL.cidade,
        endereco: p.endereco || p.cidade || DEFAULT_PERFIL.endereco,
        bio: p.bio || DEFAULT_PERFIL.bio,
        whatsapp: p.whatsapp || DEFAULT_PERFIL.whatsapp,
        instagram: instagramHandle(p.instagram) ?? DEFAULT_INSTAGRAM,
        secoes_visiveis: { ...DEFAULT_SECOES, ...(p.secoes_visiveis ?? {}) },
        // só IDs com formato válido chegam ao site
        pixel_meta_id: cleanMetaId(p.pixel_meta_id),
        pixel_google_id: cleanGoogleId(p.pixel_google_id),
        pixel_tiktok_id: cleanTiktokId(p.pixel_tiktok_id),
      },
      categorias: (categorias.data as Categoria[] | null) ?? [],
      portfolio: itens,
      promocoes: (promocoes.data as Promocao[] | null) ?? [],
      videos: (videos.data as VideoItem[] | null) ?? [],
      studio: (studio.data as StudioItem[] | null) ?? [],
    }
  } catch (e) {
    console.error('[site] Erro inesperado ao buscar dados do Supabase:', e)
    return empty
  }
}
