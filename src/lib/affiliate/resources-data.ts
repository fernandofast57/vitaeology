// ============================================================================
// AFFILIATE RESOURCES DATA
// Contenuti statici per materiali promozionali affiliati
// ============================================================================

// -----------------------------------------------------------------------------
// SWIPE COPY - Testi pronti per social/email
// -----------------------------------------------------------------------------

export interface SwipeCopy {
  id: string;
  tipo: 'emotivo' | 'pratico' | 'domanda';
  titolo: string;
  testo: string;
  cta: string;
  piattaforma: 'social' | 'email' | 'entrambi';
}

export const SWIPE_COPIES: Record<'leadership' | 'ostacoli' | 'microfelicita', SwipeCopy[]> = {
  leadership: [
    {
      id: 'lead-emotivo',
      tipo: 'emotivo',
      titolo: 'Per chi sente che manca qualcosa',
      testo: `Fare il leader non basta più.

Gestisci team, prendi decisioni, porti risultati... ma qualcosa non torna.

Non ti manca una competenza. Ti manca riconoscere quella che hai già.

Ho scoperto una Challenge gratuita di 7 giorni che aiuta a vedere la leadership che già operi - senza corsi teorici, senza formule magiche.

Solo 10 minuti al giorno per riconoscere ciò che fai già bene.`,
      cta: 'Scopri la Challenge gratuita →',
      piattaforma: 'entrambi',
    },
    {
      id: 'lead-pratico',
      tipo: 'pratico',
      titolo: 'Il metodo in 7 giorni',
      testo: `7 giorni. 10 minuti al giorno. Zero teoria.

La Challenge "Leadership Autentica" ti guida a:
- Riconoscere i momenti in cui già guidi con naturalezza
- Capire il tuo stile unico di leadership
- Espandere ciò che funziona dove ancora non lo usi

Non è un corso. È uno specchio che ti mostra quello che c'è già.

Gratuita. Via email. Inizi quando vuoi.`,
      cta: 'Inizia la Challenge →',
      piattaforma: 'entrambi',
    },
    {
      id: 'lead-domanda',
      tipo: 'domanda',
      titolo: 'La domanda che cambia prospettiva',
      testo: `Quando è stata l'ultima volta che hai guidato qualcuno... senza pensarci?

Un consiglio dato al volo. Una decisione presa d'istinto. Un momento in cui il team ti ha seguito naturalmente.

Quella è leadership. Ed è già tua.

La Challenge "Leadership Autentica" ti aiuta a vedere questi momenti e a moltiplicarli.

7 giorni gratuiti per riconoscere ciò che hai già.`,
      cta: 'Scopri di più →',
      piattaforma: 'social',
    },
  ],

  ostacoli: [
    {
      id: 'ost-emotivo',
      tipo: 'emotivo',
      titolo: 'Per chi si sente bloccato',
      testo: `Hai presente quando sai cosa dovresti fare... ma qualcosa ti blocca?

Non è mancanza di volontà. Non è paura.

È che stai cercando di risolvere il problema sbagliato.

La Challenge "Oltre gli Ostacoli" ti aiuta a vedere gli ostacoli per quello che sono davvero - e a trovare la strada che già conosci.

7 giorni gratuiti. 10 minuti al giorno. Nessuna formula magica.`,
      cta: 'Inizia gratis →',
      piattaforma: 'entrambi',
    },
    {
      id: 'ost-pratico',
      tipo: 'pratico',
      titolo: 'Il framework R.A.D.A.R.',
      testo: `Ogni ostacolo ha un pattern. Riconoscerlo è metà della soluzione.

La Challenge "Oltre gli Ostacoli" usa il metodo R.A.D.A.R.:
- Riconosci il vero ostacolo (spesso non è quello che pensi)
- Analizza i tuoi successi passati simili
- Decidi il primo micro-passo
- Agisci senza aspettare la motivazione
- Rifletti e adatta

7 giorni per trasformare blocchi in trampolini.`,
      cta: 'Prova il metodo →',
      piattaforma: 'entrambi',
    },
    {
      id: 'ost-domanda',
      tipo: 'domanda',
      titolo: 'La domanda chiave',
      testo: `Quante volte hai già superato un ostacolo simile... senza accorgertene?

Il problema non è che non sai come fare. È che non ricordi di averlo già fatto.

La Challenge "Oltre gli Ostacoli" ti aiuta a recuperare le soluzioni che hai già usato - e ad applicarle dove servono ora.

Gratuita. 7 giorni. Nessuna iscrizione a pagamento.`,
      cta: 'Scopri come →',
      piattaforma: 'social',
    },
  ],

  microfelicita: [
    {
      id: 'micro-emotivo',
      tipo: 'emotivo',
      titolo: 'Per chi corre sempre',
      testo: `Lavori tanto. Ottieni risultati. Ma la soddisfazione dura poco.

Non hai bisogno di più successi. Hai bisogno di notare quelli che hai già.

La Challenge "Microfelicità" ti insegna a vedere i piccoli momenti di soddisfazione che già vivi ogni giorno - e a moltiplicarli.

7 giorni per cambiare non la tua vita, ma come la guardi.`,
      cta: 'Inizia la Challenge →',
      piattaforma: 'entrambi',
    },
    {
      id: 'micro-pratico',
      tipo: 'pratico',
      titolo: 'Il metodo dei 3 momenti',
      testo: `3 momenti al giorno. È tutto quello che serve.

La Challenge "Microfelicità" ti guida a:
- Mattina: notare un momento di energia
- Pomeriggio: riconoscere una piccola vittoria
- Sera: apprezzare una connessione umana

Non aggiungi nulla alla tua giornata. Impari a vedere quello che c'è già.

7 giorni gratuiti via email.`,
      cta: 'Prova gratis →',
      piattaforma: 'entrambi',
    },
    {
      id: 'micro-domanda',
      tipo: 'domanda',
      titolo: 'La domanda che cambia tutto',
      testo: `Qual è stata l'ultima volta che ti sei fermato a goderti un successo?

Non il grande traguardo. Il piccolo momento.

Il cliente soddisfatto. Il problema risolto. Il caffè bevuto con calma.

La Challenge "Microfelicità" ti allena a notare questi momenti - perché la felicità non si insegue, si riconosce.

7 giorni gratuiti per imprenditori e manager.`,
      cta: 'Scopri di più →',
      piattaforma: 'social',
    },
  ],
};

// -----------------------------------------------------------------------------
// EMAIL TEMPLATES
// -----------------------------------------------------------------------------

export interface EmailTemplate {
  id: string;
  titolo: string;
  descrizione: string;
  oggetto: string;
  corpo: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'promo-challenge-generico',
    titolo: 'Promozione Challenge (Generico)',
    descrizione: 'Email per promuovere una qualsiasi delle 3 challenge',
    oggetto: 'Una sfida di 7 giorni che potrebbe interessarti',
    corpo: `Ciao [NOME],

ti scrivo perché ho scoperto qualcosa che penso possa esserti utile.

Si chiama Vitaeology ed è una piattaforma creata da Fernando Marongiu - un imprenditore con 50 anni di esperienza che ha deciso di condividere ciò che ha imparato.

Offrono 3 Challenge gratuite di 7 giorni:
- Leadership Autentica (per chi guida team)
- Oltre gli Ostacoli (per chi si sente bloccato)
- Microfelicità (per chi corre sempre)

Ogni challenge richiede solo 10 minuti al giorno e arriva via email.

L'approccio è diverso dal solito: non ti insegnano cose nuove, ti aiutano a riconoscere le capacità che hai già.

Se ti interessa, puoi iniziare da qui: [IL TUO LINK]

Fammi sapere cosa ne pensi!

[LA TUA FIRMA]`,
  },
  {
    id: 'promo-leadership',
    titolo: 'Promozione Leadership Autentica',
    descrizione: 'Email specifica per la challenge Leadership',
    oggetto: 'Sai già guidare - devi solo vederlo',
    corpo: `Ciao [NOME],

sai qual è la differenza tra un buon leader e uno che si sente sempre inadeguato?

Non le competenze. Non l'esperienza.

È la capacità di riconoscere quello che fa già bene.

Ho trovato una Challenge gratuita di 7 giorni che fa esattamente questo: ti aiuta a vedere la leadership che già operi ogni giorno.

Si chiama "Leadership Autentica" ed è creata da Fernando Marongiu, un imprenditore con 50 anni di esperienza.

- 7 giorni
- 10 minuti al giorno
- Via email
- Completamente gratuita

L'ho consigliata a diversi colleghi e il feedback è sempre stato: "Mi ha fatto vedere cose che non notavo".

Se ti interessa: [IL TUO LINK]

Un abbraccio,
[LA TUA FIRMA]`,
  },
  {
    id: 'follow-up',
    titolo: 'Follow-up dopo condivisione',
    descrizione: 'Email da inviare a chi ha mostrato interesse ma non si è iscritto',
    oggetto: 'Hai avuto modo di guardare?',
    corpo: `Ciao [NOME],

ti avevo parlato della Challenge Vitaeology qualche giorno fa.

Hai avuto modo di darci un'occhiata?

So che sei impegnato/a, quindi volevo solo ricordarti che:
- È gratuita
- Richiede solo 10 minuti al giorno
- Puoi iniziare quando vuoi
- Puoi smettere quando vuoi (ma raramente lo fa qualcuno!)

Se hai domande, sono qui.

Il link è sempre questo: [IL TUO LINK]

A presto,
[LA TUA FIRMA]`,
  },
  {
    id: 'testimonianza',
    titolo: 'Condivisione con testimonianza personale',
    descrizione: 'Email dove condividi la tua esperienza diretta',
    oggetto: 'Qualcosa che mi ha aiutato (volevo condividerlo)',
    corpo: `Ciao [NOME],

volevo condividere con te qualcosa che mi ha aiutato nelle ultime settimane.

Ho fatto una Challenge di 7 giorni su [TEMA: leadership/ostacoli/microfelicità] e devo dire che mi ha sorpreso.

Non è il solito corso motivazionale. L'approccio è diverso: invece di insegnarti cose nuove, ti aiuta a riconoscere quello che fai già bene.

[INSERISCI LA TUA ESPERIENZA PERSONALE - cosa hai scoperto, cosa è cambiato]

Se ti può interessare, il link è questo: [IL TUO LINK]

È gratuita e richiede solo 10 minuti al giorno.

Fammi sapere se la provi!

[LA TUA FIRMA]`,
  },
];

// -----------------------------------------------------------------------------
// BANNER INFO (placeholder - i banner reali saranno su cloud storage)
// -----------------------------------------------------------------------------

export interface BannerInfo {
  id: string;
  nome: string;
  dimensione: string;
  piattaforma: string;
  descrizione: string;
  downloadUrl: string | null; // null = coming soon
}

export const BANNERS: BannerInfo[] = [
  {
    id: 'fb-leadership',
    nome: 'Leadership - Facebook/LinkedIn',
    dimensione: '1200x628',
    piattaforma: 'Facebook, LinkedIn',
    descrizione: 'Banner orizzontale per post e ads',
    downloadUrl: null,
  },
  {
    id: 'ig-feed-leadership',
    nome: 'Leadership - Instagram Feed',
    dimensione: '1080x1080',
    piattaforma: 'Instagram Feed',
    descrizione: 'Quadrato per post nel feed',
    downloadUrl: null,
  },
  {
    id: 'ig-story-leadership',
    nome: 'Leadership - Instagram Stories',
    dimensione: '1080x1920',
    piattaforma: 'Instagram Stories',
    descrizione: 'Verticale per stories',
    downloadUrl: null,
  },
  {
    id: 'fb-ostacoli',
    nome: 'Ostacoli - Facebook/LinkedIn',
    dimensione: '1200x628',
    piattaforma: 'Facebook, LinkedIn',
    descrizione: 'Banner orizzontale per post e ads',
    downloadUrl: null,
  },
  {
    id: 'ig-feed-ostacoli',
    nome: 'Ostacoli - Instagram Feed',
    dimensione: '1080x1080',
    piattaforma: 'Instagram Feed',
    descrizione: 'Quadrato per post nel feed',
    downloadUrl: null,
  },
  {
    id: 'ig-story-ostacoli',
    nome: 'Ostacoli - Instagram Stories',
    dimensione: '1080x1920',
    piattaforma: 'Instagram Stories',
    descrizione: 'Verticale per stories',
    downloadUrl: null,
  },
  {
    id: 'fb-micro',
    nome: 'Microfelicità - Facebook/LinkedIn',
    dimensione: '1200x628',
    piattaforma: 'Facebook, LinkedIn',
    descrizione: 'Banner orizzontale per post e ads',
    downloadUrl: null,
  },
  {
    id: 'ig-feed-micro',
    nome: 'Microfelicità - Instagram Feed',
    dimensione: '1080x1080',
    piattaforma: 'Instagram Feed',
    descrizione: 'Quadrato per post nel feed',
    downloadUrl: null,
  },
  {
    id: 'ig-story-micro',
    nome: 'Microfelicità - Instagram Stories',
    dimensione: '1080x1920',
    piattaforma: 'Instagram Stories',
    descrizione: 'Verticale per stories',
    downloadUrl: null,
  },
];

// -----------------------------------------------------------------------------
// UTM LINK TEMPLATES
// -----------------------------------------------------------------------------

export interface UtmTemplate {
  id: string;
  nome: string;
  descrizione: string;
  source: string;
  medium: string;
  campaign: string;
}

export const UTM_TEMPLATES: UtmTemplate[] = [
  {
    id: 'facebook-post',
    nome: 'Post Facebook',
    descrizione: 'Per post organici su Facebook',
    source: 'facebook',
    medium: 'social',
    campaign: 'organic_post',
  },
  {
    id: 'instagram-bio',
    nome: 'Link in Bio Instagram',
    descrizione: 'Per il link nella bio di Instagram',
    source: 'instagram',
    medium: 'social',
    campaign: 'bio_link',
  },
  {
    id: 'instagram-story',
    nome: 'Story Instagram',
    descrizione: 'Per link nelle stories',
    source: 'instagram',
    medium: 'social',
    campaign: 'story',
  },
  {
    id: 'linkedin-post',
    nome: 'Post LinkedIn',
    descrizione: 'Per post organici su LinkedIn',
    source: 'linkedin',
    medium: 'social',
    campaign: 'organic_post',
  },
  {
    id: 'email-personal',
    nome: 'Email Personale',
    descrizione: 'Per email inviate a contatti personali',
    source: 'email',
    medium: 'email',
    campaign: 'personal_outreach',
  },
  {
    id: 'whatsapp',
    nome: 'WhatsApp',
    descrizione: 'Per condivisione via WhatsApp',
    source: 'whatsapp',
    medium: 'messenger',
    campaign: 'direct_share',
  },
  {
    id: 'telegram',
    nome: 'Telegram',
    descrizione: 'Per condivisione via Telegram',
    source: 'telegram',
    medium: 'messenger',
    campaign: 'direct_share',
  },
  {
    id: 'newsletter',
    nome: 'Newsletter',
    descrizione: 'Per inserimento in newsletter',
    source: 'newsletter',
    medium: 'email',
    campaign: 'newsletter_mention',
  },
];

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------------------------

export function buildAffiliateLink(
  baseUrl: string,
  refCode: string,
  challenge: 'leadership' | 'ostacoli' | 'microfelicita',
  utm?: UtmTemplate
): string {
  const url = new URL(`${baseUrl}/challenge/${challenge}`);
  url.searchParams.set('ref', refCode);

  if (utm) {
    url.searchParams.set('utm_source', utm.source);
    url.searchParams.set('utm_medium', utm.medium);
    url.searchParams.set('utm_campaign', utm.campaign);
  }

  return url.toString();
}

export function getChallengeDisplayName(challenge: 'leadership' | 'ostacoli' | 'microfelicita'): string {
  const names = {
    leadership: 'Leadership Autentica',
    ostacoli: 'Oltre gli Ostacoli',
    microfelicita: 'Microfelicità',
  };
  return names[challenge];
}

export function getChallengeColor(challenge: 'leadership' | 'ostacoli' | 'microfelicita'): string {
  const colors = {
    leadership: '#D4AF37', // Oro
    ostacoli: '#10B981',   // Verde
    microfelicita: '#8B5CF6', // Viola
  };
  return colors[challenge];
}
