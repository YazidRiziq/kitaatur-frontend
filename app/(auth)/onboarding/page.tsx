import type { Metadata } from "next"
import { Building2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Setup Perusahaan — KitaAtur HRIS",
}

export default function OnboardingPage() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(0,105,72,0.08)] p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <Building2 size={28} className="text-primary" />
        </div>
        <h2 className="font-headline text-xl font-bold text-on-surface mb-2">
          Setup Perusahaan
        </h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Halaman onboarding untuk mendaftarkan perusahaan Anda akan segera hadir.
          Fitur ini akan memungkinkan Anda untuk mengatur nama perusahaan, departemen,
          dan jam kerja.
        </p>
        <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
          Anda belum menyelesaikan onboarding. Silakan kembali lagi nanti.
        </div>
      </div>
    </div>
  )
}