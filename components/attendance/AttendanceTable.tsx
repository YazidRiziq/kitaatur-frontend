"use client"

import Image from "next/image"
import { Eye, ChevronLeft, ChevronRight, User, MapPin, MapPinOff, AlertCircle } from "lucide-react"
import type { AttendanceRecord, AttendancePagination, LocationStatus } from "@/lib/attendance/types"

function renderLocationBadge(status: LocationStatus) {
  if (status === "in_radius") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
        <MapPin size={12} />
        In Radius
      </span>
    )
  }
  if (status === "out_of_range") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-error/10 text-error">
        <AlertCircle size={12} />
        Di Luar Radius
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-surface-container text-on-surface-variant">
      <MapPinOff size={12} />
      Tanpa Lokasi
    </span>
  )
}

interface AttendanceTableProps {
  data: AttendanceRecord[]
  loading: boolean
  pagination: AttendancePagination | null
  onPageChange: (page: number) => void
  onViewDetail: (id: string) => void
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 bg-surface-container animate-pulse rounded" />
            <div className="h-3 w-20 bg-surface-container animate-pulse rounded" />
          </div>
        </div>
      </td>
      <td className="px-6 py-5 text-center">
        <div className="h-3.5 w-12 bg-surface-container animate-pulse rounded mx-auto" />
      </td>
      <td className="px-6 py-5 text-center">
        <div className="h-3.5 w-12 bg-surface-container animate-pulse rounded mx-auto" />
      </td>
      <td className="px-6 py-5 text-center">
        <div className="h-5 w-20 bg-surface-container animate-pulse rounded-full mx-auto" />
      </td>
      <td className="px-6 py-5 text-right">
        <div className="h-8 w-8 bg-surface-container animate-pulse rounded-lg ml-auto" />
      </td>
    </tr>
  )
}

export function AttendanceTable({
  data,
  loading,
  pagination,
  onPageChange,
  onViewDetail,
}: AttendanceTableProps) {
  return (
    <div className="flex flex-col gap-0">
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm overflow-hidden border border-emerald-50/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Profil Karyawan
                </th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase text-center tracking-wider">
                  Check-In
                </th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase text-center tracking-wider">
                  Check-Out
                </th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase text-center tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase text-center tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase text-right tracking-wider">
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
                    <User size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-on-surface-variant">
                      Belum ada data kehadiran
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Data akan muncul setelah karyawan melakukan check-in.
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative rounded-xl overflow-hidden bg-surface-container shrink-0">
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
                          <p className="text-[11px] text-on-surface-variant">
                            {row.employee.position}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-center font-medium">
                      <span
                        className={
                          row.status === "Terlambat"
                            ? "text-error font-bold"
                            : ""
                        }
                      >
                        {row.checkIn}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-center font-medium text-on-surface-variant">
                      {row.checkOut ?? "-"}
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
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        {renderLocationBadge(row.locationStatus)}
                        {row.locationLabel && row.locationStatus !== "no_location" && (
                          <span className="text-[10px] text-on-surface-variant max-w-[140px] truncate">
                            {row.locationLabel}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => onViewDetail(row.id)}
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
