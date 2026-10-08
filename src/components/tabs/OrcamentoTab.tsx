'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Heading from '../Heading'
import { HapticButton } from '../HapticButton'
import { createClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { waLink } from '@/lib/format'
import { haptics } from '@/lib/haptics'
import type { Perfil } from '@/lib/types'

interface Props {
  perfil: Perfil
  prefill: string
  notify: (msg: string) => void
}

export default function OrcamentoTab({ perfil, prefill, notify }: Props) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [local, setLocal] = useState('')
  const [ideia, setIdeia] = useState(prefill ? `Quero reservar o flash: ${prefill}.` : '')
  const [ref, setRef] = useState<'sim' | 'nao'>('nao')
  const [maior, setMaior] = useState(false)
  const [spam, setSpam] = useState('')
  const [enviado, setEnviado] = useState<string | null>(null)

  useEffect(() => {
    if (prefill) setIdeia(`Quero reservar o flash: ${prefill}.`)
  }, [prefill])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (spam) return // campo invisível preenchido = robô
    if (!maior) {
      haptics.tattoo()
      notify('Confirme que tem 18 anos ou mais (ou virá com um responsável).')
      return
    }
    const msg =
      `Olá, ${perfil.nome}! Vim pelo site e gostaria de um orçamento.\n\n` +
      `Nome: ${nome}\nLocal do corpo: ${local || 'a definir'}\nIdeia: ${ideia}\n` +
      `Tenho referência: ${ref === 'sim' ? 'sim (vou enviar a imagem por aqui)' : 'não'}`

    // salva no painel (sem travar o envio se falhar)
    if (hasSupabaseEnv) {
      void createClient()
        .from('orcamentos')
        .insert({ nome, telefone: telefone || null, local_corpo: local || null, ideia, tem_referencia: ref === 'sim' })
        .then(() => undefined)
    }

    haptics.success()
    const url = waLink(perfil.whatsapp, msg)
    window.open(url, '_blank', 'noopener,noreferrer')
    setEnviado(url)
  }

  return (
    <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
      <div>
        <Heading
          title="Vamos desenhar a sua ideia"
          sub="Conte o que você imagina. Respondemos pelo WhatsApp com valor e tempo estimado, sem compromisso."
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
              <h3 className="font-display text-3xl">Pedido enviado</h3>
              <p className="mt-3 max-w-xs text-mute">Abrimos o WhatsApp com a sua mensagem pronta. Se não abriu, toque abaixo.</p>
              <a
                href={enviado}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 text-gold underline underline-offset-4"
              >
                Abrir WhatsApp
              </a>
              <button onClick={() => setEnviado(null)} className="mt-4 text-sm text-mute">
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
                <input id="tel" className="field" inputMode="tel" placeholder="(31) 9 0000-0000" value={telefone} onChange={(e) => setTelefone(e.target.value)} autoComplete="tel" />
              </div>
              <div>
                <label className="label" htmlFor="local">LOCAL DO CORPO</label>
                <input id="local" className="field" placeholder="Ex.: antebraço, costela, panturrilha" value={local} onChange={(e) => setLocal(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="ideia">SUA IDEIA</label>
                <textarea id="ideia" rows={4} className="field resize-none" placeholder="Descreva o desenho, estilo, tamanho aproximado…" value={ideia} onChange={(e) => setIdeia(e.target.value)} required minLength={5} maxLength={2000} />
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
                {ref === 'sim' && <p className="mt-2 text-xs text-mute">Você poderá enviar a imagem de referência direto no WhatsApp.</p>}
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-bone/70">
                <input type="checkbox" checked={maior} onChange={(e) => setMaior(e.target.checked)} className="mt-1 h-4 w-4 accent-[#D6BC8A]" />
                <span>Tenho 18 anos ou mais. Menores só tatuam com autorização e presença de um responsável.</span>
              </label>
              <HapticButton type="submit" haptic="tattoo" className="w-full">
                Enviar para o WhatsApp
              </HapticButton>
              <p className="text-center text-xs text-mute">Usamos seus dados apenas para responder ao pedido.</p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
