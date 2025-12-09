import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Vitaeology - Leadership Autentica',
    template: '%s | Vitaeology',
  },
  description: 'Sviluppa la tua leadership autentica con il test diagnostico a 240 domande, radar chart personalizzato e 52 esercizi settimanali.',
  keywords: ['leadership', 'assessment', 'sviluppo personale', 'imprenditore', 'manager', 'coaching'],
  authors: [{ name: 'Fernando Marongiu' }],
  creator: 'Vitaeology',
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
    <html lang="it">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
