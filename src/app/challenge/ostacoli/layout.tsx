import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sfida 7 Giorni Oltre gli Ostacoli | Vitaeology',
  description: 'Impara a riconoscere e superare i blocchi che ti frenano. 7 giorni di esercizi pratici per trasformare gli ostacoli in opportunità.',
  openGraph: {
    title: 'Sfida 7 Giorni Oltre gli Ostacoli',
    description: 'Trasforma i blocchi in trampolini. 7 giorni di esercizi pratici gratuiti.',
    url: 'https://www.vitaeology.com/challenge/ostacoli',
    siteName: 'Vitaeology',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: 'https://www.vitaeology.com/og/challenge/ostacoli',
        width: 1200,
        height: 630,
        alt: 'Sfida Oltre gli Ostacoli - Vitaeology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sfida 7 Giorni Oltre gli Ostacoli',
    description: 'Trasforma i blocchi in trampolini. 7 giorni di esercizi pratici gratuiti.',
    images: ['https://www.vitaeology.com/og/challenge/ostacoli'],
  },
};

export default function OstacoliChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
