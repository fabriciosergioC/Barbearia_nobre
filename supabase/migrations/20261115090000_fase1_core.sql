-- ============================================================================
-- Nobre · Fase 1 — Fundação
-- Establishments, profiles, RBAC, auditoria e helpers de isolamento.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tipos
-- ----------------------------------------------------------------------------
do $$
begin
  create type public.app_role as enum ('admin', 'gerente', 'recepcionista', 'barbeiro');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.member_status as enum ('ativo', 'inativo');
exception
  when duplicate_object then null;
end
$$;

-- ----------------------------------------------------------------------------
-- updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Estabelecimentos
-- ----------------------------------------------------------------------------
create table if not exists public.establishments (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 60),
  phone text,
  email text,
  document text,
  address jsonb not null default '{}'::jsonb,
  timezone text not null default 'America/Sao_Paulo',
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger establishments_set_updated_at
before update on public.establishments
for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Perfis (1 usuário = 1 estabelecimento nesta versão)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  establishment_id uuid not null references public.establishments (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 3 and 120),
  email text not null,
  phone text,
  avatar_url text,
  role public.app_role not null default 'barbeiro',
  status public.member_status not null default 'ativo',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_establishment_idx on public.profiles (establishment_id);
create index if not exists profiles_role_idx on public.profiles (establishment_id, role);
create unique index if not exists profiles_establishment_email_key on public.profiles (establishment_id, lower(email));

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Permissões granulares por perfil
-- ----------------------------------------------------------------------------
create table if not exists public.permissions (
  code text primary key,
  module text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role public.app_role not null,
  permission_code text not null references public.permissions (code) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role, permission_code)
);

create index if not exists role_permissions_role_idx on public.role_permissions (role);

-- ----------------------------------------------------------------------------
-- Auditoria
-- ----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  establishment_id uuid references public.establishments (id) on delete set null,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_establishment_created_idx
  on public.audit_logs (establishment_id, created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);

-- ----------------------------------------------------------------------------
-- Helpers de contexto (SECURITY DEFINER evita recursão de RLS)
-- ----------------------------------------------------------------------------
create or replace function public.current_establishment_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select establishment_id
  from public.profiles
  where id = auth.uid() and status = 'ativo';
$$;

create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'ativo'
  );
$$;

create or replace function public.has_permission(p_permission text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.status = 'ativo'
      and (
        p.role = 'admin'
        or exists (
          select 1 from public.role_permissions rp
          where rp.role = p.role and rp.permission_code = p_permission
        )
      )
  );
$$;

create or replace function public.my_context()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'profile', to_jsonb(p),
    'establishment', to_jsonb(e),
    'permissions', case
      when p.status <> 'ativo' then '[]'::jsonb
      else coalesce(
        (select jsonb_agg(rp.permission_code order by rp.permission_code)
         from public.role_permissions rp
         where rp.role = p.role),
        '[]'::jsonb
      )
    end
  )
  from public.profiles p
  join public.establishments e on e.id = p.establishment_id
  where p.id = auth.uid();
$$;

-- ----------------------------------------------------------------------------
-- Bootstrap: cria estabelecimento + primeiro administrador
-- ----------------------------------------------------------------------------
create or replace function public.bootstrap_establishment(
  p_establishment_name text,
  p_slug text,
  p_full_name text,
  p_phone text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_name text := btrim(coalesce(p_establishment_name, ''));
  v_slug text := lower(btrim(coalesce(p_slug, '')));
  v_full_name text := btrim(coalesce(p_full_name, ''));
  v_establishment_id uuid;
begin
  if v_user_id is null then
    raise exception 'Sessão inválida. Entre novamente.' using errcode = '42501';
  end if;

  if exists (select 1 from public.profiles where id = v_user_id) then
    raise exception 'Este usuário já possui um estabelecimento.' using errcode = 'P0001';
  end if;

  if char_length(v_name) < 2 then
    raise exception 'Informe o nome da barbearia.' using errcode = '22023';
  end if;

  if v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(v_slug) < 3 then
    raise exception 'Identificador inválido. Use letras minúsculas, números e hífen.' using errcode = '22023';
  end if;

  if char_length(v_full_name) < 3 then
    raise exception 'Informe seu nome completo.' using errcode = '22023';
  end if;

  if exists (select 1 from public.establishments where slug = v_slug) then
    raise exception 'Este identificador de estabelecimento já está em uso.' using errcode = '23505';
  end if;

  select email into v_email from auth.users where id = v_user_id;

  insert into public.establishments (name, slug, phone)
  values (v_name, v_slug, nullif(btrim(coalesce(p_phone, '')), ''))
  returning id into v_establishment_id;

  insert into public.profiles (id, establishment_id, full_name, email, phone, role, status)
  values (
    v_user_id,
    v_establishment_id,
    v_full_name,
    coalesce(v_email, ''),
    nullif(btrim(coalesce(p_phone, '')), ''),
    'admin',
    'ativo'
  );

  insert into public.audit_logs (establishment_id, actor_id, action, entity, entity_id, after, metadata)
  values (
    v_establishment_id,
    v_user_id,
    'establishment.created',
    'establishments',
    v_establishment_id::text,
    jsonb_build_object('name', v_name, 'slug', v_slug),
    jsonb_build_object('source', 'bootstrap_establishment')
  );

  return public.my_context();
end;
$$;

-- ----------------------------------------------------------------------------
-- Guardas de integridade do perfil
-- ----------------------------------------------------------------------------
create or replace function public.enforce_profile_guard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor uuid := auth.uid();
  v_is_service boolean := coalesce(auth.role(), '') = 'service_role';
  v_remaining_admins integer;
begin
  if v_is_service then
    return new;
  end if;

  if v_actor is null then
    raise exception 'Sessão inválida.' using errcode = '42501';
  end if;

  if new.id <> old.id
     or new.establishment_id <> old.establishment_id
     or new.email <> old.email
     or new.created_at <> old.created_at then
    raise exception 'Campos de identificação do perfil não podem ser alterados.' using errcode = '42501';
  end if;

  if new.id <> v_actor and not public.has_permission('users.manage') then
    raise exception 'Sem permissão para alterar outros usuários.' using errcode = '42501';
  end if;

  if new.role <> old.role or new.status <> old.status then
    if not public.has_permission('users.manage') then
      raise exception 'Sem permissão para alterar perfil ou status.' using errcode = '42501';
    end if;

    if new.id = v_actor and new.status = 'inativo' then
      raise exception 'Você não pode desativar o próprio acesso.' using errcode = '42501';
    end if;

    if old.role = 'admin' and (new.role <> 'admin' or new.status <> 'ativo') then
      select count(*) into v_remaining_admins
      from public.profiles
      where establishment_id = old.establishment_id
        and id <> old.id
        and role = 'admin'
        and status = 'ativo';

      if v_remaining_admins = 0 then
        raise exception 'O estabelecimento precisa de ao menos um administrador ativo.' using errcode = '42501';
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_guard
before update on public.profiles
for each row execute function public.enforce_profile_guard();

-- ----------------------------------------------------------------------------
-- Auditoria automática
-- ----------------------------------------------------------------------------
create or replace function public.audit_profile_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_establishment uuid;
  v_entity_id text;
begin
  if tg_op = 'DELETE' then
    v_establishment := old.establishment_id;
    v_entity_id := old.id::text;
  else
    v_establishment := new.establishment_id;
    v_entity_id := new.id::text;
  end if;

  insert into public.audit_logs (establishment_id, actor_id, action, entity, entity_id, before, after)
  values (
    v_establishment,
    auth.uid(),
    case when tg_op = 'INSERT' then 'profile.created' else 'profile.updated' end,
    'profiles',
    v_entity_id,
    case when tg_op = 'UPDATE' then to_jsonb(old) - 'avatar_url' else null end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) - 'avatar_url' end
  );

  return coalesce(new, old);
end;
$$;

create trigger profiles_audit
after insert or update on public.profiles
for each row execute function public.audit_profile_change();

create or replace function public.audit_establishment_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.audit_logs (establishment_id, actor_id, action, entity, entity_id, before, after)
  values (
    new.id,
    auth.uid(),
    'establishment.updated',
    'establishments',
    new.id::text,
    to_jsonb(old),
    to_jsonb(new)
  );

  return new;
end;
$$;

create trigger establishments_audit
after update on public.establishments
for each row execute function public.audit_establishment_change();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.establishments enable row level security;
alter table public.profiles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists establishments_select on public.establishments;
create policy establishments_select on public.establishments
for select to authenticated
using (id = public.current_establishment_id());

drop policy if exists establishments_update on public.establishments;
create policy establishments_update on public.establishments
for update to authenticated
using (id = public.current_establishment_id() and public.has_permission('settings.establishment.manage'))
with check (id = public.current_establishment_id() and public.has_permission('settings.establishment.manage'));

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated
using (establishment_id = public.current_establishment_id());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
for update to authenticated
using (
  establishment_id = public.current_establishment_id()
  and (id = auth.uid() or public.has_permission('users.manage'))
)
with check (
  establishment_id = public.current_establishment_id()
  and (id = auth.uid() or public.has_permission('users.manage'))
);

drop policy if exists permissions_select on public.permissions;
create policy permissions_select on public.permissions
for select to authenticated
using (public.is_active_member());

drop policy if exists role_permissions_select on public.role_permissions;
create policy role_permissions_select on public.role_permissions
for select to authenticated
using (public.is_active_member());

drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs
for select to authenticated
using (
  establishment_id = public.current_establishment_id()
  and public.has_permission('audit.view')
);

-- ----------------------------------------------------------------------------
-- Privilégios das funções
-- ----------------------------------------------------------------------------
revoke all on function public.my_context() from public;
revoke all on function public.bootstrap_establishment(text, text, text, text) from public;
revoke all on function public.has_permission(text) from public;

grant execute on function public.my_context() to authenticated;
grant execute on function public.bootstrap_establishment(text, text, text, text) to authenticated;
grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.current_establishment_id() to authenticated;
grant execute on function public.is_active_member() to authenticated;
