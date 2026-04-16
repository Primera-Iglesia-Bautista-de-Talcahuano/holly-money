# Design Spec: Cobalt & Coral Palette Redesign

**Date:** 2026-04-16  
**Status:** Approved  
**Branch target:** feature/remaining-pages-redesign

---

## Overview

Replace current "Sage & Stone" palette (monochromatic green) with "Cobalt & Coral" — a two-hue system with deep cobalt blue as primary, coral as accent/error, and emerald green reserved exclusively for income indicators. Roboto Slab for headings and financial figures, Roboto for all body text and labels.

---

## Color Tokens

### Light Mode

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#1558b0` | Buttons, active states, links |
| `--color-primary-dark` | `#0a2a58` | Sidebar brand, text on primary-light |
| `--color-primary-mid` | `#5a9de0` | Muted icons, secondary actions |
| `--color-primary-light` | `#ddeeff` | Sidebar active bg, stat card bg, badges |
| `--color-primary-surface` | `#f0f7ff` | Table header bg, page background tint |
| `--color-primary-border` | `#a8ccf0` | Card borders, dividers |
| `--color-on-primary` | `#ffffff` | Text on primary buttons |
| `--color-on-primary-container` | `#0a2a58` | Text on primary-light surfaces |
| `--color-accent` | `#e85040` | Coral — error, destructive, expense indicators |
| `--color-accent-light` | `#fde8e6` | Expense badge bg |
| `--color-accent-border` | `#f0b0a8` | Expense card border |
| `--color-income` | `#22a060` | Income indicators, positive values |
| `--color-income-light` | `#d8f2e8` | Income badge bg |
| `--color-income-dark` | `#083820` | Income badge text |
| `--color-income-border` | `#90cca8` | Income card border |
| `--color-background` | `#ffffff` | Page background |
| `--color-surface` | `#ffffff` | Card background |
| `--color-surface-low` | `#f0f7ff` | Subtle tinted surface |
| `--color-on-surface` | `#0a2a58` | Primary text |
| `--color-on-surface-variant` | `#4a7ab0` | Secondary/muted text |
| `--color-outline` | `#4a7ab0` | Input borders, icons |
| `--color-outline-variant` | `#ddeeff` | Dividers, subtle borders |

### Dark Mode (optional toggle)

| Token | Value |
|---|---|
| `--color-background` | `#0d1829` |
| `--color-surface` | `#132040` |
| `--color-surface-low` | `#0d1829` |
| `--color-primary-light` | `#1e3a68` |
| `--color-primary-surface` | `#132040` |
| `--color-primary-border` | `#1e3a68` |
| `--color-on-surface` | `#c8dff8` |
| `--color-on-surface-variant` | `#5a8abf` |
| `--color-outline-variant` | `#1e3a68` |

Income, accent, and primary base colors remain the same in dark mode — only surfaces and text change.

---

## Typography

### Fonts

```
Heading: "Roboto Slab" (Google Fonts) — weights 700, 800, 900
Body:    "Roboto" (Google Fonts) — weights 400, 500, 700
```

Replace current `--font-heading: var(--font-manrope)` → Roboto Slab  
Replace current `--font-sans: var(--font-inter)` → Roboto  

### Scale

| Role | Font | Size | Weight |
|---|---|---|---|
| Page title (h1) | Roboto Slab | 30px | 800 |
| Section heading (h2) | Roboto Slab | 22px | 700 |
| Card heading (h3) | Roboto Slab | 16px | 700 |
| Stat value (amounts) | Roboto Slab | 20–28px | 900 |
| Body text | Roboto | 14px | 400 |
| Table cell | Roboto | 13px | 500 |
| Label/uppercase | Roboto | 11px | 700 |
| Helper/muted | Roboto | 12px | 400 |

---

## Component Patterns

### Badges / Pills

- Shape: `border-radius: 4px` (rectangular, not fully rounded — more serious/financial)
- Income: `bg #d8f2e8 / text #083820`
- Expense: `bg #fde8e6 / text #e85040`
- Pending: `bg #ddeeff / text #1558b0`
- Rendida (fulfilled): `bg #1558b0 / text #ffffff`
- Admin role: `bg #e85040 / text #ffffff`
- Cancelado: `bg #a8ccf0 / text #0a2a58`

### Buttons

- Primary: `bg #1558b0 / text white / hover #0e4a98`
- Outline: `border #1558b0 / text #1558b0 / hover bg #f0f7ff`
- Destructive: `bg #e85040 / text white`

### Sidebar

- Brand bar: `bg #0a2a58 / text #ddeeff`
- Active item: `bg #ddeeff / text #0a2a58 / left border 3px solid #1558b0`
- Inactive item: `text #4a7ab0 / hover bg #f0f7ff`
- Border: `#a8ccf0`

### Stat Cards

Three semantic variants by content type:
- Balance card: `bg #ddeeff / border #a8ccf0`
- Income card: `bg #d8f2e8 / border #90cca8`
- Expense card: `bg #fde8e6 / border #f0b0a8`

### Tables

- Header row: `bg #f0f7ff / text #4a7ab0`
- Row hover: `bg #f0f7ff`
- Border: `#ddeeff`
- Amount column: Roboto Slab 900 for financial figures

### Form Inputs

- Border: `#a8ccf0`
- Focus ring: `#1558b0`
- Background: `#f0f7ff`
- Error state: `border #e85040 / text #e85040`

### Cards / Panels

- Border: `1px solid #ddeeff`
- Border radius: `12px` (existing scale maintained)
- Shadow: `0 1px 4px rgba(21,88,176,0.06)`

---

## Dark Mode Implementation

- System-level: respect `prefers-color-scheme` as default
- User override: toggle stored in `localStorage` key `pibt-theme`
- Toggle UI: icon button in top-right of sidebar header
- CSS: use `@media (prefers-color-scheme: dark)` + `.dark` class override on `<html>`

---

## Migration from Sage & Stone

Key replacements in `globals.css`:

| Remove | Replace with |
|---|---|
| `--color-primary: #5c8a6e` | `#1558b0` |
| `--color-on-surface: #2d4a38` | `#0a2a58` |
| `--color-on-surface-variant: #7a8c82` | `#4a7ab0` |
| `--color-outline-variant: #c8dfd0` | `#ddeeff` |
| `--color-background: #f8faf8` | `#ffffff` |
| `--color-surface-container-low: #eef5f1` | `#f0f7ff` |
| `--color-surface-container-high: #e8f0eb` | `#ddeeff` |
| `font-heading: Manrope` | `Roboto Slab` |
| `font-sans: Inter` | `Roboto` |

Add new semantic tokens: `--color-income`, `--color-income-light`, `--color-income-dark`, `--color-income-border`, `--color-accent`, `--color-accent-light`, `--color-accent-border`.

---

## Files to Update

- `app/globals.css` — all color tokens + font imports
- `next/font` setup in `app/layout.tsx` — swap Manrope → Roboto Slab, Inter → Roboto
- All page components that hardcode `text-primary`, `bg-muted`, `border-border` — should work automatically via tokens
- `components/ui/` — verify badge, button, input, card use token classes not hardcoded colors
- `components/dashboard/dashboard-nav.tsx` — sidebar active/inactive colors
- `tailwind.config` or CSS theme — update shadcn pass-through vars
