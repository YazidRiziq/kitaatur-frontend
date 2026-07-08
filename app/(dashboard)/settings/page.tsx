"use client"

import { Settings as SettingsIcon } from "lucide-react"
import { WorkScheduleForm } from "@/components/settings/WorkScheduleForm"
import { LocationSettingForm } from "@/components/settings/LocationSettingForm"

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <SettingsIcon size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="font-headline tracking-tight text-3xl font-bold text-on-surface">
            Pengaturan
          </h2>
          <p className="text-sm text-on-surface-variant">
            Kelola jam kerja, lokasi absensi, dan kebijakan kedisiplinan
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <section className="rounded-3xl border border-surface-variant/20 bg-surface-container-lowest p-6">
          <WorkScheduleForm />
        </section>

        <section className="rounded-3xl border border-surface-variant/20 bg-surface-container-lowest p-6">
          <LocationSettingForm />
        </section>
      </div>
    </div>
  )
}
