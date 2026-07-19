"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import type {
  CompanySettings,
  UpdateCompanySettingsInput,
  UpdateCompanySettingsResponse,
} from "@/lib/settings/types"
import type { DashboardData } from "@/lib/dashboard/types"

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

export async function getSettings(): Promise<CompanySettings> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl("/settings"), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error("Gagal memuat pengaturan perusahaan")
  }

  return response.json()
}

export async function updateSettings(
  input: UpdateCompanySettingsInput
): Promise<UpdateCompanySettingsResponse> {
  const token = await getAccessToken()

  const response = await fetch(apiUrl("/settings"), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal memperbarui pengaturan")
  }

  const text = await response.text()
  const updated: UpdateCompanySettingsResponse = text
    ? JSON.parse(text)
    : { message: "OK", data: { ...input } as unknown as CompanySettings }

  await refreshDashboardCookie(input)

  return updated
}

async function refreshDashboardCookie(
  input: UpdateCompanySettingsInput
): Promise<void> {
  const cookieStore = await cookies()
  const cached = cookieStore.get("kitaatur-dashboard")
  if (!cached) return

  try {
    const data: DashboardData = JSON.parse(cached.value)
    if (input.defaultLocation !== undefined && data.company) {
      data.company = {
        ...data.company,
        defaultLocation: input.defaultLocation ?? null,
      }
      cookieStore.set("kitaatur-dashboard", JSON.stringify(data), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60,
      })
    }
  } catch {
  }
}
