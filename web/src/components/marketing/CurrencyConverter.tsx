'use client'

import { useState } from 'react'

const RATES_TO_EUR: Record<string, number> = {
  EUR: 1,
  USD: 0.926,
  GBP: 1.19,
  XAF: 1 / 655.957,
  XOF: 1 / 655.957,
  MAD: 1 / 10.9,
  GNF: 1 / 9500,
}

const CURRENCIES = ['EUR', 'USD', 'GBP', 'XAF', 'XOF', 'MAD', 'GNF']

function convert(amount: number, from: string, to: string): number {
  const inEur = amount * (RATES_TO_EUR[from] ?? 1)
  return inEur / (RATES_TO_EUR[to] ?? 1)
}

function fmt(value: number, currency: string): string {
  const noDecimals = currency === 'XAF' || currency === 'XOF' || currency === 'GNF'
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: noDecimals ? 0 : 2,
  }).format(value)
}

export function CurrencyConverter() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('XAF')

  const result = convert(parseFloat(amount) || 0, from, to)

  const selectClass =
    'rounded-xl border border-gray-700 bg-black/50 px-3 py-3 text-sm font-medium text-white focus:border-brand-yellow focus:outline-none cursor-pointer'

  return (
    <div className="rounded-2xl border border-gray-800 bg-neutral-900/80 p-5 backdrop-blur-sm">
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-neutral-500">
        Calculez votre échange
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="focus:border-brand-yellow w-32 rounded-xl border border-gray-700 bg-black/50 px-4 py-3 text-lg font-bold text-white placeholder-neutral-600 focus:outline-none"
          placeholder="100"
        />

        <select value={from} onChange={(e) => setFrom(e.target.value)} className={selectClass}>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <span aria-hidden="true" className="text-brand-yellow text-xl font-bold">
          →
        </span>

        <select value={to} onChange={(e) => setTo(e.target.value)} className={selectClass}>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="flex items-baseline gap-2">
          <span className="text-brand-yellow text-2xl font-extrabold">{fmt(result, to)}</span>
          <span className="text-sm font-semibold text-neutral-400">{to}</span>
        </div>
      </div>

      <p className="mt-3 text-[0.65rem] text-neutral-600">
        Taux indicatifs — pour information uniquement.
      </p>
    </div>
  )
}
