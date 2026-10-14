-- =====================================================================
--  MERSÃO TATTOO — MIGRAÇÃO v2  (rode UMA vez no SQL Editor do Supabase)
--
--  O que faz:
--    1) cria as CATEGORIAS do portfólio e converte o "estilo" das fotos atuais;
--    2) cria o armazenamento das FOTOS DE REFERÊNCIA do orçamento;
--    3) deixa o Instagram @mersao.tattoo e o WhatsApp 5531991850139 no perfil.
--
--  É segura: não apaga nada e pode ser rodada de novo sem quebrar.
--  Se aparecer alguma mensagem de erro, não continue: copie a mensagem inteira
--  e peça ajuda antes de publicar o código novo.
--  IMPORTANTE: rode ANTES de publicar o código novo no GitHub/Netlify.
-- =====================================================================

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
-- ORÇAMENTOS: links das fotos de referência enviadas pelo cliente
-- ---------------------------------------------------------------------
alter table public.orcamentos
  add column if not exists referencia_urls text[] not null default '{}';

-- Visitantes só ENVIAM (com limites de tamanho); só o admin lê/edita/apaga.
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

-- ---------------------------------------------------------------------
-- AJUSTE DOS DADOS QUE JÁ EXISTEM
-- ---------------------------------------------------------------------

-- 1) Transforma o texto livre "estilo" das fotos em categorias (sem perder nada)
insert into public.categorias (nome, ordem)
select s.nome,
       (select coalesce(max(ordem), -1) from public.categorias) + row_number() over (order by lower(s.nome))
from (
  select distinct on (lower(left(btrim(estilo), 40))) left(btrim(estilo), 40) as nome
  from public.portfolio
  where estilo is not null and btrim(estilo) <> ''
  order by lower(left(btrim(estilo), 40)), left(btrim(estilo), 40)
) s
on conflict do nothing;

update public.portfolio p
   set categoria_id = c.id
  from public.categorias c
 where p.categoria_id is null
   and p.estilo is not null
   and lower(left(btrim(p.estilo), 40)) = lower(c.nome);

-- 2) Instagram do estúdio: passa a ser @mersao.tattoo por padrão
alter table public.configuracoes_perfil alter column instagram set default 'mersao.tattoo';
update public.configuracoes_perfil
   set instagram = 'mersao.tattoo'
 where id = 1 and (instagram is null or btrim(instagram) = '');

-- 3) WhatsApp do estúdio (o orçamento do site abre a conversa neste número).
--    Se um dia quiser outro número, troque pelo painel (aba Perfil) e apague esta linha.
update public.configuracoes_perfil
   set whatsapp = '5531991850139'
 where id = 1;

-- =====================================================================
--  CONFERÊNCIA (deve retornar 3 linhas: categorias, referencias e a coluna nova)
-- =====================================================================
select 'tabela categorias'      as item, to_regclass('public.categorias')::text as resultado
union all
select 'bucket referencias',      (select id::text from storage.buckets where id = 'referencias')
union all
select 'coluna referencia_urls',  (select column_name::text from information_schema.columns
                                    where table_schema='public' and table_name='orcamentos' and column_name='referencia_urls');
