'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

const verifySchema = z.object({
  token: z
    .string()
    .trim()
    .min(6, 'Code à 6 chiffres')
    .max(10, 'Code invalide')
    .regex(/^\d+$/, 'Le code ne contient que des chiffres'),
})

type VerifyFormValues = z.infer<typeof verifySchema>

export function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { token: '' },
  })

  const onSubmit = async ({ token }: VerifyFormValues) => {
    setFormError(null)

    if (!email) {
      setFormError('Adresse e-mail manquante. Veuillez recommencer l’inscription.')
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })

    if (error) {
      setFormError('Code incorrect ou expiré. Vérifiez votre e-mail et réessayez.')
      return
    }

    router.push('/app')
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-xl font-bold tracking-tight">Vérifiez votre e-mail</h1>
        <p className="text-sm text-neutral-400">
          {email ? (
            <>
              Saisissez le code envoyé à{' '}
              <span className="font-medium text-neutral-200">{email}</span>.
            </>
          ) : (
            'Saisissez le code de vérification reçu par e-mail.'
          )}
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Code de vérification"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          maxLength={10}
          className="tracking-[0.4em]"
          error={errors.token?.message}
          {...register('token')}
        />

        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          >
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Vérifier
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-400">
        Mauvaise adresse ?{' '}
        <Link
          href="/register"
          className="text-brand-yellow font-semibold underline-offset-2 hover:underline"
        >
          Recommencer l&apos;inscription
        </Link>
      </p>
    </div>
  )
}
