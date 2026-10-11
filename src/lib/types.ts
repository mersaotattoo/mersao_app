export type Secakey = 'portfolio' | 'videos' | 'studio' | 'promos' | 'orcamento'

export interface SecoesVisiveis {
    portfolio: boolean
    videos: boolean
    studio: boolean
    promos: boolean
    orcamento: boolean
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

export interface PortfolioItem {
    id: string
    titulo: string | null
    estilo: string | null
    imagem_url: string
    storage_path: string | null
    ordem: number
    categorias?: string[]
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
    video_url: string | null
    storage_path: string | null
    poster_url: string | null
    poster_storage_path: string | null
    ordem: number
}

export interface Orcamento {
    id: string
    nome: string
    telefone: string | null
    ideia: string
    tem_referencia: boolean
    status: 'novo' | 'atendido'
    criado_em: string
    local_corpo: string | null
}

export interface SiteData {
    perfil: Perfil
    portfolio: PortfolioItem[]
    promocoes: Promocao[]
    videos: VideoItem[]
    categorias?: string[]
}