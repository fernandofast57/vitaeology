import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vitaeology - Leadership Autentica',
  description: "C'è una cosa che fai da anni. Gli altri la vedono. Tu no.",
  openGraph: {
    title: 'Vitaeology - Leadership Autentica',
    description: "C'è una cosa che fai da anni. Gli altri la vedono. Tu no.",
    url: 'https://www.vitaeology.com/challenge/leadership',
    siteName: 'Vitaeology',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: 'https://www.vitaeology.com/og/challenge/leadership',
        width: 1200,
        height: 630,
        alt: 'Vitaeology - Leadership Autentica',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vitaeology - Leadership Autentica',
    description: "C'è una cosa che fai da anni. Gli altri la vedono. Tu no.",
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
