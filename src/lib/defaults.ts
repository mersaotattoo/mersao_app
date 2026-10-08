import type { Perfil, PortfolioItem, Promocao, SecoesVisiveis } from './types'

export const DEFAULT_SECOES: SecoesVisiveis = {
  portfolio: true,
  videos: true,
  studio: true,
  promos: true,
  orcamento: true,
  reel: true,
  depoimentos: true,
}

// Conteúdo inicial: aparece enquanto o Supabase está vazio ou não configurado.
export const DEFAULT_PERFIL: Perfil = {
  nome: 'Mersão Tattoo',
  cidade: 'Ponte Nova, MG',
  endereco: 'Ponte Nova, MG',
  bio: 'Tatuagem autoral, feita com calma, biossegurança rigorosa e materiais premium. Cada projeto nasce de uma conversa e termina como uma peça única na sua pele.',
  whatsapp: '5531991850139',
  instagram: null,
  foto_perfil_url: null,
  video_hero_url: null,
  video_hero_poster_url: null,
  secoes_visiveis: DEFAULT_SECOES,
}

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`

export const DEFAULT_PORTFOLIO: PortfolioItem[] = [
  { id: 'd1', titulo: 'Realismo em preto e cinza', estilo: 'Realismo', imagem_url: u('photo-1611501275019-9b5cda994e8d'), storage_path: null, ordem: 1 },
  { id: 'd2', titulo: 'Fine line botânico', estilo: 'Fine line', imagem_url: u('photo-1590246814883-57c511e76f5f'), storage_path: null, ordem: 2 },
  { id: 'd3', titulo: 'Blackwork geométrico', estilo: 'Blackwork', imagem_url: u('photo-1598371839696-5c5bb00bdc28'), storage_path: null, ordem: 3 },
  { id: 'd4', titulo: 'Traço delicado', estilo: 'Fine line', imagem_url: u('photo-1562962230-16e4623d36e6'), storage_path: null, ordem: 4 },
  { id: 'd5', titulo: 'Fechamento de braço', estilo: 'Blackwork', imagem_url: u('photo-1568515045052-f9a854d70bfd'), storage_path: null, ordem: 5 },
  { id: 'd6', titulo: 'Retrato realista', estilo: 'Realismo', imagem_url: u('photo-1550537687-c91072c4792d'), storage_path: null, ordem: 6 },
]

export const DEFAULT_PROMOS: Promocao[] = [
  { id: 'p1', nome: 'Flash fine line', preco_antigo: 350, preco_novo: 250, imagem_url: u('photo-1590246814883-57c511e76f5f'), storage_path: null, ordem: 1 },
  { id: 'p2', nome: 'Lettering minimalista', preco_antigo: 300, preco_novo: 200, imagem_url: u('photo-1562962230-16e4623d36e6'), storage_path: null, ordem: 2 },
]

export const REVIEWS = [
  { nome: 'Camila R.', texto: 'Atendimento impecável e um acabamento que superou o que eu imaginava. Saí com a peça perfeita.' },
  { nome: 'Rafael M.', texto: 'Ambiente limpo, tranquilo e profissional. Cicatrizou perfeitamente e o traço continua nítido.' },
  { nome: 'Juliana S.', texto: 'Ele entendeu a ideia antes de eu terminar de explicar. Uma experiência de alto nível do início ao fim.' },
]

export const FAQ = [
  { q: 'Como cuidar nas primeiras 48 horas?', a: 'Mantenha o curativo pelo tempo orientado, lave com sabão neutro e evite sol, piscina e mar. Não coce nem retire casquinhas.' },
  { q: 'Quanto tempo leva para cicatrizar?', a: 'A superfície costuma cicatrizar em 2 a 3 semanas; a recuperação completa da pele leva cerca de 2 meses.' },
  { q: 'Dói muito?', a: 'Depende da região e da sensibilidade de cada pessoa. Fazemos pausas sempre que você precisar.' },
  { q: 'Posso tatuar se for menor de 18 anos?', a: 'Somente com autorização por escrito e presença de um responsável legal.' },
  { q: 'Como funciona o orçamento?', a: 'Você descreve a ideia, o local do corpo e envia referências. Respondemos com valor e tempo estimado, sem compromisso.' },
]
