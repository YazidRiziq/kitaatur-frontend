<!--
=== Sync Impact Report (v1.0.0 → v1.0.1) ===
Version change: 1.0.0 → 1.0.1
Modified principles: none (PATCH — TODO resolution only)
Added sections: none
Removed sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md      ✅ no change (generic Constitution Check ref)
  - .specify/templates/spec-template.md      ✅ no change (generic)
  - .specify/templates/tasks-template.md      ✅ no change (tests already optional)
  - .specify/templates/checklist-template.md ✅ no change (generic)
  - .specify/templates/commands/*            ⚠ N/A (directory does not exist)
Follow-up TODOs status:
  - TODO(semicolons):     ✅ RESOLVED — components/layout/{Header,SidebarItem,Sidebar}.tsx &
                                       components/employees/EmployeeDetailSheet.tsx converted to no-semicolon
  - TODO(font):           ✅ RESOLVED — app/globals.css: --font-heading now → var(--font-headline) (Plus Jakarta);
                                       --font-sans now → var(--font-body) (Inter); shadcn CardTitle/SheetTitle/DialogTitle aligned
  - TODO(sheets):         ✅ RESOLVED — added components/ui/dialog.tsx (shadcn); EmployeeDetailSheet &
                                       LeaveDetailSheet migrated from manual DialogPrimitive to ui/dialog primitives
  - TODO(sidebar):        ✅ RESOLVED — Sidebar.tsx active state now uses pathname.startsWith(item.href + "/")
  - Optional:             ⏸ DEFERRED — loading.tsx/error.tsx (per-page skeleton still adequate)
===
=== Original Sync Impact Report (v1.0.0 → initial ratification) ===
Version change: (template, no prior ratification) → 1.0.0
Modified principles: N/A — initial ratification (5 placeholders → 5 concrete principles)
Added sections: Core Principles (5), Technology Stack & Constraints,
                 Development Workflow & Quality Gates, Governance
Removed sections: none
============================
-->

# KitaAtur Frontend Constitution

## Core Principles

### I. Server-First Layout & Server-Action Data Flow

The dashboard shell MUST be a Server Component that fetches bootstrap data server-side and seeds a client context provider before any feature page renders.

- `(dashboard)/layout.tsx` MUST be an async Server Component that calls `getDashboardData()` (from `lib/dashboard/actions.ts`) and wraps children in `<DashboardProvider data={data}>` (`DashboardProvider` from `lib/dashboard/dashboard-context.tsx`).
- `getDashboardData()` MUST prefer the `kitaatur-dashboard` cookie cache, falling back to an authenticated fetch of `NEXT_PUBLIC_API_URL/auth/me` with the Supabase session access token.
- All feature pages (`overview`, `attendance`, `leave`, `employees`, `departments`, `positions`) MUST be `"use client"` and fetch data inside `useEffect`/`useCallback` by `await`-ing Server Action functions imported from `lib/<feature>/actions.ts`.
- Every `lib/<feature>/actions.ts` MUST start with a file-level `"use server"` directive (line 1). Actions MUST obtain the access token via `lib/supabase/server.ts` (`createClient()` is async and MUST be awaited) and proxy to `NEXT_PUBLIC_API_URL` REST endpoints with a `Bearer` token header.
- Supabase is used for authentication and access-token issuance ONLY. Direct Supabase database queries from the frontend are PROHIBITED; data comes from the NestJS REST API.
- Navigation-triggering mutations (login, register, sign-out, onboarding completion) MUST call `revalidatePath('/', 'layout')` followed by `redirect(...)` inside the Server Action.

**Rationale**: Server Components keep the authenticated shell fast and free of client-side fetch waterfalls; Server Actions centralize Bearer-token handling and keep secrets off the client bundle. The cookie cache avoids a round-trip to `/auth/me` on every navigation.

### II. Feature-Slice Folder Mirroring (No Barrels)

Feature code MUST be organized as mirrored slices across three roots: `app/(dashboard)/`, `components/`, and `lib/`.

- Each feature MUST use the same folder name in all three roots. Entity-collection features use **plural** names (`departments`, `employees`, `positions`); concept features use **singular** names (`attendance`, `leave`, `onboarding`, `auth`, `dashboard`).
- Every `lib/<feature>/` MUST contain `actions.ts` (file-level `"use server"`) and `types.ts` (interfaces + const tuples). Features requiring shared client state MAY also add `<feature>-context.tsx`.
- Imports MUST target specific files via the `@/*` alias (e.g. `@/lib/leave/actions`, `@/components/leave/LeaveTable`). Barrel `index.ts`/`index.tsx` files are PROHIBITED.
- There is no central `types/` folder and no Supabase-generated `database.types.ts`. Types are co-located per feature in `lib/<feature>/types.ts`. The single shared generic `PaginatedResponse<T>` lives in `lib/employees/types.ts` and is imported directly when reused.
- Cross-feature type references MUST be direct imports (e.g. `import { Department } from "@/lib/departments/types"`), not re-exports.

**Rationale**: Mirrored slices make it trivial to locate every artifact of a feature; direct imports (no barrels) preserve tree-shaking and avoid circular-export traps as the app grows.

### III. Shadcn + Tailwind v4 Material-3 Design Tokens

Styling MUST use the shadcn/ui primitive layer and the Material Design 3 token system defined in `app/globals.css`.

- `components/ui/*` files are shadcn-generated (config: `style: "radix-nova"`, `baseColor: "neutral"`, `cssVariables: true`, `iconLibrary: "lucide"`, unified `radix-ui` package). They MUST NOT be hand-edited; regenerate via the shadcn CLI when a change is needed.
- Custom styling MUST consume Tailwind v4 tokens from the `@theme inline` block of `app/globals.css` (e.g. `bg-surface`, `text-on-surface`, `text-on-surface-variant`, `bg-primary`, `border-outline-variant`, `bg-surface-container-lowest/low/high/highest`). Inline hex values in components are DISCOURAGED except for one-off decorative accents.
- The `cn` helper from `@/lib/utils` (`twMerge(clsx(...))`) MUST be used wherever conditional class merging is needed. `class-variance-authority` (CVA) is reserved for variant-heavy primitives (currently `button` and `SidebarItem`); ad-hoc variant maps (e.g. `LeaveStatCard` `colorMap`) are acceptable for leaf presentational components.
- Icons MUST be named imports from `lucide-react` rendered as `<Icon size={n} />` (component reference, not string). `lucide-react` is the sole icon library.
- Toasts MUST use `sonner` (`toast.success`/`error`/`info`). The `<ToasterWrapper />` is mounted exactly once in the root layout.
- Typography: `Plus_Jakarta_Sans` is wired to the `--font-headline` variable (used via the `font-headline` utility for headings/titles); `Inter` is wired to `--font-body` (used via `font-body` for body text). `font-headline` is the canonical heading class for custom (non-shadcn) components.

**Rationale**: A single token layer guarantees visual consistency and makes light/dark theming a config change rather than a refactor. Confining CVA to true variant primitives keeps the codebase predictable.

### IV. Auth & Route Gate via Supabase Middleware

All route protection and onboarding gating MUST be enforced in `middleware.ts` using the Supabase SSR server client; pages MUST NOT re-implement auth checks.

- `middleware.ts` MUST call `supabase.auth.getUser()` and inspect `user.user_metadata?.onboarding_complete === true` for every dashboard route.
- Dashboard routes (`/overview`, `/attendance`, `/leave`, `/employees`, `/departments`, `/positions`, `/settings`) MUST redirect unauthenticated users to `/login` and authenticated-but-not-onboarded users to `/onboarding`.
- The user role (Owner/HR/Administrator) MUST be sourced from the `/auth/me` REST response (cached in the `kitaatur-dashboard` cookie and exposed via `DashboardProvider`), NOT from Supabase `user_metadata`.
- Server Actions that need the session MUST obtain it through `lib/supabase/server.ts` (`createClient()`, async). The browser client `lib/supabase/client.ts` currently has no consumers; introducing client-side Supabase usage requires a constitution amendment.

**Rationale**: Centralizing the gate in middleware eliminates per-page auth drift and keeps role provenance unambiguous (the API, not the IdP, owns roles).

### V. TypeScript Strict & Component Naming Conventions

All code MUST pass `tsconfig.json` (`"strict": true`) and follow the established naming conventions.

- The import alias is the single `@/*` → `./*` mapping. Relative imports (`../`) for app/lib code are PROHIBITED.
- Component files MUST use PascalCase filenames (e.g. `SidebarItem.tsx`, `EmployeeTable.tsx`). shadcn `components/ui/*` files keep their lowercase names per shadcn convention.
- Props interfaces for custom components MUST use the `<ComponentName>Props` suffix (e.g. `SidebarItemProps`, `LeaveTableProps`, `HeaderProps`). shadcn primitives keep their inline `React.ComponentProps<...>` style. Components with no props have no interface.
- Layout files MUST use `export default function`; all other components and lib functions MUST use named exports (`export function` / `export { }`).
- The `"use client"` or `"use server"` directive MUST be the first non-comment line of any file that needs it.
- Code MUST be written **without semicolons**, consistent with `app/*`, `components/ui/*`, and `lib/*`.

**Rationale**: A single import alias and uniform naming make the codebase greppable and onboarding-friendly; the no-semicolon style matches the Next.js default and the majority of existing files.

## Technology Stack & Constraints

- **Framework**: Next.js `16.2.1` App Router. Per `AGENTS.md`, this is NOT the standard Next.js — APIs, conventions, and file structure may differ from prior knowledge. Before writing Next.js code, consult the guides in `node_modules/next/dist/docs/` and heed deprecation notices.
- **Language & types**: TypeScript 5 (`"strict": true`), React `19.2.4`.
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"`), `tw-animate-css`, shadcn `radix-nova` style, `class-variance-authority`, `clsx` + `tailwind-merge` (via `@/lib/utils` `cn`).
- **Component primitives**: shadcn (`^4.1.1`) backed by the unified `radix-ui` (`^1.4.3`) package — NOT scoped `@radix-ui/react-*` packages. Icons: `lucide-react` (`^1.7.0`). Toasts: `sonner` (`^2.0.7`).
- **Auth**: `@supabase/ssr` (`^0.12.0`) + `@supabase/supabase-js` (`^2.108.1`). Supabase is used for authentication and session-token issuance ONLY; the frontend performs no Supabase database queries.
- **Data source**: All business data flows through the NestJS REST API at `NEXT_PUBLIC_API_URL`, called from Server Actions with a Bearer token obtained from the Supabase session.
- **Product context**: KitaAtur is a multi-tenant HRIS SaaS for Indonesian SMEs. The web dashboard serves Owner and HR roles only; employees interact via WhatsApp Bot (out of scope for this frontend). UI copy, toast messages, and Server Action error messages MUST be in Bahasa Indonesia.
- **Responsive target**: Dashboard is optimized for desktop (min-width 1024px). For viewports below 768px, display a "use a desktop device" message. Mobile-responsive dashboard UI is out of MVP scope.
- **Intentionally absent infrastructure** (do NOT add without a constitution amendment): `loading.tsx`/`error.tsx` route files (loading is handled per-page via skeleton rows/spinners; errors via `try/catch` + `toast.error`), a test framework and test files (testing is optional until an amendment introduces one), a central `types/` folder, Supabase-generated `database.types.ts`, and a `hooks/` folder.

## Development Workflow & Quality Gates

- **Lint**: `npm run lint` (ESLint flat config: `eslint-config-next/core-web-vitals` + `/typescript`) MUST pass with zero errors before merge.
- **Type check**: There is no standalone typecheck script. Type correctness is verified via `npm run build` (`next build`). A feature is not done until `next build` succeeds.
- **shadcn primitives**: `components/ui/*` MUST NOT be edited by hand. To add or change a primitive, use the shadcn CLI so the file stays regenerable.
- **New features**: MUST follow the Feature-Slice mirroring (Principle II) — create `app/(dashboard)/<feature>/page.tsx`, `components/<feature>/`, and `lib/<feature>/{actions.ts,types.ts}`. Do not introduce new top-level folders without justification.
- **Sidebar active state**: MUST be computed with `usePathname()` from `next/navigation`. Active matching SHOULD use prefix matching so nested routes (e.g. `/employees/123`) keep the parent item active.
- **Comments**: Keep code comments minimal. When present, write them in Bahasa Indonesia to match the existing codebase voice.
- **Commits**: Follow the existing repo commit style; do not commit unless explicitly asked.

## Governance

This constitution is the highest-authority document for the KitaAtur frontend. It supersedes ad-hoc conventions and any conflicting guidance in downstream templates. Any practice that diverges from the principles above MUST be either reconciled with the codebase or formally amended.

**Amendment procedure**:

1. Propose the change with rationale, referencing the affected principle(s) and the concrete files involved.
2. Update `.specify/memory/constitution.md` in place (never create a new template file).
3. Bump `CONSTITUTION_VERSION` following semantic versioning:
   - **MAJOR**: backward-incompatible governance change — a principle is removed or materially redefined.
   - **MINOR**: a new principle or section is added, or existing guidance is materially expanded.
   - **PATCH**: clarifications, wording, typo fixes, and non-semantic refinements.
4. Prepend a Sync Impact Report (as an HTML comment) recording the version change, modified/added/removed principles, template-update status, and any deferred TODOs.
5. Propagate the change to dependent artifacts: `.specify/templates/*` (update only if a reference becomes stale) and runtime guidance docs (`AGENTS.md`, `docs/FRONTEND_STRUCTURE.md`, `docs/KitaAtur_PRD.md`).

**Compliance review**:

- Every implementation plan MUST pass the "Constitution Check" gate defined in `.specify/templates/plan-template.md` before Phase 0 research, and be re-checked after Phase 1 design.
- Complexity or deviation introduced in a plan MUST be justified in the plan's Complexity Tracking table; if no simpler alternative exists, document why.
- Runtime development guidance lives in `AGENTS.md` (Next.js caveats), `docs/FRONTEND_STRUCTURE.md` (layout/sidebar/topbar contract), and `docs/KitaAtur_PRD.md` (product requirements).

**Version**: 1.0.1 | **Ratified**: 2026-07-08 | **Last Amended**: 2026-07-08
