'use client'

import { useState } from 'react'
import { registerAction } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircleIcon } from 'lucide-react'

export function RegisterForm() {
  const [error, setError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    setConfirmError('')

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setConfirmError('Password dan konfirmasi password tidak cocok')
      setLoading(false)
      return
    }

    const result = await registerAction(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit(new FormData(e.currentTarget))
      }}
      className="flex flex-col gap-5"
    >
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="fullName">Nama Lengkap</FieldLabel>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Yazid Riziq"
            required
            autoComplete="name"
            className="rounded-sm h-10"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@kitaatur.com"
            required
            autoComplete="email"
            className="rounded-sm h-10"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimal 8 karakter"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded-sm h-10"
          />
        </Field>

        <Field data-invalid={!!confirmError}>
          <FieldLabel htmlFor="confirmPassword">Konfirmasi Password</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
            aria-invalid={!!confirmError}
            onChange={() => confirmError && setConfirmError('')}
            className="rounded-sm h-10"
          />
          {confirmError && <FieldError>{confirmError}</FieldError>}
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="rounded-sm w-full h-11 font-medium"
      >
        {loading && <Spinner data-icon="inline-start" />}
        {loading ? 'Memproses...' : 'Daftar'}
      </Button>
    </form>
  )
}
