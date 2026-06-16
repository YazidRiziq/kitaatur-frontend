import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2 } from "lucide-react"
import type { StepComponentProps } from "@/lib/onboarding/types"

export function CompanyInfoStep({ data, updateField, error }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Building2 size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">
            Info Perusahaan
          </h2>
          <p className="text-sm text-on-surface-variant">
            Nama dan zona waktu perusahaan Anda
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="companyName" className="font-body text-on-surface">
          Nama Perusahaan <span className="text-red-500">*</span>
        </Label>
        <Input
          id="companyName"
          type="text"
          placeholder="PT Developer Jaya"
          value={data.companyName}
          onChange={(e) => updateField("companyName", e.target.value)}
          className="rounded-xl h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry" className="font-body text-on-surface">
          Industri <span className="text-slate-400 text-xs">(opsional)</span>
        </Label>
        <Input
          id="industry"
          type="text"
          placeholder="Properti, Teknologi, Retail, dll"
          value={data.industry}
          onChange={(e) => updateField("industry", e.target.value)}
          className="rounded-xl h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone" className="font-body text-on-surface">
          Zona Waktu <span className="text-red-500">*</span>
        </Label>
        <select
          id="timezone"
          value={data.timezone}
          onChange={(e) => updateField("timezone", e.target.value)}
          className="w-full h-11 rounded-xl border border-input bg-transparent px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="WIB">WIB (UTC+7) — Jakarta, Bandung</option>
          <option value="WITA">WITA (UTC+8) — Bali, Makassar</option>
          <option value="WIT">WIT (UTC+9) — Papua, Maluku</option>
        </select>
      </div>
    </div>
  )
}