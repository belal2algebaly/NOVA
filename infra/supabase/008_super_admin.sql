-- NOVA Phase 8: platform-level super admin access.
-- Run after 007_phase7_monitoring_reports.sql.

create table if not exists public.system_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('super_admin','admin')),
  created_at timestamptz not null default now()
);

alter table public.system_roles enable row level security;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from public.system_roles sr
    where sr.user_id = auth.uid() and sr.role = 'super_admin'
  );
$$;

-- Existing account backfill, if it already exists.
insert into public.system_roles(user_id, role)
select id, 'super_admin'
from auth.users
where lower(email) = 'belal.ecom1@gmail.com'
on conflict (user_id) do update set role = excluded.role;

-- Future-safe: if the account is created after this migration, grant the role automatically.
create or replace function public.handle_nova_system_role()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  if lower(coalesce(new.email,'')) = 'belal.ecom1@gmail.com' then
    insert into public.system_roles(user_id, role)
    values (new.id, 'super_admin')
    on conflict (user_id) do update set role = excluded.role;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_system_role_nova on auth.users;
create trigger on_auth_user_system_role_nova
after insert or update of email on auth.users
for each row execute procedure public.handle_nova_system_role();

-- Let the super admin traverse all tenants using the same RLS-aware app queries.
create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path=public
as $$
  select public.is_super_admin() or exists(
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace and wm.user_id = auth.uid()
  );
$$;

create or replace function public.can_access_project(target_project uuid)
returns boolean language sql stable security definer set search_path=public
as $$
  select public.is_super_admin() or exists(
    select 1 from public.projects p
    join public.workspace_members wm on wm.workspace_id=p.workspace_id
    where p.id=target_project and wm.user_id=auth.uid()
  );
$$;

create policy "system_roles_self_read" on public.system_roles
for select using (user_id=auth.uid() or public.is_super_admin());
