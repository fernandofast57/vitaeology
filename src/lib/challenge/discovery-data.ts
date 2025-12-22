// Dati Discovery per le 3 Challenge - 7 giorni ciascuna
// AGGIORNATO per allinearsi con LEAD_MAGNET_CHALLENGE_VITAEOLOGY_v5_PULITO.md

export type ChallengeType = 'leadership' | 'ostacoli' | 'microfelicita';
export type DayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface DiscoveryData {
  title: string;
  intro: string;
  questions: {
    text: string;
    options: { value: 'A' | 'B' | 'C'; text: string }[];
  }[];
  ctaText: string;
}

export const DISCOVERY_DATA: Record<ChallengeType, Record<DayNumber, DiscoveryData>> = {
  // =====================================================
  // LEADERSHIP AUTENTICA - 7 giorni
  // =====================================================
  leadership: {
    1: {
      title: "Prima di Passare al Giorno 2",
      intro: "Rifletti su quello che hai scoperto oggi su \"Quello che Già Fai Senza Accorgertene\".",
      questions: [
        {
          text: "Ripensando alla settimana scorsa, hai trovato momenti in cui qualcuno si è rivolto a te per un consiglio o una decisione?",
          options: [
            { value: 'A', text: "Sì, ne ho trovati alcuni — più di quanto pensassi" },
            { value: 'B', text: "Ne ho trovato uno, forse due" },
            { value: 'C', text: "Non ne ho trovati, ma continuerò a osservare" }
          ]
        },
        {
          text: "L'analogia della strada ti ha fatto vedere qualcosa di nuovo?",
          options: [
            { value: 'A', text: "Sì, ora vedo che sono già \"quello che sa la strada\" in alcuni momenti" },
            { value: 'B', text: "In parte, ci devo riflettere ancora" },
            { value: 'C', text: "Non sono sicuro di cosa significhi per me" }
          ]
        },
        {
          text: "Cosa ti ha colpito di più del contenuto di oggi?",
          options: [
            { value: 'A', text: "L'idea che la leadership sia già presente, solo non notata" },
            { value: 'B', text: "Il confronto con gli occhiali sul naso che non trovi" },
            { value: 'C', text: "L'esercizio pratico: mi ha fatto vedere le cose diversamente" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 2 →"
    },
    2: {
      title: "Prima di Passare al Giorno 3",
      intro: "Rifletti sulla \"Voce che Sminuisce\" che hai esplorato oggi.",
      questions: [
        {
          text: "Hai riconosciuto la voce che dice \"Non conta\", \"È stato fortuna\", \"Chiunque l'avrebbe fatto\"?",
          options: [
            { value: 'A', text: "Sì, la riconosco bene — la sento spesso" },
            { value: 'B', text: "A volte sì, ma non sempre" },
            { value: 'C', text: "Non sono sicuro di averla identificata" }
          ]
        },
        {
          text: "L'immagine del salvadanaio bucato ti è stata utile?",
          options: [
            { value: 'A', text: "Sì, spiega perfettamente perché non ricordo i miei successi" },
            { value: 'B', text: "È un'immagine interessante, ci penserò" },
            { value: 'C', text: "Non mi ci ritrovo completamente" }
          ]
        },
        {
          text: "Hai provato l'esercizio del doppio standard (Marco)?",
          options: [
            { value: 'A', text: "Sì, e ho notato che giudico me stesso più duramente" },
            { value: 'B', text: "L'ho fatto in parte, voglio approfondire" },
            { value: 'C', text: "Non ancora, lo farò domani" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 3 →"
    },
    3: {
      title: "Prima di Passare al Giorno 4",
      intro: "Rifletti sulla Lucidità: \"Vedere le Cose Come Sono\".",
      questions: [
        {
          text: "C'è qualcosa che stai evitando di guardare nella tua vita professionale?",
          options: [
            { value: 'A', text: "Sì, e oggi ho iniziato a guardarla" },
            { value: 'B', text: "Forse, ma non sono sicuro di cosa sia" },
            { value: 'C', text: "No, credo di vedere le cose abbastanza chiaramente" }
          ]
        },
        {
          text: "L'immagine del parabrezza sporco ti ha aiutato a capire la lucidità?",
          options: [
            { value: 'A', text: "Sì, capisco che a volte vedo distorto" },
            { value: 'B', text: "In parte, voglio capire meglio cosa distorce la mia visione" },
            { value: 'C', text: "Non sono sicuro di avere il \"parabrezza sporco\"" }
          ]
        },
        {
          text: "Hai fatto l'esercizio \"Accendi la Luce su Qualcosa\"?",
          options: [
            { value: 'A', text: "Sì, ho scritto cosa sto evitando e cosa temo di scoprire" },
            { value: 'B', text: "L'ho iniziato, ma non l'ho completato" },
            { value: 'C', text: "Non ancora, ci penserò stasera" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 4 →"
    },
    4: {
      title: "Prima di Passare al Giorno 5",
      intro: "Rifletti sul Coraggio: \"Agire Anche con la Paura\".",
      questions: [
        {
          text: "Hai identificato il \"passo più piccolo\" che richiede coraggio?",
          options: [
            { value: 'A', text: "Sì, e l'ho già fatto oggi" },
            { value: 'B', text: "Sì, ma non l'ho ancora fatto" },
            { value: 'C', text: "Non sono sicuro di quale sia" }
          ]
        },
        {
          text: "L'esempio della prima guida da soli ti è stato utile?",
          options: [
            { value: 'A', text: "Sì, capisco che il coraggio non è assenza di paura" },
            { value: 'B', text: "In parte, ci devo riflettere" },
            { value: 'C', text: "Non mi ci ritrovo, le mie paure sono diverse" }
          ]
        },
        {
          text: "Cosa hai scoperto sulla relazione tra paura e azione?",
          options: [
            { value: 'A', text: "La paura diminuisce agendo, non aspettando" },
            { value: 'B', text: "Che il coraggio si allena con piccoli passi" },
            { value: 'C', text: "Sto ancora elaborando cosa significa per me" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 5 →"
    },
    5: {
      title: "Prima di Passare al Giorno 6",
      intro: "Rifletti sull'Equilibrio: \"Non Esaurirti\".",
      questions: [
        {
          text: "Hai mappato cosa ti ricarica e cosa ti scarica?",
          options: [
            { value: 'A', text: "Sì, ho fatto la lista completa" },
            { value: 'B', text: "Ho iniziato, ma voglio approfondire" },
            { value: 'C', text: "Non ancora, lo farò stasera" }
          ]
        },
        {
          text: "L'analogia della batteria del telefono ti ha aiutato?",
          options: [
            { value: 'A', text: "Sì, capisco che devo gestire la mia energia" },
            { value: 'B', text: "In parte, ma tendo a ignorare i segnali di scarica" },
            { value: 'C', text: "Non mi ci ritrovo, non sento di avere problemi di energia" }
          ]
        },
        {
          text: "Hai scelto UNA azione per riequilibrare?",
          options: [
            { value: 'A', text: "Sì, ridurrò qualcosa che mi scarica" },
            { value: 'B', text: "Sì, aumenterò qualcosa che mi ricarica" },
            { value: 'C', text: "Non ancora, ci sto pensando" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 6 →"
    },
    6: {
      title: "Prima di Passare al Giorno 7",
      intro: "Rifletti su \"Il Tuo Modo Personale\" di essere leader.",
      questions: [
        {
          text: "Hai identificato il tuo stile naturale tra i 5 tipi?",
          options: [
            { value: 'A', text: "Sì, mi riconosco principalmente in uno stile" },
            { value: 'B', text: "Ho un mix, ma vedo un pattern dominante" },
            { value: 'C', text: "Non sono sicuro, devo rifletterci ancora" }
          ]
        },
        {
          text: "Guardando i tuoi esercizi dei giorni scorsi, quale modo di operare emerge?",
          options: [
            { value: 'A', text: "Tendo a essere lucido e anticipare i problemi" },
            { value: 'B', text: "Tendo a creare connessione e armonia" },
            { value: 'C', text: "Tendo a decidere e sbloccare situazioni" }
          ]
        },
        {
          text: "L'analogia dei cantanti con stili diversi ti ha aiutato?",
          options: [
            { value: 'A', text: "Sì, capisco che non devo copiare nessuno" },
            { value: 'B', text: "In parte, ma a volte mi confronto con altri" },
            { value: 'C', text: "Ci devo pensare, non ho ancora elaborato" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 7 →"
    },
    7: {
      title: "Completa la Challenge",
      intro: "Rifletti su \"Da Qui in Avanti\" e su tutta la settimana.",
      questions: [
        {
          text: "Qual è la scoperta più importante di questa settimana?",
          options: [
            { value: 'A', text: "Che sono già punto di riferimento per altri" },
            { value: 'B', text: "Che ho una voce interna che sminuisce i miei successi" },
            { value: 'C', text: "Che ho uno stile unico di leadership" }
          ]
        },
        {
          text: "Hai definito il tuo piano per continuare?",
          options: [
            { value: 'A', text: "Sì, ho scritto i 3 obiettivi e il primo passo" },
            { value: 'B', text: "In parte, devo definire meglio i dettagli" },
            { value: 'C', text: "Non ancora, ma so che voglio continuare" }
          ]
        },
        {
          text: "Ti senti più capace di riconoscerti come leader?",
          options: [
            { value: 'A', text: "Sì, vedo le prove che prima non notavo" },
            { value: 'B', text: "Un po' di più, ma c'è ancora lavoro da fare" },
            { value: 'C', text: "Non molto, ma ho strumenti che prima non avevo" }
          ]
        }
      ],
      ctaText: "COMPLETA LA CHALLENGE →"
    }
  },

  // =====================================================
  // OLTRE GLI OSTACOLI - 7 giorni
  // =====================================================
  ostacoli: {
    1: {
      title: "Prima di Passare al Giorno 2",
      intro: "Rifletti su \"Hai Già Risolto Cose Difficili\".",
      questions: [
        {
          text: "Hai trovato 3 situazioni difficili che hai risolto negli ultimi 2-3 anni?",
          options: [
            { value: 'A', text: "Sì, ne ho trovate anche più di 3" },
            { value: 'B', text: "Ne ho trovate 2-3, con qualche sforzo" },
            { value: 'C', text: "Faccio fatica a ricordarle, ma so che ci sono" }
          ]
        },
        {
          text: "L'analogia della bicicletta ti ha aiutato a capire?",
          options: [
            { value: 'A', text: "Sì, capisco che risolvere problemi è una capacità già mia" },
            { value: 'B', text: "In parte, ma a volte mi sento ancora bloccato" },
            { value: 'C', text: "Non sono sicuro che si applichi a me" }
          ]
        },
        {
          text: "Come ti sei sentito nel ricordare i problemi che hai risolto?",
          options: [
            { value: 'A', text: "Sorpreso: sono più capace di quanto pensassi" },
            { value: 'B', text: "Curioso: voglio capire come attivare questa capacità" },
            { value: 'C', text: "Scettico: quelli erano casi diversi" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 2 →"
    },
    2: {
      title: "Prima di Passare al Giorno 3",
      intro: "Rifletti su \"Vedere gli Schemi\".",
      questions: [
        {
          text: "Hai identificato lo schema ripetuto nel problema che hai scelto?",
          options: [
            { value: 'A', text: "Sì, vedo un pattern che non avevo notato" },
            { value: 'B', text: "Ho un'idea, ma non è ancora chiara" },
            { value: 'C', text: "Non riesco a vedere uno schema, sembra tutto casuale" }
          ]
        },
        {
          text: "L'esempio del rubinetto che perde ti ha aiutato?",
          options: [
            { value: 'A', text: "Sì, capisco la differenza tra sintomo e causa" },
            { value: 'B', text: "In parte, devo applicarlo meglio ai miei problemi" },
            { value: 'C', text: "Non mi è chiaro come tradurlo nella mia situazione" }
          ]
        },
        {
          text: "La domanda \"Quale schema si ripete?\" ti sembra utile?",
          options: [
            { value: 'A', text: "Sì, mi aiuta a cercare la struttura del problema" },
            { value: 'B', text: "Potenzialmente, devo esercitarmi di più" },
            { value: 'C', text: "Non sono sicuro di come usarla" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 3 →"
    },
    3: {
      title: "Prima di Passare al Giorno 4",
      intro: "Rifletti su \"Leggere Tra le Righe\".",
      questions: [
        {
          text: "Hai scelto una relazione professionale e decodificato i segnali?",
          options: [
            { value: 'A', text: "Sì, ho formulato un'ipotesi su cosa non viene detto" },
            { value: 'B', text: "Ho iniziato, ma non sono sicuro dell'interpretazione" },
            { value: 'C', text: "Non ancora, ci penserò domani" }
          ]
        },
        {
          text: "Ti è mai capitato di dire \"Va tutto bene\" quando non era vero?",
          options: [
            { value: 'A', text: "Sì, capisco come funziona la comunicazione nascosta" },
            { value: 'B', text: "Sì, ma non ci avevo mai pensato dal lato di chi ascolta" },
            { value: 'C', text: "Non spesso, tendo a essere diretto" }
          ]
        },
        {
          text: "Quali segnali ti sembrano più facili da leggere?",
          options: [
            { value: 'A', text: "Tono delle email e tempi di risposta" },
            { value: 'B', text: "Linguaggio del corpo e argomenti evitati" },
            { value: 'C', text: "Non sono sicuro, devo prestare più attenzione" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 4 →"
    },
    4: {
      title: "Prima di Passare al Giorno 5",
      intro: "Rifletti su \"Trovare Risorse Nascoste\".",
      questions: [
        {
          text: "Hai fatto l'inventario completo delle tue risorse?",
          options: [
            { value: 'A', text: "Sì, ho trovato risorse che non consideravo" },
            { value: 'B', text: "L'ho iniziato, ci sono ancora categorie da esplorare" },
            { value: 'C', text: "Non ancora, lo farò stasera" }
          ]
        },
        {
          text: "L'analogia del frigo che sembra vuoto ti è stata utile?",
          options: [
            { value: 'A', text: "Sì, capisco che devo guardare meglio" },
            { value: 'B', text: "In parte, ma le mie risorse sembrano davvero scarse" },
            { value: 'C', text: "Non mi ci ritrovo, il mio frigo è davvero vuoto" }
          ]
        },
        {
          text: "Quale categoria di risorse ti ha sorpreso di più?",
          options: [
            { value: 'A', text: "Relazioni: persone che potrebbero aiutare" },
            { value: 'B', text: "Errori passati: lezioni già apprese" },
            { value: 'C', text: "Competenze trasferibili: cose che so fare" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 5 →"
    },
    5: {
      title: "Prima di Passare al Giorno 6",
      intro: "Rifletti su \"Il Metodo 5 Minuti\".",
      questions: [
        {
          text: "Hai applicato il metodo completo (Schema → Segnali → Risorse → Azione)?",
          options: [
            { value: 'A', text: "Sì, in 5 minuti come indicato" },
            { value: 'B', text: "Sì, ma ci ho messo più tempo" },
            { value: 'C', text: "Non ancora, voglio provarlo domani" }
          ]
        },
        {
          text: "Hai definito UNA azione concreta da fare entro domani?",
          options: [
            { value: 'A', text: "Sì, e l'ho già fatta" },
            { value: 'B', text: "Sì, la farò domani mattina" },
            { value: 'C', text: "Non sono sicuro di quale azione scegliere" }
          ]
        },
        {
          text: "Usare tutti e tre i filtri insieme ti sembra utile?",
          options: [
            { value: 'A', text: "Sì, mi dà una struttura per pensare" },
            { value: 'B', text: "Potenzialmente, devo esercitarmi" },
            { value: 'C', text: "Sembra complicato, preferisco un approccio più semplice" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 6 →"
    },
    6: {
      title: "Prima di Passare al Giorno 7",
      intro: "Rifletti sui \"3 Traditori Silenziosi\".",
      questions: [
        {
          text: "Quale Traditore ti ha bloccato più spesso?",
          options: [
            { value: 'A', text: "Il Paralizzante: \"Devo avere tutte le informazioni\"" },
            { value: 'B', text: "Il Timoroso: \"È meglio non agire che sbagliare\"" },
            { value: 'C', text: "Il Procrastinatore: \"Devo aspettare il momento perfetto\"" }
          ]
        },
        {
          text: "Hai risposto per iscritto al tuo Traditore?",
          options: [
            { value: 'A', text: "Sì, e mi ha aiutato a vedere che era una scusa" },
            { value: 'B', text: "L'ho fatto mentalmente, non per iscritto" },
            { value: 'C', text: "Non ancora, ci devo lavorare" }
          ]
        },
        {
          text: "Hai fatto l'azione che avevi rimandato (dal Giorno 5)?",
          options: [
            { value: 'A', text: "Sì, l'ho fatta oggi" },
            { value: 'B', text: "Non ancora, ma so che il Traditore mi sta bloccando" },
            { value: 'C', text: "No, e non sono sicuro che il problema sia il Traditore" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 7 →"
    },
    7: {
      title: "Completa la Challenge",
      intro: "Rifletti su \"Da Qui in Avanti\" e su tutta la settimana.",
      questions: [
        {
          text: "Qual è lo strumento più utile che hai acquisito questa settimana?",
          options: [
            { value: 'A', text: "Vedere gli schemi ripetuti (Filtro Pattern)" },
            { value: 'B', text: "Leggere i segnali non detti (Filtro Segnali)" },
            { value: 'C', text: "Trovare risorse nascoste (Filtro Risorse)" }
          ]
        },
        {
          text: "Hai definito il prossimo problema su cui userai il metodo?",
          options: [
            { value: 'A', text: "Sì, so già quale sarà" },
            { value: 'B', text: "Ho alcune idee, devo sceglierne una" },
            { value: 'C', text: "Non ancora, ma so che userò il metodo" }
          ]
        },
        {
          text: "Ti senti più capace di affrontare problemi difficili?",
          options: [
            { value: 'A', text: "Sì, ho strumenti concreti da usare" },
            { value: 'B', text: "Un po' di più, ma devo esercitarmi" },
            { value: 'C', text: "Non molto, ma ho capito cosa devo sviluppare" }
          ]
        }
      ],
      ctaText: "COMPLETA LA CHALLENGE →"
    }
  },

  // =====================================================
  // MICROFELICITÀ - 7 giorni
  // =====================================================
  microfelicita: {
    1: {
      title: "Prima di Passare al Giorno 2",
      intro: "Rifletti su \"Quello che Ti Perdi Ogni Giorno\".",
      questions: [
        {
          text: "Hai trovato 3 momenti piacevoli della giornata?",
          options: [
            { value: 'A', text: "Sì, ne ho trovati 3 o più" },
            { value: 'B', text: "Ne ho trovati 1-2, con qualche sforzo" },
            { value: 'C', text: "È stato difficile trovarne, il radar non è calibrato" }
          ]
        },
        {
          text: "L'analogia del telefono che ti impedisce di vedere ti è stata utile?",
          options: [
            { value: 'A', text: "Sì, capisco perché perdo i momenti positivi" },
            { value: 'B', text: "In parte, ma non sono sicuro di essere così distratto" },
            { value: 'C', text: "Non mi ci ritrovo, credo di notare abbastanza" }
          ]
        },
        {
          text: "Come ti sei sentito nel cercare i momenti piacevoli?",
          options: [
            { value: 'A', text: "Sorpreso: ce n'erano più di quanto pensassi" },
            { value: 'B', text: "Curioso: voglio vedere se domani ne trovo di più" },
            { value: 'C', text: "Frustrato: non riesco a trovarli" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 2 →"
    },
    2: {
      title: "Prima di Passare al Giorno 3",
      intro: "Rifletti su \"La Matematica dei Momenti\".",
      questions: [
        {
          text: "Sei riuscito a intercettare 3 momenti mentre succedevano (non a memoria)?",
          options: [
            { value: 'A', text: "Sì, ho detto \"Questo. Proprio questo.\" almeno 3 volte" },
            { value: 'B', text: "1-2 volte, è più difficile che a memoria" },
            { value: 'C', text: "Non ci sono riuscito, me ne sono ricordato solo alla sera" }
          ]
        },
        {
          text: "L'idea che 50 momenti piccoli battono 4 momenti grandi ti ha colpito?",
          options: [
            { value: 'A', text: "Sì, cambia come vedo il benessere quotidiano" },
            { value: 'B', text: "Interessante, ma devo ancora metabolizzarla" },
            { value: 'C', text: "Non sono convinto, i momenti grandi contano di più" }
          ]
        },
        {
          text: "Quanti momenti hai intercettato in totale oggi?",
          options: [
            { value: 'A', text: "3 o più" },
            { value: 'B', text: "1-2" },
            { value: 'C', text: "Nessuno in tempo reale" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 3 →"
    },
    3: {
      title: "Prima di Passare al Giorno 4",
      intro: "Rifletti su R.A.D.A.R. (Rileva-Accogli-Distingui-Amplifica-Resta).",
      questions: [
        {
          text: "Hai applicato R.A.D.A.R. alle 3 occasioni suggerite?",
          options: [
            { value: 'A', text: "Sì, tutte e 3: caffè, silenzio, e una a scelta" },
            { value: 'B', text: "1-2 occasioni, non tutte" },
            { value: 'C', text: "Non ancora, ma ho capito il metodo" }
          ]
        },
        {
          text: "Quale passo di R.A.D.A.R. ti è sembrato più facile?",
          options: [
            { value: 'A', text: "Rilevare: noto quando succede qualcosa di piacevole" },
            { value: 'B', text: "Amplificare: mantengo l'attenzione per qualche secondo" },
            { value: 'C', text: "Nessuno mi viene naturale, devo esercitarmi" }
          ]
        },
        {
          text: "L'idea della stella cadente ti ha aiutato a capire l'urgenza?",
          options: [
            { value: 'A', text: "Sì, capisco che devo catturare subito" },
            { value: 'B', text: "In parte, ma a volte me ne accorgo troppo tardi" },
            { value: 'C', text: "Non mi ci ritrovo, i miei momenti durano di più" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 4 →"
    },
    4: {
      title: "Prima di Passare al Giorno 5",
      intro: "Rifletti sugli \"Errori da Evitare\" con R.A.D.A.R.",
      questions: [
        {
          text: "Quale errore riconosci come tuo?",
          options: [
            { value: 'A', text: "Cercare invece di notare (\"Dove sono?\")" },
            { value: 'B', text: "Aspettare sensazioni forti" },
            { value: 'C', text: "Analizzare troppo o farlo solo in momenti speciali" }
          ]
        },
        {
          text: "Hai applicato la correzione specifica?",
          options: [
            { value: 'A', text: "Sì, ho corretto il mio errore principale" },
            { value: 'B', text: "Ci ho provato, non è stato facile" },
            { value: 'C', text: "Non ancora, lo farò domani" }
          ]
        },
        {
          text: "Hai applicato R.A.D.A.R. durante un'attività ordinaria?",
          options: [
            { value: 'A', text: "Sì, mentre mi lavavo le mani / camminavo / altro" },
            { value: 'B', text: "Ho provato, ma mi sono dimenticato" },
            { value: 'C', text: "No, l'ho fatto solo in momenti di pausa" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 5 →"
    },
    5: {
      title: "Prima di Passare al Giorno 6",
      intro: "Rifletti su \"Quando la Giornata È Dura\".",
      questions: [
        {
          text: "Hai scritto sia il negativo che il positivo della giornata?",
          options: [
            { value: 'A', text: "Sì, ho completato il quadro con entrambi" },
            { value: 'B', text: "Ho scritto il negativo, fatico a trovare il positivo" },
            { value: 'C', text: "Non l'ho fatto, la giornata non era particolarmente dura" }
          ]
        },
        {
          text: "L'idea del bilancio (entrate + uscite) ti ha aiutato?",
          options: [
            { value: 'A', text: "Sì, capisco che R.A.D.A.R. non nega il negativo" },
            { value: 'B', text: "In parte, ma quando sto male faccio fatica" },
            { value: 'C', text: "Non sono convinto, sembra \"pensiero positivo\"" }
          ]
        },
        {
          text: "Hai trovato almeno 2 cose positive nonostante il negativo?",
          options: [
            { value: 'A', text: "Sì, anche se piccole" },
            { value: 'B', text: "Con fatica, solo 1" },
            { value: 'C', text: "No, oggi era troppo difficile" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 6 →"
    },
    6: {
      title: "Prima di Passare al Giorno 7",
      intro: "Rifletti su \"Come Farlo Diventare Automatico\".",
      questions: [
        {
          text: "Hai scelto il tuo aggancio?",
          options: [
            { value: 'A', text: "Sì: \"Quando ___, faccio R.A.D.A.R.\"" },
            { value: 'B', text: "Ho alcune opzioni, devo sceglierne una" },
            { value: 'C', text: "Non ancora, non so cosa scegliere" }
          ]
        },
        {
          text: "L'analogia delle vitamine vicino al caffè ti è stata utile?",
          options: [
            { value: 'A', text: "Sì, capisco che devo collegare a qualcosa che già faccio" },
            { value: 'B', text: "In parte, ma tendo a dimenticarmi comunque" },
            { value: 'C', text: "Non mi ci ritrovo, non funziona così per me" }
          ]
        },
        {
          text: "Hai fatto R.A.D.A.R. collegato all'aggancio almeno una volta oggi?",
          options: [
            { value: 'A', text: "Sì, almeno una volta" },
            { value: 'B', text: "Ho provato, ma non mi sono ricordato" },
            { value: 'C', text: "Non ancora, inizio domani" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 7 →"
    },
    7: {
      title: "Completa la Challenge",
      intro: "Rifletti su \"Da Qui in Avanti\" e su tutta la settimana.",
      questions: [
        {
          text: "Qual è la scoperta più importante di questa settimana?",
          options: [
            { value: 'A', text: "I momenti piacevoli ci sono, solo non li notavo" },
            { value: 'B', text: "Tanti piccoli momenti battono pochi grandi" },
            { value: 'C', text: "R.A.D.A.R. funziona se lo collego a qualcosa" }
          ]
        },
        {
          text: "Hai confermato il tuo aggancio per i prossimi 21 giorni?",
          options: [
            { value: 'A', text: "Sì, so esattamente quando farò R.A.D.A.R." },
            { value: 'B', text: "Ho un'idea, devo renderla più concreta" },
            { value: 'C', text: "Non ancora, ma voglio continuare" }
          ]
        },
        {
          text: "Come cambierebbe la tua settimana se notassi 10 momenti positivi in più ogni giorno?",
          options: [
            { value: 'A', text: "Mi sentirei più soddisfatto e sereno" },
            { value: 'B', text: "Vedrei le giornate in modo più equilibrato" },
            { value: 'C', text: "Non sono sicuro, ma sono curioso di scoprirlo" }
          ]
        }
      ],
      ctaText: "COMPLETA LA CHALLENGE →"
    }
  }
};

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
