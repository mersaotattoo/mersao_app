import SiteApp from '@/components/SiteApp'
import VisitTracker from '@/components/VisitTracker'
import TrackingScripts from '@/components/TrackingScripts'
import { getSiteData } from '@/lib/supabase/public'
import { pixelsFromPerfil } from '@/lib/pixels'

// Página em cache (abre quase instantâneo e gasta muito menos do Supabase).
// Tudo o que for salvo no painel aparece na hora: o painel limpa o cache ao salvar
// (revalidateSite). Como garantia extra, a página também se refaz sozinha a cada 60 s.
export const revalidate = 60

export default async function Home() {
  const data = await getSiteData()
  return (
    <>
      <TrackingScripts pixels={pixelsFromPerfil(data.perfil)} />
      <VisitTracker />
      <SiteApp data={data} />
    </>
  )
}
