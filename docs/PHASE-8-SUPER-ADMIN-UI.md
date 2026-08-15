# NOVA Phase 8 — Purple UI + Super Admin

1. Run `infra/supabase/008_super_admin.sql` after migrations 001–007.
2. Ensure `SUPABASE_SERVICE_ROLE_KEY` exists in Vercel as a server-only environment variable.
3. The platform owner email is `belal.ecom1@gmail.com` and is automatically assigned `super_admin` when that Auth user exists or is created.
4. Passwords are intentionally never stored in SQL/source. Create/sign up the Auth account using the desired password through Supabase Auth / NOVA signup.
5. `/admin` is available only to the `super_admin` role and displays global users, workspaces, projects, stores and platform totals.
