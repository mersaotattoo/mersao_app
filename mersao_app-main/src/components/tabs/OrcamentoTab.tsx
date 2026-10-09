'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Upload, X } from 'lucide-react'
import Heading from '../Heading'
import InstagramCTA from '../InstagramCTA'
import { HapticButton } from '../HapticButton'
import { createClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { ErroAmigavel, MAX_REF_FILES, MAX_REF_MB, uploadReferencia } from '@/lib/media'
import { waLink } from '@/lib/format'
import { haptics } from '@/lib/haptics'
import type { Perfil } from '@/lib/types'

interface Props {
  perfil: Perfil
  prefill: string
  notify: (msg: string) => void
}

const MAX_IDEIA_NA_MENSAGEM = 1200

/** Monta o texto que chega pronto na conversa do WhatsApp do estúdio. */
function montarMensagem(d: {
  estudio: string
  nome: string
  telefone: string
  local: string
  ideia: string
  temReferencia: boolean
  urls: string[]
}) {
  const ideia = d.ideia.length > MAX_IDEIA_NA_MENSAGEM ? `${d.ideia.slice(0, MAX_IDEIA_NA_MENSAGEM)}…` : d.ideia
  const linhas = [
    `Olá, ${d.estudio}! Vim pelo site e gostaria de um orçamento.`,
    '',
    `Nome: ${d.nome}`,
  ]
  if (d.telefone) linhas.push(`Meu WhatsApp: ${d.telefone}`)
  linhas.push(`Local do corpo: ${d.local || 'a definir'}`, `Ideia: ${ideia}`)

  if (d.urls.length > 0) {
    linhas.push('', d.urls.length > 1 ? 'Imagens de referência:' : 'Imagem de referência:', ...d.urls)
  } else if (d.temReferencia) {
    linhas.push('', 'Tenho referência e vou enviar a imagem por aqui.')
  } else {
    linhas.push('', 'Referência: ainda não tenho.')
  }
  return linhas.join('\n')
}

export default function OrcamentoTab({ perfil, prefill, notify }: Props) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [local, setLocal] = useState('')
  const [ideia, setIdeia] = useState(prefill ? `Quero reservar o flash: ${prefill}.` : '')
  const [ref, setRef] = useState<'sim' | 'nao'>('nao')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [maior, setMaior] = useState(false)
  const [spam, setSpam] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (prefill) setIdeia(`Quero reservar o flash: ${prefill}.`)
  }, [prefill])

  // miniaturas das imagens escolhidas (liberadas da memória quando mudam)
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  function adicionar(list: File[]) {
    const imagens = list.filter((f) => f.type.startsWith('image/'))
    if (imagens.length < list.length) notify('Só imagens são aceitas como referência.')
    if (imagens.length === 0) return
    const livres = MAX_REF_FILES - files.length
    if (livres <= 0) {
      notify(`Você pode enviar até ${MAX_REF_FILES} imagens.`)
      return
    }
    if (imagens.length > livres) notify(`O limite é de ${MAX_REF_FILES} imagens: mantivemos as primeiras.`)
    setFiles([...files, ...imagens.slice(0, livres)])
  }

  function recomecar() {
    setNome('')
    setTelefone('')
    setLocal('')
    setIdeia('')
    setRef('nao')
    setFiles([])
    setMaior(false)
    setEnviado(null)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (spam || enviando) return // campo invisível preenchido = robô
    if (!maior) {
      haptics.tattoo()
      notify('Confirme que tem 18 anos ou mais (ou virá com um responsável).')
      return
    }

    // Abre a aba do WhatsApp já neste clique: depois do envio das fotos o navegador
    // poderia bloquear o pop-up. Se ela não abrir, usamos a mesma aba mais abaixo.
    let aba: Window | null = null
    try {
      aba = window.open('about:blank', '_blank')
    } catch {
      aba = null
    }

    setEnviando(true)
    try {
      const nomeLimpo = nome.trim()
      const telLimpo = telefone.trim()
      const localLimpo = local.trim()
      const ideiaLimpa = ideia.trim()
      const temReferencia = ref === 'sim'

      // 1) envia as imagens de referência (só se a pessoa marcou "Sim" e escolheu arquivos)
      const urls: string[] = []
      if (temReferencia && files.length > 0) {
        try {
          if (!hasSupabaseEnv) throw new Error('Supabase não configurado')
          const sb = createClient()
          for (const f of files) urls.push(await uploadReferencia(sb, f))
        } catch (err) {
          console.error('[orcamento] Falha ao enviar a imagem de referência:', err)
          notify(
            err instanceof ErroAmigavel
              ? err.message
              : 'Não foi possível enviar a imagem agora. Você poderá mandá-la direto no WhatsApp.',
          )
        }
      }

      // 2) guarda o pedido no painel (sem travar o envio se falhar)
      if (hasSupabaseEnv) {
        try {
          const base = { nome: nomeLimpo, telefone: telLimpo || null, local_corpo: localLimpo || null, ideia: ideiaLimpa, tem_referencia: temReferencia }
          const registro = urls.length > 0 ? { ...base, referencia_urls: urls } : base
          const limite = new Promise<{ error: { message: string } }>((resolve) =>
            window.setTimeout(() => resolve({ error: { message: 'tempo esgotado' } }), 5000),
          )
          const { error } = await Promise.race([createClient().from('orcamentos').insert(registro), limite])
          if (error) console.error('[orcamento] Não foi possível salvar no painel:', error.message)
        } catch (err) {
          console.error('[orcamento] Não foi possível salvar no painel:', err)
        }
      }

      // 3) abre o WhatsApp do estúdio com a mensagem pronta
      const url = waLink(
        perfil.whatsapp,
        montarMensagem({ estudio: perfil.nome, nome: nomeLimpo, telefone: telLimpo, local: localLimpo, ideia: ideiaLimpa, temReferencia, urls }),
      )
      haptics.success()
      setEnviado(url)
      if (aba && !aba.closed) aba.location.href = url
      else window.location.href = url
    } catch (err) {
      console.error('[orcamento] Erro inesperado:', err)
      if (aba && !aba.closed) aba.close()
      notify('Algo deu errado ao preparar o pedido. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
      <div>
        <Heading
          title="Vamos desenhar a sua ideia"
          sub="Conte o que você imagina e toque em enviar: abrimos o WhatsApp do estúdio com tudo preenchido. Respondemos com valor e tempo estimado, sem compromisso."
        />
        <ul className="hidden space-y-4 text-[0.95rem] text-bone/70 md:block">
          <li>Resposta personalizada, nunca automática</li>
          <li>Você aprova o desenho antes de tatuar</li>
          <li>Sinal só para reservar o seu horário</li>
        </ul>
      </div>

      <div className="glass relative rounded-[2rem] p-6 sm:p-9">
        <AnimatePresence mode="wait">
          {enviado ? (
            <motion.div
              key="ok"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-10 text-center"
            >
              <motion.span
                initial={{ scale: 0.4 }}
                animate={{ scale: [0.4, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="mb-6 grid h-16 w-16 place-items-center rounded-full border border-gold/50 text-gold"
              >
                <Check className="h-7 w-7" strokeWidth={1.5} />
              </motion.span>
              <h3 className="font-display text-3xl">Falta só enviar</h3>
              <p className="mt-3 max-w-xs text-mute">
                Abrimos o WhatsApp com a sua mensagem pronta: é só tocar em enviar. Se ele não abriu, use o botão abaixo.
              </p>
              <a
                href={enviado}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-b from-gold-light via-gold to-gold-dark px-7 py-3.5 text-[0.92rem] font-medium tracking-wide text-obsidian shadow-gold"
              >
                Abrir WhatsApp
              </a>
              <InstagramCTA handle={perfil.instagram} compact className="mt-4" />
              <button onClick={recomecar} className="mt-6 text-sm text-mute">
                Enviar outro pedido
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} exit={{ opacity: 0 }} className="space-y-6">
              {/* armadilha para robôs: invisível para pessoas */}
              <input
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                value={spam}
                onChange={(e) => setSpam(e.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              <div>
                <label className="label" htmlFor="nome">SEU NOME</label>
                <input id="nome" className="field" value={nome} onChange={(e) => setNome(e.target.value)} required minLength={2} maxLength={80} autoComplete="name" />
              </div>
              <div>
                <label className="label" htmlFor="tel">SEU WHATSAPP (OPCIONAL)</label>
                <input id="tel" className="field" inputMode="tel" placeholder="(31) 9 0000-0000" value={telefone} onChange={(e) => setTelefone(e.target.value)} maxLength={40} autoComplete="tel" />
              </div>
              <div>
                <label className="label" htmlFor="local">LOCAL DO CORPO</label>
                <input id="local" className="field" placeholder="Ex.: antebraço, costela, panturrilha" value={local} onChange={(e) => setLocal(e.target.value)} maxLength={120} />
              </div>
              <div>
                <label className="label" htmlFor="ideia">SUA IDEIA</label>
                <textarea id="ideia" rows={4} className="field resize-none" placeholder="Descreva o desenho, estilo, tamanho aproximado…" value={ideia} onChange={(e) => setIdeia(e.target.value)} required minLength={5} maxLength={1200} />
              </div>
              <div>
                <span className="label">TEM REFERÊNCIA?</span>
                <div className="relative grid grid-cols-2 rounded-full border border-white/10 bg-white/[0.03] p-1">
                  {(['nao', 'sim'] as const).map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => {
                        haptics.tap()
                        setRef(v)
                      }}
                      className={`relative rounded-full py-2.5 text-sm transition-colors ${ref === v ? 'text-gold-light' : 'text-mute'}`}
                    >
                      {ref === v && <motion.span layoutId="ref-pill" className="absolute inset-0 rounded-full bg-gold/12 ring-1 ring-gold/25" />}
                      <span className="relative">{v === 'sim' ? 'Sim' : 'Ainda não'}</span>
                    </button>
                  ))}
                </div>

                {ref === 'sim' && (
                  <div className="mt-4">
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(e) => {
                        const list = Array.from(e.target.files ?? [])
                        e.target.value = ''
                        adicionar(list)
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      disabled={files.length >= MAX_REF_FILES || enviando}
                      className="flex w-full flex-col items-center gap-1.5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-center text-sm transition-colors hover:border-gold/40 disabled:opacity-50"
                    >
                      <Upload className="h-5 w-5 text-gold" strokeWidth={1.5} />
                      <span>{files.length > 0 ? 'Adicionar outra imagem' : 'Escolher imagem de referência'}</span>
                      <span className="text-xs text-mute">
                        Até {MAX_REF_FILES} imagens de até {MAX_REF_MB} MB. Elas seguem como link na mensagem do WhatsApp.
                      </span>
                    </button>
                    {files.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-3">
                        {files.map((f, i) => (
                          <li key={`${f.name}-${i}`} className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-coal">
                            {previews[i] && <img src={previews[i]} alt={`Referência ${i + 1}`} className="h-full w-full object-cover" />}
                            <button
                              type="button"
                              aria-label={`Remover imagem ${i + 1}`}
                              disabled={enviando}
                              onClick={() => setFiles(files.filter((_, j) => j !== i))}
                              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-obsidian/80"
                            >
                              <X className="h-3.5 w-3.5" strokeWidth={1.8} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-bone/70">
                <input type="checkbox" checked={maior} onChange={(e) => setMaior(e.target.checked)} className="mt-1 h-4 w-4 accent-[#D6BC8A]" />
                <span>Tenho 18 anos ou mais. Menores só tatuam com autorização e presença de um responsável.</span>
              </label>
              <HapticButton type="submit" haptic="tattoo" disabled={enviando} className="w-full">
                {enviando ? 'Preparando o WhatsApp…' : 'Enviar para o WhatsApp'}
              </HapticButton>
              <p className="text-center text-xs text-mute">Usamos seus dados apenas para responder ao pedido.</p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
