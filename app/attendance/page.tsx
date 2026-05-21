import { Download, UserCheck, ClockAlert, LogOut } from "lucide-react";
import { AttendanceStatCard } from "@/components/attendance/AttendanceStatCard";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";

export default function AttendancePage() {
  return (
    <div className="pl-8 pr-8 flex-1">
      
      {/* 1. Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline tracking-tight text-3xl font-bold text-on-surface">Data Absensi</h2>
          <p className="text-on-surface-variant mt-1">Kelola dan pantau kehadiran seluruh departemen hari ini.</p>
        </div>
        <button className="bg-primary text-white px-6 py-2.5 rounded-3xl font-semibold shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95">
          <Download size={20} />
          Export Report
        </button>
      </div>

      {/* 2. Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <AttendanceStatCard 
          title="Total Hadir" 
          value={42} 
          subValue="/ 50 Karyawan" 
          subtitle="Karyawan hadir hari ini" 
          icon={UserCheck} 
          variant="primary" 
        />
        <AttendanceStatCard 
          title="Terlambat" 
          value={5} 
          subtitle="Butuh perhatian" 
          icon={ClockAlert} 
          variant="error" 
        />
        <AttendanceStatCard 
          title="Belum Check-Out" 
          value={12} 
          subtitle="Masih bekerja" 
          icon={LogOut} 
          variant="tertiary" 
        />
      </div>

      {/* 3. Area Konten Utama (Hanya Tabel) */}
      <div className="flex flex-col gap-8">
        <AttendanceTable />
      </div>

    </div>
  );
}