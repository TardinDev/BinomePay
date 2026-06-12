import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { Hero } from '@/components/marketing/Hero'
import { Features } from '@/components/marketing/Features'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { CTA } from '@/components/marketing/CTA'
import { Footer } from '@/components/marketing/Footer'

/**
 * ISR : la page statique se régénère au plus toutes les heures pour que la
 * rotation hebdomadaire des intentions vitrines (IntentionAds) se mette à
 * jour sans redéploiement.
 */
export const revalidate = 3600

const title = 'BinomePay — Échange de devises entre particuliers, sans intermédiaire'
const description =
  'BinomePay met en relation les personnes qui veulent envoyer de l’argent avec celles qui veulent en recevoir. Échange direct, sans frais cachés, profils vérifiés (KYC) et messagerie intégrée.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/' },
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

/**
 * Données structurées schema.org — lues par Google (rich results) et par les
 * moteurs génératifs (ChatGPT, Perplexity…) pour citer correctement le service.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://binomepay.com/#organization',
      name: 'BinomePay',
      url: 'https://binomepay.com',
      logo: 'https://binomepay.com/icon.png',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://binomepay.com/#website',
      name: 'BinomePay',
      url: 'https://binomepay.com',
      inLanguage: 'fr-FR',
      publisher: { '@id': 'https://binomepay.com/#organization' },
    },
    {
      '@type': 'MobileApplication',
      name: 'BinomePay',
      operatingSystem: 'ANDROID, IOS',
      applicationCategory: 'FinanceApplication',
      description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      publisher: { '@id': 'https://binomepay.com/#organization' },
    },
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingNav />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <CTA />
        <Footer />
      </main>
    </>
  )
}
