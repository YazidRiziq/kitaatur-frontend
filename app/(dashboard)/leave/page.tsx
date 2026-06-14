import { Download, Plus, Clock, TrendingUp, CheckCircle, CheckSquare, CalendarOff, Users } from "lucide-react";
import { LeaveStatCard } from "@/components/leave/LeaveStatCard";
import { LeaveTable } from "@/components/leave/LeaveTable";

export default function LeavePage() {
  return (
    <div className="max-w-360 mx-auto p-8">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-2">Pengajuan Cuti</h1>
          <p className="text-on-surface-variant font-body max-w-lg">
            Tinjau dan kelola permohonan cuti, izin, dan sakit karyawan secara efisien dalam satu dasbor terpadu.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3 border border-outline-variant/30 text-primary font-semibold rounded-3xl bg-surface-container-lowest hover:bg-surface-container transition-all shadow-[0_12px_40px_rgba(0,105,72,0.06)]">
            <Download size={20} />
            <span>Export Report</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-3xl hover:bg-primary-container transition-all shadow-[0_12px_40px_rgba(0,105,72,0.06)]">
            <Plus size={20} />
            <span>Buat Pengajuan Baru</span>
          </button>
        </div>
      </header>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <LeaveStatCard 
          title="Menunggu Persetujuan"
          value="14"
          icon={Clock}
          trendIcon={TrendingUp}
          trendText="+3 permohonan baru hari ini"
          variant="tertiary"
        />
        <LeaveStatCard 
          title="Cuti Disetujui"
          value="128"
          icon={CheckCircle}
          trendIcon={CheckSquare}
          trendText="Bulan ini: 42 permohonan"
          variant="primary"
        />
        <LeaveStatCard 
          title="Karyawan Cuti Hari Ini"
          value="08"
          icon={CalendarOff}
          trendIcon={Users}
          trendText="5 Cuti Tahunan, 3 Izin Sakit"
          variant="secondary"
        />
      </section>

      {/* Table Section */}
      <LeaveTable />

    </div>
  );
}