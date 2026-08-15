# Vercel Build Fix

This revision fixes the strict TypeScript cookie typing error reported by Vercel in `apps/web/lib/supabase/server.ts` and proactively applies the same explicit Supabase cookie type to `apps/web/middleware.ts`.

- Imports `CookieOptions` from `@supabase/ssr`.
- Explicitly types the `setAll` cookie payload.
- Keeps the existing Supabase SSR cookie behavior unchanged.
- NOVA source tests: 37/37 passing.

The package-install network step could not be completed in the build sandbox, so Vercel remains the authoritative production compiler for the deployed Next.js application.
