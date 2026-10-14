import type { Categoria, PortfolioItem } from '@/lib/types'

/** Uma categoria com a sua capa e as fotos que pertencem a ela. */
export interface Grupo {
  id: string
  nome: string
  capa: PortfolioItem
  fotos: PortfolioItem[]
}

export const OUTROS = '__outros'

/**
 * Monta um grupo por categoria (só as que têm fotos), na ordem das categorias.
 * - Capa: a foto escolhida no painel (capa_id), desde que ainda pertença à categoria;
 *   senão, a primeira foto da categoria.
 * - Fotos sem categoria (ou de uma categoria que não existe mais) viram o grupo "Outros",
 *   que só aparece se já houver outras categorias, para nenhuma foto sumir do site.
 */
export function agruparPorCategoria(items: PortfolioItem[], categorias: Categoria[]): Grupo[] {
  const conhecidas = new Set(categorias.map((c) => c.id))
  const porCategoria = new Map<string, PortfolioItem[]>()
  const semCategoria: PortfolioItem[] = []

  for (const it of items) {
    if (it.categoria_id && conhecidas.has(it.categoria_id)) {
      const lista = porCategoria.get(it.categoria_id) ?? []
      lista.push(it)
      porCategoria.set(it.categoria_id, lista)
    } else {
      semCategoria.push(it)
    }
  }

  const resultado: Grupo[] = []
  for (const c of categorias) {
    const fotos = porCategoria.get(c.id) ?? []
    if (fotos.length === 0) continue
    resultado.push({ id: c.id, nome: c.nome, capa: fotos.find((f) => f.id === c.capa_id) ?? fotos[0], fotos })
  }
  if (semCategoria.length > 0 && resultado.length > 0) {
    resultado.push({ id: OUTROS, nome: 'Outros', capa: semCategoria[0], fotos: semCategoria })
  }
  return resultado
}
