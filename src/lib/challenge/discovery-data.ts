// Dati Discovery per le 3 Challenge - 7 giorni ciascuna
// Importati dal documento CONFERME_SCOPERTA_21_GIORNI.md

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
      intro: "Rifletti su quello che hai scoperto oggi.",
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
          text: "Come ti sei sentito nel cercare questi momenti?",
          options: [
            { value: 'A', text: "Sorpreso: non ci avevo mai pensato così" },
            { value: 'B', text: "Curioso: voglio capire meglio cosa significa" },
            { value: 'C', text: "Scettico: non sono sicuro che contino davvero" }
          ]
        },
        {
          text: "Cosa ti ha colpito di più del contenuto di oggi?",
          options: [
            { value: 'A', text: "L'analogia della strada: sono già \"quello che sa la strada\" in alcuni momenti" },
            { value: 'B', text: "L'idea che la leadership sia già presente, solo non notata" },
            { value: 'C', text: "L'esercizio pratico: mi ha fatto vedere le cose diversamente" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 2 →"
    },
    2: {
      title: "Prima di Passare al Giorno 3",
      intro: "Rifletti sulla tua esperienza con il Fuoco Interno.",
      questions: [
        {
          text: "Pensando alle tue motivazioni principali, cosa ti spinge di più ad agire?",
          options: [
            { value: 'A', text: "Qualcosa che voglio costruire o creare" },
            { value: 'B', text: "Qualcosa da cui voglio allontanarmi" },
            { value: 'C', text: "Una combinazione di entrambi, a seconda della situazione" }
          ]
        },
        {
          text: "Hai identificato un momento questa settimana in cui hai agito spinto dal \"verso\" anziché dal \"via da\"?",
          options: [
            { value: 'A', text: "Sì, e mi sono sentito diverso — più centrato" },
            { value: 'B', text: "Ci sto ancora pensando" },
            { value: 'C', text: "Non ancora, ma ora so cosa cercare" }
          ]
        },
        {
          text: "Come cambierebbe la tua giornata se agissi più spesso dal \"verso\"?",
          options: [
            { value: 'A', text: "Avrei più energia e meno stress" },
            { value: 'B', text: "Prenderei decisioni più allineate con chi sono" },
            { value: 'C', text: "Non sono sicuro, ma sono curioso di scoprirlo" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 3 →"
    },
    3: {
      title: "Prima di Passare al Giorno 4",
      intro: "Rifletti sul Coraggio che Costruisce.",
      questions: [
        {
          text: "Qual è la tua reazione più frequente di fronte a una sfida importante?",
          options: [
            { value: 'A', text: "Cerco di capire cosa posso costruire dalla situazione" },
            { value: 'B', text: "Mi concentro su come resistere e non cedere" },
            { value: 'C', text: "Dipende dalla situazione" }
          ]
        },
        {
          text: "Hai notato situazioni in cui \"resistere\" ti ha tenuto bloccato?",
          options: [
            { value: 'A', text: "Sì, ora vedo che avrei potuto costruire invece di resistere" },
            { value: 'B', text: "Forse, ci devo pensare meglio" },
            { value: 'C', text: "No, credo che resistere sia stato necessario" }
          ]
        },
        {
          text: "Cosa significa per te \"coraggio che costruisce\"?",
          options: [
            { value: 'A', text: "Usare le difficoltà come materiale da costruzione" },
            { value: 'B', text: "Andare avanti anche quando è difficile" },
            { value: 'C', text: "Scegliere di creare anziché solo sopravvivere" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 4 →"
    },
    4: {
      title: "Prima di Passare al Giorno 5",
      intro: "Rifletti sulla Dedizione che Serve.",
      questions: [
        {
          text: "Quando ti dedichi a un progetto, cosa ti guida di più?",
          options: [
            { value: 'A', text: "Il valore che creo per gli altri" },
            { value: 'B', text: "La soddisfazione personale del risultato" },
            { value: 'C', text: "La necessità di portare a termine ciò che ho iniziato" }
          ]
        },
        {
          text: "Hai mai scambiato l'ostinazione per dedizione?",
          options: [
            { value: 'A', text: "Sì, e ora capisco la differenza" },
            { value: 'B', text: "Probabilmente sì, in alcune situazioni" },
            { value: 'C', text: "Non credo, ma ci rifletterò" }
          ]
        },
        {
          text: "Come riconosci quando la tua dedizione sta servendo davvero?",
          options: [
            { value: 'A', text: "Vedo risultati positivi per le persone coinvolte" },
            { value: 'B', text: "Mi sento allineato con i miei valori" },
            { value: 'C', text: "Sto ancora imparando a riconoscerlo" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 5 →"
    },
    5: {
      title: "Prima di Passare al Giorno 6",
      intro: "Rifletti sui Principi Stabili.",
      questions: [
        {
          text: "Quali sono i principi che non negozieresti mai?",
          options: [
            { value: 'A', text: "Li ho chiari e mi guidano nelle decisioni difficili" },
            { value: 'B', text: "Ne ho alcuni, ma potrei definirli meglio" },
            { value: 'C', text: "Non ci ho mai pensato in modo strutturato" }
          ]
        },
        {
          text: "Come distingui ciò che deve restare fisso da ciò che può adattarsi?",
          options: [
            { value: 'A', text: "I valori restano fissi, le strategie si adattano" },
            { value: 'B', text: "Decido caso per caso" },
            { value: 'C', text: "A volte faccio fatica a distinguere" }
          ]
        },
        {
          text: "Hai vissuto situazioni in cui i tuoi principi sono stati messi alla prova?",
          options: [
            { value: 'A', text: "Sì, e sono contento di averli mantenuti" },
            { value: 'B', text: "Sì, e a volte ho ceduto — ma ho imparato" },
            { value: 'C', text: "Non ricordo situazioni così significative" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 6 →"
    },
    6: {
      title: "Prima di Passare al Giorno 7",
      intro: "Rifletti sulla Delega e i Sistemi.",
      questions: [
        {
          text: "Quanto ti risulta facile delegare compiti importanti?",
          options: [
            { value: 'A', text: "Lo faccio regolarmente, con fiducia" },
            { value: 'B', text: "Lo faccio, ma controllo molto" },
            { value: 'C', text: "Preferisco fare io, per sicurezza" }
          ]
        },
        {
          text: "Hai sistemi che funzionano anche senza la tua presenza diretta?",
          options: [
            { value: 'A', text: "Sì, diversi — e mi danno libertà" },
            { value: 'B', text: "Alcuni, ma c'è margine di miglioramento" },
            { value: 'C', text: "Non ancora, ma capisco l'importanza" }
          ]
        },
        {
          text: "Cosa ti frena di più nel delegare?",
          options: [
            { value: 'A', text: "La paura che non sia fatto bene" },
            { value: 'B', text: "Il tempo necessario per formare qualcuno" },
            { value: 'C', text: "Niente di particolare, è solo questione di abitudine" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 7 →"
    },
    7: {
      title: "Completa la Sfida Leadership",
      intro: "Ultima riflessione prima di completare il percorso.",
      questions: [
        {
          text: "Dopo questi 7 giorni, come vedi la tua leadership?",
          options: [
            { value: 'A', text: "La riconosco come parte di me, già presente" },
            { value: 'B', text: "La vedo più chiaramente, ma devo ancora integrarla" },
            { value: 'C', text: "Ho ancora dubbi, ma sono sulla strada giusta" }
          ]
        },
        {
          text: "Qual è stata la scoperta più significativa di questa settimana?",
          options: [
            { value: 'A', text: "Che la leadership non si costruisce, si riconosce" },
            { value: 'B', text: "Che già guido in modi che non avevo notato" },
            { value: 'C', text: "Che il mio approccio al coraggio/dedizione/principi può evolversi" }
          ]
        },
        {
          text: "Cosa farai nei prossimi 7 giorni?",
          options: [
            { value: 'A', text: "Continuerò a notare i momenti di leadership quotidiani" },
            { value: 'B', text: "Approfondirò con l'Assessment completo" },
            { value: 'C', text: "Rifletterò su quanto scoperto prima di procedere" }
          ]
        }
      ],
      ctaText: "COMPLETA LA SFIDA →"
    }
  },

  // =====================================================
  // OLTRE GLI OSTACOLI - 7 giorni
  // =====================================================
  ostacoli: {
    1: {
      title: "Prima di Passare al Giorno 2",
      intro: "Rifletti sui pattern che hai iniziato a riconoscere.",
      questions: [
        {
          text: "Hai identificato un problema recente che assomiglia a uno già risolto in passato?",
          options: [
            { value: 'A', text: "Sì, e vedere il pattern mi ha dato una nuova prospettiva" },
            { value: 'B', text: "Forse, ma devo rifletterci meglio" },
            { value: 'C', text: "Non ancora, continuerò a cercare" }
          ]
        },
        {
          text: "Come ti fa sentire l'idea che i problemi si ripetano in schemi?",
          options: [
            { value: 'A', text: "Sollevato: significa che ho già le soluzioni" },
            { value: 'B', text: "Curioso: voglio capire meglio i miei pattern" },
            { value: 'C', text: "Scettico: ogni problema mi sembra unico" }
          ]
        },
        {
          text: "Cosa ti ha colpito di più del Filtro dei Pattern?",
          options: [
            { value: 'A', text: "L'idea che già risolvo problemi senza rendermene conto" },
            { value: 'B', text: "La possibilità di usare esperienze passate in modo consapevole" },
            { value: 'C', text: "L'esercizio pratico di mappare i pattern" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 2 →"
    },
    2: {
      title: "Prima di Passare al Giorno 3",
      intro: "Rifletti sui segnali che hai imparato a decodificare.",
      questions: [
        {
          text: "Hai notato segnali non verbali in una conversazione recente?",
          options: [
            { value: 'A', text: "Sì, e mi hanno dato informazioni che le parole non dicevano" },
            { value: 'B', text: "Ci ho provato, ma non sono sicuro di averli letti bene" },
            { value: 'C', text: "Non ci ho fatto caso, ma ora starò più attento" }
          ]
        },
        {
          text: "Quanto ti fidi della tua intuizione quando qualcosa non ti torna?",
          options: [
            { value: 'A', text: "Molto: di solito ha ragione" },
            { value: 'B', text: "Abbastanza, ma verifico sempre" },
            { value: 'C', text: "Poco: preferisco i fatti concreti" }
          ]
        },
        {
          text: "Il Filtro dei Segnali ti ha fatto vedere qualcosa di nuovo?",
          options: [
            { value: 'A', text: "Sì, quante informazioni perdo normalmente" },
            { value: 'B', text: "Mi ha confermato cose che già intuivo" },
            { value: 'C', text: "Non ancora, ma continuerò a praticarlo" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 3 →"
    },
    3: {
      title: "Prima di Passare al Giorno 4",
      intro: "Rifletti sulle risorse che già possiedi.",
      questions: [
        {
          text: "Hai fatto l'inventario delle tue risorse?",
          options: [
            { value: 'A', text: "Sì, e ho scoperto di avere più di quanto pensassi" },
            { value: 'B', text: "Ho iniziato, ma non è completo" },
            { value: 'C', text: "Non ancora, lo farò" }
          ]
        },
        {
          text: "Quali risorse hai sottovalutato finora?",
          options: [
            { value: 'A', text: "Le mie relazioni e il mio network" },
            { value: 'B', text: "Le competenze trasferibili da altri contesti" },
            { value: 'C', text: "Il tempo e l'energia che ho a disposizione" }
          ]
        },
        {
          text: "Come useresti le tue risorse per il problema attuale?",
          options: [
            { value: 'A', text: "Ho già alcune idee concrete" },
            { value: 'B', text: "Devo combinare risorse che non avevo collegato" },
            { value: 'C', text: "Ci sto ancora pensando" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 4 →"
    },
    4: {
      title: "Prima di Passare al Giorno 5",
      intro: "Rifletti sulle convinzioni che ti hanno frenato.",
      questions: [
        {
          text: "Hai identificato un Traditore Silenzioso che ti limita?",
          options: [
            { value: 'A', text: "Sì, e riconoscerlo è già liberatorio" },
            { value: 'B', text: "Ne ho trovati diversi, devo capire quale è il principale" },
            { value: 'C', text: "Non sono sicuro, le mie convinzioni mi sembrano ragionevoli" }
          ]
        },
        {
          text: "Qual è la convinzione che più spesso ti blocca?",
          options: [
            { value: 'A', text: "\"Non sono abbastanza\" (competente/esperto/pronto)" },
            { value: 'B', text: "\"È troppo rischioso\" o \"Non è il momento giusto\"" },
            { value: 'C', text: "\"Gli altri sono meglio di me\" o \"Non merito\"" }
          ]
        },
        {
          text: "Come ti sentiresti senza quella convinzione?",
          options: [
            { value: 'A', text: "Libero di agire e sperimentare" },
            { value: 'B', text: "Più coraggioso ma anche più esposto" },
            { value: 'C', text: "Non saprei, quella convinzione mi protegge" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 5 →"
    },
    5: {
      title: "Prima di Passare al Giorno 6",
      intro: "Rifletti sul Sistema A.Z.I.O.N.E.",
      questions: [
        {
          text: "Hai applicato il sistema A.Z.I.O.N.E. a un problema reale?",
          options: [
            { value: 'A', text: "Sì, e mi ha aiutato a strutturare il mio approccio" },
            { value: 'B', text: "Ho iniziato, ma non ho completato tutti i passi" },
            { value: 'C', text: "Non ancora, ma ho capito la logica" }
          ]
        },
        {
          text: "Qual è il passo che ti risulta più difficile?",
          options: [
            { value: 'A', text: "Definire l'obiettivo con chiarezza" },
            { value: 'B', text: "Passare dalla pianificazione all'azione" },
            { value: 'C', text: "Valutare i risultati senza giudicarmi" }
          ]
        },
        {
          text: "Cosa cambia quando usi un sistema invece di improvvisare?",
          options: [
            { value: 'A', text: "Più chiarezza e meno ansia" },
            { value: 'B', text: "Più struttura ma anche più rigidità" },
            { value: 'C', text: "Non noto grande differenza, per ora" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 6 →"
    },
    6: {
      title: "Prima di Passare al Giorno 7",
      intro: "Rifletti sul Sistema C.R.E.S.C.I.T.A.",
      questions: [
        {
          text: "Hai estratto un apprendimento da un'esperienza recente?",
          options: [
            { value: 'A', text: "Sì, e ho capito cosa posso fare diversamente" },
            { value: 'B', text: "Ci ho provato, ma non è stato facile" },
            { value: 'C', text: "Non ancora, ma ho capito il processo" }
          ]
        },
        {
          text: "Cosa ti impedisce di solito di imparare dagli errori?",
          options: [
            { value: 'A', text: "Il giudizio su me stesso" },
            { value: 'B', text: "La fretta di passare oltre" },
            { value: 'C', text: "Non sapere come estrarre l'apprendimento" }
          ]
        },
        {
          text: "Come ti senti all'idea che ogni esperienza abbia valore?",
          options: [
            { value: 'A', text: "Liberato: posso permettermi di sbagliare" },
            { value: 'B', text: "Curioso: voglio vedere se funziona" },
            { value: 'C', text: "Scettico: alcune esperienze sono solo negative" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 7 →"
    },
    7: {
      title: "Completa la Sfida Ostacoli",
      intro: "Ultima riflessione prima di completare il percorso.",
      questions: [
        {
          text: "Dopo questi 7 giorni, come vedi i problemi?",
          options: [
            { value: 'A', text: "Come opportunità mascherate che posso decodificare" },
            { value: 'B', text: "Con più strumenti per affrontarli" },
            { value: 'C', text: "Ancora impegnativi, ma con una nuova prospettiva" }
          ]
        },
        {
          text: "Qual è stato lo strumento più utile per te?",
          options: [
            { value: 'A', text: "I 3 Filtri (Pattern, Segnali, Risorse)" },
            { value: 'B', text: "La Spirale delle Convinzioni" },
            { value: 'C', text: "I Sistemi A.Z.I.O.N.E. e C.R.E.S.C.I.T.A." }
          ]
        },
        {
          text: "Cosa farai nei prossimi 7 giorni?",
          options: [
            { value: 'A', text: "Applicherò gli strumenti a un problema reale" },
            { value: 'B', text: "Approfondirò con l'Assessment completo" },
            { value: 'C', text: "Integrerò gradualmente quanto appreso" }
          ]
        }
      ],
      ctaText: "COMPLETA LA SFIDA →"
    }
  },

  // =====================================================
  // MICROFELICITÀ - 7 giorni
  // =====================================================
  microfelicita: {
    1: {
      title: "Prima di Passare al Giorno 2",
      intro: "Rifletti sui segnali deboli che hai iniziato a notare.",
      questions: [
        {
          text: "Hai notato almeno un momento di microfelicità oggi?",
          options: [
            { value: 'A', text: "Sì, più di uno — sorprendente!" },
            { value: 'B', text: "Uno, ma significativo" },
            { value: 'C', text: "Non ancora, ma continuerò a cercare" }
          ]
        },
        {
          text: "Com'era il momento che hai notato?",
          options: [
            { value: 'A', text: "Piccolo ma piacevole — non l'avrei mai considerato prima" },
            { value: 'B', text: "Più intenso di quanto pensassi potesse essere" },
            { value: 'C', text: "Non sono sicuro se contasse come microfelicità" }
          ]
        },
        {
          text: "Cosa ti ha colpito dell'idea del Segnale Debole?",
          options: [
            { value: 'A', text: "Che la felicità esiste già, solo non la noto" },
            { value: 'B', text: "Che il cervello è programmato per ignorare il positivo" },
            { value: 'C', text: "Che 7 secondi possono fare la differenza" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 2 →"
    },
    2: {
      title: "Prima di Passare al Giorno 3",
      intro: "Rifletti sul metodo R.A.D.A.R. che hai praticato.",
      questions: [
        {
          text: "Hai provato il metodo R.A.D.A.R. oggi?",
          options: [
            { value: 'A', text: "Sì, più volte — diventa naturale" },
            { value: 'B', text: "Una volta, con attenzione" },
            { value: 'C', text: "Ho capito il metodo, lo proverò domani" }
          ]
        },
        {
          text: "Quale passo del R.A.D.A.R. ti risulta più facile?",
          options: [
            { value: 'A', text: "Riconoscere il momento" },
            { value: 'B', text: "Amplificare la sensazione" },
            { value: 'C', text: "Dedicare i 7 secondi di attenzione" }
          ]
        },
        {
          text: "Come cambia la tua esperienza quando usi il R.A.D.A.R.?",
          options: [
            { value: 'A', text: "Il momento dura di più e lascia una traccia" },
            { value: 'B', text: "Mi sento più presente e consapevole" },
            { value: 'C', text: "Non noto ancora grande differenza" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 3 →"
    },
    3: {
      title: "Prima di Passare al Giorno 4",
      intro: "Rifletti sui 5 canali della microfelicità.",
      questions: [
        {
          text: "Qual è il canale da cui ricevi più microfelicità?",
          options: [
            { value: 'A', text: "Visivo (luce, colori, bellezza)" },
            { value: 'B', text: "Corporeo (sensazioni fisiche piacevoli)" },
            { value: 'C', text: "Uditivo o olfattivo (suoni, profumi)" }
          ]
        },
        {
          text: "Hai scoperto un canale che sottovalutavi?",
          options: [
            { value: 'A', text: "Sì, e ora lo cerco attivamente" },
            { value: 'B', text: "Forse il cognitivo — i pensieri piacevoli" },
            { value: 'C', text: "Non ancora, ma ci farò attenzione" }
          ]
        },
        {
          text: "Come ti senti sapendo che hai 5 fonti di benessere?",
          options: [
            { value: 'A', text: "Più ricco: ho più opportunità di quanto pensassi" },
            { value: 'B', text: "Curioso di esplorare i canali meno usati" },
            { value: 'C', text: "Sopraffatto: sono troppe cose da notare" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 4 →"
    },
    4: {
      title: "Prima di Passare al Giorno 5",
      intro: "Rifletti sugli ostacoli che bloccano la microfelicità.",
      questions: [
        {
          text: "Quale ostacolo riconosci di più nella tua vita?",
          options: [
            { value: 'A', text: "La fretta: non mi fermo mai abbastanza" },
            { value: 'B', text: "Il perfezionismo: niente è mai abbastanza buono" },
            { value: 'C', text: "L'abitudine: do per scontato ciò che ho" }
          ]
        },
        {
          text: "Hai notato un momento perso a causa di un ostacolo?",
          options: [
            { value: 'A', text: "Sì, e riconoscerlo mi ha fatto riflettere" },
            { value: 'B', text: "Probabilmente sì, ma non ne sono consapevole" },
            { value: 'C', text: "No, ma ora so cosa cercare" }
          ]
        },
        {
          text: "Cosa potresti fare per ridurre quell'ostacolo?",
          options: [
            { value: 'A', text: "Rallentare intenzionalmente in certi momenti" },
            { value: 'B', text: "Accettare che non tutto deve essere perfetto" },
            { value: 'C', text: "Riscoprire ciò che do per scontato" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 5 →"
    },
    5: {
      title: "Prima di Passare al Giorno 6",
      intro: "Rifletti sulla differenza tra nutriente e sabotante.",
      questions: [
        {
          text: "Hai identificato un piacere che ti sabota?",
          options: [
            { value: 'A', text: "Sì, e capisco perché non mi fa bene davvero" },
            { value: 'B', text: "Forse, ma è difficile ammetterlo" },
            { value: 'C', text: "Non credo di averne, i miei piaceri sono sani" }
          ]
        },
        {
          text: "Come distingui un piacere nutriente da uno sabotante?",
          options: [
            { value: 'A', text: "Il nutriente lascia energia, il sabotante lascia vuoto" },
            { value: 'B', text: "Il nutriente costruisce, il sabotante compensa" },
            { value: 'C', text: "Non è sempre chiaro, dipende dal contesto" }
          ]
        },
        {
          text: "Cosa proverai a cambiare questa settimana?",
          options: [
            { value: 'A', text: "Sostituire un sabotante con un nutriente" },
            { value: 'B', text: "Ridurre la frequenza di un sabotante" },
            { value: 'C', text: "Prima osserverò meglio i miei pattern" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 6 →"
    },
    6: {
      title: "Prima di Passare al Giorno 7",
      intro: "Rifletti sulla tecnica di amplificazione.",
      questions: [
        {
          text: "Hai praticato i 10 secondi di amplificazione?",
          options: [
            { value: 'A', text: "Sì, e il momento è diventato più memorabile" },
            { value: 'B', text: "Ci ho provato, ma mi sono distratto" },
            { value: 'C', text: "Non ancora, ma ho capito come fare" }
          ]
        },
        {
          text: "Cosa succede quando amplifichi un momento positivo?",
          options: [
            { value: 'A', text: "Si ancora nella memoria, lo ricordo dopo" },
            { value: 'B', text: "Mi sento più grato e presente" },
            { value: 'C', text: "Non noto ancora grande differenza" }
          ]
        },
        {
          text: "Quale tecnica di amplificazione preferisci?",
          options: [
            { value: 'A', text: "Respirare nel momento e sentirlo nel corpo" },
            { value: 'B', text: "Collegare il momento a un valore importante" },
            { value: 'C', text: "Condividere il momento con qualcuno" }
          ]
        }
      ],
      ctaText: "PROSEGUI AL GIORNO 7 →"
    },
    7: {
      title: "Completa la Sfida Microfelicità",
      intro: "Ultima riflessione prima di completare il percorso.",
      questions: [
        {
          text: "Dopo questi 7 giorni, noti più microfelicità?",
          options: [
            { value: 'A', text: "Sì, decisamente — sono ovunque" },
            { value: 'B', text: "Di più, ma devo ancora allenarmi" },
            { value: 'C', text: "A volte, quando mi ricordo di cercarle" }
          ]
        },
        {
          text: "Qual è stata la scoperta più significativa?",
          options: [
            { value: 'A', text: "Che la felicità non si costruisce, si riconosce" },
            { value: 'B', text: "Che ho 5 canali di benessere sempre disponibili" },
            { value: 'C', text: "Che gli ostacoli interni sono i veri blocchi" }
          ]
        },
        {
          text: "Cosa continuerai a fare dopo la sfida?",
          options: [
            { value: 'A', text: "Praticare il R.A.D.A.R. ogni giorno" },
            { value: 'B', text: "Esplorare tutti i 5 canali consapevolmente" },
            { value: 'C', text: "Approfondire con l'Assessment completo" }
          ]
        }
      ],
      ctaText: "COMPLETA LA SFIDA →"
    }
  }
};

// Helper per ottenere i dati di un giorno specifico
export function getDiscoveryData(challenge: ChallengeType, day: DayNumber): DiscoveryData {
  return DISCOVERY_DATA[challenge][day];
}

// Helper per ottenere tutti i giorni di una challenge
export function getChallengeDiscoveryDays(challenge: ChallengeType): DiscoveryData[] {
  return Object.values(DISCOVERY_DATA[challenge]);
}
