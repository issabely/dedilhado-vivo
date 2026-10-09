-- Dedilhado Vivo: tabelas da conta e do progresso.
-- Cole tudo no Supabase em SQL Editor → New query → Run. Pode rodar de novo sem problema.

-- Perfil de cada pessoa (1 linha por conta)
create table if not exists public.perfis (
  id            uuid primary key references auth.users (id) on delete cascade,
  nome          text,
  foto          text,
  instrumentos  text[] not null default '{}',
  nivel         text not null default 'zero',
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Progresso do app (estrelas, dias, teoria, músicas, preferências), guardado como JSON
create table if not exists public.progresso (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  dados         jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

-- Segurança: cada pessoa só enxerga e muda as próprias linhas
alter table public.perfis    enable row level security;
alter table public.progresso enable row level security;

drop policy if exists "perfil: ler o seu"     on public.perfis;
drop policy if exists "perfil: criar o seu"   on public.perfis;
drop policy if exists "perfil: mudar o seu"   on public.perfis;
drop policy if exists "perfil: apagar o seu"  on public.perfis;
create policy "perfil: ler o seu"    on public.perfis for select to authenticated using ((select auth.uid()) = id);
create policy "perfil: criar o seu"  on public.perfis for insert to authenticated with check ((select auth.uid()) = id);
create policy "perfil: mudar o seu"  on public.perfis for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "perfil: apagar o seu" on public.perfis for delete to authenticated using ((select auth.uid()) = id);

drop policy if exists "progresso: ler o seu"    on public.progresso;
drop policy if exists "progresso: criar o seu"  on public.progresso;
drop policy if exists "progresso: mudar o seu"  on public.progresso;
drop policy if exists "progresso: apagar o seu" on public.progresso;
create policy "progresso: ler o seu"    on public.progresso for select to authenticated using ((select auth.uid()) = user_id);
create policy "progresso: criar o seu"  on public.progresso for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "progresso: mudar o seu"  on public.progresso for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "progresso: apagar o seu" on public.progresso for delete to authenticated using ((select auth.uid()) = user_id);

-- Limite de tamanho do progresso (evita abuso): 1 MB
alter table public.progresso drop constraint if exists progresso_tamanho;
alter table public.progresso add constraint progresso_tamanho check (pg_column_size(dados) < 1000000);

-- Exclusão total da conta (LGPD): a própria pessoa apaga o cadastro de login.
-- perfis e progresso somem junto (on delete cascade).
create or replace function public.apagar_minha_conta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'não autenticado';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.apagar_minha_conta() from public, anon;
grant execute on function public.apagar_minha_conta() to authenticated;

-- ===== Estatísticas anônimas de uso (só números, sem saber quem) =====
-- Cada linha = um tipo de ação num dia, com o total. Nenhum dado pessoal, IP ou ID.
create table if not exists public.uso_diario (
  dia    date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  evento text not null check (evento ~ '^[a-z0-9_:-]{1,40}$'),
  total  bigint not null default 0,
  primary key (dia, evento)
);
alter table public.uso_diario enable row level security;
-- ninguém lê nem escreve direto pela internet; só a função abaixo soma
revoke all on table public.uso_diario from public, anon, authenticated;

create or replace function public.contar_evento(eventos text[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare e text;
begin
  if eventos is null or array_length(eventos, 1) is null or array_length(eventos, 1) > 20 then return; end if;
  foreach e in array eventos loop
    -- só nomes da lista conhecida contam (evita lixo e abuso)
    if e ~ '^(visita|login|conta_nova|app_instalado|microfone|exercicio|exercicio_fim|musica_importada|musica_escrita|aba:(licoes|pratica|dedilhados|afinador|teoria|editor)|inst:(flute|violin|piano|guitar)|origem:[a-z0-9_-]{1,20}|pais:[a-z]{2}|estado:[a-z0-9]{1,3}|cidade:[a-z0-9-]{1,32})$' then
      insert into public.uso_diario as u (dia, evento, total)
      values ((now() at time zone 'America/Sao_Paulo')::date, e, 1)
      on conflict (dia, evento) do update set total = u.total + 1;
    end if;
  end loop;
end;
$$;
revoke all on function public.contar_evento(text[]) from public;
grant execute on function public.contar_evento(text[]) to anon, authenticated;

-- Resumos para você ver no Table Editor / SQL Editor (não ficam abertos na internet)
create or replace view public.uso_ultimos_30_dias with (security_invoker = true) as
  select evento, sum(total) as total from public.uso_diario
  where dia >= ((now() at time zone 'America/Sao_Paulo')::date - 29)
  group by evento order by total desc;
create or replace view public.uso_por_dia with (security_invoker = true) as
  select dia,
    sum(total) filter (where evento = 'visita') as visitas,
    sum(total) filter (where evento = 'microfone') as usaram_microfone,
    sum(total) filter (where evento = 'exercicio') as exercicios,
    sum(total) filter (where evento = 'login') as logins,
    sum(total) filter (where evento = 'conta_nova') as contas_novas
  from public.uso_diario group by dia order by dia desc;
revoke all on public.uso_ultimos_30_dias, public.uso_por_dia from public, anon, authenticated;

-- Público por região (país, estado e cidade aproximados, últimos 30 dias)
create or replace view public.uso_regioes with (security_invoker = true) as
  select split_part(evento, ':', 1) as tipo, split_part(evento, ':', 2) as lugar, sum(total) as visitas
  from public.uso_diario
  where dia >= ((now() at time zone 'America/Sao_Paulo')::date - 29) and (evento like 'pais:%' or evento like 'estado:%' or evento like 'cidade:%')
  group by 1, 2 order by 1 desc, 3 desc;
revoke all on public.uso_regioes from public, anon, authenticated;
