"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog as DialogPrimitive } from "radix-ui"
import { Check, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { updateLeaveStatus } from "@/lib/leave/actions"
import type { LeaveRequest } from "@/lib/leave/types"

interface LeaveDetailSheetProps {
  open: boolean
  request: LeaveRequest | null
  onOpenChange: (open: boolean) => void
  onStatusUpdated?: () => void
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-"
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return "-"
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const leaveTypeColorMap: Record<string, string> = {
  "Cuti Tahunan": "bg-primary",
  "Izin Sakit": "bg-error",
  "Cuti Penting": "bg-tertiary-container",
  "Cuti Melahirkan": "bg-primary-container",
}

function ReadonlyField({
  label,
  value,
  className = "",
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
        {label}
      </label>
      <div className="min-h-11 w-full rounded-xl border border-surface-variant/30 bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface">
        {value || "-"}
      </div>
    </div>
  )
}

function renderStatusBadge(status: string) {
  if (status === "Pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-tertiary-fixed text-on-tertiary-fixed">
        <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
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

export function LeaveDetailSheet({
  open,
  request,
  onOpenChange,
  onStatusUpdated,
}: LeaveDetailSheetProps) {
  const [approving, setApproving] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejecting, setRejecting] = useState(false)

  useEffect(() => {
    setApproving(false)
    setConfirmReject(false)
    setRejectionReason("")
    setRejecting(false)
  }, [request, open])

  const initial = request?.employee.name?.charAt(0).toUpperCase() || "?"

  async function handleApprove() {
    if (!request) return
    setApproving(true)
    try {
      await updateLeaveStatus(request.id, { status: "Approved" })
      toast.success("Pengajuan cuti berhasil disetujui")
      onOpenChange(false)
      onStatusUpdated?.()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menyetujui pengajuan cuti"
      )
    } finally {
      setApproving(false)
    }
  }

  async function handleReject() {
    if (!request) return

    if (!rejectionReason.trim()) {
      toast.error("Alasan penolakan wajib diisi")
      return
    }

    setRejecting(true)
    try {
      await updateLeaveStatus(request.id, {
        status: "Rejected",
        rejection_reason: rejectionReason.trim(),
      })
      toast.success("Pengajuan cuti ditolak")
      onOpenChange(false)
      onStatusUpdated?.()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menolak pengajuan cuti"
      )
    } finally {
      setRejecting(false)
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />

        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-surface-variant/20 bg-popover text-popover-foreground shadow-2xl outline-none duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div className="flex items-start justify-between gap-4 border-b border-surface-variant/20 p-6">
            <div>
              <DialogPrimitive.Title className="font-headline text-xl font-bold text-on-surface">
                Detail Pengajuan Cuti
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-on-surface-variant">
                Informasi lengkap pengajuan cuti karyawan.
              </DialogPrimitive.Description>
            </div>

            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </DialogPrimitive.Close>
          </div>

          {!request ? (
            <div className="flex min-h-64 items-center justify-center p-6">
              <p className="text-sm text-on-surface-variant">
                Data pengajuan tidak tersedia.
              </p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto p-6">
              <div className="mb-5 flex items-center gap-4 rounded-2xl border border-surface-variant/20 bg-surface-container-lowest p-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-primary/10">
                  {request.employee.avatarUrl ? (
                    <Image
                      src={request.employee.avatarUrl}
                      alt={request.employee.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-primary">
                      {initial}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-on-surface">
                    {request.employee.name}
                  </h3>
                  <p className="truncate text-sm text-on-surface-variant">
                    {request.employee.position}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-surface-variant/20 bg-surface-container-lowest p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <ReadonlyField
                    label="Jenis Cuti"
                    value={
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${leaveTypeColorMap[request.type] ?? "bg-outline"}`} />
                        {request.type}
                      </div>
                    }
                  />
                  <ReadonlyField
                    label="Status"
                    value={renderStatusBadge(request.status)}
                  />
                  <ReadonlyField
                    label="Tanggal Mulai"
                    value={formatDate(request.startDate)}
                  />
                  <ReadonlyField
                    label="Tanggal Selesai"
                    value={formatDate(request.endDate)}
                  />
                  <ReadonlyField
                    label="Durasi"
                    value={`${request.duration} Hari`}
                  />
                  <ReadonlyField
                    label="Diajukan pada"
                    value={formatDateTime(request.createdAt)}
                  />
                  <ReadonlyField
                    label="Alasan"
                    value={request.reason}
                    className="md:col-span-2"
                  />
                  {request.approver && (
                    <ReadonlyField
                      label={request.status === "Approved" ? "Disetujui oleh" : "Ditolak oleh"}
                      value={request.approver.name}
                    />
                  )}
                </div>
              </div>

              {request.status === "Pending" && (
                <div className="mt-5 rounded-2xl border border-surface-variant/20 bg-surface-container-lowest p-5">
                  <h4 className="text-sm font-bold text-on-surface mb-1">
                    Tindakan
                  </h4>
                  <p className="text-xs text-on-surface-variant mb-4">
                    Setujui atau tolak pengajuan cuti ini.
                  </p>

                  {!confirmReject ? (
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        className="rounded-xl"
                        disabled={approving || rejecting}
                        onClick={handleApprove}
                      >
                        {approving ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            Menyetujui...
                          </>
                        ) : (
                          <>
                            <Check size={15} />
                            Setujui
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="rounded-xl"
                        disabled={approving || rejecting}
                        onClick={() => setConfirmReject(true)}
                      >
                        <X size={15} />
                        Tolak
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label
                          htmlFor="rejection-reason"
                          className="text-xs font-semibold text-on-surface-variant"
                        >
                          Alasan Penolakan <span className="text-error">(wajib diisi)</span>
                        </Label>
                        <textarea
                          id="rejection-reason"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Contoh: Kuota cuti tahunan sudah habis"
                          rows={3}
                          className="mt-1.5 w-full rounded-xl border border-surface-variant/30 bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          disabled={rejecting}
                          onClick={() => {
                            setConfirmReject(false)
                            setRejectionReason("")
                          }}
                        >
                          Batal
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="rounded-xl"
                          disabled={rejecting}
                          onClick={handleReject}
                        >
                          {rejecting ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              Menolak...
                            </>
                          ) : (
                            "Ya, Tolak"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
