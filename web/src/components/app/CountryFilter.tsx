'use client'

import { cn } from '@/components/ui'

export interface CountryFilterProps {
  /** Available destination countries to filter by. */
  options: string[]
  /** Currently selected country, or null for "all". */
  value: string | null
  onChange: (value: string | null) => void
}

export function CountryFilter({ options, value, onChange }: CountryFilterProps) {
  if (options.length === 0) return null

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Filtrer par destination"
    >
      <Chip active={value === null} onClick={() => onChange(null)}>
        Toutes
      </Chip>
      {options.map((country) => (
        <Chip key={country} active={value === country} onClick={() => onChange(country)}>
          {country}
        </Chip>
      ))}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors',
        'focus-visible:ring-brand-yellow outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        active
          ? 'bg-brand-yellow/15 text-brand-yellow-soft ring-brand-yellow/30'
          : 'text-neutral-400 ring-gray-800 hover:bg-neutral-800 hover:text-neutral-200'
      )}
    >
      {children}
    </button>
  )
}
