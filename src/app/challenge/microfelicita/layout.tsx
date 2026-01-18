import type { Metadata } from 'next';
import {
  organizationSchema,
  personSchema,
  microfelicitaCourseSchema,
  microfelicitaFaqSchema,
  microfelicitaBreadcrumbSchema
} from '@/lib/schema-org';

export const metadata: Metadata = {
  title: 'Benessere Imprenditore: Challenge Microfelicità 7 Giorni | Vitaeology',
  description: "Tra le 50 cose piacevoli di oggi, quante ne hai notate? Challenge gratuita per ridurre lo stress in 5 minuti al giorno. Il 72% degli imprenditori soffre di stress — tu puoi uscirne.",
  keywords: 'benessere imprenditore, ridurre stress imprenditore, microfelicità, equilibrio vita lavoro imprenditore, prevenire burnout imprenditore',
  openGraph: {
    title: 'Tra le 50 cose piacevoli di oggi, quante ne hai notate?',
    description: 'Challenge gratuita 7 giorni per vedere quello che già c\'è',
    url: 'https://www.vitaeology.com/challenge/microfelicita',
    siteName: 'Vitaeology',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: 'https://www.vitaeology.com/og/challenge/microfelicita',
        width: 1200,
        height: 630,
        alt: 'Microfelicità - Challenge Gratuita Vitaeology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tra le 50 cose piacevoli di oggi, quante ne hai notate?',
    description: 'Challenge gratuita 7 giorni per vedere quello che già c\'è',
    images: ['https://www.vitaeology.com/og/challenge/microfelicita'],
  },
};

// JSON-LD Schema.org per SEO e AI Discovery (Server Component)
const jsonLdSchemas = [
  organizationSchema,
  personSchema,
  microfelicitaCourseSchema,
  microfelicitaFaqSchema,
  microfelicitaBreadcrumbSchema
];

export default function MicrofelicitaChallengeLayout({
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
