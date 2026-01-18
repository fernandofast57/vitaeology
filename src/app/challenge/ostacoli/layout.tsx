import type { Metadata } from 'next';
import {
  organizationSchema,
  personSchema,
  ostacoliCourseSchema,
  ostacoliFaqSchema,
  ostacoliBreadcrumbSchema
} from '@/lib/schema-org';

export const metadata: Metadata = {
  title: 'Superare Ostacoli Impresa: Challenge Problem Solving 7 Giorni | Vitaeology',
  description: "Sai già risolvere, l'hai solo dimenticato. Challenge gratuita per imprenditori bloccati. Sblocca le decisioni difficili, esci dalla paralisi e torna in azione con chiarezza.",
  keywords: 'problem solving imprenditore, superare blocco decisionale, imprenditore bloccato cosa fare, come prendere decisioni difficili, uscire da crisi aziendale',
  openGraph: {
    title: "Sai già risolvere. L'hai solo dimenticato.",
    description: 'Challenge gratuita 7 giorni per risvegliare il risolutore che hai dentro',
    url: 'https://www.vitaeology.com/challenge/ostacoli',
    siteName: 'Vitaeology',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: 'https://www.vitaeology.com/og/challenge/ostacoli',
        width: 1200,
        height: 630,
        alt: 'Oltre gli Ostacoli - Challenge Gratuita Vitaeology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Sai già risolvere. L'hai solo dimenticato.",
    description: 'Challenge gratuita 7 giorni per risvegliare il risolutore che hai dentro',
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
