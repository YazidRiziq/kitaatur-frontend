"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { OnboardingData } from "@/lib/onboarding/types"
import { setDashboardCookie } from "@/lib/dashboard/actions"
import type { DashboardData } from "@/lib/dashboard/types"

export async function completeOnboardingAction(data: OnboardingData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error("Sesi tidak valid. Silakan login kembali.")
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  if (!accessToken) {
    throw new Error("Token akses tidak tersedia. Silakan login kembali.")
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error("API URL tidak dikonfigurasi")
  }

  const payload = {
    user_id: user.id,
    full_name: user.user_metadata?.full_name || "Administrator",
    company_name: data.companyName,
    industry: data.industry || null,
    timezone: data.timezone,
    work_start_time: data.workStartTime,
    work_end_time: data.workEndTime,
    late_threshold_minutes: data.lateThreshold,
    working_days: data.workingDays,
    departments: data.departments,
  }

  const response = await fetch(`${baseUrl}/onboarding`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || "Gagal menyelesaikan onboarding")
  }

  const dashboardData: DashboardData = await response.json()
  await setDashboardCookie(dashboardData)
  await supabase.auth.refreshSession()

  revalidatePath("/", "layout")
  redirect("/overview")
}