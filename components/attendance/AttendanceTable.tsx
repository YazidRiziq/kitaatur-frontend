import Link from "next/link"
import { User, MapPin, MapPinOff, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import type { AttendanceRecord, AttendancePagination, LocationStatus } from "@/lib/attendance/types"
import { cn } from "@/lib/utils"

function LocationBadge({ status, label }: { status: LocationStatus; label?: string }) {
  if (status === "in_radius") {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <Badge variant="secondary" className="gap-1">
          <MapPin className="size-3" />
          In Radius
        </Badge>
        {label && <span className="text-[10px] text-muted-foreground max-w-[140px] truncate">{label}</span>}
      </div>
    )
  }
  if (status === "out_of_range") {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="size-3" />
          Di Luar Radius
        </Badge>
        {label && <span className="text-[10px] text-muted-foreground max-w-[140px] truncate">{label}</span>}
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Badge variant="outline" className="gap-1">
        <MapPinOff className="size-3" />
        Tanpa Lokasi
      </Badge>
    </div>
  )
}

function buildPageUrl(base: string, page: number): string {
  return `${base}&page=${page}`
}

interface AttendanceTableProps {
  data: AttendanceRecord[]
  pagination: AttendancePagination | null
  currentPage: number
  searchBase: string
}

export function AttendanceTable({
  data,
  pagination,
  currentPage,
  searchBase,
}: AttendanceTableProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User />
            </EmptyMedia>
            <EmptyTitle>Belum ada data kehadiran</EmptyTitle>
            <EmptyDescription>
              Data akan muncul setelah karyawan melakukan check-in.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Karyawan
              </TableHead>
              <TableHead className="h-11 px-4 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Check-In
              </TableHead>
              <TableHead className="h-11 px-4 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Check-Out
              </TableHead>
              <TableHead className="h-11 px-4 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="h-11 px-4 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Lokasi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      {row.employee.avatarUrl ? (
                        <AvatarImage src={row.employee.avatarUrl} alt={row.employee.name} />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {row.employee.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.employee.name}</p>
                      <p className="text-xs text-muted-foreground">{row.employee.position}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm tabular-nums">
                  <span className={cn(row.status === "Terlambat" && "font-medium text-destructive")}>
                    {row.checkIn}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm tabular-nums text-muted-foreground">
                  {row.checkOut ?? "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-center">
                  <Badge variant={row.status === "Terlambat" ? "destructive" : "secondary"}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-center">
                  <LocationBadge status={row.locationStatus} label={row.locationLabel} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-4">
          <p className="text-xs text-muted-foreground">
            Menampilkan {(pagination.page - 1) * pagination.perPage + 1}–
            {Math.min(pagination.page * pagination.perPage, pagination.total)} dari{" "}
            {pagination.total} data
          </p>
          <div className="flex items-center gap-1">
            {currentPage > 1 && (
              <Link
                href={buildPageUrl(searchBase, currentPage - 1)}
                className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="size-4" />
              </Link>
            )}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (pagination.totalPages <= 5) return true
                if (p === 1 || p === pagination.totalPages) return true
                if (Math.abs(p - currentPage) <= 1) return true
                return false
              })
              .map((p, idx, arr) => {
                const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
                return (
                  <span key={p} className="flex items-center gap-1">
                    {showEllipsis && <span className="px-1 text-xs text-muted-foreground">…</span>}
                    <Link
                      href={buildPageUrl(searchBase, p)}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
                        p === currentPage
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      )}
                    >
                      {p}
                    </Link>
                  </span>
                )
              })}
            {currentPage < pagination.totalPages && (
              <Link
                href={buildPageUrl(searchBase, currentPage + 1)}
                className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
