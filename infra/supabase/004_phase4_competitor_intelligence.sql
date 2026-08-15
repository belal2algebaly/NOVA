-- NOVA Phase 4: store understanding + competitor intelligence.
alter table public.stores add column if not exists profile jsonb not null default '{}'::jsonb;
alter table public.stores add column if not exists profile_updated_at timestamptz;
alter table public.competitors add column if not exists normalized_url text;
alter table public.competitors add column if not exists profile jsonb not null default '{}'::jsonb;
alter table public.competitors add column if not exists source text not null default 'manual';
alter table public.competitors add column if not exists evidence jsonb not null default '[]'::jsonb;
alter table public.competitors add column if not exists validated_at timestamptz;
alter table public.competitors add column if not exists status text not null default 'candidate';
create unique index if not exists idx_competitors_project_url on public.competitors(project_id, normalized_url);
create index if not exists idx_competitors_match on public.competitors(project_id, match_score desc);

create policy "competitors_insert" on public.competitors for insert with check (public.can_access_project(project_id));
create policy "competitors_update" on public.competitors for update using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "competitors_delete" on public.competitors for delete using (public.can_access_project(project_id));
