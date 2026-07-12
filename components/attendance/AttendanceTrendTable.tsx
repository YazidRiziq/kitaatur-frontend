import { User } from "lucide-react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import type { AttendanceEmployeeTrend } from "@/lib/attendance/types"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  tepat_waktu: "bg-primary",
  terlambat: "bg-accent-yellow",
  di_luar_radius: "bg-accent-tomato",
  tidak_hadir: "bg-muted",
}

const statusLabels: Record<string, string> = {
  tepat_waktu: "Tepat Waktu",
  terlambat: "Terlambat",
  di_luar_radius: "Di Luar Radius",
  tidak_hadir: "Tidak Hadir",
}

function formatDay(dateStr: string): string {
  const [, month, day] = dateStr.split("-")
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
  return `${parseInt(day)} ${months[parseInt(month) - 1]}`
}

function StatusDots({ days }: { days: AttendanceEmployeeTrend["dailyStatus"] }) {
  return (
    <div className="flex items-center gap-0.5">
      {days.map((day) => {
        const color = day.status === null ? "bg-border" : statusColors[day.status]
        const label = day.status === null
          ? `${formatDay(day.date)}: Tidak ada data`
          : `${formatDay(day.date)}: ${statusLabels[day.status]}`
        return (
          <span
            key={day.date}
            title={label}
            className={cn("size-2.5 rounded-sm transition-transform hover:scale-125", color)}
          />
        )
      })}
    </div>
  )
}

interface AttendanceTrendTableProps {
  employees: AttendanceEmployeeTrend[]
}

export function AttendanceTrendTable({ employees }: AttendanceTrendTableProps) {
  if (employees.length === 0) {
    return (
      <div className="rounded-lg border border-border">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User />
            </EmptyMedia>
            <EmptyTitle>Belum ada data karyawan</EmptyTitle>
            <EmptyDescription>
              Data tren akan muncul setelah karyawan melakukan absensi.
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
            <TableHead className="h-11 px-4 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Hadir
            </TableHead>
            <TableHead className="h-11 px-4 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Telat
            </TableHead>
            <TableHead className="h-11 px-4 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              L. Radius
            </TableHead>
            <TableHead className="h-11 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Aktivitas
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp) => (
            <TableRow key={emp.employeeId}>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar size="sm">
                    {emp.avatarUrl ? (
                      <AvatarImage src={emp.avatarUrl} alt={emp.name} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {emp.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.position}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {emp.hadirCount}/{emp.totalDays}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{emp.hadirRate}%</span>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-center">
                <span className={cn(
                  "text-sm font-medium tabular-nums",
                  emp.telatCount > 0 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {emp.telatCount}
                </span>
              </TableCell>
              <TableCell className="px-4 py-3 text-center">
                <span className={cn(
                  "text-sm font-medium tabular-nums",
                  emp.outOfRangeCount > 0 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {emp.outOfRangeCount}
                </span>
              </TableCell>
              <TableCell className="px-4 py-3">
                <StatusDots days={emp.dailyStatus} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
