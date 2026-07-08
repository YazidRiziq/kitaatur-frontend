# Grill: Attendance Location Feature (Geofencing)
Date: 2026-07-08

## Intent

User ingin meluncurkan HRIS KitaAtur ke user real (kantor developer perumahan di Padang, 10-15 karyawan, freelance remote owner). MVP = **Attendance + Leave**. Dua-duanya sudah fungsional, tapi user merasa "belum kelar secara detail & UI belum bagus". Setelah dipersempit, fokus pertama = **fitur lokasi absensi** (geofencing): karyawan absen via WA dengan Share Location, sistem validasi apakah mereka di radius yang diizinkan. Ini missing piece terbesar yang membuat absensi "belum siap launch" — saat ini HR dashboard buta terhadap lokasi absen, tidak ada model data lokasi, tidak ada UI untuk atur radius.

## Constraints

- **Scope frontend only.** Validasi WA bot (hitung jarak, tolak/terima absen) = backend NestJS (repo terpisah). Frontend menetapkan kontrak data, backend mengikuti.
- **Backend live & mengikuti permintaan frontend.** Schema DB sudah ada, endpoint akan dibuat sesuai kontrak yang frontend tetapkan.
- **User real = kantor developer perumahan semi-cluster di Padang.** Ada tim kantor (tetap) + tim lapangan (proyek berbeda). 10-15 karyawan, learning curve rendah, saat ini semua via Excel + WhatsApp group.
- **Desktop-first.** Dashboard ≥1024px. Mobile dashboard out of scope.
- **UI copy & error messages dalam Bahasa Indonesia.**
- **MVP = Attendance + Leave.** Payroll, cek payroll via WA, fitur lain = out of scope siklus ini.
- **Settings page belum ada.** Jam masuk + toleransi sudah di-capture saat onboarding (`lib/onboarding/types.ts:15-18`: `workStartTime`, `workEndTime`, `lateThreshold` default 15, `workingDays`, `timezone`) tapi **tidak bisa diedit** setelah onboarding. Settings page perlu dibangun.

## Key Decisions

- **MVP scope = Attendance + Leave.** Reason: owner Padang pain point utama = kedisiplinan (absensi via group WA, cuti via personal chat, data di Excel). Reason rejected: payroll & fitur lain = angan jangka panjang, akan melumpuhkan siklus launch.
- **Fokus development pertama = fitur lokasi absensi (geofencing).** Reason: ini missing piece terbesar — saat ini tidak ada validasi lokasi, HR tidak bisa lihat apakah absen di radius atau di rumah. Alasan rejected: Overview stats (kosong) & Leave UI polish = penting tapi lokasi adalah yang membuat absensi "siap launch".
- **Model lokasi = semi-permanen per karyawan (ops. (a)).** Reason: skala 10-15 orang, paling sederhana, tidak butuh master data `work_locations[]` + scheduling. Tim kantor = pakai default lokasi kantor. Tim lapangan = assigned lokasi semi-permanen yang bisa diedit HR. Jika kosong → fallback ke default kantor. Alternatif rejected: (b) lokasi hanya dicatat tanpa geofence (mengalahkan tujuan kedisiplinan); (c) pilih dari daftar sites saat check-in (butuh master data + UX lebih berat); (d) owner assign site per karyawan per hari (butuh scheduling, terlalu berat untuk MVP).
- **Default radius = 150m, minimum 100m.** Reason: akurasi GPS WhatsApp Share Location sering meleset 50-100m. Radius <100m akan menandai (false-flag) karyawan yang sudah di kantor sebagai "di luar radius" → frustrasi. 150m adalah sweet spot antara disiplin dan toleransi akurasi GPS.
- **Jam masuk + toleransi: data SUDAH ada, hanya belum bisa diedit.** Onboarding sudah capture `workStartTime`/`workEndTime`/`lateThreshold`/`workingDays`/`timezone`. Yang perlu dibangun = **Settings page** untuk edit ini post-onboarding, BUKAN capture ulang. Backend sudah pakai field ini untuk validasi telat.

## Surfaced Assumptions

- User mengira "jam masuk & toleransi belum dibuat" → sebenarnya sudah di-capture di onboarding, hanya tidak ada UI edit (Settings page missing).
- User mengira "banyak fitur untuk dikerjakan" → sebenarnya 6 dari 7 fitur sudah fully built. Kebingungan berasal dari belum dipetakannya done vs belum, bukan dari volume.
- User menyebut "cek payroll via WA" → payroll tidak ada di codebase maupun PRD core features. Hanya angan, tidak akan dibangun siklus ini.
- Backend dianggap "mengikuti frontend" → berarti frontend punya otoritas menetapkan kontrak data. Tapi frontend harus eksplisit request endpoint ke backend team — tidak otomatis.
- Validasi lokasi (hitung jarak haversine, tolak/terima) dianggap "bagian fitur ini" → sebenarnya 100% backend. Frontend hanya: (a) sediakan UI atur lokasi, (b) tampilkan status hasil validasi di tabel.

## Open Questions

- **Akurasi GPS WA vs Telegram:** User sebut "WA atau Telegram Bot". Telegram Share Location punya akurasi berbeda dari WA. Perlu konfirmasi: Telegram in-scope MVP atau WA dulu? (Asumsi sementara: WA dulu, Telegram nanti.)
- **Check-out apakah juga divalidasi lokasi?** Asumsi: ya, aturan sama. Tapi belum dikonfirmasi.
- **Apakah owner bisa lihat peta lokasi absen di dashboard?** Asumsi: cukup status text ("In Radius" / "Out of Range") + koordinat. Peta interaktif = nice-to-have, bukan MVP. Perlu konfirmasi.
- **Karyawan yang tidak punya smartphone dengan GPS:** edge case. Asumsi: out of scope, owner Padang tentukan sendiri siapa yang absen manual.

## Out of Scope

- Payroll (hitung gaji, potongan, PPh, THR) — tidak dibangun siklus ini.
- Cek payroll via WA — tidak dibangun siklus ini.
- Peta interaktif di dashboard (Google Maps embed) — nice-to-have, defer.
- Master data `work_locations[]` dengan banyak situs + pilih saat check-in — upgrade path future, bukan MVP.
- Scheduling penugasan lokasi per hari — terlalu berat untuk MVP.
- Mobile-responsive dashboard — desktop-only per konstitusi.
- Overview page redesign — penting tapi bukan fokus siklus ini (lokasi absensi prioritas lebih tinggi untuk launch).
- Leave UI polish — fokus setelah lokasi absensi selesai.

---

## Development Breakdown: Fitur Lokasi Absensi (Geofencing)

### Konteks singkat

Saat ini `AttendanceRecord` (`lib/attendance/types.ts:1-11`) tidak mengembalikan lokasi/foto ke frontend. Tidak ada model data lokasi kantor. Tidak ada Settings page. Onboarding sudah capture jam kerja + toleransi tapi tidak bisa diedit. Fitur ini menambahkan: (1) model data lokasi, (2) Settings page untuk atur lokasi + jam kerja, (3) status lokasi di tabel absensi.

### A. Kontrak Data Frontend ↔ Backend

Frontend menetapkan kontrak ini, backend NestJS implementasi endpoint-nya.

#### A1. Tambah field ke `DashboardData` (company-level default location)

```typescript
// lib/dashboard/types.ts — tambahkan ke company:
company: {
  id: string
  name: string
  timezone: string
  // BARU:
  defaultLocation: {
    lat: number
    lng: number
    radiusMeters: number  // default 150
  } | null
}
```

Endpoint: backend `/auth/me` perlu return `defaultLocation` di object company. Jika null = belum diset.

#### A2. Work assignment per employee (employee-level override)

```typescript
// lib/employees/types.ts — tambahkan ke Employee:
workLocation: {
  lat: number
  lng: number
  radiusMeters: number
  label: string  // mis. "Proyek Cluster A", "Kantor Pusat"
} | null  // null = pakai company defaultLocation
```

Endpoint: backend `/employees` perlu return `workLocation` per karyawan. Null = fallback ke default kantor.

#### A3. Status lokasi di AttendanceRecord

```typescript
// lib/attendance/types.ts — tambahkan ke AttendanceRecord:
locationStatus: "in_radius" | "out_of_range" | "no_location"
locationLabel?: string  // nama lokasi yang dipakai saat absen
// opsional: distanceMeters?: number
```

Endpoint: backend `/attendances` perlu return `locationStatus` per record. Backend yang hitung jarak haversine & tentukan status — frontend hanya display.

#### A4. Settings endpoints (baru)

```
GET    /settings                → { workStartTime, workEndTime, lateThreshold, workingDays, timezone, defaultLocation }
PATCH  /settings                → update fields above
PATCH  /employees/{id}/work-location → { lat, lng, radiusMeters, label } | null
```

### B. Yang Dibangun di Frontend

#### B1. `lib/settings/` (baru — ikut feature-slice konstitusi)

```
lib/settings/
├── actions.ts    # "use server": getSettings, updateSettings
└── types.ts      # CompanySettings interface
```

#### B2. `app/(dashboard)/settings/page.tsx` (baru)

Page client-component. Dua section:
1. **Jam Kerja & Toleransi** — edit `workStartTime`, `workEndTime`, `lateThreshold`, `workingDays`. Form → `updateSettings()`.
2. **Lokasi Kantor Default** — input alamat/cari peta sederhana (atau input manual lat/lng) + slider radius (100-500m, default 150m). Save → `updateSettings({ defaultLocation })`.

> **Catatan peta:** MVP = input manual lat/lng + preview pin statis (opsional: embed OpenStreetMap static image). Bukan peta interaktif Google Maps (defer).

#### B3. `components/settings/` (baru)

```
components/settings/
├── WorkScheduleForm.tsx       # form jam kerja + toleransi + hari kerja
├── LocationSettingForm.tsx    # form lat/lng/radius default kantor
└── (opsional) LocationPreview.tsx  # static map preview
```

#### B4. Edit work-location per karyawan (di EmployeeDetailSheet)

Tambahkan section "Lokasi Kerja" di `EmployeeDetailSheet.tsx`:
- Jika kosong → tampilkan "Menggunakan lokasi default kantor".
- Tombol "Atur Lokasi Khusus" → form lat/lng/radius/label.
- Tombol "Reset ke Default" → set `workLocation = null`.

#### B5. Status lokasi di tabel absensi

`components/attendance/AttendanceTable.tsx` — tambahkan kolom atau indikator:
- `in_radius` → badge hijau "In Radius" + `locationLabel`
- `out_of_range` → badge merah "Di Luar Radius" + `locationLabel`
- `no_location` → badge abu "Tanpa Lokasi"

`app/(dashboard)/attendance/page.tsx` — opsional: filter berdasarkan `locationStatus`.

#### B6. Middleware: daftarkan `/settings` ke route protected

`middleware.ts:4` — tambahkan `'/settings'` ke `DASHBOARD_ROUTES`. (Sudah ada, tinggal pastikan.)

### C. Task Breakdown (urutan eksekusi)

| # | Task | File | Dep | Paralel? |
|---|------|------|-----|----------|
| T1 | Buat `lib/settings/types.ts` (CompanySettings interface) | `lib/settings/types.ts` | — | [P] |
| T2 | Buat `lib/settings/actions.ts` ("use server": getSettings, updateSettings) | `lib/settings/actions.ts` | — | [P] |
| T3 | Extend `lib/employees/types.ts`: tambah `workLocation` ke Employee | `lib/employees/types.ts` | — | [P] |
| T4 | Extend `lib/attendance/types.ts`: tambah `locationStatus` + `locationLabel` ke AttendanceRecord | `lib/attendance/types.ts` | — | [P] |
| T5 | Extend `lib/dashboard/types.ts`: tambah `defaultLocation` ke company | `lib/dashboard/types.ts` | — | [P] |
| T6 | Buat `components/settings/WorkScheduleForm.tsx` | `components/settings/WorkScheduleForm.tsx` | T1, T2 | [P] |
| T7 | Buat `components/settings/LocationSettingForm.tsx` | `components/settings/LocationSettingForm.tsx` | T1, T2 | [P] |
| T8 | Buat `app/(dashboard)/settings/page.tsx` (gabung T6 + T7) | `app/(dashboard)/settings/page.tsx` | T6, T7 | — |
| T9 | Tambah section "Lokasi Kerja" di `EmployeeDetailSheet.tsx` | `components/employees/EmployeeDetailSheet.tsx` | T3 | [P] |
| T10 | Tambah kolom/indikator `locationStatus` di `AttendanceTable.tsx` | `components/attendance/AttendanceTable.tsx` | T4 | [P] |
| T11 | Tambah filter `locationStatus` di `attendance/page.tsx` (opsional) | `app/(dashboard)/attendance/page.tsx` | T10 | — |
| T12 | Pastikan `/settings` di `DASHBOARD_ROUTES` middleware | `middleware.ts` | — | [P] |
| T13 | Verifikasi: `npm run lint && npm run build` | — | T1-T12 | — |

**Paralel batch 1:** T1, T2, T3, T4, T5, T12 (6 task independen, file berbeda)
**Paralel batch 2:** T6, T7, T9, T10 (4 task, butuh batch 1 selesai)
**Sekuensial:** T8 (butuh T6+T7), T11 (butuh T10), T13 (terakhir)

### D. Catatan Risiko

1. **Akurasi GPS WhatsApp Share Location** sering meleset 50-100m. Default radius 150m wajib, minimum 100m. Jangan turun dari itu atau karyawan yang sudah di kantor akan false-flagged.
2. **Backend dependency:** T1-T5 menetapkan kontrak, tapi T6-T12 butuh backend endpoint live untuk test end-to-end. Selama backend belum implement, frontend bisa mock response di lib/settings/actions.ts (try/catch + fallback) agar UI tetap bisa di-develop & di-preview.
3. **Telegram Share Location** punya akurasi berbeda dari WA. Konfirmasi: Telegram in-scope atau WA dulu? (Asumsi: WA dulu.)
4. **Check-out lokasi:** Asumsi juga divalidasi dengan aturan sama. Konfirmasi backend.
