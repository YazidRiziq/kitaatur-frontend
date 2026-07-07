"use server"

import { createClient } from "@/lib/supabase/server"
import type {
  LeaveStats,
  LeaveFilters,
  LeavePaginatedResponse,
  LeaveExportInfo,
  CreateLeaveInput,
  CreateLeaveResponse,
  UpdateLeaveStatusInput,
  UpdateLeaveStatusResponse,
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

export async function getLeaveStats(): Promise<LeaveStats> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl("/leave-requests/stats"), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error("Gagal memuat statistik cuti")
  }

  return response.json()
}

export async function getLeaveRequests(
  filters: LeaveFilters = {}
): Promise<LeavePaginatedResponse> {
  const token = await getAccessToken()

  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.status) params.set("status", filters.status)
  if (filters.type) params.set("type", filters.type)
  if (filters.page) params.set("page", String(filters.page))

  const queryString = params.toString()
  const response = await fetch(
    apiUrl(`/leave-requests${queryString ? `?${queryString}` : ""}`),
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!response.ok) {
    throw new Error("Gagal memuat data pengajuan cuti")
  }

  return response.json()
}

export async function updateLeaveStatus(
  id: string,
  input: UpdateLeaveStatusInput
): Promise<UpdateLeaveStatusResponse> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl(`/leave-requests/${id}/status`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal memperbarui status cuti")
  }

  return response.json()
}

export async function createLeaveRequest(
  input: CreateLeaveInput
): Promise<CreateLeaveResponse> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl("/leave-requests"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal membuat pengajuan cuti")
  }

  return response.json()
}

export async function getLeaveExportInfo(
  filters: { search?: string; status?: string; type?: string }
): Promise<LeaveExportInfo> {
  const token = await getAccessToken()

  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.status) params.set("status", filters.status)
  if (filters.type) params.set("type", filters.type)

  const queryString = params.toString()
  const url = apiUrl(`/leave-requests/export${queryString ? `?${queryString}` : ""}`)

  return { url, token }
}
