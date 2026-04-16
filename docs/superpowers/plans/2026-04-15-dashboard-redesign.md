# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the dashboard shell (layout + sidebar) and the dashboard page to match the Sage & Stone spec — hero saldo card, income/expense KPIs, charts, recent movements, and a clean 220px sidebar with mobile hamburger drawer.

**Architecture:** Four focused changes: (1) shell layout + sidebar, (2) dashboard nav component, (3) dashboard page KPIs + structure, (4) chart colors + font sizes. Each is independently deployable. No data layer changes — all service calls stay identical.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, shadcn base-vega (Base UI), Recharts via shadcn Chart, lucide-react icons

**Review requirement (ALL tasks):** Every spec + code quality review MUST apply the redesign skill audit (font sizes ≥11px for labels, ≥12px for helper text, ≥text-3xl for page headings; no hardcoded hex; no `space-y-*`; `size-*` for equal dims) and the shadcn skill rules (semantic tokens, `flex flex-col gap-*`, `Label` component, `size-*`, `data-icon` for button icons).

---

## Font size minimums (from established criteria)

- UI labels (uppercase): `text-[11px]` minimum
- Helper / secondary / footer text: `text-xs` (12px) minimum  
- Chart axis / legend: `text-xs` minimum (current code has `text-[9px]` and `text-[10px]` — both must be bumped)
- Page headings: `text-3xl` minimum
- All `h-N w-N` where N is equal → `size-N`
- No `space-y-*` → `flex flex-col gap-*`
- No hardcoded hex — semantic tokens only

---

## Files

| Action | File | What changes |
|---|---|---|
| Modify | `app/(dashboard)/layout.tsx` | Sage & Stone sidebar (220px), mobile drawer, redirect `/login` → `/`, semantic tokens, size-*, gap-* |
| Modify | `components/dashboard/dashboard-nav.tsx` | `space-y-2` → `flex flex-col gap-2`, `h-5 w-5` → `size-5`, semantic hover/active colors |
| Modify | `app/(dashboard)/dashboard/page.tsx` | Hero saldo card, income/expense cards, chart section, recent movements section |
| Modify | `components/dashboard/dashboard-charts.tsx` | Sage & Stone chart colors, font sizes ≥11px on axis/legend |

---

## Task 1: Redesign `app/(dashboard)/layout.tsx` — shell + sidebar

**Files:**
- Modify: `app/(dashboard)/layout.tsx`

- [ ] **Step 1: Read the current file**

Read `app/(dashboard)/layout.tsx` to understand the existing structure.

- [ ] **Step 2: Replace the file**

```tsx
import Link from "next/link"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/auth/logout-button"
import { getCurrentUser } from "@/lib/supabase/server"
import { LayoutDashboard, Briefcase, Users, Settings, Menu, Plus } from "lucide-react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/")
  }

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U"

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
    { href: "/movimientos", label: "Movimientos", icon: <Briefcase className="size-4" /> },
    ...(user.role === "ADMIN"
      ? [
          { href: "/usuarios", label: "Usuarios", icon: <Users className="size-4" /> },
          { href: "/configuracion", label: "Configuración", icon: <Settings className="size-4" /> },
        ]
      : []),
  ]

  return (
    <div className="min-h-[100dvh] bg-background flex">
      {/* ── Desktop sidebar ───────────────────────────────────────── */}
      <aside className="hidden md:flex w-[220px] shrink-0 flex-col bg-card border-r border-border min-h-[100dvh] sticky top-0">
        {/* Brand */}
        <div className="px-5 pt-6 pb-4 flex flex-col gap-0.5">
          <span className="font-heading text-base font-bold text-foreground leading-tight">
            Sistema Contable
          </span>
          <span className="text-[11px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">
            PIBT
          </span>
        </div>

        {/* New movement CTA */}
        <div className="px-4 pb-4">
          <Button
            render={<Link href="/movimientos/nuevo" />}
            className="w-full gap-2 text-sm"
          >
            <Plus className="size-4" data-icon="inline-start" />
            Nuevo Movimiento
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3">
          <DashboardNav links={links} />
        </nav>

        {/* User profile */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-primary">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">{user.name}</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide truncate">{user.role}</p>
            </div>
          </div>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-20 bg-card border-b border-border px-4 h-14 flex items-center justify-between">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Abrir menú">
                  <Menu className="size-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-72 p-0 bg-card border-r border-border">
              <div className="flex flex-col h-full">
                <SheetHeader className="px-5 pt-6 pb-4 text-left">
                  <SheetTitle className="font-heading text-base font-bold text-foreground leading-tight">
                    Sistema Contable
                    <span className="block text-[11px] text-muted-foreground uppercase tracking-[0.15em] font-semibold mt-0.5">
                      PIBT
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex-1 px-3">
                  <DashboardNav links={links} />
                </nav>
                <div className="px-4 py-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-primary">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide truncate">{user.role}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <LogoutButton />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <span className="font-heading text-sm font-bold text-foreground">Sistema Contable</span>

          {/* Mobile avatar */}
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-[11px] font-bold text-primary">{initials}</span>
          </div>
        </header>

        {/* FAB — mobile only */}
        <Link
          href="/movimientos/nuevo"
          className="md:hidden fixed bottom-6 right-6 z-50 size-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Nuevo movimiento"
        >
          <Plus className="size-6" />
        </Link>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run CI**

```bash
pnpm lint && pnpm typecheck
```

Expected: zero errors/warnings.

- [ ] **Step 4: Commit**

```bash
git add app/\(dashboard\)/layout.tsx && git commit -m "feat: redesign dashboard shell — 220px sidebar, mobile drawer + FAB, Sage & Stone tokens"
```

---

## Task 2: Update `components/dashboard/dashboard-nav.tsx`

**Files:**
- Modify: `components/dashboard/dashboard-nav.tsx`

- [ ] **Step 1: Replace the file**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export type NavLink = {
  href: string
  label: string
  icon: React.ReactNode
}

export function DashboardNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-1">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Run CI**

```bash
pnpm lint && pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/dashboard-nav.tsx && git commit -m "feat: update dashboard nav — gap-1, size-4 icons, semantic active/hover tokens"
```

---

## Task 3: Redesign `app/(dashboard)/dashboard/page.tsx`

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Read the current file**

Read `app/(dashboard)/dashboard/page.tsx` to understand existing data props and service calls.

- [ ] **Step 2: Replace the file**

Preserve all service calls and data access exactly. Only change layout and styling.

```tsx
import Link from "next/link"
import { cn } from "@/lib/utils"
import { dashboardService } from "@/services/dashboard/dashboard.service"
import { getCurrentUser } from "@/lib/supabase/server"
import { canCreateOrEditMovements } from "@/lib/permissions/rbac"
import { IngresosEgresosChart, CategoriaChart } from "@/components/dashboard/dashboard-charts"
import { MovimientosTable } from "@/components/movimientos/movimientos-table"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Hash } from "lucide-react"

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
})

type DashboardSearchParams = {
  from?: string
  to?: string
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: DashboardSearchParams
}) {
  const from = (await searchParams)?.from
  const to = (await searchParams)?.to
  const [data, user] = await Promise.all([
    dashboardService.getResumen({ from, to }),
    getCurrentUser(),
  ])
  const canWrite = canCreateOrEditMovements(user?.role)

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Resumen financiero de actividades</p>
        </div>

        {/* Date filter */}
        <form className="flex flex-wrap items-end gap-3" method="get">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="from" className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
              Desde
            </Label>
            <DatePicker name="from" defaultValue={from} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="to" className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
              Hasta
            </Label>
            <DatePicker name="to" defaultValue={to} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="outline" className="h-9 px-4 text-sm">
              Filtrar
            </Button>
            <Button render={<Link href="/dashboard" />} variant="ghost" className="h-9 px-4 text-sm">
              Limpiar
            </Button>
          </div>
        </form>
      </div>

      {/* ── Hero saldo + KPIs ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Hero — saldo actual */}
        <div className="sm:col-span-1 rounded-xl bg-primary p-6 flex flex-col gap-3 text-primary-foreground">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground/70">
            Saldo actual
          </p>
          <p className="font-heading text-3xl font-bold tracking-tight tabular-nums">
            {clp.format(data.kpis.saldoActual)}
          </p>
          <div className="flex flex-wrap gap-3 mt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
              <TrendingUp className="size-3" />
              {clp.format(data.kpis.totalIngresos)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
              <TrendingDown className="size-3" />
              {clp.format(data.kpis.totalEgresos)}
            </span>
          </div>
        </div>

        {/* Income */}
        <div className="rounded-xl bg-card border border-border p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Ingresos
            </p>
            <TrendingUp className="size-4 text-primary" />
          </div>
          <p className="font-heading text-2xl font-bold tracking-tight text-primary tabular-nums">
            {clp.format(data.kpis.totalIngresos)}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.kpis.cantidadMovimientos} movimientos en el período
          </p>
        </div>

        {/* Expenses */}
        <div className="rounded-xl bg-card border border-border p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Egresos
            </p>
            <TrendingDown className="size-4 text-destructive" />
          </div>
          <p className="font-heading text-2xl font-bold tracking-tight text-destructive tabular-nums">
            {clp.format(data.kpis.totalEgresos)}
          </p>
          <p className="text-xs text-muted-foreground">
            En el período seleccionado
          </p>
        </div>
      </div>

      {/* ── Charts ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-card border border-border p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold text-foreground">Ingresos vs Egresos</h2>
            <p className="text-xs text-muted-foreground">Tendencia por período</p>
          </div>
          <IngresosEgresosChart data={data.serieIngresosEgresos} />
        </div>
        <div className="rounded-xl bg-card border border-border p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold text-foreground">Por categoría</h2>
            <p className="text-xs text-muted-foreground">Distribución del período</p>
          </div>
          <CategoriaChart data={data.resumenPorCategoria} />
        </div>
      </div>

      {/* ── Recent movements ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Últimos movimientos</h2>
          <Link
            href="/movimientos"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Ver todos →
          </Link>
        </div>
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <MovimientosTable
            canWrite={canWrite}
            rows={data.ultimosMovimientos.map((row) => ({
              id: row.id,
              folio_display: row.folio_display ?? String(row.folio),
              movement_date: row.movement_date,
              movement_type: row.movement_type,
              amount: String(row.amount),
              category: row.category,
              concept: row.concept,
              reference_person: null,
              received_by: null,
              delivered_by: null,
              beneficiary: null,
              payment_method: null,
              support_number: null,
              notes: null,
              cancellation_reason: null,
              status: row.status,
              created_by: {
                full_name:
                  (row.created_by as { full_name: string } | null)?.full_name ?? "",
              },
            }))}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run CI**

```bash
pnpm lint && pnpm typecheck
```

Expected: zero errors/warnings.

- [ ] **Step 4: Commit**

```bash
git add app/\(dashboard\)/dashboard/page.tsx && git commit -m "feat: redesign dashboard page — hero saldo card, KPI cards, chart section, recent movements"
```

---

## Task 4: Update `components/dashboard/dashboard-charts.tsx` — colors + font sizes

**Files:**
- Modify: `components/dashboard/dashboard-charts.tsx`

- [ ] **Step 1: Read the current file**

Read `components/dashboard/dashboard-charts.tsx`.

- [ ] **Step 2: Apply targeted fixes**

Changes to make (do NOT rewrite from scratch — make surgical edits):

**a) Chart color config — use Sage & Stone tokens:**
```ts
// Replace ingresosEgresosConfig with:
const ingresosEgresosConfig = {
  ingresos: {
    label: "Ingresos",
    color: "var(--color-primary)",
  },
  egresos: {
    label: "Egresos",
    color: "var(--color-expense)",
  },
} satisfies ChartConfig
```

**b) Chart axis font size — bump to 11px minimum:**
```tsx
// XAxis: fontSize={10} → fontSize={11}
// YAxis: fontSize={10} → fontSize={11}
```

**c) Legend label text size — bump from `text-[9px] sm:text-[10px]` to `text-[11px]`:**
```tsx
// Replace:
<span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/70">
// With:
<span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
```

**d) Category legend text — bump from `text-[10px]` to `text-xs`:**
```tsx
// Replace all text-[10px] in the category chart legend with text-xs
```

**e) Replace `text-on-surface-variant` with `text-muted-foreground`:**
All instances of the old MD3 token should use the semantic shadcn equivalent.

- [ ] **Step 3: Run CI**

```bash
pnpm lint && pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/dashboard-charts.tsx && git commit -m "fix: update chart colors to Sage & Stone palette, bump axis/legend font sizes to 11px minimum"
```

---

## Review criteria for each task (spec + quality reviewers)

When reviewing each task, the reviewer MUST check:

### Spec compliance
- Matches the Sage & Stone design spec for the relevant component
- Sidebar is 220px with brand, CTA, nav, user profile
- Dashboard has hero saldo card (green bg), income + expense cards, charts, recent movements
- Mobile: hamburger drawer, FAB for new movement (hidden on desktop with `md:hidden`)
- No marketing content or dead links

### shadcn compliance  
- No `space-y-*` — only `flex flex-col gap-*`
- No hardcoded hex colors — only semantic tokens
- `size-*` for equal-dimension elements (not `h-N w-N`)
- `Label` component used for form labels
- Icons in Button use `data-icon`

### Redesign compliance
- All labels ≥ `text-[11px]`
- All helper/secondary text ≥ `text-xs` (12px)
- Page heading uses `text-3xl` minimum (`font-heading` class)
- No `text-[9px]` or `text-[10px]` anywhere
- `transition-colors` on interactive elements
- Semantic color tokens throughout (no `text-on-surface-variant`, `bg-surface-container-*` etc.)

---

## Self-Review Checklist

**Spec coverage:**
- ✅ 220px sidebar — Task 1
- ✅ Brand name + PIBT subtitle — Task 1
- ✅ "Nuevo Movimiento" CTA button in sidebar — Task 1
- ✅ Nav links (Dashboard, Movimientos, role-filtered Usuarios + Configuración) — Task 1
- ✅ User profile card at bottom of sidebar — Task 1
- ✅ Mobile hamburger drawer (same nav + profile) — Task 1
- ✅ FAB bottom-right mobile (`md:hidden`) — Task 1
- ✅ No "Nuevo Movimiento" in mobile drawer (FAB handles it) — Task 1
- ✅ Active nav indicator — Task 2
- ✅ Hero saldo card (green background) with nested income/expense chips — Task 3
- ✅ Income card (green amount) — Task 3
- ✅ Expense card (red amount) — Task 3
- ✅ Date filter (from/to) — Task 3
- ✅ Chart section: bar chart + category chart side by side on desktop — Task 3
- ✅ Recent movements with "Ver todos →" — Task 3
- ✅ Chart colors: green for income, red for expense — Task 4
- ✅ Font sizes ≥11px on axis/legend — Task 4

**No placeholders:** All steps have actual code.

**Token consistency:** All components use `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary`, `text-destructive`, `border-border`, `bg-card` — no MD3 tokens.
