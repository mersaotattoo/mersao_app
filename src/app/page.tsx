import SiteApp from '@/components/SiteApp'
import { getSiteData } from '@/lib/supabase/public'

// Atualiza no máximo a cada 60s (e na hora quando você salva no painel).
export const revalidate = 60

export default async function Home() {
  const data = await getSiteData()
  return <SiteApp data={data} />
}
