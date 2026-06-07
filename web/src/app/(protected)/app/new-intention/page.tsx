'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Card, Input, cn } from '@/components/ui'
import { createIntention } from '@/lib/actions/intentions'

const CURRENCY_OPTIONS = [
  'EUR',
  'USD',
  'GBP',
  'XOF',
  'XAF',
  'MAD',
  'CAD',
  'CHF',
  'NGN',
  'GHS',
  'KES',
] as const

const COUNTRY_OPTIONS = [
  'Gabon',
  'France',
  'Sénégal',
  'Côte d’Ivoire',
  'Maroc',
  'Cameroun',
  'Mali',
  'Bénin',
  'Togo',
  'Guinée',
  'Burkina Faso',
  'République Démocratique du Congo',
  'Ghana',
  'Nigeria',
  'Kenya',
] as const

const FormSchema = z.object({
  type: z.enum(['SEND', 'RECEIVE']),
  amount: z
    .number({ message: 'Veuillez saisir un montant.' })
    .positive('Le montant doit être supérieur à 0.'),
  currency: z.string().length(3, 'Devise invalide.'),
  originCountry: z.string().min(1, 'Sélectionnez un pays d’origine.'),
  destCountry: z.string().min(1, 'Sélectionnez un pays de destination.'),
})

type FormValues = z.infer<typeof FormSchema>

const DEFAULT_VALUES: FormValues = {
  type: 'SEND',
  amount: 0,
  currency: 'EUR',
  originCountry: 'France',
  destCountry: 'Sénégal',
}

export default function NewIntentionPage() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const direction = useWatch({ control, name: 'type' })
  const originCountry = useWatch({ control, name: 'originCountry' })
  const destCountry = useWatch({ control, name: 'destCountry' })

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    try {
      await createIntention({
        type: values.type,
        amount: values.amount,
        currency: values.currency,
        originCountry: values.originCountry,
        destCountry: values.destCountry,
      })
      setIsSuccess(true)
    } catch {
      setSubmitError(
        'Une erreur est survenue lors de la création de votre intention. Veuillez réessayer.'
      )
    }
  }

  const handleCreateAnother = () => {
    reset(DEFAULT_VALUES)
    setSubmitError(null)
    setIsSuccess(false)
  }

  if (isSuccess) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <Card className="flex flex-col items-center gap-5 py-10 text-center">
          <span
            aria-hidden="true"
            className="bg-brand-yellow/15 text-brand-yellow flex h-16 w-16 items-center justify-center rounded-full text-3xl"
          >
            ✓
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="text-foreground text-xl font-bold tracking-tight">Intention publiée</h1>
            <p className="max-w-sm text-sm text-neutral-400">
              Votre intention est désormais visible. Nous vous préviendrons dès qu’un binôme
              compatible est trouvé.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/app" className="sm:w-auto">
              <Button className="w-full sm:w-auto">Retour à l’accueil</Button>
            </Link>
            <Button variant="ghost" className="w-full sm:w-auto" onClick={handleCreateAnother}>
              Créer une autre
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Nouvelle intention
        </h1>
        <p className="text-sm text-neutral-400">
          Indiquez si vous souhaitez envoyer ou recevoir de l’argent, et nous trouverons un binôme.
        </p>
      </header>

      <Card>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* SEND / RECEIVE toggle */}
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <fieldset className="flex flex-col gap-1.5">
                <legend className="mb-1.5 text-sm font-medium text-neutral-300">
                  Type d’opération
                </legend>
                <div
                  role="radiogroup"
                  aria-label="Type d’opération"
                  className="grid grid-cols-2 gap-1 rounded-xl border border-gray-800 bg-neutral-950 p-1"
                >
                  <SegmentButton
                    label="J’envoie"
                    selected={field.value === 'SEND'}
                    activeClassName="bg-brand-yellow text-black"
                    onClick={() => field.onChange('SEND')}
                  />
                  <SegmentButton
                    label="Je reçois"
                    selected={field.value === 'RECEIVE'}
                    activeClassName="bg-brand-blue text-white"
                    onClick={() => field.onChange('RECEIVE')}
                  />
                </div>
              </fieldset>
            )}
          />

          {/* Amount + currency */}
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <Input
                label="Montant"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                placeholder="0"
                error={errors.amount?.message}
                {...register('amount', { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="currency" className="text-sm font-medium text-neutral-300">
                Devise
              </label>
              <select
                id="currency"
                className={cn(
                  'text-foreground h-11 w-28 rounded-xl border border-gray-800 bg-neutral-950 px-3 text-sm',
                  'outline-none transition-[border-color,box-shadow] duration-200 ease-out',
                  'focus-visible:border-brand-yellow focus-visible:ring-brand-yellow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black'
                )}
                {...register('currency')}
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Origin country */}
          <CountrySelect
            id="originCountry"
            label="Pays d’origine"
            error={errors.originCountry?.message}
            value={originCountry}
            onChange={(value) =>
              setValue('originCountry', value, { shouldValidate: true, shouldDirty: true })
            }
          />

          {/* Destination country */}
          <CountrySelect
            id="destCountry"
            label="Pays de destination"
            error={errors.destCountry?.message}
            value={destCountry}
            onChange={(value) =>
              setValue('destCountry', value, { shouldValidate: true, shouldDirty: true })
            }
          />

          {submitError && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300"
            >
              {submitError}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row-reverse sm:items-center">
            <Button
              type="submit"
              size="lg"
              loading={isSubmitting}
              className="w-full sm:w-auto"
              variant={direction === 'RECEIVE' ? 'secondary' : 'primary'}
            >
              Publier l’intention
            </Button>
            <Link href="/app" className="w-full sm:w-auto">
              <Button type="button" variant="ghost" size="lg" className="w-full sm:w-auto">
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

function SegmentButton({
  label,
  selected,
  activeClassName,
  onClick,
}: {
  label: string
  selected: boolean
  activeClassName: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'h-10 rounded-lg text-sm font-semibold transition-colors duration-200 ease-out',
        'focus-visible:ring-brand-yellow outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        selected ? activeClassName : 'text-neutral-400 hover:text-neutral-200'
      )}
    >
      {label}
    </button>
  )
}

function CountrySelect({
  id,
  label,
  value,
  error,
  onChange,
}: {
  id: string
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  const errorId = `${id}-error`
  const hasError = Boolean(error)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-300">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        className={cn(
          'text-foreground h-11 w-full rounded-xl border bg-neutral-950 px-3.5 text-sm',
          'outline-none transition-[border-color,box-shadow] duration-200 ease-out',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          hasError
            ? 'border-red-500 focus-visible:ring-red-500'
            : 'focus-visible:border-brand-yellow focus-visible:ring-brand-yellow border-gray-800'
        )}
      >
        {COUNTRY_OPTIONS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {hasError && (
        <p id={errorId} className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
