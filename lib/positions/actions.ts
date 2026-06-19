"use server"

import { createClient } from "@/lib/supabase/server"
import type { Position, PositionInput } from "./types"

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

export async function getPositions(): Promise<Position[]> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl("/positions"), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error("Gagal memuat data jabatan")
  }

  const json = await response.json()
  return json?.data ?? json ?? []
}

export async function createPosition(
  input: PositionInput
): Promise<Position> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl("/positions"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal menambah jabatan")
  }

  return response.json()
}

export async function updatePosition(
  id: string,
  input: PositionInput
): Promise<Position> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl(`/positions/${id}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal mengubah jabatan")
  }

  return response.json()
}

export async function deletePosition(id: string): Promise<void> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl(`/positions/${id}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal menghapus jabatan")
  }
}