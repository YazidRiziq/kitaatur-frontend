"use client"

import { useState } from "react"
import { Pencil, Trash2, Loader2, Briefcase } from "lucide-react"
import type { Position } from "@/lib/positions/types"
import { deletePosition } from "@/lib/positions/actions"
import { toast } from "sonner"

interface PositionTableProps {
  data: Position[]
  loading: boolean
  onEdit: (position: Position) => void
  onRefresh: () => void
}

export function PositionTable({
  data,
  loading,
  onEdit,
  onRefresh,
}: PositionTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(position: Position) {
    if (position.employee_count > 0) {
      toast.error("Tidak dapat menghapus jabatan", {
        description: `Masih ada ${position.employee_count} karyawan dengan jabatan ini.`,
      })
      return
    }

    if (!confirm(`Hapus jabatan "${position.title}"?`)) return

    setDeletingId(position.id)
    try {
      await deletePosition(position.id)
      toast.success(`Jabatan "${position.title}" dihapus`)
      onRefresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus jabatan"
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
        <Briefcase size={40} className="mx-auto text-slate-300 mb-3" />
        <p className="text-on-surface-variant text-sm">Belum ada jabatan.</p>
        <p className="text-outline text-xs mt-1">
          Tambah jabatan melalui tombol di atas.
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
              <th className="px-8 py-4">Nama Jabatan</th>
              <th className="px-6 py-4">Grade</th>
              <th className="px-6 py-4">Jumlah Karyawan</th>
              <th className="px-8 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant/10">
            {data.map((pos) => (
              <tr
                key={pos.id}
                className="hover:bg-surface-container-low/50 transition-colors group"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Briefcase size={20} className="text-blue-500" />
                    </div>
                    <p className="font-semibold text-on-surface text-sm">
                      {pos.title}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  {pos.grade ? (
                    <span className="inline-flex px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold text-on-surface-variant">
                      {pos.grade}
                    </span>
                  ) : (
                    <span className="text-xs text-outline">-</span>
                  )}
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold text-on-surface-variant">
                    {pos.employee_count} karyawan
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(pos)}
                      className="p-2 text-outline hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(pos)}
                      disabled={deletingId === pos.id}
                      className="p-2 text-outline hover:text-error hover:bg-error/5 rounded-xl transition-all disabled:opacity-50"
                      title="Hapus"
                    >
                      {deletingId === pos.id ? (
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