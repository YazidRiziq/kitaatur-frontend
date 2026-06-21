import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Auth — KitaAtur HRIS",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Image
            src="/hris_logo.jpg"
            alt="KitaAtur Logo"
            width={48}
            height={48}
            className="rounded-xl"
          />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-emerald-600 font-headline tracking-tight">
            KitaAtur
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-0.5">
            HRIS Dashboard
          </p>
        </div>
      </div>

      {children}

      <p className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} KitaAtur. Seluruh hak cipta dilindungi.
      </p>
    </div>
  )
}