-- =====================================================================
--  MERSÃO TATTOO — MIGRAÇÃO v4  (rode UMA vez no SQL Editor do Supabase)
--
--  Pré-requisito: as migrações v2 e v3 já foram rodadas.
--
--  O que faz (tudo SÓ ACRESCENTA; nada é apagado ou alterado):
--    1) tabela "visitas": 1 linha por visitante por dia (sem dados pessoais);
--    2) função "registrar_visita": o site chama quando alguém abre a página;
--    3) função "metricas_visitas": só o ADMIN consegue chamar (alimenta a aba Métricas);
--    4) proteção anti-spam no formulário de orçamento.
--
--  Pode ser rodada de novo sem quebrar.
--  Se aparecer alguma mensagem de erro, não continue: copie a mensagem inteira
--  e peça ajuda antes de publicar o código novo.
--  IMPORTANTE: rode ANTES de publicar o código novo no GitHub/Netlify.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) TABELA DE VISITAS
--    "visitante" = código aleatório gerado no navegador (não identifica ninguém).
--    O dia é sempre o dia de BRASÍLIA.
-- ---------------------------------------------------------------------
create table if not exists public.visitas (
  id           bigint generated always as identity primary key,
  visitante    uuid        not null,
  dia          date        not null,
  acessos      int         not null default 1,
  origem       text        not null default 'direto',
  dispositivo  text        not null default 'outro',
  criado_em    timestamptz not null default now(),
  constraint visitas_visitante_dia_uq unique (visitante, dia)
);
create index if not exists visitas_dia_idx on public.visitas (dia);

-- RLS ligada e SEM nenhuma política: ninguém lê nem escreve direto na tabela.
-- O acesso acontece só pelas duas funções abaixo.
alter table public.visitas enable row level security;

-- ---------------------------------------------------------------------
-- 2) REGISTRAR VISITA  (chamada pelo site, por qualquer visitante)
--    - ignora quando quem abre é o administrador logado;
--    - só aceita valores conhecidos para origem e aparelho;
--    - no máximo 1 linha por visitante por dia (os "acessos" do dia somam, até 50).
-- ---------------------------------------------------------------------
create or replace function public.registrar_visita(
  p_visitante   uuid,
  p_origem      text default 'direto',
  p_dispositivo text default 'outro'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_origem text;
  v_disp   text;
  v_dia    date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if p_visitante is null then return; end if;
  if public.is_admin() then return; end if;

  v_origem := lower(coalesce(p_origem, 'direto'));
  if v_origem not in ('direto','instagram','whatsapp','google','facebook','tiktok','outro') then
    v_origem := 'outro';
  end if;

  v_disp := lower(coalesce(p_dispositivo, 'outro'));
  if v_disp not in ('celular','computador','tablet','outro') then
    v_disp := 'outro';
  end if;

  insert into public.visitas (visitante, dia, origem, dispositivo)
  values (p_visitante, v_dia, v_origem, v_disp)
  on conflict (visitante, dia)
  do update set acessos = least(public.visitas.acessos + 1, 50);
end;
$$;

revoke all on function public.registrar_visita(uuid, text, text) from public;
grant execute on function public.registrar_visita(uuid, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 3) MÉTRICAS  (SÓ ADMIN)
--    Recebe a data inicial e final (inclusive, dia de Brasília) e devolve:
--      unicos  = pessoas diferentes que acessaram o site no período
--      acessos = total de vezes que o site foi aberto
--      por_dia, por_origem, por_dispositivo
-- ---------------------------------------------------------------------
create or replace function public.metricas_visitas(p_inicio date, p_fim date)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  resultado jsonb;
begin
  if not public.is_admin() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;
  if p_inicio is null or p_fim is null or p_fim < p_inicio or (p_fim - p_inicio) > 400 then
    raise exception 'periodo invalido';
  end if;

  select jsonb_build_object(
    'unicos',  coalesce((select count(distinct visitante) from public.visitas where dia between p_inicio and p_fim), 0),
    'acessos', coalesce((select sum(acessos)              from public.visitas where dia between p_inicio and p_fim), 0),
    'por_dia', (
      select coalesce(jsonb_agg(
               jsonb_build_object('dia', d.dia, 'unicos', coalesce(v.unicos, 0), 'acessos', coalesce(v.acessos, 0))
               order by d.dia), '[]'::jsonb)
        from generate_series(0, p_fim - p_inicio) as g(i)
        cross join lateral (select (p_inicio + g.i)::date as dia) d
        left join (
          select dia, count(*) as unicos, sum(acessos) as acessos
            from public.visitas
           where dia between p_inicio and p_fim
           group by dia
        ) v on v.dia = d.dia
    ),
    'por_origem', (
      select coalesce(jsonb_agg(jsonb_build_object('nome', origem, 'total', total) order by total desc), '[]'::jsonb)
        from (
          select origem, count(distinct visitante) as total
            from public.visitas
           where dia between p_inicio and p_fim
           group by origem
        ) o
    ),
    'por_dispositivo', (
      select coalesce(jsonb_agg(jsonb_build_object('nome', dispositivo, 'total', total) order by total desc), '[]'::jsonb)
        from (
          select dispositivo, count(distinct visitante) as total
            from public.visitas
           where dia between p_inicio and p_fim
           group by dispositivo
        ) x
    )
  ) into resultado;

  return resultado;
end;
$$;

revoke all on function public.metricas_visitas(date, date) from public;
grant execute on function public.metricas_visitas(date, date) to authenticated;

-- ---------------------------------------------------------------------
-- 4) ANTI-SPAM NO ORÇAMENTO
--    - no máximo 3 pedidos por hora com o mesmo telefone;
--    - no máximo 30 pedidos por 10 minutos no site todo.
--    Se o limite estourar, o pedido não é salvo no painel, mas o cliente
--    continua sendo levado ao WhatsApp normalmente (o site já funciona assim).
-- ---------------------------------------------------------------------
create or replace function public.limita_orcamentos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.telefone is not null and btrim(new.telefone) <> '' then
    if (select count(*) from public.orcamentos
         where telefone = new.telefone and criado_em > now() - interval '1 hour') >= 3 then
      raise exception 'limite de pedidos por telefone' using errcode = 'P0001';
    end if;
  end if;

  if (select count(*) from public.orcamentos
       where criado_em > now() - interval '10 minutes') >= 30 then
    raise exception 'limite geral de pedidos' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_limita_orcamentos on public.orcamentos;
create trigger trg_limita_orcamentos
  before insert on public.orcamentos
  for each row execute function public.limita_orcamentos();

-- =====================================================================
--  CONFERÊNCIA (deve retornar 4 linhas preenchidas)
-- =====================================================================
select 'tabela visitas' as item, to_regclass('public.visitas')::text as resultado
union all
select 'função registrar_visita', (select proname::text from pg_proc where proname = 'registrar_visita' limit 1)
union all
select 'função metricas_visitas', (select proname::text from pg_proc where proname = 'metricas_visitas' limit 1)
union all
select 'trigger anti-spam', (select tgname::text from pg_trigger where tgname = 'trg_limita_orcamentos' limit 1);
