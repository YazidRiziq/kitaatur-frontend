"use client"

import Image from "next/image"
import { Eye, ChevronLeft, ChevronRight, Check, X, CalendarOff, User } from "lucide-react"
import type { LeaveRequest, LeavePagination } from "@/lib/leave/types"

interface LeaveTableProps {
  data: LeaveRequest[]
  loading: boolean
  pagination: LeavePagination | null
  onPageChange: (page: number) => void
  onViewDetail: (request: LeaveRequest) => void
}

const leaveTypeColorMap: Record<string, string> = {
  "Cuti Tahunan": "bg-primary",
  "Izin Sakit": "bg-error",
  "Cuti Penting": "bg-tertiary-container",
  "Cuti Melahirkan": "bg-primary-container",
}

function renderStatusBadge(status: string) {
  if (status === "Pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-tertiary-fixed text-on-tertiary-fixed">
        <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
        Pending
      </span>
    )
  } else if (status === "Approved") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary-fixed text-on-primary-fixed">
        <Check size={14} strokeWidth={3} />
        Disetujui
      </span>
    )
  } else {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-error-container text-on-error-container">
        <X size={14} strokeWidth={3} />
        Ditolak
      </span>
    )
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 bg-surface-container animate-pulse rounded" />
            <div className="h-3 w-20 bg-surface-container animate-pulse rounded" />
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="h-3.5 w-20 bg-surface-container animate-pulse rounded" />
      </td>
      <td className="px-6 py-5">
        <div className="h-3.5 w-32 bg-surface-container animate-pulse rounded" />
      </td>
      <td className="px-6 py-5">
        <div className="h-5 w-14 bg-surface-container animate-pulse rounded-full" />
      </td>
      <td className="px-6 py-5">
        <div className="h-5 w-20 bg-surface-container animate-pulse rounded-full" />
      </td>
      <td className="px-8 py-5 text-right">
        <div className="h-8 w-8 bg-surface-container animate-pulse rounded-lg ml-auto" />
      </td>
    </tr>
  )
}

export function LeaveTable({
  data,
  loading,
  pagination,
  onPageChange,
  onViewDetail,
}: LeaveTableProps) {
  return (
    <div className="flex flex-col gap-0">
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm overflow-hidden border border-emerald-50/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Karyawan
                </th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Jenis Pengajuan
                </th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Durasi
                </th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Status
                </th>
                <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <CalendarOff size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-on-surface-variant">
                      Belum ada pengajuan cuti
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Pengajuan cuti akan muncul di sini.
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative rounded-full overflow-hidden bg-surface-container shrink-0">
                          {row.employee.avatarUrl ? (
                            <Image
                              src={row.employee.avatarUrl}
                              alt={row.employee.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <User size={18} className="text-primary/50" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">
                            {row.employee.name}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {row.employee.position}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${leaveTypeColorMap[row.type] ?? "bg-outline"}`} />
                        <span className="text-sm text-on-surface-variant font-medium">
                          {row.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">
                      {formatDate(row.startDate)} - {formatDate(row.endDate)}
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold text-on-surface-variant">
                        {row.duration} Hari
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {renderStatusBadge(row.status)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => onViewDetail(row)}
                        className="p-2 text-primary hover:bg-emerald-100 rounded-lg transition-all"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && !loading && (
        <div className="p-6 flex items-center justify-between">
          <p className="text-xs font-medium text-outline">
            Menampilkan {(pagination.page - 1) * pagination.perPage + 1}-
            {Math.min(pagination.page * pagination.perPage, pagination.total)}{" "}
            dari {pagination.total} data
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (pagination.totalPages <= 5) return true
                if (p === 1 || p === pagination.totalPages) return true
                if (Math.abs(p - pagination.page) <= 1) return true
                return false
              })
              .map((p, idx, arr) => {
                const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
                return (
                  <div key={p} className="flex items-center gap-2">
                    {showEllipsis && (
                      <span className="text-outline text-xs px-1">...</span>
                    )}
                    <button
                      onClick={() => onPageChange(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        p === pagination.page
                          ? "bg-primary text-on-primary"
                          : "border border-outline-variant/30 text-outline hover:border-primary hover:text-primary"
                      }`}
                    >
                      {p}
                    </button>
                  </div>
                )
              })}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
