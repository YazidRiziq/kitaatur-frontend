"use client"

import * as React from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { AlertTriangle, Loader2, Pencil, Save, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateEmployee, deactivateEmployee } from "@/lib/employees/actions"
import type { Employee } from "@/lib/employees/types"
import type { Department } from "@/lib/departments/types"
import type { Position } from "@/lib/positions/types"

interface EmployeeDetailSheetProps {
  open: boolean
  employee: Employee | null
  departments: Department[]
  positions: Position[]
  onOpenChange: (open: boolean) => void
  onUpdated?: (employee: Employee) => void
  onDeactivated?: () => void
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-"

  const date = new Date(dateStr)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
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

export function EmployeeDetailSheet({
  open,
  employee,
  departments,
  positions,
  onOpenChange,
  onUpdated,
  onDeactivated,
}: EmployeeDetailSheetProps) {
  const [editing, setEditing] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = React.useState(false)
  const [deactivating, setDeactivating] = React.useState(false)
  const [deactivateReason, setDeactivateReason] = React.useState("")

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [employeeNumber, setEmployeeNumber] = React.useState("")
  const [departmentId, setDepartmentId] = React.useState("")
  const [positionId, setPositionId] = React.useState("")

  const initial = employee?.name?.charAt(0).toUpperCase() || "?"

  React.useEffect(() => {
    if (!employee) return

    setEditing(false)
    setConfirmDeactivate(false)
    setDeactivateReason("")
    setName(employee.name || "")
    setEmail(employee.email || "")
    setPhone(employee.phone || "")
    setEmployeeNumber(employee.employee_number || "")
    setDepartmentId(employee.department?.id || "")
    setPositionId(employee.position?.id || "")
  }, [employee, open])

  function handleCancelEdit() {
    if (!employee) return

    setEditing(false)
    setName(employee.name || "")
    setEmail(employee.email || "")
    setPhone(employee.phone || "")
    setEmployeeNumber(employee.employee_number || "")
    setDepartmentId(employee.department?.id || "")
    setPositionId(employee.position?.id || "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!employee) return

    if (!name.trim()) {
      toast.error("Nama karyawan wajib diisi")
      return
    }

    if (!email.trim()) {
      toast.error("Email wajib diisi")
      return
    }

    if (!departmentId) {
      toast.error("Departemen wajib dipilih")
      return
    }

    if (!positionId) {
      toast.error("Jabatan wajib dipilih")
      return
    }

    setSubmitting(true)

    try {
      const result = await updateEmployee(employee.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        employee_number: employeeNumber.trim() || null,
        department_id: departmentId,
        position_id: positionId,
      })

      toast.success("Data karyawan berhasil diperbarui")
      setEditing(false)
      onUpdated?.(result.data)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui data karyawan",
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeactivate() {
    if (!employee) return

    if (!deactivateReason.trim()) {
      toast.error("Alasan penonaktifan wajib diisi")
      return
    }

    setDeactivating(true)
    try {
      await deactivateEmployee(employee.id, {
        reason: deactivateReason.trim(),
      })

      toast.success(`${employee.name} berhasil dinonaktifkan`)
      setConfirmDeactivate(false)
      setDeactivateReason("")
      onDeactivated?.()
    } catch {
      toast.error("Gagal menonaktifkan karyawan")
    } finally {
      setDeactivating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="flex max-h-[90vh] max-w-3xl sm:max-w-3xl flex-col overflow-hidden rounded-3xl border border-surface-variant/20 shadow-2xl p-0 gap-0">
        <div className="flex items-start justify-between gap-4 border-b border-surface-variant/20 p-6">
          <div>
            <DialogTitle className="font-headline text-xl font-bold text-on-surface">
              Detail Karyawan
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-on-surface-variant">
              {editing
                ? "Ubah informasi karyawan aktif."
                : "Informasi karyawan aktif yang sudah bergabung."}
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            {employee && !editing && (
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                onClick={() => setEditing(true)}
              >
                <Pencil size={15} />
                Edit
              </Button>
            )}

            <DialogClose asChild>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface"
                aria-label="Tutup detail karyawan"
              >
                <X size={18} />
              </button>
            </DialogClose>
          </div>
        </div>

        {!employee ? (
          <div className="flex min-h-64 items-center justify-center p-6">
            <p className="text-sm text-on-surface-variant">
              Data karyawan tidak tersedia.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 min-h-0 overflow-y-auto p-6">
              <div className="mb-5 overflow-hidden rounded-3xl border border-surface-variant/20 bg-surface-container-lowest">
                <div className="h-20 bg-linear-to-r from-primary/20 via-primary/10 to-transparent" />

                <div className="-mt-8 flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-end gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-3xl border-4 border-popover bg-primary/10 shadow-sm">
                      {employee.avatar_url ? (
                        <Image
                          src={employee.avatar_url}
                          alt={employee.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary">
                          {initial}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 pb-1">
                      <h3 className="truncate text-xl font-bold text-on-surface">
                        {editing ? name || employee.name : employee.name}
                      </h3>
                      <p className="truncate text-sm text-on-surface-variant">
                        {editing ? email || employee.email : employee.email}
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                    Karyawan Aktif
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-surface-variant/20 bg-surface-container-lowest p-5">
                <div className="mb-5">
                  <h4 className="font-headline text-base font-bold text-on-surface">
                    Informasi Karyawan
                  </h4>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {editing
                      ? "Pastikan data karyawan sudah sesuai sebelum disimpan."
                      : "Data berikut bersifat read-only."}
                  </p>
                </div>

                {editing ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="employee-detail-name">
                        Nama Lengkap
                      </Label>
                      <Input
                        id="employee-detail-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1.5 h-11 rounded-xl bg-surface-container-low border-surface-variant/30"
                      />
                    </div>

                    <div>
                      <Label htmlFor="employee-detail-email">Email</Label>
                      <Input
                        id="employee-detail-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5 h-11 rounded-xl bg-surface-container-low border-surface-variant/30"
                      />
                    </div>

                    <div>
                      <Label htmlFor="employee-detail-phone">
                        Nomor Telepon
                      </Label>
                      <Input
                        id="employee-detail-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1.5 h-11 rounded-xl bg-surface-container-low border-surface-variant/30"
                      />
                    </div>

                    <div>
                      <Label htmlFor="employee-detail-number">
                        Nomor Induk Karyawan
                      </Label>
                      <Input
                        id="employee-detail-number"
                        value={employeeNumber}
                        onChange={(e) => setEmployeeNumber(e.target.value)}
                        className="mt-1.5 h-11 rounded-xl bg-surface-container-low border-surface-variant/30"
                      />
                    </div>

                    <div>
                      <Label htmlFor="employee-detail-department">
                        Departemen
                      </Label>
                      <select
                        id="employee-detail-department"
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-surface-variant/30 bg-surface-container-low px-4 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Pilih Departemen</option>
                        {departments.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="employee-detail-position">
                        Jabatan
                      </Label>
                      <select
                        id="employee-detail-position"
                        value={positionId}
                        onChange={(e) => setPositionId(e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-surface-variant/30 bg-surface-container-low px-4 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Pilih Jabatan</option>
                        {positions.map((position) => (
                          <option key={position.id} value={position.id}>
                            {position.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <ReadonlyField
                      label="Tanggal Bergabung"
                      value={formatDate(employee.joined_at)}
                    />
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <ReadonlyField
                      label="Nama Lengkap"
                      value={employee.name}
                    />

                    <ReadonlyField label="Email" value={employee.email} />

                    <ReadonlyField
                      label="Nomor Telepon"
                      value={employee.phone || "-"}
                    />

                    <ReadonlyField
                      label="Nomor Induk Karyawan"
                      value={employee.employee_number || "-"}
                    />

                    <ReadonlyField
                      label="Departemen"
                      value={employee.department?.name || "-"}
                    />

                    <ReadonlyField
                      label="Jabatan"
                      value={employee.position?.title || "-"}
                    />

                    <ReadonlyField
                      label="Tanggal Bergabung"
                      value={formatDate(employee.joined_at)}
                    />
                  </div>
                )}
              </div>

              {!editing && (
                <div className="mt-5">
                  <div className="rounded-2xl border border-error/20 bg-error/5 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-error/10 text-error">
                        <AlertTriangle size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-on-surface">
                          Nonaktifkan Karyawan
                        </h4>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          Karyawan tidak akan muncul lagi di daftar Karyawan
                          Aktif, tetapi riwayat absensi dan data terkait tetap
                          tersimpan.
                        </p>

                        {!confirmDeactivate ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="mt-4 rounded-xl"
                            onClick={() => setConfirmDeactivate(true)}
                          >
                            Nonaktifkan Karyawan
                          </Button>
                        ) : (
                          <div className="mt-4 space-y-3">
                            <div>
                              <Label
                                htmlFor="deactivate-reason"
                                className="text-xs font-semibold text-on-surface-variant"
                              >
                                Alasan Nonaktif <span className="text-error">(wajib diisi)</span>
                              </Label>
                              <textarea
                                id="deactivate-reason"
                                value={deactivateReason}
                                onChange={(e) =>
                                  setDeactivateReason(e.target.value)
                                }
                                placeholder="Contoh: Resign dari perusahaan, efektif 30 Juni 2026"
                                rows={3}
                                className="mt-1.5 w-full rounded-xl border border-surface-variant/30 bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                              />
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                disabled={deactivating}
                                onClick={() => {
                                  setConfirmDeactivate(false)
                                  setDeactivateReason("")
                                }}
                              >
                                Batal
                              </Button>

                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="rounded-xl"
                                disabled={deactivating}
                                onClick={handleDeactivate}
                              >
                                {deactivating ? (
                                  <>
                                    <Loader2
                                      size={15}
                                      className="animate-spin"
                                    />
                                    Menonaktifkan...
                                  </>
                                ) : (
                                  "Ya, Nonaktifkan"
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {editing && (
              <div className="flex items-center justify-end gap-3 border-t border-surface-variant/20 px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  disabled={submitting}
                  onClick={handleCancelEdit}
                >
                  Batal
                </Button>

                <Button
                  type="submit"
                  className="rounded-xl"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
