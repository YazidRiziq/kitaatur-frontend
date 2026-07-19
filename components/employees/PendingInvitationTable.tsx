"use client"

import { useState } from "react"
import { RefreshCw, X, Copy, Check, Clock } from "lucide-react"
import type { PendingInvitation, PaginatedResponse } from "@/lib/employees/types"
import { resendInvitation, revokeInvitation } from "@/lib/employees/actions"
import { toast } from "sonner"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { TablePagination } from "./TablePagination"

interface PendingInvitationTableProps {
  data: PendingInvitation[]
  loading: boolean
  pagination: PaginatedResponse<PendingInvitation>["pagination"] | null
  onPageChange: (page: number) => void
  onRefresh: () => void
}

export function PendingInvitationTable({
  data,
  loading,
  pagination,
  onPageChange,
  onRefresh,
}: PendingInvitationTableProps) {
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<PendingInvitation | null>(null)

  async function handleResend(id: string, name: string) {
    setResendingId(id)
    try {
      const result = await resendInvitation(id)
      toast.success(`Undangan dikirim ulang ke ${name}`, {
        description: `Kode baru: ${result.data.invitation_code}`,
      })
      onRefresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengirim ulang undangan"
      )
    } finally {
      setResendingId(null)
    }
  }

  async function confirmRevoke() {
    if (!revokeTarget) return

    setRevokingId(revokeTarget.id)
    try {
      await revokeInvitation(revokeTarget.id)
      toast.success(`Undangan ${revokeTarget.name} dibatalkan`)
      onRefresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal membatalkan undangan"
      )
    } finally {
      setRevokingId(null)
      setRevokeTarget(null)
    }
  }

  async function handleCopyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success("Kode undangan disalin")
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      toast.error("Gagal menyalin kode")
    }
  }

  function formatExpiry(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    const formatted = date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

    if (diffDays < 0) return `${formatted} (Kadaluarsa)`
    if (diffDays === 0) return `${formatted} (Hari ini)`
    if (diffDays === 1) return `${formatted} (Besok)`
    return `${formatted} (${diffDays} hari lagi)`
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Nama
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Kode Undangan
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Berlaku Sampai
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
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-5 w-24 rounded-full" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-32" />
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

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-border">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Clock />
            </EmptyMedia>
            <EmptyTitle>Tidak ada undangan tertunda</EmptyTitle>
            <EmptyDescription>
              Semua undangan sudah diterima atau belum ada yang diundang.
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
                Nama
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Kode Undangan
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Berlaku Sampai
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="px-4 py-3">
                  <span className="text-sm font-medium text-foreground">
                    {invitation.name}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                  {invitation.email}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono tracking-wider">
                      {invitation.invitation_token}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleCopyCode(invitation.invitation_token)}
                      aria-label="Salin kode undangan"
                    >
                      {copiedCode === invitation.invitation_token ? (
                        <Check className="text-primary" />
                      ) : (
                        <Copy />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span
                    className={`text-xs font-medium ${
                      new Date(invitation.invitation_expires_at) < new Date()
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatExpiry(invitation.invitation_expires_at)}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleResend(invitation.id, invitation.name)}
                      disabled={resendingId === invitation.id}
                      aria-label={`Kirim ulang undangan ${invitation.name}`}
                    >
                      {resendingId === invitation.id ? (
                        <Spinner />
                      ) : (
                        <RefreshCw />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setRevokeTarget(invitation)}
                      disabled={revokingId === invitation.id}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Batalkan undangan ${invitation.name}`}
                    >
                      {revokingId === invitation.id ? (
                        <Spinner />
                      ) : (
                        <X />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {pagination && (
          <TablePagination pagination={pagination} onPageChange={onPageChange} />
        )}
      </div>

      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Undangan?</AlertDialogTitle>
            <AlertDialogDescription>
              Undangan untuk &ldquo;{revokeTarget?.name}&rdquo; akan dibatalkan.
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!revokingId}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmRevoke()
              }}
              disabled={!!revokingId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokingId ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Membatalkan...
                </>
              ) : (
                "Batalkan Undangan"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
