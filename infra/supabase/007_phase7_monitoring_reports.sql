-- NOVA Phase 7: monitoring snapshots and detected change events.
create table if not exists public.monitor_targets (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
 competitor_id uuid references public.competitors(id) on delete cascade, url text not null, enabled boolean not null default true,
 last_checked_at timestamptz, last_fingerprint text, last_snapshot jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
 unique(project_id,url)
);
create table if not exists public.change_events (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
 monitor_target_id uuid references public.monitor_targets(id) on delete cascade, competitor_id uuid references public.competitors(id) on delete set null,
 kind text not null, summary text not null, before jsonb, after jsonb, created_at timestamptz not null default now()
);
alter table public.monitor_targets enable row level security; alter table public.change_events enable row level security;
create policy "monitor_select" on public.monitor_targets for select using(public.can_access_project(project_id));
create policy "monitor_write" on public.monitor_targets for all using(public.can_access_project(project_id)) with check(public.can_access_project(project_id));
create policy "changes_select" on public.change_events for select using(public.can_access_project(project_id));
