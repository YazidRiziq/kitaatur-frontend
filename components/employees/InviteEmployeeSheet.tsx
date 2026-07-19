"use client"

import { useState, useEffect } from "react"
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
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { inviteEmployee } from "@/lib/employees/actions"
import type { Department } from "@/lib/departments/types"
import type { Position } from "@/lib/positions/types"
import { toast } from "sonner"

interface InviteEmployeeSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  departments: Department[]
  positions: Position[]
}

export function InviteEmployeeSheet({
  open,
  onOpenChange,
  onSuccess,
  departments,
  positions,
}: InviteEmployeeSheetProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [employeeNumber, setEmployeeNumber] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [positionId, setPositionId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return

    setName("")
    setEmail("")
    setPhone("")
    setEmployeeNumber("")
    setDepartmentId("")
    setPositionId("")
    setErrors({})
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
          <SheetHeader className="p-6 pb-4 border-b border-border">
            <SheetTitle className="text-lg font-medium text-foreground">
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
              <Label htmlFor="invite-name">
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                id="invite-name"
                placeholder="Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="budi@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-phone">Nomor Telepon</Label>
              <Input
                id="invite-phone"
                placeholder="08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-employee-number">
                Nomor Induk Karyawan
              </Label>
              <Input
                id="invite-employee-number"
                placeholder="EMP-001"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Departemen <span className="text-destructive">*</span>
              </Label>
              <Select value={departmentId || undefined} onValueChange={setDepartmentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Departemen" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departmentId && (
                <p className="text-xs text-destructive">{errors.departmentId}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>
                Jabatan <span className="text-destructive">*</span>
              </Label>
              <Select value={positionId || undefined} onValueChange={setPositionId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Jabatan" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>
                      {pos.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.positionId && (
                <p className="text-xs text-destructive">{errors.positionId}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Mengirim...
                  </>
                ) : (
                  "Kirim Undangan"
                )}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
