import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { Hero } from '@/components/marketing/Hero'
import { Features } from '@/components/marketing/Features'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { CTA } from '@/components/marketing/CTA'
import { Footer } from '@/components/marketing/Footer'

const title = 'BinomePay — Échange de devises entre particuliers, sans intermédiaire'
const description =
  'BinomePay met en relation les personnes qui veulent envoyer de l’argent avec celles qui veulent en recevoir. Échange direct, sans frais cachés, profils vérifiés (KYC) et messagerie intégrée.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'fr_FR',
    siteName: 'BinomePay',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function Home() {
  return (
    <>
      <MarketingNav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
        <Footer />
      </main>
    </>
  )
}
