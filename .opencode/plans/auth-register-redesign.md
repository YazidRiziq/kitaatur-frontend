# Plan: Redesign Register UI (DESIGN.md — Supabase-inspired)

Date: 2026-07-11
Status: **Plan mode — awaiting build-mode unlock to implement**

## Intent

Lanjutan dari login redesign. Redesign `/register` agar konsisten dengan login: split-screen, shadcn primitives, token DESIGN.md. Komplain yang sama: register sekarang bare (auto-logo hilang setelah shared layout di-slim) + shadcn violations (Card hardcoded shadow, `font-headline`/`text-on-surface`, `bg-red-50`, `rounded-xl h-11`, raw `div+space-y-2`, `Loader2` bukan `Spinner`).

## Decisions (locked)

1. **Composition = mirror login's split-screen.** `grid min-h-screen lg:grid-cols-2`, brand panel kiri (hidden <lg), form kanan. Konsistensi dengan login = goal eksplisit.
2. **Drop `Card`** — bare form on white dengan `FieldGroup`, sama seperti login. h1 "Daftar" + description di page header block, bukan `CardHeader`.
3. **Brand panel = shared `AuthBrandPanel`** (refactor dari `LoginBrandPanel`), accept `headline` + `subtext` props. Mockup attendance tetap fixed di dalam. Login & register pass copy berbeda. Re-touches login file — re-verify lint/build.
4. **ConfirmPassword mismatch → inline `FieldError`** di field confirmPassword (bukan top-level Alert). Top-level `Alert` hanya untuk server errors. UX upgrade, no backing change.
5. **No password-strength meter.** `minLength={8}` stays. DESIGN.md restrained.
6. **Submit: "Daftar"** / loading "Memproses...". Matches login.
7. **Mobile fallback header** — "KitaAtur" + dot, sama seperti login, hidden `lg:flex`.
8. **"Sudah punya akun? Masuk" link** — keep, same placement.
9. **Copy brand panel register** — aku draft (review saat build).

## Register brand-panel copy (draft)

- **Headline**: "Mulai dalam hitungan menit, bukan berari-hari."
- **Subtext**: "Buat akun, selesaikan onboarding sekali, dan absensi via WhatsApp tervalidasi geofencing siap dipakai — di kantor maupun di lapangan."

Grounded: onboarding exists (`app/(auth)/onboarding/`), geofencing confirmed (grill log), field teams = real audience (kantor + proyek). Tidak klaim "gratis"/"tanpa kartu kredit" (pricing model unknown).

## File changes (4)

1. **`components/auth/LoginBrandPanel.tsx`** → rename/refactor ke **`components/auth/AuthBrandPanel.tsx`**. Accept props `{ headline: string; subtext: string }`. Mockup + wordmark + footer tetap fixed di dalam. Export `AuthBrandPanel`.
2. **`app/(auth)/login/page.tsx`** — update import: `LoginBrandPanel` → `AuthBrandPanel`, pass login copy sebagai props (`headline="Absensi, cuti, dan tim Anda — dalam satu dashboard."` + subtext). Struktur page lain tidak berubah.
3. **`components/auth/RegisterForm.tsx`** — rewrite: `FieldGroup` + 4× `Field`/`FieldLabel`/`Input`; `Alert`+`AlertCircle` untuk server error; `FieldError` inline di confirmPassword untuk mismatch (state `confirmError` terpisah, clear on input); `Button` emerald `rounded-sm` `w-full h-11` + `Spinner`+`disabled` loading. Drop `Card`, drop semua hardcoded color/shadow/radius. Loading text "Memproses...".
4. **`app/(auth)/register/page.tsx`** — split-screen mirror login: `grid min-h-screen lg:grid-cols-2`, kiri `<AuthBrandPanel headline=... subtext=.../>` (register copy), kanan form column (mobile fallback header + "Daftar" h1 + description + `<RegisterForm/>` + "Sudah punya akun? Masuk" link).

## Token mapping

Tidak ada perubahan token. `globals.css` already migrated di login redesign. Register pakai token yang sama (`--primary` emerald, `--foreground` ink, `--border` hairline, `--ring` emerald, `--font-body` Inter). Dark palette (`canvas-night`, `on-dark`, `ink-mute-2`, `accent-tomato`) already di `@theme inline`.

## shadcn primitives (semua sudah ter-install)
`FieldGroup`, `Field`, `FieldLabel`, `FieldError`, `Input`, `Alert`, `AlertDescription`, `Button`, `Spinner`. Tidak ada komponen baru.

## Old design — replace during rewrite
- `Card` + `shadow-[0_12px_40px_rgba(0,105,72,0.08)]` (old deep-green shadow).
- `font-headline`, `font-body`, `text-on-surface`, `text-on-surface-variant` (Material-3 tokens — diganti semantic shadcn).
- `bg-red-50`, `text-red-600` (→ `Alert variant="destructive"`).
- `rounded-xl h-11` (→ `rounded-sm h-10`/`h-11`).
- `Loader2` (→ `Spinner`).
- raw `div`+`space-y-2` (→ `FieldGroup`+`Field`).

## Verification
`npm run lint && npm run build`, lalu `npm run dev` cek `/register` desktop (split-screen, 4 fields) + narrow (panel hide, form centered, mobile wordmark) + `/login` (regression check setelah refactor AuthBrandPanel).

## Out of scope
- Login (sudah selesai, hanya di-refactor import-nya).
- Onboarding, dashboard, semua feature area selain `/register`.
- Password-strength meter, forgot-password, email-verify route.
- Pricing/claim copy ("gratis", "tanpa kartu kredit").

## Risks
- **Login regression** dari refactor `LoginBrandPanel` → `AuthBrandPanel`. Mitigasi: re-run lint/build + visual check `/login` setelah implementasi.
- **Form height** — 4 fields lebih tinggi dari login 2 fields. Di laptop standar (≥768px height) masih fit dengan vertical centering. Kalau tidak, `justify-start` + top padding sebagai fallback.
