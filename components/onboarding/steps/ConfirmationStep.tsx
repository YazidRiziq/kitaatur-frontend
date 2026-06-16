import { Building2, Clock, FolderTree } from "lucide-react"
import type { StepComponentProps, WorkingDay } from "@/lib/onboarding/types"
import { WORKING_DAY_LABELS } from "@/lib/onboarding/types"

function formatWorkingDays(days: WorkingDay[]): string {
  if (days.length === 7) return "Setiap hari"
  if (days.length === 0) return "-"

  const sorted = [...days].sort(
    (a, b) =>
      ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].indexOf(a) -
      ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].indexOf(b)
  )

  const labels = sorted.map((d) => WORKING_DAY_LABELS[d])

  if (labels.length <= 2) return labels.join(", ")

  const ranges: string[] = []
  let start = labels[0]
  let prev = sorted[0]

  const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

  for (let i = 1; i <= sorted.length; i++) {
    const current = sorted[i]
    const prevIdx = dayOrder.indexOf(prev)
    const currIdx = i < sorted.length ? dayOrder.indexOf(current) : -1

    if (currIdx !== prevIdx + 1) {
      if (start === WORKING_DAY_LABELS[prev]) {
        ranges.push(start)
      } else {
        ranges.push(`${start} - ${WORKING_DAY_LABELS[prev]}`)
      }
      if (i < sorted.length) start = WORKING_DAY_LABELS[current]
    }
    if (i < sorted.length) prev = current
  }

  return ranges.join(", ")
}

export function ConfirmationStep({ data, error }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.667 5L7.5 14.167L3.333 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            />
          </svg>
        </div>
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">
            Konfirmasi Pendaftaran
          </h2>
          <p className="text-sm text-on-surface-variant">
            Tinjau kembali data perusahaan Anda
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-slate-50 p-5 space-y-5">
        <div className="flex gap-3">
          <Building2 size={18} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Perusahaan
            </p>
            <p className="text-sm font-semibold text-on-surface">{data.companyName || "-"}</p>
            {data.industry && (
              <p className="text-sm text-on-surface-variant">Industri: {data.industry}</p>
            )}
            <p className="text-sm text-on-surface-variant">Zona Waktu: {data.timezone}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Clock size={18} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Jam Kerja
            </p>
            <p className="text-sm font-semibold text-on-surface">
              {data.workStartTime} - {data.workEndTime}
            </p>
            <p className="text-sm text-on-surface-variant">
              Toleransi: {data.lateThreshold} menit
            </p>
            <p className="text-sm text-on-surface-variant">
              Hari Kerja: {formatWorkingDays(data.workingDays)}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <FolderTree size={18} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Departemen ({data.departments.length})
            </p>
            <p className="text-sm text-on-surface">
              {data.departments.length > 0
                ? data.departments.join(", ")
                : "Belum ada departemen"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-amber-50 p-3">
        <p className="text-xs text-amber-700 leading-relaxed">
          Pastikan semua data sudah benar. Data perusahaan tidak dapat diubah setelah
          pendaftaran selesai.
        </p>
      </div>
    </div>
  )
}