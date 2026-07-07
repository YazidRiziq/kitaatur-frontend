"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Download,
  UserCheck,
  ClockAlert,
  LogOut,
  Search,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { AttendanceStatCard } from "@/components/attendance/AttendanceStatCard"
import { AttendanceTable } from "@/components/attendance/AttendanceTable"
import { getAttendanceStats, getAttendances, getExportInfo } from "@/lib/attendance/actions"
import { getDepartments } from "@/lib/departments/actions"
import type { AttendanceRecord, AttendanceStats, AttendancePagination } from "@/lib/attendance/types"
import type { Department } from "@/lib/departments/types"

function formatDateToYYYYMMDD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getToday(): string {
  return formatDateToYYYYMMDD(new Date())
}

export default function AttendancePage() {
  const [date, setDate] = useState(getToday())
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [page, setPage] = useState(1)

  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
  const [pagination, setPagination] = useState<AttendancePagination | null>(null)
  const [loadingTable, setLoadingTable] = useState(true)

  const [departments, setDepartments] = useState<Department[]>([])
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pageResetRef = useRef(false)

  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 300)
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [search])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await getDepartments()
        if (!cancelled) setDepartments(data)
      } catch {
        if (!cancelled) setDepartments([])
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const fetchStats = useCallback(() => {
    setLoadingStats(true)
    let cancelled = false

    const load = async () => {
      try {
        const data = await getAttendanceStats({
          date,
          department_id: departmentId || undefined,
        })
        if (!cancelled) setStats(data)
      } catch {
        if (!cancelled) setStats(null)
      } finally {
        if (!cancelled) setLoadingStats(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [date, departmentId])

  useEffect(() => {
    const cleanup = fetchStats()
    return () => cleanup()
  }, [fetchStats])

  const fetchAttendances = useCallback(() => {
    setLoadingTable(true)
    let cancelled = false

    const load = async () => {
      try {
        const res = await getAttendances({
          date,
          page,
          search: debouncedSearch || undefined,
          department_id: departmentId || undefined,
        })
        if (!cancelled) {
          setAttendances(res.data)
          setPagination(res.pagination)
        }
      } catch {
        if (!cancelled) {
          setAttendances([])
          setPagination(null)
        }
      } finally {
        if (!cancelled) setLoadingTable(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [date, page, debouncedSearch, departmentId])

  useEffect(() => {
    if (pageResetRef.current && page !== 1) return
    pageResetRef.current = false
    const cleanup = fetchAttendances()
    return () => cleanup()
  }, [fetchAttendances, page])

  useEffect(() => {
    pageResetRef.current = true
    setPage(1)
  }, [debouncedSearch, departmentId, date])

  const handleExport = async () => {
    setExporting(true)
    setExportError(null)
    try {
      const { url, token } = await getExportInfo({
        date,
        search: debouncedSearch || undefined,
        department_id: departmentId || undefined,
      })

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Export failed")

      const disposition = res.headers.get("Content-Disposition")
      let filename = "attendance-report.xlsx"
      if (disposition) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, "")
        }
      }

      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      setExportError("Gagal mengekspor laporan. Silakan coba lagi.")
    } finally {
      setExporting(false)
    }
  }

  const handleViewDetail = (_id: string) => {
    toast.info("Fitur detail kehadiran akan segera hadir.")
  }

  return (
    <div className="px-8 flex-1">
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
  )
}
