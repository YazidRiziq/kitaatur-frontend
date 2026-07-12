# Plan: Redesign Halaman Data Absensi (Dual View + Server-First)

Date: 2026-07-12
Status: **Plan mode — menunggu build-mode untuk eksekusi**

## Intent

Redesign halaman Data Absensi agar bukan cuma snapshot harian, tapi juga bisa jawab pertanyaan "siapa bermasalah dari waktu ke waktu." Owner (10-15 karyawan, pain point = disiplin) butuh dua hal: cek siapa hadir hari ini (operasional) + lihat siapa telat/keluar radius minggu ini (disiplin). Saat ini cuma ada yang pertama, dan itu masih "use client" dengan manual useEffect (melanggar konsep Server First).

## Decisions (locked via grilling)

1. **Dual view** — "Hari Ini" (snapshot) + "Tren" (discipline over time) via Tabs yang update URL `?view=snapshot|trend`.
2. **Server-first refactor** — `page.tsx` jadi server component, baca `searchParams` (Promise di Next.js 16), fetch data di server, pass sebagai props. Filter pakai `<Form>` dari `next/form` (progressive enhancement + client-side navigation). Hapus semua manual useEffect/useRef/fetch orchestration.
3. **Tren = hybrid** — 3 stat cards (team hadir-rate %, total telat minggu ini, total di-luar-radius minggu ini) + per-employee table (nama, hadir count, telat count, di-luar-radius count, 7-day status dots). Sortable by worst discipline.
4. **Default range Tren = minggu ini** (Senin–Minggu). Range selector: "Minggu Ini" / "30 Hari" / custom range. Backend contract: `GET /attendances/trend?start=&end=&department_id=`.
5. **Backend gap: define contract + mock** — frontend tetapkan kontrak data trend, mock di `actions.ts` (try/catch fallback), works end-to-end saat backend implement. Sama seperti pattern geofencing grill log.
6. **Hapus tombol eye** — baris tabel = detail view. Nanti tambah ikon MapPin saat mini-map siap (backend kirim koordinat).
7. **Export tetap di snapshot view** — export harian (existing endpoint). Export tren = defer (butuh backend endpoint berbeda).

## Arsitektur server-first

```
URL: /attendance?view=snapshot&date=2026-07-12&search=...&department=...&page=1
URL: /attendance?view=trend&start=2026-07-07&end=2026-07-13&department=...
```

```
app/(dashboard)/attendance/page.tsx     ← SERVER COMPONENT (async, baca searchParams)
  ├── components/attendance/AttendanceViewTabs.tsx    ← CLIENT (Tabs → update URL)
  ├── IF view=snapshot:
  │     ├── AttendanceFilters.tsx       ← CLIENT (Form next/form, filter snapshot)
  │     ├── AttendanceStatCards.tsx      ← SERVER (3 stat cards, data dari props)
  │     └── AttendanceTable.tsx          ← SERVER (shadcn Table, data dari props)
  └── IF view=trend:
        ├── AttendanceTrendFilters.tsx   ← CLIENT (Form next/form, range selector)
        ├── AttendanceTrendStats.tsx     ← SERVER (3 trend stat cards)
        └── AttendanceTrendTable.tsx     ← SERVER (per-employee table + 7-day dots)
```

## Backend contract (baru — untuk Tren view)

### `GET /attendances/trend?start=YYYY-MM-DD&end=YYYY-MM-DD&department_id=`

Response:
```typescript
interface AttendanceTrendResponse {
  range: { start: string; end: string }
  summary: {
    hadirRate: number        // 0-100, persentase kehadiran tim
    totalTelat: number       // total keterlambatan dalam range
    totalOutOfRange: number  // total absen di luar radius dalam range
  }
  employees: AttendanceEmployeeTrend[]
}

interface AttendanceEmployeeTrend {
  employeeId: string
  name: string
  position: string
  avatarUrl: string | null
  hadirCount: number         // hari hadir dalam range
  totalDays: number          // total hari kerja dalam range
  hadirRate: number          // 0-100
  telatCount: number
  outOfRangeCount: number
  dailyStatus: Array<{        // per hari dalam range
    date: string
    status: "tepat_waktu" | "terlambat" | "di_luar_radius" | "tidak_hadir" | null
    checkIn: string | null
    checkOut: string | null
  }>
}
```

Mock di `lib/attendance/actions.ts`: return data dummy berdasarkan range, try/catch fallback. Saat backend implement, tinggal ganti mock ke fetch asli.

## File changes (9)

### 1. `lib/attendance/types.ts` (EXTEND)
Tambah: `AttendanceTrendResponse`, `AttendanceEmployeeTrend`, `AttendanceTrendFilters`.

### 2. `lib/attendance/actions.ts` (EXTEND)
Tambah: `getAttendanceTrend(filters)` — server action, fetch ke backend (atau mock fallback). Mock return 5-6 karyawan dummy dengan daily status array.

### 3. `app/(dashboard)/attendance/page.tsx` (REWRITE — server component)
- `async function`, `await searchParams`
- Parse: `view` (default "snapshot"), `date` (default today), `search`, `department`, `page`, `start`, `end`
- Fetch data di server: `getAttendanceStats`, `getAttendances` (snapshot) atau `getAttendanceTrend` (trend)
- Fetch departments di server: `getDepartments`
- Render: page header + AttendanceViewTabs + conditional view

### 4. `components/attendance/AttendanceViewTabs.tsx` (NEW — client)
- shadcn `Tabs` dengan `TabsTrigger` yang pakai `asChild` + `<Link>` update URL
- 2 tab: "Hari Ini" (`?view=snapshot`) + "Tren" (`?view=trend`)
- Preserves existing searchParams saat switch tab

### 5. `components/attendance/AttendanceFilters.tsx` (NEW — client)
- `<Form action="/attendance">` dari `next/form`
- Hidden input `view=snapshot`
- shadcn `Input` (search, name="search"), `Select` (department, name="department"), `Input type=date` (name="date")
- Auto-submit on change (department, date) via `onChange` + form.requestSubmit()
- Search: submit on enter (progressive enhancement)

### 6. `components/attendance/AttendanceStatCard.tsx` (REWRITE)
- Ganti Material-3 tokens → semantic shadcn (`bg-card`, `text-foreground`, `text-muted-foreground`, dll)
- Ganti hardcoded colors (`border-emerald-50/50`, `text-error`, `text-tertiary`) → semantic
- Ganti `font-headline` → default (Inter)
- Ganti `rounded-3xl` → `rounded-lg` (12px, DESIGN.md)
- Hapus blur blob decoration (melanggar DESIGN.md restraint)
- Varian: `primary` → `default` (emerald accent), `error` → `destructive`, `tertiary` → `secondary`

### 7. `components/attendance/AttendanceTable.tsx` (REWRITE)
- shadcn `Table`, `TableHeader`, `TableRow`, `TableCell`, dll
- shadcn `Badge` untuk status (Tepat Waktu = default/secondary, Terlambat = destructive)
- shadcn `Badge` untuk location (In Radius = default, Di Luar Radius = destructive, Tanpa Lokasi = secondary)
- shadcn `Avatar`/`AvatarFallback` untuk profil
- Hapus kolom "Aksi" (eye button)
- Hapus hardcoded `bg-emerald-100 text-emerald-700`, `bg-red-100 text-red-600`, `text-slate-*`
- shadcn `Skeleton` untuk loading rows
- shadcn `Empty` untuk empty state
- Pagination: shadcn `Pagination` atau `<Link>` based (server-first, URL `?page=N`)

### 8. `components/attendance/AttendanceTrendStats.tsx` (NEW)
- 3 stat cards: Hadir Rate (%), Total Telat, Total Di Luar Radius
- Sama struktur dengan AttendanceStatCard tapi data trend (weekly, bukan daily)

### 9. `components/attendance/AttendanceTrendTable.tsx` (NEW)
- shadcn `Table` dengan rows per-employee
- Kolom: Karyawan (avatar+name+position), Hadir (count/total), Telat (count), Di Luar Radius (count), 7-Day Dots
- **7-Day Dots**: signature visual element — row of small colored circles per hari (hijau=tepat waktu, amber=telat, merah=di luar radius, abu=tidak hadir). Pakai plain div dengan `bg-*` semantic. Scannable: owner lihat pola warna per karyawan, langsung tau siapa bermasalah.
- Sortable: default sort by telatCount descending (worst discipline first)

## shadcn primitives (semua sudah ter-install)
Table, Badge, Avatar, Button, Input, Select, Tabs, Pagination, Skeleton, Empty, Separator, Card. Tidak ada komponen baru yang perlu di-add.

## Old design — replace
- `font-headline` → Inter (default font)
- `text-on-surface`, `text-on-surface-variant`, `text-outline`, `text-error` → `text-foreground`, `text-muted-foreground`, `text-destructive`
- `bg-surface-container-lowest`, `bg-surface-container-low`, `bg-surface-container` → `bg-card`, `bg-muted`
- `border-emerald-50/20`, `border-emerald-50/50` → `border-border`
- `bg-emerald-100 text-emerald-700`, `bg-red-100 text-red-600` → `Badge variant`
- `text-slate-300`, `text-slate-400` → `text-muted-foreground`
- `rounded-3xl`, `rounded-2xl`, `rounded-xl` → `rounded-lg` (12px)
- `shadow-lg shadow-primary/20` → hapus (DESIGN.md: surface lift, bukan shadow)
- Custom `<input>`, `<select>`, `<table>` → shadcn primitives
- Custom skeleton rows → shadcn `Skeleton`
- Custom empty state → shadcn `Empty`
- Custom pagination → shadcn `Pagination` atau `<Link>` based
- Blur blob di stat card → hapus (restraint)

## Verification
`npm run lint && npm run build`, lalu `npm run dev`:
- `/attendance` (default snapshot) → tabel harian, 3 stat cards, filter bar, pagination
- `/attendance?view=trend` → 3 trend stats + per-employee table + 7-day dots
- Switch tab → URL update, no full reload (client-side navigation)
- Filter (search, department, date) → URL update, server re-fetch
- Range selector (tren) → URL update (start/end), server re-fetch
- `/login`, `/register`, `/overview` tidak terdampak

## Out of scope
- Mini-map di detail absensi (defer sampai backend kirim koordinat)
- Export trend (defer, butuh backend endpoint berbeda)
- Overview page redesign
- Halaman dashboard lain (employees, leave, dll)
- Dark mode

## Risks
- **`<Form>` auto-submit on change**: butuh client JS. Progressive enhancement: tanpa JS, filter masih works via submit button. Tapi UX optimal butuh JS. Acceptable untuk internal HR tool.
- **7-day dots di collapsed sidebar**: tidak relevan (dots ada di tabel, bukan sidebar).
- **Mock data fallback**: kalau backend belum ready, trend view tampil dengan mock data. Perlu clear indicator bahwa data adalah mock (atau tidak — internal tool, owner tau). Rekomendasi: tidak perlu indicator, tinggal ganti saat backend ready.
- **Tabs + searchParams preservation**: saat switch tab, search dan department harus preserve. Tapi date (snapshot) vs start/end (trend) berbeda. Solusi: switch tab preserve search + department, reset date/range ke default.
