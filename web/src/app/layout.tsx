import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { QueryProvider } from '@/components/QueryProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://binomepay.com'),
  title: {
    default: 'BinomePay — Échange de devises entre particuliers',
    template: '%s · BinomePay',
  },
  description:
    'BinomePay met en relation les particuliers pour échanger des devises localement, en toute simplicité et sans frais cachés.',
  applicationName: 'BinomePay',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'BinomePay',
    title: 'BinomePay — Échange de devises entre particuliers',
    description: 'Trouvez un binôme de confiance pour échanger vos devises localement.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
