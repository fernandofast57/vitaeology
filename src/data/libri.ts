// Dati dei 3 libri Vitaeology

export interface Libro {
  slug: string;
  titolo: string;
  sottotitolo: string;
  prezzo: number;
  stripePriceId: string;
  coloreAccent: string;
  assessmentSlug: string;
  painPoints: string[];
  benefici: string[];
  capitoli: string[];
  cosaImparerai: string[];
  autore: {
    nome: string;
    bio: string;
    credenziali: string[];
  };
  garanzia: string;
  copertinaUrl: string;
  // URL Amazon per acquisto libro fisico (vuoto = non ancora disponibile)
  amazonUrl?: string;
}

export const LIBRI: Record<string, Libro> = {
  leadership: {
    slug: 'leadership',
    titolo: 'Leadership Autentica',
    sottotitolo: 'Come Sviluppare le 24 Caratteristiche del Genio',
    prezzo: 9.90,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_LEADERSHIP || 'price_leadership',
    coloreAccent: '#0F4C81',
    assessmentSlug: 'leadership',
    painPoints: [
      'Senti il peso della responsabilità ma non l\'autorevolezza che meriti?',
      'I tuoi collaboratori eseguono, ma non si coinvolgono davvero?',
      'Hai letto decine di manuali ma nulla sembra funzionare nel contesto italiano?',
      'Ti chiedi se la leadership sia un talento innato che non possiedi?',
    ],
    benefici: [
      '24 caratteristiche concrete da riconoscere e sviluppare',
      '50 anni di errori trasformati in comprensioni applicabili',
      'Assessment gratuito per mappare il tuo punto di partenza',
      'Esercizi pratici testati con centinaia di imprenditori',
    ],
    capitoli: [
      'Pilastro 1: Visione - Dove stai andando?',
      'Pilastro 2: Azione - Come realizzi la visione?',
      'Pilastro 3: Relazioni - Con chi costruisci?',
      'Pilastro 4: Adattamento - Come evolvi?',
      'Le 24 Caratteristiche del Genio della Leadership',
      'Il Percorso di Sviluppo Personale',
    ],
    cosaImparerai: [
      'Come passare da manager a leader autentico',
      'Riconoscere e sviluppare le tue caratteristiche dominanti',
      'Riconoscere risorse nascoste nelle tue sfide',
      'Costruire un team che segue con autodeterminazione, non per obbligo',
      'Applicare la leadership nel contesto imprenditoriale italiano',
    ],
    autore: {
      nome: 'Fernando Marongiu',
      bio: 'Dopo 50 anni come imprenditore e consulente, Fernando ha sintetizzato errori, fallimenti e successi in un metodo pratico per sviluppare la leadership autentica. Non teoria accademica, ma esperienza vissuta sul campo.',
      credenziali: [
        '50+ anni di esperienza imprenditoriale',
        'Centinaia di imprenditori formati',
        'Autore del modello delle 24 Caratteristiche',
      ],
    },
    garanzia: 'Garanzia Soddisfatti o Rimborsati 30 giorni. Se il libro non ti è utile, ti restituisco l\'intero importo senza domande.',
    copertinaUrl: '/images/libri/leadership-cover.png',
    amazonUrl: '', // Aggiungere URL Amazon quando disponibile
  },

  risolutore: {
    slug: 'risolutore',
    titolo: 'Oltre gli Ostacoli',
    sottotitolo: 'Il Metodo Risolutore per Trasformare i Problemi in Opportunità',
    prezzo: 9.90,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_RISOLUTORE || 'price_risolutore',
    coloreAccent: '#C1272D',
    assessmentSlug: 'risolutore',
    painPoints: [
      'Ti blocchi di fronte a problemi complessi senza sapere da dove iniziare?',
      'Le soluzioni che trovi spesso creano nuovi problemi?',
      'Senti di reagire agli eventi invece di guidarli?',
      'Rimandi le decisioni difficili sperando che si risolvano da sole?',
    ],
    benefici: [
      'Framework CAMBIA in 6 step per qualsiasi problema',
      'Identifica i tuoi 3 Traditori interiori che sabotano le soluzioni',
      'Assessment gratuito per scoprire il tuo stile di problem-solving',
      'Casi studio reali di problemi risolti con il metodo',
    ],
    capitoli: [
      'Perché i problemi ti bloccano: i 3 Traditori',
      'Il Framework CAMBIA: panoramica',
      'C - Comprendi il problema reale',
      'A - Analizza le opzioni',
      'M - Misura le conseguenze',
      'B - Bilancia rischi e benefici',
      'I - Implementa con decisione',
      'A - Adatta in corso d\'opera',
    ],
    cosaImparerai: [
      'Come scomporre problemi complessi in parti gestibili',
      'Riconoscere quando il vero problema è diverso da quello apparente',
      'Prendere decisioni difficili senza paralisi da analisi',
      'Trasformare gli ostacoli in trampolini per la crescita',
      'Sviluppare un mindset risolutivo permanente',
    ],
    autore: {
      nome: 'Fernando Marongiu',
      bio: 'Fernando ha affrontato e risolto centinaia di problemi aziendali in 50 anni di carriera. Da crisi finanziarie a conflitti con soci, ha sviluppato un metodo sistematico che ora condivide con altri imprenditori.',
      credenziali: [
        '50+ anni di problem-solving aziendale',
        'Decine di aziende risanate',
        'Creatore del Framework CAMBIA',
      ],
    },
    garanzia: 'Garanzia Soddisfatti o Rimborsati 30 giorni. Se il metodo non funziona per te, rimborso completo.',
    copertinaUrl: '/images/libri/risolutore-cover.png',
    amazonUrl: '', // Aggiungere URL Amazon quando disponibile
  },

  microfelicita: {
    slug: 'microfelicita',
    titolo: 'Microfelicità Digitale',
    sottotitolo: 'Ritrova il Benessere nell\'Era della Distrazione Continua',
    prezzo: 9.90,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MICROFELICITA || 'price_microfelicita',
    coloreAccent: '#2D9B6D',
    assessmentSlug: 'microfelicita',
    painPoints: [
      'Ti senti costantemente connesso ma profondamente solo?',
      'La tecnologia prometteva libertà ma ti ha reso schiavo delle notifiche?',
      'Cerchi la felicità nei grandi eventi mentre ignori i piccoli momenti?',
      'Ti addormenti con lo smartphone e ti svegli già stanco?',
    ],
    benefici: [
      'Sistema R.A.D.A.R. per riprendere il controllo digitale',
      '52 pratiche settimanali di microfelicità',
      'Assessment gratuito per misurare il tuo benessere digitale',
      'Routine testate per disconnetterti senza isolarti',
    ],
    capitoli: [
      'L\'Illusione della Connessione Continua',
      'Il Sistema R.A.D.A.R.: panoramica',
      'R - Riconosci le tue dipendenze digitali',
      'A - Analizza i trigger emotivi',
      'D - Disconnetti con intenzione',
      'A - Attiva le microfelicità',
      'R - Riconnetti con significato',
      '52 Pratiche Settimanali',
    ],
    cosaImparerai: [
      'Come usare la tecnologia senza esserne usato',
      'Riconoscere i momenti di felicità che già hai ma ignori',
      'Creare rituali digitali sani per te e la tua famiglia',
      'Trasformare il tempo-schermo in tempo di qualità',
      'Ritrovare la presenza nel momento presente',
    ],
    autore: {
      nome: 'Fernando Marongiu',
      bio: 'Fernando ha vissuto la transizione dal mondo analogico a quello digitale. Dopo aver osservato come la tecnologia stava erodendo il benessere di imprenditori e famiglie, ha sviluppato un approccio pratico per ritrovare l\'equilibrio.',
      credenziali: [
        '50+ anni di osservazione del comportamento umano',
        'Padre e nonno nell\'era digitale',
        'Creatore del Sistema R.A.D.A.R.',
      ],
    },
    garanzia: 'Garanzia Soddisfatti o Rimborsati 30 giorni. Se non ti senti più sereno dopo 4 settimane, ti rimborso.',
    copertinaUrl: '/images/libri/microfelicita-cover.png',
    amazonUrl: '', // Aggiungere URL Amazon quando disponibile
  },
};

export function getLibroBySlug(slug: string): Libro | undefined {
  return LIBRI[slug];
}

export function getAllLibriSlugs(): string[] {
  return Object.keys(LIBRI);
}
