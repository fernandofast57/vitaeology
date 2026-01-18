import type { Metadata } from 'next';
import Script from 'next/script';
import {
  organizationSchema,
  personSchema,
  leadershipCourseSchema,
  leadershipFaqSchema,
  leadershipBreadcrumbSchema
} from '@/lib/schema-org';

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

// Schema.org JSON-LD combinato per SEO e AI Discovery
const jsonLd = [
  organizationSchema,
  personSchema,
  leadershipCourseSchema,
  leadershipFaqSchema,
  leadershipBreadcrumbSchema
];

export default function LeadershipChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        id="leadership-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd)
        }}
      />
      {children}
    </>
  );
}
