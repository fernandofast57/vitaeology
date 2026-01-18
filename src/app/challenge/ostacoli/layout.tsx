import type { Metadata } from 'next';
import {
  organizationSchema,
  personSchema,
  ostacoliCourseSchema,
  ostacoliFaqSchema,
  ostacoliBreadcrumbSchema
} from '@/lib/schema-org';

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

// JSON-LD Schema.org per SEO e AI Discovery (Server Component)
const jsonLdSchemas = [
  organizationSchema,
  personSchema,
  ostacoliCourseSchema,
  ostacoliFaqSchema,
  ostacoliBreadcrumbSchema
];

export default function OstacoliChallengeLayout({
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
