-- NOVA Phase 6: extension pairing + production ingestion.
alter table public.projects add column if not exists extension_key uuid not null default gen_random_uuid();
create unique index if not exists idx_projects_extension_key on public.projects(extension_key);
