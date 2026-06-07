'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Avatar, Badge, Button, Card, Input, Skeleton } from '@/components/ui'
import { useSessionUser } from '@/components/app/SessionProvider'
import { SignOutButton } from '@/components/app/SignOutButton'
import { useUserProfile } from '@/lib/queries/useUserProfile'
import { queryKeys } from '@/lib/queries/keys'
import { updateProfile, deleteAccount } from '@/lib/actions/profile'
import type { User } from '@/lib/schemas'

const KYC_LABELS: Record<User['kycStatus'], string> = {
  unverified: 'Non vérifié',
  pending: 'En attente',
  verified: 'Vérifié',
}

export default function ProfilePage() {
  const { id, email } = useSessionUser()
  const queryClient = useQueryClient()
  const profile = useUserProfile(id)

  if (profile.isLoading) {
    return <ProfileSkeleton />
  }

  if (profile.isError || !profile.data) {
    return (
      <Card className="border-red-500/30 bg-red-500/5 py-6 text-center">
        <p className="text-sm text-red-300">Impossible de charger votre profil.</p>
      </Card>
    )
  }

  const user = profile.data

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">Profil</h1>
        <p className="text-sm text-neutral-400">Gérez vos informations et votre compte.</p>
      </header>

      {/* Identity card */}
      <Card className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Avatar src={user.avatarUrl} name={user.name} size="xl" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="text-foreground truncate text-xl font-semibold">{user.name}</p>
            {email && <p className="truncate text-sm text-neutral-400">{email}</p>}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <Badge status={user.kycStatus}>{KYC_LABELS[user.kycStatus]}</Badge>
              <RatingStars value={user.ratingAvg} />
            </div>
          </div>
        </div>
      </Card>

      {/* Name editor */}
      <NameEditor
        key={user.name}
        userId={id}
        currentName={user.name}
        onSaved={() => queryClient.invalidateQueries({ queryKey: queryKeys.profile(id) })}
      />

      {/* Account actions */}
      <section className="flex flex-col gap-4">
        <h2 className="text-foreground text-lg font-semibold tracking-tight">Compte</h2>
        <Card className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-foreground text-sm font-medium">Session</p>
              <p className="text-sm text-neutral-500">Déconnectez-vous de cet appareil.</p>
            </div>
            <SignOutButton />
          </div>

          <div className="h-px bg-gray-800" />

          <DeleteAccountSection />
        </Card>
      </section>
    </div>
  )
}

/** Average rating rendered as 5 stars plus a numeric value. */
function RatingStars({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(5, value))
  const rounded = Math.round(clamped)

  return (
    <span
      className="inline-flex items-center gap-1.5"
      aria-label={`Note moyenne : ${clamped.toFixed(1)} sur 5`}
    >
      <span aria-hidden="true" className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className={i < rounded ? 'text-brand-yellow h-4 w-4' : 'h-4 w-4 text-neutral-700'}
            fill="currentColor"
          >
            <path d="m12 2 2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.6 5.9 20.4l1.5-6.8L2.2 9l6.9-.7Z" />
          </svg>
        ))}
      </span>
      <span className="text-xs font-medium text-neutral-400">{clamped.toFixed(1)} / 5</span>
    </span>
  )
}

function NameEditor({
  userId,
  currentName,
  onSaved,
}: {
  userId: string
  currentName: string
  onSaved: () => void
}) {
  // Remounted via `key={currentName}` by the parent, so initial state stays in
  // sync with the latest profile without a state-syncing effect.
  const [name, setName] = useState(currentName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const trimmed = name.trim()
  const dirty = trimmed !== currentName.trim()
  const canSave = dirty && trimmed.length > 0 && !saving

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await updateProfile({ name: trimmed })
      setSuccess(true)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-foreground text-lg font-semibold tracking-tight">Informations</h2>
      <Card>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <Input
            label="Nom affiché"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setSuccess(false)
              setError(null)
            }}
            error={error ?? undefined}
            maxLength={80}
            autoComplete="name"
            id={`profile-name-${userId}`}
          />
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!canSave} loading={saving} size="sm">
              Enregistrer
            </Button>
            {success && !dirty && (
              <span className="text-sm text-emerald-400" role="status">
                Modifications enregistrées.
              </span>
            )}
          </div>
        </form>
      </Card>
    </section>
  )
}

function DeleteAccountSection() {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDelete = async () => {
    setDeleting(true)
    setError(null)
    try {
      await deleteAccount()
      router.push('/login')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La suppression a échoué.')
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-red-300">Supprimer mon compte</p>
          <p className="text-sm text-neutral-500">Cette action est définitive et irréversible.</p>
        </div>
        {!confirming && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(true)}
            className="text-red-300 hover:bg-red-500/10 hover:text-red-200 focus-visible:ring-red-500"
          >
            Supprimer
          </Button>
        )}
      </div>

      {confirming && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm text-red-200">
            Confirmez-vous la suppression définitive de votre compte ? Toutes vos données seront
            effacées.
          </p>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={onDelete}
              loading={deleting}
              className="bg-red-600 from-red-600 to-red-600 text-white hover:from-red-500 hover:to-red-500 focus-visible:ring-red-500"
            >
              Oui, supprimer définitivement
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setConfirming(false)
                setError(null)
              }}
              disabled={deleting}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>
      <Card className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-4 w-56 rounded" />
          <Skeleton className="h-5 w-32 rounded-full" />
        </div>
      </Card>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  )
}
