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
import { createPosition, updatePosition } from "@/lib/positions/actions"
import type { Position } from "@/lib/positions/types"
import { toast } from "sonner"

interface PositionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editPosition: Position | null
}

export function PositionSheet({
  open,
  onOpenChange,
  onSuccess,
  editPosition,
}: PositionSheetProps) {
  const [title, setTitle] = useState("")
  const [grade, setGrade] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const isEditing = !!editPosition

  useEffect(() => {
    if (open) {
      setTitle(editPosition?.title ?? "")
      setGrade(editPosition?.grade ?? "")
      setError("")
    }
  }, [open, editPosition])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError("Nama jabatan wajib diisi")
      return
    }

    setSubmitting(true)
    try {
      const input = {
        title: trimmedTitle,
        grade: grade.trim() || undefined,
      }

      if (isEditing && editPosition) {
        await updatePosition(editPosition.id, input)
        toast.success(`Jabatan "${trimmedTitle}" diperbarui`)
      } else {
        await createPosition(input)
        toast.success(`Jabatan "${trimmedTitle}" ditambahkan`)
      }
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menyimpan jabatan"
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
              {isEditing ? "Edit Jabatan" : "Tambah Jabatan"}
            </SheetTitle>
            {isEditing && editPosition && editPosition.employee_count > 0 && (
              <p className="text-xs text-muted-foreground">
                {editPosition.employee_count} karyawan terkait jabatan ini
              </p>
            )}
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="positionTitle">
                Nama Jabatan <span className="text-destructive">*</span>
              </Label>
              <Input
                id="positionTitle"
                placeholder="Senior Developer"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setError("")
                }}
                autoFocus
              />
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="positionGrade">Grade</Label>
              <Input
                id="positionGrade"
                placeholder="L3 (opsional)"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Tingkat level jabatan, contoh: L1, L2, M1
              </p>
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
