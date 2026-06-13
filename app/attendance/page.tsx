"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Download,
  UserCheck,
  ClockAlert,
  LogOut,
  Search,
  Loader2,
} from "lucide-react";
import { AttendanceStatCard } from "@/components/attendance/AttendanceStatCard";
import {
  AttendanceTable,
  type AttendanceRecord,
  type AttendancePagination,
} from "@/components/attendance/AttendanceTable";

interface Department {
  id: string;
  name: string;
}

interface AttendanceStats {
  hadir: number;
  total: number;
  terlambat: number;
  belumCheckOut: number;
}

function formatDateToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getToday(): string {
  return formatDateToYYYYMMDD(new Date());
}

// Pintu Masuk Utama halaman absensi KitaAtur.com, Mulai dari sini ke bawah adalah isi dari halamannya.
export default function AttendancePage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // State untuk menyimpan nilai filter dan pencarian yang dipilih user
  const [date, setDate] = useState<string>(getToday());
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [pagination, setPagination] = useState<AttendancePagination | null>(
    null
  );
  const [loadingTable, setLoadingTable] = useState<boolean>(true);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  /*
    Ref untuk menyimpan timer debounce, biar bisa dibersihin kalo user terus ngetik
    Sangat berguna buat ngatur jeda waktu pencarian nanti
  */
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
    Debounce search input, kode ini menahan pencarian selama 300 milidetik.
    Jadi sistem akan nunggu sampai kamu berhenti ngetik sejenak, baru deh teksnya disimpan
    ke laci debouncedSearch buat dikirim ke server.
  */
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [search]);

  /*
    Ini adalah robot otomatis (useEffect) yang cuma jalan satu kali saat halaman
    pertama kali dibuka. Tugasnya nelpon server (fetch) ke alamat /departments buat
    minta daftar divisi (misal: HR, IT, Finance). Kalau datanya udah dapet, dimasukin
    ke laci setDepartments. AbortController di sini fungsinya seperti "tombol batal" 
    misal tiba-tiba internet putus.
  */
  useEffect(() => {
    if (!baseUrl) return;
    const controller = new AbortController();
    fetch(`${baseUrl}/departments`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: Department[]) => setDepartments(data))
      .catch(() => {});
    return () => controller.abort();
  }, [baseUrl]);

  /*
    Fungsi ini buat ngambil data statistik absensi berdasarkan tanggal yang dipilih.
    Mirip kayak yang di atas, tapi ini bisa dipanggil ulang setiap kali tanggalnya berubah.
  */
  const fetchStats = useCallback(() => {
    if (!baseUrl) return;
    setLoadingStats(true);
    const controller = new AbortController();
    fetch(`${baseUrl}/attendances/stats?date=${date}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: AttendanceStats) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
    return () => controller.abort();
  }, [baseUrl, date]);

  // Panggil fungsi fetchStats setiap kali tanggal berubah, biar statistiknya selalu update
  useEffect(() => {
    const cleanup = fetchStats();
    return () => cleanup?.();
  }, [fetchStats]);

  /*
    Fungsi ini buat ngambil data absensi karyawan berdasarkan filter yang
    dipilih (tanggal, pencarian, department, halaman)
  */
  const fetchAttendances = useCallback(() => {
    if (!baseUrl) return;
    setLoadingTable(true);
    const params = new URLSearchParams();
    params.set("date", date);
    params.set("page", String(page));
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (departmentId) params.set("department_id", departmentId);

    const controller = new AbortController();
    fetch(`${baseUrl}/attendances?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then(
        (data: {
          data: AttendanceRecord[];
          pagination: AttendancePagination;
        }) => {
          setAttendances(data.data);
          setPagination(data.pagination);
        }
      )
      .catch(() => {
        setAttendances([]);
        setPagination(null);
      })
      .finally(() => setLoadingTable(false));
    return () => controller.abort();
  }, [baseUrl, date, page, debouncedSearch, departmentId]);

  /*
    Panggil fungsi fetchAttendances setiap kali filter atau halaman berubah,
    biar datanya selalu sesuai dengan pilihan user
  */
  useEffect(() => {
    const cleanup = fetchAttendances();
    return () => cleanup?.();
  }, [fetchAttendances]);

  // Reset halaman ke 1 setiap kali filter pencarian, department, atau tanggal berubah
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, departmentId, date]);

  // Fungsi ini buat nge-handle proses export data absensi ke Excel
  const handleExport = async () => {
    if (!baseUrl) return;
    setExporting(true);
    setExportError(null);
    try {
      const params = new URLSearchParams();
      params.set("date", date);
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (departmentId) params.set("department_id", departmentId);

      const res = await fetch(
        `${baseUrl}/attendances/export?${params.toString()}`
      );
      if (!res.ok) throw new Error("Export failed");

      const disposition = res.headers.get("Content-Disposition");
      let filename = "attendance-report.xlsx";
      if (disposition) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, "");
        }
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Gagal mengekspor laporan. Silakan coba lagi.");
    } finally {
      setExporting(false);
    }
  };

  // Fungsi ini buat nge-handle saat user klik tombol "View Detail" di tabel absensi
  const handleViewDetail = (id: string) => {
    console.log("View detail for attendance:", id);
  };

  return (
    <div className="pl-8 pr-8 flex-1">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline tracking-tight text-3xl font-bold text-on-surface">
            Data Absensi
          </h2>
          <p className="text-on-surface-variant mt-1">
            Kelola dan pantau kehadiran seluruh departemen hari ini.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {exportError && (
            <span className="text-xs text-error font-medium">{exportError}</span>
          )}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-primary text-white px-6 py-2.5 rounded-3xl font-semibold shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Download size={20} />
            )}
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <AttendanceStatCard
          title="Total Hadir"
          value={loadingStats ? "..." : stats?.hadir ?? "-"}
          subValue={
            loadingStats
              ? undefined
              : stats
                ? `/ ${stats.total} Karyawan`
                : undefined
          }
          subtitle={
            loadingStats
              ? "Memuat..."
              : stats
                ? "Karyawan hadir hari ini"
                : "Gagal memuat data"
          }
          icon={UserCheck}
          variant="primary"
        />
        <AttendanceStatCard
          title="Terlambat"
          value={loadingStats ? "..." : stats?.terlambat ?? "-"}
          subtitle={loadingStats ? "Memuat..." : "Butuh perhatian"}
          icon={ClockAlert}
          variant="error"
        />
        <AttendanceStatCard
          title="Belum Check-Out"
          value={loadingStats ? "..." : stats?.belumCheckOut ?? "-"}
          subtitle={loadingStats ? "Memuat..." : "Masih bekerja"}
          icon={LogOut}
          variant="tertiary"
        />
      </div>

      <div className="flex flex-col gap-8">
        <div className="bg-surface-container-lowest p-4 rounded-3xl shadow-sm flex flex-wrap items-center gap-4 border border-emerald-50/20">
          <div className="flex-1 min-w-50 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full bg-surface-container-low border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="Cari karyawan..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Dropdown untuk filter departemen */}
            <select
              className="bg-surface-container-low border-none rounded-2xl py-2.5 px-4 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">Semua Departemen</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Input tanggal untuk filter absensi berdasarkan tanggal tertentu */}
            <input
              type="date"
              className="bg-surface-container-low border-none rounded-2xl py-2.5 px-4 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <AttendanceTable
          data={attendances}
          loading={loadingTable}
          pagination={pagination}
          onPageChange={setPage}
          onViewDetail={handleViewDetail}
        />
      </div>
    </div>
  );
}