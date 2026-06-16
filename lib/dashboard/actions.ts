"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import type { DashboardData } from "./types"

export async function getDashboardData(): Promise<DashboardData> {
  const cookieStore = await cookies()
  const cached = cookieStore.get("kitaatur-dashboard")
  if (cached) {
    return JSON.parse(cached.value) as DashboardData
  }

  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  const response = await fetch(`${baseUrl}/me`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  })

  if (!response.ok) {
    throw new Error("Gagal memuat data dashboard")
  }

  const data: DashboardData = await response.json()

  cookieStore.set("kitaatur-dashboard", JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
  })

  return data
}

export async function setDashboardCookie(data: DashboardData) {
  const cookieStore = await cookies()
  cookieStore.set("kitaatur-dashboard", JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
  })
}