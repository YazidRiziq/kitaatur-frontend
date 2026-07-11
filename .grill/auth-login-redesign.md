# Grill: Auth Login Redesign
Date: 2026-07-11

## Intent

User ingin redesign UI KitaAtur (HRIS frontend) agar lebih bagus, rapi, konsisten. Mulai dari **Login** saja, jangan sentuh bagian lain. User bukan ahli frontend tapi tahu design jelek vs bagus; andalkan shadcn/ui + variant. Acuan: `DESIGN.md` (Supabase-inspired — white canvas, single emerald `#3ecf8e` primary dengan teks near-black, Inter single-family weight 500 display + negative tracking, 6px button radius, surface-lift via shadow, composited product-UI mockups sebagai signature). Komplain utama: bagian Auth "kayak hampa gitu". Konsep project: Server First, tampilan laptop diutamakan.

## Constraints

- **Scope = `/login` saja.** Register, onboarding, dashboard, attendance, leave tidak disentuh. Pengecualian: file shared (`globals.css`, `app/layout.tsx`, `app/(auth)/layout.tsx`) wajib diubah karena token/font/layout auth.
- **Global token shift diterima.** Mengubah `:root` di `globals.css` + font di `app/layout.tsx` menggeser dashboard (primary deep-green `#006948` → emerald `#3ecf8e`; Plus Jakarta → Inter). User menerima; dashboard tidak di-edit, hanya terimbas via shared token.
- **DESIGN.md acuan.** Token warna/radius/tipografi diterapkan ke `globals.css` (CSS variable shadcn). Prinsip: satu emerald sebagai event kromatik tunggal, canvas putih non-negotiable, radius 6px button, mockup produk sebagai signature.
- **Server First / desktop-first.** Laptop prioritas; mobile tidak boleh pecah tapi bukan fokus.
- **shadcn/ui wajib.** Pakai komponen + variant yang sudah ter-install (60 primitif). Untuk login semua primitif sudah ada.
- **Bahasa Indonesia** untuk UI copy auth.
- **Field form = email + password + submit saja.** Tidak ada forgot-password / remember-me (tidak ada backing).

## Key decisions

- **DESIGN.md diterapkan global, bukan auth-scoped.** Reason: user menerima dashboard shift; satu fondasi konsisten lebih sehat daripada dua design system berdampingan. Rejected: scoped `.auth-scope` (dua sistem coexist, fragile).
- **Komposisi = split-screen: brand panel gelap `canvas-night` kiri + form putih kanan.** Reason: user explicitly tidak mau "hampa"; split-screen memberi substansi via mockup. `canvas-night` adalah surface terdokumentasi untuk "dashboard mockups". Rejected: centered card + floating mockup (kurang substantial); clean centered minimal (terlalu hampa).
- **Shared `(auth)/layout.tsx` di-slim jadi bare wrapper.** Reason: split-screen perlu full-height; logo parent akan ganda dengan brand panel login. Konsekuensi: register & onboarding kehilangan auto-logo (tetap fungsional, bare sementara). Rejected: nested `login/layout.tsx` (parent logo tetap render di atas split-screen → rusak).
- **Font = Inter single-family (drop `Plus_Jakarta_Sans`).** Reason: DESIGN.md eksplisit single-family; "don't pair display + body". `--font-headline` var di-keep (di-point ke Inter) supaya utility `font-headline` dashboard tidak break. Rejected: keep Plus Jakarta (melanggar DESIGN.md).
- **`--primary-foreground` = near-black `#171717` (bukan putih).** Reason: DESIGN.md idiosyncratic — emerald button = "lit surface" dengan dark type. Beda dari default shadcn (white-on-primary).
- **Radius 6px via `className="rounded-sm"` di komponen login, BUKAN edit base `button.tsx`/`input.tsx`.** Reason: jaga shared component; dashboard button tetap radius-nya. Rejected: edit base (paksa semua dashboard button ke 6px — blast radius besar).
- **Field terbatas, tanpa affordance tanpa backing.** Reason: forgot-password 404, remember-me tanpa backend. "Not empty" diatasi via brand panel. Rejected: dead link (UX buruk).
- **Mockup di brand panel pakai plain markup + dark palette eksplisit, BUKAN shadcn Table/Badge/Avatar.** Reason: shadcn primitives pakai semantic token (light) — di-render di dalam panel gelap akan jadi light-on-light/muddy. Mockup = illustrasi statis (Supabase render sebagai screenshot), plain markup dengan palette `canvas-night` adalah pilihan disiplin. Rejected: paksa shadcn Table di dark surface (hasil muddy, melawan maksud signature).

## Surfaced assumptions

- "Jangan ubah struktur komponen, cuma sesuaikan token" vs "auth jangan hampa" bertabrakan: "hampa" = masalah komposisi, bukan token. Rule "no structure change" dilonggarkan untuk auth.
- User mengira Material-3 tokens di `globals.css` = cruft → ternyata **aktif dipakai dashboard** (100+ referensi: `surface-container-lowest`, `on-surface`, `outline`, `tertiary-fixed`, dll). Tidak boleh dihapus; migrasi = task terpisah.
- `.wavy-bg` = **zero references** (dead code). Aman dihapus.
- `.dark` block + utility `dark:` di primitif = **dormant** (tidak ada class `dark` di `<html>`/`<body>`). Harmless. Keputusan dark-mode future.
- DESIGN.md pertama (HashiCorp dark marketing) diganti user dengan Supabase-inspired karena sadar kurang fit untuk HRIS light-mode in-product.

## Open questions

- **Dark mode apakah pernah dimaksudkan?** `.dark` block ada tapi tidak pernah aktif. Defer.
- **Migrasi Material-3 token → shadcn semantic di dashboard** — kapan? Future task.

## Out of scope

- Register form, onboarding, dashboard, semua feature area selain `/login`.
- Forgot-password route & remember-me.
- Menghapus utility `dark:` dormant app-wide.
- Membersihkan hardcoded color cruft dashboard (`text-emerald-600`, `bg-emerald-50`, `text-slate-*`).
- Migrasi dashboard Material-3 token → shadcn semantic token.
