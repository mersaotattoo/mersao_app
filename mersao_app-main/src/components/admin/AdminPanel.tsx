'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  ArrowDown, ArrowUp, Check, Clapperboard, ExternalLink, ImageIcon, Inbox, Loader2, LogOut,
  MessageCircle, SlidersHorizontal, Sparkles, Tag, Trash2, Upload, User,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { revalidateSite } from '@/app/actions'
import { sair } from '@/app/login/actions'
import { HapticButton } from '../HapticButton'
import { haptics } from '@/lib/haptics'
import { instagramHandle, waLink } from '@/lib/format'
import { DEFAULT_PERFIL, DEFAULT_SECOES } from '@/lib/defaults'
import { MAX_VIDEO_MB, REF_BUCKET, pathFromUrl, removeFiles, uploadImage, uploadVideo } from '@/lib/media'
import type { Categoria, Orcamento, Perfil, PortfolioItem, Promocao, SecoesVisiveis, VideoItem } from '@/lib/types'

type TabId = 'perfil' | 'portfolio' | 'categorias' | 'videos' | 'promos' | 'orcamentos' | 'secoes'

const NAV: { id: TabId; label: string; Icon: typeof User }[] = [
  { id: 'perfil', label: 'Perfil', Icon: User },
  { id: 'portfolio', label: 'Fotos', Icon: ImageIcon },
  { id: 'categorias', label: 'Categorias', Icon: Tag },
  { id: 'videos', label: 'Vídeos', Icon: Clapperboard },
  { id: 'promos', label: 'Promoções', Icon: Sparkles },
  { id: 'orcamentos', label: 'Pedidos', Icon: Inbox },
  { id: 'secoes', label: 'Seções', Icon: SlidersHorizontal },
]

interface Ctx {
  sb: SupabaseClient
  busy: string | null
  setBusy: (s: string | null) => void
  flash: (m: string, ok?: boolean) => void
  run: (label: string, fn: () => Promise<void>) => Promise<void>
}

const errMsg = (e: unknown) => (e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : 'Algo deu errado.')
const must = (r: { error: { message: string } | null }) => {
  if (r.error) throw new Error(r.error.message)
}

/* ------------------------------------------------------------------ UI base */

function DropZone({
  kind, multiple, onFiles, busy, title, hint, compact,
}: {
  kind: 'image' | 'video'
  multiple?: boolean
  onFiles: (f: File[]) => void
  busy?: boolean
  title: string
  hint?: string
  compact?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const accept = kind === 'image' ? 'image/*' : 'video/mp4,video/quicktime,video/webm'
  const take = (list: File[]) => {
    const ok = list.filter((f) => f.type.startsWith(kind))
    if (ok.length) onFiles(multiple ? ok : ok.slice(0, 1))
  }
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !busy && input.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && !busy && input.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); if (!busy) take(Array.from(e.dataTransfer.files)) }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed text-center transition-colors ${
        compact ? 'gap-1 px-4 py-5' : 'gap-2 px-6 py-9'
      } ${over ? 'border-gold bg-gold/[0.07]' : 'border-white/15 bg-white/[0.02] hover:border-gold/40'} ${busy ? 'pointer-events-none opacity-60' : ''}`}
    >
      <input
        ref={input}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const list = Array.from(e.target.files ?? [])
          e.target.value = ''
          take(list)
        }}
      />
      {busy ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : <Upload className="h-5 w-5 text-gold" strokeWidth={1.5} />}
      <p className="text-sm text-bone">{title}</p>
      {hint && <p className="text-xs text-mute">{hint}</p>}
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => { haptics.tap(); onChange(!on) }}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${on ? 'border-gold/60 bg-gold/25' : 'border-white/15 bg-white/[0.04]'}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
        className={`absolute top-0.5 h-5 w-5 rounded-full ${on ? 'right-0.5 bg-gold' : 'left-0.5 bg-mute'}`}
      />
    </button>
  )
}

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`glass rounded-3xl p-5 sm:p-6 ${className}`}>{children}</div>
)

/* ----------------------------------------------------------------- Perfil */

function PerfilSection({ ctx, perfil }: { ctx: Ctx; perfil: Perfil }) {
  const [d, setD] = useState({
    nome: perfil.nome, cidade: perfil.cidade, endereco: perfil.endereco,
    bio: perfil.bio, whatsapp: perfil.whatsapp, instagram: perfil.instagram ?? '',
  })

  useEffect(() => {
    setD({
      nome: perfil.nome, cidade: perfil.cidade, endereco: perfil.endereco,
      bio: perfil.bio, whatsapp: perfil.whatsapp, instagram: perfil.instagram ?? '',
    })
  }, [perfil])

  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD((prev) => ({ ...prev, [k]: e.target.value }))

  const trocarFoto = (f: File[]) =>
    ctx.run('Enviando foto…', async () => {
      const up = await uploadImage(ctx.sb, f[0], 'perfil', 700)
      must(await ctx.sb.from('configuracoes_perfil').upsert({ id: 1, foto_perfil_url: up.url }))
      await removeFiles(ctx.sb, [pathFromUrl(perfil.foto_perfil_url)])
      ctx.flash('Foto de perfil atualizada')
    })

  const trocarReel = (f: File[]) =>
    ctx.run('Enviando vídeo… (pode levar um pouco)', async () => {
      const { video, poster } = await uploadVideo(ctx.sb, f[0], 'reel')
      must(await ctx.sb.from('configuracoes_perfil').upsert({ id: 1, video_hero_url: video.url, video_hero_poster_url: poster?.url ?? null }))
      await removeFiles(ctx.sb, [pathFromUrl(perfil.video_hero_url), pathFromUrl(perfil.video_hero_poster_url)])
      ctx.flash('Vídeo da página principal atualizado')
    })

  const removerReel = () =>
    ctx.run('Removendo…', async () => {
      must(await ctx.sb.from('configuracoes_perfil').upsert({ id: 1, video_hero_url: null, video_hero_poster_url: null }))
      await removeFiles(ctx.sb, [pathFromUrl(perfil.video_hero_url), pathFromUrl(perfil.video_hero_poster_url)])
      ctx.flash('Vídeo removido')
    })

  const salvar = () =>
    ctx.run('Salvando…', async () => {
      const insta = d.instagram.trim() ? instagramHandle(d.instagram) : null
      if (d.instagram.trim() && !insta) throw new Error('Instagram inválido. Use algo como @mersao.tattoo.')
      must(await ctx.sb.from('configuracoes_perfil').upsert({
        id: 1, ...d, instagram: insta, atualizado_em: new Date().toISOString(),
      }))
      ctx.flash('Dados salvos')
    })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <h3 className="mb-5 font-display text-xl">Foto de perfil</h3>
          <div className="flex items-center gap-5">
            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border border-gold/40 bg-coal">
              {perfil.foto_perfil_url ? <img src={perfil.foto_perfil_url} alt="" className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-mute" strokeWidth={1.2} />}
            </div>
            <div className="flex-1">
              <DropZone compact kind="image" onFiles={trocarFoto} busy={!!ctx.busy} title="Trocar foto" hint="Toque ou arraste" />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-1 font-display text-xl">Vídeo criativo (página principal)</h3>
          <p className="mb-5 text-sm text-mute">Formato retrato 9:16, igual ao Reels. Até {MAX_VIDEO_MB} MB.</p>
          {perfil.video_hero_url && (
            <div className="mb-4 flex items-end gap-4">
              <video src={perfil.video_hero_url} poster={perfil.video_hero_poster_url ?? undefined} controls playsInline muted className="aspect-[9/16] h-52 rounded-2xl bg-coal object-cover" />
              <button onClick={removerReel} disabled={!!ctx.busy} className="flex items-center gap-2 text-sm text-red-300/90">
                <Trash2 className="h-4 w-4" strokeWidth={1.5} /> Remover
              </button>
            </div>
          )}
          <DropZone kind="video" onFiles={trocarReel} busy={!!ctx.busy} title={perfil.video_hero_url ? 'Trocar vídeo' : 'Enviar vídeo'} hint="MP4 em H.264 funciona em todos os aparelhos" />
        </Card>
      </div>

      <Card>
        <h3 className="mb-5 font-display text-xl">Dados do estúdio</h3>
        <div className="space-y-5">
          <div><label className="label">NOME</label><input className="field" value={d.nome} onChange={set('nome')} /></div>
          <div><label className="label">CIDADE</label><input className="field" value={d.cidade} onChange={set('cidade')} /></div>
          <div><label className="label">ENDEREÇO (PARA O MAPA)</label><input className="field" value={d.endereco} onChange={set('endereco')} placeholder="Rua, número, bairro, cidade" /></div>
          <div><label className="label">WHATSAPP (COM DDD)</label><input className="field" inputMode="tel" value={d.whatsapp} onChange={set('whatsapp')} placeholder="5531999999999" /></div>
          <div>
            <label className="label">INSTAGRAM</label>
            <input className="field" value={d.instagram} onChange={set('instagram')} placeholder="@mersao.tattoo" />
            <p className="mt-2 text-xs text-mute">Aparece no topo do site e no botão Seguir. Se deixar vazio, o site usa @mersao.tattoo.</p>
          </div>
          <div><label className="label">APRESENTAÇÃO</label><textarea className="field resize-none" rows={5} value={d.bio} onChange={set('bio')} /></div>
          <HapticButton onClick={salvar} disabled={!!ctx.busy} className="w-full">Salvar alterações</HapticButton>
        </div>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ Seções */

const SECAO_INFO: [keyof SecoesVisiveis, string, string][] = [
  ['portfolio', 'Portfólio', 'Aba com a galeria de fotos'],
  ['videos', 'Vídeos', 'Aba com os vídeos "mão na massa"'],
  ['studio', 'Studio', 'Mapa, diferenciais e dúvidas'],
  ['promos', 'Promoções', 'Aba com os flashes'],
  ['orcamento', 'Orçamento', 'Formulário de pedido'],
  ['reel', 'Vídeo criativo', 'Vídeo retrato da página principal'],
  ['depoimentos', 'Depoimentos', 'Avaliações abaixo da galeria'],
]

function SecoesSection({ ctx, perfil }: { ctx: Ctx; perfil: Perfil }) {
  const atual = { ...DEFAULT_SECOES, ...perfil.secoes_visiveis }
  return (
    <Card className="mx-auto max-w-2xl">
      <h3 className="font-display text-xl">O que aparece no site</h3>
      <p className="mb-4 mt-1 text-sm text-mute">Desligue uma seção para escondê-la do menu e da página.</p>
      <div className="divide-y divide-white/[0.07]">
        {SECAO_INFO.map(([k, t, s]) => (
          <div key={k} className="flex items-center justify-between gap-4 py-4">
            <div><p>{t}</p><p className="text-xs text-mute">{s}</p></div>
            <Toggle
              on={atual[k]}
              onChange={(v) =>
                ctx.run('Salvando…', async () => {
                  must(await ctx.sb.from('configuracoes_perfil').upsert({ id: 1, secoes_visiveis: { ...atual, [k]: v } }))
                })
              }
            />
          </div>
        ))}
      </div>
    </Card>
  )
}

/* --------------------------------------------------------------- Portfólio */

function MoveButtons({ i, n, onMove }: { i: number; n: number; onMove: (d: -1 | 1) => void }) {
  const b = 'grid h-9 w-9 place-items-center rounded-full border border-white/10 disabled:opacity-30'
  return (
    <div className="flex gap-1.5">
      <button className={b} disabled={i === 0} onClick={() => onMove(-1)} aria-label="Mover para trás"><ArrowUp className="h-4 w-4" strokeWidth={1.5} /></button>
      <button className={b} disabled={i === n - 1} onClick={() => onMove(1)} aria-label="Mover para frente"><ArrowDown className="h-4 w-4" strokeWidth={1.5} /></button>
    </div>
  )
}

async function reorder(sb: SupabaseClient, table: 'portfolio' | 'videos' | 'categorias', list: { id: string }[], i: number, d: -1 | 1) {
  const next = [...list]
  const j = i + d
  if (j < 0 || j >= next.length) return
  ;[next[i], next[j]] = [next[j], next[i]]
  const results = await Promise.all(next.map((it, idx) => sb.from(table).update({ ordem: idx }).eq('id', it.id)))
  results.forEach((r) => must(r))
}

function AvisoCategorias() {
  return (
    <Card className="!border-red-400/30">
      <p className="text-sm text-red-300">
        As categorias ainda não foram ativadas no banco de dados. Abra o Supabase, entre em SQL Editor e rode o arquivo
        supabase/migracao-v2.sql (uma vez só). Depois recarregue esta página.
      </p>
    </Card>
  )
}

function PortfolioSection({
  ctx, items, categorias, catIndisponivel,
}: { ctx: Ctx; items: PortfolioItem[]; categorias: Categoria[]; catIndisponivel: boolean }) {
  const [catNova, setCatNova] = useState('')
  const catValida = categorias.some((c) => c.id === catNova) ? catNova : ''

  const enviar = (files: File[]) =>
    ctx.run('Enviando…', async () => {
      let ordem = Math.min(0, ...items.map((i) => i.ordem))
      for (let n = 0; n < files.length; n++) {
        ctx.setBusy(`Enviando foto ${n + 1} de ${files.length}…`)
        const up = await uploadImage(ctx.sb, files[n], 'portfolio')
        ordem -= 1
        const r = await ctx.sb.from('portfolio').insert({
          imagem_url: up.url, storage_path: up.path, ordem, ...(catValida ? { categoria_id: catValida } : {}),
        })
        if (r.error) {
          // não deixa o arquivo "órfão" no armazenamento se o registro não foi salvo
          try { await removeFiles(ctx.sb, [up.path]) } catch { /* ignora */ }
          throw new Error(r.error.message)
        }
      }
      ctx.flash(`${files.length} foto(s) adicionada(s)`)
    })

  const remover = (it: PortfolioItem) => {
    if (!window.confirm('Excluir esta foto?')) return
    ctx.run('Excluindo…', async () => {
      must(await ctx.sb.from('portfolio').delete().eq('id', it.id))
      await removeFiles(ctx.sb, [it.storage_path ?? pathFromUrl(it.imagem_url)])
      ctx.flash('Foto excluída')
    })
  }

  const salvarTitulo = (it: PortfolioItem, valor: string) => {
    if ((it.titulo ?? '') === valor.trim()) return
    ctx.run('Salvando…', async () => {
      must(await ctx.sb.from('portfolio').update({ titulo: valor.trim() || null }).eq('id', it.id))
    })
  }

  const mudarCategoria = (it: PortfolioItem, valor: string) =>
    ctx.run('Salvando…', async () => {
      must(await ctx.sb.from('portfolio').update({ categoria_id: valor || null }).eq('id', it.id))
    })

  return (
    <div className="space-y-6">
      {catIndisponivel && <AvisoCategorias />}
      {!catIndisponivel && (
        <Card>
          <label className="label" htmlFor="cat-nova">CATEGORIA DAS NOVAS FOTOS</label>
          <select id="cat-nova" className="field" value={catValida} onChange={(e) => setCatNova(e.target.value)}>
            <option value="">Sem categoria</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          {categorias.length === 0 && <p className="mt-2 text-xs text-mute">Crie categorias na aba Categorias para organizar o portfólio.</p>}
        </Card>
      )}
      <DropZone kind="image" multiple onFiles={enviar} busy={!!ctx.busy} title="Adicionar fotos ao portfólio" hint="Toque para escolher da galeria ou arraste vários arquivos. As fotos são otimizadas automaticamente." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <Card key={it.id} className="!p-3">
            <img src={it.imagem_url} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" loading="lazy" />
            <div className="mt-3 space-y-2">
              <input className="field !py-2.5 !text-sm" placeholder="Título (opcional)" defaultValue={it.titulo ?? ''} onBlur={(e) => salvarTitulo(it, e.target.value)} />
              <select
                className="field !py-2.5 !text-sm"
                aria-label="Categoria da foto"
                value={it.categoria_id ?? ''}
                disabled={!!ctx.busy || catIndisponivel}
                onChange={(e) => mudarCategoria(it, e.target.value)}
              >
                <option value="">Sem categoria</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <div className="flex items-center justify-between pt-1">
                <MoveButtons i={i} n={items.length} onMove={(d) => ctx.run('Reordenando…', () => reorder(ctx.sb, 'portfolio', items, i, d))} />
                <button onClick={() => remover(it)} className="flex items-center gap-1.5 text-sm text-red-300/90" aria-label="Excluir"><Trash2 className="h-4 w-4" strokeWidth={1.5} />Excluir</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {items.length === 0 && <p className="text-center text-sm text-mute">Nenhuma foto ainda. Adicione a primeira acima: ela aparece no site na hora.</p>}
    </div>
  )
}

/* -------------------------------------------------------------- Categorias */

function CategoriasSection({
  ctx, categorias, fotos, catIndisponivel,
}: { ctx: Ctx; categorias: Categoria[]; fotos: PortfolioItem[]; catIndisponivel: boolean }) {
  const [nome, setNome] = useState('')

  const emUso = (n: string, ignorarId?: string) =>
    categorias.some((c) => c.id !== ignorarId && c.nome.trim().toLowerCase() === n.trim().toLowerCase())

  const adicionar = () =>
    ctx.run('Criando categoria…', async () => {
      const n = nome.trim()
      if (!n) throw new Error('Digite o nome da categoria.')
      if (n.length > 40) throw new Error('Use no máximo 40 caracteres.')
      if (emUso(n)) throw new Error('Já existe uma categoria com esse nome.')
      const ordem = Math.max(-1, ...categorias.map((c) => c.ordem)) + 1
      must(await ctx.sb.from('categorias').insert({ nome: n, ordem }))
      setNome('')
      ctx.flash('Categoria criada')
    })

  const renomear = (c: Categoria, campo: HTMLInputElement) => {
    const n = campo.value.trim()
    if (n === c.nome) return
    if (!n || n.length > 40 || emUso(n, c.id)) {
      ctx.flash(!n ? 'O nome não pode ficar vazio.' : n.length > 40 ? 'Use no máximo 40 caracteres.' : 'Já existe uma categoria com esse nome.', false)
      campo.value = c.nome
      return
    }
    ctx.run('Salvando…', async () => {
      must(await ctx.sb.from('categorias').update({ nome: n }).eq('id', c.id))
    })
  }

  const excluir = (c: Categoria, qtd: number) => {
    const aviso = qtd > 0
      ? `Excluir a categoria ${c.nome}? As ${qtd} foto(s) continuam no portfólio, só ficam sem categoria.`
      : `Excluir a categoria ${c.nome}?`
    if (!window.confirm(aviso)) return
    ctx.run('Excluindo…', async () => {
      must(await ctx.sb.from('categorias').delete().eq('id', c.id))
      ctx.flash('Categoria excluída')
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {catIndisponivel && <AvisoCategorias />}
      <Card>
        <h3 className="font-display text-xl">Nova categoria</h3>
        <p className="mb-4 mt-1 text-sm text-mute">As categorias viram os filtros do portfólio no site (só aparecem as que têm fotos).</p>
        <div className="flex gap-3">
          <input
            className="field"
            placeholder="Ex.: Fine line"
            maxLength={40}
            value={nome}
            disabled={catIndisponivel}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') adicionar() }}
          />
          <HapticButton onClick={adicionar} disabled={!!ctx.busy || catIndisponivel} className="shrink-0">Adicionar</HapticButton>
        </div>
      </Card>

      <div className="space-y-3">
        {categorias.map((c, i) => {
          const qtd = fotos.filter((f) => f.categoria_id === c.id).length
          return (
            <Card key={c.id} className="flex flex-wrap items-center gap-3 !p-4">
              <input
                className="field min-w-0 flex-1 !py-2.5 !text-sm"
                aria-label="Nome da categoria"
                maxLength={40}
                defaultValue={c.nome}
                onBlur={(e) => renomear(c, e.currentTarget)}
              />
              <span className="text-xs text-mute">{qtd} foto(s)</span>
              <MoveButtons i={i} n={categorias.length} onMove={(d) => ctx.run('Reordenando…', () => reorder(ctx.sb, 'categorias', categorias, i, d))} />
              <button onClick={() => excluir(c, qtd)} aria-label="Excluir categoria" className="text-red-300/90"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button>
            </Card>
          )
        })}
        {categorias.length === 0 && !catIndisponivel && <p className="text-center text-sm text-mute">Nenhuma categoria ainda. Crie a primeira acima.</p>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Vídeos */

function VideosSection({ ctx, items }: { ctx: Ctx; items: VideoItem[] }) {
  const enviar = (files: File[]) =>
    ctx.run('Enviando…', async () => {
      let ordem = Math.min(0, ...items.map((i) => i.ordem))
      for (let n = 0; n < files.length; n++) {
        ctx.setBusy(`Enviando vídeo ${n + 1} de ${files.length}… (aguarde)`)
        const { video, poster } = await uploadVideo(ctx.sb, files[n], 'videos')
        ordem -= 1
        must(await ctx.sb.from('videos').insert({
          titulo: files[n].name.replace(/\.[^.]+$/, '').slice(0, 60),
          video_url: video.url, storage_path: video.path,
          poster_url: poster?.url ?? null, poster_path: poster?.path ?? null, ordem,
        }))
      }
      ctx.flash(`${files.length} vídeo(s) adicionado(s)`)
    })

  const remover = (v: VideoItem) => {
    if (!window.confirm('Excluir este vídeo?')) return
    ctx.run('Excluindo…', async () => {
      must(await ctx.sb.from('videos').delete().eq('id', v.id))
      await removeFiles(ctx.sb, [v.storage_path ?? pathFromUrl(v.video_url), v.poster_path ?? pathFromUrl(v.poster_url)])
      ctx.flash('Vídeo excluído')
    })
  }

  return (
    <div className="space-y-6">
      <DropZone kind="video" multiple onFiles={enviar} busy={!!ctx.busy} title="Adicionar vídeos do processo" hint={`MP4, retrato (9:16) de preferência. Máximo ${MAX_VIDEO_MB} MB por vídeo. A capa é criada sozinha.`} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((v, i) => (
          <Card key={v.id} className="!p-3">
            <video src={v.poster_url ? v.video_url : `${v.video_url}#t=0.1`} poster={v.poster_url ?? undefined} controls playsInline preload="metadata" className="aspect-[9/16] w-full rounded-2xl bg-coal object-cover" />
            <input
              className="field mt-3 !py-2.5 !text-sm"
              placeholder="Legenda"
              defaultValue={v.titulo ?? ''}
              onBlur={(e) => {
                if ((v.titulo ?? '') !== e.target.value.trim())
                  ctx.run('Salvando…', async () => { must(await ctx.sb.from('videos').update({ titulo: e.target.value.trim() || null }).eq('id', v.id)) })
              }}
            />
            <div className="mt-3 flex items-center justify-between">
              <MoveButtons i={i} n={items.length} onMove={(d) => ctx.run('Reordenando…', () => reorder(ctx.sb, 'videos', items, i, d))} />
              <button onClick={() => remover(v)} aria-label="Excluir" className="text-red-300/90"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- Promoções */

function PromoRow({ ctx, p }: { ctx: Ctx; p: Promocao }) {
  const [nome, setNome] = useState(p.nome)
  const [antigo, setAntigo] = useState(p.preco_antigo?.toString() ?? '')
  const [novo, setNovo] = useState(p.preco_novo.toString())

  useEffect(() => {
    setNome(p.nome)
    setAntigo(p.preco_antigo?.toString() ?? '')
    setNovo(p.preco_novo.toString())
  }, [p])

  const salvar = () =>
    ctx.run('Salvando…', async () => {
      const pn = Number(novo.replace(',', '.'))
      if (!nome.trim() || Number.isNaN(pn)) throw new Error('Preencha o nome e um preço válido.')
      const pa = antigo ? Number(antigo.replace(',', '.')) : null
      must(await ctx.sb.from('promocoes').update({ nome: nome.trim(), preco_antigo: pa, preco_novo: pn }).eq('id', p.id))
      ctx.flash('Promoção salva')
    })
  const remover = () => {
    if (!window.confirm('Excluir esta promoção?')) return
    ctx.run('Excluindo…', async () => {
      must(await ctx.sb.from('promocoes').delete().eq('id', p.id))
      await removeFiles(ctx.sb, [p.storage_path ?? pathFromUrl(p.imagem_url)])
    })
  }
  return (
    <Card className="flex gap-4 !p-3">
      {p.imagem_url && <img src={p.imagem_url} alt="" className="h-28 w-28 shrink-0 rounded-2xl object-cover" />}
      <div className="min-w-0 flex-1 space-y-2">
        <input className="field !py-2.5 !text-sm" value={nome} onChange={(e) => setNome(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className="field !py-2.5 !text-sm" inputMode="decimal" placeholder="De (R$)" value={antigo} onChange={(e) => setAntigo(e.target.value)} />
          <input className="field !py-2.5 !text-sm" inputMode="decimal" placeholder="Por (R$)" value={novo} onChange={(e) => setNovo(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
          <button onClick={salvar} className="flex items-center gap-1.5 text-sm text-gold"><Check className="h-4 w-4" />Salvar</button>
          <button onClick={remover} aria-label="Excluir" className="text-red-300/90"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button>
        </div>
      </div>
    </Card>
  )
}

function PromosSection({ ctx, items }: { ctx: Ctx; items: Promocao[] }) {
  const [nome, setNome] = useState('')
  const [antigo, setAntigo] = useState('')
  const [novo, setNovo] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const adicionar = () =>
    ctx.run('Adicionando…', async () => {
      const pn = Number(novo.replace(',', '.'))
      if (!nome.trim() || Number.isNaN(pn)) throw new Error('Informe o nome e o preço promocional.')
      const up = file ? await uploadImage(ctx.sb, file, 'promocoes', 1400) : null
      const ordem = Math.min(0, ...items.map((i) => i.ordem)) - 1
      must(await ctx.sb.from('promocoes').insert({
        nome: nome.trim(), preco_antigo: antigo ? Number(antigo.replace(',', '.')) : null, preco_novo: pn,
        imagem_url: up?.url ?? null, storage_path: up?.path ?? null, ordem,
      }))
      setNome(''); setAntigo(''); setNovo(''); setFile(null)
      ctx.flash('Promoção criada')
    })

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="h-fit">
        <h3 className="mb-5 font-display text-xl">Nova promoção</h3>
        <div className="space-y-4">
          <input className="field" placeholder="Nome do flash" value={nome} onChange={(e) => setNome(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className="field" inputMode="decimal" placeholder="De (R$)" value={antigo} onChange={(e) => setAntigo(e.target.value)} />
            <input className="field" inputMode="decimal" placeholder="Por (R$)" value={novo} onChange={(e) => setNovo(e.target.value)} />
          </div>
          <DropZone compact kind="image" onFiles={(f) => setFile(f[0])} title={file ? file.name : 'Imagem do flash'} hint={file ? 'Toque para trocar' : 'Opcional'} />
          <HapticButton onClick={adicionar} disabled={!!ctx.busy} className="w-full">Publicar promoção</HapticButton>
        </div>
      </Card>
      <div className="space-y-4">
        {items.map((p) => <PromoRow key={p.id} ctx={ctx} p={p} />)}
        {items.length === 0 && <p className="text-sm text-mute">Nenhuma promoção cadastrada.</p>}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- Orçamentos */

function PedidosSection({ ctx, items }: { ctx: Ctx; items: Orcamento[] }) {
  const excluir = (o: Orcamento) => {
    if (!window.confirm('Excluir pedido?')) return
    ctx.run('Excluindo…', async () => {
      must(await ctx.sb.from('orcamentos').delete().eq('id', o.id))
      try {
        await removeFiles(ctx.sb, (o.referencia_urls ?? []).map((u) => pathFromUrl(u, REF_BUCKET)), REF_BUCKET)
      } catch {
        /* a limpeza dos arquivos é opcional */
      }
    })
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && <p className="text-center text-mute">Nenhum pedido recebido ainda.</p>}
      {items.map((o) => (
        <Card key={o.id} className={o.status === 'atendido' ? 'opacity-60' : ''}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-xl">{o.nome}</p>
              <p className="text-xs text-mute">{new Date(o.criado_em).toLocaleString('pt-BR')} · {o.local_corpo || 'local a definir'}{o.tem_referencia ? ' · tem referência' : ''}</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs ${o.status === 'novo' ? 'border-gold/50 text-gold-light' : 'border-white/15 text-mute'}`}>{o.status === 'novo' ? 'Novo' : 'Atendido'}</span>
          </div>
          {o.telefone && <p className="mt-2 text-xs text-mute">WhatsApp informado: {o.telefone}</p>}
          <p className="mt-4 whitespace-pre-wrap text-[0.95rem] text-bone/80">{o.ideia}</p>
          {o.referencia_urls && o.referencia_urls.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {o.referencia_urls.map((u, i) => (
                <a
                  key={u}
                  href={u}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir referência ${i + 1}`}
                  className="block h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-coal"
                >
                  <img src={u} alt={`Referência ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                </a>
              ))}
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-5 text-sm">
            {o.telefone && (
              <a href={waLink(o.telefone, `Olá, ${o.nome}! Recebi o seu pedido de orçamento.`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-gold">
                <MessageCircle className="h-4 w-4" strokeWidth={1.5} /> Responder
              </a>
            )}
            <button onClick={() => ctx.run('Salvando…', async () => { must(await ctx.sb.from('orcamentos').update({ status: o.status === 'novo' ? 'atendido' : 'novo' }).eq('id', o.id)) })} className="flex items-center gap-1.5 text-mute">
              <Check className="h-4 w-4" /> {o.status === 'novo' ? 'Marcar atendido' : 'Reabrir'}
            </button>
            <button onClick={() => excluir(o)} className="ml-auto text-red-300/90" aria-label="Excluir"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button>
          </div>
        </Card>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------- Painel */

export default function AdminPanel() {
  const router = useRouter()
  const sb = useMemo(() => createClient(), [])
  const [tab, setTab] = useState<TabId>('perfil')
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [promos, setPromos] = useState<Promocao[]>([])
  const [pedidos, setPedidos] = useState<Orcamento[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [catIndisponivel, setCatIndisponivel] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null)

  const flash = useCallback((t: string, ok = true) => {
    setMsg({ t, ok })
    window.setTimeout(() => setMsg(null), 3600)
  }, [])

  const reload = useCallback(async () => {
    const [a, b, c, d, e, f] = await Promise.all([
      sb.from('configuracoes_perfil').select('*').eq('id', 1).maybeSingle(),
      sb.from('portfolio').select('*').order('ordem', { ascending: true }),
      sb.from('videos').select('*').order('ordem', { ascending: true }),
      sb.from('promocoes').select('*').order('ordem', { ascending: true }),
      sb.from('orcamentos').select('*').order('criado_em', { ascending: false }),
      sb.from('categorias').select('*').order('ordem', { ascending: true }),
    ])
    const falha = [a, b, c, d, e].find((r) => r.error)
    if (falha?.error) flash(`Não foi possível carregar tudo do banco: ${falha.error.message}`, false)
    const p = (a.data as Perfil | null) ?? DEFAULT_PERFIL
    setPerfil({ ...DEFAULT_PERFIL, ...p, secoes_visiveis: { ...DEFAULT_SECOES, ...(p.secoes_visiveis ?? {}) } })
    setPortfolio((b.data as PortfolioItem[]) ?? [])
    setVideos((c.data as VideoItem[]) ?? [])
    setPromos((d.data as Promocao[]) ?? [])
    setPedidos((e.data as Orcamento[]) ?? [])
    setCategorias((f.data as Categoria[] | null) ?? [])
    setCatIndisponivel(Boolean(f.error))
  }, [sb, flash])

  useEffect(() => { void reload() }, [reload])

  const run = useCallback(
    async (label: string, fn: () => Promise<void>) => {
      setBusy(label)
      try {
        await fn()
        try {
          await revalidateSite()
        } catch {
          /* o dado já foi salvo; a atualização do site não pode mascarar isso */
        }
        router.refresh()
        await reload()
      } catch (e) {
        haptics.tattoo()
        flash(errMsg(e), false)
      } finally {
        setBusy(null)
      }
    },
    [reload, flash, router],
  )

  const ctx: Ctx = { sb, busy, setBusy, flash, run }
  const novos = pedidos.filter((p) => p.status === 'novo').length

  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-4 pb-24 pt-[calc(var(--safe-t)+20px)] sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Painel</h1>
          <p className="text-sm text-mute">Gestão do site Mersão Tattoo</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" className="glass flex h-11 items-center gap-2 rounded-full px-5 text-sm"><ExternalLink className="h-4 w-4" strokeWidth={1.5} />Ver site</a>
          <button
            onClick={async () => { await sair(); router.replace('/login'); router.refresh() }}
            className="glass flex h-11 items-center gap-2 rounded-full px-5 text-sm text-mute"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />Sair
          </button>
        </div>
      </header>

      <nav className="sticky top-0 z-30 -mx-4 mb-8 overflow-x-auto bg-obsidian/85 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-full sm:px-2" aria-label="Seções do painel">
        <div className="flex min-w-max gap-1.5">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { haptics.tap(); setTab(id) }}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition-colors ${tab === id ? 'text-gold-light' : 'text-mute hover:text-bone'}`}
            >
              {tab === id && <motion.span layoutId="admin-pill" className="absolute inset-0 rounded-full bg-gold/10 ring-1 ring-gold/25" />}
              <Icon className="relative h-4 w-4" strokeWidth={1.6} />
              <span className="relative">{label}</span>
              {id === 'orcamentos' && novos > 0 && <span className="relative rounded-full bg-gold px-1.5 text-[0.65rem] font-medium text-obsidian">{novos}</span>}
            </button>
          ))}
        </div>
      </nav>

      {!perfil ? (
        <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
            {tab === 'perfil' && <PerfilSection ctx={ctx} perfil={perfil} />}
            {tab === 'portfolio' && <PortfolioSection ctx={ctx} items={portfolio} categorias={categorias} catIndisponivel={catIndisponivel} />}
            {tab === 'categorias' && <CategoriasSection ctx={ctx} categorias={categorias} fotos={portfolio} catIndisponivel={catIndisponivel} />}
            {tab === 'videos' && <VideosSection ctx={ctx} items={videos} />}
            {tab === 'promos' && <PromosSection ctx={ctx} items={promos} />}
            {tab === 'orcamentos' && <PedidosSection ctx={ctx} items={pedidos} />}
            {tab === 'secoes' && <SecoesSection ctx={ctx} perfil={perfil} />}
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {(busy || msg) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            role="status"
            className={`glass fixed inset-x-4 bottom-[calc(var(--safe-b)+20px)] z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl px-5 py-3.5 text-sm ${!busy && msg && !msg.ok ? 'border-red-400/40' : ''}`}
          >
            {busy ? <><Loader2 className="h-4 w-4 animate-spin text-gold" />{busy}</> : <>{msg?.ok ? <Check className="h-4 w-4 text-gold" /> : null}<span className={msg?.ok ? '' : 'text-red-300'}>{msg?.t}</span></>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}