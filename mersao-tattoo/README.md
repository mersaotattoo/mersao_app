# Mersão Tattoo — Web App (Next.js 14 + Supabase)

Veja `GUIA-PASSO-A-PASSO.md`.

```
src/
  app/
    page.tsx              página pública (SPA)
    login/                login do painel (server action)
    admin/                painel protegido
    actions.ts            atualiza o site após salvar
  components/
    SplashScreen.tsx      abertura 3D da engrenagem
    SiteApp.tsx           casca SPA: abas + dock + transições
    Dock.tsx, Header.tsx, HapticButton.tsx, Lightbox.tsx, ReelPlayer.tsx, GoldCursor.tsx
    tabs/                 Portfólio, Vídeos, Studio, Promos, Orçamento
    admin/AdminPanel.tsx  CMS (fotos, vídeos, promoções, perfil, seções, pedidos)
  lib/
    haptics.ts            navigator.vibrate
    media.ts              compressão/upload (Supabase Storage)
    supabase/             clientes (browser, server, público)
  middleware.ts           bloqueia /admin sem sessão
supabase/schema.sql       tabelas + RLS + storage
```
