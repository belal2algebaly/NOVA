-- NOVA 1.1 — Intelligence, product snapshots, notifications, share links and opportunity v2
alter table public.opportunities add column if not exists effort text not null default 'Medium';
alter table public.opportunities add column if not exists opportunity_type text not null default 'CRO';
alter table public.opportunities add column if not exists source text not null default 'benchmark';
alter table public.opportunities add column if not exists decision_score integer;

create table if not exists public.product_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  competitor_id uuid references public.competitors(id) on delete cascade,
  store_url text not null,
  currency text,
  price_min numeric,
  price_median numeric,
  price_max numeric,
  category_count integer not null default 0,
  product_signal_count integer not null default 0,
  categories jsonb not null default '[]'::jsonb,
  product_samples jsonb not null default '[]'::jsonb,
  captured_at timestamptz not null default now()
);
create index if not exists idx_product_snapshots_project on public.product_snapshots(project_id,captured_at desc);
alter table public.product_snapshots enable row level security;
create policy "product_snapshots_select" on public.product_snapshots for select using(public.can_access_project(project_id));
create policy "product_snapshots_insert" on public.product_snapshots for insert with check(public.can_access_project(project_id));

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null default 'info',
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_project on public.notifications(project_id,created_at desc);
alter table public.notifications enable row level security;
create policy "notifications_select" on public.notifications for select using(public.can_access_project(project_id));
create policy "notifications_update" on public.notifications for update using(public.can_access_project(project_id)) with check(public.can_access_project(project_id));

create table if not exists public.report_shares (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  token text not null unique,
  enabled boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);
create index if not exists idx_report_shares_project on public.report_shares(project_id,created_at desc);
alter table public.report_shares enable row level security;
create policy "report_shares_select" on public.report_shares for select using(public.can_access_project(project_id));
create policy "report_shares_insert" on public.report_shares for insert with check(public.can_access_project(project_id));
create policy "report_shares_update" on public.report_shares for update using(public.can_access_project(project_id)) with check(public.can_access_project(project_id));

alter table public.projects add column if not exists onboarding_state jsonb not null default '{}'::jsonb;
