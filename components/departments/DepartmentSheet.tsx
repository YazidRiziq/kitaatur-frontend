"use client"

import { useState, useEffect } from "react"
import { Loader2, FolderTree } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
          <SheetHeader className="p-6 pb-4 border-b border-surface-variant/20">
            <SheetTitle className="font-headline text-xl font-bold text-on-surface">
              {isEditing ? "Edit Departemen" : "Tambah Departemen"}
            </SheetTitle>
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 space-y-5"
          >
            <div className="space-y-1.5">
              <Label
                htmlFor="departmentName"
                className="text-sm font-medium text-on-surface"
              >
                Nama Departemen <span className="text-error">*</span>
              </Label>
              <div className="relative">
                <FolderTree
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="departmentName"
                  placeholder="Engineering"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError("")
                  }}
                  className="pl-10 h-10 rounded-xl bg-surface-container-low border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              {error && (
                <p className="text-xs text-error mt-1">{error}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 font-semibold text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
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