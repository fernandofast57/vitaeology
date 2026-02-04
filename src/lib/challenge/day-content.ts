// Contenuti delle Day Pages per le 3 Challenge
// 7 giorni × 3 challenge = 21 pagine
// AGGIORNATO: 27 Gennaio 2026 - Revisione completa con metodologia 3 Fasi
// Conformità: FASE 3 (AVERE) → FASE 2 (AGENCY) → FASE 1 (ITALIANO)
// Principio: L'utente POSSIEDE GIÀ le capacità - riconoscimento, non acquisizione

import { ChallengeType, DayNumber } from './discovery-data';

export interface ContentSection {
  icon?: string;
  title: string;
  content: string;
  highlights?: string[];
}

export interface DayExercise {
  instruction: string;
  steps?: string[];
  duration?: string;
}

export interface DayContent {
  title: string;
  subtitle: string;
  principle: string;
  emailSubject?: string;
  videoUrl?: string;
  sections: ContentSection[];
  exercise?: DayExercise;
  keyTakeaway: string;
  openLoop?: string;
}

export const DAY_CONTENT: Record<ChallengeType, Record<DayNumber, DayContent>> = {
  // =====================================================
  // LEADERSHIP AUTENTICA - 7 giorni
  // Revisione: FASE 3 (AVERE) → FASE 2 (AGENCY) → FASE 1 (ITALIANO)
  // =====================================================
  leadership: {
    1: {
      title: "Qualcosa Non Funziona",
      subtitle: "Quella sensazione è già la soluzione che inizia",
      emailSubject: "Quel giorno in cabina telefonica",
      principle: "La capacità di percepire che qualcosa non va È già capacità di leadership.",
      sections: [
        {
          icon: "📞",
          title: "Febbraio 1985 - La Cabina Telefonica",
          content: "Avevo 27 anni. Mi trovavo in una cabina telefonica a Milano, con l'ultimo gettone in mano.\n\nDovevo chiamare un cliente importante. Mi ero preparato un discorso pieno di passione.\n\nParlo per tre minuti. Gli racconto tutto — il progetto, il potenziale, il futuro che vedevo.\n\nSilenzio.\n\nPoi lui dice: «Senta, mi fa piacere il suo entusiasmo. Ma lei cosa sa fare CONCRETAMENTE?»\n\nIl gettone finisce. La linea cade.\n\nQuella domanda mi ha accompagnato per anni. Non perché non sapessi rispondere — ma perché mi aveva mostrato qualcosa che preferivo non vedere."
        },
        {
          icon: "💡",
          title: "Quella Sensazione Che Hai",
          content: "Oggi parliamo proprio di questo. Di quella sensazione che qualcosa non funziona.\n\nQuella sensazione che probabilmente provi anche adesso — se stai leggendo queste righe, è possibile che ci sia.\n\nE c'è qualcosa di importante da riconoscere:\n\nQuella sensazione non è il problema. È la soluzione che sta iniziando.\n\nIl fatto stesso che tu percepisca che qualcosa non va significa che stai già vedendo qualcosa che molti preferiscono ignorare.\n\nHai già questa capacità di percezione. È già tua."
        }
      ],
      exercise: {
        instruction: "Potresti scegliere UNA situazione recente in cui hai sentito che qualcosa non funzionava.",
        steps: [
          "Con carta e penna, se preferisci",
          "Potresti annotare UNA situazione recente in cui hai avvertito che qualcosa non andava",
          "Senza analizzarla, senza giudicarla",
          "Semplicemente metterla su carta, se lo desideri"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "La capacità di percepire che qualcosa non va È già capacità di leadership.",
      openLoop: "C'è qualcosa che a volte interferisce con i tuoi momenti migliori. Domani vedremo di cosa si tratta."
    },
    2: {
      title: "La Voce Che Sminuisce",
      subtitle: "Finché non la riconosci, sembra la verità",
      emailSubject: "La voce che ti dice \"non sei abbastanza\"",
      principle: "Finché non riconosci la voce che sminuisce, sembra la verità. Riconoscerla è già avere potere su di essa.",
      sections: [
        {
          icon: "🗣️",
          title: "Cosa Ti Sei Detto Dopo?",
          content: "Ieri ti ho proposto di annotare una situazione in cui sentivi che qualcosa non funzionava.\n\nOggi la domanda è: cosa ti sei detto DOPO averla scritta?\n\nForse una di queste:\n- «Non dovrei sentirmi così»\n- «Gli altri ce la fanno, perché io no?»\n- «Forse non sono tagliato per questo»"
        },
        {
          icon: "📋",
          title: "Il Catalogo Moda - 1984",
          content: "Nel 1984 mi trasferii a Milano per partecipare a un progetto ambizioso: un catalogo moda innovativo. Ero entusiasta di quel progetto.\n\nCosì entusiasta che non mi posi le domande elementari:\n- Chi lo comprerà?\n- Come lo distribuiremo?\n- Abbiamo le competenze per realizzarlo?\n\nIl progetto non andò come sperato.\n\nMa la parte più difficile non fu l'esito. Fu la voce nella mia testa DOPO.\n\n«Vedi? Non sei capace.»\n«Chi ti credi di essere?»\n«Meglio se ti accontenti.»\n\nQuella voce ha avuto influenza su di me per anni."
        },
        {
          icon: "👁️",
          title: "La Riconosci?",
          content: "Oggi parliamo di QUELLA voce.\n\nTutti la conosciamo. La differenza sta nel riconoscerla quando parla.\n\nPerché finché non la riconosci, sembra la verità.\n\nHai già la capacità di riconoscerla. Questo esercizio è solo un modo per attivarla."
        }
      ],
      exercise: {
        instruction: "Potresti riprendere la situazione di ieri e osservare cosa ti sei detto dopo.",
        steps: [
          "Riprendi la situazione di ieri",
          "Ora potresti chiederti: cosa mi sono detto dopo?",
          "Qual è stata la \"voce\" che è arrivata?",
          "Senza combatterla. Solo riconoscerla, se riesci"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Finché non riconosci la voce che sminuisce, sembra la verità. Riconoscerla è già avere potere su di essa.",
      openLoop: "Come distinguere ciò che è reale da ciò che è solo la voce che distorce? Domani parliamo di lucidità."
    },
    3: {
      title: "Vedere le Cose Come Sono",
      subtitle: "La lucidità è una scelta che hai già fatto altre volte",
      emailSubject: "Il parabrezza sporco",
      principle: "La lucidità non è un dono riservato a pochi. È una scelta — e tu l'hai già fatta altre volte.",
      sections: [
        {
          icon: "🚗",
          title: "Il Parabrezza Sporco",
          content: "Ti è mai capitato di guidare con il parabrezza sporco?\n\nAll'inizio non ci fai caso. Poi il sole batte in un certo modo e improvvisamente non vedi più bene.\n\nLa strada è sempre la stessa. Ma tu non la vedi più com'è."
        },
        {
          icon: "🧹",
          title: "La Voce È Come Lo Sporco",
          content: "Ieri abbiamo parlato della voce che sminuisce.\n\nQuella voce è come lo sporco sul parabrezza: si accumula piano, senza che ce ne accorgiamo.\n\nE a un certo punto, guardiamo una situazione normale e vediamo solo problemi."
        },
        {
          icon: "💡",
          title: "La Lucidità È Una Scelta",
          content: "La lucidità non è un dono riservato a pochi. È una scelta.\n\nÈ la scelta di pulire il parabrezza PRIMA di prendere decisioni.\n\nCome si fa?\n\nCon una domanda semplice:\n\n«Ciò che vedo adesso — è la situazione o è la mia reazione alla situazione?»\n\nHai già questa capacità di discernimento. L'hai usata molte volte, anche senza chiamarla \"lucidità\"."
        }
      ],
      exercise: {
        instruction: "Potresti riprendere la situazione del Giorno 1 e separare i fatti dalla tua interpretazione.",
        steps: [
          "Riprendi la situazione del Giorno 1",
          "Potresti chiederti: Cosa SUCCEDE oggettivamente?",
          "Cosa PENSO che succeda?",
          "Sono la stessa cosa?",
          "Se noti una differenza, hai appena pulito il parabrezza"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "La lucidità non è un dono riservato a pochi. È una scelta — e tu l'hai già fatta altre volte.",
      openLoop: "Vedere con chiarezza è il primo passo. Ma cosa fare quando arriva la paura?"
    },
    4: {
      title: "Agire Anche Con la Paura",
      subtitle: "Hai già questa capacità — l'hai dimostrato molte volte",
      emailSubject: "La prima volta che guidi da solo",
      principle: "Il coraggio non è assenza di paura. È ciò che fai MENTRE hai paura — e tu l'hai già fatto.",
      sections: [
        {
          icon: "🚗",
          title: "La Prima Volta al Volante",
          content: "Ti ricordi la prima volta che hai guidato da solo?\n\nNessun istruttore accanto. Nessuno che ti dice cosa fare. Solo tu, il volante e la strada.\n\nAvevi paura? Probabilmente sì.\nL'hai fatto comunque? Sì.\n\nQuella è la definizione di coraggio. E l'hai già fatto."
        },
        {
          icon: "💪",
          title: "La Paura Non Se Ne Va",
          content: "Il coraggio non è assenza di paura. È ciò che fai MENTRE hai paura.\n\nDopo 50 anni di imprenditoria, posso condividere una cosa con certezza:\n\nLa paura non se ne va. Mai.\n\nOgni volta che facciamo qualcosa di importante, c'è paura.\n\nLa differenza tra chi agisce e chi no non è la quantità di paura. È la relazione con la paura.\n\nE tu hai già questa capacità di relazionarti con la paura — l'hai usata ogni volta che hai fatto qualcosa di importante."
        },
        {
          icon: "⚡",
          title: "L'Errore Che Ho Fatto Per Anni",
          content: "C'è un errore che ho fatto per anni: aspettare che la paura passasse per agire.\n\nNon passa.\n\nL'unico modo per farla diminuire è agire MENTRE c'è.\n\nCome quando hai guidato da solo la prima volta: la paura è diminuita DOPO che hai guidato. Non prima."
        }
      ],
      exercise: {
        instruction: "Potresti identificare una cosa che stai rimandando e una micro-azione possibile.",
        steps: [
          "Potresti pensare a UNA cosa che stai rimandando perché «non è il momento giusto»",
          "Ora potresti chiederti: «E se la paura non fosse un segnale di stop ma un segnale che sto per fare qualcosa di importante?»",
          "Potresti annotare UNA micro-azione che potresti fare OGGI su quella cosa",
          "Non serve che sia grande. Basta che sia un inizio"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Il coraggio non è assenza di paura. È ciò che fai MENTRE hai paura — e tu l'hai già fatto.",
      openLoop: "Agire con la paura richiede energia. E l'energia va gestita con consapevolezza."
    },
    5: {
      title: "Sapere Quando Fermarti",
      subtitle: "Hai già la capacità di gestire la tua energia",
      emailSubject: "Perché a fine giornata prendi decisioni che poi rimpiangi",
      principle: "L'energia non è infinita. Ma tu hai già la capacità di gestire come la usi.",
      sections: [
        {
          icon: "🔋",
          title: "La Batteria del Telefono",
          content: "Il tuo telefono ha una batteria. Quando è al 5%, lo metti in carica. Non aspetti che si spenga.\n\nTu hai una batteria. Ma quando è al 5%, cosa fai?"
        },
        {
          icon: "⚠️",
          title: "Ho Imparato Nel Modo Più Impegnativo",
          content: "Ho imparato questa lezione in modo impegnativo.\n\nPer anni ho creduto che «dare tutto» significasse non fermarsi mai.\n\nIl risultato?\nDecisioni poco lucide prese quando ero esausto.\nRelazioni che ne hanno risentito perché non avevo energie.\nErrori che hanno avuto conseguenze per anni.\n\nL'energia non è infinita. Ma il modo in cui la usi può essere gestito con consapevolezza."
        },
        {
          icon: "⚡",
          title: "Due Tipi di Attività",
          content: "Ci sono due tipi di attività:\n\n1. ATTIVITÀ CHE CARICANO\nDopo averle fatte, hai più energia di prima.\n\n2. ATTIVITÀ CHE SCARICANO\nDopo averle fatte, hai meno energia.\n\nLa chiave non è eliminare le attività che scaricano. È bilanciarle con quelle che caricano.\n\nE soprattutto: evitare di prendere decisioni importanti quando la batteria è al 5%.\n\nHai già questa capacità di discernimento. Si tratta solo di attivarla con consapevolezza."
        }
      ],
      exercise: {
        instruction: "Potresti fare una lista di attività che ti caricano e che ti scaricano.",
        steps: [
          "Potresti annotare 3 attività che ti CARICANO (cose dopo cui ti senti meglio di prima)",
          "Potresti annotare 3 attività che ti SCARICANO (cose dopo cui ti senti svuotato)",
          "Questa settimana, potresti aggiungere UNA attività che carica",
          "Senza togliere niente. Solo aggiungere"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "L'energia non è infinita. Ma tu hai già la capacità di gestire come la usi.",
      openLoop: "Non esiste un modello unico di leader. Domani scopriamo il TUO."
    },
    6: {
      title: "Il Tuo Modo",
      subtitle: "Hai già un modo di guidare che funziona — è il tuo",
      emailSubject: "Freddie Mercury e Lucio Battisti",
      principle: "Non esiste UN modo giusto di essere leader. Hai già il tuo — si tratta di riconoscerlo.",
      sections: [
        {
          icon: "🎵",
          title: "Freddie Mercury e Lucio Battisti",
          content: "Erano entrambi grandi. Ma cantavano in modi completamente diversi.\n\nSe Battisti avesse cercato di cantare come Mercury, sarebbe stato fuori luogo.\n\nE viceversa."
        },
        {
          icon: "🪞",
          title: "Ho Cercato Di Essere Come Loro",
          content: "Per anni ho cercato di essere un leader «come quelli che leggevo nei libri».\n\nCarismatico. Estroverso. Sempre sul palco.\n\nIl punto? Non corrisponde a come sono.\n\nSono riflessivo. Preferisco le conversazioni piccole. Mi esprimo meglio scrivendo che parlando.\n\nQuando ho smesso di copiare e ho iniziato a usare il MIO modo, tutto è cambiato."
        },
        {
          icon: "🎯",
          title: "Non Esiste Un Modo Giusto",
          content: "Esistono leader introversi e estroversi.\nLeader analitici e intuitivi.\nLeader che parlano molto e leader che ascoltano.\n\nL'errore non è avere un certo stile. È cercare di averne un altro.\n\nTu hai già il tuo modo. Si tratta solo di riconoscerlo e usarlo con consapevolezza."
        }
      ],
      exercise: {
        instruction: "Potresti identificare il tuo modo naturale di guidare.",
        steps: [
          "Potresti pensare a un momento in cui hai guidato qualcuno E HA FUNZIONATO",
          "Non un momento da manuale. Un momento VERO",
          "Come stavi? Cosa facevi?",
          "Qual era il TUO modo in quel momento?",
          "Se vuoi, annotalo. Quello è il tuo punto di partenza"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Non esiste UN modo giusto di essere leader. Hai già il tuo — si tratta di riconoscerlo.",
      openLoop: "Domani è l'ultimo giorno della Challenge. Ma non è una fine — è un inizio."
    },
    7: {
      title: "E Adesso?",
      subtitle: "La leadership che cerchi è già dentro di te",
      emailSubject: "Hai già tutto. Ora puoi vederlo.",
      principle: "Solo la competenza e il saper coinvolgere le persone AL LIVELLO in cui si trovano è ciò che funziona davvero.",
      sections: [
        {
          icon: "💡",
          title: "Il Momento In Cui Tutto È Cambiato",
          content: "Ti ho raccontato di cabine telefoniche, parabrezza sporchi, batterie scariche.\n\nMa non ti ho ancora raccontato il momento in cui tutto è cambiato per me.\n\nFino ai 50 anni ero convinto che le persone potessero essere coinvolte con la sola passione.\n\nPoi mi illusi di poterle coinvolgere con l'autorità.\n\nInfine compresi:\n\nSolo la competenza e il saper coinvolgere le persone AL LIVELLO in cui si trovano è ciò che funziona davvero."
        },
        {
          icon: "📋",
          title: "Cosa Hai Visto Questa Settimana",
          content: "Questa settimana hai visto:\n\n- Che «qualcosa non funziona» è un segnale, non un difetto — e hai già la capacità di percepirlo\n- Che c'è una voce che sminuisce — e hai la capacità di riconoscerla\n- Che la lucidità è una scelta — e l'hai già fatta altre volte\n- Che il coraggio è agire CON la paura — e l'hai già fatto\n- Che l'energia va gestita — e hai già questa capacità\n- Che il TUO modo è l'unico che funziona per te — e lo possiedi già"
        },
        {
          icon: "🎯",
          title: "Cosa Succede Adesso?",
          content: "Hai due possibilità:\n\n1. CONTINUA DA SOLO\nHai gli strumenti. Puoi applicarli quando vuoi. Nessun obbligo, nessun costo.\n\n2. APPROFONDISCI\nSe desideri una mappa più completa, ho creato qualcosa che potrebbe interessarti.\n\nÈ un percorso di 72 domande che esplora 24 capacità di leadership.\n\nNon ti dice cosa TI MANCA. Ti mostra cosa HAI GIÀ — e dove puoi espanderti se lo desideri.\n\nSi chiama Assessment Leadership Autentica."
        }
      ],
      exercise: {
        instruction: "Potresti scegliere come desideri continuare da qui.",
        steps: [
          "Qualunque cosa tu scelga, c'è qualcosa da ricordare:",
          "La leadership che cerchi è già dentro di te",
          "Questa settimana hai iniziato a vederla",
          "Puoi continuare a riconoscerla, se lo desideri"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "La leadership che cerchi è già dentro di te.",
      openLoop: ""
    }
  },

  // =====================================================
  // OLTRE GLI OSTACOLI - 7 giorni
  // Revisione: FASE 3 (AVERE) → FASE 2 (AGENCY) → FASE 1 (ITALIANO)
  // =====================================================
  ostacoli: {
    1: {
      title: "Le Prove Che Sai Già",
      subtitle: "Hai già risolto problemi difficili. Questa capacità è tua.",
      emailSubject: "Un problema che hai già risolto",
      principle: "Hai già risolto problemi difficili. Questa capacità è tua — l'hai dimostrato.",
      sections: [
        {
          icon: "🤔",
          title: "Prima Di Leggere Oltre",
          content: "Potresti pensare a un problema che hai risolto nella tua vita.\n\nUno vero. Uno difficile. Uno che sembrava impossibile finché non l'hai risolto.\n\nCe l'hai?\n\nBene.\n\nQuel problema è la PROVA che hai la capacità di risolvere problemi."
        },
        {
          icon: "💡",
          title: "Sembra Ovvio, Ma Non Lo È",
          content: "Quando siamo alle prese con qualcosa, tendiamo a dimenticare tutto ciò che abbiamo già fatto.\n\nCi sembra di non essere capaci.\nCi sembra di non avere gli strumenti.\nCi sembra che QUESTA volta sia diverso.\n\nMa la realtà è un'altra:\n\nHai già risolto problemi difficili. Questa capacità è tua.\n\nIl punto è: come attivarla consapevolmente?"
        },
        {
          icon: "📖",
          title: "50 Anni di Problemi",
          content: "In 50 anni di imprenditoria ho affrontato crisi finanziarie, conflitti con soci, clienti che sparivano, collaboratori che tradivano.\n\nOgni volta sembrava impossibile.\nOgni volta pensavo «questa è diversa».\nOgni volta, alla fine, l'ho risolta.\n\nNon perché sia speciale. Perché ho imparato a vedere cosa stavo già facendo quando funzionava.\n\nQuesta settimana vedremo come attivare questa capacità che hai già."
        }
      ],
      exercise: {
        instruction: "Potresti annotare TRE problemi che hai risolto nella tua vita.",
        steps: [
          "Con carta e penna, se preferisci",
          "Potresti annotare TRE problemi che hai risolto nella tua vita",
          "Possono essere di lavoro o personali",
          "Per ognuno, potresti scrivere in una riga: qual era il problema e come l'hai risolto",
          "Non serve che siano soluzioni «eleganti». Basta che abbiano funzionato"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Hai già risolto problemi difficili. Questa capacità è tua — l'hai dimostrato.",
      openLoop: "Domani vedremo il primo dei 3 Filtri: come vedere SCHEMI invece di rincorrere sintomi."
    },
    2: {
      title: "Il Filtro degli Schemi",
      subtitle: "Hai già la capacità di vedere schemi — si tratta di attivarla",
      emailSubject: "Il rubinetto che perde (e cosa c'entra con i tuoi problemi)",
      principle: "Rincorrere sintomi consuma energia. Vedere schemi la libera. Hai già questa capacità.",
      sections: [
        {
          icon: "🚰",
          title: "Il Rubinetto Che Perde",
          content: "Ogni giorno metti uno straccio sotto.\nOgni sera lo strizzi.\nOgni mattina ricomincia.\n\nDopo un mese, la stanchezza aumenta.\nPensi: «Questo rubinetto mi sta facendo impazzire.»\n\nMa il rubinetto non è il problema. È il SINTOMO.\n\nIl problema è la guarnizione consumata.\nFinché non la vedi, continuerai a strizzare stracci."
        },
        {
          icon: "🔍",
          title: "Il PRIMO FILTRO: Vedere SCHEMI",
          content: "La maggior parte delle persone rincorre sintomi invece di vedere schemi.\n\n«Il team non rispetta le scadenze» → sintomo\n«Le scadenze slittano sempre quando aspettiamo approvazioni esterne» → schema\n\n«I clienti si lamentano» → sintomo\n«I clienti si lamentano sempre dopo la stessa fase del progetto» → schema\n\n«Non ho tempo» → sintomo\n«Perdo tempo sempre sulle stesse cose» → schema\n\nHai già questa capacità di vedere schemi. L'hai usata ogni volta che hai risolto un problema."
        },
        {
          icon: "📋",
          title: "La Tessera Ristoranti - 1993",
          content: "Nel 1993 ho lanciato un progetto che sembrava perfetto. Una tessera per sconti nei ristoranti.\n\nIl sintomo era: «I ristoranti non aderiscono.»\nLo schema era: «Nessuno ha chiesto questa soluzione.»\n\nSe avessi visto lo schema prima, avrei risparmiato mesi."
        }
      ],
      exercise: {
        instruction: "Potresti cercare lo schema che si ripete in una situazione attuale.",
        steps: [
          "Riprendi i 3 problemi di ieri",
          "Per ognuno, potresti chiederti: «Quale SCHEMA si ripeteva?»",
          "Senza cercare la risposta perfetta",
          "Cercando qualcosa che si ripeteva",
          "Potresti annotare: «Lo schema era: ____________»"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Rincorrere sintomi consuma energia. Vedere schemi la libera. Hai già questa capacità.",
      openLoop: "A volte lo schema è nascosto dietro ciò che le persone NON dicono."
    },
    3: {
      title: "Il Filtro dei Segnali",
      subtitle: "Hai già la capacità di leggere ciò che non viene detto",
      emailSubject: "Cosa significa davvero \"Ci penso\"",
      principle: "I segnali sono ciò che non viene detto. Hai già la capacità di leggerli — si tratta di affinarla.",
      sections: [
        {
          icon: "🗣️",
          title: "«Interessante, Ci Penso»",
          content: "Quando qualcuno ti dice «Interessante, ci penso», cosa significa davvero?\n\nNella mia esperienza, quasi sempre significa: «No, ma non voglio dirtelo in faccia.»\n\nQuesto è il SECONDO FILTRO: leggere SEGNALI.\n\nI segnali sono ciò che non viene detto. Sono nei toni, nei tempi, nelle omissioni."
        },
        {
          icon: "📡",
          title: "Alcuni Segnali Comuni",
          content: "«Interessante» = Non mi interessa\n«Ne parliamo» = Non ne parleremo\n«Devo pensarci» = Ho già deciso (no)\n«Fammi sapere» = Non ti richiamerò\nRisposta dopo 3 giorni = Non sei una priorità\n\nNon sono regole assolute. Ma riconoscerli può risparmiare tempo e frustrazioni."
        },
        {
          icon: "📋",
          title: "Tutti Mi Dicevano «Interessante»",
          content: "Nel 1993, quando chiamavo i ristoranti per proporre la mia tessera, tutti mi dicevano «Interessante!».\n\nIo pensavo: «Fantastico, gli piace!»\n\nNessuno mi richiamava. Nessuno firmava.\n\nIl segnale era chiaro: cortesia, non interesse.\n\nSe avessi saputo leggerlo, avrei cambiato approccio dopo la prima settimana. Non dopo tre mesi.\n\nHai già questa capacità di leggere segnali — si tratta di attivarla consapevolmente."
        }
      ],
      exercise: {
        instruction: "Potresti analizzare i segnali in una situazione attuale.",
        steps: [
          "Potresti pensare a una situazione attuale in cui aspetti una risposta da qualcuno",
          "Potresti chiederti: 1. Cosa mi ha DETTO esattamente?",
          "2. Cosa NON ha detto?",
          "3. Com'era il TONO?",
          "4. Quanto tempo ha impiegato a rispondere?",
          "5. Se dovessi scommettere: qual è la verità che non mi sta dicendo?"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "I segnali sono ciò che non viene detto. Hai già la capacità di leggerli — si tratta di affinarla.",
      openLoop: "A volte non agiamo perché pensiamo di non avere ciò che serve. Ma spesso lo abbiamo già."
    },
    4: {
      title: "Il Filtro delle Risorse",
      subtitle: "Hai già più risorse di quelle che vedi",
      emailSubject: "Il frigo che sembra vuoto (ma non lo è)",
      principle: "Le risorse sono ciò che HAI GIÀ ma che a volte non vedi. Questa capacità di vederle è già tua.",
      sections: [
        {
          icon: "🍳",
          title: "Il Frigo Che Sembra Vuoto",
          content: "Conosci quella sensazione quando apri il frigo e pensi «Non c'è niente da mangiare»?\n\nPoi qualcuno arriva, guarda lo stesso frigo, e in 10 minuti prepara una cena.\n\nStesso frigo. Stessi ingredienti. Risultato diverso.\n\nLa questione non era il frigo. Era come lo guardavi."
        },
        {
          icon: "🔍",
          title: "Il TERZO FILTRO: Trovare RISORSE",
          content: "Le risorse sono ciò che HAI GIÀ ma che a volte non vedi.\n\nNon parlo solo di soldi o strumenti. Parlo di:\n\n• Persone che conosci e potrebbero aiutarti\n• Cose già fatte che potresti riutilizzare\n• Competenze che hai e che a volte sottovaluti\n• Tempo che potresti recuperare\n• Informazioni che hai già raccolto"
        },
        {
          icon: "📋",
          title: "Non Ho Visto Queste Risorse",
          content: "Nel 1993, quando il progetto tessera non andava come speravo, pensavo: «Non ho budget per il marketing.»\n\nAvevo ragione: non avevo budget.\n\nMa avevo:\n• Una lista di 200 ristoratori che avevo già contattato\n• Competenze di vendita telefonica (le stavo usando in modo poco efficace, ma le avevo)\n• Un amico che lavorava in un giornale locale\n\nNon vidi queste risorse. Vidi solo ciò che mi sembrava mancare.\n\nHai già più risorse di quelle che vedi. La capacità di vederle è già tua."
        }
      ],
      exercise: {
        instruction: "Potresti fare l'inventario delle risorse non immediatamente visibili per un problema attuale.",
        steps: [
          "Prendi un problema attuale",
          "Potresti fare l'inventario delle risorse che forse non hai considerato:",
          "1. Persone: Chi conosco che potrebbe aiutarmi? (Anche indirettamente)",
          "2. Cose già fatte: Cosa ho già fatto che potrei riutilizzare o adattare?",
          "3. Competenze: Cosa so fare che potrebbe servire qui?",
          "Potresti annotare almeno 3 risorse non ovvie"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Le risorse sono ciò che HAI GIÀ ma che a volte non vedi. Questa capacità di vederle è già tua.",
      openLoop: "I 3 Filtri (Schema, Segnali, Risorse) funzionano meglio insieme. Domani: il Metodo 5 Minuti."
    },
    5: {
      title: "Il Metodo 5 Minuti",
      subtitle: "Hai già tutti gli strumenti — ora li usi insieme",
      emailSubject: "Il problema che ti blocca ha una soluzione in 5 minuti",
      principle: "Un'azione imperfetta è meglio di un'analisi infinita. Hai già la capacità di agire — il metodo la attiva.",
      sections: [
        {
          icon: "🧩",
          title: "I 3 Strumenti Insieme",
          content: "Nei giorni scorsi hai visto 3 strumenti:\n\n1. Vedere SCHEMI (Giorno 2)\n2. Leggere SEGNALI (Giorno 3)\n3. Trovare RISORSE (Giorno 4)\n\nOggi li mettiamo insieme."
        },
        {
          icon: "⏱️",
          title: "Il METODO 5 MINUTI",
          content: "Quando hai un problema, potresti impostare un timer a 5 minuti.\n\nMINUTO 1-2: SCHEMA\nDomanda: «Quale schema si ripete?»\nAnnota: «Lo schema è: ____________»\n\nMINUTO 2-3: SEGNALI\nDomanda: «Cosa non viene detto?»\nAnnota: «I segnali indicano che: ____________»\n\nMINUTO 3-4: RISORSE\nDomanda: «Cosa ho già che posso usare?»\nAnnota: «Le risorse sono: ____________»\n\nMINUTO 4-5: AZIONE\nDomanda: «Qual è UNA cosa che posso fare entro domani?»\nAnnota: «La mia prossima azione è: ____________»\n\nQuando il timer suona, puoi fermarti. Hai ciò che ti serve."
        },
        {
          icon: "📋",
          title: "Esempio Compilato",
          content: "Problema: Il team non rispetta le scadenze\n\nSchema: «Il ritardo inizia sempre quando aspettiamo approvazioni esterne»\n\nSegnali: «Il cliente probabilmente è oberato e non riesce a rispondere in tempo»\n\nRisorse: «Ho il numero diretto del project manager del cliente, mai usato»\n\nAzione: «Domani chiamo il PM per proporre un calendario di approvazioni»\n\nNOTA IMPORTANTE: Se il timer suona e non hai finito, puoi comunque passare all'AZIONE.\nUn'azione imperfetta è meglio di un'analisi infinita."
        }
      ],
      exercise: {
        instruction: "Potresti applicare il Metodo 5 Minuti completo a un problema attuale.",
        steps: [
          "Scegli un problema attuale",
          "Imposta il timer a 5 minuti",
          "Compila la scheda: Schema → Segnali → Risorse → Azione",
          "Quando il timer suona, puoi fermarti"
        ],
        duration: "5 minuti esatti"
      },
      keyTakeaway: "Un'azione imperfetta è meglio di un'analisi infinita. Hai già la capacità di agire — il metodo la attiva.",
      openLoop: "A volte il problema non è fuori. È una voce dentro che ci rallenta."
    },
    6: {
      title: "I 3 Traditori",
      subtitle: "Riconoscerli è già avere potere su di loro",
      emailSubject: "La voce che ti ferma prima di iniziare",
      principle: "I traditori perdono forza quando li riconosci. Hai già la capacità di riconoscerli.",
      sections: [
        {
          icon: "❓",
          title: "Hai Fatto L'Azione?",
          content: "Ieri hai compilato la scheda del Metodo 5 Minuti.\n\nHai fatto l'azione che avevi scritto?\n\nSe sì: ottimo, puoi passare al Giorno 7.\nSe non ancora: continua a leggere.\n\nA volte vediamo lo schema, i segnali e le risorse — ma restiamo fermi.\n\nIn quel caso il problema non è fuori. È una voce dentro che ci rallenta.\n\nNel libro «Oltre gli Ostacoli» li chiamo i 3 TRADITORI SILENZIOSI.\n\nSi chiamano così perché si travestono da prudenza e saggezza."
        },
        {
          icon: "🎭",
          title: "I 3 Traditori",
          content: "IL PARALIZZANTE\nCosa dice: «Devo avere tutte le informazioni prima di agire»\nCome si traveste: Prudenza, analisi accurata\n\nIL TIMOROSO\nCosa dice: «È meglio non agire che agire e sbagliare»\nCome si traveste: Pensiero strategico\n\nIL PROCRASTINATORE\nCosa dice: «Devo aspettare il momento perfetto»\nCome si traveste: Timing intelligente"
        },
        {
          icon: "💡",
          title: "Sembrano Ragionevoli",
          content: "Chi non vorrebbe avere tutte le informazioni?\nChi non vorrebbe evitare errori?\nChi non vorrebbe il momento perfetto?\n\nMa osservando meglio:\n\nIl momento perfetto non arriva mai.\nLe informazioni non sono mai «tutte».\nE non agire È GIÀ una scelta con conseguenze.\n\nCOME NEUTRALIZZARLI:\n\nIl potere dei traditori sta nel fatto che non li riconosciamo.\n\nSe li smascheriamo — se diciamo «Ah, sei tu che mi rallenti» — perdono metà della forza.\n\nA quel punto possiamo SCEGLIERE se crederci o no.\n\nHai già la capacità di riconoscerli. Questo esercizio la attiva."
        }
      ],
      exercise: {
        instruction: "Potresti identificare quale Traditore ti ha rallentato e rispondergli.",
        steps: [
          "Riprendi l'azione di ieri che non hai ancora fatto",
          "Potresti chiederti: «Quale credenza mi ha fermato?»",
          "Identifica il Traditore: Paralizzante, Timoroso, o Procrastinatore",
          "Potresti rispondere: «Ti ho riconosciuto, [nome]. Ma la realtà è: [il contrario della credenza].»",
          "E fare l'azione PRIMA di sera, se lo desideri"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "I traditori perdono forza quando li riconosci. Hai già la capacità di riconoscerli.",
      openLoop: "Domani è l'ultimo giorno. Vedremo come continuare da solo."
    },
    7: {
      title: "E Adesso?",
      subtitle: "Il risolutore che cerchi è già dentro di te",
      emailSubject: "I problemi non finiranno. Ma tu sarai diverso.",
      principle: "I problemi arriveranno sempre. La capacità di affrontarli è già tua.",
      sections: [
        {
          icon: "💡",
          title: "La Cosa Più Importante",
          content: "Ti ho raccontato di tessere ristoranti, rubinetti che perdono, frigo vuoti.\n\nMa non ti ho ancora raccontato la cosa più importante che ho compreso sui problemi.\n\nQuando entri in un'attività, vale la pena prepararsi al fatto che le cose non andranno sempre lisce.\n\nQuesto non è pessimismo. È realismo.\n\nI problemi arriveranno. Sempre.\n\nLa domanda non è «come evitarli». La domanda è «come affrontarli quando arrivano».\n\nE tu hai già questa capacità."
        },
        {
          icon: "📋",
          title: "Cosa Hai Costruito Questa Settimana",
          content: "| Giorno | Strumento |\n|--------|-----------|\n| 1 | Le PROVE che sai già risolvere — capacità tua |\n| 2 | Il Filtro degli SCHEMI — capacità tua |\n| 3 | Il Filtro SEGNALI — capacità tua |\n| 4 | Il Filtro RISORSE — capacità tua |\n| 5 | Il METODO 5 MINUTI — strumento che attiva le tue capacità |\n| 6 | I 3 TRADITORI — e come riconoscerli |\n\nQuesti strumenti non scadono. Puoi usarli su qualsiasi problema, per sempre."
        },
        {
          icon: "🎯",
          title: "Cosa Succede Adesso?",
          content: "LA CHIAVE PER MANTENERLI ATTIVI:\n\nGli strumenti si arrugginiscono se non li usi.\n\nNon serve usarli ogni giorno. Ma quando arriva un problema vero, puoi tirare fuori il Metodo 5 Minuti.\n\nUso frequente = rafforzamento\nNon uso = indebolimento\n\nHai due possibilità:\n\n1. CONTINUA DA SOLO\nHai gli strumenti. Puoi applicarli quando serve.\n\n2. APPROFONDISCI\nL'Assessment Risolutore esplora quanto usi i 3 Filtri, quanto ti rallentano i 3 Traditori, e a che livello ti trovi sulla Scala del Risolutore.\n\nQualunque cosa tu scelga, ricorda:\n\nIl risolutore che cerchi è già dentro di te."
        }
      ],
      exercise: {
        instruction: "Potresti decidere come desideri continuare.",
        steps: [
          "Potresti annotare: «Il prossimo problema che affronterò con il metodo è: ___»",
          "Decidi quando usare il metodo (suggerimento: ogni settimana su un problema)",
          "Ricorda: Il risolutore che cerchi è già dentro di te",
          "Puoi continuare a usare questa capacità"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Il risolutore che cerchi è già dentro di te.",
      openLoop: ""
    }
  },

  // =====================================================
  // MICROFELICITÀ - 7 giorni
  // Revisione: FASE 3 (AVERE) → FASE 2 (AGENCY) → FASE 1 (ITALIANO)
  // =====================================================
  microfelicita: {
    1: {
      title: "Il Primo Inventario",
      subtitle: "La capacità di notare il positivo è già tua",
      emailSubject: "Quanti momenti positivi hai avuto ieri? (La risposta ti sorprenderà)",
      principle: "Non è che non ti accada niente di positivo. Hai già la capacità di notarlo — il cervello è programmato per dare priorità ai problemi, ma puoi ricalibrarlo.",
      sections: [
        {
          icon: "📖",
          title: "La Mia Storia",
          content: "Per nove anni — dal 1973 al 1982 — ho cercato il benessere nei posti sbagliati.\n\nSaltavo da un'esperienza all'altra, da un gruppo all'altro, sempre convinto che la felicità fosse nel prossimo evento, nella prossima persona, nel prossimo traguardo.\n\nA fine giornata pensavo sempre: «Oggi niente di speciale.»\n\nNon era vero. Ogni giorno mi attraversavano decine di piccoli momenti positivi. Non li vedevo perché nessuno mi aveva mostrato come notarli."
        },
        {
          icon: "🧠",
          title: "Perché È Così",
          content: "Il cervello umano ha un «filtro della sopravvivenza» che dà priorità ai problemi:\n\n• I nostri antenati che notavano i pericoli sopravvivevano\n• Quelli distratti avevano meno probabilità di sopravvivere\n\nRisultato oggi: notiamo 10 cose negative e solo 2-3 delle 50 positive.\n\nNon è un difetto. È un'impostazione di fabbrica.\n\nMa puoi ricalibrare il filtro. È ciò che faremo in 7 giorni.\n\nHai già questa capacità. Si tratta solo di attivarla."
        }
      ],
      exercise: {
        instruction: "Stasera, prima di dormire, potresti trovare 3 momenti piacevoli della giornata.",
        steps: [
          "Stasera, prima di dormire, ripensa alla tua giornata",
          "Potresti trovare 3 momenti che sono stati piacevoli, anche minimamente",
          "Non serve che siano «speciali» o «importanti»",
          "Basta che siano stati piacevoli, anche solo un po'",
          "Puoi annotarli. Se ne trovi 1 o 2, va benissimo"
        ],
        duration: "3 minuti"
      },
      keyTakeaway: "La capacità di notare il positivo è già tua. Il cervello è programmato per dare priorità ai problemi, ma puoi ricalibrarlo.",
      openLoop: "Perché 50 momenti piccoli battono 4 momenti grandi — e come questo cambia tutto."
    },
    2: {
      title: "La Matematica",
      subtitle: "Hai già accesso a 18.000 opportunità all'anno",
      emailSubject: "Ho fatto i conti. Ecco perché stai perdendo 18.000 opportunità all'anno.",
      principle: "Se aspetti i momenti grandi, hai 4 occasioni all'anno. Se noti i piccoli, hai 18.000. Hai già la capacità di notarli.",
      sections: [
        {
          icon: "🔢",
          title: "Ecco I Numeri",
          content: "| Tipo di momento | Frequenza | Totale annuo |\n|-----------------|-----------|---------------|\n| Grandi (vacanza, promozione, evento) | 3-4 all'anno | ~4 |\n| Piccoli (se li noti) | 50+ al giorno | ~18.000 |\n\nRapporto: 1 a 4.500.\n\nSe il benessere dipende solo dai momenti grandi, il gioco diventa difficile."
        },
        {
          icon: "🧠",
          title: "C'È Un Altro Aspetto",
          content: "I momenti grandi hanno un effetto che diminuisce nel tempo:\n\n• Giorno 1 della vacanza: Felicità alta\n• Giorno 7: Ti sei abituato\n• 1 mese dopo: È come se non fosse mai successo\n\nIl cervello si abitua a tutto — anche alle cose belle. È fatto così: dopo un po', il «nuovo» diventa «normale».\n\nI momenti piccoli non hanno questo problema. Ogni momento piccolo è nuovo. Non c'è tempo per abituarsi.\n\nHai già accesso a questi 18.000 momenti. Si tratta di notarli."
        }
      ],
      exercise: {
        instruction: "Potresti confrontare un momento grande con un momento piccolo di oggi.",
        steps: [
          "Potresti pensare all'ultimo momento «grande» che hai vissuto (vacanza, traguardo, evento speciale)",
          "Annota: Cos'era, quanto tempo fa, quanto ti fa stare bene ADESSO (1-10)",
          "Potresti pensare a un momento piccolo piacevole di OGGI",
          "Annota: Cos'era, quanto ti ha fatto stare bene IN QUEL MOMENTO (1-10)",
          "Confronta. Il momento grande probabilmente non ha più molto effetto oggi"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Se aspetti i momenti grandi, hai 4 occasioni all'anno. Se noti i piccoli, hai 18.000. Hai già la capacità di notarli.",
      openLoop: "Il valore di notare i momenti positivi «mentre succedono» — e come intercettarli in tempo reale."
    },
    3: {
      title: "Intercettare In Tempo Reale",
      subtitle: "Hai già la capacità di essere presente — si tratta di attivarla",
      emailSubject: "Il trucco che cambia tutto: notare MENTRE succede",
      principle: "Notare un momento positivo 10 ore dopo ha 1/10 dell'effetto di notarlo mentre accade. Hai già la capacità di essere presente.",
      sections: [
        {
          icon: "📸",
          title: "La Questione Del «Dopo»",
          content: "Ieri ti ho proposto di ripensare alla giornata e trovare momenti positivi.\n\nFunziona come esercizio iniziale.\n\nMa c'è una questione: quando notiamo qualcosa di positivo «dopo», l'effetto è ridotto.\n\nQuando viviamo un momento piacevole e non lo notiamo:\n• Dura 1-2 secondi\n• Il cervello lo cataloga come «niente di speciale»\n• A fine giornata, richiede sforzo per ricordarlo\n\nQuando lo notiamo MENTRE accade:\n• Lo «catturiamo» nel momento\n• Il cervello lo registra come significativo\n• L'effetto si amplifica\n\nÈ la differenza tra guardare una foto e essere lì."
        },
        {
          icon: "⭐",
          title: "Come Vedere Una Stella Cadente",
          content: "Se guardi il cielo e la noti mentre passa: un momento speciale.\n\nSe qualcuno ti dice «mezz'ora fa c'è stata una stella cadente»: interessante, ma non è la stessa esperienza.\n\nI momenti positivi funzionano così. Coglierli mentre accadono fa la differenza.\n\nHai già questa capacità di essere presente. L'hai usata molte volte."
        }
      ],
      exercise: {
        instruction: "Oggi potresti intercettare 3 momenti piacevoli MENTRE succedono.",
        steps: [
          "Oggi l'obiettivo è intercettare 3 momenti piacevoli MENTRE succedono — non stasera a memoria",
          "Quando succede qualcosa di piacevole (anche minimo):",
          "• Fermati mentalmente per 3 secondi",
          "• Di' a te stesso: «Questo. Proprio questo.»",
          "• Senza analizzare. Solo notare",
          "Alla sera, puoi contare: quanti ne hai intercettati in tempo reale?"
        ],
        duration: "3 secondi per volta, durante la giornata"
      },
      keyTakeaway: "Notare un momento positivo 10 ore dopo ha 1/10 dell'effetto di notarlo mentre accade. Hai già la capacità di essere presente.",
      openLoop: "Un metodo strutturato in 5 passi per fare questo — ogni volta, in modo affidabile."
    },
    4: {
      title: "Il Metodo R.A.D.A.R.",
      subtitle: "Uno strumento che attiva la capacità che hai già",
      emailSubject: "Il trucco dei 10 secondi",
      principle: "R.A.D.A.R. = Rileva → Accogli → Distingui → Amplifica → Resta. Cinque passi, 10 secondi. Attiva la capacità che hai già.",
      sections: [
        {
          icon: "📡",
          title: "Perché Serve Un Metodo",
          content: "Ieri ti ho proposto di intercettare momenti in tempo reale.\n\nSe ci sei riuscito: ottimo, hai già la base.\n\nSe hai avuto difficoltà: è comprensibile. Senza un metodo strutturato, il cervello torna alle sue abitudini automatiche.\n\nR.A.D.A.R. è il metodo.\n\nÈ semplice — così semplice che puoi usarlo quando vuoi."
        },
        {
          icon: "🎯",
          title: "I 5 Passi",
          content: "| Lettera | Significato | Cosa Fai | Tempo |\n|---------|-------------|----------|-------|\n| R | Rileva | Noti che sta succedendo qualcosa di piacevole | 1-2 sec |\n| A | Accogli | Lasci che la sensazione arrivi senza giudicarla | 1-2 sec |\n| D | Distingui | Ti chiedi: «Questo mi nutre?» | 1-2 sec |\n| A | Amplifica | Mantieni l'attenzione per qualche secondo in più | 3-5 sec |\n| R | Resta | Lasci che il focus si ritiri naturalmente | 2 sec |\n\nTempo totale: ~10 secondi."
        },
        {
          icon: "💡",
          title: "Semplice — E Funziona",
          content: "La semplicità è il punto: deve essere così facile da poterlo fare davvero.\n\n1. RILEVA: Il tuo radar interno si accorge che qualcosa di piacevole sta succedendo.\n\n2. ACCOGLI: Senza pensare «che stupidaggine». Lascia che la sensazione arrivi.\n\n3. DISTINGUI: «Questo mi avvicina al benessere?»\n\n4. AMPLIFICA: Invece di passare al prossimo pensiero, resta con la sensazione per 5 secondi.\n\n5. RESTA: Senza fare nulla per 2 secondi. Questo stabilizza l'esperienza nella memoria.\n\nHai già la capacità di fare questo. Il metodo la struttura."
        }
      ],
      exercise: {
        instruction: "Potresti applicare R.A.D.A.R. a 3 occasioni specifiche oggi.",
        steps: [
          "OCCASIONE 1: Il primo caffè/tè della giornata — applica R.A.D.A.R.",
          "OCCASIONE 2: Un momento di silenzio/pausa — applica R.A.D.A.R.",
          "OCCASIONE 3: Qualsiasi momento a tua scelta — applica R.A.D.A.R.",
          "Alla sera, potresti annotare: Quante volte l'ho fatto? È stato facile o difficile?"
        ],
        duration: "30 secondi totali, distribuiti"
      },
      keyTakeaway: "R.A.D.A.R. = Rileva → Accogli → Distingui → Amplifica → Resta. Cinque passi, 10 secondi. Attiva la capacità che hai già.",
      openLoop: "Non tutte le microfelicità sono uguali. Scopri le 3 forme — e qual è il tuo mix preferito."
    },
    5: {
      title: "Le 3 Forme",
      subtitle: "Hai già il tuo mix preferito — si tratta di riconoscerlo",
      emailSubject: "Visiva, sensoriale o mentale: tu quale sei?",
      principle: "Esistono 3 tipi di microfelicità. Ognuno ha il suo «mix» preferito — tu hai già il tuo.",
      sections: [
        {
          icon: "📊",
          title: "Le 3 Forme",
          content: "| Forma | Cosa Include | Esempi |\n|-------|--------------|--------|\n| Percettiva (visiva) | Ciò che vedi | Foto che cattura l'attenzione, espressione sul volto di qualcuno, gioco di luce |\n| Sensoriale (altri sensi) | Udito, tatto, gusto, olfatto | Suono della pioggia, temperatura che dà sollievo, odore che attiva un ricordo |\n| Mentale | Consapevolezza di un meccanismo | Accorgerti di un pensiero sabotante, riconoscere l'autocritica prima che ti influenzi |"
        },
        {
          icon: "🎯",
          title: "Perché Conta Saperlo",
          content: "Se sai che le tue microfelicità preferite sono PERCETTIVE, puoi creare più occasioni visive nella giornata (una pianta sulla scrivania, una foto che ami, la luce giusta).\n\nSe sono SENSORIALI, puoi investire in esperienze degli altri sensi (un tè particolare, il suono della pioggia, un tessuto piacevole).\n\nSe sono MENTALI, puoi sviluppare l'abitudine di notare i tuoi meccanismi — quando ti accorgi di un pensiero critico e lo riconosci, quella consapevolezza È una microfelicità.\n\nNon c'è un mix giusto o sbagliato. C'è il tuo mix.\n\nHai già il tuo — si tratta di riconoscerlo."
        }
      ],
      exercise: {
        instruction: "Potresti scoprire il tuo mix preferito.",
        steps: [
          "Ripensa a IERI. Potresti annotare 3 momenti positivi che hai notato",
          "Per ogni momento, indica: V (visiva), S (sensoriale), M (mentale)",
          "Il tuo mix prevalente è: ___"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Esistono 3 tipi di microfelicità. Ognuno ha il suo «mix» preferito — tu hai già il tuo.",
      openLoop: "I segnali più importanti sono spesso i più deboli. Come catturare ciò che il cervello tende a scartare."
    },
    6: {
      title: "I Segnali Deboli",
      subtitle: "Hai già la capacità di notare ciò che è sottile",
      emailSubject: "Il segnale che il tuo cervello scarta (e che vale oro)",
      principle: "I segnali più deboli sono spesso i più nutrienti. Hai già la capacità di notarli — si tratta di affinarla.",
      sections: [
        {
          icon: "📖",
          title: "Una Storia",
          content: "Su quella collinetta di Torino, nel 1975, cercavo segnali forti.\n\nVolevo esperienze intense, emozioni travolgenti, momenti indimenticabili.\n\nCiò che non vedevo erano i segnali deboli: la brezza sulla pelle, il silenzio prima dell'alba, il piacere semplice di camminare.\n\nLi scartavo perché non urlavano.\n\nHo impiegato anni per comprendere che quei segnali deboli — quelli che il cervello cataloga come «niente di speciale» — sono spesso i più nutrienti."
        },
        {
          icon: "📊",
          title: "Perché I Segnali Deboli Sono Importanti",
          content: "I segnali forti (gioia intensa, eccitazione, euforia) sono rari e consumano energia.\n\nI segnali deboli (calma sottile, soddisfazione leggera, piacere semplice) sono frequenti e non consumano nulla.\n\n| Tipo segnale | Frequenza | Energia richiesta | Durata effetto |\n|--------------|-----------|-------------------|----------------|\n| Forte | Raro | Alta | Breve (adattamento) |\n| Debole | Frequente | Zero | Stabile (no adattamento) |\n\nIl benessere sostenibile si costruisce sui segnali deboli, non su quelli forti.\n\nHai già la capacità di notarli. L'hai usata molte volte, anche senza saperlo."
        }
      ],
      exercise: {
        instruction: "Caccia al Segnale Debole — oggi potresti catturare segnali che normalmente ignoreresti.",
        steps: [
          "Oggi potresti catturare segnali DEBOLI — cose che normalmente ignoreresti completamente",
          "Esempi: La sensazione della sedia che ti sostiene, il momento tra due pensieri, l'assenza di dolore, la temperatura dell'aria, il fatto che le cose funzionano",
          "Quando noti uno di questi segnali deboli:",
          "• Senza pensare «che stupidaggine»",
          "• Applica R.A.D.A.R. come se fosse un segnale forte",
          "Alla sera, potresti contare: quanti segnali deboli hai catturato?"
        ],
        duration: "3-5 secondi per volta, durante la giornata"
      },
      keyTakeaway: "I segnali più deboli sono spesso i più nutrienti. Hai già la capacità di notarli — si tratta di affinarla.",
      openLoop: "L'ultimo giorno. Come continuare da solo — e cosa c'è oltre questa challenge."
    },
    7: {
      title: "Come Continuare",
      subtitle: "Il benessere che cerchi ti sta già attraversando",
      emailSubject: "Tra 21 giorni non dovrai più pensarci",
      principle: "Hai gli strumenti. Ora si tratta di usarli ogni giorno — finché diventano automatici. Hai già questa capacità.",
      sections: [
        {
          icon: "📋",
          title: "Cosa Hai Visto In 7 Giorni",
          content: "| Giorno | Cosa Hai Scoperto |\n|--------|-------------------|\n| 1 | I momenti positivi ci sono — hai già la capacità di notarli |\n| 2 | 50 piccoli battono 4 grandi — hai accesso a 18.000 opportunità |\n| 3 | Notare «mentre succede» vale 10 volte «dopo» — hai la capacità di essere presente |\n| 4 | R.A.D.A.R. — uno strumento che attiva ciò che hai già |\n| 5 | Esistono 3 forme — hai già il tuo mix |\n| 6 | I segnali deboli sono i più nutrienti — hai la capacità di notarli |\n| 7 | (Oggi) Come continuare |"
        },
        {
          icon: "📅",
          title: "Il Tuo Piano Autonomo",
          content: "Per rendere R.A.D.A.R. automatico, serve una cosa sola: pratica quotidiana per 21 giorni.\n\nSettimana 1-2: Aggancio a routine esistenti\nPotresti scegliere 3 momenti fissi della giornata dove applicare R.A.D.A.R.\n(Suggerimenti: primo caffè, pausa pranzo, prima di dormire)\n\nSettimana 3: Espansione\nPotresti aggiungere altri 2-3 momenti liberi durante la giornata.\n\nDopo 21 giorni:\nR.A.D.A.R. diventa semi-automatico. Non dovrai più pensarci.\n\nHai già questa capacità. Il metodo la struttura e la rafforza."
        },
        {
          icon: "🎯",
          title: "Un'Ultima Cosa",
          content: "Ricordi cosa ti ho raccontato il primo giorno?\n\nPer 9 anni ho cercato il benessere nei posti sbagliati. Ho cercato esperienze intense, momenti straordinari, persone «giuste».\n\nCiò che non vedevo era che il benessere mi attraversava ogni giorno.\n\nOra lo vedi anche tu.\n\nNon è qualcosa che devi cercare. È qualcosa che puoi notare.\n\nGrazie per aver fatto questo percorso con me."
        }
      ],
      exercise: {
        instruction: "Potresti confermare il tuo aggancio per i prossimi 21 giorni.",
        steps: [
          "Potresti annotare: «Quando ___, faccio R.A.D.A.R.»",
          "Scegli come tenere traccia (calendario, app, nota)",
          "Obiettivo: 21 giorni di fila, se lo desideri"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Il benessere che cerchi ti sta già attraversando. Ora hai gli strumenti per notarlo.",
      openLoop: ""
    }
  }
};

// Helper function per ottenere il contenuto di un giorno
export function getDayContent(challengeType: ChallengeType, dayNumber: DayNumber): DayContent | null {
  return DAY_CONTENT[challengeType]?.[dayNumber] || null;
}

// Helper function per ottenere tutti i titoli dei giorni di una challenge
export function getChallengeDayTitles(challengeType: ChallengeType): { day: DayNumber; title: string }[] {
  const challenge = DAY_CONTENT[challengeType];
  if (!challenge) return [];

  return Object.entries(challenge).map(([day, content]) => ({
    day: parseInt(day) as DayNumber,
    title: content.title
  }));
}
