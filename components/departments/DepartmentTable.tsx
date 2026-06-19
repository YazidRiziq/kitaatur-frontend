"use client"

import { useState } from "react"
import { Pencil, Trash2, Loader2, FolderTree } from "lucide-react"
import type { Department } from "@/lib/departments/types"
import { deleteDepartment } from "@/lib/departments/actions"
import { toast } from "sonner"

interface DepartmentTableProps {
  data: Department[]
  loading: boolean
  onEdit: (department: Department) => void
  onRefresh: () => void
}

export function DepartmentTable({
  data,
  loading,
  onEdit,
  onRefresh,
}: DepartmentTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(department: Department) {
    if (department.employee_count > 0) {
      toast.error("Tidak dapat menghapus departemen", {
        description: `Masih ada ${department.employee_count} karyawan di departemen ini.`,
      })
      return
    }

    if (!confirm(`Hapus departemen "${department.name}"?`)) return

    setDeletingId(department.id)
    try {
      await deleteDepartment(department.id)
      toast.success(`Departemen "${department.name}" dihapus`)
      onRefresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus departemen"
      )
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-emerald-50/20 p-12 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-emerald-50/20 p-12 text-center">
        <FolderTree size={40} className="mx-auto text-slate-300 mb-3" />
        <p className="text-on-surface-variant text-sm">Belum ada departemen.</p>
        <p className="text-outline text-xs mt-1">
          Tambah departemen melalui tombol di atas.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-emerald-50/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-outline text-[11px] uppercase tracking-widest font-bold border-b border-surface-variant/30">
              <th className="px-8 py-4">Nama Departemen</th>
              <th className="px-6 py-4">Jumlah Karyawan</th>
              <th className="px-8 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant/10">
            {data.map((dept) => (
              <tr
                key={dept.id}
                className="hover:bg-surface-container-low/50 transition-colors group"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <FolderTree size={20} className="text-primary" />
                    </div>
                    <p className="font-semibold text-on-surface text-sm">
                      {dept.name}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold text-on-surface-variant">
                    {dept.employee_count} karyawan
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(dept)}
                      className="p-2 text-outline hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      disabled={deletingId === dept.id}
                      className="p-2 text-outline hover:text-error hover:bg-error/5 rounded-xl transition-all disabled:opacity-50"
                      title="Hapus"
                    >
                      {deletingId === dept.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}