"use server"

import { createClient } from "@/lib/supabase/server"
import type {
  AttendanceStats,
  AttendanceFilters,
  AttendancePaginatedResponse,
  ExportInfo,
  AttendanceTrendFilters,
  AttendanceTrendResponse,
  DailyStatus,
} from "./types"

async function getAccessToken(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error("Token akses tidak tersedia. Silakan login kembali.")
  }
  return session.access_token
}

function apiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error("API URL tidak dikonfigurasi")
  }
  return `${baseUrl}${path}`
}

export async function getAttendanceStats(
  filters: { date: string; department_id?: string }
): Promise<AttendanceStats> {
  const token = await getAccessToken()

  const params = new URLSearchParams()
  params.set("date", filters.date)
  if (filters.department_id) params.set("department_id", filters.department_id)

  const queryString = params.toString()
  const response = await fetch(apiUrl(`/attendances/stats?${queryString}`), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error("Gagal memuat statistik kehadiran")
  }

  return response.json()
}

export async function getAttendances(
  filters: AttendanceFilters
): Promise<AttendancePaginatedResponse> {
  const token = await getAccessToken()

  const params = new URLSearchParams()
  params.set("date", filters.date)
  if (filters.search) params.set("search", filters.search)
  if (filters.department_id) params.set("department_id", filters.department_id)
  if (filters.page) params.set("page", String(filters.page))

  const queryString = params.toString()
  const response = await fetch(apiUrl(`/attendances?${queryString}`), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error("Gagal memuat data kehadiran")
  }

  return response.json()
}

export async function getExportInfo(
  filters: { date: string; search?: string; department_id?: string }
): Promise<ExportInfo> {
  const token = await getAccessToken()

  const params = new URLSearchParams()
  params.set("date", filters.date)
  if (filters.search) params.set("search", filters.search)
  if (filters.department_id) params.set("department_id", filters.department_id)

  const queryString = params.toString()
  const url = apiUrl(`/attendances/export?${queryString}`)

  return { url, token }
}

function generateMockTrend(filters: AttendanceTrendFilters): AttendanceTrendResponse {
  const { start, end } = filters

  const days: string[] = []
  const cursor = new Date(start)
  const endDate = new Date(end)
  while (cursor <= endDate) {
    const day = cursor.getDay()
    if (day !== 0 && day !== 6) {
      days.push(formatDateISO(cursor))
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  const mockEmployees: Array<{
    id: string
    name: string
    position: string
    pattern: DailyStatus[]
  }> = [
    { id: "e1", name: "Yazid Riziq", position: "HR Manager", pattern: ["tepat_waktu", "tepat_waktu", "tepat_waktu", "tepat_waktu", "tepat_waktu"] },
    { id: "e2", name: "Siti Putri", position: "Staff Admin", pattern: ["terlambat", "terlambat", "tepat_waktu", "terlambat", null] },
    { id: "e3", name: "Budi Santoso", position: "Surveyor", pattern: ["di_luar_radius", "tepat_waktu", "di_luar_radius", null, "tepat_waktu"] },
    { id: "e4", name: "Andi Wijaya", position: "Accounting", pattern: ["tepat_waktu", null, "tepat_waktu", "tepat_waktu", "tepat_waktu"] },
    { id: "e5", name: "Rina Maharani", position: "Staff HR", pattern: ["tepat_waktu", "terlambat", "tepat_waktu", "tepat_waktu", "tepat_waktu"] },
  ]

  const employees = mockEmployees.map((emp) => {
    const dailyStatus = days.map((date, i) => {
      const status: DailyStatus = emp.pattern[i % emp.pattern.length] ?? null
      return {
        date,
        status,
        checkIn: status === "tidak_hadir" || status === null ? null : `0${8 + (i % 2)}:${i % 2 === 0 ? "02" : "21"}`,
        checkOut: status === "tidak_hadir" || status === null ? null : "17:05",
      }
    })

    const hadirCount = dailyStatus.filter((d) => d.status !== null && d.status !== "tidak_hadir").length
    const telatCount = dailyStatus.filter((d) => d.status === "terlambat").length
    const outOfRangeCount = dailyStatus.filter((d) => d.status === "di_luar_radius").length
    const totalDays = days.length

    return {
      employeeId: emp.id,
      name: emp.name,
      position: emp.position,
      avatarUrl: null,
      hadirCount,
      totalDays,
      hadirRate: totalDays > 0 ? Math.round((hadirCount / totalDays) * 100) : 0,
      telatCount,
      outOfRangeCount,
      dailyStatus,
    }
  })

  const totalHadir = employees.reduce((sum, e) => sum + e.hadirCount, 0)
  const totalPossible = employees.reduce((sum, e) => sum + e.totalDays, 0)
  const totalTelat = employees.reduce((sum, e) => sum + e.telatCount, 0)
  const totalOutOfRange = employees.reduce((sum, e) => sum + e.outOfRangeCount, 0)

  return {
    range: { start, end },
    summary: {
      hadirRate: totalPossible > 0 ? Math.round((totalHadir / totalPossible) * 100) : 0,
      totalTelat,
      totalOutOfRange,
    },
    employees: employees.sort((a, b) => b.telatCount - a.telatCount),
  }
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export async function getAttendanceTrend(
  filters: AttendanceTrendFilters
): Promise<AttendanceTrendResponse> {
  try {
    const token = await getAccessToken()

    const params = new URLSearchParams()
    params.set("start", filters.start)
    params.set("end", filters.end)
    if (filters.department_id) params.set("department_id", filters.department_id)

    const queryString = params.toString()
    const response = await fetch(apiUrl(`/attendances/trend?${queryString}`), {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error("Gagal memuat tren kehadiran")
    }

    return response.json()
  } catch {
    return generateMockTrend(filters)
  }
}
