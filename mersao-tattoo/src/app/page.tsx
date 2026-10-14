import SiteApp from '@/components/SiteApp'
import TrackingScripts from '@/components/TrackingScripts'
import { getSiteData } from '@/lib/supabase/public'
import { pixelsFromPerfil } from '@/lib/pixels'

// Sempre renderiza no servidor a cada visita: tudo o que for salvo no painel
// (perfil, fotos, vídeos, categorias, studio, pixels, promoções) aparece no site na hora.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const data = await getSiteData()
  return (
    <>
      <TrackingScripts pixels={pixelsFromPerfil(data.perfil)} />
      <SiteApp data={data} />
    </>
  )
}
