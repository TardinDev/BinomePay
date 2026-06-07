'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

const registerSchema = z.object({
  firstName: z.string().trim().min(2, 'Veuillez renseigner votre prénom'),
  email: z.string().min(1, 'Adresse e-mail requise').email('Adresse e-mail invalide'),
  password: z.string().min(8, 'Au moins 8 caractères'),
  acceptTerms: z.literal(true, {
    message: 'Vous devez accepter les conditions d’utilisation',
  }),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', email: '', password: '' },
  })

  const onSubmit = async ({ firstName, email, password }: RegisterForm) => {
    setFormError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { firstName } },
    })

    if (error) {
      setFormError(
        error.message.toLowerCase().includes('already')
          ? 'Un compte existe déjà avec cette adresse e-mail.'
          : 'Inscription impossible. Veuillez réessayer dans un instant.'
      )
      return
    }

    router.push(`/verify?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-xl font-bold tracking-tight">Créer un compte</h1>
        <p className="text-sm text-neutral-400">Quelques secondes suffisent.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Prénom"
          type="text"
          autoComplete="given-name"
          placeholder="Camille"
          error={errors.firstName?.message}
          {...register('firstName')}
        />

        <Input
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="vous@exemple.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Mot de passe"
          type="password"
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="flex items-start gap-2.5 text-sm text-neutral-300">
            <input
              type="checkbox"
              className="text-brand-yellow accent-brand-yellow focus-visible:ring-brand-yellow mt-0.5 h-4 w-4 shrink-0 rounded border-gray-700 bg-neutral-950 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              {...register('acceptTerms')}
            />
            <span>
              J&apos;accepte les{' '}
              <Link href="/terms" className="text-brand-yellow underline-offset-2 hover:underline">
                conditions d&apos;utilisation
              </Link>
              .
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-sm text-red-400">{errors.acceptTerms.message}</p>
          )}
        </div>

        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          >
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Créer mon compte
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-400">
        Déjà inscrit ?{' '}
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
