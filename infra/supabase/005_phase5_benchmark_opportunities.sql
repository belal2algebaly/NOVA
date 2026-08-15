-- NOVA Phase 5: benchmark runs and evidence-backed opportunities.
create table if not exists public.benchmarks (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  audit_run_id uuid references public.audit_runs(id) on delete set null, result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_benchmarks_project_created on public.benchmarks(project_id,created_at desc);
alter table public.benchmarks enable row level security;
create policy "benchmarks_select" on public.benchmarks for select using (public.can_access_project(project_id));
create policy "benchmarks_insert" on public.benchmarks for insert with check (public.can_access_project(project_id));
create policy "benchmarks_delete" on public.benchmarks for delete using (public.can_access_project(project_id));

alter table public.opportunities add column if not exists key text;
alter table public.opportunities add column if not exists confidence_score integer;
alter table public.opportunities add column if not exists priority integer;
alter table public.opportunities add column if not exists recommendation text;
create unique index if not exists idx_opportunity_project_key on public.opportunities(project_id,key) where key is not null;
create policy "opportunities_insert" on public.opportunities for insert with check (public.can_access_project(project_id));
create policy "opportunities_update" on public.opportunities for update using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "opportunities_delete" on public.opportunities for delete using (public.can_access_project(project_id));
