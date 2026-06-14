import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/LoginForm"

export const metadata: Metadata = {
  title: "Login — KitaAtur HRIS",
}

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline"
        >
          Daftar
        </Link>
      </p>
    </>
  )
}