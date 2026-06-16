"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import type { OnboardingData } from "@/lib/onboarding/types"

export async function completeOnboardingAction(data: OnboardingData) {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error("Sesi tidak valid. Silakan login kembali.")
  }

  const { data: company, error: companyError } = await serviceClient
    .from("companies")
    .insert({
      name: data.companyName,
      industry: data.industry || null,
      timezone: data.timezone,
    })
    .select("id")
    .single()

  if (companyError || !company) {
    throw new Error(companyError?.message || "Gagal membuat perusahaan")
  }

  const { error: settingsError } = await serviceClient
    .from("company_settings")
    .insert({
      company_id: company.id,
      work_start_time: data.workStartTime,
      work_end_time: data.workEndTime,
      late_threshold_minutes: data.lateThreshold,
    })

  if (settingsError) {
    throw new Error(settingsError.message || "Gagal menyimpan pengaturan jam kerja")
  }

  if (data.departments.length > 0) {
    const { error: deptError } = await serviceClient
      .from("departments")
      .insert(
        data.departments.map((name) => ({
          company_id: company.id,
          name,
        }))
      )

    if (deptError) {
      throw new Error(deptError.message || "Gagal menyimpan departemen")
    }
  }

  const { error: profileError } = await serviceClient
    .from("profiles")
    .insert({
      id: user.id,
      company_id: company.id,
      role: "OWNER",
      full_name: user.user_metadata?.full_name || "Administrator",
    })

  if (profileError) {
    throw new Error(profileError.message || "Gagal menyimpan profil")
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: { onboarding_complete: true },
  })

  if (updateError) {
    throw new Error(updateError.message || "Gagal memperbarui status onboarding")
  }

  revalidatePath("/", "layout")
  redirect("/overview")
}