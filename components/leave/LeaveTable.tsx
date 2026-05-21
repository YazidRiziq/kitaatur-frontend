import Image from "next/image";
import { Search, Filter, Eye, ChevronLeft, ChevronRight, Check, X } from "lucide-react";

export function LeaveTable() {
  // Simulasi Data Dummy (Berdasarkan HTML Stitch AI)
  const leaveData = [
    { id: 1, name: "Budi Santoso", role: "Senior Developer", type: "Cuti Tahunan", typeColor: "bg-primary", date: "12 Sep - 15 Sep 2024", duration: "4 Hari", status: "Pending", img: "/default_profil.jpg" },
    { id: 2, name: "Siti Aminah", role: "UI/UX Designer", type: "Izin Sakit", typeColor: "bg-error", date: "10 Sep - 11 Sep 2024", duration: "2 Hari", status: "Approved", img: "/default_profil.jpg" },
    { id: 3, name: "Andi Wijaya", role: "HR Administrator", type: "Cuti Penting", typeColor: "bg-tertiary-container", date: "05 Sep - 05 Sep 2024", duration: "1 Hari", status: "Rejected", img: "/default_profil.jpg" },
    { id: 4, name: "Rina Permata", role: "Account Manager", type: "Cuti Melahirkan", typeColor: "bg-primary-container", date: "01 Sep - 01 Des 2024", duration: "90 Hari", status: "Approved", img: "/default_profil.jpg" },
  ];

  // Helper untuk merender style Badge Status
  const renderStatusBadge = (status: string) => {
    if (status === "Pending") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-tertiary-fixed text-on-tertiary-fixed">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
          Pending
        </span>
      );
    } else if (status === "Approved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary-fixed text-on-primary-fixed">
          <Check size={14} strokeWidth={3} />
          Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-error-container text-on-error-container">
          <X size={14} strokeWidth={3} />
          Rejected
        </span>
      );
    }
  };

  return (
    <section className="bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(0,105,72,0.06)] p-2">
      
      {/* Filters & Search */}
      <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline text-sm" placeholder="Cari nama karyawan..." type="text" />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select className="px-4 py-3 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-medium text-on-surface min-w-35">
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="disetujui">Disetujui</option>
            <option value="ditolak">Ditolak</option>
          </select>
          <select className="px-4 py-3 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-medium text-on-surface min-w-40">
            <option value="">Jenis Cuti</option>
            <option value="tahunan">Cuti Tahunan</option>
            <option value="sakit">Izin Sakit</option>
            <option value="melahirkan">Cuti Melahirkan</option>
            <option value="penting">Cuti Penting</option>
          </select>
          <button className="p-3 text-outline hover:text-primary transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-outline text-[11px] uppercase tracking-widest font-bold border-b border-surface-variant/30">
              <th className="px-8 py-4">Karyawan</th>
              <th className="px-6 py-4">Jenis Pengajuan</th>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Durasi</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-8 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant/10">
            {leaveData.map((row) => (
              <tr key={row.id} className="hover:bg-surface-container-low/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 relative rounded-full overflow-hidden bg-surface-container">
                      <Image src={row.img} alt={row.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface text-sm">{row.name}</p>
                      <p className="text-xs text-outline font-medium">{row.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${row.typeColor}`}></span>
                    <span className="text-sm text-on-surface-variant font-medium">{row.type}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">{row.date}</td>
                <td className="px-6 py-5">
                  <span className="inline-flex px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold text-on-surface-variant">
                    {row.duration}
                  </span>
                </td>
                <td className="px-6 py-5">
                  {renderStatusBadge(row.status)}
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 text-outline hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 flex items-center justify-between border-t border-surface-variant/20">
        <p className="text-xs font-medium text-outline">Menampilkan 4 dari 152 data</p>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-on-primary text-xs font-bold">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all text-xs font-bold">2</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all text-xs font-bold">3</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </section>
  );
}