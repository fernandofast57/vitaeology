import type { Metadata } from 'next'
import { Inter, Stoke, Crimson_Text, Libre_Baskerville } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

// Google Analytics 4 Measurement ID
// TODO: Sostituire con ID reale da Google Analytics
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'

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
    default: "Vitaeology - L'hai già fatto. Non te lo ricordi.",
    template: '%s | Vitaeology',
  },
  description: "Sai già come si fa. Solo che adesso è come dimenticato. È ancora lì. Lo senti?",
  keywords: ['leadership', 'resilienza', 'benessere', 'sviluppo personale', 'imprenditore', 'coaching'],
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
    title: "Vitaeology - L'hai già fatto. Non te lo ricordi.",
    description: "Sai già come si fa. Solo che adesso è come dimenticato. È ancora lì. Lo senti?",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Vitaeology - L'hai già fatto. Non te lo ricordi.",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Vitaeology - L'hai già fatto. Non te lo ricordi.",
    description: "Sai già come si fa. Solo che adesso è come dimenticato. È ancora lì. Lo senti?",
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
      <head>
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-gray-50 font-sans">
        {children}
      </body>
    </html>
  )
}
