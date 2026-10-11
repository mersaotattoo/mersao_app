import SiteApp from '@/components/SiteApp'
import { getSiteData } from '@/lib/supabase/public'

// Sempre renderiza no servidor a cada visita: tudo o que for salvo no painel
// (perfil, fotos, vídeos, categorias, promoções) aparece no site na hora.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const data = await getSiteData()
  return <SiteApp data={data} />
}
