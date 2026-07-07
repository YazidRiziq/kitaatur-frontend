"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Download,
  Plus,
  Clock,
  CheckCircle,
  CalendarOff,
  Search,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { LeaveStatCard } from "@/components/leave/LeaveStatCard"
import { LeaveTable } from "@/components/leave/LeaveTable"
import { LeaveDetailSheet } from "@/components/leave/LeaveDetailSheet"
import { CreateLeaveSheet } from "@/components/leave/CreateLeaveSheet"
import {
  getLeaveStats,
  getLeaveRequests,
  getLeaveExportInfo,
} from "@/lib/leave/actions"
import { LEAVE_STATUSES, LEAVE_TYPES } from "@/lib/leave/types"
import type {
  LeaveRequest,
  LeaveStats,
  LeavePagination,
} from "@/lib/leave/types"

export default function LeavePage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [page, setPage] = useState(1)

  const [stats, setStats] = useState<LeaveStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [pagination, setPagination] = useState<LeavePagination | null>(null)
  const [loadingTable, setLoadingTable] = useState(true)

  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [createSheetOpen, setCreateSheetOpen] = useState(false)

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pageResetRef = useRef(false)

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 300)
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [search])

  const fetchStats = useCallback(() => {
    setLoadingStats(true)
    let cancelled = false

    const load = async () => {
      try {
        const data = await getLeaveStats()
        if (!cancelled) setStats(data)
      } catch {
        if (!cancelled) setStats(null)
      } finally {
        if (!cancelled) setLoadingStats(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const cleanup = fetchStats()
    return () => cleanup()
  }, [fetchStats])

  const fetchLeaveRequests = useCallback(() => {
    setLoadingTable(true)
    let cancelled = false

    const load = async () => {
      try {
        const res = await getLeaveRequests({
          page,
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
          type: typeFilter || undefined,
        })
        if (!cancelled) {
          setLeaveRequests(res.data)
          setPagination(res.pagination)
        }
      } catch {
        if (!cancelled) {
          setLeaveRequests([])
          setPagination(null)
        }
      } finally {
        if (!cancelled) setLoadingTable(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [page, debouncedSearch, statusFilter, typeFilter])

  useEffect(() => {
    if (pageResetRef.current && page !== 1) return
    pageResetRef.current = false
    const cleanup = fetchLeaveRequests()
    return () => cleanup()
  }, [fetchLeaveRequests, page])

  useEffect(() => {
    pageResetRef.current = true
    setPage(1)
  }, [debouncedSearch, statusFilter, typeFilter])

  function refreshData() {
    fetchStats()
    fetchLeaveRequests()
  }

  const handleExport = async () => {
    setExporting(true)
    setExportError(null)
    try {
      const { url, token } = await getLeaveExportInfo({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      })

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Export failed")

      const disposition = res.headers.get("Content-Disposition")
      let filename = "leave-report.xlsx"
      if (disposition) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (match?.[1]) {
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

  const handleViewDetail = (request: LeaveRequest) => {
    setSelectedRequest(request)
    setDetailSheetOpen(true)
  }

  return (
    <div className="px-8 flex-1">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline tracking-tight text-3xl font-bold text-on-surface">
            Pengajuan Cuti
          </h2>
          <p className="text-on-surface-variant mt-1">
            Tinjau dan kelola permohonan cuti karyawan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {exportError && (
            <span className="text-xs text-error font-medium">{exportError}</span>
          )}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-2.5 border border-outline-variant/30 text-primary font-semibold rounded-3xl bg-surface-container-lowest hover:bg-surface-container transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Download size={20} />
            )}
            Export Report
          </button>
          <button
            onClick={() => setCreateSheetOpen(true)}
            className="bg-primary text-white px-6 py-2.5 rounded-3xl font-semibold shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus size={20} />
            Buat Pengajuan Baru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <LeaveStatCard
          title="Menunggu Persetujuan"
          value={loadingStats ? "..." : stats?.pending ?? "-"}
          icon={Clock}
          trendIcon={Clock}
          trendText={loadingStats ? "Memuat..." : "Permohonan menunggu tindakan"}
          variant="tertiary"
        />
        <LeaveStatCard
          title="Cuti Disetujui"
          value={loadingStats ? "..." : stats?.approved ?? "-"}
          icon={CheckCircle}
          trendIcon={CheckCircle}
          trendText={loadingStats ? "Memuat..." : "Bulan ini"}
          variant="primary"
        />
        <LeaveStatCard
          title="Karyawan Cuti Hari Ini"
          value={loadingStats ? "..." : stats?.onLeaveToday ?? "-"}
          icon={CalendarOff}
          trendIcon={CalendarOff}
          trendText={loadingStats ? "Memuat..." : "Sedang cuti hari ini"}
          variant="secondary"
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status</option>
              {LEAVE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "Approved" ? "Disetujui" : s === "Rejected" ? "Ditolak" : s}
                </option>
              ))}
            </select>
            <select
              className="bg-surface-container-low border-none rounded-2xl py-2.5 px-4 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Semua Jenis</option>
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <LeaveTable
          data={leaveRequests}
          loading={loadingTable}
          pagination={pagination}
          onPageChange={setPage}
          onViewDetail={handleViewDetail}
        />
      </div>

      <LeaveDetailSheet
        open={detailSheetOpen}
        request={selectedRequest}
        onOpenChange={setDetailSheetOpen}
        onStatusUpdated={refreshData}
      />

      <CreateLeaveSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        onSuccess={refreshData}
      />
    </div>
  )
}
