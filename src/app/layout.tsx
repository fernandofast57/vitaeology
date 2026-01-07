import type { Metadata } from 'next'
import { Inter, Stoke, Crimson_Text, Libre_Baskerville } from 'next/font/google'
import './globals.css'

// Font per il body (sans-serif)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Font brand primario (serif con swash sulla V)
const stoke = Stoke({
  weight: '300',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-stoke',
})

// Font fallback 1: Crimson Text
const crimsonText = Crimson_Text({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-crimson',
})

// Font fallback 2: Libre Baskerville
const libreBaskerville = Libre_Baskerville({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-libre',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.vitaeology.com'),
  title: {
    default: 'Vitaeology - Leadership Autentica',
    template: '%s | Vitaeology',
  },
  description: 'Sviluppa la tua leadership autentica con il test diagnostico a 240 domande, radar chart personalizzato e 52 esercizi settimanali.',
  keywords: ['leadership', 'assessment', 'sviluppo personale', 'imprenditore', 'manager', 'coaching'],
  authors: [{ name: 'Fernando Marongiu' }],
  creator: 'Vitaeology',
  icons: {
    icon: '/favicon.svg',
    apple: '/logo-icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://vitaeology.com',
    siteName: 'Vitaeology',
    title: 'Vitaeology - Leadership Autentica',
    description: 'Sviluppa la tua leadership autentica con il test diagnostico a 240 domande.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vitaeology - Leadership Autentica',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vitaeology - Leadership Autentica',
    description: 'Sviluppa la tua leadership autentica con il test diagnostico a 240 domande.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className={`${inter.variable} ${stoke.variable} ${crimsonText.variable} ${libreBaskerville.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans">
        {children}
      </body>
    </html>
  )
}
