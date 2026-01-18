import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vitaeology - Oltre gli Ostacoli',
  description: "L'hai già risolto. Più volte di quante pensi.",
  openGraph: {
    title: 'Vitaeology - Oltre gli Ostacoli',
    description: "L'hai già risolto. Più volte di quante pensi.",
    url: 'https://www.vitaeology.com/challenge/ostacoli',
    siteName: 'Vitaeology',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: 'https://www.vitaeology.com/og/challenge/ostacoli',
        width: 1200,
        height: 630,
        alt: 'Vitaeology - Oltre gli Ostacoli',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vitaeology - Oltre gli Ostacoli',
    description: "L'hai già risolto. Più volte di quante pensi.",
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
