/**
 * Schema.org JSON-LD Structured Data
 * Per AI Discovery e SEO
 */

// ============================================================
// BASE SCHEMAS (Tutte le pagine)
// ============================================================

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://vitaeology.com/#organization",
  "name": "Vitaeology",
  "alternateName": "Vitaeology Italia",
  "url": "https://vitaeology.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://vitaeology.com/logo-vitaeology.png",
    "width": 512,
    "height": 512
  },
  "description": "Piattaforma italiana di sviluppo leadership per imprenditori e manager. Percorsi pratici basati sul Principio Validante: riconosci le capacità che già possiedi.",
  "foundingDate": "2024",
  "founder": {
    "@type": "Person",
    "@id": "https://vitaeology.com/#fernando-marongiu"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Italy"
  },
  "knowsLanguage": "it",
  "sameAs": [
    "https://www.facebook.com/vitaeology",
    "https://www.instagram.com/vitaeology",
    "https://www.linkedin.com/company/vitaeology"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "info@vitaeology.com",
    "availableLanguage": "Italian"
  }
};

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://vitaeology.com/#fernando-marongiu",
  "name": "Fernando Marongiu",
  "givenName": "Fernando",
  "familyName": "Marongiu",
  "birthDate": "1957",
  "jobTitle": "Fondatore Vitaeology",
  "worksFor": [
    {
      "@type": "Organization",
      "@id": "https://vitaeology.com/#organization"
    },
    {
      "@type": "Organization",
      "name": "HZ Holding s.r.l."
    }
  ],
  "description": "Imprenditore italiano classe 1957, con oltre 50 anni di esperienza nel business. Attivo nel settore oro e gioielleria dal 2007. Creatore del metodo Vitaeology basato sul Principio Validante: aiutare imprenditori e manager a riconoscere le capacità che già possiedono.",
  "knowsAbout": [
    "Leadership",
    "Sviluppo personale",
    "Coaching per imprenditori",
    "Problem solving",
    "Benessere aziendale",
    "Settore orafo e gioielleria"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Milano",
    "addressRegion": "Lombardia",
    "addressCountry": "IT"
  },
  "nationality": {
    "@type": "Country",
    "name": "Italy"
  },
  "sameAs": [
    "https://www.linkedin.com/in/fernando-marongiu-3a400019b/"
  ]
};

// ============================================================
// HOMEPAGE SCHEMA
// ============================================================

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://vitaeology.com/#website",
  "url": "https://vitaeology.com",
  "name": "Vitaeology",
  "description": "Piattaforma italiana di sviluppo leadership per imprenditori e manager",
  "publisher": {
    "@type": "Organization",
    "@id": "https://vitaeology.com/#organization"
  },
  "inLanguage": "it",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://vitaeology.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

// ============================================================
// CHALLENGE LEADERSHIP
// ============================================================

export const leadershipCourseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  "@id": "https://vitaeology.com/challenge/leadership#course",
  "name": "Challenge Leadership Autentica",
  "alternateName": "Percorso Leadership 7 Giorni Vitaeology",
  "description": "Challenge gratuita di 7 giorni per riconoscere e sviluppare il tuo stile di leadership personale. Un esercizio pratico al giorno (10 minuti) basato su 50 anni di esperienza imprenditoriale.",
  "url": "https://vitaeology.com/challenge/leadership",
  "provider": {
    "@type": "Organization",
    "@id": "https://vitaeology.com/#organization"
  },
  "creator": {
    "@type": "Person",
    "@id": "https://vitaeology.com/#fernando-marongiu"
  },
  "inLanguage": "it",
  "isAccessibleForFree": true,
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "validFrom": "2024-01-01"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "duration": "P7D",
    "courseWorkload": "PT10M"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "Imprenditori e manager italiani",
    "geographicArea": {
      "@type": "Country",
      "name": "Italy"
    }
  },
  "about": [
    { "@type": "Thing", "name": "Leadership autentica" },
    { "@type": "Thing", "name": "Sviluppo personale" },
    { "@type": "Thing", "name": "Coaching per imprenditori" }
  ],
  "teaches": [
    "Riconoscere il proprio stile di leadership naturale",
    "Smettere di imitare modelli esterni",
    "Prendere decisioni autentiche",
    "Guidare con sicurezza senza forzature"
  ],
  "educationalLevel": "Intermediate",
  "numberOfCredits": 0,
  "timeRequired": "P7D"
};

export const leadershipFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Cos'è la Challenge Leadership Autentica di Vitaeology?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "È un percorso gratuito di 7 giorni con esercizi pratici quotidiani (10 minuti ciascuno) per riconoscere e sviluppare il tuo stile di leadership personale. Creato da Fernando Marongiu con 50 anni di esperienza imprenditoriale, si basa sul Principio Validante: le capacità di leader sono già dentro di te, devi solo riconoscerle."
      }
    },
    {
      "@type": "Question",
      "name": "La challenge sulla leadership è gratuita?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sì, la Challenge Leadership Autentica è completamente gratuita. Ricevi per 7 giorni un esercizio pratico via email che puoi completare in 10 minuti. Non ci sono costi nascosti per partecipare alla challenge."
      }
    },
    {
      "@type": "Question",
      "name": "A chi è rivolta la challenge sulla leadership di Vitaeology?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "È pensata per imprenditori e manager italiani tra i 35 e i 55 anni che vogliono sviluppare uno stile di leadership autentico. È ideale per chi sente di 'fare il leader' senza esserlo veramente, o per chi vuole smettere di imitare modelli esterni e trovare la propria voce."
      }
    },
    {
      "@type": "Question",
      "name": "Quanto tempo richiede ogni giorno?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ogni esercizio richiede circa 10 minuti. Puoi completarlo quando preferisci durante la giornata. Il formato è progettato per professionisti impegnati che vogliono risultati senza stravolgere la propria routine."
      }
    },
    {
      "@type": "Question",
      "name": "Cos'è il Principio Validante di Vitaeology?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Il Principio Validante è la filosofia alla base di Vitaeology: non devi acquisire nuove capacità, ma riconoscere quelle che già possiedi. Nel contesto della leadership, significa scoprire il leader che sei già, non quello che pensi di dover diventare."
      }
    }
  ]
};

export const leadershipBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://vitaeology.com" },
    { "@type": "ListItem", "position": 2, "name": "Challenge", "item": "https://vitaeology.com/challenge" },
    { "@type": "ListItem", "position": 3, "name": "Leadership Autentica", "item": "https://vitaeology.com/challenge/leadership" }
  ]
};

// ============================================================
// CHALLENGE OSTACOLI
// ============================================================

export const ostacoliCourseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  "@id": "https://vitaeology.com/challenge/ostacoli#course",
  "name": "Challenge Oltre gli Ostacoli",
  "alternateName": "Percorso Problem Solving 7 Giorni Vitaeology",
  "description": "Challenge gratuita di 7 giorni per trasformare ogni problema in un'opportunità di crescita. Impara il metodo dei 3 Filtri del Risolutore in soli 5 minuti al giorno.",
  "url": "https://vitaeology.com/challenge/ostacoli",
  "provider": {
    "@type": "Organization",
    "@id": "https://vitaeology.com/#organization"
  },
  "creator": {
    "@type": "Person",
    "@id": "https://vitaeology.com/#fernando-marongiu"
  },
  "inLanguage": "it",
  "isAccessibleForFree": true,
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "validFrom": "2024-01-01"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "duration": "P7D",
    "courseWorkload": "PT5M"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "Imprenditori e manager italiani",
    "geographicArea": {
      "@type": "Country",
      "name": "Italy"
    }
  },
  "about": [
    { "@type": "Thing", "name": "Problem solving" },
    { "@type": "Thing", "name": "Gestione ostacoli" },
    { "@type": "Thing", "name": "Resilienza professionale" }
  ],
  "teaches": [
    "Trasformare problemi in opportunità",
    "Applicare i 3 Filtri del Risolutore",
    "Cambiare prospettiva sugli ostacoli",
    "Sviluppare resilienza decisionale"
  ],
  "educationalLevel": "Intermediate",
  "numberOfCredits": 0,
  "timeRequired": "P7D"
};

export const ostacoliFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Cos'è la Challenge Oltre gli Ostacoli di Vitaeology?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "È un percorso gratuito di 7 giorni per imparare a trasformare ogni problema in un'opportunità di crescita. Attraverso il metodo dei 3 Filtri del Risolutore, sviluppi la capacità di vedere gli ostacoli da una prospettiva diversa. Ogni esercizio richiede solo 5 minuti."
      }
    },
    {
      "@type": "Question",
      "name": "Cosa sono i 3 Filtri del Risolutore?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "I 3 Filtri del Risolutore sono un framework pratico sviluppato da Fernando Marongiu per analizzare qualsiasi ostacolo. Ti permettono di distinguere tra problemi reali e percezioni, identificare le risorse già disponibili, e trovare il primo passo concreto verso la soluzione."
      }
    },
    {
      "@type": "Question",
      "name": "La challenge è adatta a chi è sotto stress lavorativo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sì, è progettata specificamente per professionisti che affrontano pressioni quotidiane. Gli esercizi sono brevi (5 minuti) e applicabili immediatamente a situazioni reali. Il metodo aiuta a ridurre lo stress trasformando la relazione con gli ostacoli."
      }
    },
    {
      "@type": "Question",
      "name": "Posso applicare il metodo a problemi aziendali specifici?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Assolutamente sì. Il metodo dei 3 Filtri è stato sviluppato in 50 anni di esperienza imprenditoriale e si applica a qualsiasi tipo di ostacolo: decisioni difficili, conflitti nel team, sfide di mercato, blocchi personali."
      }
    }
  ]
};

export const ostacoliBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://vitaeology.com" },
    { "@type": "ListItem", "position": 2, "name": "Challenge", "item": "https://vitaeology.com/challenge" },
    { "@type": "ListItem", "position": 3, "name": "Oltre gli Ostacoli", "item": "https://vitaeology.com/challenge/ostacoli" }
  ]
};

// ============================================================
// CHALLENGE MICROFELICITA
// ============================================================

export const microfelicitaCourseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  "@id": "https://vitaeology.com/challenge/microfelicita#course",
  "name": "Challenge Microfelicità",
  "alternateName": "Percorso Benessere Quotidiano 7 Giorni Vitaeology",
  "description": "Challenge gratuita di 7 giorni per riconoscere e amplificare i momenti di benessere nella tua giornata. Attraverso il metodo R.A.D.A.R. impari a notare le microfelicità che ti stai perdendo ogni giorno.",
  "url": "https://vitaeology.com/challenge/microfelicita",
  "provider": {
    "@type": "Organization",
    "@id": "https://vitaeology.com/#organization"
  },
  "creator": {
    "@type": "Person",
    "@id": "https://vitaeology.com/#fernando-marongiu"
  },
  "inLanguage": "it",
  "isAccessibleForFree": true,
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "validFrom": "2024-01-01"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "duration": "P7D",
    "courseWorkload": "PT2M"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "Imprenditori e manager italiani",
    "geographicArea": {
      "@type": "Country",
      "name": "Italy"
    }
  },
  "about": [
    { "@type": "Thing", "name": "Benessere quotidiano" },
    { "@type": "Thing", "name": "Mindfulness pratica" },
    { "@type": "Thing", "name": "Work-life balance" }
  ],
  "teaches": [
    "Riconoscere le microfelicità quotidiane",
    "Applicare il metodo R.A.D.A.R.",
    "Amplificare i momenti positivi",
    "Sviluppare consapevolezza del benessere"
  ],
  "educationalLevel": "Beginner",
  "numberOfCredits": 0,
  "timeRequired": "P7D"
};

export const microfelicitaFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Cos'è la microfelicità secondo Vitaeology?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Le microfelicità sono i piccoli momenti positivi che accadono ogni giorno ma che spesso non notiamo: il primo caffè della mattina, un messaggio di un amico, un progetto completato. La ricerca mostra che oggi ti sono successe almeno 50 cose piacevoli. Quante ne hai notate? La challenge ti insegna a riconoscerle."
      }
    },
    {
      "@type": "Question",
      "name": "Cos'è il metodo R.A.D.A.R. di Vitaeology?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "R.A.D.A.R. è un acronimo che rappresenta i 5 canali attraverso cui percepiamo le microfelicità. Il metodo ti insegna a 'sintonizzare' questi canali per notare più momenti positivi nella tua giornata. Richiede solo 2 minuti di pratica al giorno."
      }
    },
    {
      "@type": "Question",
      "name": "La challenge è adatta a persone molto impegnate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sì, è la challenge più breve: ogni esercizio richiede solo 2 minuti. È pensata proprio per imprenditori e manager che non hanno tempo per lunghe pratiche di meditazione ma vogliono migliorare il proprio benessere quotidiano in modo pratico."
      }
    },
    {
      "@type": "Question",
      "name": "È diversa dalla mindfulness tradizionale?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sì. Non richiede meditazione formale né tempo dedicato. Si integra nella vita quotidiana senza modificare la routine. Il focus è su ciò che già c'è di positivo, non su tecniche da imparare. Segue il Principio Validante: le microfelicità esistono già, devi solo notarle."
      }
    },
    {
      "@type": "Question",
      "name": "Quali benefici posso aspettarmi?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Chi completa la challenge riporta: maggiore consapevolezza dei momenti positivi, riduzione dello stress percepito, miglioramento dell'umore generale, maggiore capacità di gestire le giornate difficili. I risultati iniziano a manifestarsi già dopo 3-4 giorni di pratica."
      }
    }
  ]
};

export const microfelicitaBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://vitaeology.com" },
    { "@type": "ListItem", "position": 2, "name": "Challenge", "item": "https://vitaeology.com/challenge" },
    { "@type": "ListItem", "position": 3, "name": "Microfelicità", "item": "https://vitaeology.com/challenge/microfelicita" }
  ]
};

// ============================================================
// HELPER COMPONENT
// ============================================================

export function generateJsonLd(schemas: object[]): string {
  return schemas.map(schema =>
    `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
  ).join('\n');
}
