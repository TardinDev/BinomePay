'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
  email: z.string().min(1, 'Adresse e-mail requise').email('Adresse e-mail invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async ({ email, password }: LoginForm) => {
    setFormError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setFormError(
        error.message.toLowerCase().includes('invalid')
          ? 'Adresse e-mail ou mot de passe incorrect.'
          : 'Connexion impossible. Veuillez réessayer dans un instant.'
      )
      return
    }

    router.push('/app')
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-xl font-bold tracking-tight">Connexion</h1>
        <p className="text-sm text-neutral-400">Heureux de vous revoir.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="vous@exemple.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="flex flex-col gap-1.5">
          <Input
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Link
            href="/forgot-password"
            className="hover:text-brand-yellow self-end text-xs text-neutral-400 underline-offset-2 hover:underline"
          >
            Mot de passe oublié ?
          </Link>
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
          Se connecter
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-400">
        Pas encore de compte ?{' '}
        <Link
          href="/register"
          className="text-brand-yellow font-semibold underline-offset-2 hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  )
}
