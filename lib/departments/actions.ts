"use server"

import { createClient } from "@/lib/supabase/server"
import type { Department, DepartmentInput } from "./types"

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

export async function getDepartments(): Promise<Department[]> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl("/departments"), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error("Gagal memuat data departemen")
  }

  const json = await response.json()
  return json?.data ?? json ?? []
}

export async function createDepartment(
  input: DepartmentInput
): Promise<Department> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl("/departments"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal menambah departemen")
  }

  return response.json()
}

export async function updateDepartment(
  id: string,
  input: DepartmentInput
): Promise<Department> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl(`/departments/${id}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal mengubah departemen")
  }

  return response.json()
}

export async function deleteDepartment(id: string): Promise<void> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl(`/departments/${id}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal menghapus departemen")
  }
}