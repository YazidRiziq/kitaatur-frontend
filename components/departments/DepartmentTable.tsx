"use client"

import { useState } from "react"
import { Pencil, Trash2, FolderTree } from "lucide-react"
import type { Department } from "@/lib/departments/types"
import { deleteDepartment } from "@/lib/departments/actions"
import { toast } from "sonner"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

interface DepartmentTableProps {
  data: Department[]
  loading: boolean
  onEdit: (department: Department) => void
  onRefresh: () => void
}

export function DepartmentTable({
  data,
  loading,
  onEdit,
  onRefresh,
}: DepartmentTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)
  const [deleting, setDeleting] = useState(false)

  function handleDeleteClick(department: Department) {
    setDeleteTarget(department)
  }

  async function confirmDelete() {
    if (!deleteTarget) return

    setDeleting(true)
    try {
      await deleteDepartment(deleteTarget.id)
      toast.success(`Departemen "${deleteTarget.name}" dihapus`)
      onRefresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus departemen"
      )
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Nama Departemen
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Jumlah Karyawan
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-7 rounded-sm" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Skeleton className="size-7 rounded-md" />
                    <Skeleton className="size-7 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderTree />
            </EmptyMedia>
            <EmptyTitle>Belum ada departemen</EmptyTitle>
            <EmptyDescription>
              Tambahkan departemen baru melalui tombol di atas.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Nama Departemen
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Jumlah Karyawan
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-7 items-center justify-center rounded-sm bg-primary/10 text-primary">
                      <FolderTree className="size-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {dept.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {dept.employee_count} karyawan
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(dept)}
                      aria-label={`Edit departemen ${dept.name}`}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteClick(dept)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Hapus departemen ${dept.name}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Departemen?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && deleteTarget.employee_count > 0 ? (
                <>
                  Departemen &ldquo;{deleteTarget.name}&rdquo; tidak dapat
                  dihapus karena masih memiliki{" "}
                  <span className="font-medium text-foreground">
                    {deleteTarget.employee_count} karyawan
                  </span>{" "}
                  yang terkait. Pindahkan atau hapus karyawan terlebih dahulu.
                </>
              ) : (
                <>
                  Departemen &ldquo;{deleteTarget?.name}&rdquo; akan dihapus
                  secara permanen. Tindakan ini tidak dapat dibatalkan.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {deleteTarget && deleteTarget.employee_count > 0
                ? "Tutup"
                : "Batal"}
            </AlertDialogCancel>
            {deleteTarget && deleteTarget.employee_count === 0 && (
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  confirmDelete()
                }}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Menghapus...
                  </>
                ) : (
                  "Hapus"
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
