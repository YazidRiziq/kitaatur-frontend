'use client'

import { useState } from 'react'
import { loginAction } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircleIcon } from 'lucide-react'

export function LoginForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    const result = await loginAction(formData)
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
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="current-password"
            className="rounded-sm h-10"
          />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="rounded-sm w-full h-11 font-medium"
      >
        {loading && <Spinner data-icon="inline-start" />}
        {loading ? 'Memproses...' : 'Masuk'}
      </Button>
    </form>
  )
}
