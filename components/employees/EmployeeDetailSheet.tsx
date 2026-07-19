"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { AlertTriangle, Pencil, Save, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateEmployee, deactivateEmployee } from "@/lib/employees/actions"
import type { Employee, WorkLocation } from "@/lib/employees/types"
import type { Department } from "@/lib/departments/types"
import type { Position } from "@/lib/positions/types"
import { WorkLocationEditor } from "@/components/employees/WorkLocationEditor"

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

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value || "—"}</dd>
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
  const [workLocation, setWorkLocation] = React.useState<WorkLocation | null>(null)

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
    setWorkLocation(employee.workLocation ?? null)
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
      <DialogContent showCloseButton={false} className="flex max-h-[90vh] max-w-2xl sm:max-w-2xl flex-col overflow-hidden p-0 gap-0">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <DialogTitle className="text-lg font-medium text-foreground">
              {editing ? "Edit Karyawan" : "Detail Karyawan"}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
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
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            )}

            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Tutup detail karyawan"
              >
                <X />
              </Button>
            </DialogClose>
          </div>
        </div>

        {!employee ? (
          <div className="flex min-h-64 items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">
              Data karyawan tidak tersedia.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
              {/* Profile Section */}
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  {employee.avatar_url ? (
                    <AvatarImage
                      src={employee.avatar_url}
                      alt={employee.name}
                    />
                  ) : null}
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {initial}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-medium text-foreground">
                    {editing ? name || employee.name : employee.name}
                  </h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {editing ? email || employee.email : employee.email}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    Karyawan Aktif
                  </Badge>
                </div>
              </div>

              <Separator />

              {editing ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="employee-detail-name">
                        Nama Lengkap
                      </Label>
                      <Input
                        id="employee-detail-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="employee-detail-email">Email</Label>
                      <Input
                        id="employee-detail-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="employee-detail-phone">
                        Nomor Telepon
                      </Label>
                      <Input
                        id="employee-detail-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="employee-detail-number">
                        Nomor Induk Karyawan
                      </Label>
                      <Input
                        id="employee-detail-number"
                        value={employeeNumber}
                        onChange={(e) => setEmployeeNumber(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Departemen</Label>
                      <Select value={departmentId} onValueChange={setDepartmentId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Departemen" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem key={department.id} value={department.id}>
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Jabatan</Label>
                      <Select value={positionId} onValueChange={setPositionId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem key={position.id} value={position.id}>
                              {position.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Bergabung sejak {formatDate(employee.joined_at)}
                  </p>
                </>
              ) : (
                <>
                  {/* Informasi Pribadi */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Informasi Pribadi
                    </h4>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <InfoField label="Nama Lengkap" value={employee.name} />
                      <InfoField label="Email" value={employee.email} />
                      <InfoField label="Nomor Telepon" value={employee.phone} />
                      <InfoField label="Nomor Induk Karyawan" value={employee.employee_number} />
                    </dl>
                  </div>

                  <Separator />

                  {/* Informasi Organisasi */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Informasi Organisasi
                    </h4>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <InfoField label="Departemen" value={employee.department?.name} />
                      <InfoField label="Jabatan" value={employee.position?.title} />
                      <InfoField label="Tanggal Bergabung" value={formatDate(employee.joined_at)} />
                    </dl>
                  </div>

                  <Separator />

                  {/* Lokasi Kerja */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      Lokasi Kerja
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Atur lokasi absensi khusus untuk karyawan lapangan.
                      Jika kosong, karyawan menggunakan lokasi default kantor.
                    </p>
                    <WorkLocationEditor
                      employeeId={employee.id}
                      currentLocation={workLocation}
                      onUpdated={setWorkLocation}
                    />
                  </div>

                  <Separator />

                  {/* Zona Berbahaya */}
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-destructive/10 text-destructive">
                        <AlertTriangle className="size-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-foreground">
                          Nonaktifkan Karyawan
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Karyawan tidak akan muncul lagi di daftar Karyawan
                          Aktif, tetapi riwayat absensi dan data terkait tetap
                          tersimpan.
                        </p>

                        {!confirmDeactivate ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="mt-4"
                            onClick={() => setConfirmDeactivate(true)}
                          >
                            Nonaktifkan Karyawan
                          </Button>
                        ) : (
                          <div className="mt-4 space-y-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="deactivate-reason">
                                Alasan Nonaktif{" "}
                                <span className="text-destructive">(wajib diisi)</span>
                              </Label>
                              <Textarea
                                id="deactivate-reason"
                                value={deactivateReason}
                                onChange={(e) =>
                                  setDeactivateReason(e.target.value)
                                }
                                placeholder="Contoh: Resign dari perusahaan, efektif 30 Juni 2026"
                                rows={3}
                              />
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
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
                                disabled={deactivating}
                                onClick={handleDeactivate}
                              >
                                {deactivating ? (
                                  <>
                                    <Spinner data-icon="inline-start" />
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
                </>
              )}
            </div>

            {editing && (
              <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={handleCancelEdit}
                >
                  Batal
                </Button>

                <Button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5" />
                      Simpan Perubahan
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
