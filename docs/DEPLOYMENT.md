# Deployment target

## Web
Deploy `apps/web` to Vercel. For a monorepo project, set the Root Directory to `apps/web`.

## Environment
Copy the root `.env.example` values into the Vercel project and production secret store when Phase 2 starts.

## Extension
`apps/extension` remains loadable as an unpacked Manifest V3 extension. API sync is intentionally deferred until authentication and project persistence exist.
