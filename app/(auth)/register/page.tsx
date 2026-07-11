import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel"

export const metadata: Metadata = {
  title: "Daftar — KitaAtur HRIS",
}

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBrandPanel
        headline="Mulai dalam hitungan menit, bukan berhari-hari."
        subtext="Buat akun, selesaikan onboarding sekali, dan absensi via WhatsApp tervalidasi geofencing siap dipakai — di kantor maupun di lapangan."
      />

      <main className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <header className="lg:hidden mb-8 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <span className="text-xl font-medium tracking-tight text-foreground">
                KitaAtur
              </span>
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            </div>
          </header>

          <div className="mb-8">
            <h1 className="text-[1.75rem] leading-tight font-medium tracking-[-0.42px] text-foreground">
              Daftar
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Buat akun baru untuk mulai menggunakan KitaAtur.
            </p>
          </div>

          <RegisterForm />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Masuk
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
