'use server'
import { createClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/supabase/env'

export async function entrar(usuario: string, senha: string): Promise<{ ok: boolean; erro?: string }> {
  if (!hasSupabaseEnv) return { ok: false, erro: 'Supabase não configurado. Veja o arquivo .env.' }
  const adminEmail = process.env.ADMIN_EMAIL
  const user = usuario.trim().toLowerCase()
  // "admin" vira o e-mail configurado no servidor (o e-mail nunca vai para o navegador)
  const email = user.includes('@') ? user : user === 'admin' && adminEmail ? adminEmail : ''
  if (!email || !senha) return { ok: false, erro: 'Usuário ou senha incorretos.' }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) return { ok: false, erro: 'Usuário ou senha incorretos.' }

  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    await supabase.auth.signOut()
    return { ok: false, erro: 'Este usuário não tem permissão de administrador.' }
  }
  return { ok: true }
}

export async function sair() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
