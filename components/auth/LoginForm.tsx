'use client'

import { useState } from 'react'
import { loginAction } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle } from 'lucide-react'

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
    <Card className="w-full max-w-md mx-auto border-0 shadow-[0_12px_40px_rgba(0,105,72,0.08)]">
      <CardHeader className="space-y-1 pt-8">
        <CardTitle className="font-headline text-2xl font-bold text-center text-on-surface">
          Masuk
        </CardTitle>
        <CardDescription className="text-center text-on-surface-variant">
          Masukkan email dan password untuk mengakses dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="font-body text-on-surface">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@kitaatur.com"
              required
              className="rounded-xl h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-body text-on-surface">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              className="rounded-xl h-11"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 font-semibold"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Masuk'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}