import type { Metadata } from 'next'
import { Inter, Stoke, Crimson_Text, Libre_Baskerville } from 'next/font/google'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import './globals.css'

// Dynamic import per evitare problemi SSR con Supabase client
const FeedbackWidget = dynamic(() => import('@/components/ui/FeedbackWidget'), {
  ssr: false,
})

// Google Analytics 4 Measurement ID
// TODO: Sostituire con ID reale da Google Analytics
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'

// Microsoft Clarity Project ID
const CLARITY_PROJECT_ID = 'v4dg8tygen'

// Meta Pixel ID
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''

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

        {/* Microsoft Clarity - Session Recording */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
          `}
        </Script>

        {/* Meta Pixel */}
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </head>
      <body className="min-h-screen bg-gray-50 font-sans">
        {children}
        {/* Feedback Widget - Mostra solo per utenti loggati */}
        <FeedbackWidget />
      </body>
    </html>
  )
}
