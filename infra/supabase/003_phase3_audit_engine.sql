-- NOVA Phase 3: audit execution lifecycle and evidence query support.
alter table public.audit_runs add column if not exists error text;
alter table public.audit_runs add column if not exists completed_at timestamptz;
create index if not exists idx_audits_status on public.audit_runs(status);
create policy "audits_store_update" on public.audit_runs for update using (
 exists(select 1 from public.stores s where s.id=store_id and public.can_access_project(s.project_id))
) with check (
 exists(select 1 from public.stores s where s.id=store_id and public.can_access_project(s.project_id))
);
