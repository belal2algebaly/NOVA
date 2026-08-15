-- NOVA 1.6 — AI Operating System, project chat and evidence-grounded buyer persona
create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  provider text,
  confidence integer,
  evidence jsonb not null default '[]'::jsonb,
  page_context text,
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_chat_messages_project on public.ai_chat_messages(project_id,created_at desc);
alter table public.ai_chat_messages enable row level security;
drop policy if exists "ai_chat_select" on public.ai_chat_messages;
create policy "ai_chat_select" on public.ai_chat_messages for select using(public.can_access_project(project_id));
drop policy if exists "ai_chat_insert" on public.ai_chat_messages;
create policy "ai_chat_insert" on public.ai_chat_messages for insert with check(public.can_access_project(project_id));
drop policy if exists "ai_chat_delete" on public.ai_chat_messages;
create policy "ai_chat_delete" on public.ai_chat_messages for delete using(public.can_access_project(project_id));

create table if not exists public.persona_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  status text not null default 'ready',
  source_summary jsonb not null default '{}'::jsonb,
  report jsonb not null default '{}'::jsonb,
  provider text,
  confidence integer,
  created_at timestamptz not null default now()
);
create index if not exists idx_persona_reports_project on public.persona_reports(project_id,created_at desc);
alter table public.persona_reports enable row level security;
drop policy if exists "persona_reports_select" on public.persona_reports;
create policy "persona_reports_select" on public.persona_reports for select using(public.can_access_project(project_id));
drop policy if exists "persona_reports_insert" on public.persona_reports;
create policy "persona_reports_insert" on public.persona_reports for insert with check(public.can_access_project(project_id));
drop policy if exists "persona_reports_delete" on public.persona_reports;
create policy "persona_reports_delete" on public.persona_reports for delete using(public.can_access_project(project_id));
