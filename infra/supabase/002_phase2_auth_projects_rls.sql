-- NOVA Phase 2: account bootstrap + tenant-safe project persistence.
-- Run after 001_initial_schema.sql in the Supabase SQL editor or migration runner.

alter table public.workspaces
  add constraint workspaces_owner_fk foreign key (owner_id) references auth.users(id) on delete cascade;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id,user_id)
);

create or replace function public.handle_new_nova_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_workspace_id uuid;
begin
  insert into public.profiles(id, full_name)
  values (new.id, nullif(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;

  insert into public.workspaces(name, owner_id)
  values (coalesce(nullif(new.raw_user_meta_data->>'full_name',''), split_part(new.email,'@',1)) || '''s Workspace', new.id)
  returning id into new_workspace_id;

  insert into public.workspace_members(workspace_id,user_id,role)
  values (new_workspace_id,new.id,'owner');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_nova on auth.users;
create trigger on_auth_user_created_nova
after insert on auth.users
for each row execute procedure public.handle_new_nova_user();

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path=public
as $$
  select exists(
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace and wm.user_id = auth.uid()
  );
$$;

create or replace function public.can_access_project(target_project uuid)
returns boolean language sql stable security definer set search_path=public
as $$
  select exists(
    select 1 from public.projects p
    join public.workspace_members wm on wm.workspace_id=p.workspace_id
    where p.id=target_project and wm.user_id=auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.stores enable row level security;
alter table public.audit_runs enable row level security;
alter table public.competitors enable row level security;
alter table public.opportunities enable row level security;

create policy "profiles_self_read" on public.profiles for select using (id=auth.uid());
create policy "profiles_self_update" on public.profiles for update using (id=auth.uid()) with check (id=auth.uid());

create policy "workspaces_member_read" on public.workspaces for select using (public.is_workspace_member(id));
create policy "workspaces_owner_update" on public.workspaces for update using (owner_id=auth.uid()) with check (owner_id=auth.uid());

create policy "workspace_members_member_read" on public.workspace_members for select using (public.is_workspace_member(workspace_id));

create policy "projects_member_all_select" on public.projects for select using (public.is_workspace_member(workspace_id));
create policy "projects_member_insert" on public.projects for insert with check (public.is_workspace_member(workspace_id));
create policy "projects_member_update" on public.projects for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "projects_member_delete" on public.projects for delete using (public.is_workspace_member(workspace_id));

create policy "stores_project_read" on public.stores for select using (public.can_access_project(project_id));
create policy "stores_project_insert" on public.stores for insert with check (public.can_access_project(project_id));
create policy "stores_project_update" on public.stores for update using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "stores_project_delete" on public.stores for delete using (public.can_access_project(project_id));

create policy "audits_store_read" on public.audit_runs for select using (
 exists(select 1 from public.stores s where s.id=store_id and public.can_access_project(s.project_id))
);
create policy "audits_store_insert" on public.audit_runs for insert with check (
 exists(select 1 from public.stores s where s.id=store_id and public.can_access_project(s.project_id))
);

create policy "competitors_project_read" on public.competitors for select using (public.can_access_project(project_id));
create policy "competitors_project_insert" on public.competitors for insert with check (public.can_access_project(project_id));
create policy "competitors_project_update" on public.competitors for update using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "competitors_project_delete" on public.competitors for delete using (public.can_access_project(project_id));

create policy "opportunities_project_read" on public.opportunities for select using (public.can_access_project(project_id));
create policy "opportunities_project_insert" on public.opportunities for insert with check (public.can_access_project(project_id));
create policy "opportunities_project_update" on public.opportunities for update using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "opportunities_project_delete" on public.opportunities for delete using (public.can_access_project(project_id));
