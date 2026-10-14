-- =====================================================================
--  MERSÃO TATTOO — MIGRAÇÃO v3  (rode UMA vez no SQL Editor do Supabase)
--
--  Pré-requisito: a migração v2 (migracao-v2.sql) já foi rodada.
--
--  O que faz (tudo SÓ ACRESCENTA; nada é apagado ou alterado):
--    1) coluna "capa_id" nas categorias (capa de cada categoria do portfólio);
--    2) tabela "studio_midia" (fotos e vídeos da aba Studio);
--    3) colunas dos pixels (Meta, Google, TikTok) no perfil.
--
--  Pode ser rodada de novo sem quebrar.
--  Se aparecer alguma mensagem de erro, não continue: copie a mensagem inteira
--  e peça ajuda antes de publicar o código novo.
--  IMPORTANTE: rode ANTES de publicar o código novo no GitHub/Netlify.
-- =====================================================================

-- ---------------------------------------------------------------------
-- v3 · CAPA DE CADA CATEGORIA DO PORTFÓLIO
--   (cada categoria aponta para UMA foto de capa; se a foto for apagada, a capa volta a ser automática)
-- ---------------------------------------------------------------------
alter table public.categorias
  add column if not exists capa_id uuid references public.portfolio(id) on delete set null;

-- ---------------------------------------------------------------------
-- v3 · STUDIO: fotos e vídeos do espaço de trabalho (aba "Studio" do site)
-- ---------------------------------------------------------------------
create table if not exists public.studio_midia (
  id           uuid primary key default gen_random_uuid(),
  tipo         text not null check (tipo in ('foto', 'video')),
  titulo       text,
  url          text not null,
  poster_url   text,
  storage_path text,
  poster_path  text,
  ordem        int  not null default 0,
  criado_em    timestamptz not null default now()
);
create index if not exists studio_midia_ordem_idx on public.studio_midia (ordem);

alter table public.studio_midia enable row level security;

drop policy if exists "leitura publica" on public.studio_midia;
create policy "leitura publica" on public.studio_midia
  for select to anon, authenticated using (true);

drop policy if exists "admin escreve" on public.studio_midia;
create policy "admin escreve" on public.studio_midia
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- v3 · MARKETING: IDs dos pixels de anúncios (só IDs, com formato validado)
--   Meta: só números · Google: G-XXXX, GT-XXXX ou AW-XXXX · TikTok: letras e números
-- ---------------------------------------------------------------------
alter table public.configuracoes_perfil
  add column if not exists pixel_meta_id   text check (pixel_meta_id   is null or pixel_meta_id   ~ '^[0-9]{10,20}$'),
  add column if not exists pixel_google_id text check (pixel_google_id is null or pixel_google_id ~ '^(G|GT|AW)-[A-Za-z0-9]{4,20}$'),
  add column if not exists pixel_tiktok_id text check (pixel_tiktok_id is null or pixel_tiktok_id ~ '^[A-Za-z0-9]{10,30}$');

-- =====================================================================
--  CONFERÊNCIA (deve retornar 3 linhas preenchidas)
-- =====================================================================
select 'tabela studio_midia' as item, to_regclass('public.studio_midia')::text as resultado
union all
select 'coluna categorias.capa_id', (select column_name::text from information_schema.columns
                                      where table_schema='public' and table_name='categorias' and column_name='capa_id')
union all
select 'colunas de pixel', (select count(*)::text from information_schema.columns
                             where table_schema='public' and table_name='configuracoes_perfil' and column_name like 'pixel\_%');
