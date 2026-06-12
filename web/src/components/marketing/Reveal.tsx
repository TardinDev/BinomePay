'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Apparition au scroll (fade + translation). Le contenu est rendu visible côté
 * serveur ; il n'est masqué qu'au montage client et uniquement s'il est encore
 * hors viewport — donc aucun flash au-dessus de la ligne de flottaison et un
 * rendu intact sans JavaScript. `prefers-reduced-motion` désactive l'effet.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('reveal-visible')
          io.disconnect()
        } else {
          el.classList.add('reveal-hidden')
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
