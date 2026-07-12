import { UserCheck, Clock, LogOut } from "lucide-react"
import { getAttendanceStats, getAttendances, getAttendanceTrend } from "@/lib/attendance/actions"
import { getDepartments } from "@/lib/departments/actions"
import { AttendanceStatCard } from "@/components/attendance/AttendanceStatCard"
import { AttendanceTable } from "@/components/attendance/AttendanceTable"
import { AttendanceViewTabs } from "@/components/attendance/AttendanceViewTabs"
import { AttendanceFilters } from "@/components/attendance/AttendanceFilters"
import { AttendanceTrendFilters } from "@/components/attendance/AttendanceTrendFilters"
import { AttendanceTrendStats } from "@/components/attendance/AttendanceTrendStats"
import { AttendanceTrendTable } from "@/components/attendance/AttendanceTrendTable"
import { ExportButton } from "@/components/attendance/ExportButton"

function formatDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekEnd(date: Date): Date {
  const d = getWeekStart(date)
  d.setDate(d.getDate() + 6)
  return d
}

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string {
  const val = params[key]
  if (Array.isArray(val)) return val[0] ?? ""
  return val ?? ""
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const view = getParam(params, "view") === "trend" ? "trend" : "snapshot"
  const department = getParam(params, "department")
  const search = getParam(params, "search")

  let departments: Awaited<ReturnType<typeof getDepartments>> = []
  try {
    departments = await getDepartments()
  } catch {
    departments = []
  }

  const today = formatDateISO(new Date())
  const weekStart = formatDateISO(getWeekStart(new Date()))
  const weekEnd = formatDateISO(getWeekEnd(new Date()))

  const snapshotHref = `/attendance?view=snapshot${department ? `&department=${encodeURIComponent(department)}` : ""}`
  const trendHref = `/attendance?view=trend${department ? `&department=${encodeURIComponent(department)}` : ""}`

  if (view === "trend") {
    const start = getParam(params, "start") || weekStart
    const end = getParam(params, "end") || weekEnd

    const trendData = await getAttendanceTrend({
      start,
      end,
      department_id: department || undefined,
    })

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-[1.75rem] leading-tight font-medium tracking-[-0.42px] text-foreground">
            Data Absensi
          </h1>
          <p className="text-sm text-muted-foreground">
            Pantau pola disiplin kehadiran dari waktu ke waktu.
          </p>
        </div>

        <AttendanceViewTabs
          activeView="trend"
          snapshotHref={snapshotHref}
          trendHref={trendHref}
        />

        <AttendanceTrendFilters
          departments={departments}
          currentStart={start}
          currentEnd={end}
          currentDepartment={department}
        />

        <AttendanceTrendStats summary={trendData.summary} range={trendData.range} />

        <AttendanceTrendTable employees={trendData.employees} />
      </div>
    )
  }

  const date = getParam(params, "date") || today
  const page = Number(getParam(params, "page")) || 1

  let stats: Awaited<ReturnType<typeof getAttendanceStats>> | null = null
  let attendances: Awaited<ReturnType<typeof getAttendances>> | null = null

  try {
    stats = await getAttendanceStats({
      date,
      department_id: department || undefined,
    })
  } catch {
    stats = null
  }

  try {
    attendances = await getAttendances({
      date,
      search: search || undefined,
      department_id: department || undefined,
      page,
    })
  } catch {
    attendances = null
  }

  const searchBase = `/attendance?view=snapshot&date=${encodeURIComponent(date)}${search ? `&search=${encodeURIComponent(search)}` : ""}${department ? `&department=${encodeURIComponent(department)}` : ""}`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] leading-tight font-medium tracking-[-0.42px] text-foreground">
            Data Absensi
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola dan pantau kehadiran seluruh departemen hari ini.
          </p>
        </div>
        <ExportButton date={date} search={search || undefined} departmentId={department || undefined} />
      </div>

      <AttendanceViewTabs
        activeView="snapshot"
        snapshotHref={snapshotHref}
        trendHref={trendHref}
      />

      <AttendanceFilters
        departments={departments}
        currentSearch={search}
        currentDepartment={department}
        currentDate={date}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AttendanceStatCard
          title="Total Hadir"
          value={stats?.hadir ?? "—"}
          subValue={stats ? `/ ${stats.total} Karyawan` : undefined}
          subtitle={stats ? "Karyawan hadir hari ini" : "Gagal memuat data"}
          icon={UserCheck}
          variant="default"
        />
        <AttendanceStatCard
          title="Terlambat"
          value={stats?.terlambat ?? "—"}
          subtitle={stats ? "Butuh perhatian" : "Gagal memuat data"}
          icon={Clock}
          variant={stats && stats.terlambat > 0 ? "destructive" : "default"}
        />
        <AttendanceStatCard
          title="Belum Check-Out"
          value={stats?.belumCheckOut ?? "—"}
          subtitle={stats ? "Masih bekerja" : "Gagal memuat data"}
          icon={LogOut}
          variant="secondary"
        />
      </div>

      {attendances && (
        <AttendanceTable
          data={attendances.data}
          pagination={attendances.pagination}
          currentPage={page}
          searchBase={searchBase}
        />
      )}
    </div>
  )
}
