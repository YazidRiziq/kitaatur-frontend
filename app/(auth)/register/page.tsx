import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/RegisterForm"

export const metadata: Metadata = {
  title: "Daftar — KitaAtur HRIS",
}

export default function RegisterPage() {
  return (
    <>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          Masuk
        </Link>
      </p>
    </>
  )
}