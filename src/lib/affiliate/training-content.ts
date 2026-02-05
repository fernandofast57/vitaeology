// ============================================================================
// AFFILIATE TRAINING CONTENT
// Percorso 6 fasi per diventare Super Affiliate (Jim Edwards framework)
// ============================================================================

export interface TrainingPhase {
  fase: number;
  titolo: string;
  sottotitolo: string;
  durata: string;
  icona: string;
  descrizione: string;
  perche: string;
  contenuto: string;
  esercizi: TrainingExercise[];
  checklist: string[];
  erroriComuni: string[];
  risorse: TrainingResource[];
}

export interface TrainingExercise {
  titolo: string;
  descrizione: string;
  deliverable: string;
}

export interface TrainingResource {
  titolo: string;
  tipo: 'link' | 'download' | 'video';
  url: string | null;
}

export const TRAINING_PHASES: TrainingPhase[] = [
  {
    fase: 1,
    titolo: 'Comprendere il PERCHÉ',
    sottotitolo: 'La mission viene prima del marketing',
    durata: '30 minuti',
    icona: '💡',
    descrizione: 'Prima di promuovere, devi capire e condividere la mission di Vitaeology. Non si tratta solo di guadagnare commissioni, ma di aiutare persone reali.',
    perche: 'Gli affiliati che credono nel prodotto vendono 3x di più rispetto a chi promuove solo per i soldi. La tua autenticità si percepisce in ogni messaggio che scrivi.',
    contenuto: `## Il Principio Validante di Vitaeology

Vitaeology si basa su un principio fondamentale: **l'utente HA GIÀ le capacità di leadership**. Non deve acquisirle, deve RICONOSCERLE.

Questo cambia tutto nel modo in cui comunichi:

### Cosa NON dire mai
- "Ti manca la leadership"
- "Devi imparare a guidare"
- "Hai un problema di..."
- "Il tuo deficit è..."

### Cosa dire invece
- "Riconosci il leader che già sei"
- "Scopri lo stile che già usi"
- "Attiva ciò che hai già"
- "Riscopri le capacità che possiedi"

## Perché questo approccio funziona

Le persone sono stanche di sentirsi dire che gli manca qualcosa. Vitaeology offre un messaggio diverso: **tu sei già capace, devi solo vederlo**.

Questo risuona profondamente con imprenditori e manager che:
- Hanno già ottenuto risultati nella vita
- Non vogliono essere trattati come studenti
- Cercano riconoscimento, non lezioni

## Il tuo ruolo come affiliato

Non sei un venditore. Sei un **facilitatore di consapevolezza**. Aiuti le persone a scoprire un percorso che può far emergere ciò che già hanno.

Quando parli di Vitaeology, ricorda:
- Non stai vendendo un corso
- Stai offrendo uno specchio
- Le Challenge sono gratuite perché il valore è nel riconoscimento`,
    esercizi: [
      {
        titolo: 'Scrivi il tuo "Perché"',
        descrizione: 'Scrivi 3 motivi personali per cui credi nel Principio Validante. Non motivi di marketing, ma motivi tuoi.',
        deliverable: 'Documento con 3 motivi personali (minimo 50 parole ciascuno)',
      },
      {
        titolo: 'Riscrivi un messaggio',
        descrizione: 'Prendi un post promozionale tipico ("Impara a essere un leader!") e riscrivilo con il Principio Validante.',
        deliverable: 'Post riscritto con linguaggio validante',
      },
    ],
    checklist: [
      'Ho letto e capito il Principio Validante',
      'Posso spiegare in 30 secondi cosa rende Vitaeology diverso',
      'Ho scritto i miei 3 "perché" personali',
      'So quali parole evitare e quali usare',
    ],
    erroriComuni: [
      'Promuovere solo per le commissioni senza credere nel prodotto',
      'Usare linguaggio da "deficit" invece che validante',
      'Trattare Vitaeology come un corso qualsiasi',
    ],
    risorse: [
      { titolo: 'Challenge Leadership (provala tu stesso)', tipo: 'link', url: '/challenge/leadership' },
      { titolo: 'Challenge Ostacoli', tipo: 'link', url: '/challenge/ostacoli' },
      { titolo: 'Challenge Microfelicità', tipo: 'link', url: '/challenge/microfelicita' },
    ],
  },
  {
    fase: 2,
    titolo: 'Scegliere la Tua Nicchia',
    sottotitolo: 'Chi è il TUO pubblico ideale?',
    durata: '45 minuti',
    icona: '🎯',
    descrizione: 'Identificare UN pubblico specifico a cui parlare. Non cercare di parlare a tutti - chi parla a tutti non parla a nessuno.',
    perche: 'Un messaggio generico converte al 2%. Un messaggio mirato alla tua nicchia può convertire al 15-20%. La specificità vince sempre.',
    contenuto: `## Il Potere della Specificità

Vitaeology parla a "imprenditori e manager italiani 35-55 anni". Ma tu puoi essere ancora più specifico.

### Nicchie possibili

**Per settore:**
- Imprenditori tech/startup
- Titolari di PMI manifatturiere
- Professionisti (avvocati, commercialisti, medici)
- Manager corporate
- Consulenti e coach

**Per sfida:**
- Neo-manager che devono gestire il primo team
- Imprenditori in fase di scale-up
- Manager in burnout
- Professionisti che vogliono passare a imprenditoria

**Per momento:**
- Chi ha appena promosso a ruolo di leadership
- Chi sta attraversando un cambiamento aziendale
- Chi cerca work-life balance
- Chi vuole crescere ma si sente bloccato

## Come scegliere la TUA nicchia

Rispondi a queste domande:

1. **Chi conosci già?** - Dove hai contatti, follower, credibilità?
2. **Chi capisci meglio?** - Quale gruppo ha sfide che comprendi per esperienza?
3. **Dove puoi accedere?** - In quali community sei già presente?
4. **Chi pagherebbe?** - Quale gruppo ha budget per investire su di sé?

## La regola dell'UNO

Scegli UNA nicchia per iniziare. Non due, non tre. UNA.

Puoi sempre espanderti dopo, ma inizia focalizzato. Meglio essere il riferimento per 1.000 persone che uno tra tanti per 100.000.`,
    esercizi: [
      {
        titolo: 'Mappa le tue connessioni',
        descrizione: 'Elenca i gruppi/community dove hai già presenza: LinkedIn, Facebook, associazioni, ex-colleghi, etc.',
        deliverable: 'Lista di almeno 5 gruppi/community con numero stimato di membri',
      },
      {
        titolo: 'Definisci il tuo cliente ideale',
        descrizione: 'Crea un profilo dettagliato: età, ruolo, settore, sfide principali, dove passa il tempo online.',
        deliverable: 'Profilo scritto di 200+ parole del tuo cliente ideale',
      },
    ],
    checklist: [
      'Ho identificato la mia nicchia principale',
      'Posso descrivere il mio cliente ideale in 30 secondi',
      'So dove trovare queste persone online',
      'Ho almeno 3 community dove sono già presente',
    ],
    erroriComuni: [
      'Scegliere una nicchia troppo ampia ("imprenditori")',
      'Cambiare nicchia ogni settimana',
      'Scegliere una nicchia che non conosci bene',
      'Ignorare dove hai già credibilità',
    ],
    risorse: [
      { titolo: 'Materiali Promozionali', tipo: 'link', url: '/affiliate/resources' },
    ],
  },
  {
    fase: 3,
    titolo: 'Creare il Value Trade',
    sottotitolo: 'Offri valore prima di chiedere',
    durata: '1 ora',
    icona: '🎁',
    descrizione: 'Prima di promuovere, offri qualcosa di valore. Le Challenge Vitaeology sono già un perfetto "value trade" - 7 giorni di contenuto gratuito.',
    perche: 'Le persone comprano da chi le ha già aiutate. Offrire valore gratis costruisce fiducia e reciprocità - la base di ogni vendita etica.',
    contenuto: `## Il Principio del Value Trade

Un "value trade" è uno scambio: tu offri qualcosa di valore, l'altra persona ti dà la sua attenzione (e poi, eventualmente, il suo denaro).

### Le Challenge come Value Trade perfetto

Le Challenge Vitaeology sono già strutturate come value trade:
- 7 giorni di contenuto gratuito
- Esercizi pratici
- Nessun obbligo di acquisto

Il tuo compito è **presentare questo valore**, non venderlo.

## Come presentare il Value Trade

### Approccio sbagliato
"Iscriviti a questa challenge e poi compra l'abbonamento"

### Approccio corretto
"C'è una challenge gratuita di 7 giorni che ti aiuta a riconoscere il tuo stile di leadership. Nessun obbligo, solo 10 minuti al giorno. Se ti è utile, puoi decidere di approfondire."

## Creare contenuto di valore TUO

Oltre a promuovere le Challenge, puoi creare valore tuo:

**Contenuti che funzionano:**
- Post con insight sulla leadership (dalla tua esperienza)
- Storie di trasformazione (tue o di chi conosci)
- Tips pratici applicabili subito
- Domande che fanno riflettere

**Contenuti da evitare:**
- Post puramente promozionali
- "Compra questo corso"
- Contenuti copiati senza valore aggiunto

## La regola 80/20

80% del tuo contenuto: valore gratuito, senza CTA
20% del tuo contenuto: promozione delle Challenge

Chi ti segue deve pensare: "Questa persona mi aiuta sempre, voglio saperne di più"`,
    esercizi: [
      {
        titolo: 'Crea 5 post di valore',
        descrizione: 'Scrivi 5 post per la tua nicchia che offrono valore senza promuovere nulla. Tips, insight, domande.',
        deliverable: '5 post pronti da pubblicare (150+ parole ciascuno)',
      },
      {
        titolo: 'Scrivi la tua storia',
        descrizione: 'Racconta un momento in cui hai riconosciuto una tua capacità di leadership che non sapevi di avere.',
        deliverable: 'Storia personale di 300+ parole',
      },
    ],
    checklist: [
      'Ho capito la differenza tra vendere e offrire valore',
      'Ho 5+ post di valore pronti',
      'So presentare le Challenge come opportunità, non come vendita',
      'Ho scritto la mia storia personale',
    ],
    erroriComuni: [
      'Promuovere senza mai offrire valore gratuito',
      'Copiare contenuti altrui senza personalizzarli',
      'Essere troppo "salesy" in ogni post',
      'Non avere una storia personale da raccontare',
    ],
    risorse: [
      { titolo: 'Swipe Copy pronti', tipo: 'link', url: '/affiliate/resources' },
      { titolo: 'Email Templates', tipo: 'link', url: '/affiliate/resources' },
    ],
  },
  {
    fase: 4,
    titolo: 'Aggiungere Valore Costante',
    sottotitolo: 'La consistenza batte l\'intensità',
    durata: '1 ora + pratica continua',
    icona: '📅',
    descrizione: 'Pubblicare contenuti utili regolarmente. Non vendere sempre, ma educare e aiutare. La vendita viene come conseguenza.',
    perche: 'Chi pubblica costantemente costruisce un\'audience fedele. Un post virale non vale quanto 100 post costanti nel tempo.',
    contenuto: `## Il Potere della Costanza

La maggior parte degli affiliati pubblica un post, non vede risultati immediati, e smette. Questo è l'errore più grande.

### I numeri che contano

- Servono **7-12 touchpoint** prima che qualcuno agisca
- Il **primo mese** quasi nessuno converte
- Al **terzo mese** inizi a vedere pattern
- Al **sesto mese** hai un sistema che funziona

## Creare un Calendario Editoriale

### Frequenza consigliata
- **Minimo:** 3 post a settimana
- **Ideale:** 1 post al giorno
- **Massimo:** 2-3 post al giorno (rischi oversaturation)

### Struttura settimanale esempio

| Giorno | Tipo di Post |
|--------|--------------|
| Lunedì | Insight/Tip pratico |
| Martedì | Storia/Esempio |
| Mercoledì | Domanda che fa riflettere |
| Giovedì | Promozione Challenge (soft) |
| Venerdì | Contenuto personale |
| Weekend | Ricondivisione o pausa |

## Cosa pubblicare

### Pilastri di contenuto per affiliati Vitaeology

1. **Leadership** - Tips, errori comuni, insight
2. **Crescita personale** - Mindset, abitudini, routine
3. **Storie** - Tue esperienze, trasformazioni
4. **Behind the scenes** - Il tuo percorso come affiliato
5. **Promozione** - Challenge, eventi, novità (max 20%)

## Batch content creation

Non creare contenuto ogni giorno. Dedica 2-3 ore una volta a settimana per creare tutto il contenuto della settimana successiva.

**Processo:**
1. Lunedì: Brainstorm idee
2. Martedì: Scrivi tutti i post
3. Mercoledì: Rivedi e programma
4. Resto della settimana: Solo engagement`,
    esercizi: [
      {
        titolo: 'Crea il tuo calendario editoriale',
        descrizione: 'Pianifica 2 settimane di contenuto: cosa pubblichi, dove, quando.',
        deliverable: 'Calendario con 10+ post pianificati',
      },
      {
        titolo: 'Batch creation',
        descrizione: 'Dedica 2 ore a creare contenuto per una settimana intera.',
        deliverable: '7 post pronti da programmare',
      },
    ],
    checklist: [
      'Ho un calendario editoriale per le prossime 2 settimane',
      'So quanto tempo dedicare alla creazione contenuti',
      'Ho un sistema per batch creation',
      'Conosco il rapporto 80/20 valore/promozione',
    ],
    erroriComuni: [
      'Pubblicare a singhiozzo senza costanza',
      'Creare contenuto last-minute ogni giorno',
      'Promuovere in ogni post',
      'Arrendersi dopo 2 settimane senza risultati',
    ],
    risorse: [
      { titolo: 'Link Generator con UTM', tipo: 'link', url: '/affiliate/resources' },
    ],
  },
  {
    fase: 5,
    titolo: 'Diventare Esperto Percepito',
    sottotitolo: 'Posizionati come riferimento',
    durata: '1 ora + pratica continua',
    icona: '🏆',
    descrizione: 'Posizionarsi come riferimento nel proprio settore usando il Principio Validante: mostrare che capisci le sfide del pubblico senza giudicare.',
    perche: 'Le persone comprano da chi percepiscono come esperto. Non devi essere IL più esperto al mondo, ma devi essere percepito come esperto dalla tua nicchia.',
    contenuto: `## Cosa significa "Esperto Percepito"

Non devi avere un PhD o 30 anni di esperienza. Devi solo essere **un passo avanti** rispetto a chi ti segue.

### La formula dell'autorità

**Autorità = Competenza + Visibilità + Fiducia**

- **Competenza:** Sai qualcosa di utile
- **Visibilità:** Le persone ti vedono regolarmente
- **Fiducia:** Dimostri che hai a cuore il loro interesse

## Come costruire autorità

### 1. Condividi il tuo percorso
Non devi fingere di avere tutte le risposte. Racconta cosa stai imparando, i tuoi errori, le tue scoperte.

"Sto usando questo metodo e ho notato che..."
"Ho fatto questo errore, ecco cosa ho imparato..."

### 2. Cura i dettagli
- Profili social completi e professionali
- Bio che comunica chi aiuti e come
- Foto professionale (non perfetta, autentica)
- Consistenza visiva nei post

### 3. Engagement di qualità
- Rispondi a TUTTI i commenti
- Commenta in modo sostanzioso sui post altrui
- Fai domande genuine
- Non sparire dopo aver postato

### 4. Social proof
- Condividi testimonianze (anche piccole)
- Mostra numeri quando li hai
- Cita le tue fonti (Vitaeology, libri, esperti)

## Il Principio Validante nell'autorità

Essere esperto NON significa:
- Giudicare chi non sa
- Farti superiore agli altri
- Dare lezioni dall'alto

Essere esperto SIGNIFICA:
- Capire le sfide degli altri
- Offrire prospettive utili
- Accompagnare senza giudicare`,
    esercizi: [
      {
        titolo: 'Audit dei tuoi profili',
        descrizione: 'Rivedi tutti i tuoi profili social: bio, foto, link, contenuti recenti. Cosa comunichi?',
        deliverable: 'Lista di 5+ miglioramenti da fare ai tuoi profili',
      },
      {
        titolo: 'Raccogli social proof',
        descrizione: 'Cerca feedback, commenti, messaggi positivi che hai ricevuto. Salvali per uso futuro.',
        deliverable: 'Documento con almeno 3 testimonianze/feedback',
      },
    ],
    checklist: [
      'I miei profili social sono completi e coerenti',
      'La mia bio comunica chi aiuto e come',
      'Ho almeno 3 testimonianze salvate',
      'Rispondo a tutti i commenti sui miei post',
    ],
    erroriComuni: [
      'Fingere di sapere più di quanto sai',
      'Profili incompleti o incoerenti',
      'Sparire dopo aver postato (zero engagement)',
      'Giudicare chi fa domande "stupide"',
    ],
    risorse: [],
  },
  {
    fase: 6,
    titolo: 'Promuovere con Costanza',
    sottotitolo: 'Integra, non interrompi',
    durata: '30 minuti + pratica continua',
    icona: '🚀',
    descrizione: 'Integrare la promozione di Vitaeology nel tuo content marketing. Non un post isolato, ma una presenza costante e naturale.',
    perche: 'Una promozione isolata converte poco. Una promozione integrata in un flusso di valore converte molto. La costanza vince sempre.',
    contenuto: `## Promozione Integrata vs Interruttiva

### Promozione interruttiva (da evitare)
- Post random "Compra questo corso!"
- Spam nei gruppi
- DM non richiesti
- Promozione senza contesto

### Promozione integrata (da fare)
- Menzione naturale in contenuti di valore
- Storia personale che include Vitaeology
- Risposta a domande con link utile
- CTA soft dopo aver dato valore

## Il sistema di promozione

### Livello 1: Promozione passiva
- Link in bio
- Menzione nel profilo
- Firma email

### Livello 2: Promozione attiva soft
- "A proposito, c'è questa challenge gratuita..."
- "Se ti interessa approfondire..."
- "Un percorso che mi ha aiutato..."

### Livello 3: Promozione attiva diretta
- Post dedicato alla Challenge
- Email alla tua lista
- Webinar/Live su leadership + menzione

## Calendario promozione

Su 10 post:
- 8 post di puro valore
- 1 post promozione soft
- 1 post promozione diretta

Su 4 email:
- 3 email di valore
- 1 email promozione

## Tracciare i risultati

Usa i link UTM (disponibili in /affiliate/resources) per capire:
- Da dove arrivano i click
- Quali messaggi funzionano meglio
- Quale piattaforma converte di più

Controlla le statistiche settimanalmente nella Dashboard.`,
    esercizi: [
      {
        titolo: 'Pianifica 1 mese di promozioni',
        descrizione: 'Usando il rapporto 80/20, pianifica quali post saranno promozionali nel prossimo mese.',
        deliverable: 'Calendario con promozioni pianificate (soft e dirette)',
      },
      {
        titolo: 'Setup tracking completo',
        descrizione: 'Crea i tuoi link UTM per ogni piattaforma dove promuovi.',
        deliverable: 'Documento con tutti i tuoi link tracciati',
      },
    ],
    checklist: [
      'Ho link in bio e firma email',
      'So la differenza tra promozione soft e diretta',
      'Ho un calendario promozioni per il prossimo mese',
      'Uso link UTM per tracciare i risultati',
    ],
    erroriComuni: [
      'Promuovere solo quando "ti ricordi"',
      'Non tracciare da dove arrivano le conversioni',
      'Essere troppo aggressivi nella promozione',
      'Non promuovere mai per paura di "disturbare"',
    ],
    risorse: [
      { titolo: 'Dashboard Statistiche', tipo: 'link', url: '/affiliate/dashboard' },
      { titolo: 'Link Generator UTM', tipo: 'link', url: '/affiliate/resources' },
      { titolo: 'Leaderboard Affiliati', tipo: 'link', url: '/affiliate/leaderboard' },
    ],
  },
];

// Helper functions
export function getPhaseById(fase: number): TrainingPhase | undefined {
  return TRAINING_PHASES.find(p => p.fase === fase);
}

export function getTotalDuration(): string {
  return '5+ ore di formazione';
}

export function getTotalExercises(): number {
  return TRAINING_PHASES.reduce((sum, phase) => sum + phase.esercizi.length, 0);
}

export function getTotalChecklist(): number {
  return TRAINING_PHASES.reduce((sum, phase) => sum + phase.checklist.length, 0);
}
