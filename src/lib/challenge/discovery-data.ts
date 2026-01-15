// Dati Discovery per le 3 Challenge - 7 giorni ciascuna
// AGGIORNATO con mapping dimensioni e scoring per mini-profilo
// Data: 10 Gennaio 2026

// =============================================================================
// TYPES
// =============================================================================

export type ChallengeType = 'leadership' | 'ostacoli' | 'microfelicita';
export type DayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Tipi dimensione per ogni challenge
export type LeadershipDimension = 'visione' | 'azione' | 'relazioni' | 'adattamento';
export type OstacoliDimension = 'pattern' | 'segnali' | 'risorse';
export type MicrofelicitaDimension = 'rileva' | 'accogli' | 'distingui' | 'amplifica' | 'resta';

// Union type per tutte le dimensioni
export type DiscoveryDimension = LeadershipDimension | OstacoliDimension | MicrofelicitaDimension;

// Interface per le domande con scoring opzionale (retrocompatibilità)
export interface DiscoveryQuestion {
  text: string;
  options: { value: 'A' | 'B' | 'C'; text: string }[];
  scoring?: {
    dimension: DiscoveryDimension;
    scores: { A: number; B: number; C: number };
  };
}

export interface DiscoveryData {
  title: string;
  intro: string;
  questions: DiscoveryQuestion[];
  ctaText: string;
}

// =============================================================================
// SCORING CONSTANTS
// =============================================================================

// Score standard per tutte le domande: A=2, B=1, C=0
const STANDARD_SCORES = { A: 2, B: 1, C: 0 };

// =============================================================================
// DISCOVERY DATA
// =============================================================================

export const DISCOVERY_DATA: Record<ChallengeType, Record<DayNumber, DiscoveryData>> = {
  // =====================================================
  // LEADERSHIP AUTENTICA - 7 giorni
  // Dimensioni: Visione, Azione, Relazioni, Adattamento
  // =====================================================
  leadership: {
    1: {
      title: "Prima di Passare al Giorno 2",
      intro: "Rifletti su quello che hai scoperto oggi su \"Quello che Già Fai Senza Accorgertene\".",
      questions: [
        {
          text: "Ripensando all'esercizio di oggi, quanto chiaramente riesci a *vedere* i momenti in cui altri si rivolgono a te?",
          options: [
            { value: 'A', text: "Li vedo con chiarezza — ne ho identificati diversi che prima non notavo" },
            { value: 'B', text: "Ne intravedo alcuni, ma non sono ancora nitidi" },
            { value: 'C', text: "Faccio fatica a vederli, il quadro è ancora confuso" }
          ],
          scoring: { dimension: 'visione', scores: STANDARD_SCORES }
        },
        {
          text: "Quando qualcuno ti chiede un consiglio o un'opinione, come vivi quella connessione?",
          options: [
            { value: 'A', text: "Mi sento a mio agio — è naturale per me essere quel punto di riferimento" },
            { value: 'B', text: "A volte lo accolgo bene, altre volte mi sento inadeguato" },
            { value: 'C', text: "Tendo a sminuire il momento o a sentirmi in imbarazzo" }
          ],
          scoring: { dimension: 'relazioni', scores: STANDARD_SCORES }
        },
        {
          text: "Hai completato l'esercizio \"Trova le Prove\" (cercare 3 momenti)?",
          options: [
            { value: 'A', text: "Sì, l'ho completato e ho scritto i momenti" },
            { value: 'B', text: "L'ho fatto parzialmente o solo mentalmente" },
            { value: 'C', text: "Non ancora, lo farò dopo" }
          ],
          scoring: { dimension: 'azione', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 2 →"
    },
    2: {
      title: "Prima di Passare al Giorno 3",
      intro: "Rifletti sulla \"Voce che Sminuisce\" che hai esplorato oggi.",
      questions: [
        {
          text: "Quanto facilmente riconosci il *pattern* della voce che sminuisce (\"Non conta\", \"È stato fortuna\")?",
          options: [
            { value: 'A', text: "Lo riconosco bene — noto quando si attiva" },
            { value: 'B', text: "A volte lo noto, altre mi ci perdo dentro" },
            { value: 'C', text: "Non sono sicuro di riconoscerlo ancora" }
          ],
          scoring: { dimension: 'adattamento', scores: STANDARD_SCORES }
        },
        {
          text: "L'esercizio del \"doppio standard\" (come giudichi gli altri vs te stesso) ti ha dato chiarezza?",
          options: [
            { value: 'A', text: "Sì, vedo chiaramente che uso due pesi e due misure" },
            { value: 'B', text: "In parte, ma non è ancora cristallino" },
            { value: 'C', text: "Non mi è chiaro, devo rifletterci ancora" }
          ],
          scoring: { dimension: 'visione', scores: STANDARD_SCORES }
        },
        {
          text: "Quando ricevi un complimento o riconoscimento da qualcuno, come rispondi?",
          options: [
            { value: 'A', text: "Lo accolgo con gratitudine, mantenendo la connessione" },
            { value: 'B', text: "Tendo a minimizzare, ma poi ci ripenso" },
            { value: 'C', text: "Lo rifiuto o cambio subito argomento" }
          ],
          scoring: { dimension: 'relazioni', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 3 →"
    },
    3: {
      title: "Prima di Passare al Giorno 4",
      intro: "Rifletti sulla Lucidità: \"Vedere le Cose Come Sono\".",
      questions: [
        {
          text: "C'è qualcosa nella tua vita professionale che stai evitando di guardare?",
          options: [
            { value: 'A', text: "Sì, e oggi ho iniziato a guardarla in faccia" },
            { value: 'B', text: "Forse, ma non ho ancora messo a fuoco cosa sia" },
            { value: 'C', text: "Credo di vedere già tutto chiaramente" }
          ],
          scoring: { dimension: 'visione', scores: STANDARD_SCORES }
        },
        {
          text: "L'analogia del \"parabrezza sporco\" ti aiuta a capire come funziona la lucidità?",
          options: [
            { value: 'A', text: "Sì, capisco che a volte vedo la realtà distorta" },
            { value: 'B', text: "Ha senso, ma non sono sicuro di come applicarla" },
            { value: 'C', text: "Non mi ci ritrovo — penso di vedere già bene" }
          ],
          scoring: { dimension: 'visione', scores: STANDARD_SCORES }
        },
        {
          text: "Hai fatto l'esercizio \"Accendi la Luce su Qualcosa\"?",
          options: [
            { value: 'A', text: "Sì, ho scritto cosa sto evitando e cosa temo di scoprire" },
            { value: 'B', text: "L'ho iniziato ma non l'ho completato" },
            { value: 'C', text: "Non ancora, ci penserò stasera" }
          ],
          scoring: { dimension: 'azione', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 4 →"
    },
    4: {
      title: "Prima di Passare al Giorno 5",
      intro: "Rifletti sul Coraggio: \"Agire Anche con la Paura\".",
      questions: [
        {
          text: "Hai identificato il \"passo più piccolo\" che richiede un po' di coraggio?",
          options: [
            { value: 'A', text: "Sì, e l'ho già fatto oggi" },
            { value: 'B', text: "Sì, ma non l'ho ancora fatto" },
            { value: 'C', text: "Non sono sicuro di quale sia" }
          ],
          scoring: { dimension: 'azione', scores: STANDARD_SCORES }
        },
        {
          text: "Quando devi fare qualcosa che ti spaventa un po', come ti comporti di solito?",
          options: [
            { value: 'A', text: "Agisco anche con la paura — non aspetto che passi" },
            { value: 'B', text: "A volte rimando, ma poi mi faccio forza" },
            { value: 'C', text: "Tendo ad aspettare di sentirmi pronto prima di agire" }
          ],
          scoring: { dimension: 'azione', scores: STANDARD_SCORES }
        },
        {
          text: "Come è cambiata la tua comprensione del coraggio dopo il contenuto di oggi?",
          options: [
            { value: 'A', text: "Capisco che il coraggio non è assenza di paura" },
            { value: 'B', text: "Interessante, ma devo ancora metabolizzarlo" },
            { value: 'C', text: "Non sono sicuro che si applichi alla mia situazione" }
          ],
          scoring: { dimension: 'adattamento', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 5 →"
    },
    5: {
      title: "Prima di Passare al Giorno 6",
      intro: "Rifletti sull'Equilibrio: \"Non Esaurirti\".",
      questions: [
        {
          text: "Nella tua mappa energetica, le persone che ti circondano come influenzano la tua energia?",
          options: [
            { value: 'A', text: "Ho chiaro chi mi ricarica e chi mi scarica" },
            { value: 'B', text: "Ho un'idea generale, ma non ho mai analizzato bene" },
            { value: 'C', text: "Non ci ho mai pensato in questi termini" }
          ],
          scoring: { dimension: 'relazioni', scores: STANDARD_SCORES }
        },
        {
          text: "Riesci a riconoscere i segnali di \"batteria scarica\" prima di esaurirti?",
          options: [
            { value: 'A', text: "Sì, noto i segnali e mi adatto di conseguenza" },
            { value: 'B', text: "A volte li noto, ma tendo a ignorarli" },
            { value: 'C', text: "Di solito me ne accorgo solo quando sono già esaurito" }
          ],
          scoring: { dimension: 'adattamento', scores: STANDARD_SCORES }
        },
        {
          text: "Hai scelto UNA azione concreta per riequilibrare la tua energia questa settimana?",
          options: [
            { value: 'A', text: "Sì, e so esattamente cosa farò" },
            { value: 'B', text: "Ho alcune idee, ma non ho ancora deciso" },
            { value: 'C', text: "Non ancora, ci devo pensare" }
          ],
          scoring: { dimension: 'azione', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 6 →"
    },
    6: {
      title: "Prima di Passare al Giorno 7",
      intro: "Rifletti su \"Il Tuo Modo Personale\" di essere leader.",
      questions: [
        {
          text: "Riesci a riconoscere il tuo stile naturale tra i 5 tipi (Lucido, Deciso, Connettivo, Creativo, Stabile)?",
          options: [
            { value: 'A', text: "Sì, mi riconosco in uno stile predominante" },
            { value: 'B', text: "Vedo un mix, ma non ho ancora identificato quello dominante" },
            { value: 'C', text: "Non sono sicuro, devo rifletterci ancora" }
          ],
          scoring: { dimension: 'adattamento', scores: STANDARD_SCORES }
        },
        {
          text: "Guardando gli esercizi dei giorni scorsi, quale pattern emerge nel tuo modo di operare?",
          options: [
            { value: 'A', text: "Vedo un filo conduttore chiaro nel mio modo di essere" },
            { value: 'B', text: "Intravedo qualcosa, ma non è ancora definito" },
            { value: 'C', text: "Non riesco a vedere uno schema preciso" }
          ],
          scoring: { dimension: 'adattamento', scores: STANDARD_SCORES }
        },
        {
          text: "Quanto chiaramente vedi che il TUO modo di essere leader è valido quanto gli altri?",
          options: [
            { value: 'A', text: "Lo vedo chiaramente — non devo copiare nessuno" },
            { value: 'B', text: "Ci sto arrivando, ma a volte mi confronto ancora" },
            { value: 'C', text: "Faccio fatica ad accettarlo, tendo a imitare altri" }
          ],
          scoring: { dimension: 'visione', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 7 →"
    },
    7: {
      title: "Completa la Challenge",
      intro: "Rifletti su \"Da Qui in Avanti\" e su tutta la settimana.",
      questions: [
        {
          text: "Qual è la scoperta più importante che hai fatto questa settimana?",
          options: [
            { value: 'A', text: "Che sono già punto di riferimento per altri — le prove ci sono" },
            { value: 'B', text: "Che ho capacità che non notavo, ma devo ancora integrarle" },
            { value: 'C', text: "Non ho fatto scoperte decisive, ma ho spunti interessanti" }
          ],
          scoring: { dimension: 'visione', scores: STANDARD_SCORES }
        },
        {
          text: "Hai chiesto feedback a qualcuno su quale sia il tuo punto di forza?",
          options: [
            { value: 'A', text: "Sì, e la loro risposta mi ha aiutato" },
            { value: 'B', text: "Non ancora, ma lo farò" },
            { value: 'C', text: "Preferisco non chiedere — mi sentirei a disagio" }
          ],
          scoring: { dimension: 'relazioni', scores: STANDARD_SCORES }
        },
        {
          text: "Hai definito il tuo piano per continuare (3 obiettivi + primo passo)?",
          options: [
            { value: 'A', text: "Sì, ho scritto tutto e so da dove iniziare" },
            { value: 'B', text: "Ho delle idee, ma non le ho ancora formalizzate" },
            { value: 'C', text: "Non ancora, ma so che voglio continuare" }
          ],
          scoring: { dimension: 'azione', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "COMPLETA LA CHALLENGE →"
    }
  },

  // =====================================================
  // OLTRE GLI OSTACOLI - 7 giorni
  // Dimensioni: Pattern, Segnali, Risorse
  // =====================================================
  ostacoli: {
    1: {
      title: "Prima di Passare al Giorno 2",
      intro: "Rifletti su \"Hai Già Risolto Cose Difficili\".",
      questions: [
        {
          text: "Ripensando ai problemi che hai risolto, riesci a vedere uno *schema comune* in come li hai affrontati?",
          options: [
            { value: 'A', text: "Sì, noto un pattern: tendo a risolvere in un certo modo" },
            { value: 'B', text: "Intravedo qualcosa, ma non è ancora chiaro" },
            { value: 'C', text: "Ogni situazione mi sembra diversa, non vedo uno schema" }
          ],
          scoring: { dimension: 'pattern', scores: STANDARD_SCORES }
        },
        {
          text: "Nelle situazioni difficili che hai risolto, quanto hai usato la capacità di \"leggere\" cosa stava succedendo davvero?",
          options: [
            { value: 'A', text: "Molto — ho capito cose che non erano dette esplicitamente" },
            { value: 'B', text: "In parte — a volte ho colto segnali, altre no" },
            { value: 'C', text: "Poco — mi sono concentrato sui fatti espliciti" }
          ],
          scoring: { dimension: 'segnali', scores: STANDARD_SCORES }
        },
        {
          text: "Quando hai risolto quei problemi, hai usato risorse che inizialmente non pensavi di avere?",
          options: [
            { value: 'A', text: "Sì, ho scoperto di avere più carte in mano di quanto pensassi" },
            { value: 'B', text: "Qualcosa sì, ma principalmente ho usato risorse ovvie" },
            { value: 'C', text: "Ho usato solo quello che avevo già chiaro" }
          ],
          scoring: { dimension: 'risorse', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 2 →"
    },
    2: {
      title: "Prima di Passare al Giorno 3",
      intro: "Rifletti su \"Vedere gli Schemi\".",
      questions: [
        {
          text: "Hai identificato uno schema ripetuto nel problema che hai analizzato oggi?",
          options: [
            { value: 'A', text: "Sì, vedo un pattern che non avevo notato prima" },
            { value: 'B', text: "Ho un'idea, ma non è ancora nitida" },
            { value: 'C', text: "Non riesco a vedere uno schema, sembra tutto casuale" }
          ],
          scoring: { dimension: 'pattern', scores: STANDARD_SCORES }
        },
        {
          text: "L'analogia del rubinetto che perde (sintomo vs causa) ti aiuta a capire la differenza?",
          options: [
            { value: 'A', text: "Sì, capisco la differenza tra risolvere sintomi e cause" },
            { value: 'B', text: "Ha senso, ma devo applicarla meglio ai miei problemi" },
            { value: 'C', text: "Non mi è chiaro come tradurla nella mia situazione" }
          ],
          scoring: { dimension: 'pattern', scores: STANDARD_SCORES }
        },
        {
          text: "La domanda \"Quale schema si ripete?\" ti sembra utile per analizzare i problemi?",
          options: [
            { value: 'A', text: "Molto utile — mi aiuta a cercare la struttura" },
            { value: 'B', text: "Potenzialmente utile, devo esercitarmi" },
            { value: 'C', text: "Non sono sicuro di come usarla concretamente" }
          ],
          scoring: { dimension: 'pattern', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 3 →"
    },
    3: {
      title: "Prima di Passare al Giorno 4",
      intro: "Rifletti su \"Leggere Tra le Righe\".",
      questions: [
        {
          text: "Hai scelto una relazione professionale e decodificato i segnali non detti?",
          options: [
            { value: 'A', text: "Sì, ho formulato un'ipotesi su cosa viene comunicato senza parole" },
            { value: 'B', text: "Ho iniziato, ma non sono sicuro dell'interpretazione" },
            { value: 'C', text: "Non ancora, ci devo lavorare" }
          ],
          scoring: { dimension: 'segnali', scores: STANDARD_SCORES }
        },
        {
          text: "Nella tua esperienza, quanto spesso le parole riflettono il messaggio reale?",
          options: [
            { value: 'A', text: "Spesso c'è di più — sono abituato a leggere oltre le parole" },
            { value: 'B', text: "A volte colgo i segnali, altre mi sfuggono" },
            { value: 'C', text: "Tendo a prendere le parole per quello che sono" }
          ],
          scoring: { dimension: 'segnali', scores: STANDARD_SCORES }
        },
        {
          text: "Quali segnali ti è più facile leggere?",
          options: [
            { value: 'A', text: "Diversi: tono, tempi di risposta, argomenti evitati, linguaggio del corpo" },
            { value: 'B', text: "Alcuni sì (es. tono), altri mi sfuggono" },
            { value: 'C', text: "Non sono sicuro, devo prestare più attenzione" }
          ],
          scoring: { dimension: 'segnali', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 4 →"
    },
    4: {
      title: "Prima di Passare al Giorno 5",
      intro: "Rifletti su \"Trovare Risorse Nascoste\".",
      questions: [
        {
          text: "Hai fatto l'inventario completo delle tue risorse nelle 6 categorie?",
          options: [
            { value: 'A', text: "Sì, ho trovato risorse che non avevo considerato" },
            { value: 'B', text: "L'ho iniziato, ci sono categorie da esplorare" },
            { value: 'C', text: "Non ancora, lo farò dopo" }
          ],
          scoring: { dimension: 'risorse', scores: STANDARD_SCORES }
        },
        {
          text: "L'analogia del \"frigo che sembra vuoto\" ti aiuta a capire il concetto?",
          options: [
            { value: 'A', text: "Sì, capisco che devo guardare meglio prima di dire \"non ho risorse\"" },
            { value: 'B', text: "Ha senso, ma le mie risorse sembrano davvero scarse" },
            { value: 'C', text: "Non mi ci ritrovo — il mio frigo è davvero vuoto" }
          ],
          scoring: { dimension: 'risorse', scores: STANDARD_SCORES }
        },
        {
          text: "Quale categoria di risorse ti ha sorpreso di più?",
          options: [
            { value: 'A', text: "Ho scoperto risorse in categorie che non consideravo (persone, errori passati, competenze trasferibili)" },
            { value: 'B', text: "Qualche sorpresa, ma principalmente ho confermato ciò che sapevo" },
            { value: 'C', text: "Nessuna vera sorpresa, avevo già chiaro cosa ho" }
          ],
          scoring: { dimension: 'risorse', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 5 →"
    },
    5: {
      title: "Prima di Passare al Giorno 6",
      intro: "Rifletti su \"Il Metodo 5 Minuti\".",
      questions: [
        {
          text: "Nel metodo dei 5 minuti, sei riuscito a identificare lo schema del problema?",
          options: [
            { value: 'A', text: "Sì, lo schema è emerso chiaramente" },
            { value: 'B', text: "Ho un'idea parziale, non ancora nitida" },
            { value: 'C', text: "Non sono riuscito a vedere uno schema" }
          ],
          scoring: { dimension: 'pattern', scores: STANDARD_SCORES }
        },
        {
          text: "Sei riuscito a identificare segnali o bisogni nascosti nel problema?",
          options: [
            { value: 'A', text: "Sì, ho capito cosa non veniva detto" },
            { value: 'B', text: "Parzialmente, ma non sono certo" },
            { value: 'C', text: "Non ho identificato segnali particolari" }
          ],
          scoring: { dimension: 'segnali', scores: STANDARD_SCORES }
        },
        {
          text: "Hai definito UNA azione concreta da fare entro 24 ore?",
          options: [
            { value: 'A', text: "Sì, e l'ho già fatta (o la farò oggi)" },
            { value: 'B', text: "Sì, la farò domani" },
            { value: 'C', text: "Non ancora, devo pensarci" }
          ],
          scoring: { dimension: 'risorse', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 6 →"
    },
    6: {
      title: "Prima di Passare al Giorno 7",
      intro: "Rifletti sui \"3 Traditori Silenziosi\".",
      questions: [
        {
          text: "Riesci a riconoscere il *pattern* del traditore che ti blocca più spesso?",
          options: [
            { value: 'A', text: "Sì, vedo chiaramente quale schema si ripete" },
            { value: 'B', text: "A volte lo noto, altre mi ci perdo dentro" },
            { value: 'C', text: "Non riesco a identificare un pattern chiaro" }
          ],
          scoring: { dimension: 'pattern', scores: STANDARD_SCORES }
        },
        {
          text: "Riesci a \"sentire\" quando un traditore sta parlando dentro di te?",
          options: [
            { value: 'A', text: "Sì, riconosco i segnali: il tono della voce interna, le frasi tipiche" },
            { value: 'B', text: "A volte sì, ma spesso me ne accorgo dopo" },
            { value: 'C', text: "Faccio fatica a distinguerlo dai pensieri razionali" }
          ],
          scoring: { dimension: 'segnali', scores: STANDARD_SCORES }
        },
        {
          text: "Hai già fatto l'azione che avevi rimandato (dal Giorno 5)?",
          options: [
            { value: 'A', text: "Sì, l'ho completata" },
            { value: 'B', text: "Non ancora, ma ora so cosa mi blocca" },
            { value: 'C', text: "No, e non sono sicuro che il problema sia il traditore" }
          ],
          scoring: { dimension: 'risorse', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 7 →"
    },
    7: {
      title: "Completa la Challenge",
      intro: "Rifletti su \"Da Qui in Avanti\" e su tutta la settimana.",
      questions: [
        {
          text: "Qual è lo strumento più utile che hai acquisito per vedere schemi?",
          options: [
            { value: 'A', text: "La domanda \"Quale schema si ripete?\" — ora la uso naturalmente" },
            { value: 'B', text: "Ho capito il concetto, ma devo esercitarmi di più" },
            { value: 'C', text: "Non sono sicuro di aver acquisito questo strumento" }
          ],
          scoring: { dimension: 'pattern', scores: STANDARD_SCORES }
        },
        {
          text: "Come è cambiata la tua capacità di leggere segnali non detti?",
          options: [
            { value: 'A', text: "Sono più attento — noto cose che prima mi sfuggivano" },
            { value: 'B', text: "Qualcosa è cambiato, ma devo consolidare" },
            { value: 'C', text: "Non ho notato grandi cambiamenti" }
          ],
          scoring: { dimension: 'segnali', scores: STANDARD_SCORES }
        },
        {
          text: "Hai definito il prossimo problema su cui userai il metodo?",
          options: [
            { value: 'A', text: "Sì, so già quale sarà e quando lo affronterò" },
            { value: 'B', text: "Ho alcune idee, devo sceglierne una" },
            { value: 'C', text: "Non ancora, ma voglio continuare a usare il metodo" }
          ],
          scoring: { dimension: 'risorse', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "COMPLETA LA CHALLENGE →"
    }
  },

  // =====================================================
  // MICROFELICITÀ - 7 giorni
  // Dimensioni: Rileva, Accogli, Distingui, Amplifica, Resta
  // =====================================================
  microfelicita: {
    1: {
      title: "Prima di Passare al Giorno 2",
      intro: "Rifletti su \"Quello che Ti Perdi Ogni Giorno\".",
      questions: [
        {
          text: "Ripensando a oggi, quanti momenti piacevoli (anche piccoli) riesci a ricordare?",
          options: [
            { value: 'A', text: "Ne trovo 3 o più — più di quanto pensassi" },
            { value: 'B', text: "Ne trovo 1-2, con qualche sforzo" },
            { value: 'C', text: "Faccio fatica a trovarne — il radar non è ancora calibrato" }
          ],
          scoring: { dimension: 'rileva', scores: STANDARD_SCORES }
        },
        {
          text: "L'analogia del telefono che ti impedisce di vedere ti è stata utile?",
          options: [
            { value: 'A', text: "Sì, capisco perché i momenti positivi mi sfuggono" },
            { value: 'B', text: "Ha senso, ma non sono sicuro di essere così distratto" },
            { value: 'C', text: "Non mi ci ritrovo, credo di notare già abbastanza" }
          ],
          scoring: { dimension: 'rileva', scores: STANDARD_SCORES }
        },
        {
          text: "Quando trovi un momento piacevole, riesci ad accoglierlo senza sminuirlo?",
          options: [
            { value: 'A', text: "Sì, lo lascio arrivare senza dire \"non conta\"" },
            { value: 'B', text: "A volte sì, altre tendo a minimizzarlo" },
            { value: 'C', text: "Tendo a pensare che siano cose troppo piccole per contare" }
          ],
          scoring: { dimension: 'accogli', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 2 →"
    },
    2: {
      title: "Prima di Passare al Giorno 3",
      intro: "Rifletti su \"La Matematica dei Momenti\".",
      questions: [
        {
          text: "L'idea che 50 momenti piccoli battono 4 momenti grandi ti ha colpito?",
          options: [
            { value: 'A', text: "Sì, cambia come vedo il benessere quotidiano" },
            { value: 'B', text: "Interessante, ma devo ancora metabolizzarla" },
            { value: 'C', text: "Non sono convinto — i momenti grandi contano di più" }
          ],
          scoring: { dimension: 'distingui', scores: STANDARD_SCORES }
        },
        {
          text: "Quando noti qualcosa di piacevole, riesci a mantenerci l'attenzione per qualche secondo?",
          options: [
            { value: 'A', text: "Sì, riesco a restare con la sensazione" },
            { value: 'B', text: "A volte, ma il pensiero scappa velocemente" },
            { value: 'C', text: "Passo subito al prossimo pensiero" }
          ],
          scoring: { dimension: 'amplifica', scores: STANDARD_SCORES }
        },
        {
          text: "Sei riuscito a intercettare momenti piacevoli *mentre succedevano* (non a memoria)?",
          options: [
            { value: 'A', text: "Sì, ho detto \"Questo. Proprio questo.\" almeno 3 volte" },
            { value: 'B', text: "1-2 volte, è più difficile che ricordare a sera" },
            { value: 'C', text: "Non ci sono riuscito, me ne sono ricordato solo dopo" }
          ],
          scoring: { dimension: 'rileva', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 3 →"
    },
    3: {
      title: "Prima di Passare al Giorno 4",
      intro: "Rifletti su R.A.D.A.R. (Rileva-Accogli-Distingui-Amplifica-Resta).",
      questions: [
        {
          text: "Hai applicato R.A.D.A.R. alle 3 occasioni suggerite (caffè, silenzio, una a scelta)?",
          options: [
            { value: 'A', text: "Sì, tutte e 3" },
            { value: 'B', text: "1-2 occasioni, non tutte" },
            { value: 'C', text: "Non ancora, ma ho capito il metodo" }
          ],
          scoring: { dimension: 'rileva', scores: STANDARD_SCORES }
        },
        {
          text: "Quale passo ti viene più naturale?",
          options: [
            { value: 'A', text: "Accogliere: lascio che la sensazione arrivi senza giudicarla" },
            { value: 'B', text: "Ho un passo che funziona, altri meno" },
            { value: 'C', text: "Nessun passo mi viene naturale, devo esercitarmi su tutti" }
          ],
          scoring: { dimension: 'accogli', scores: STANDARD_SCORES }
        },
        {
          text: "L'analogia della stella cadente ti ha aiutato a capire l'urgenza di catturare il momento?",
          options: [
            { value: 'A', text: "Sì, capisco che devo accoglierlo subito" },
            { value: 'B', text: "In parte, ma a volte me ne accorgo troppo tardi" },
            { value: 'C', text: "Non mi ci ritrovo, i miei momenti durano di più" }
          ],
          scoring: { dimension: 'accogli', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 4 →"
    },
    4: {
      title: "Prima di Passare al Giorno 5",
      intro: "Rifletti sugli \"Errori da Evitare\" con R.A.D.A.R.",
      questions: [
        {
          text: "Quale dei 4 errori riconosci come tuo?",
          options: [
            { value: 'A', text: "Lo identifico chiaramente (cercare/aspettare forte/analizzare/solo momenti speciali)" },
            { value: 'B', text: "Ne vedo più di uno, non sono sicuro quale sia il principale" },
            { value: 'C', text: "Non sono sicuro di fare nessuno di questi errori" }
          ],
          scoring: { dimension: 'distingui', scores: STANDARD_SCORES }
        },
        {
          text: "Dopo aver identificato l'errore, sei riuscito ad amplificare meglio i momenti?",
          options: [
            { value: 'A', text: "Sì, correggendo l'errore riesco a stare di più con la sensazione" },
            { value: 'B', text: "Ci ho provato, non è stato facile" },
            { value: 'C', text: "Non ancora, proverò domani" }
          ],
          scoring: { dimension: 'amplifica', scores: STANDARD_SCORES }
        },
        {
          text: "Hai applicato R.A.D.A.R. durante un'attività ordinaria (lavarsi le mani, camminare)?",
          options: [
            { value: 'A', text: "Sì, e il momento è rimasto con me anche dopo" },
            { value: 'B', text: "Ho provato, ma mi sono dimenticato a metà" },
            { value: 'C', text: "L'ho fatto solo in momenti di pausa" }
          ],
          scoring: { dimension: 'resta', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 5 →"
    },
    5: {
      title: "Prima di Passare al Giorno 6",
      intro: "Rifletti su \"Quando la Giornata È Dura\".",
      questions: [
        {
          text: "Riesci a distinguere tra \"completare il quadro\" e \"negare il negativo\"?",
          options: [
            { value: 'A', text: "Sì, capisco che R.A.D.A.R. aggiunge, non cancella" },
            { value: 'B', text: "In parte, ma quando sto male faccio fatica" },
            { value: 'C', text: "Mi sembra comunque \"pensiero positivo\"" }
          ],
          scoring: { dimension: 'distingui', scores: STANDARD_SCORES }
        },
        {
          text: "Nonostante il negativo, sei riuscito a trovare e amplificare almeno 2 cose positive?",
          options: [
            { value: 'A', text: "Sì, anche se piccole, le ho amplificate" },
            { value: 'B', text: "Con fatica, ne ho trovata solo 1" },
            { value: 'C', text: "No, oggi era troppo difficile" }
          ],
          scoring: { dimension: 'amplifica', scores: STANDARD_SCORES }
        },
        {
          text: "L'analogia del bilancio (entrate + uscite) ti aiuta ad accogliere sia il positivo che il negativo?",
          options: [
            { value: 'A', text: "Sì, capisco che entrambi fanno parte del quadro completo" },
            { value: 'B', text: "Ha senso, ma tendo a concentrarmi solo sulle \"uscite\"" },
            { value: 'C', text: "Non mi convince, il negativo prende sempre il sopravvento" }
          ],
          scoring: { dimension: 'accogli', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 6 →"
    },
    6: {
      title: "Prima di Passare al Giorno 7",
      intro: "Rifletti su \"Come Farlo Diventare Automatico\".",
      questions: [
        {
          text: "Hai scelto il tuo aggancio (\"Quando ___, faccio R.A.D.A.R.\")?",
          options: [
            { value: 'A', text: "Sì, so esattamente quando lo farò ogni giorno" },
            { value: 'B', text: "Ho alcune opzioni, devo sceglierne una" },
            { value: 'C', text: "Non ancora, non so cosa scegliere" }
          ],
          scoring: { dimension: 'resta', scores: STANDARD_SCORES }
        },
        {
          text: "L'analogia delle vitamine vicino al caffè ti ha aiutato a capire il principio dell'aggancio?",
          options: [
            { value: 'A', text: "Sì, capisco che collegare crea automatismo" },
            { value: 'B', text: "In parte, ma tendo a dimenticarmi comunque" },
            { value: 'C', text: "Non mi ci ritrovo, non funziona così per me" }
          ],
          scoring: { dimension: 'resta', scores: STANDARD_SCORES }
        },
        {
          text: "Hai fatto R.A.D.A.R. collegato all'aggancio almeno una volta oggi?",
          options: [
            { value: 'A', text: "Sì, e ho amplificato il momento per qualche secondo" },
            { value: 'B', text: "Ho provato, ma non mi sono ricordato al momento giusto" },
            { value: 'C', text: "Non ancora, inizio domani" }
          ],
          scoring: { dimension: 'amplifica', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 7 →"
    },
    7: {
      title: "Completa la Challenge",
      intro: "Rifletti su \"Da Qui in Avanti\" e su tutta la settimana.",
      questions: [
        {
          text: "Qual è la scoperta più importante di questa settimana sulla tua capacità di rilevare?",
          options: [
            { value: 'A', text: "I momenti piacevoli ci sono, solo non li notavo" },
            { value: 'B', text: "Ho capito il concetto, ma devo ancora allenare il radar" },
            { value: 'C', text: "Non ho fatto scoperte decisive, ma ho spunti interessanti" }
          ],
          scoring: { dimension: 'rileva', scores: STANDARD_SCORES }
        },
        {
          text: "Come è cambiata la tua capacità di distinguere cosa ti nutre da cosa no?",
          options: [
            { value: 'A', text: "Sono più consapevole — distinguo meglio i segnali" },
            { value: 'B', text: "Qualcosa è cambiato, ma devo consolidare" },
            { value: 'C', text: "Non ho notato grandi cambiamenti" }
          ],
          scoring: { dimension: 'distingui', scores: STANDARD_SCORES }
        },
        {
          text: "Hai confermato il tuo aggancio per i prossimi 21 giorni?",
          options: [
            { value: 'A', text: "Sì, so esattamente quando e come farò R.A.D.A.R." },
            { value: 'B', text: "Ho un'idea, devo renderla più concreta" },
            { value: 'C', text: "Non ancora, ma voglio continuare" }
          ],
          scoring: { dimension: 'resta', scores: STANDARD_SCORES }
        }
      ],
      ctaText: "COMPLETA LA CHALLENGE →"
    }
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Helper per ottenere i dati di discovery
export function getDiscoveryData(challengeType: ChallengeType, dayNumber: DayNumber): DiscoveryData | null {
  return DISCOVERY_DATA[challengeType]?.[dayNumber] || null;
}

// Helper per ottenere tutti i giorni di una challenge
export function getChallengeDiscoveryDays(challengeType: ChallengeType): { day: DayNumber; title: string }[] {
  const challenge = DISCOVERY_DATA[challengeType];
  if (!challenge) return [];

  return Object.entries(challenge).map(([day, data]) => ({
    day: parseInt(day) as DayNumber,
    title: data.title
  }));
}

// =============================================================================
// SCORING FUNCTIONS
// =============================================================================

// Interfaccia per i risultati del profilo Discovery
export interface DiscoveryProfileResult {
  challengeType: ChallengeType;
  totalScore: number;
  maxScore: number;
  percentage: number;
  dimensionScores: Record<string, { score: number; maxScore: number; percentage: number }>;
  completedDays: number;
}

// Calcola il punteggio per una singola risposta
export function calculateQuestionScore(
  challengeType: ChallengeType,
  dayNumber: DayNumber,
  questionIndex: number,
  response: 'A' | 'B' | 'C'
): { score: number; dimension: DiscoveryDimension | null } {
  const dayData = DISCOVERY_DATA[challengeType]?.[dayNumber];
  if (!dayData || !dayData.questions[questionIndex]) {
    return { score: 0, dimension: null };
  }

  const question = dayData.questions[questionIndex];
  if (!question.scoring) {
    return { score: 0, dimension: null };
  }

  return {
    score: question.scoring.scores[response],
    dimension: question.scoring.dimension
  };
}

// Calcola il profilo completo da tutte le risposte
export function calculateDiscoveryProfile(
  challengeType: ChallengeType,
  responses: Record<number, Record<number, 'A' | 'B' | 'C'>> // { dayNumber: { questionIndex: response } }
): DiscoveryProfileResult {
  const dimensionScores: Record<string, { score: number; maxScore: number }> = {};
  let totalScore = 0;
  let maxScore = 0;
  let completedDays = 0;

  // Itera su tutti i giorni e domande
  for (const [dayStr, dayResponses] of Object.entries(responses)) {
    const dayNumber = parseInt(dayStr) as DayNumber;
    const dayData = DISCOVERY_DATA[challengeType]?.[dayNumber];

    if (!dayData) continue;
    completedDays++;

    dayData.questions.forEach((question, questionIndex) => {
      if (!question.scoring) return;

      const response = dayResponses[questionIndex];
      if (!response) return;

      const { score, dimension } = calculateQuestionScore(challengeType, dayNumber, questionIndex, response);

      if (dimension) {
        if (!dimensionScores[dimension]) {
          dimensionScores[dimension] = { score: 0, maxScore: 0 };
        }
        dimensionScores[dimension].score += score;
        dimensionScores[dimension].maxScore += 2; // Max score per question
        totalScore += score;
        maxScore += 2;
      }
    });
  }

  // Calcola le percentuali
  const dimensionResults: Record<string, { score: number; maxScore: number; percentage: number }> = {};
  for (const [dimension, scores] of Object.entries(dimensionScores)) {
    dimensionResults[dimension] = {
      ...scores,
      percentage: scores.maxScore > 0 ? Math.round((scores.score / scores.maxScore) * 100) : 0
    };
  }

  return {
    challengeType,
    totalScore,
    maxScore,
    percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
    dimensionScores: dimensionResults,
    completedDays
  };
}

// Helper per ottenere le dimensioni di una challenge
export function getChallengeDimensions(challengeType: ChallengeType): string[] {
  switch (challengeType) {
    case 'leadership':
      return ['visione', 'azione', 'relazioni', 'adattamento'];
    case 'ostacoli':
      return ['pattern', 'segnali', 'risorse'];
    case 'microfelicita':
      return ['rileva', 'accogli', 'distingui', 'amplifica', 'resta'];
    default:
      return [];
  }
}

// Helper per ottenere i punteggi massimi per dimensione
export function getDimensionMaxScores(challengeType: ChallengeType): Record<string, number> {
  switch (challengeType) {
    case 'leadership':
      return { visione: 12, azione: 12, relazioni: 8, adattamento: 10 };
    case 'ostacoli':
      return { pattern: 14, segnali: 14, risorse: 14 };
    case 'microfelicita':
      return { rileva: 10, accogli: 8, distingui: 8, amplifica: 8, resta: 8 };
    default:
      return {};
  }
}
