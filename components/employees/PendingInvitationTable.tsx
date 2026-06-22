"use client"

import { useState } from "react"
import { Loader2, RefreshCw, X, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react"
import type { PendingInvitation, PaginatedResponse } from "@/lib/employees/types"
import { resendInvitation, revokeInvitation } from "@/lib/employees/actions"
import { toast } from "sonner"

interface PendingInvitationTableProps {
  data: PendingInvitation[]
  loading: boolean
  pagination: PaginatedResponse<PendingInvitation>["pagination"] | null
  onPageChange: (page: number) => void
  onRefresh: () => void
}

export function PendingInvitationTable({
  data,
  loading,
  pagination,
  onPageChange,
  onRefresh,
}: PendingInvitationTableProps) {
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  async function handleResend(id: string, name: string) {
    setResendingId(id)
    try {
      const result = await resendInvitation(id)
      toast.success(`Undangan dikirim ulang ke ${name}`, {
        description: `Kode baru: ${result.data.invitation_code}`,
      })
      onRefresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengirim ulang undangan"
      )
    } finally {
      setResendingId(null)
    }
  }

  async function handleRevoke(id: string, name: string) {
    if (!confirm(`Batalkan undangan untuk ${name}?`)) return

    setRevokingId(id)
    try {
      await revokeInvitation(id)
      toast.success(`Undangan ${name} dibatalkan`)
      onRefresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal membatalkan undangan"
      )
    } finally {
      setRevokingId(null)
    }
  }

  async function handleCopyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success("Kode undangan disalin")
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      toast.error("Gagal menyalin kode")
    }
  }

  // Fungsi untuk memformat tanggal kadaluarsa undangan dengan informasi tambahan seperti "Kadaluarsa", "Hari ini", "Besok", atau jumlah hari tersisa
  function formatExpiry(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    const formatted = date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

    if (diffDays < 0) return `${formatted} (Kadaluarsa)`
    if (diffDays === 0) return `${formatted} (Hari ini)`
    if (diffDays === 1) return `${formatted} (Besok)`
    return `${formatted} (${diffDays} hari lagi)`
  }

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
        <p className="text-on-surface-variant text-sm">
          Tidak ada undangan tertunda.
        </p>
        <p className="text-outline text-xs mt-1">
          Semua undangan sudah diterima atau belum ada yang diundang.
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
              <th className="px-8 py-4">Nama</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Kode Undangan</th>
              <th className="px-6 py-4">Berlaku Sampai</th>
              <th className="px-8 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant/10">
            {data.map((invitation) => (
              <tr
                key={invitation.id}
                className="hover:bg-surface-container-low/50 transition-colors group"
              >
                <td className="px-8 py-5">
                  <p className="font-semibold text-on-surface text-sm">
                    {invitation.name}
                  </p>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">
                  {invitation.email}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <code className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-mono font-bold tracking-wider">
                      {invitation.invitation_token}
                    </code>
                    <button
                      onClick={() => handleCopyCode(invitation.invitation_token)}
                      className="p-1 text-outline hover:text-primary transition-colors"
                      title="Salin kode"
                    >
                      {copiedCode === invitation.invitation_token ? (
                        <Check size={14} className="text-primary" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`text-xs font-medium ${
                      new Date(invitation.invitation_expires_at) < new Date()
                        ? "text-error"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {formatExpiry(invitation.invitation_expires_at)}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        handleResend(invitation.id, invitation.name)
                      }
                      disabled={resendingId === invitation.id}
                      className="p-2 text-outline hover:text-primary hover:bg-primary/5 rounded-xl transition-all disabled:opacity-50"
                      title="Kirim ulang"
                    >
                      {resendingId === invitation.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <RefreshCw size={18} />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        handleRevoke(invitation.id, invitation.name)
                      }
                      disabled={revokingId === invitation.id}
                      className="p-2 text-outline hover:text-error hover:bg-error/5 rounded-xl transition-all disabled:opacity-50"
                      title="Batalkan"
                    >
                      {revokingId === invitation.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <X size={18} />
                      )}
                    </button>
                  </div>
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