-- NOVA 1.2 Search Reliability + Taxonomy V4
create table if not exists public.discovery_search_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  project_id uuid references public.projects(id) on delete cascade,
  results jsonb not null default '[]'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists discovery_search_cache_project_idx on public.discovery_search_cache(project_id);
create index if not exists discovery_search_cache_expiry_idx on public.discovery_search_cache(expires_at);
alter table public.discovery_search_cache enable row level security;
drop policy if exists "project members can read discovery cache" on public.discovery_search_cache;
create policy "project members can read discovery cache" on public.discovery_search_cache for select using (
  public.can_access_project(project_id) or public.is_super_admin()
);
drop policy if exists "project members can write discovery cache" on public.discovery_search_cache;
create policy "project members can write discovery cache" on public.discovery_search_cache for all using (
  public.can_access_project(project_id) or public.is_super_admin()
) with check (
  public.can_access_project(project_id) or public.is_super_admin()
);
