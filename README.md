## Makerkit + Supabase Blog

Take-home assignment build for **“Next.js + Makerkit + Supabase Blog”**.  
Implements a fully authenticated blog with paginated listing, post details, and a secured create-post experience powered by Supabase GraphQL.

---

## Feature Coverage & Files



- `apps/web/app/(marketing)/page.tsx` – paginated homepage (5 posts/page), auth-aware CTA, Supabase GraphQL fetching.
- `apps/web/app/posts/[id]/page.tsx` – server-rendered detail page with read-time + author metadata.
- `apps/web/app/home/page.tsx` & `home/layout.tsx` – authenticated create-post form, Supabase session guard, success/error UI, Makerkit shell.
- `apps/web/graphql_queires/posts.ts` – GraphQL queries/mutation for listing, detail, and creation.
- `apps/web/lib/supabasegraphql.ts` & `supabasebrowser.ts` – shared GraphQL + Supabase browser clients.
- `apps/web/app/layout.tsx`, `root-providers.tsx`, `components/personal-account-dropdown-container.tsx`, `packages/features/accounts/.../personal-account-dropdown.tsx` – Makerkit providers, profile dropdown, logout wiring.
- `apps/web/app/auth/callback/route.ts` – Supabase auth callback integration.
- `apps/web/next.config.mjs`, `apps/web/package.json`, root `package.json`, `pnpm-lock.yaml` – tooling/env tweaks (GraphQL dependencies, Supabase CLI scripts).
- `apps/web/.env.development`, `apps/web/README.md` – environment documentation for reviewers.
- `packages/supabase/src/database.types.ts` – regenerated Supabase types to include blog tables.

---

Set up .env.dev inside app insdied web folder to following :
NEXT_PUBLIC_SUPABASE_URL=https://ucecrlwvvbdvozckeord.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZWNybHd2dmJkdm96Y2tlb3JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NjgyNzAsImV4cCI6MjA3ODM0NDI3MH0.4dLLtnLQ3iTjIn1y4TZNTD_-ggMjS6x6r7o-7Bj_PEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZWNybHd2dmJkdm96Y2tlb3JkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc2ODI3MCwiZXhwIjoyMDc4MzQ0MjcwfQ.gnipDW6uxcIlHfFvqggdGWNrOrQXrLymKbeaHyGK79w


## Quick Start

```bash
git clone https://github.com/fazal7090/Blog.git
cd nextjs-saas-starter-kit-lite
pnpm install
```


Reviewer test credentials (already seeded):

- Email/password: `mfazal7030@gmail.com / 12345678`
- Google OAuth: any Google account allowed on the Supabase project


Run the app:

npm run dev
```

Visit `http://localhost:3000` for the marketing/paginated feed.  
`/home` requires authentication and lets you create a post via Supabase GraphQL.

The proj SS in image folder