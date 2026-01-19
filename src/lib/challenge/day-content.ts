// Contenuti delle Day Pages per le 3 Challenge
// 7 giorni × 3 challenge = 21 pagine
// AGGIORNATO: 15 Gennaio 2026 - Approccio Epiphany Bridge con Storie Fernando
// Conformità: MEGA_PROMPT v4.3, CONTROL_TOWER v1.2, COPY_REALIGNMENT_ANALYSIS
// Gradiente: -7 (Rovina) → -2 (Speranza)

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
  // Gradiente: -7 → -2 | Storie Fernando: EP006, EP005, Epifania competenza
  // =====================================================
  leadership: {
    1: {
      title: "Qualcosa Non Funziona",
      subtitle: "E quella sensazione è la soluzione che inizia",
      emailSubject: "Quel giorno in cabina telefonica",
      principle: "La capacità di vedere che qualcosa non va È la capacità di leadership.",
      sections: [
        {
          icon: "📞",
          title: "Febbraio 1985 - La Cabina Telefonica",
          content: "Avevo 27 anni. Ero in una cabina telefonica a Milano con l'ultimo gettone in mano.\n\nDovevo chiamare un cliente importante. Mi ero preparato un discorso pieno di passione.\n\nParlo per tre minuti. Gli racconto tutto — il progetto, il potenziale, il futuro che vedo.\n\nSilenzio.\n\nPoi lui dice: \"Senta, mi fa piacere il suo entusiasmo. Ma lei cosa sa fare CONCRETAMENTE?\"\n\nIl gettone finisce. La linea cade.\n\nQuella domanda mi ha perseguitato per anni. Non perché non sapessi rispondere — ma perché mi aveva mostrato qualcosa che non volevo vedere."
        },
        {
          icon: "💡",
          title: "Quella Sensazione Che Hai",
          content: "Oggi parliamo di QUESTO. Di quella sensazione che qualcosa non funziona.\n\nQuella sensazione che hai adesso — se stai leggendo questa email, ce l'hai.\n\nE voglio dirti una cosa importante:\n\nQuella sensazione non è il problema. È la soluzione che inizia.\n\nIl fatto che tu SENTA che qualcosa non va significa che stai già vedendo qualcosa che molti preferiscono ignorare."
        }
      ],
      exercise: {
        instruction: "Scrivi UNA situazione recente in cui hai sentito che qualcosa non funzionava.",
        steps: [
          "Prendi carta e penna",
          "Scrivi UNA situazione recente in cui hai sentito che qualcosa non funzionava",
          "Non analizzarla. Non giudicarla",
          "Scrivila e basta"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "La capacità di vedere che qualcosa non va È la capacità di leadership.",
      openLoop: "C'è qualcosa che sabota i tuoi momenti migliori. Domani vediamo cos'è."
    },
    2: {
      title: "La Voce Che Sminuisce",
      subtitle: "Finché non la riconosci, credi che sia la verità",
      emailSubject: "La voce che ti dice \"non sei abbastanza\"",
      principle: "Finché non riconosci la voce che sminuisce, credi che sia la verità.",
      sections: [
        {
          icon: "🗣️",
          title: "Cosa Ti Sei Detto Dopo?",
          content: "Ieri ti ho chiesto di scrivere una situazione in cui sentivi che qualcosa non funzionava.\n\nOggi ti chiedo: cosa ti sei detto DOPO averla scritta?\n\nScommetto una di queste:\n- \"Non dovrei sentirmi così\"\n- \"Gli altri ce la fanno, perché io no?\"\n- \"Forse non sono tagliato per questo\""
        },
        {
          icon: "📋",
          title: "Il Catalogo Moda - 1984",
          content: "Ti racconto cosa mi successe nel 1984.\n\nMi trasferii a Milano per partecipare a un progetto ambizioso: un catalogo moda innovativo. Ero INNAMORATO di quel progetto.\n\nCosì innamorato che non feci le domande elementari:\n- Chi lo comprerà?\n- Come lo distribuiremo?\n- Abbiamo le competenze per farlo?\n\nIl progetto fallì miseramente.\n\nMa la cosa peggiore non fu il fallimento. Fu la voce nella mia testa DOPO.\n\n\"Vedi? Non sei capace.\"\n\"Chi ti credi di essere?\"\n\"Meglio se ti accontenti.\"\n\nQuella voce mi ha bloccato per anni."
        },
        {
          icon: "👁️",
          title: "La Riconosci?",
          content: "Oggi parliamo di QUELLA voce.\n\nTutti ce l'hanno. La differenza è: la riconosci quando parla?\n\nPerché finché non la riconosci, credi che sia la verità."
        }
      ],
      exercise: {
        instruction: "Riprendi la situazione di ieri e scrivi cosa ti sei detto dopo.",
        steps: [
          "Riprendi la situazione di ieri",
          "Ora scrivi: cosa ti sei detto dopo?",
          "Qual è stata la \"voce\" che è arrivata?",
          "Non combatterla. Solo riconoscila"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Finché non riconosci la voce che sminuisce, credi che sia la verità.",
      openLoop: "Come fai a sapere se quello che vedi è reale o è solo la voce che distorce? Domani parliamo di lucidità."
    },
    3: {
      title: "Vedere le Cose Come Sono",
      subtitle: "La lucidità non è un dono. È una scelta.",
      emailSubject: "Il parabrezza sporco",
      principle: "La lucidità non è un dono. È la scelta di pulire il parabrezza PRIMA di decidere.",
      sections: [
        {
          icon: "🚗",
          title: "Il Parabrezza Sporco",
          content: "Hai mai guidato con il parabrezza sporco?\n\nAll'inizio non te ne accorgi. Poi il sole batte in un certo modo e improvvisamente non vedi più niente.\n\nLa strada è sempre la stessa. Ma tu non la vedi più come è."
        },
        {
          icon: "🧹",
          title: "La Voce È Come Lo Sporco",
          content: "Ieri abbiamo parlato della voce che sminuisce.\n\nQuella voce è come lo sporco sul parabrezza: si accumula piano, senza che te ne accorgi.\n\nE a un certo punto, guardi una situazione normale e vedi solo problemi."
        },
        {
          icon: "💡",
          title: "La Lucidità È Una Scelta",
          content: "La lucidità non è un dono. È una scelta.\n\nÈ la scelta di pulire il parabrezza PRIMA di prendere decisioni.\n\nCome si fa?\n\nCon una domanda semplice:\n\n\"Quello che vedo adesso — è la situazione o è la mia reazione alla situazione?\""
        }
      ],
      exercise: {
        instruction: "Riprendi la situazione del Giorno 1 e separa i fatti dalla tua interpretazione.",
        steps: [
          "Riprendi la situazione del Giorno 1",
          "Ora chiediti: Cosa SUCCEDE oggettivamente?",
          "Cosa PENSO che succeda?",
          "Sono la stessa cosa?",
          "Se noti una differenza, hai appena pulito il parabrezza"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "La lucidità non è un dono. È la scelta di pulire il parabrezza PRIMA di decidere.",
      openLoop: "Vedere chiaramente è il primo passo. Ma cosa fai quando la paura arriva?"
    },
    4: {
      title: "Agire Anche Con la Paura",
      subtitle: "Il coraggio non è assenza di paura",
      emailSubject: "La prima volta che guidi da solo",
      principle: "Il coraggio non è assenza di paura. È quello che fai MENTRE hai paura.",
      sections: [
        {
          icon: "🚗",
          title: "La Prima Volta al Volante",
          content: "Ti ricordi la prima volta che hai guidato da solo?\n\nNessun istruttore accanto. Nessuno che ti dice cosa fare. Solo tu, il volante e la strada.\n\nAvevi paura? Probabilmente sì.\nL'hai fatto comunque? Sì.\n\nQuella è la definizione di coraggio."
        },
        {
          icon: "💪",
          title: "La Paura Non Se Ne Va",
          content: "Il coraggio non è assenza di paura. È quello che fai MENTRE hai paura.\n\nDopo 50 anni di imprenditoria, ti posso dire una cosa con certezza:\n\nLa paura non se ne va. Mai.\n\nOgni volta che fai qualcosa di importante, c'è paura.\n\nLa differenza tra chi agisce e chi no non è la quantità di paura. È la relazione con la paura."
        },
        {
          icon: "⚡",
          title: "L'Errore Che Ho Fatto Per Anni",
          content: "C'è un errore che ho fatto per anni: aspettare che la paura passasse per agire.\n\nNon passa.\n\nL'unico modo per farla diminuire è agire MENTRE c'è.\n\nCome quando hai guidato da solo la prima volta: la paura è diminuita DOPO che hai guidato. Non prima."
        }
      ],
      exercise: {
        instruction: "Identifica una cosa che stai rimandando e scrivi una micro-azione da fare oggi.",
        steps: [
          "Pensa a UNA cosa che stai rimandando perché \"non è il momento giusto\"",
          "Ora chiediti: \"Se la paura non fosse un segnale di stop ma un segnale che sto per fare qualcosa di importante?\"",
          "Scrivi UNA micro-azione che potresti fare OGGI su quella cosa",
          "Non deve essere grande. Deve solo essere un inizio"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Il coraggio non è assenza di paura. È quello che fai MENTRE hai paura.",
      openLoop: "Agire con la paura richiede energia. E l'energia non è infinita."
    },
    5: {
      title: "Sapere Quando Fermarti",
      subtitle: "L'energia non è infinita. Ma il modo in cui la usi, sì.",
      emailSubject: "La batteria del telefono",
      principle: "L'energia non è infinita. Ma il modo in cui la usi, sì.",
      sections: [
        {
          icon: "🔋",
          title: "La Batteria del Telefono",
          content: "Il tuo telefono ha una batteria. Quando è al 5%, lo metti in carica. Non aspetti che si spenga.\n\nTu hai una batteria. Ma quando è al 5%, cosa fai?"
        },
        {
          icon: "⚠️",
          title: "Ho Imparato Nel Modo Più Duro",
          content: "Ho imparato questa lezione nel modo più duro.\n\nPer anni ho creduto che \"dare tutto\" significasse non fermarsi mai.\n\nIl risultato?\nDecisioni pessime prese quando ero esausto.\nRelazioni danneggiate perché non avevo energie.\nErrori che ho pagato per anni.\n\nL'energia non è infinita. Ma il modo in cui la usi, sì."
        },
        {
          icon: "⚡",
          title: "Due Tipi di Attività",
          content: "Ci sono due tipi di attività:\n\n1. ATTIVITÀ CHE CARICANO\nDopo averle fatte, hai più energia di prima.\n\n2. ATTIVITÀ CHE SCARICANO\nDopo averle fatte, hai meno energia.\n\nIl segreto non è eliminare le attività che scaricano. È bilanciarle con quelle che caricano.\n\nE soprattutto: non prendere decisioni importanti quando la batteria è al 5%."
        }
      ],
      exercise: {
        instruction: "Fai una lista di attività che ti caricano e che ti scaricano.",
        steps: [
          "Fai una lista di 3 attività che ti CARICANO (cose dopo cui ti senti meglio di prima)",
          "Fai una lista di 3 attività che ti SCARICANO (cose dopo cui ti senti svuotato)",
          "Questa settimana, aggiungi UNA attività che carica",
          "Non devi togliere niente. Solo aggiungere"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "L'energia non è infinita. Ma il modo in cui la usi, sì.",
      openLoop: "Non esiste un modello unico di leader. Domani scopriamo il TUO."
    },
    6: {
      title: "Il Tuo Modo",
      subtitle: "Non esiste UN modo giusto di essere leader",
      emailSubject: "Freddie Mercury e Lucio Battisti",
      principle: "Non esiste UN modo giusto di essere leader. L'errore è cercare di averne un altro.",
      sections: [
        {
          icon: "🎵",
          title: "Freddie Mercury e Lucio Battisti",
          content: "Erano entrambi grandi. Ma cantavano in modi completamente diversi.\n\nSe Battisti avesse cercato di cantare come Mercury, sarebbe stato ridicolo.\n\nE viceversa."
        },
        {
          icon: "🪞",
          title: "Ho Cercato Di Essere Come Loro",
          content: "Per anni ho cercato di essere un leader \"come quelli che leggevo nei libri\".\n\nCarismatico. Estroverso. Sempre sul palco.\n\nIl problema? Non sono così.\n\nSono riflessivo. Preferisco le conversazioni piccole. Mi esprimo meglio scrivendo che parlando.\n\nQuando ho smesso di copiare e ho iniziato a usare il MIO modo, tutto è cambiato."
        },
        {
          icon: "🎯",
          title: "Non Esiste Un Modo Giusto",
          content: "Esistono leader introversi e estroversi.\nLeader analitici e intuitivi.\nLeader che parlano molto e leader che ascoltano.\n\nL'errore non è avere un certo stile. È cercare di averne un altro."
        }
      ],
      exercise: {
        instruction: "Identifica il tuo modo naturale di guidare.",
        steps: [
          "Pensa a un momento in cui hai guidato qualcuno E HA FUNZIONATO",
          "Non un momento da manuale. Un momento VERO",
          "Come stavi? Cosa facevi?",
          "Qual era il TUO modo in quel momento?",
          "Scrivilo. Quello è il tuo punto di partenza"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Non esiste UN modo giusto di essere leader. L'errore è cercare di averne un altro.",
      openLoop: "Domani è l'ultimo giorno della Challenge. Ma non è una fine — è un inizio."
    },
    7: {
      title: "E Adesso?",
      subtitle: "La leadership che cerchi è già dentro di te",
      emailSubject: "Il punto di svolta",
      principle: "Solo la competenza e il saper coinvolgere le persone AL LIVELLO in cui si trovano è l'unica cosa plausibile.",
      sections: [
        {
          icon: "💡",
          title: "Il Momento In Cui Tutto È Cambiato",
          content: "Ti ho raccontato di cabine telefoniche, parabrezza sporchi, batterie scariche.\n\nMa non ti ho ancora raccontato il momento in cui tutto è cambiato per me.\n\nFino ai 50 anni ero convinto che le persone potessero essere coinvolte con la sola passione.\n\nPoi mi illusi di poterle coinvolgere con l'autorità.\n\nInfine capii:\n\nSolo la competenza e il saper coinvolgere le persone AL LIVELLO in cui si trovano è l'unica cosa plausibile."
        },
        {
          icon: "📋",
          title: "Cosa Hai Visto Questa Settimana",
          content: "Questa settimana hai visto:\n\n- Che \"qualcosa non funziona\" è un segnale, non un difetto\n- Che c'è una voce che sminuisce (e puoi riconoscerla)\n- Che la lucidità è una scelta\n- Che il coraggio è agire CON la paura\n- Che l'energia va gestita, non ignorata\n- Che il TUO modo è l'unico che funziona per te"
        },
        {
          icon: "🎯",
          title: "Cosa Succede Adesso?",
          content: "Hai due opzioni:\n\n1. CONTINUA DA SOLO\nHai gli strumenti. Puoi applicarli quando vuoi. Nessun obbligo, nessun costo.\n\n2. APPROFONDISCI\nSe vuoi una mappa più completa, ho creato qualcosa per te.\n\nÈ un test di 240 domande che misura 24 capacità di leadership.\n\nNon ti dice cosa TI MANCA. Ti dice cosa HAI GIÀ — e dove puoi espanderti di più.\n\nSi chiama Assessment Leadership Autentica."
        }
      ],
      exercise: {
        instruction: "Scegli come vuoi continuare da qui.",
        steps: [
          "Qualunque cosa tu scelga, ricorda una cosa:",
          "La leadership che cerchi è già dentro di te",
          "Questa settimana hai iniziato a vederla",
          "Non fermarti"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "La leadership che cerchi è già dentro di te.",
      openLoop: ""
    }
  },

  // =====================================================
  // OLTRE GLI OSTACOLI - 7 giorni
  // Gradiente: -7 → -2 | 3 Filtri + 3 Traditori + Metodo 5 Minuti
  // =====================================================
  ostacoli: {
    1: {
      title: "Le Prove Che Sai Già",
      subtitle: "Hai già risolto problemi difficili. Lo rifarai.",
      emailSubject: "Un problema che hai già risolto",
      principle: "Hai già risolto problemi difficili. Lo rifarai.",
      sections: [
        {
          icon: "🤔",
          title: "Prima Di Leggere Oltre",
          content: "Pensa a un problema che hai risolto nella tua vita.\n\nUno vero. Uno difficile. Uno che sembrava impossibile finché non l'hai risolto.\n\nCe l'hai?\n\nBene.\n\nQuel problema è la PROVA che sai risolvere problemi."
        },
        {
          icon: "💡",
          title: "Sembra Ovvio, Ma Non Lo È",
          content: "Quando siamo bloccati su qualcosa, dimentichiamo tutto quello che abbiamo già fatto.\n\nCi sembra di non essere capaci.\nCi sembra di non avere gli strumenti.\nCi sembra che QUESTA volta sia diverso.\n\nMa la verità è un'altra:\n\nHai già risolto problemi difficili. Lo rifarai.\n\nIl punto è: come?"
        },
        {
          icon: "📖",
          title: "50 Anni di Problemi",
          content: "In 50 anni di imprenditoria ho affrontato crisi finanziarie, conflitti con soci, clienti che sparivano, dipendenti che tradivano.\n\nOgni volta sembrava impossibile.\nOgni volta pensavo \"questa è diversa\".\nOgni volta, alla fine, l'ho risolta.\n\nNon perché sono speciale. Perché ho imparato a vedere cosa stavo già facendo quando funzionava.\n\nQuesta settimana ti mostro come."
        }
      ],
      exercise: {
        instruction: "Scrivi TRE problemi che hai risolto nella tua vita.",
        steps: [
          "Prendi carta e penna",
          "Scrivi TRE problemi che hai risolto nella tua vita",
          "Possono essere di lavoro o personali",
          "Per ognuno, scrivi in una riga: qual era il problema e come l'hai risolto",
          "Non serve che siano soluzioni \"eleganti\". Serve solo che abbiano funzionato"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Hai già risolto problemi difficili. Lo rifarai.",
      openLoop: "Domani ti mostro il primo dei 3 Filtri: come vedere SCHEMI invece di rincorrere sintomi."
    },
    2: {
      title: "Il Filtro degli Schemi",
      subtitle: "Rincorrere sintomi ti stanca. Vedere schemi ti libera.",
      emailSubject: "Il rubinetto che perde (e cosa c'entra con i tuoi problemi)",
      principle: "Rincorrere sintomi ti stanca. Vedere schemi ti libera.",
      sections: [
        {
          icon: "🚰",
          title: "Il Rubinetto Che Perde",
          content: "Ogni giorno metti uno straccio sotto.\nOgni sera lo strizzi.\nOgni mattina ricomincia.\n\nDopo un mese, sei stanco.\nPensi: \"Questo rubinetto mi sta facendo impazzire.\"\n\nMa il rubinetto non è il problema. È il SINTOMO.\n\nIl problema è la guarnizione consumata.\nFinché non la vedi, continuerai a strizzare stracci."
        },
        {
          icon: "🔍",
          title: "Il PRIMO FILTRO: Vedere SCHEMI",
          content: "La maggior parte delle persone rincorre sintomi invece di vedere schemi.\n\n\"Il team non rispetta le scadenze\" → sintomo\n\"Le scadenze slittano sempre quando aspettiamo approvazioni esterne\" → schema\n\n\"I clienti si lamentano\" → sintomo\n\"I clienti si lamentano sempre dopo la stessa fase del progetto\" → schema\n\n\"Non ho tempo\" → sintomo\n\"Perdo tempo sempre sulle stesse cose\" → schema"
        },
        {
          icon: "📋",
          title: "La Tessera Ristoranti - 1993",
          content: "Nel 1993 ho lanciato un progetto che sembrava perfetto. Una tessera per sconti nei ristoranti.\n\nIl sintomo era: \"I ristoranti non aderiscono.\"\nLo schema era: \"Nessuno ha chiesto questa soluzione.\"\n\nSe avessi visto lo schema prima, avrei risparmiato mesi."
        }
      ],
      exercise: {
        instruction: "Cerca lo schema che si ripete in un problema attuale.",
        steps: [
          "Riprendi i 3 problemi di ieri",
          "Per ognuno, chiediti: \"Quale SCHEMA si ripeteva?\"",
          "Non cercare la risposta perfetta",
          "Cerca qualcosa che si ripeteva",
          "Scrivi: \"Lo schema era: ____________\""
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Rincorrere sintomi ti stanca. Vedere schemi ti libera.",
      openLoop: "A volte lo schema è nascosto dietro quello che le persone NON dicono."
    },
    3: {
      title: "Il Filtro Segnali",
      subtitle: "I segnali sono quello che non viene detto.",
      emailSubject: "Cosa significa davvero \"Ci penso\"",
      principle: "I segnali sono quello che non viene detto. Impara a leggerli.",
      sections: [
        {
          icon: "🗣️",
          title: "\"Interessante, Ci Penso\"",
          content: "Quando qualcuno ti dice \"Interessante, ci penso\", cosa significa davvero?\n\nNella mia esperienza, quasi sempre significa: \"No, ma non voglio dirtelo in faccia.\"\n\nQuesto è il SECONDO FILTRO: leggere SEGNALI.\n\nI segnali sono quello che non viene detto. Sono nei toni, nei tempi, nelle omissioni."
        },
        {
          icon: "📡",
          title: "Alcuni Segnali Comuni",
          content: "\"Interessante\" = Non mi interessa\n\"Ne parliamo\" = Non ne parleremo\n\"Devo pensarci\" = Ho già deciso (no)\n\"Fammi sapere\" = Non ti richiamerò\nRisposta dopo 3 giorni = Non sei una priorità\n\nNon sono regole assolute. Ma se impari a leggerli, risparmi tempo e frustrazioni."
        },
        {
          icon: "📋",
          title: "Tutti Mi Dicevano \"Interessante\"",
          content: "Nel 1993, quando chiamavo i ristoranti per proporre la mia tessera, tutti mi dicevano \"Interessante!\".\n\nIo pensavo: \"Fantastico, gli piace!\"\n\nNessuno mi richiamava. Nessuno firmava.\n\nIl segnale era chiaro: cortesia, non interesse.\n\nSe avessi saputo leggerlo, avrei cambiato approccio dopo la prima settimana. Non dopo tre mesi."
        }
      ],
      exercise: {
        instruction: "Analizza i segnali in una situazione attuale.",
        steps: [
          "Pensa a una situazione attuale in cui aspetti una risposta da qualcuno",
          "Chiediti: 1. Cosa mi ha DETTO esattamente?",
          "2. Cosa NON ha detto?",
          "3. Com'era il TONO?",
          "4. Quanto tempo ha impiegato a rispondere?",
          "5. Se dovessi scommettere: qual è la verità che non mi sta dicendo?"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "I segnali sono quello che non viene detto. Impara a leggerli.",
      openLoop: "A volte non agiamo perché pensiamo di non avere quello che serve. Ma spesso ce l'abbiamo già."
    },
    4: {
      title: "Il Filtro Risorse",
      subtitle: "Le risorse sono quello che HAI GIÀ ma non vedi.",
      emailSubject: "Il frigo che sembra vuoto (ma non lo è)",
      principle: "Le risorse sono quello che HAI GIÀ ma non vedi.",
      sections: [
        {
          icon: "🍳",
          title: "Il Frigo Che Sembra Vuoto",
          content: "Hai presente quando apri il frigo e pensi \"Non c'è niente da mangiare\"?\n\nPoi qualcuno arriva, guarda lo stesso frigo, e in 10 minuti prepara una cena.\n\nStesso frigo. Stessi ingredienti. Risultato diverso.\n\nIl problema non era il frigo. Era come lo guardavi."
        },
        {
          icon: "🔍",
          title: "Il TERZO FILTRO: Trovare RISORSE",
          content: "Le risorse sono quello che HAI GIÀ ma non vedi.\n\nNon parlo solo di soldi o strumenti. Parlo di:\n\n• Persone che conosci e potrebbero aiutarti\n• Cose già fatte che potresti riutilizzare\n• Competenze che hai e sottovaluti\n• Tempo che sprechi senza accorgertene\n• Informazioni che hai già raccolto"
        },
        {
          icon: "📋",
          title: "Non Ho Visto Queste Risorse",
          content: "Nel 1993, quando il progetto tessera falliva, pensavo: \"Non ho budget per il marketing.\"\n\nAvevo ragione: non avevo budget.\n\nMa avevo:\n• Una lista di 200 ristoratori che avevo già contattato\n• Competenze di vendita telefonica (le stavo usando male, ma le avevo)\n• Un amico che lavorava in un giornale locale\n\nNon ho visto queste risorse. Ho visto solo quello che mi mancava."
        }
      ],
      exercise: {
        instruction: "Fai l'inventario delle risorse NASCOSTE per un problema attuale.",
        steps: [
          "Prendi un problema attuale",
          "Fai l'inventario delle risorse NASCOSTE:",
          "1. Persone: Chi conosco che potrebbe aiutarmi? (Anche indirettamente)",
          "2. Cose già fatte: Cosa ho già fatto che potrei riutilizzare o adattare?",
          "3. Competenze: Cosa so fare che potrebbe servire qui?",
          "Scrivi almeno 3 risorse non ovvie"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Le risorse sono quello che HAI GIÀ ma non vedi.",
      openLoop: "I 3 Filtri (Schema, Segnali, Risorse) funzionano meglio insieme. Domani: il Metodo 5 Minuti."
    },
    5: {
      title: "Il Metodo 5 Minuti",
      subtitle: "Un'azione imperfetta è meglio di un'analisi infinita.",
      emailSubject: "Come usare tutto insieme in 5 minuti",
      principle: "Un'azione imperfetta è meglio di un'analisi infinita.",
      sections: [
        {
          icon: "🧩",
          title: "I 3 Strumenti Insieme",
          content: "Nei giorni scorsi hai visto 3 strumenti:\n\n1. Vedere SCHEMI (Giorno 2)\n2. Leggere SEGNALI (Giorno 3)\n3. Trovare RISORSE (Giorno 4)\n\nOggi li mettiamo insieme."
        },
        {
          icon: "⏱️",
          title: "Il METODO 5 MINUTI",
          content: "Quando hai un problema, imposta un timer a 5 minuti.\n\nMINUTO 1-2: SCHEMA\nDomanda: \"Quale schema si ripete?\"\nScrivi: \"Lo schema è: ____________\"\n\nMINUTO 2-3: SEGNALI\nDomanda: \"Cosa non viene detto?\"\nScrivi: \"I segnali indicano che: ____________\"\n\nMINUTO 3-4: RISORSE\nDomanda: \"Cosa ho già che posso usare?\"\nScrivi: \"Le risorse sono: ____________\"\n\nMINUTO 4-5: AZIONE\nDomanda: \"Qual è UNA cosa che faccio entro domani?\"\nScrivi: \"La mia prossima azione è: ____________\"\n\nQuando il timer suona, FERMATI. Hai quello che ti serve."
        },
        {
          icon: "📋",
          title: "Esempio Compilato",
          content: "Problema: Il team non rispetta le scadenze\n\nSchema: \"Il ritardo inizia sempre quando aspettiamo approvazioni esterne\"\n\nSegnali: \"Il cliente probabilmente è oberato e non riesce a rispondere in tempo\"\n\nRisorse: \"Ho il numero diretto del project manager del cliente, mai usato\"\n\nAzione: \"Domani chiamo il PM per proporre un calendario di approvazioni\"\n\nREGOLA IMPORTANTE: Se il timer suona e non hai finito, vai comunque all'AZIONE.\nUn'azione imperfetta è meglio di un'analisi infinita."
        }
      ],
      exercise: {
        instruction: "Applica il Metodo 5 Minuti completo a un problema attuale.",
        steps: [
          "Scegli un problema attuale",
          "Imposta il timer a 5 minuti",
          "Compila la scheda: Schema → Segnali → Risorse → Azione",
          "Quando il timer suona, fermati"
        ],
        duration: "5 minuti esatti"
      },
      keyTakeaway: "Un'azione imperfetta è meglio di un'analisi infinita.",
      openLoop: "A volte il problema non è fuori. È una voce dentro che ti ferma."
    },
    6: {
      title: "I 3 Traditori",
      subtitle: "I traditori perdono forza quando li riconosci.",
      emailSubject: "La voce che ti ferma prima di iniziare",
      principle: "I traditori perdono forza quando li riconosci.",
      sections: [
        {
          icon: "❓",
          title: "Hai Fatto L'Azione?",
          content: "Ieri hai compilato la scheda del Metodo 5 Minuti.\n\nHai fatto l'azione che avevi scritto?\n\nSe sì: bravo, vai al Giorno 7.\nSe no: continua a leggere.\n\nA volte vedi lo schema, i segnali e le risorse — ma resti bloccato.\n\nIn quel caso il problema non è fuori. È una voce dentro che ti frena.\n\nNel libro \"Oltre gli Ostacoli\" li chiamo i 3 TRADITORI SILENZIOSI.\n\nSi chiamano così perché si travestono da prudenza e saggezza."
        },
        {
          icon: "🎭",
          title: "I 3 Traditori",
          content: "IL PARALIZZANTE\nCosa dice: \"Devo avere tutte le informazioni prima di agire\"\nCome si traveste: Prudenza, analisi accurata\n\nIL TIMOROSO\nCosa dice: \"È meglio non agire che agire e sbagliare\"\nCome si traveste: Pensiero strategico\n\nIL PROCRASTINATORE\nCosa dice: \"Devo aspettare il momento perfetto\"\nCome si traveste: Timing intelligente"
        },
        {
          icon: "💡",
          title: "Il Problema È Che Sembrano Ragionevoli",
          content: "Chi non vorrebbe avere tutte le informazioni?\nChi non vorrebbe evitare errori?\nChi non vorrebbe il momento perfetto?\n\nMa guarda meglio:\n\nIl momento perfetto non arriva mai.\nLe informazioni non sono mai \"tutte\".\nE non agire È GIÀ un errore.\n\nCOME NEUTRALIZZARLI:\n\nIl potere dei traditori sta nel fatto che non li riconosci.\n\nSe li smascheri — se dici \"Ah, sei tu che mi blocchi\" — perdono metà della forza.\n\nA quel punto puoi SCEGLIERE se crederci o no."
        }
      ],
      exercise: {
        instruction: "Identifica quale Traditore ti ha bloccato e rispondigli.",
        steps: [
          "Riprendi l'azione di ieri che non hai fatto",
          "Chiediti: \"Quale credenza mi ha fermato?\"",
          "Identifica il Traditore: Paralizzante, Timoroso, o Procrastinatore",
          "Rispondi: \"Ti ho riconosciuto, [nome]. Ma la verità è: [il contrario della credenza].\"",
          "E fai l'azione PRIMA di sera"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "I traditori perdono forza quando li riconosci.",
      openLoop: "Domani è l'ultimo giorno. Vediamo come continuare da solo."
    },
    7: {
      title: "E Adesso?",
      subtitle: "I problemi arriveranno sempre. La domanda è come affrontarli.",
      emailSubject: "Da qui in avanti",
      principle: "I problemi arriveranno sempre. La domanda è come affrontarli quando arrivano.",
      sections: [
        {
          icon: "💡",
          title: "La Cosa Più Importante",
          content: "Ti ho raccontato di tessere ristoranti, rubinetti che perdono, frigo vuoti.\n\nMa non ti ho ancora raccontato la cosa più importante che ho imparato sui problemi.\n\nQuando entri in business, fatti un esame di coscienza e stabilisci, già da prima, che le cose non vadano mai lisce.\n\nQuesto non è pessimismo. È realismo.\n\nI problemi arriveranno. Sempre.\n\nLa domanda non è \"come evitarli\". La domanda è \"come affrontarli quando arrivano\"."
        },
        {
          icon: "📋",
          title: "Cosa Hai Costruito Questa Settimana",
          content: "| Giorno | Strumento |\n|--------|-----------||\n| 1 | Le PROVE che sai già risolvere |\n| 2 | Il Filtro degli SCHEMI (vedere schemi) |\n| 3 | Il Filtro SEGNALI (leggere il non detto) |\n| 4 | Il Filtro RISORSE (trovare quello che hai) |\n| 5 | Il METODO 5 MINUTI (tutto insieme) |\n| 6 | I 3 TRADITORI (e come smascherarli) |\n\nQuesti strumenti non scadono. Puoi usarli su qualsiasi problema, per sempre."
        },
        {
          icon: "🎯",
          title: "Cosa Succede Adesso?",
          content: "LA REGOLA PER NON PERDERLI:\n\nGli strumenti si arrugginiscono se non li usi.\n\nNon serve usarli ogni giorno. Ma quando arriva un problema vero, tira fuori il Metodo 5 Minuti.\n\nUso frequente = rafforzamento\nNon uso = indebolimento\n\nHai due opzioni:\n\n1. CONTINUA DA SOLO - Hai gli strumenti. Applicali quando serve.\n\n2. APPROFONDISCI - L'Assessment Risolutore misura quanto usi i 3 Filtri, quanto ti bloccano i 3 Traditori, e a che livello sei sulla Scala del Risolutore.\n\nQualunque cosa tu scelga, ricorda:\n\nIl risolutore che cerchi è già dentro di te."
        }
      ],
      exercise: {
        instruction: "Decidi come vuoi continuare.",
        steps: [
          "Scrivi: \"Il prossimo problema che affronterò con il metodo è: ___\"",
          "Decidi quando userai il metodo (minimo: ogni settimana su un problema)",
          "Ricorda: Il risolutore che cerchi è già dentro di te",
          "Non fermarti"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "I problemi arriveranno sempre. La domanda è come affrontarli quando arrivano.",
      openLoop: ""
    }
  },

  // =====================================================
  // MICROFELICITÀ - 7 giorni
  // Gradiente: -7 → -2 | Storia 1973-1982 + R.A.D.A.R. + 3 Forme
  // =====================================================
  microfelicita: {
    1: {
      title: "Il Primo Inventario",
      subtitle: "Non è colpa tua se non li noti",
      emailSubject: "Quanti momenti positivi hai avuto ieri? (La risposta ti sorprenderà)",
      principle: "Non è vero che non ti accade niente di positivo. È che il cervello è programmato per non notarlo.",
      sections: [
        {
          icon: "📖",
          title: "La Mia Storia",
          content: "Per nove anni — dal 1973 al 1982 — ho cercato il benessere nei posti sbagliati.\n\nSaltavo da un'esperienza all'altra, da un gruppo all'altro, sempre convinto che la felicità fosse nel prossimo evento, nella prossima persona, nel prossimo traguardo.\n\nA fine giornata pensavo sempre: \"Oggi niente di speciale.\"\n\nNon era vero. Ogni giorno mi attraversavano decine di piccoli momenti positivi. Non li vedevo perché nessuno mi aveva insegnato a notarli."
        },
        {
          icon: "🧠",
          title: "Perché È Così",
          content: "Il cervello umano ha un \"filtro della sopravvivenza\" che dà priorità ai problemi:\n\n• I nostri antenati che notavano i pericoli sopravvivevano\n• Quelli distratti venivano mangiati\n\nRisultato oggi: noti 10 cose negative e solo 2-3 delle 50 positive.\n\nNon è un difetto. È un'impostazione di fabbrica.\n\nMa puoi ricalibrare il filtro. È quello che farai in 7 giorni."
        }
      ],
      exercise: {
        instruction: "Stasera, prima di dormire, trova 3 momenti piacevoli della giornata.",
        steps: [
          "Stasera, prima di dormire, ripensa alla tua giornata",
          "Trova 3 momenti che sono stati piacevoli, anche minimamente",
          "Non devono essere \"speciali\" o \"importanti\"",
          "Basta che siano stati piacevoli, anche solo un po'",
          "Scrivili. Se non ne trovi 3, va benissimo. Trovane 1 o 2"
        ],
        duration: "3 minuti"
      },
      keyTakeaway: "Non è vero che non ti accade niente di positivo. È che il cervello è programmato per non notarlo.",
      openLoop: "Perché 50 momenti piccoli battono 4 momenti grandi — e come questo cambia tutto."
    },
    2: {
      title: "La Matematica",
      subtitle: "50 Piccoli Battono 4 Grandi",
      emailSubject: "Ho fatto i conti. Ecco perché stai perdendo 18.000 opportunità all'anno.",
      principle: "Se aspetti i momenti grandi, hai 4 occasioni all'anno per stare bene. Se noti i piccoli, ne hai 18.000.",
      sections: [
        {
          icon: "🔢",
          title: "Ecco I Numeri",
          content: "| Tipo di momento | Frequenza | Totale annuo |\n|-----------------|-----------|---------------|\n| Grandi (vacanza, promozione, evento) | 3-4 all'anno | ~4 |\n| Piccoli (se li noti) | 50+ al giorno | ~18.000 |\n\nRapporto: 1 a 4.500.\n\nSe il tuo benessere dipende dai momenti grandi, stai giocando a un gioco che non puoi vincere."
        },
        {
          icon: "🧠",
          title: "C'È Un Altro Problema",
          content: "I momenti grandi hanno un effetto che diminuisce nel tempo:\n\n• Giorno 1 della vacanza: Felicità alta\n• Giorno 7: Ti sei abituato\n• 1 mese dopo: È come se non fosse mai successo\n\nIl cervello si abitua a tutto — anche alle cose belle. È fatto così: dopo un po', il \"nuovo\" diventa \"normale\".\n\nI momenti piccoli non hanno questo problema. Ogni momento piccolo è nuovo. Non c'è tempo per abituarsi."
        }
      ],
      exercise: {
        instruction: "Confronta un momento grande con un momento piccolo di oggi.",
        steps: [
          "Pensa all'ultimo momento \"grande\" che hai vissuto (vacanza, traguardo, evento speciale)",
          "Scrivi: Cos'era, quanto tempo fa, quanto ti fa stare bene ADESSO (1-10)",
          "Pensa a un momento piccolo piacevole di OGGI",
          "Scrivi: Cos'era, quanto ti ha fatto stare bene IN QUEL MOMENTO (1-10)",
          "Confronta. Il momento grande probabilmente non ti fa più molto effetto oggi"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Se aspetti i momenti grandi, hai 4 occasioni all'anno. Se noti i piccoli, ne hai 18.000.",
      openLoop: "Il problema di notare i momenti positivi \"dopo\" — e come iniziare a intercettarli in tempo reale."
    },
    3: {
      title: "Intercettare In Tempo Reale",
      subtitle: "Mentre Succede, Non Dopo",
      emailSubject: "Il trucco che cambia tutto: notare MENTRE succede",
      principle: "Notare un momento positivo 10 ore dopo ha 1/10 dell'effetto di notarlo mentre accade.",
      sections: [
        {
          icon: "📸",
          title: "Il Problema Di \"Dopo\"",
          content: "Ieri ti ho chiesto di ripensare alla giornata e trovare momenti positivi.\n\nL'hai fatto — e funziona come esercizio iniziale.\n\nMa c'è un problema: quando noti qualcosa di positivo \"dopo\", l'effetto è molto ridotto.\n\nQuando vivi un momento piacevole e non lo noti:\n• Dura 1-2 secondi\n• Il cervello lo cataloga come \"niente di speciale\"\n• A fine giornata, devi sforzarti per ricordarlo\n\nQuando lo noti MENTRE accade:\n• Lo \"catturi\" nel momento\n• Il cervello lo registra come significativo\n• L'effetto si amplifica\n\nÈ la differenza tra guardare una foto e essere lì."
        },
        {
          icon: "⭐",
          title: "Come Vedere Una Stella Cadente",
          content: "Se guardi il cielo e la noti mentre passa: wow, momento magico.\n\nSe qualcuno ti dice \"mezz'ora fa c'è stata una stella cadente\": ok, interessante, ma non è la stessa cosa.\n\nI momenti positivi funzionano così. Devi coglierli mentre accadono."
        }
      ],
      exercise: {
        instruction: "Oggi intercetta 3 momenti piacevoli MENTRE succedono.",
        steps: [
          "Oggi il tuo obiettivo è intercettare 3 momenti piacevoli MENTRE succedono — non stasera a memoria",
          "Quando succede qualcosa di piacevole (anche minimo):",
          "• Fermati mentalmente per 3 secondi",
          "• Di' a te stesso: \"Questo. Proprio questo.\"",
          "• Non analizzare. Solo nota",
          "Alla sera, conta: quanti ne hai intercettati in tempo reale?"
        ],
        duration: "3 secondi per volta, tutto il giorno"
      },
      keyTakeaway: "Notare un momento positivo 10 ore dopo ha 1/10 dell'effetto di notarlo mentre accade.",
      openLoop: "Un metodo strutturato in 5 passi per fare questo — ogni volta, in modo affidabile."
    },
    4: {
      title: "Il Metodo R.A.D.A.R.",
      subtitle: "5 Passi per Catturare Ogni Momento",
      emailSubject: "Il trucco dei 10 secondi",
      principle: "R.A.D.A.R. = Rileva → Accogli → Distingui → Amplifica → Resta. Cinque passi, 10 secondi.",
      sections: [
        {
          icon: "📡",
          title: "Perché Serve Un Metodo",
          content: "Ieri ti ho chiesto di intercettare momenti in tempo reale.\n\nSe ci sei riuscito: ottimo, hai già la base.\n\nSe hai avuto difficoltà: è normale. Senza un metodo strutturato, il cervello torna alle sue abitudini automatiche.\n\nR.A.D.A.R. è il metodo.\n\nÈ semplice — così semplice che non hai scuse per non usarlo."
        },
        {
          icon: "🎯",
          title: "I 5 Passi",
          content: "| Lettera | Significato | Cosa Fai | Tempo |\n|---------|-------------|----------|-------|\n| R | Rileva | Noti che sta succedendo qualcosa di piacevole | 1-2 sec |\n| A | Accogli | Lasci che la sensazione arrivi senza giudicarla | 1-2 sec |\n| D | Distingui | Ti chiedi: \"Questo mi nutre?\" | 1-2 sec |\n| A | Amplifica | Mantieni l'attenzione per qualche secondo in più | 3-5 sec |\n| R | Resta | Lasci che il focus si ritiri naturalmente | 2 sec |\n\nTempo totale: ~10 secondi."
        },
        {
          icon: "💡",
          title: "Sembra Semplice — E Lo È",
          content: "La semplicità è il punto: deve essere così facile che lo fai davvero.\n\n1. RILEVA: Il tuo radar interno si accorge che qualcosa di piacevole sta succedendo.\n\n2. ACCOGLI: Non pensare \"che stupidaggine\". Lascia che la sensazione arrivi.\n\n3. DISTINGUI: \"Questo mi avvicina al benessere?\"\n\n4. AMPLIFICA: Invece di passare al prossimo pensiero, resta con la sensazione per 5 secondi.\n\n5. RESTA: Non fare nulla per 2 secondi. Questo stabilizza l'esperienza nella memoria."
        }
      ],
      exercise: {
        instruction: "Applica R.A.D.A.R. a 3 occasioni specifiche oggi.",
        steps: [
          "OCCASIONE 1: Il primo caffè/tè della giornata — applica R.A.D.A.R.",
          "OCCASIONE 2: Un momento di silenzio/pausa — applica R.A.D.A.R.",
          "OCCASIONE 3: Qualsiasi momento a tua scelta — applica R.A.D.A.R.",
          "Alla sera, scrivi: Quante volte l'ho fatto? È stato facile o difficile?"
        ],
        duration: "30 secondi totali, distribuiti"
      },
      keyTakeaway: "R.A.D.A.R. = Rileva → Accogli → Distingui → Amplifica → Resta. Cinque passi, 10 secondi.",
      openLoop: "Non tutte le microfelicità sono uguali. Scopri le 3 forme — e qual è il tuo mix preferito."
    },
    5: {
      title: "Le 3 Forme",
      subtitle: "Percettiva, Sensoriale, Mentale",
      emailSubject: "Visiva, sensoriale o mentale: tu quale sei?",
      principle: "Esistono 3 tipi di microfelicità. Ognuno ha il suo \"mix\" preferito.",
      sections: [
        {
          icon: "📊",
          title: "Le 3 Forme",
          content: "| Forma | Cosa Include | Esempi |\n|-------|--------------|--------|\n| Percettiva (visiva) | Ciò che vedi | Foto che cattura l'attenzione, espressione sul volto di qualcuno, gioco di luce |\n| Sensoriale (altri sensi) | Udito, tatto, gusto, olfatto | Suono della pioggia, temperatura che dà sollievo, odore che attiva un ricordo |\n| Mentale | Consapevolezza di un meccanismo | Accorgerti di un pensiero sabotante, riconoscere l'autocritica prima che ti affossi |"
        },
        {
          icon: "🎯",
          title: "Perché Conta Saperlo",
          content: "Se sai che le tue microfelicità preferite sono PERCETTIVE, puoi creare più occasioni visive nella giornata (una pianta sulla scrivania, una foto che ami, la luce giusta).\n\nSe sono SENSORIALI, puoi investire in esperienze degli altri sensi (un tè particolare, il suono della pioggia, un tessuto piacevole).\n\nSe sono MENTALI, puoi sviluppare l'abitudine di notare i tuoi meccanismi sabotanti — quando ti accorgi di un pensiero critico e lo riconosci, quella consapevolezza È una microfelicità.\n\nNon c'è un mix giusto o sbagliato. C'è il tuo mix."
        }
      ],
      exercise: {
        instruction: "Scopri il tuo mix preferito.",
        steps: [
          "Ripensa a IERI. Scrivi 3 momenti positivi che hai notato",
          "Per ogni momento, indica: V (visiva), S (sensoriale), M (mentale)",
          "Il tuo mix prevalente è: ___"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Esistono 3 tipi di microfelicità. Ognuno ha il suo \"mix\" preferito.",
      openLoop: "I segnali più importanti sono spesso i più deboli. Come catturare quello che il cervello scarta."
    },
    6: {
      title: "I Segnali Deboli",
      subtitle: "Le Cose Più Piccole Sono Spesso le Più Importanti",
      emailSubject: "Il segnale che il tuo cervello scarta (e che vale oro)",
      principle: "I segnali più deboli sono spesso i più nutrienti. Ma il cervello li scarta perché non urlano.",
      sections: [
        {
          icon: "📖",
          title: "Una Storia",
          content: "Su quella collinetta di Torino, nel 1975, cercavo segnali forti.\n\nVolevo esperienze intense, emozioni travolgenti, momenti indimenticabili.\n\nQuello che non vedevo erano i segnali deboli: la brezza sulla pelle, il silenzio prima dell'alba, il piacere semplice di camminare.\n\nLi scartavo perché non urlavano.\n\nHo impiegato anni per capire che quei segnali deboli — quelli che il cervello cataloga come \"niente di speciale\" — sono spesso i più nutrienti."
        },
        {
          icon: "📊",
          title: "Perché I Segnali Deboli Sono Importanti",
          content: "I segnali forti (gioia intensa, eccitazione, euforia) sono rari e consumano energia.\n\nI segnali deboli (calma sottile, soddisfazione leggera, piacere semplice) sono frequenti e non consumano nulla.\n\n| Tipo segnale | Frequenza | Energia richiesta | Durata effetto |\n|--------------|-----------|-------------------|----------------|\n| Forte | Raro | Alta | Breve (adattamento) |\n| Debole | Frequente | Zero | Stabile (no adattamento) |\n\nIl benessere sostenibile si costruisce sui segnali deboli, non su quelli forti."
        }
      ],
      exercise: {
        instruction: "Caccia al Segnale Debole — oggi cattura segnali che normalmente ignoreresti.",
        steps: [
          "Oggi cattura segnali DEBOLI — cose che normalmente ignoreresti completamente",
          "Esempi: La sensazione della sedia che ti sostiene, il momento tra due pensieri, l'assenza di dolore, la temperatura dell'aria, il fatto che le cose funzionano",
          "Quando noti uno di questi segnali deboli:",
          "• Non pensare \"che stupidaggine\"",
          "• Applica R.A.D.A.R. come se fosse un segnale forte",
          "Alla sera, conta: quanti segnali deboli hai catturato?"
        ],
        duration: "3-5 secondi per volta, tutto il giorno"
      },
      keyTakeaway: "I segnali più deboli sono spesso i più nutrienti. Ma il cervello li scarta perché non urlano.",
      openLoop: "L'ultimo giorno. Come continuare da solo — e cosa c'è oltre questa challenge."
    },
    7: {
      title: "Come Continuare",
      subtitle: "Da Oggi in Poi",
      emailSubject: "Giorno 7: Il tuo piano per continuare (e cosa c'è dopo)",
      principle: "Hai gli strumenti. Ora si tratta di usarli ogni giorno — finché diventano automatici.",
      sections: [
        {
          icon: "📋",
          title: "Cosa Hai Imparato In 7 Giorni",
          content: "| Giorno | Cosa Hai Scoperto |\n|--------|-------------------|\n| 1 | I momenti positivi ci sono — il problema è notarli |\n| 2 | 50 piccoli battono 4 grandi (matematica del benessere) |\n| 3 | Notare \"mentre succede\" vale 10 volte \"dopo\" |\n| 4 | R.A.D.A.R. = Rileva-Accogli-Distingui-Amplifica-Resta |\n| 5 | Esistono 3 forme: Visiva, Sensoriale, Mentale |\n| 6 | I segnali deboli sono i più nutrienti |\n| 7 | (Oggi) Come continuare da solo |"
        },
        {
          icon: "📅",
          title: "Il Tuo Piano Autonomo",
          content: "Per rendere R.A.D.A.R. automatico, serve una cosa sola: pratica quotidiana per 21 giorni.\n\nSettimana 1-2: Aggancio a routine esistenti\nScegli 3 momenti fissi della giornata dove applicherai R.A.D.A.R.\n(Suggerimenti: primo caffè, pausa pranzo, prima di dormire)\n\nSettimana 3: Espansione\nAggiungi altri 2-3 momenti liberi durante la giornata.\n\nDopo 21 giorni:\nR.A.D.A.R. diventa semi-automatico. Non dovrai più pensarci."
        },
        {
          icon: "🎯",
          title: "Un'Ultima Cosa",
          content: "Ricordi cosa ti ho raccontato il primo giorno?\n\nPer 9 anni ho cercato il benessere nei posti sbagliati. Ho cercato esperienze intense, momenti straordinari, persone \"giuste\".\n\nQuello che non vedevo era che il benessere mi attraversava ogni giorno.\n\nOra lo vedi anche tu.\n\nNon è qualcosa che devi cercare. È qualcosa che devi notare.\n\nGrazie per aver fatto questo percorso con me."
        }
      ],
      exercise: {
        instruction: "Conferma il tuo aggancio per i prossimi 21 giorni.",
        steps: [
          "Scrivi: \"Quando ___, faccio R.A.D.A.R.\"",
          "Scegli come tenere traccia (calendario, app, nota)",
          "Obiettivo: 21 giorni di fila"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Il benessere che cerchi ti sta già attraversando. Ora sai come notarlo.",
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
