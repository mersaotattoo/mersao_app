'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Lock } from 'lucide-react'
import { entrar } from './actions'
import { HapticButton } from '@/components/HapticButton'
import { haptics } from '@/lib/haptics'

export default function LoginForm() {
  const router = useRouter()
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [pending, start] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    start(async () => {
      const r = await entrar(usuario, senha)
      if (r.ok) {
        haptics.success()
        router.replace('/admin')
        router.refresh()
      } else {
        haptics.tattoo()
        setErro(r.erro ?? 'Não foi possível entrar.')
      }
    })
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 50% at 50% 35%, rgba(214,188,138,.10), transparent 70%)' }}
      />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="glass relative w-full max-w-[400px] rounded-[2rem] p-8 sm:p-10"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-obsidian/60">
            <span className="gold-text font-display text-3xl">M</span>
          </div>
          <h1 className="font-display text-3xl">Acesso restrito</h1>
          <p className="mt-2 text-sm text-mute">Painel de gestão do estúdio</p>
        </div>

        <label className="label" htmlFor="usuario">USUÁRIO</label>
        <input
          id="usuario"
          className="field mb-5"
          autoComplete="username"
          autoCapitalize="none"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />

        <label className="label" htmlFor="senha">SENHA</label>
        <input
          id="senha"
          type="password"
          className="field"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <AnimatePresence>
          {erro && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              role="alert"
              className="mt-4 text-sm text-red-300/90"
            >
              {erro}
            </motion.p>
          )}
        </AnimatePresence>

        <HapticButton type="submit" disabled={pending} className="mt-7 w-full">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          Entrar
        </HapticButton>
      </motion.form>
    </main>
  )
}
