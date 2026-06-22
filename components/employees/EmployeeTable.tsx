"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import type { Employee, PaginatedResponse } from "@/lib/employees/types"

interface EmployeeTableProps {
  data: Employee[]
  loading: boolean
  pagination: PaginatedResponse<Employee>["pagination"] | null
  onPageChange: (page: number) => void
}

// Komponen untuk menampilkan tabel karyawan aktif
export function EmployeeTable({
  data,
  loading,
  pagination,
  onPageChange,
}: EmployeeTableProps) {
  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-emerald-50/20 p-12 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-emerald-50/20 p-12 text-center">
        <p className="text-on-surface-variant text-sm">Belum ada karyawan yang bergabung.</p>
        <p className="text-outline text-xs mt-1">Undang karyawan melalui tombol Tambah Karyawan di atas.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-emerald-50/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-outline text-[11px] uppercase tracking-widest font-bold border-b border-surface-variant/30">
              <th className="px-8 py-4">Karyawan</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">NIK</th>
              <th className="px-6 py-4">Departemen</th>
              <th className="px-6 py-4">Jabatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant/10">
            {data.map((employee) => (
              <tr
                key={employee.id}
                className="hover:bg-surface-container-low/50 transition-colors group"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 relative rounded-full overflow-hidden bg-surface-container">
                      {employee.avatar_url ? (
                        <Image
                          src={employee.avatar_url}
                          alt={employee.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-sm">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface text-sm">
                        {employee.name}
                      </p>
                      {employee.phone && (
                        <p className="text-xs text-outline font-medium">
                          {employee.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">
                  {employee.email}
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">
                  {employee.employee_number || "-"}
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold text-on-surface-variant">
                    {employee.department.name}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">
                  {employee.position.title || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="p-6 flex items-center justify-between border-t border-surface-variant/20">
          <p className="text-xs font-medium text-outline">
            Menampilkan {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
            {pagination.total} data
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                const showEllipsis =
                  idx > 0 && p - arr[idx - 1] > 1
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
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}