"use client"

import { useState, useEffect } from "react"
import { Loader2, Mail, User, Phone, Hash, Building, Briefcase } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { inviteEmployee } from "@/lib/employees/actions"
import { getDepartments } from "@/lib/departments/actions"
import { getPositions } from "@/lib/positions/actions"
import type { Department } from "@/lib/departments/types"
import type { Position } from "@/lib/positions/types"
import { toast } from "sonner"

interface InviteEmployeeSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function InviteEmployeeSheet({
  open,
  onOpenChange,
  onSuccess,
}: InviteEmployeeSheetProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [employeeNumber, setEmployeeNumber] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [positionId, setPositionId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)

  useEffect(() => {
    if (!open) return

    setName("")
    setEmail("")
    setPhone("")
    setEmployeeNumber("")
    setDepartmentId("")
    setPositionId("")
    setErrors({})

    setLoadingDropdowns(true)
    Promise.all([
      getDepartments(),
      getPositions(),
    ])
      .then(([depts, pos]) => {
        setDepartments(depts)
        setPositions(pos)
      })
      .catch(() => {
        toast.error("Gagal memuat data departemen dan jabatan")
        setDepartments([])
        setPositions([])
      })
      .finally(() => setLoadingDropdowns(false))
  }, [open])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Nama karyawan wajib diisi"
    }
    if (!email.trim()) {
      newErrors.email = "Email wajib diisi"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak valid"
    }
    if (!departmentId) {
      newErrors.departmentId = "Departemen wajib dipilih"
    }
    if (!positionId) {
      newErrors.positionId = "Jabatan wajib dipilih"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    setSubmitting(true)
    try {
      const result = await inviteEmployee({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        employee_number: employeeNumber.trim() || undefined,
        department_id: departmentId,
        position_id: positionId,
      })

      toast.success(`Undangan terkirim ke ${result.data.email}`, {
        description: `Kode undangan: ${result.data.invitation_code}`,
      })

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengirim undangan"
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
              Undang Karyawan Baru
            </SheetTitle>
            <SheetDescription>
              Kode undangan akan ditampilkan setelah berhasil. Bagikan kode
              tersebut ke karyawan secara manual.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-on-surface">
                Nama Lengkap <span className="text-error">*</span>
              </Label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="name"
                  placeholder="Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-surface-container-low border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-error mt-1">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-on-surface">
                Email <span className="text-error">*</span>
              </Label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="budi@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-surface-container-low border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-error mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium text-on-surface">
                Nomor Telepon
              </Label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="phone"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-surface-container-low border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="employeeNumber"
                className="text-sm font-medium text-on-surface"
              >
                Nomor Induk Karyawan
              </Label>
              <div className="relative">
                <Hash
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="employeeNumber"
                  placeholder="EMP-001"
                  value={employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-surface-container-low border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="department"
                className="text-sm font-medium text-on-surface"
              >
                Departemen <span className="text-error">*</span>
              </Label>
              <div className="relative">
                <Building
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <select
                  id="department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={loadingDropdowns}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-container-low border-none text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none disabled:opacity-50 appearance-none"
                >
                  <option value="">
                    {loadingDropdowns ? "Memuat..." : "Pilih Departemen"}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.departmentId && (
                <p className="text-xs text-error mt-1">{errors.departmentId}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="position"
                className="text-sm font-medium text-on-surface"
              >
                Jabatan <span className="text-error">*</span>
              </Label>
              <div className="relative">
                <Briefcase
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <select
                  id="position"
                  value={positionId}
                  onChange={(e) => setPositionId(e.target.value)}
                  disabled={loadingDropdowns}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-container-low border-none text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none disabled:opacity-50 appearance-none"
                >
                  <option value="">
                    {loadingDropdowns ? "Memuat..." : "Pilih Jabatan"}
                  </option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.title}
                    </option>
                  ))}
                </select>
              </div>
              {errors.positionId && (
                <p className="text-xs text-error mt-1">{errors.positionId}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting || loadingDropdowns}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 font-semibold text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    Kirim Undangan
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