# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev

# Type checking
npm run typecheck

# Lint (zero warnings enforced)
npm run lint
npm run lint:fix

# CI (lint + typecheck)
npm run ci

# Database — apply SQL migrations manually (use this if prisma migrate fails)
npm run prisma:apply-sql

# Seed default users and config
npm run prisma:seed

# Initialize DB from scratch
npm run db:init

# Prisma Studio
npm run prisma:studio
```

There are no automated tests. `npm run ci` runs lint + typecheck.

## Architecture

**Stack:** Next.js 16 App Router · TypeScript strict · Tailwind CSS v4 · Prisma ORM + SQLite · NextAuth v4 (JWT, 8h) · React Hook Form + Zod · Recharts · Base UI

**Layer separation:**
- `app/` — Route handlers and page components. Split into `(auth)` and `(dashboard)` route groups.
- `components/` — UI (`components/ui/`) and domain components (`components/movimientos/`, `components/dashboard/`, etc.)
- `services/` — All business logic. Never call Prisma directly from API routes; use the service layer.
- `lib/` — Cross-cutting concerns: `lib/auth/` (NextAuth config + session helper), `lib/db/prisma.ts` (singleton client), `lib/permissions/rbac.ts` (role checks), `lib/validators/` (Zod schemas), `lib/utils/folio.ts`
- `types/` — Shared TypeScript types

**Data flow for mutations:**  
API route → validates with Zod schema from `lib/validators/` → calls service → service runs Prisma transaction → service calls `auditoriaService` inside same transaction → API route calls `processMovimientoIntegrations` (PDF/Sheet/email via Google Apps Script webhooks)

**Auth:**  
NextAuth credentials provider. Session stored as JWT cookie. `getCurrentSession()` from `lib/auth/session.ts` is used in Server Components and layouts. Role enforcement via `lib/permissions/rbac.ts` — three roles: `ADMIN`, `OPERADOR`, `VISOR`.

**Folio system:**  
Sequential numeric ID (starting at 0) stored in `ConfiguracionSistema.ultimoFolio` (singleton row with `id: "main"`). Incremented inside a Prisma transaction on each `movimiento` creation. `folioDisplay` is the formatted string version.

**Google integrations:**  
Three outbound webhooks via Google Apps Script (configured via env vars): PDF generation + Drive storage (`apps-script-documents.ts`), email notification (`apps-script-mail.ts`), Google Sheets sync (`sheets-sync.ts`). All three are triggered in `services/google/movement-postprocess.ts` after a movimiento is created/edited. Integration state is tracked on the `Movimiento` model (`pdfStatus`, `syncedToSheet`, `notificationStatus`, etc.).

**Database:**  
SQLite locally via Prisma. `prisma migrate` can fail in some environments — the workaround is `npm run prisma:apply-sql` which applies raw SQL from `prisma/migrations/`. To migrate to PostgreSQL, change the `datasource provider` in `prisma/schema.prisma` and update `DATABASE_URL`.

## Key conventions

- All Zod schemas live in `lib/validators/` and are shared between API routes and forms.
- UI components in `components/ui/` use Base UI (not Radix). Don't swap to Radix primitives.
- Tailwind uses Material Design-inspired semantic tokens (`surface`, `on-surface`, `primary`, `surface-container-*`, etc.) — stick to these rather than raw color values.
- No deletions: `Movimiento` records are logically cancelled (`estado: "ANULADO"`) with `motivoAnulacion`. Physical deletion is not supported.
- Every mutation on a `Movimiento` must register an `AuditoriaMovimiento` entry via `auditoriaService.registrarMovimiento()` inside the same transaction.

## Environment variables

See `.env.example`. Critical ones:
- `DATABASE_URL` — SQLite path locally (e.g. `file:./dev.db`)
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL`
- `SEED_DEFAULT_PASSWORD` — password used for all seeded users
- `GOOGLE_APPS_SCRIPT_WEBHOOK_URL` / `GOOGLE_APPS_SCRIPT_SECRET` — Google integrations (optional locally)
