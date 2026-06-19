"use client"

import { useState, useEffect } from "react"
import { Loader2, Briefcase } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
          <SheetHeader className="p-6 pb-4 border-b border-surface-variant/20">
            <SheetTitle className="font-headline text-xl font-bold text-on-surface">
              {isEditing ? "Edit Jabatan" : "Tambah Jabatan"}
            </SheetTitle>
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 space-y-5"
          >
            <div className="space-y-1.5">
              <Label
                htmlFor="positionTitle"
                className="text-sm font-medium text-on-surface"
              >
                Nama Jabatan <span className="text-error">*</span>
              </Label>
              <div className="relative">
                <Briefcase
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="positionTitle"
                  placeholder="Senior Developer"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    setError("")
                  }}
                  className="pl-10 h-10 rounded-xl bg-surface-container-low border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              {error && (
                <p className="text-xs text-error mt-1">{error}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="positionGrade"
                className="text-sm font-medium text-on-surface"
              >
                Grade
              </Label>
              <div className="relative">
                <Briefcase
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="positionGrade"
                  placeholder="L3 (opsional)"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-surface-container-low border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
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