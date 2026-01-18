import type { Metadata } from 'next';
import {
  organizationSchema,
  personSchema,
  microfelicitaCourseSchema,
  microfelicitaFaqSchema,
  microfelicitaBreadcrumbSchema
} from '@/lib/schema-org';

export const metadata: Metadata = {
  title: 'Vitaeology - Microfelicità',
  description: "C'era un momento in cui sapevi essere felice. È ancora lì.",
  openGraph: {
    title: 'Vitaeology - Microfelicità',
    description: "C'era un momento in cui sapevi essere felice. È ancora lì.",
    url: 'https://www.vitaeology.com/challenge/microfelicita',
    siteName: 'Vitaeology',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: 'https://www.vitaeology.com/og/challenge/microfelicita',
        width: 1200,
        height: 630,
        alt: 'Vitaeology - Microfelicità',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vitaeology - Microfelicità',
    description: "C'era un momento in cui sapevi essere felice. È ancora lì.",
    images: ['https://www.vitaeology.com/og/challenge/microfelicita'],
  },
};

// Schema.org JSON-LD per SEO e AI Discovery
const schemas = [
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
      {/* Schema.org JSON-LD - Server Side Rendered */}
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {children}
    </>
  );
}
