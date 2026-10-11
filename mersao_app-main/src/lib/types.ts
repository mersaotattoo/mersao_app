export type SecaoKey = 'portfolio' | 'videos' | 'studio' | 'promos' | 'orcamento'

export interface SecoesVisiveis {
  portfolio: boolean
  videos: boolean
  studio: boolean
  promos: boolean
  orcamento: boolean
  reel: boolean
  depoimentos: boolean
}

export interface Perfil {
  nome: string
  cidade: string
  endereco: string
  bio: string
  whatsapp: string
  instagram: string | null
  foto_perfil_url: string | null
  video_hero_url: string | null
  video_hero_poster_url: string | null
  secoes_visiveis: SecoesVisiveis
}

export interface Categoria {
  id: string
  nome: string
  ordem: number
}

export interface PortfolioItem {
  id: string
  titulo: string | null
  /** Campo antigo (texto livre). Mantido no banco por compatibilidade; o site usa categoria_id. */
  estilo: string | null
  categoria_id?: string | null
  imagem_url: string
  storage_path: string | null
  ordem: number
}

export interface Promocao {
  id: string
  nome: string
  preco_antigo: number | null
  preco_novo: number
  imagem_url: string | null
  storage_path: string | null
  ordem: number
}

export interface VideoItem {
  id: string
  titulo: string | null
  video_url: string
  poster_url: string | null
  storage_path: string | null
  poster_path: string | null
  ordem: number
}

export interface Orcamento {
  id: string
  nome: string
  telefone: string | null
  local_corpo: string | null
  ideia: string
  tem_referencia: boolean
  referencia_urls?: string[] | null
  status: 'novo' | 'atendido'
  criado_em: string
}

export interface SiteData {
  perfil: Perfil
  categorias: Categoria[]
  portfolio: PortfolioItem[]
  promocoes: Promocao[]
  videos: VideoItem[]
}
