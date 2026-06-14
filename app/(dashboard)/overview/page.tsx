import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Overview — KitaAtur HRIS",
}

export default function OverviewPage() {
  return (
    <div className="p-8">
      <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">
        Overview
      </h1>
      <p className="text-on-surface-variant mb-8">
        Selamat datang di Dashboard KitaAtur. Pantau kehadiran dan pengajuan cuti karyawan Anda.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-emerald-50/20">
          <h3 className="font-headline font-semibold text-on-surface mb-2">
            Data Absensi
          </h3>
          <p className="text-sm text-on-surface-variant">
            Lihat dan pantau data kehadiran karyawan hari ini.
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-emerald-50/20">
          <h3 className="font-headline font-semibold text-on-surface mb-2">
            Pengajuan Cuti
          </h3>
          <p className="text-sm text-on-surface-variant">
            Kelola permohonan cuti dan izin dari karyawan.
          </p>
        </div>
      </div>
    </div>
  )
}