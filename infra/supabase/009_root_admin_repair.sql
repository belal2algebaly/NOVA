-- NOVA root admin repair / hardening
-- Safe to run after 008_super_admin.sql

insert into public.system_roles(user_id, role)
select id, 'super_admin'
from auth.users
where lower(email) = 'belal.ecom1@gmail.com'
on conflict (user_id) do update set role = 'super_admin';

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1
    from auth.users u
    where u.id=auth.uid()
      and lower(coalesce(u.email,''))='belal.ecom1@gmail.com'
  ) or exists(
    select 1 from public.system_roles sr
    where sr.user_id = auth.uid() and sr.role = 'super_admin'
  );
$$;
