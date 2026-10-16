'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ArrowDownRight, ArrowUpRight, Loader2, Minus, RefreshCw } from 'lucide-react'
import { haptics } from '@/lib/haptics'

/* ------------------------------------------------------------------ períodos */

type PeriodoId = 'hoje' | 'ontem' | '3' | '7' | '15' | '30' | '60' | '90'

interface Periodo {
  id: PeriodoId
  label: string
  /** quantos dias atrás começa (0 = hoje) */
  inicio: number
  /** quantos dias atrás termina (0 = hoje) */
  fim: number
}

const PERIODOS: Periodo[] = [
  { id: 'hoje', label: 'Hoje', inicio: 0, fim: 0 },
  { id: 'ontem', label: 'Ontem', inicio: 1, fim: 1 },
  { id: '3', label: 'Últimos 3 dias', inicio: 2, fim: 0 },
  { id: '7', label: 'Últimos 7 dias', inicio: 6, fim: 0 },
  { id: '15', label: 'Últimos 15 dias', inicio: 14, fim: 0 },
  { id: '30', label: 'Últimos 30 dias', inicio: 29, fim: 0 },
  { id: '60', label: 'Últimos 60 dias', inicio: 59, fim: 0 },
  { id: '90', label: 'Últimos 90 dias', inicio: 89, fim: 0 },
]

/** Data de hoje em Brasília, no formato AAAA-MM-DD (igual ao banco). */
function hojeBrasilia(): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  return partes // en-CA já devolve AAAA-MM-DD
}

function somaDias(iso: string, n: number): string {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10)
}

function diasEntre(inicio: string, fim: string): number {
  const [a1, m1, d1] = inicio.split('-').map(Number)
  const [a2, m2, d2] = fim.split('-').map(Number)
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86_400_000) + 1
}

const dataCurta = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

/* --------------------------------------------------------------------- dados */

interface Linha {
  nome: string
  total: number
}
interface PorDia {
  dia: string
  unicos: number
  acessos: number
}
interface Metricas {
  unicos: number
  acessos: number
  por_dia: PorDia[]
  por_origem: Linha[]
  por_dispositivo: Linha[]
}

const ROTULO: Record<string, string> = {
  direto: 'Acesso direto',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  google: 'Google',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  outro: 'Outros sites',
  celular: 'Celular',
  computador: 'Computador',
  tablet: 'Tablet',
}

const num = (n: number) => new Intl.NumberFormat('pt-BR').format(n)

function normaliza(raw: unknown): Metricas {
  const r = (raw ?? {}) as Partial<Metricas>
  return {
    unicos: Number(r.unicos ?? 0),
    acessos: Number(r.acessos ?? 0),
    por_dia: Array.isArray(r.por_dia) ? r.por_dia.map((d) => ({ dia: String(d.dia), unicos: Number(d.unicos), acessos: Number(d.acessos) })) : [],
    por_origem: Array.isArray(r.por_origem) ? r.por_origem.map((o) => ({ nome: String(o.nome), total: Number(o.total) })) : [],
    por_dispositivo: Array.isArray(r.por_dispositivo) ? r.por_dispositivo.map((o) => ({ nome: String(o.nome), total: Number(o.total) })) : [],
  }
}

/* ------------------------------------------------------------------ pedaços */

function Variacao({ atual, anterior }: { atual: number; anterior: number }) {
  if (anterior === 0 && atual === 0) {
    return <span className="flex items-center gap-1 text-xs text-mute"><Minus className="h-3.5 w-3.5" />sem dados antes</span>
  }
  if (anterior === 0) {
    return <span className="flex items-center gap-1 text-xs text-gold-light"><ArrowUpRight className="h-3.5 w-3.5" />novo no período</span>
  }
  const pct = Math.round(((atual - anterior) / anterior) * 100)
  if (pct === 0) return <span className="flex items-center gap-1 text-xs text-mute"><Minus className="h-3.5 w-3.5" />igual ao período anterior</span>
  const subiu = pct > 0
  return (
    <span className={`flex items-center gap-1 text-xs ${subiu ? 'text-gold-light' : 'text-red-300/90'}`}>
      {subiu ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {subiu ? '+' : ''}{pct}% vs. período anterior
    </span>
  )
}

function Cartao({ titulo, valor, ajuda, extra }: { titulo: string; valor: string; ajuda: string; extra?: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl p-5 sm:p-6">
      <p className="font-cinzel text-[0.72rem] tracking-[0.2em] text-gold/90">{titulo}</p>
      <p className="gold-text mt-3 font-display text-5xl leading-none">{valor}</p>
      <p className="mt-3 text-xs text-mute">{ajuda}</p>
      {extra && <div className="mt-3">{extra}</div>}
    </div>
  )
}

function Ranking({ titulo, linhas }: { titulo: string; linhas: Linha[] }) {
  const max = Math.max(1, ...linhas.map((l) => l.total))
  return (
    <div className="glass rounded-3xl p-5 sm:p-6">
      <p className="font-cinzel text-[0.72rem] tracking-[0.2em] text-gold/90">{titulo}</p>
      {linhas.length === 0 ? (
        <p className="mt-4 text-sm text-mute">Ainda sem dados neste período.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {linhas.map((l) => (
            <li key={l.nome}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span>{ROTULO[l.nome] ?? l.nome}</span>
                <span className="text-mute">{num(l.total)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold-light" style={{ width: `${(l.total / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Grafico({ dias }: { dias: PorDia[] }) {
  const max = Math.max(1, ...dias.map((d) => d.unicos))
  const muitos = dias.length > 31
  // mostra uma data a cada tantas barras, para não encavalar
  const passo = dias.length <= 15 ? 1 : dias.length <= 31 ? 5 : 15
  return (
    <div className="glass rounded-3xl p-5 sm:p-6">
      <p className="font-cinzel text-[0.72rem] tracking-[0.2em] text-gold/90">PESSOAS POR DIA</p>
      <div className="mt-5 flex h-44 items-end gap-[3px]" role="img" aria-label="Gráfico de visitantes únicos por dia">
        {dias.map((d) => (
          <div key={d.dia} className="group relative flex h-full flex-1 items-end" title={`${dataCurta(d.dia)}: ${d.unicos} pessoa(s), ${d.acessos} acesso(s)`}>
            <div
              className="w-full rounded-t-[3px] bg-gradient-to-t from-gold-dark/70 to-gold-light/90 transition-opacity group-hover:opacity-80"
              style={{ height: d.unicos === 0 ? '2px' : `${Math.max(4, (d.unicos / max) * 100)}%`, opacity: d.unicos === 0 ? 0.25 : 1 }}
            />
            {!muitos && d.unicos > 0 && dias.length <= 15 && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[0.65rem] text-bone/80">{d.unicos}</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-[3px] text-[0.65rem] text-mute">
        {dias.map((d, i) => (
          <span key={d.dia} className="flex-1 overflow-visible whitespace-nowrap text-center">
            {i % passo === 0 || i === dias.length - 1 ? dataCurta(d.dia) : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- secção */

export default function MetricasSection({ sb }: { sb: SupabaseClient }) {
  const [periodoId, setPeriodoId] = useState<PeriodoId>('7')
  const [atual, setAtual] = useState<Metricas | null>(null)
  const [anterior, setAnterior] = useState<Metricas | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const periodo = useMemo(() => PERIODOS.find((p) => p.id === periodoId) ?? PERIODOS[3], [periodoId])

  const intervalo = useMemo(() => {
    const hoje = hojeBrasilia()
    const inicio = somaDias(hoje, -periodo.inicio)
    const fim = somaDias(hoje, -periodo.fim)
    const dias = diasEntre(inicio, fim)
    const fimAnt = somaDias(inicio, -1)
    const inicioAnt = somaDias(fimAnt, -(dias - 1))
    return { inicio, fim, dias, inicioAnt, fimAnt }
    // "tick" força recalcular a data de hoje ao atualizar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, tick])

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const [a, b] = await Promise.all([
        sb.rpc('metricas_visitas', { p_inicio: intervalo.inicio, p_fim: intervalo.fim }),
        sb.rpc('metricas_visitas', { p_inicio: intervalo.inicioAnt, p_fim: intervalo.fimAnt }),
      ])
      const falha = a.error ?? b.error
      if (falha) throw new Error(falha.message)
      setAtual(normaliza(a.data))
      setAnterior(normaliza(b.data))
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Erro desconhecido'
      setErro(
        /metricas_visitas|function|schema cache|does not exist/i.test(m)
          ? 'Falta rodar o arquivo supabase/migracao-v4.sql no Supabase (SQL Editor). Depois toque em Atualizar.'
          : `Não foi possível carregar as métricas: ${m}`,
      )
      setAtual(null)
      setAnterior(null)
    } finally {
      setCarregando(false)
    }
  }, [sb, intervalo])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const mediaDia = atual && intervalo.dias > 0 ? atual.unicos / intervalo.dias : 0
  const textoPeriodo =
    intervalo.dias === 1 ? dataCurta(intervalo.inicio) : `${dataCurta(intervalo.inicio)} a ${dataCurta(intervalo.fim)}`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Visitas no site</h2>
          <p className="text-xs text-mute">Dia de Brasília · {textoPeriodo} · o seu próprio acesso logado não é contado</p>
        </div>
        <button
          onClick={() => { haptics.tap(); setTick((t) => t + 1) }}
          className="glass flex h-10 items-center gap-2 rounded-full px-4 text-sm text-mute"
          aria-label="Atualizar métricas"
        >
          <RefreshCw className={`h-4 w-4 ${carregando ? 'animate-spin' : ''}`} strokeWidth={1.6} />Atualizar
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Período">
        {PERIODOS.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={periodoId === p.id}
            onClick={() => { haptics.tap(); setPeriodoId(p.id) }}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              periodoId === p.id ? 'border-gold/50 bg-gold/10 text-gold-light' : 'border-white/10 text-mute hover:text-bone'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {erro && <p className="glass rounded-2xl border-red-400/40 p-4 text-sm text-red-300">{erro}</p>}

      {!erro && carregando && !atual && (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>
      )}

      {atual && anterior && (
        <div className={`space-y-6 transition-opacity ${carregando ? 'opacity-60' : ''}`}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Cartao
              titulo="PESSOAS QUE ACESSARAM"
              valor={num(atual.unicos)}
              ajuda="Visitantes diferentes (cada pessoa conta uma vez por dia)."
              extra={<Variacao atual={atual.unicos} anterior={anterior.unicos} />}
            />
            <Cartao
              titulo="ABERTURAS DO SITE"
              valor={num(atual.acessos)}
              ajuda="Quantas vezes o site foi aberto, contando quem voltou."
              extra={<Variacao atual={atual.acessos} anterior={anterior.acessos} />}
            />
            <Cartao
              titulo="MÉDIA POR DIA"
              valor={mediaDia >= 10 ? num(Math.round(mediaDia)) : mediaDia.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
              ajuda="Pessoas por dia neste período."
            />
          </div>

          {intervalo.dias > 1 && <Grafico dias={atual.por_dia} />}

          <div className="grid gap-4 md:grid-cols-2">
            <Ranking titulo="DE ONDE VIERAM" linhas={atual.por_origem} />
            <Ranking titulo="APARELHO" linhas={atual.por_dispositivo} />
          </div>

          <p className="text-xs leading-relaxed text-mute">
            A contagem começou quando esta função foi publicada: visitas anteriores não aparecem aqui. Quem acessa por aparelhos
            diferentes (celular e computador) conta como duas pessoas.
          </p>
        </div>
      )}
    </div>
  )
}
