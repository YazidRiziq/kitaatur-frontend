import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/LoginForm"
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel"

export const metadata: Metadata = {
  title: "Masuk — KitaAtur HRIS",
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBrandPanel
        headline="Absensi, cuti, dan tim Anda — dalam satu dashboard."
        subtext="Absensi via WhatsApp tervalidasi lewat geofencing, cuti tercatat rapi, dan data karyawan terpusat. Tanpa spreadsheet, tanpa rumus manual."
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
              Masuk
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Masukkan email dan password untuk mengakses dashboard.
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Daftar
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
