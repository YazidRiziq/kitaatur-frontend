"use client"

import { Eye, Users } from "lucide-react"
import type { Employee, PaginatedResponse } from "@/lib/employees/types"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { TablePagination } from "./TablePagination"

interface EmployeeTableProps {
  data: Employee[]
  loading: boolean
  pagination: PaginatedResponse<Employee>["pagination"] | null
  onPageChange: (page: number) => void
  onDetail?: (employee: Employee) => void
}

export function EmployeeTable({
  data,
  loading,
  pagination,
  onPageChange,
  onDetail,
}: EmployeeTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Karyawan
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                NIK
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Departemen
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Jabatan
              </TableHead>
              <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground text-center">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="px-4 py-3 text-center">
                  <Skeleton className="h-7 w-16 mx-auto rounded-md" />
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
              <Users />
            </EmptyMedia>
            <EmptyTitle>Belum ada karyawan</EmptyTitle>
            <EmptyDescription>
              Undang karyawan melalui tombol Tambah Karyawan di atas.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Karyawan
            </TableHead>
            <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </TableHead>
            <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              NIK
            </TableHead>
            <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Departemen
            </TableHead>
            <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Jabatan
            </TableHead>
            <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground text-center">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {employee.avatar_url ? (
                      <AvatarImage
                        src={employee.avatar_url}
                        alt={employee.name}
                      />
                    ) : null}
                    <AvatarFallback>
                      {employee.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {employee.name}
                    </p>
                    {employee.phone && (
                      <p className="text-xs text-muted-foreground">
                        {employee.phone}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                {employee.email}
              </TableCell>
              <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                {employee.employee_number || "—"}
              </TableCell>
              <TableCell className="px-4 py-3">
                <Badge variant="secondary">{employee.department.name}</Badge>
              </TableCell>
              <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                {employee.position.title || "—"}
              </TableCell>
              <TableCell className="px-4 py-3 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDetail?.(employee)}
                  disabled={!onDetail}
                >
                  <Eye className="size-4" />
                  Detail
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pagination && (
        <TablePagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  )
}
