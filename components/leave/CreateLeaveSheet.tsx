"use client"

import { useState, useEffect } from "react"
import { CalendarPlus, Loader2, User } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createLeaveRequest } from "@/lib/leave/actions"
import { getActiveEmployees } from "@/lib/employees/actions"
import { LEAVE_TYPES } from "@/lib/leave/types"
import type { Employee } from "@/lib/employees/types"

interface CreateLeaveSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateLeaveSheet({
  open,
  onOpenChange,
  onSuccess,
}: CreateLeaveSheetProps) {
  const [employeeId, setEmployeeId] = useState("")
  const [type, setType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)

  useEffect(() => {
    if (!open) return

    setEmployeeId("")
    setType("")
    setStartDate("")
    setEndDate("")
    setReason("")
    setErrors({})

    setLoadingEmployees(true)
    getActiveEmployees({ page: 1 })
      .then((res) => setEmployees(res.data))
      .catch(() => {
        toast.error("Gagal memuat daftar karyawan")
        setEmployees([])
      })
      .finally(() => setLoadingEmployees(false))
  }, [open])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!employeeId) newErrors.employeeId = "Karyawan wajib dipilih"
    if (!type) newErrors.type = "Jenis cuti wajib dipilih"
    if (!startDate) newErrors.startDate = "Tanggal mulai wajib diisi"
    if (!endDate) newErrors.endDate = "Tanggal selesai wajib diisi"
    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = "Tanggal selesai harus sama atau setelah tanggal mulai"
    }
    if (!reason.trim()) newErrors.reason = "Alasan wajib diisi"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await createLeaveRequest({
        employee_id: employeeId,
        type: type as (typeof LEAVE_TYPES)[number],
        start_date: startDate,
        end_date: endDate,
        reason: reason.trim(),
      })

      toast.success("Pengajuan cuti berhasil dibuat")
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat pengajuan cuti"
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-4 border-b border-surface-variant/20">
            <SheetTitle className="font-headline text-xl font-bold text-on-surface">
              Buat Pengajuan Cuti
            </SheetTitle>
            <SheetDescription>
              Buat pengajuan cuti atas nama karyawan. Status awal akan
              ditetapkan sebagai Pending.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="employee" className="text-sm font-medium text-on-surface">
                Karyawan <span className="text-error">*</span>
              </Label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <select
                  id="employee"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  disabled={loadingEmployees}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-container-low border-none text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none disabled:opacity-50 appearance-none"
                >
                  <option value="">
                    {loadingEmployees ? "Memuat..." : "Pilih Karyawan"}
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.position.title}
                    </option>
                  ))}
                </select>
              </div>
              {errors.employeeId && (
                <p className="text-xs text-error mt-1">{errors.employeeId}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="leave-type" className="text-sm font-medium text-on-surface">
                Jenis Cuti <span className="text-error">*</span>
              </Label>
              <div className="relative">
                <CalendarPlus
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <select
                  id="leave-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-container-low border-none text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none appearance-none"
                >
                  <option value="">Pilih Jenis Cuti</option>
                  {LEAVE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              {errors.type && (
                <p className="text-xs text-error mt-1">{errors.type}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="start-date" className="text-sm font-medium text-on-surface">
                  Tanggal Mulai <span className="text-error">*</span>
                </Label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl bg-surface-container-low border-none text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none"
                />
                {errors.startDate && (
                  <p className="text-xs text-error mt-1">{errors.startDate}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="end-date" className="text-sm font-medium text-on-surface">
                  Tanggal Selesai <span className="text-error">*</span>
                </Label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl bg-surface-container-low border-none text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none"
                />
                {errors.endDate && (
                  <p className="text-xs text-error mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-sm font-medium text-on-surface">
                Alasan <span className="text-error">*</span>
              </Label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Acara keluarga"
                rows={3}
                className="w-full rounded-xl bg-surface-container-low border-none px-4 py-3 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              />
              {errors.reason && (
                <p className="text-xs text-error mt-1">{errors.reason}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting || loadingEmployees}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 font-semibold text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <CalendarPlus size={18} />
                    Buat Pengajuan
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
