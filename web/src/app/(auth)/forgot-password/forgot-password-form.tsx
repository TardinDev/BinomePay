'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

const emailSchema = z.object({
  email: z.string().min(1, 'Adresse e-mail requise').email('Adresse e-mail invalide'),
})
type EmailForm = z.infer<typeof emailSchema>

const resetSchema = z.object({
  token: z
    .string()
    .trim()
    .min(6, 'Code à 6 chiffres')
    .regex(/^\d+$/, 'Le code ne contient que des chiffres'),
  password: z.string().min(8, 'Au moins 8 caractères'),
})
type ResetForm = z.infer<typeof resetSchema>

export function ForgotPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [formError, setFormError] = useState<string | null>(null)

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: searchParams.get('email') ?? '' },
  })

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { token: '', password: '' },
  })

  const onRequestCode = async ({ email: enteredEmail }: EmailForm) => {
    setFormError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(enteredEmail)

    if (error) {
      setFormError('Envoi impossible. Vérifiez l’adresse et réessayez.')
      return
    }

    setEmail(enteredEmail)
    setStep(2)
  }

  const onReset = async ({ token, password }: ResetForm) => {
    setFormError(null)
    const supabase = createClient()

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    })
    if (verifyError) {
      setFormError('Code incorrect ou expiré. Vérifiez votre e-mail et réessayez.')
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setFormError('Mise à jour du mot de passe impossible. Veuillez réessayer.')
      return
    }

    router.push('/app')
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-xl font-bold tracking-tight">Mot de passe oublié</h1>
        <p className="text-sm text-neutral-400">
          {step === 1
            ? 'Indiquez votre e-mail pour recevoir un code de réinitialisation.'
            : 'Saisissez le code reçu et choisissez un nouveau mot de passe.'}
        </p>
      </header>

      {step === 1 ? (
        <form
          onSubmit={emailForm.handleSubmit(onRequestCode)}
          className="flex flex-col gap-4"
          noValidate
        >
          <Input
            label="Adresse e-mail"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="vous@exemple.com"
            error={emailForm.formState.errors.email?.message}
            {...emailForm.register('email')}
          />

          {formError && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {formError}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            loading={emailForm.formState.isSubmitting}
            className="w-full"
          >
            Envoyer le code
          </Button>
        </form>
      ) : (
        <form onSubmit={resetForm.handleSubmit(onReset)} className="flex flex-col gap-4" noValidate>
          <p className="text-sm text-neutral-400">
            Code envoyé à <span className="font-medium text-neutral-200">{email}</span>.
          </p>

          <Input
            label="Code de réinitialisation"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            className="tracking-[0.4em]"
            error={resetForm.formState.errors.token?.message}
            {...resetForm.register('token')}
          />

          <Input
            label="Nouveau mot de passe"
            type="password"
            autoComplete="new-password"
            placeholder="8 caractères minimum"
            error={resetForm.formState.errors.password?.message}
            {...resetForm.register('password')}
          />

          {formError && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {formError}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            loading={resetForm.formState.isSubmitting}
            className="w-full"
          >
            Réinitialiser le mot de passe
          </Button>

          <button
            type="button"
            onClick={() => {
              setFormError(null)
              setStep(1)
            }}
            className="self-center text-xs text-neutral-400 underline-offset-2 hover:text-neutral-200 hover:underline"
          >
            Modifier l&apos;adresse e-mail
          </button>
        </form>
      )}

      <p className="text-center text-sm text-neutral-400">
        Vous vous souvenez ?{' '}
        <Link
          href="/login"
          className="text-brand-yellow font-semibold underline-offset-2 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  )
}
