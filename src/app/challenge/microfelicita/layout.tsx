import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sfida 7 Giorni Microfelicità | Vitaeology',
  description: 'Riscopri la gioia nei piccoli momenti quotidiani. 7 giorni di pratiche semplici per coltivare benessere e presenza nel digitale.',
  openGraph: {
    title: 'Sfida 7 Giorni Microfelicità',
    description: 'Trova la gioia nei piccoli momenti. 7 giorni di pratiche gratuite.',
    url: 'https://www.vitaeology.com/challenge/microfelicita',
    siteName: 'Vitaeology',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: 'https://www.vitaeology.com/og/challenge/microfelicita',
        width: 1200,
        height: 630,
        alt: 'Sfida Microfelicità - Vitaeology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sfida 7 Giorni Microfelicità',
    description: 'Trova la gioia nei piccoli momenti. 7 giorni di pratiche gratuite.',
    images: ['https://www.vitaeology.com/og/challenge/microfelicita'],
  },
};

export default function MicrofelicitaChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
