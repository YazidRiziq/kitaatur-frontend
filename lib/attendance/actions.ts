"use server"

import { createClient } from "@/lib/supabase/server"
import type {
  AttendanceStats,
  AttendanceFilters,
  AttendancePaginatedResponse,
  ExportInfo,
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
