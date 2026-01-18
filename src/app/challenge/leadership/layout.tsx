import type { Metadata } from 'next';
import {
  organizationSchema,
  personSchema,
  leadershipCourseSchema,
  leadershipFaqSchema,
  leadershipBreadcrumbSchema
} from '@/lib/schema-org';

export const metadata: Metadata = {
  title: 'Leadership Autentica Imprenditori: Challenge Gratuita 7 Giorni | Vitaeology',
  description: 'Scopri il leader che sei già. Challenge gratuita di 7 giorni per imprenditori e manager italiani. Impara a guidare con autorevolezza, motivare i collaboratori e delegare efficacemente.',
  keywords: 'leadership autentica imprenditori, corso leadership online gratis, come delegare efficacemente, motivare collaboratori, leadership PMI',
  openGraph: {
    title: 'Il leader che cerchi è già dentro di te',
    description: 'Challenge gratuita 7 giorni per riconoscere la leadership che già possiedi',
    url: 'https://www.vitaeology.com/challenge/leadership',
    siteName: 'Vitaeology',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: 'https://www.vitaeology.com/og/challenge/leadership',
        width: 1200,
        height: 630,
        alt: 'Leadership Autentica - Challenge Gratuita Vitaeology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Il leader che cerchi è già dentro di te',
    description: 'Challenge gratuita 7 giorni per riconoscere la leadership che già possiedi',
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
