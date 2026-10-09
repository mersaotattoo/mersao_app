-- =====================================================================
--  MERSÃO TATTOO — Esquema do banco (Supabase / PostgreSQL)
--  Cole TUDO no SQL Editor do Supabase e clique em RUN.
--  Pode rodar mais de uma vez sem quebrar (é idempotente).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) ADMINS  (quem pode editar o site)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  criado_em timestamptz not null default now()
);
alter table public.admins enable row level security;

drop policy if exists "admin lê o próprio registro" on public.admins;
create policy "admin lê o próprio registro" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- Função usada por TODAS as políticas abaixo
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2) CONFIGURAÇÕES DO PERFIL  (sempre 1 única linha, id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.configuracoes_perfil (
  id                    int primary key default 1 check (id = 1),
  nome                  text not null default 'Mersão Tattoo',
  cidade                text not null default 'Ponte Nova, MG',
  endereco              text not null default 'Ponte Nova, MG',
  bio                   text not null default 'Arte exclusiva na pele, com biossegurança e cuidado em cada traço.',
  whatsapp              text not null default '5531991850139',
  instagram             text default 'mersao.tattoo',
  foto_perfil_url       text,
  video_hero_url        text,
  video_hero_poster_url text,
  secoes_visiveis       jsonb not null default
    '{"portfolio":true,"videos":true,"studio":true,"promos":true,"orcamento":true,"reel":true,"depoimentos":true}'::jsonb,
  atualizado_em         timestamptz not null default now()
);
insert into public.configuracoes_perfil (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 3) PORTFÓLIO (fotos)
-- ---------------------------------------------------------------------
create table if not exists public.portfolio (
  id           uuid primary key default gen_random_uuid(),
  titulo       text,
  estilo       text,
  imagem_url   text not null,
  storage_path text,
  ordem        int  not null default 0,
  criado_em    timestamptz not null default now()
);
create index if not exists portfolio_ordem_idx on public.portfolio (ordem);

-- ---------------------------------------------------------------------
-- CATEGORIAS DO PORTFÓLIO (organizam as fotos e viram filtros no site)
-- ---------------------------------------------------------------------
create table if not exists public.categorias (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null check (char_length(btrim(nome)) between 1 and 40),
  ordem     int  not null default 0,
  criado_em timestamptz not null default now()
);
create unique index if not exists categorias_nome_uq  on public.categorias (lower(nome));
create index        if not exists categorias_ordem_idx on public.categorias (ordem);

alter table public.categorias enable row level security;

drop policy if exists "leitura publica" on public.categorias;
create policy "leitura publica" on public.categorias
  for select to anon, authenticated using (true);

drop policy if exists "admin escreve" on public.categorias;
create policy "admin escreve" on public.categorias
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- cada foto pode ter 1 categoria (se a categoria for excluída, a foto fica "sem categoria")
alter table public.portfolio
  add column if not exists categoria_id uuid references public.categorias(id) on delete set null;
create index if not exists portfolio_categoria_idx on public.portfolio (categoria_id);

-- ---------------------------------------------------------------------
-- 4) PROMOÇÕES (flashes)
-- ---------------------------------------------------------------------
create table if not exists public.promocoes (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  preco_antigo numeric(10,2),
  preco_novo   numeric(10,2) not null,
  imagem_url   text,
  storage_path text,
  ordem        int  not null default 0,
  criado_em    timestamptz not null default now()
);
create index if not exists promocoes_ordem_idx on public.promocoes (ordem);

-- ---------------------------------------------------------------------
-- 5) VÍDEOS (mão na massa)
-- ---------------------------------------------------------------------
create table if not exists public.videos (
  id           uuid primary key default gen_random_uuid(),
  titulo       text,
  video_url    text not null,
  poster_url   text,
  storage_path text,
  poster_path  text,
  ordem        int  not null default 0,
  criado_em    timestamptz not null default now()
);
create index if not exists videos_ordem_idx on public.videos (ordem);

-- ---------------------------------------------------------------------
-- 6) ORÇAMENTOS (pedidos enviados pelo formulário)
-- ---------------------------------------------------------------------
create table if not exists public.orcamentos (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null,
  telefone       text,
  local_corpo    text,
  ideia          text not null,
  tem_referencia boolean not null default false,
  status         text not null default 'novo' check (status in ('novo','atendido')),
  criado_em      timestamptz not null default now()
);
alter table public.orcamentos
  add column if not exists referencia_urls text[] not null default '{}';

-- =====================================================================
--  SEGURANÇA (RLS)
--  Visitantes: só LEEM o conteúdo público e ENVIAM orçamento.
--  Admin: faz tudo.
-- =====================================================================
alter table public.configuracoes_perfil enable row level security;
alter table public.portfolio            enable row level security;
alter table public.promocoes            enable row level security;
alter table public.videos               enable row level security;
alter table public.orcamentos           enable row level security;

-- Leitura pública
do $$
declare t text;
begin
  foreach t in array array['configuracoes_perfil','portfolio','promocoes','videos']
  loop
    execute format('drop policy if exists "leitura publica" on public.%I', t);
    execute format('create policy "leitura publica" on public.%I for select to anon, authenticated using (true)', t);

    execute format('drop policy if exists "admin escreve" on public.%I', t);
    execute format('create policy "admin escreve" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Orçamentos: qualquer visitante envia (com limites de tamanho); só admin lê/edita/apaga
drop policy if exists "visitante envia orcamento" on public.orcamentos;
create policy "visitante envia orcamento" on public.orcamentos
  for insert to anon, authenticated
  with check (
    char_length(nome)  between 2 and 80
    and char_length(ideia) between 5 and 2000
    and char_length(coalesce(telefone, ''))    <= 40
    and char_length(coalesce(local_corpo, '')) <= 120
    and coalesce(cardinality(referencia_urls), 0) <= 3
    and status = 'novo'
  );

drop policy if exists "admin gerencia orcamentos" on public.orcamentos;
create policy "admin gerencia orcamentos" on public.orcamentos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
--  STORAGE  (bucket público "midia": fotos e vídeos)
--  Limite de 50 MB por arquivo (máximo do plano gratuito).
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'midia', 'midia', true, 52428800,
  array['image/jpeg','image/png','image/webp','image/avif',
        'video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "midia leitura publica" on storage.objects;
create policy "midia leitura publica" on storage.objects
  for select to anon, authenticated using (bucket_id = 'midia');

drop policy if exists "midia admin envia" on storage.objects;
create policy "midia admin envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'midia' and public.is_admin());

drop policy if exists "midia admin altera" on storage.objects;
create policy "midia admin altera" on storage.objects
  for update to authenticated using (bucket_id = 'midia' and public.is_admin());

drop policy if exists "midia admin apaga" on storage.objects;
create policy "midia admin apaga" on storage.objects
  for delete to authenticated using (bucket_id = 'midia' and public.is_admin());

-- ---------------------------------------------------------------------
-- STORAGE: bucket "referencias" (fotos que o cliente anexa no orçamento)
--   * visitantes só podem ENVIAR (nunca listar nem apagar)
--   * limite de 5 MB por arquivo e só imagens
--   * os links são aleatórios e só chegam a você pela mensagem/painel
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'referencias', 'referencias', true, 5242880,
  array['image/jpeg','image/png','image/webp','image/avif','image/heic','image/heif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "referencias visitante envia" on storage.objects;
create policy "referencias visitante envia" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'referencias');

drop policy if exists "referencias admin le" on storage.objects;
create policy "referencias admin le" on storage.objects
  for select to authenticated using (bucket_id = 'referencias' and public.is_admin());

drop policy if exists "referencias admin apaga" on storage.objects;
create policy "referencias admin apaga" on storage.objects
  for delete to authenticated using (bucket_id = 'referencias' and public.is_admin());

-- =====================================================================
--  PASSO FINAL — TORNAR VOCÊ ADMIN
--  1) Crie o usuário em: Authentication > Users > Add user
--       E-mail: o mesmo valor de ADMIN_EMAIL do seu .env
--       Senha:  digite a sua senha ali (NUNCA coloque senha neste arquivo)
--       Marque "Auto Confirm User"
--  2) Troque o e-mail abaixo pelo MESMO e-mail e rode só este trecho:
-- =====================================================================
insert into public.admins (user_id)
select id from auth.users where email = 'admin@mersaotattoo.com'
on conflict do nothing;

-- Conferir (deve retornar 1 linha):
-- select a.user_id, u.email from public.admins a join auth.users u on u.id = a.user_id;
