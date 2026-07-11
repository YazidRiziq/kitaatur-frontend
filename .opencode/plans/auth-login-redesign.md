# Plan: Redesign Login UI (Supabase-inspired, DESIGN.md)

Date: 2026-07-11
Status: **Awaiting edit-permission unlock to implement**

## Intent

Redesign UI KitaAtur HRIS — mulai dari **Login** saja, jangan sentuh bagian lain. Acuan: `DESIGN.md` (Supabase-inspired). Komplain: bagian Auth "hampa". Konsep: Server First / desktop-first. Pakai shadcn/ui + variant.

## Decisions (locked via grilling)

1. **Global token scope** — rewrite `:root` shadcn tokens di `globals.css` ke DESIGN.md. Dashboard visually shifts (diterima user). Zero dashboard file di-edit.
2. **Composition** — split-screen: dark `canvas-night` brand panel kiri (composited attendance-dashboard mockup) + white canvas form kanan. Collapse ke form-only below `lg`.
3. **Form fields** — email + password + submit saja. Tidak ada forgot-password / remember-me (tidak ada backing).
4. **Fonts** — Inter single-family (drop `Plus_Jakarta_Sans`). Display = Inter 500 + negative tracking; body = Inter 400.
5. **Shared auth layout** — slim `app/(auth)/layout.tsx` jadi bare `min-h-screen bg-background`. Register/onboarding sementara kehilangan auto-logo (diterima).
6. **`--primary-foreground` = near-black `#171717`** (bukan putih) — DESIGN.md idiosyncratic, emerald button = "lit surface" dengan dark type.
7. **Radius** — button & input 6px via `className="rounded-sm"` di komponen login (tidak edit `button.tsx`/`input.tsx` base).
8. **Copy brand panel** — aku draft (Bahasa Indonesia), user review saat build.

## Token mapping (DESIGN.md → shadcn `:root`)

| shadcn var | DESIGN.md | hex |
|---|---|---|
| `--background` / `--card` / `--popover` | canvas | `#ffffff` |
| `--foreground` / `--card-foreground` / `--popover-foreground` | ink | `#171717` |
| `--primary` | emerald | `#3ecf8e` |
| `--primary-foreground` | on-primary (near-black) | `#171717` |
| `--secondary` / `--muted` / `--accent` | canvas-soft | `#fafafa` |
| `--secondary-foreground` / `--accent-foreground` | ink | `#171717` |
| `--muted-foreground` | ink-mute | `#707070` |
| `--destructive` | semantic red | `#e5484d` |
| `--border` / `--input` | hairline | `#dfdfdf` |
| `--ring` | emerald | `#3ecf8e` |
| radius scale | xs4 / sm6 / md8 / lg12 / xl16 / full9999 | explicit px |

**Keep** semua Material-3 token (`--color-surface-container-*`, `--color-on-surface*`, `--color-outline*`, dll) — aktif dipakai dashboard (100+ referensi). Hanya re-point path shadcn semantic ke emerald.

## File changes (7)

1. **`app/globals.css`** — rewrite `:root` shadcn semantic → DESIGN.md; radius scale eksplisit; `--font-*` → Inter; **hapus** `.wavy-bg` (zero refs); keep Material-3 tokens + dormant `.dark` block.
2. **`app/layout.tsx`** — drop `Plus_Jakarta_Sans`; load dua `Inter` (`--font-headline` + `--font-body`); body tetap `bg-surface` + kedua font var.
3. **`app/(auth)/layout.tsx`** — slim → `<div className="min-h-screen bg-background">{children}</div>`.
4. **`components/auth/LoginForm.tsx`** — rewrite: `FieldGroup`+`Field`+`FieldLabel`+`Input`+`FieldError`; `Alert`+`AlertCircle` untuk server error; `Button` emerald near-black `rounded-sm` full-width + `Spinner`+`disabled` saat loading. Hapus semua hardcoded color/shadow/radius (`bg-red-50`, `text-red-600`, `shadow-[...]`, `rounded-xl h-11`, `text-emerald-600`).
5. **`components/auth/LoginBrandPanel.tsx`** (NEW, server component) — `canvas-night` `#1c1c1c` panel: wordmark "KitaAtur" + emerald dot; headline Inter 500 display-lg negative tracking (copy ID); subtext on-dark muted; **signature mockup** = composited attendance-dashboard window (`Table`/`Badge`/`Avatar`/`Separator`, 3-4 baris status absen) di `canvas-night-soft` `#202020` + hairline + Level 2 shadow; copyright bawah.
6. **`app/(auth)/login/page.tsx`** — split-screen `lg:grid-cols-2`: kiri `<LoginBrandPanel/>` (hidden below lg), kanan form column (`LoginForm` + link "Belum punya akun? Daftar") + copyright.
7. **`components/auth/RegisterForm.tsx`** — **NOT touched** (out of scope).

## shadcn primitives (semua sudah ter-install)
`FieldGroup`, `Field`, `FieldLabel`, `FieldError`, `Input`, `Alert`, `Button`, `Spinner`, `Table`, `Badge`, `Avatar`, `Separator`. Tidak ada komponen baru yang perlu di-add.

## Old design — delete / flag
- **DELETE** (safe, zero refs): `.wavy-bg` di `globals.css`.
- **REPLACE di LoginForm** (saat rewrite): `text-emerald-600`, `bg-red-50`, `text-red-600`, `shadow-[...]`, `rounded-xl h-11`, raw `div+space-y-2`.
- **FLAG (out of scope)**: dashboard-wide hardcoded `text-emerald-600`/`bg-emerald-50`/`text-slate-*`/`dark:` remnants; dormant `.dark` block (tidak pernah di-activate). Bersihkan saat redesign dashboard.

## Verification
`npm run lint && npm run build`, lalu `npm run dev` cek `/login` desktop (split-screen) + narrow (panel hide) + `/register` + `/onboarding` (bare tapi fungsional).

## Out of scope
Register form, onboarding, dashboard, semua feature area selain `/login`. Forgot-password route. Hapus `dark:` dormant app-wide. Bersihkan dashboard hardcoded color cruft. Migrasi dashboard Material-3 → shadcn semantic token.

## Risks
- Dashboard `ring-primary`/`bg-primary` legacy tergeser ke emerald — verifikasi blast radius saat implementasi, isolasi pakai token deep-green terpisah kalau perlu.
- Register/onboarding kehilangan logo (regresi sementara, diterima).

## Grill conclusions (folded — .grill/ blocked by current read-only lock)
- Tegangan "jangan ubah struktur komponen" vs "auth jangan hampa": "hampa" = masalah komposisi (layout/brand panel), bukan token. Rule "no structure change" dilonggarkan untuk auth.
- User mengira Material-3 tokens = cruft → ternyata aktif dipakai dashboard (100+ ref). Tidak boleh dihapus.
- `.wavy-bg` = zero refs (dead). `.dark` block = dormant (tidak pernah aktif).
- DESIGN.md pertama (HashiCorp dark) diganti user dengan Supabase-inspired karena sadar kurang fit untuk HRIS light-mode in-product.
