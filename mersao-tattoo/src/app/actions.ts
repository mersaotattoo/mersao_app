'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/supabase/env'

// O painel chama isto depois de salvar, para o site público atualizar na hora.
// Só executa para um administrador logado (qualquer outra pessoa é ignorada).
export async function revalidateSite() {
  if (!hasSupabaseEnv) return
  try {
    const supabase = createClient()
    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) return
    revalidatePath('/')
  } catch {
    /* não deve derrubar o salvamento do painel */
  }
}
