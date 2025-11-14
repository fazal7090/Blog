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
- `apps/web/app/(marketing)/_components/site-header-account-section.tsx` – header that switches between login and profile dropdown.
- `apps/web/app/auth/callback/route.ts` – Supabase auth callback integration.
- `apps/web/next.config.mjs`, `apps/web/package.json`, root `package.json`, `pnpm-lock.yaml` – tooling/env tweaks (GraphQL dependencies, Supabase CLI scripts).
- `apps/web/.env.development`, `apps/web/README.md` – environment documentation for reviewers.
- `packages/supabase/src/database.types.ts` – regenerated Supabase types to include blog tables.

---

## Quick Start

```bash
git clone https://github.com/<your-org>/nextjs-saas-starter-kit-lite.git
cd nextjs-saas-starter-kit-lite
pnpm install
```

Create `apps/web/.env.local` (or reuse `.env.development`) with your Supabase project details:

```ini
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

NEXT_PUBLIC_AUTH_PASSWORD=true
NEXT_PUBLIC_AUTH_MAGIC_LINK=true
NEXT_PUBLIC_CAPTCHA_SITE_KEY=
NEXT_PUBLIC_DISPLAY_TERMS_AND_CONDITIONS_CHECKBOX=false
```

Reviewer test credentials (already seeded):

- Email/password: `mfazal7030@gmail.com / 12345678`
- Google OAuth: any Google account allowed on the Supabase project
- Email OTP: trigger from sign-in page (magic link enabled)

Run the app:

```bash
pnpm dev --filter web
```

Visit `http://localhost:3000` for the marketing/paginated feed.  
`/home` requires authentication and lets you create a post via Supabase GraphQL.

---

## Supabase Setup

All SQL lives under `apps/web/supabase`. Recommended workflow:

1. `pnpm --filter web supabase:start` – boot local Supabase (optional).
2. `pnpm --filter web supabase db push` – apply migrations to the linked project.
3. `pnpm --filter web supabase:typegen` – regenerate TS types after schema changes.
4. Update Supabase Dashboard → Authentication:
   - Enable Email, Password, Magic Link, Google.
   - Configure redirect URLs to `http://localhost:3000/auth/callback`.

The frontend talks to Supabase GraphQL via `graphql-request`, targeting `${NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`.

---

## Authentication Notes

- Makerkit handles all auth routes (`/auth/sign-in`, `/auth/sign-up`, `/auth/verify`, etc.).
- Providers are toggled in `apps/web/config/auth.config.ts`; Google is enabled and magic link = email OTP.
- Profile dropdown (header) uses `ProfileAccountDropdownContainer` and Makerkit `PersonalAccountDropdown` for logout/profile info.
- Middleware and layout changes ensure authenticated routes redirect appropriately.

---

## Bonus Items

- ✅ Email OTP / passwordless (Supabase Magic Link + templates under `apps/web/supabase/templates`).
- ✅ Profile dropdown with logout/profile details.
- 🟡 Future work: ISR + React Hook Form/Zod validation + optimistic UI (not required for this submission).

---

## Sharing

Push to GitHub and invite **`ahsang`** as a collaborator so the reviewer can access the repo and Supabase credentials. Document any additional environment values in `apps/web/README.md`.
