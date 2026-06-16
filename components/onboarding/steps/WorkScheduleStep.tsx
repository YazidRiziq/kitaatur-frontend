import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock } from "lucide-react"
import type { StepComponentProps, WorkingDay } from "@/lib/onboarding/types"
import { WORKING_DAY_LABELS } from "@/lib/onboarding/types"

const WORKING_DAYS: WorkingDay[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
]

const LATE_THRESHOLD_OPTIONS = [5, 15, 30]

export function WorkScheduleStep({ data, updateField, error }: StepComponentProps) {
  const [customThreshold, setCustomThreshold] = useState(
    !LATE_THRESHOLD_OPTIONS.includes(data.lateThreshold) ? data.lateThreshold : null as number | null
  )

  const handleThresholdChange = (value: number) => {
    setCustomThreshold(null)
    updateField("lateThreshold", value)
  }

  const handleCustomThreshold = (value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num > 0) {
      setCustomThreshold(num)
      updateField("lateThreshold", num)
    } else {
      setCustomThreshold(null)
    }
  }

  const toggleWorkingDay = (day: WorkingDay) => {
    const current = data.workingDays
    if (current.includes(day)) {
      updateField("workingDays", current.filter((d) => d !== day))
    } else {
      updateField("workingDays", [...current, day])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Clock size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">
            Jam Kerja
          </h2>
          <p className="text-sm text-on-surface-variant">
            Atur jam masuk, pulang, dan toleransi
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="workStartTime" className="font-body text-on-surface">
            Jam Masuk
          </Label>
          <Input
            id="workStartTime"
            type="time"
            value={data.workStartTime}
            onChange={(e) => updateField("workStartTime", e.target.value)}
            className="rounded-xl h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workEndTime" className="font-body text-on-surface">
            Jam Pulang
          </Label>
          <Input
            id="workEndTime"
            type="time"
            value={data.workEndTime}
            onChange={(e) => updateField("workEndTime", e.target.value)}
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
                data.lateThreshold === val && !customThreshold
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="lateThreshold"
                checked={data.lateThreshold === val && !customThreshold}
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
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name="lateThreshold"
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
          Hari Kerja <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {WORKING_DAYS.map((day) => {
            const checked = data.workingDays.includes(day)
            return (
              <label
                key={day}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                  checked
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleWorkingDay(day)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    checked
                      ? "bg-primary border-primary"
                      : "border-slate-300"
                  }`}
                >
                  {checked && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
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
    </div>
  )
}