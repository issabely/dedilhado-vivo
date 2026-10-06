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

-- Limites de tamanho no perfil (defesa extra além do app)
alter table public.perfis drop constraint if exists perfis_limites;
alter table public.perfis add constraint perfis_limites check (
  coalesce(length(nome),0) <= 100
  and coalesce(length(foto),0) <= 1000
  and cardinality(instrumentos) <= 5
  and nivel in ('zero','pouco','medio','avancado')
);

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
