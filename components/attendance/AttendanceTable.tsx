import Image from "next/image";
import { Search, Calendar, Eye } from "lucide-react";

export function AttendanceTable() {
  // Simulasi Data Dummy dengan path gambar lokal
  const attendanceData = [
    {
      id: 1,
      name: "Adrian Wijaya",
      role: "Senior Developer",
      date: "24 Oct 2023",
      checkIn: "08:15 AM",
      checkOut: "05:30 PM",
      status: "Tepat Waktu",
      img: "/default_profil.jpg",
    },
    {
      id: 2,
      name: "Siska Maharani",
      role: "UI/UX Designer",
      date: "24 Oct 2023",
      checkIn: "08:45 AM",
      checkOut: "-",
      status: "Terlambat",
      img: "/default_profil.jpg",
    },
    {
      id: 3,
      name: "Bambang Sutedjo",
      role: "HR Manager",
      date: "24 Oct 2023",
      checkIn: "07:55 AM",
      checkOut: "05:00 PM",
      status: "Tepat Waktu",
      img: "/default_profil.jpg",
    },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Bagian Filter */}
      <div className="bg-surface-container-lowest p-4 rounded-3xl shadow-sm flex flex-wrap items-center gap-4 border border-emerald-50/20">
        <div className="flex-1 min-w-50 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="w-full bg-surface-container-low border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
            placeholder="Cari karyawan..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-surface-container-low border-none rounded-2xl py-2.5 px-4 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer">
            <option>Semua Departemen</option>
          </select>
          <div className="bg-surface-container-low px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <Calendar size={18} className="text-primary" />
            <span className="text-sm font-medium">24 Oct 2023</span>
          </div>
        </div>
      </div>

      {/* Bagian Tabel */}
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm overflow-hidden border border-emerald-50/20">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase">
                Profil Karyawan
              </th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase text-center">
                Check-In
              </th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase text-center">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {attendanceData.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-emerald-50/30 transition-colors"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 relative rounded-xl overflow-hidden bg-surface-container">
                      {/* Pastikan file default_profil.jpg ada di folder public/ */}
                      <Image
                        src={row.img}
                        alt={row.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        {row.name}
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        {row.role}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-center font-medium">
                  <span
                    className={
                      row.status === "Terlambat" ? "text-error font-bold" : ""
                    }
                  >
                    {row.checkIn}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${
                      row.status === "Terlambat"
                        ? "bg-red-100 text-red-600"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 text-primary hover:bg-emerald-100 rounded-lg transition-all">
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
