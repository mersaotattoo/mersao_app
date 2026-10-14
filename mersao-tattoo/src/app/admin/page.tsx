import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import AdminPanel from '@/components/admin/AdminPanel'

export const metadata: Metadata = { title: 'Painel', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  if (!hasSupabaseEnv) redirect('/login')
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Segunda barreira (além do middleware): precisa estar na tabela "admins"
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) redirect('/login')

  return <AdminPanel />
}
