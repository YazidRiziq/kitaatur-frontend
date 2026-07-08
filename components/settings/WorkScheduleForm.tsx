"use client"

import { useState, useEffect } from "react"
import { Loader2, Clock, Save } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  getSettings,
  updateSettings,
} from "@/lib/settings/actions"
import type { CompanySettings } from "@/lib/settings/types"
import type { WorkingDay } from "@/lib/onboarding/types"
import { WORKING_DAY_LABELS } from "@/lib/onboarding/types"

const WORKING_DAYS: WorkingDay[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
]

const LATE_THRESHOLD_OPTIONS = [5, 10, 15, 30]

export function WorkScheduleForm() {
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customThreshold, setCustomThreshold] = useState<number | null>(null)

  useEffect(() => {
    getSettings()
      .then((data) => {
        setSettings(data)
        if (!LATE_THRESHOLD_OPTIONS.includes(data.lateThreshold)) {
          setCustomThreshold(data.lateThreshold)
        }
      })
      .catch(() => toast.error("Gagal memuat pengaturan jam kerja"))
      .finally(() => setLoading(false))
  }, [])

  function update<K extends keyof CompanySettings>(
    field: K,
    value: CompanySettings[K]
  ) {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  function toggleWorkingDay(day: WorkingDay) {
    if (!settings) return
    const current = settings.workingDays
    update(
      "workingDays",
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day]
    )
  }

  function handleThresholdChange(value: number) {
    setCustomThreshold(null)
    update("lateThreshold", value)
  }

  function handleCustomThreshold(value: string) {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num > 0) {
      setCustomThreshold(num)
      update("lateThreshold", num)
    } else {
      setCustomThreshold(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!settings) return

    if (settings.workingDays.length === 0) {
      toast.error("Pilih minimal satu hari kerja")
      return
    }

    setSaving(true)
    try {
      await updateSettings({
        workStartTime: settings.workStartTime,
        workEndTime: settings.workEndTime,
        lateThreshold: settings.lateThreshold,
        workingDays: settings.workingDays,
        timezone: settings.timezone,
      })
      toast.success("Pengaturan jam kerja berhasil disimpan")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan pengaturan jam kerja"
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Clock size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="font-headline text-lg font-bold text-on-surface">
            Jam Kerja
          </h3>
          <p className="text-sm text-on-surface-variant">
            Atur jam masuk, pulang, dan toleransi keterlambatan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="work-start-time" className="font-body text-on-surface">
            Jam Masuk
          </Label>
          <Input
            id="work-start-time"
            type="time"
            value={settings.workStartTime}
            onChange={(e) => update("workStartTime", e.target.value)}
            className="rounded-xl h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="work-end-time" className="font-body text-on-surface">
            Jam Pulang
          </Label>
          <Input
            id="work-end-time"
            type="time"
            value={settings.workEndTime}
            onChange={(e) => update("workEndTime", e.target.value)}
            className="rounded-xl h-11"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="font-body text-on-surface">
          Toleransi Keterlambatan
        </Label>
        <div className="flex flex-wrap items-center gap-3">
          {LATE_THRESHOLD_OPTIONS.map((val) => (
            <label
              key={val}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                settings.lateThreshold === val && customThreshold === null
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-surface-variant text-on-surface-variant hover:border-on-surface-variant"
              }`}
            >
              <input
                type="radio"
                name="late-threshold"
                checked={settings.lateThreshold === val && customThreshold === null}
                onChange={() => handleThresholdChange(val)}
                className="sr-only"
              />
              {val} menit
            </label>
          ))}
          <label
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
              customThreshold !== null
                ? "border-primary bg-primary/10 text-primary"
                : "border-surface-variant text-on-surface-variant hover:border-on-surface-variant"
            }`}
          >
            <input
              type="radio"
              name="late-threshold"
              checked={customThreshold !== null}
              onChange={() => setCustomThreshold(1)}
              className="sr-only"
            />
            Custom:
            <input
              type="number"
              min={1}
              value={customThreshold ?? ""}
              onChange={(e) => handleCustomThreshold(e.target.value)}
              onClick={(e) => {
                e.stopPropagation()
                setCustomThreshold(1)
              }}
              className="w-14 h-7 rounded-lg border border-input bg-transparent px-2 text-sm text-center"
              placeholder="..."
            />
            menit
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="font-body text-on-surface">
          Hari Kerja <span className="text-error">*</span>
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {WORKING_DAYS.map((day) => {
            const checked = settings.workingDays.includes(day)
            return (
              <label
                key={day}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                  checked
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-surface-variant text-on-surface-variant hover:border-on-surface-variant"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleWorkingDay(day)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    checked
                      ? "bg-primary border-primary"
                      : "border-outline"
                  }`}
                >
                  {checked && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5L4 7L8 3"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm">{WORKING_DAY_LABELS[day]}</span>
              </label>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className="rounded-xl"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save size={16} />
              Simpan
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
