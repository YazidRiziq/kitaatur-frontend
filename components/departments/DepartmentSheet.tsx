"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { createDepartment, updateDepartment } from "@/lib/departments/actions"
import type { Department } from "@/lib/departments/types"
import { toast } from "sonner"

interface DepartmentSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editDepartment: Department | null
}

export function DepartmentSheet({
  open,
  onOpenChange,
  onSuccess,
  editDepartment,
}: DepartmentSheetProps) {
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const isEditing = !!editDepartment

  useEffect(() => {
    if (open) {
      setName(editDepartment?.name ?? "")
      setError("")
    }
  }, [open, editDepartment])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmed = name.trim()
    if (!trimmed) {
      setError("Nama departemen wajib diisi")
      return
    }

    setSubmitting(true)
    try {
      if (isEditing && editDepartment) {
        await updateDepartment(editDepartment.id, { name: trimmed })
        toast.success(`Departemen "${trimmed}" diperbarui`)
      } else {
        await createDepartment({ name: trimmed })
        toast.success(`Departemen "${trimmed}" ditambahkan`)
      }
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menyimpan departemen"
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
              {isEditing ? "Edit Departemen" : "Tambah Departemen"}
            </SheetTitle>
            {isEditing && editDepartment && editDepartment.employee_count > 0 && (
              <p className="text-xs text-muted-foreground">
                {editDepartment.employee_count} karyawan terkait departemen ini
              </p>
            )}
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="departmentName">
                Nama Departemen <span className="text-destructive">*</span>
              </Label>
              <Input
                id="departmentName"
                placeholder="Engineering"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError("")
                }}
                autoFocus
              />
              {error && (
                <p className="text-xs text-destructive">{error}</p>
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
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
