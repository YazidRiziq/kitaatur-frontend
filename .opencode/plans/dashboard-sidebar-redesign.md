# Plan: Redesign Dashboard Sidebar + Header (Shell)

Date: 2026-07-11
Status: **Plan mode — awaiting build-mode unlock to implement**

## Intent

Redesign sidebar + header (dashboard shell) agar konsisten dengan DESIGN.md (Supabase-inspired) + perbaiki information architecture. Masalah saat ini: flat list 7 item tanpa grouping, Settings double-entry (sidebar + header), Support dead link (404), Sign Out di bottom (bukan user menu), logo masih image placeholder, hardcoded `text-emerald-600`/`text-slate-*`/`dark:bg-slate-900`/old deep-green shadow, Header pakai `<div className="ml-64" />` spacer hack, `font-headline`.

## Decisions (locked via grilling)

1. **Design + UX sekalian.** Sidebar = IA, tidak bisa dipisah.
2. **shadcn Sidebar primitive** (sudah ter-install) dengan `variant="sidebar"` (flush, border-r hairline) + `collapsible="icon"` (collapse ke icon-only via Cmd/Ctrl+B). Dapat mobile Sheet otomatis, cookie state, SidebarProvider/SidebarInset pattern yang bersih dari hack `ml-64`.
3. **Settings + Sign Out → user menu** (avatar DropdownMenu di Header). Sidebar jadi 6 item nav + 2 section labels. Hapus double-entry Settings, hapus dead /support link.
4. **Scope = shell only.** Sidebar + Header + layout.tsx + user menu. Tidak sentuh isi page (attendance/employees/dll). Page tidak perlu adjust karena hanya render content di dalam `<main>`.
5. **Nav grouping**:
   - **Utama**: Overview, Data Absensi, Pengajuan Cuti (operasional harian)
   - **Karyawan**: Karyawan, Departemen, Jabatan (manajemen data orang)
6. **Logo = text "KitaAtur" + dot emerald** (bukan image placeholder).
7. **Header jadi non-fixed**, in-flow di SidebarInset. SidebarTrigger kiri, user menu kanan. Hapus Bell (dead UI — no notification system), hapus Settings icon (moved to user menu), hapus status dot (dead), hapus `ml-64` spacer, hapus `bg-white/80 backdrop-blur`.

## Token fix

`app/globals.css` — satu perubahan:
- `--sidebar-accent: #fafafa` → `#ededed` (hairline-cool dari DESIGN.md grey ladder)

Saat ini `--sidebar` dan `--sidebar-accent` sama-sama `#fafafa` — active state tak terlihat. Dengan `#ededed`, hover/active di sidebar (#fafafa) jadi terlihat (subtle tapi clear). Semua token sidebar lain sudah benar dari login redesign.

## File changes (6)

### 1. `app/globals.css` — fix `--sidebar-accent`
```
--sidebar-accent: #ededed;  /* dari #fafafa */
```

### 2. `components/layout/AppSidebar.tsx` (NEW, client component)
Struktur:
```
<Sidebar collapsible="icon" variant="sidebar">
  <SidebarHeader>
    "KitaAtur" + dot emerald (Link ke /overview)
  </SidebarHeader>
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Utama</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          Overview, Data Absensi, Pengajuan Cuti
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
    <SidebarGroup>
      <SidebarGroupLabel>Karyawan</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          Karyawan, Departemen, Jabatan
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
</Sidebar>
```
- `SidebarMenuButton` dengan `asChild` wrapping `<Link>`, `isActive={pathname === href}`.
- `tooltip={item.name}` (shows when collapsed to icon mode).
- Icons: LayoutDashboard, CalendarDays, Users (cuti), UserPlus (karyawan), FolderTree, Briefcase — dari lucide.
- `usePathname` untuk active state.
- Tidak ada footer (settings/signout pindah ke user menu).

### 3. `components/layout/Header.tsx` (REWRITE, client component)
Struktur:
```
<header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
  <SidebarTrigger />
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="text-left">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-muted-foreground">{userRole}</p>
        </div>
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>{userName}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/settings"><SettingsIcon /> Pengaturan</Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" onSelect={() => signOutAction()}>
        <LogOutIcon /> Keluar
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</header>
```
- Non-fixed, in-flow (di dalam SidebarInset).
- `SidebarTrigger` kiri (toggle sidebar collapse).
- User menu kanan (avatar + nama + role + chevron).
- Hapus: Bell (dead), Settings icon (moved), `ml-64` spacer, `bg-white/80 backdrop-blur`, status dot, `font-headline`.
- Props: `userName`, `userRole`, `userAvatarUrl` (sama seperti sekarang, dari layout.tsx).
- Avatar: jika `userAvatarUrl` pakai `AvatarImage`, else `AvatarFallback` dengan initials.

### 4. `app/(dashboard)/layout.tsx` (REWRITE, server component)
```
<DashboardProvider data={data}>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <Header userName={data.user.name} userRole={data.user.role} userAvatarUrl={...} />
      <main className="flex-1 p-6">
        {children}
      </main>
    </SidebarInset>
  </SidebarProvider>
</DashboardProvider>
```
- Hapus `<div className="flex min-h-screen bg-surface">` + `<Sidebar />` + `<Header ... />` + `<main className="flex-1 ml-64 mt-20">`.
- Ganti dengan SidebarProvider pattern.
- `bg-surface` di wrapper → hilang (SidebarInset sudah `bg-background`).
- `main` padding: `p-6` (24px — spacing.xl dari DESIGN.md).

### 5. `components/layout/Sidebar.tsx` (DELETE)
Diganti AppSidebar. Hanya di-import oleh `app/(dashboard)/layout.tsx`.

### 6. `components/layout/SidebarItem.tsx` (DELETE)
Diganti SidebarMenuButton. Hanya di-import oleh Sidebar.tsx (yang juga dihapus).

## shadcn primitives (semua sudah ter-install)
Sidebar: `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarTrigger`, `SidebarInset`.
DropdownMenu: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuLabel`, `DropdownMenuItem`, `DropdownMenuSeparator`.
Avatar: `Avatar`, `AvatarImage`, `AvatarFallback`.
Tidak ada komponen baru yang perlu di-add.

## Old design — replace/delete
- `Sidebar.tsx`: `text-emerald-600`, `dark:bg-slate-900`, `text-slate-400`, `shadow-[12px_0_40px_rgba(0,105,72,0.06)]`, `border-slate-100`, `font-headline`, `/hris_logo.jpg` image, `dark:` utilities → DELETE file.
- `SidebarItem.tsx`: `text-slate-500`, `text-emerald-600`, `bg-emerald-50`, `border-emerald-600`, `dark:`, `font-headline` → DELETE file.
- `Header.tsx`: `bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl`, `text-slate-500`, `bg-emerald-500`, `font-headline`, `<div className="ml-64" />`, Bell, Settings icon, status dot → REWRITE.

## Verification
`npm run lint && npm run build`, lalu `npm run dev`:
- Login (`/login`) tidak terdampak (bukan dashboard).
- Dashboard (`/overview`) → sidebar tampil, 2 group, 6 item, border-r hairline, text logo.
- Collapse: tekan Cmd/Ctrl+B → sidebar collapse ke icon, label hidden, tooltip show.
- User menu: klik avatar → dropdown dengan Pengaturan + Keluar.
- Sign Out: klik Keluar → redirect `/login`.
- Settings: klik Pengaturan → `/settings`.
- `/register` tidak terdampak.

## Out of scope
- Isi page dashboard (attendance, employees, leave, dll.) — hanya shell.
- Notifikasi/Bell (dead UI, removed).
- Dark mode (dormant, untouched).
- Dashboard Material-3 token migration.
- Content area padding/spacing per-page (page mungkin punya padding-nya sendiri, tidak diubah).

## Risks
- **Page padding assumption**: current `main` has `ml-64 mt-20`, pages might implicitly rely on this. Mitigasi: page hanya render content di dalam main, tidak ada positioning assumption (verified dari overview page — pure content).
- **`bg-surface` removal**: current wrapper `bg-surface` (Material-3 token). SidebarInset pakai `bg-background` (#ffffff). Page background berubah dari `#f6fafe` (surface) ke `#ffffff` (canvas). Semua page sudah pakai `bg-surface-container-lowest` (#ffffff) untuk card-nya, jadi hanya body bg berubah — tidak break card contrast.
- **Server action in DropdownMenuItem onSelect**: `signOutAction` adalah "use server" function. Dipanggil dari client `onSelect` — pattern sama dengan current Sidebar `onClick`. Should work.
