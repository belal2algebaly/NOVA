-- NOVA 2.0 — Market Research Operating System
create table if not exists public.research_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  status text not null default 'running' check (status in ('running','completed','partial','failed')),
  source text not null default 'competitor_discovery',
  research_brief jsonb not null default '{}'::jsonb,
  search_plan jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  quality_score integer,
  provider_chain jsonb not null default '[]'::jsonb,
  error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists idx_research_sessions_project on public.research_sessions(project_id, started_at desc);
alter table public.research_sessions enable row level security;
drop policy if exists "research_sessions_access" on public.research_sessions;
create policy "research_sessions_access" on public.research_sessions for all using(public.can_access_project(project_id)) with check(public.can_access_project(project_id));

create table if not exists public.research_candidates (
  id uuid primary key default gen_random_uuid(),
  research_session_id uuid not null references public.research_sessions(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  domain text not null,
  url text not null,
  title text,
  source text,
  scope text,
  discovery_score integer,
  deterministic_score integer,
  confidence integer,
  classification text,
  decision text not null default 'pending' check (decision in ('pending','accepted','rejected','needs_verification','skipped')),
  rejection_reasons jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  profile jsonb,
  ai_review jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_research_candidates_session on public.research_candidates(research_session_id, decision, discovery_score desc);
alter table public.research_candidates enable row level security;
drop policy if exists "research_candidates_access" on public.research_candidates;
create policy "research_candidates_access" on public.research_candidates for all using(public.can_access_project(project_id)) with check(public.can_access_project(project_id));

create table if not exists public.competitor_feedback (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  competitor_id uuid references public.competitors(id) on delete cascade,
  domain text not null,
  verdict text not null check (verdict in ('competitor','not_competitor','reference_only')),
  reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_competitor_feedback_project on public.competitor_feedback(project_id, created_at desc);
alter table public.competitor_feedback enable row level security;
drop policy if exists "competitor_feedback_access" on public.competitor_feedback;
create policy "competitor_feedback_access" on public.competitor_feedback for all using(public.can_access_project(project_id)) with check(public.can_access_project(project_id));

create table if not exists public.competitor_knowledge (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  domain text not null,
  normalized_url text not null,
  profile jsonb not null default '{}'::jsonb,
  fingerprint jsonb not null default '{}'::jsonb,
  confidence integer,
  validation_count integer not null default 1,
  last_verdict text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(project_id, domain)
);
create index if not exists idx_competitor_knowledge_project on public.competitor_knowledge(project_id, last_seen_at desc);
alter table public.competitor_knowledge enable row level security;
drop policy if exists "competitor_knowledge_access" on public.competitor_knowledge;
create policy "competitor_knowledge_access" on public.competitor_knowledge for all using(public.can_access_project(project_id)) with check(public.can_access_project(project_id));
