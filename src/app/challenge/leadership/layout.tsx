import type { Metadata } from 'next';
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

// JSON-LD Schema.org per SEO e AI Discovery (Server Component)
const jsonLdSchemas = [
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
      <head>
        {jsonLdSchemas.map((schema, i) => (
          <script
            key={`jsonld-${i}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      {children}
    </>
  );
}
