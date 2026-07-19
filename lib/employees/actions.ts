"use server"

import { createClient } from "@/lib/supabase/server"
import type {
  InviteEmployeeInput,
  InviteEmployeeResponse,
  UpdateEmployeeInput,
  UpdateEmployeeResponse,
  DeactivateEmployeeInput,
  DeactivateEmployeeResponse,
  ResendInvitationResponse,
  RevokeInvitationResponse,
  Employee,
  PendingInvitation,
  EmployeeFilters,
  PaginatedResponse,
  UpdateWorkLocationInput,
  UpdateWorkLocationResponse,
} from "@/lib/employees/types"

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

export async function inviteEmployee(
  input: InviteEmployeeInput
): Promise<InviteEmployeeResponse> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl("/employees/invite"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal mengirim undangan")
  }

  return response.json()
}

// Fungsi untuk mendapatkan daftar karyawan aktif dengan filter dan pagination
export async function getActiveEmployees(
  filters: EmployeeFilters = {}
): Promise<PaginatedResponse<Employee>> {
  const token = await getAccessToken()
  const params = new URLSearchParams()

  if (filters.search) params.set("search", filters.search)
  if (filters.department_id) params.set("department_id", filters.department_id)
  if (filters.position_id) params.set("position_id", filters.position_id)
  if (filters.page) params.set("page", String(filters.page))  

  const queryString = params.toString()
  const url = apiUrl(`/employees${queryString ? `?${queryString}` : ""}`)

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error("Gagal memuat data karyawan")
  }

  return response.json()
}

export async function updateEmployee(
  id: string,
  input: UpdateEmployeeInput
): Promise<UpdateEmployeeResponse> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl(`/employees/${id}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal memperbarui data karyawan")
  }

  return response.json()
}

// Fungsi untuk mendapatkan daftar undangan tertunda dengan filter dan pagination
export async function getPendingInvitations(
  filters: EmployeeFilters = {}
): Promise<PaginatedResponse<PendingInvitation>> {
  const token = await getAccessToken()
  const params = new URLSearchParams()

  if (filters.search) params.set("search", filters.search)
  if (filters.department_id) params.set("department_id", filters.department_id)
  if (filters.position_id) params.set("position_id", filters.position_id)
  if (filters.page) params.set("page", String(filters.page))

  const queryString = params.toString()
  const url = apiUrl(`/employees/pending${queryString ? `?${queryString}` : ""}`)

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error("Gagal memuat data undangan tertunda")
  }

  return response.json()
}

export async function resendInvitation(
  id: string
): Promise<ResendInvitationResponse> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl(`/employees/${id}/resend`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal mengirim ulang undangan")
  }

  return response.json()
}

export async function revokeInvitation(
  id: string
): Promise<RevokeInvitationResponse> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl(`/employees/${id}/revoke`), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal membatalkan undangan")
  }

  return response.json()
}

export async function deactivateEmployee(
  id: string,
  input: DeactivateEmployeeInput = {}
): Promise<DeactivateEmployeeResponse> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl(`/employees/${id}/status`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason: input.reason }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal menonaktifkan karyawan")
  }

  return response.json()
}

export async function updateEmployeeWorkLocation(
  id: string,
  input: UpdateWorkLocationInput | null
): Promise<UpdateWorkLocationResponse> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl(`/employees/${id}/work-location`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal memperbarui lokasi kerja karyawan")
  }

  const text = await response.text()
  if (!text) {
    return { message: "OK", data: { id, workLocation: input } } as UpdateWorkLocationResponse
  }
  return JSON.parse(text) as UpdateWorkLocationResponse
}

export async function resetEmployeeWorkLocation(
  id: string
): Promise<UpdateWorkLocationResponse> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl(`/employees/${id}/work-location`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal mereset lokasi kerja karyawan")
  }

  const text = await response.text()
  if (!text) {
    return { message: "OK", data: { id, workLocation: null } }
  }
  return JSON.parse(text) as UpdateWorkLocationResponse
}