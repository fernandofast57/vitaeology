import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sfida 7 Giorni Leadership Autentica | Vitaeology',
  description: 'Scopri il leader che è in te con la sfida gratuita di 7 giorni. Esercizi pratici, riflessioni guidate e il primo passo verso una leadership consapevole.',
  openGraph: {
    title: 'Sfida 7 Giorni Leadership Autentica',
    description: 'Scopri il leader che è in te. 7 giorni di esercizi pratici gratuiti.',
    url: 'https://www.vitaeology.com/challenge/leadership',
    siteName: 'Vitaeology',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: 'https://www.vitaeology.com/og/challenge/leadership',
        width: 1200,
        height: 630,
        alt: 'Sfida Leadership Autentica - Vitaeology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sfida 7 Giorni Leadership Autentica',
    description: 'Scopri il leader che è in te. 7 giorni di esercizi pratici gratuiti.',
    images: ['https://www.vitaeology.com/og/challenge/leadership'],
  },
};

export default function LeadershipChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
