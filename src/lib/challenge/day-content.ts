// Contenuti delle Day Pages per le 3 Challenge
// 7 giorni × 3 challenge = 21 pagine

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
}

export interface DayContent {
  title: string;
  subtitle: string;
  videoUrl?: string;
  sections: ContentSection[];
  exercise?: DayExercise;
  keyTakeaway: string;
}

export const DAY_CONTENT: Record<ChallengeType, Record<DayNumber, DayContent>> = {
  // =====================================================
  // LEADERSHIP AUTENTICA - 7 giorni
  // =====================================================
  leadership: {
    1: {
      title: "Il Leader Nascosto",
      subtitle: "Scopri la leadership che già opera in te",
      sections: [
        {
          icon: "🎯",
          title: "La Leadership Invisibile",
          content: "Ogni giorno, senza rendertene conto, guidi. Quando qualcuno ti chiede un consiglio, quando prendi una decisione che altri seguono, quando indichi una direzione — stai già esercitando leadership.\n\nNon si tratta di titoli o ruoli formali. Si tratta di quei momenti in cui sei \"quello che sa la strada\".",
          highlights: [
            "La leadership non si costruisce, si riconosce",
            "Già guidi in modi che non hai ancora notato",
            "Il primo passo è vedere ciò che c'è già"
          ]
        },
        {
          icon: "🔍",
          title: "L'Esercizio del Riconoscimento",
          content: "Oggi il tuo compito è semplice: osserva. Nota quante volte qualcuno si rivolge a te per un consiglio, un'opinione, una decisione.\n\nNon cercare momenti straordinari. Cerca i piccoli momenti quotidiani in cui qualcuno ti ha considerato un punto di riferimento."
        }
      ],
      exercise: {
        instruction: "Ripensa alla settimana scorsa e identifica almeno 3 momenti in cui qualcuno ha seguito una tua indicazione o chiesto il tuo parere.",
        steps: [
          "Prendi carta e penna (o apri le note del telefono)",
          "Ripercorri mentalmente gli ultimi 7 giorni",
          "Scrivi ogni momento, anche piccolo, in cui hai guidato",
          "Non giudicare — solo osserva e registra"
        ]
      },
      keyTakeaway: "La leadership che cerchi fuori è già dentro di te. Oggi iniziamo a vederla."
    },
    2: {
      title: "Il Fuoco Interno",
      subtitle: "La differenza tra \"via da\" e \"verso\"",
      sections: [
        {
          icon: "🔥",
          title: "Due Tipi di Motivazione",
          content: "Esistono due forze che ci muovono: la fuga dal dolore (\"via da\") e l'attrazione verso qualcosa (\"verso\").\n\nChi scappa dal dolore si ferma appena il dolore diminuisce. Chi corre verso qualcosa non si ferma mai, perché l'obiettivo è davanti, non dietro.",
          highlights: [
            "\"Via da\" genera reazione, \"verso\" genera costruzione",
            "Il leader autentico è guidato da visione, non da paura",
            "La motivazione \"verso\" è più sostenibile nel tempo"
          ]
        },
        {
          icon: "💡",
          title: "Riconosci il Tuo Pattern",
          content: "Pensa alle tue decisioni importanti degli ultimi mesi. Quante sono state prese per evitare qualcosa? Quante per costruire qualcosa?\n\nNon c'è giudizio qui. Solo consapevolezza. Entrambe le motivazioni sono umane. Ma sapere quale ti guida ti dà potere."
        }
      ],
      exercise: {
        instruction: "Analizza 3 decisioni recenti e identifica se erano motivate dal \"via da\" o dal \"verso\".",
        steps: [
          "Scegli 3 decisioni significative degli ultimi 30 giorni",
          "Per ognuna chiediti: stavo scappando da qualcosa o andando verso qualcosa?",
          "Nota come ti sei sentito durante e dopo ogni decisione",
          "Identifica un pattern ricorrente"
        ]
      },
      keyTakeaway: "Il fuoco che ti muove determina dove arrivi. Scegli di ardere verso qualcosa, non via da qualcosa."
    },
    3: {
      title: "Il Coraggio che Costruisce",
      subtitle: "Dalla resistenza alla creazione",
      sections: [
        {
          icon: "🏗️",
          title: "Resistere vs Costruire",
          content: "C'è un coraggio che resiste e uno che costruisce. Il primo ti tiene in piedi quando tutto crolla. Il secondo ti fa avanzare quando niente ti spinge.\n\nResistere è necessario. Ma restare in modalità resistenza troppo a lungo ti blocca. Il vero salto avviene quando trasformi l'energia della resistenza in energia costruttiva.",
          highlights: [
            "La resistenza è sopravvivenza, la costruzione è crescita",
            "Ogni difficoltà contiene materiale da costruzione",
            "Il coraggio autentico sceglie di creare"
          ]
        },
        {
          icon: "⚡",
          title: "Il Momento del Passaggio",
          content: "Pensa a una situazione difficile che stai affrontando. Ti stai difendendo o stai costruendo qualcosa?\n\nNon è una critica — è un'osservazione. A volte serve difendersi. Ma chiedersi \"cosa posso costruire da qui?\" apre possibilità che la sola resistenza non vede."
        }
      ],
      exercise: {
        instruction: "Identifica una situazione in cui stai \"resistendo\" e chiediti cosa potresti costruire invece.",
        steps: [
          "Scegli una sfida attuale",
          "Nota come la stai affrontando (resistenza o costruzione?)",
          "Chiediti: cosa potrei costruire da questa situazione?",
          "Scrivi almeno una possibilità costruttiva"
        ]
      },
      keyTakeaway: "Il coraggio che conta non è quello che resiste al buio, ma quello che costruisce la luce."
    },
    4: {
      title: "La Dedizione che Serve",
      subtitle: "Distinguere l'ostinazione dalla dedizione autentica",
      sections: [
        {
          icon: "🎯",
          title: "Dedizione vs Ostinazione",
          content: "La dedizione crea valore. L'ostinazione consuma energia. Sembrano simili — entrambe perseverano — ma portano a risultati opposti.\n\nLa dedizione autentica serve qualcosa di più grande di te. L'ostinazione serve il tuo bisogno di avere ragione.",
          highlights: [
            "La dedizione è flessibile nei mezzi, ferma nel fine",
            "L'ostinazione è rigida in tutto",
            "Chiediti: sto servendo o sto dimostrando?"
          ]
        },
        {
          icon: "🪞",
          title: "Lo Specchio della Dedizione",
          content: "Pensa a un progetto o impegno a cui tieni molto. Perché lo porti avanti?\n\nSe la risposta è \"perché ho iniziato\" o \"per orgoglio\", potrebbe essere ostinazione. Se è \"perché crea valore\" o \"perché serve a qualcosa di importante\", è dedizione."
        }
      ],
      exercise: {
        instruction: "Esamina un impegno attuale e chiediti: sto servendo o sto dimostrando?",
        steps: [
          "Scegli un progetto o impegno significativo",
          "Scrivi i motivi per cui lo porti avanti",
          "Onestamente, classifica ogni motivo: servizio o dimostrazione?",
          "Decidi se continuare, modificare o lasciare andare"
        ]
      },
      keyTakeaway: "La vera dedizione serve qualcosa di più grande. L'ostinazione serve solo l'ego."
    },
    5: {
      title: "I Principi Stabili",
      subtitle: "Cosa tenere fisso e cosa adattare",
      sections: [
        {
          icon: "⚓",
          title: "L'Ancora e la Vela",
          content: "I principi sono la tua ancora. Le strategie sono la tua vela. L'ancora ti tiene saldo quando la tempesta arriva. La vela ti permette di muoverti con il vento.\n\nChi confonde principi e strategie perde entrambi. Chi tiene fissi i valori e flessibili i metodi naviga qualsiasi mare.",
          highlights: [
            "I valori non negoziano, le tattiche sì",
            "La coerenza è nei principi, non nelle azioni",
            "L'adattabilità senza principi è deriva"
          ]
        },
        {
          icon: "📋",
          title: "Il Tuo Inventario di Principi",
          content: "Quali sono i principi che non negozieresti mai? Non quelli che pensi di dover avere, ma quelli che effettivamente guidano le tue decisioni.\n\nSe non li hai mai articolati, questo è il momento. Un leader senza principi chiari è una barca senza ancora."
        }
      ],
      exercise: {
        instruction: "Scrivi i tuoi 3-5 principi non negoziabili.",
        steps: [
          "Pensa a decisioni difficili del passato",
          "Identifica cosa ti ha guidato in quelle scelte",
          "Estrai i principi sottostanti",
          "Scrivi ogni principio in una frase chiara"
        ]
      },
      keyTakeaway: "I principi sono la tua bussola. Senza di essi, ogni direzione sembra uguale."
    },
    6: {
      title: "Dal Controllo alla Delega",
      subtitle: "Costruire sistemi che funzionano senza di te",
      sections: [
        {
          icon: "🔄",
          title: "Il Paradosso del Controllo",
          content: "Più controlli, meno controlli. Sembra un paradosso, ma è la verità della leadership efficace.\n\nChi cerca di controllare tutto finisce per controllare poco, perché esaurisce le proprie energie. Chi delega con fiducia costruisce sistemi che moltiplicano il suo impatto.",
          highlights: [
            "Delegare non è perdere controllo, è espanderlo",
            "I sistemi moltiplicano, il controllo diretto divide",
            "La fiducia è un investimento, non un rischio"
          ]
        },
        {
          icon: "🛠️",
          title: "Costruire Sistemi",
          content: "Un sistema è una decisione che prendi una volta e funziona molte volte. Invece di decidere ogni giorno, crei una regola o un processo.\n\nQuali decisioni prendi ripetutamente? Quali processi potresti sistematizzare?"
        }
      ],
      exercise: {
        instruction: "Identifica 3 decisioni ripetitive che potresti trasformare in sistemi o deleghe.",
        steps: [
          "Elenca le decisioni che prendi più spesso",
          "Chiediti: questa decisione potrebbe essere un sistema?",
          "Per ogni decisione, scrivi chi potrebbe prenderla o come automatizzarla",
          "Scegli una da trasformare questa settimana"
        ]
      },
      keyTakeaway: "Il leader che vuole fare tutto, finisce per fare poco. Il leader che costruisce sistemi, moltiplica il suo impatto."
    },
    7: {
      title: "La Comunicazione che Costruisce",
      subtitle: "Comunicare per costruire insieme, non per convincere",
      sections: [
        {
          icon: "💬",
          title: "Due Modi di Comunicare",
          content: "C'è chi comunica per convincere e chi comunica per costruire. Il primo cerca di vincere. Il secondo cerca di creare insieme.\n\nLa comunicazione che costruisce non è soft o accomodante. È chiara, diretta, ma orientata a costruire qualcosa insieme piuttosto che a dimostrare chi ha ragione.",
          highlights: [
            "Convincere crea resistenza, costruire crea alleati",
            "Ascoltare è la forma più potente di leadership",
            "Le domande aprono, le affermazioni chiudono"
          ]
        },
        {
          icon: "🤝",
          title: "Il Potere delle Domande",
          content: "Le domande giuste costruiscono più delle risposte giuste. Quando chiedi \"cosa ne pensi?\" o \"come lo vedi tu?\", non stai cedendo potere — lo stai moltiplicando.\n\nLa leadership autentica non ha paura di non sapere. Ha il coraggio di costruire insieme."
        }
      ],
      exercise: {
        instruction: "Nella tua prossima conversazione importante, sostituisci un'affermazione con una domanda.",
        steps: [
          "Identifica una conversazione importante in arrivo",
          "Prepara una domanda invece di un'affermazione",
          "Durante la conversazione, ascolta davvero la risposta",
          "Nota come cambia la dinamica"
        ]
      },
      keyTakeaway: "Il leader autentico non convince — costruisce insieme. E per costruire insieme, prima ascolta."
    }
  },

  // =====================================================
  // OLTRE GLI OSTACOLI - 7 giorni
  // =====================================================
  ostacoli: {
    1: {
      title: "Il Filtro dei Pattern",
      subtitle: "Riconoscere gli schemi che già hai risolto",
      sections: [
        {
          icon: "🔄",
          title: "I Problemi Si Ripetono",
          content: "Ogni problema che affronti ha delle somiglianze con problemi che hai già risolto. Il cervello tende a vedere ogni sfida come unica, ma i pattern sottostanti si ripetono.\n\nRiconoscere questi pattern significa accedere a soluzioni che già possiedi.",
          highlights: [
            "Il 90% dei problemi segue schemi ricorrenti",
            "Hai già risolto versioni di questo problema",
            "Vedere il pattern accelera la soluzione"
          ]
        },
        {
          icon: "🧠",
          title: "Attivare il Filtro",
          content: "Quando un problema arriva, prima di cercare soluzioni nuove, chiediti: ho già affrontato qualcosa di simile?\n\nNon cercare situazioni identiche. Cerca strutture simili. Un conflitto con un fornitore può avere la stessa struttura di un conflitto familiare risolto anni fa."
        }
      ],
      exercise: {
        instruction: "Prendi un problema attuale e cerca almeno 3 situazioni passate con pattern simili.",
        steps: [
          "Descrivi il problema attuale in una frase",
          "Estrai la struttura (es: \"conflitto su priorità\")",
          "Cerca nella memoria situazioni con struttura simile",
          "Nota come le hai risolte"
        ]
      },
      keyTakeaway: "Non stai affrontando un problema nuovo. Stai affrontando un pattern che conosci già."
    },
    2: {
      title: "Il Filtro dei Segnali",
      subtitle: "Decodificare ciò che non viene detto",
      sections: [
        {
          icon: "📡",
          title: "Oltre le Parole",
          content: "Le parole dicono una cosa, i segnali ne dicono un'altra. Il tono, il timing, le esitazioni, il linguaggio del corpo — tutti comunicano informazioni che le parole nascondono.\n\nIl risolutore efficace legge entrambi i livelli.",
          highlights: [
            "Il 70% della comunicazione è non verbale",
            "I segnali rivelano le vere priorità",
            "L'intuizione è pattern recognition veloce"
          ]
        },
        {
          icon: "👁️",
          title: "Allenare la Lettura",
          content: "Nella prossima conversazione, nota cosa non viene detto. Quali argomenti vengono evitati? Dove c'è esitazione? Cosa dice il corpo mentre la bocca parla?"
        }
      ],
      exercise: {
        instruction: "In una conversazione oggi, nota 3 segnali non verbali e cosa potrebbero significare.",
        steps: [
          "Scegli una conversazione da osservare",
          "Nota tono, pause, postura, sguardo",
          "Chiediti: cosa stanno comunicando questi segnali?",
          "Verifica (se appropriato) con una domanda aperta"
        ]
      },
      keyTakeaway: "La verità sta nei segnali. Chi sa leggerli risolve problemi che altri non vedono."
    },
    3: {
      title: "Il Filtro delle Risorse",
      subtitle: "Combinare ciò che già possiedi",
      sections: [
        {
          icon: "🎒",
          title: "L'Inventario Nascosto",
          content: "Hai più risorse di quelle che pensi. Competenze trasferibili, relazioni, esperienze, tempo nascosto, energia non utilizzata.\n\nIl problema non è la mancanza di risorse. È la mancanza di consapevolezza delle risorse che già hai.",
          highlights: [
            "Le risorse sono spesso invisibili finché non le cerchi",
            "Ogni competenza è trasferibile in qualche modo",
            "Le relazioni sono la risorsa più sottovalutata"
          ]
        },
        {
          icon: "🔧",
          title: "La Combinazione Creativa",
          content: "La creatività non è inventare dal nulla. È combinare in modo nuovo ciò che esiste. Quali risorse hai che, combinate diversamente, potrebbero risolvere il tuo problema attuale?"
        }
      ],
      exercise: {
        instruction: "Fai un inventario di tutte le tue risorse per una sfida specifica.",
        steps: [
          "Scegli una sfida attuale",
          "Elenca: competenze, relazioni, esperienze, tempo, energia, denaro",
          "Per ogni categoria, cerca risorse \"nascoste\"",
          "Prova a combinare risorse in modo nuovo"
        ]
      },
      keyTakeaway: "La soluzione spesso non richiede nuove risorse, ma nuove combinazioni di quelle esistenti."
    },
    4: {
      title: "La Spirale delle Convinzioni",
      subtitle: "Trasformare i Traditori Silenziosi",
      sections: [
        {
          icon: "🌀",
          title: "I Traditori Silenziosi",
          content: "Le convinzioni limitanti operano in silenzio. \"Non sono abbastanza bravo\", \"È troppo rischioso\", \"Non è il momento giusto\". Sembrano ragionevoli, ma sono sabotatrici.\n\nLe chiamiamo Traditori Silenziosi perché tradiscono il tuo potenziale mentre sembrano proteggerti.",
          highlights: [
            "Le convinzioni limitanti sembrano protezione",
            "In realtà limitano il campo delle possibilità",
            "Riconoscerle è il primo passo per trasformarle"
          ]
        },
        {
          icon: "🔓",
          title: "La Domanda Liberatoria",
          content: "Per ogni convinzione limitante, chiediti: cosa sarebbe possibile se questa convinzione non fosse vera?\n\nNon devi credere che sia falsa. Basta immaginare cosa cambierebbe se lo fosse."
        }
      ],
      exercise: {
        instruction: "Identifica il tuo principale Traditore Silenzioso e sfidalo con la domanda liberatoria.",
        steps: [
          "Nota i pensieri che precedono il blocco",
          "Identifica la convinzione sottostante",
          "Chiediti: cosa sarebbe possibile senza questa convinzione?",
          "Scrivi almeno 3 possibilità"
        ]
      },
      keyTakeaway: "Le convinzioni che ti limitano oggi sono state protezioni ieri. Oggi puoi scegliere diversamente."
    },
    5: {
      title: "Il Sistema A.Z.I.O.N.E.",
      subtitle: "Da pensiero a risultato in 6 passi",
      sections: [
        {
          icon: "📋",
          title: "La Struttura dell'Azione",
          content: "A.Z.I.O.N.E. è un sistema per trasformare idee in risultati:\n\n• Analizza la situazione\n• Zero in sull'obiettivo specifico\n• Identifica le risorse disponibili\n• Organizza i passi necessari\n• Naviga gli ostacoli prevedibili\n• Esegui con focus",
          highlights: [
            "La struttura libera, non limita",
            "Ogni passo prepara il successivo",
            "L'esecuzione è l'ultimo passo, non il primo"
          ]
        },
        {
          icon: "🎯",
          title: "Un Solo Obiettivo",
          content: "Il sistema funziona quando hai un obiettivo chiaro. Se l'obiettivo è vago, il sistema non può aiutarti. Prima di usare A.Z.I.O.N.E., chiediti: cosa voglio ottenere specificamente?"
        }
      ],
      exercise: {
        instruction: "Applica A.Z.I.O.N.E. a un obiettivo specifico che vuoi raggiungere.",
        steps: [
          "Definisci l'obiettivo in una frase specifica",
          "Completa ogni lettera del sistema",
          "Identifica il primo passo concreto",
          "Metti in agenda quando lo farai"
        ]
      },
      keyTakeaway: "Non ti mancano le idee. Ti manca un sistema per trasformarle in risultati."
    },
    6: {
      title: "Il Sistema C.R.E.S.C.I.T.A.",
      subtitle: "Estrarre valore da ogni esperienza",
      sections: [
        {
          icon: "🌱",
          title: "L'Apprendimento Sistematico",
          content: "C.R.E.S.C.I.T.A. è un sistema per imparare da ogni esperienza:\n\n• Cosa è successo?\n• Risultato: cosa ho ottenuto?\n• Emozioni: cosa ho provato?\n• Strategia: cosa ha funzionato?\n• Correzione: cosa cambierei?\n• Integrazione: cosa porto con me?\n• Trasferimento: dove altro posso applicarlo?\n• Azione: cosa faccio ora?",
          highlights: [
            "Ogni esperienza contiene valore estraibile",
            "L'errore diventa investimento",
            "L'apprendimento è cumulativo"
          ]
        },
        {
          icon: "📚",
          title: "Nessuna Esperienza Sprecata",
          content: "Applicando C.R.E.S.C.I.T.A., trasformi anche i fallimenti in apprendimento. Non esiste più \"ho sbagliato\", solo \"ho imparato\"."
        }
      ],
      exercise: {
        instruction: "Applica C.R.E.S.C.I.T.A. a un'esperienza recente (positiva o negativa).",
        steps: [
          "Scegli un'esperienza degli ultimi 7 giorni",
          "Rispondi a ogni lettera del sistema",
          "Identifica l'apprendimento chiave",
          "Decidi dove applicarlo"
        ]
      },
      keyTakeaway: "Il risolutore non fallisce mai. O riesce, o impara. E imparare è riuscire."
    },
    7: {
      title: "Il Risolutore Integrato",
      subtitle: "Unire tutti gli strumenti in un sistema personale",
      sections: [
        {
          icon: "🧩",
          title: "L'Integrazione",
          content: "In questi 7 giorni hai scoperto strumenti potenti: i 3 Filtri (Pattern, Segnali, Risorse), la Spirale delle Convinzioni, i Sistemi A.Z.I.O.N.E. e C.R.E.S.C.I.T.A.\n\nOra è il momento di integrarli nel tuo modo personale di affrontare i problemi.",
          highlights: [
            "Gli strumenti funzionano insieme",
            "Ogni problema suggerisce quale usare",
            "La pratica rende tutto automatico"
          ]
        },
        {
          icon: "🔮",
          title: "Il Tuo Processo",
          content: "Non devi usare tutti gli strumenti ogni volta. Devi sapere quale usare quando. Con la pratica, la scelta diventa istintiva."
        }
      ],
      exercise: {
        instruction: "Crea il tuo \"protocollo problemi\" personale combinando gli strumenti che ti risuonano di più.",
        steps: [
          "Rivedi tutti gli strumenti dei 7 giorni",
          "Scegli i 3-4 che ti sembrano più utili",
          "Scrivi una sequenza personale",
          "Testa il protocollo su un problema attuale"
        ]
      },
      keyTakeaway: "Non impari a risolvere problemi. Ricordi che già sai farlo. Ora hai gli strumenti per farlo consapevolmente."
    }
  },

  // =====================================================
  // MICROFELICITÀ - 7 giorni
  // =====================================================
  microfelicita: {
    1: {
      title: "Il Segnale Debole",
      subtitle: "I micro-momenti esistono. Basta riconoscerli.",
      sections: [
        {
          icon: "✨",
          title: "La Felicità Invisibile",
          content: "Ogni giorno, decine di momenti positivi ti attraversano. Il calore del sole sulla pelle. L'aroma del caffè. Un sorriso inaspettato. Sono segnali deboli — esistono, ma il cervello li ignora.\n\nDaniel Kahneman ha scoperto che il cervello è \"velcro per il negativo, teflon per il positivo\". Le esperienze negative si attaccano, quelle positive scivolano via.",
          highlights: [
            "Perdi il 90% delle esperienze positive",
            "Non perché non esistono, ma perché non le noti",
            "7 secondi di attenzione cambiano tutto"
          ]
        },
        {
          icon: "🔍",
          title: "L'Esercizio del Notare",
          content: "Oggi il tuo unico compito è notare. Non cercare grandi momenti. Cerca i piccoli segnali di benessere che normalmente ignori.\n\nQuando ne noti uno, fermati. Guardalo. Sentilo. Dagli 7 secondi."
        }
      ],
      exercise: {
        instruction: "Oggi nota almeno 3 micro-momenti positivi e dai a ciascuno 7 secondi di attenzione.",
        steps: [
          "Ogni volta che senti qualcosa di piacevole, fermati",
          "Nota cosa stai provando e dove lo senti nel corpo",
          "Resta con quella sensazione per 7 secondi",
          "A fine giornata, scrivi i 3 momenti"
        ]
      },
      keyTakeaway: "La microfelicità non si costruisce. Si nota. È già lì. Basta fermarsi a vederla."
    },
    2: {
      title: "Il Metodo R.A.D.A.R.",
      subtitle: "7 secondi per intercettare il benessere",
      sections: [
        {
          icon: "📡",
          title: "R.A.D.A.R. — Il Tuo Sistema di Intercettazione",
          content: "R.A.D.A.R. è un metodo in 5 passi per catturare la microfelicità:\n\n• Riconosci — nota che qualcosa di positivo sta accadendo\n• Amplifica — espandi la sensazione nel corpo\n• Dedica — dai 7 secondi di attenzione piena\n• Ancora — collegalo a un valore o significato\n• Registra — lascia che si imprima nella memoria",
          highlights: [
            "Riconoscere richiede allenamento",
            "Amplificare moltiplica l'effetto",
            "7 secondi creano memoria"
          ]
        },
        {
          icon: "⏱️",
          title: "Perché 7 Secondi?",
          content: "La ricerca mostra che servono circa 12-20 secondi per creare una traccia memorabile. Ma 7 secondi di attenzione intenzionale sono sufficienti per iniziare il processo.\n\nSenza quei 7 secondi, il momento positivo svanisce come non fosse mai esistito."
        }
      ],
      exercise: {
        instruction: "Pratica R.A.D.A.R. almeno 3 volte oggi.",
        steps: [
          "Quando noti un momento piacevole, di' internamente \"R.A.D.A.R.\"",
          "Segui tutti e 5 i passi",
          "Nota come cambia la tua esperienza",
          "Ripeti almeno 3 volte durante la giornata"
        ]
      },
      keyTakeaway: "R.A.D.A.R. non crea felicità. La intercetta. La felicità c'è già — R.A.D.A.R. ti aiuta a coglierla."
    },
    3: {
      title: "I Cinque Canali",
      subtitle: "La microfelicità arriva da più sensi",
      sections: [
        {
          icon: "🌈",
          title: "Oltre le Emozioni",
          content: "La maggior parte delle persone cerca la felicità solo nelle emozioni. Ma la microfelicità arriva da 5 canali diversi:\n\n• Visivo — luce, colori, bellezza\n• Uditivo — suoni, silenzio, musica\n• Corporeo — sensazioni fisiche piacevoli\n• Olfattivo — profumi, sapori\n• Cognitivo — pensieri piacevoli, intuizioni",
          highlights: [
            "Se cerchi solo emozioni, perdi l'80%",
            "Ogni canale offre opportunità costanti",
            "Alcuni canali sono più \"tuoi\" di altri"
          ]
        },
        {
          icon: "🎨",
          title: "Il Tuo Canale Dominante",
          content: "Quale canale ti parla di più? Alcune persone sono più visive, altre più fisiche, altre più cognitive.\n\nScopri il tuo canale dominante, ma non ignorare gli altri. Sono tutti porte verso la microfelicità."
        }
      ],
      exercise: {
        instruction: "Oggi nota almeno un momento di microfelicità da ogni canale.",
        steps: [
          "Crea una lista con i 5 canali",
          "Durante la giornata, cerca momenti da ogni canale",
          "Segna cosa hai notato",
          "Identifica il tuo canale più attivo"
        ]
      },
      keyTakeaway: "Hai 5 porte sempre aperte verso il benessere. Oggi le stai usando tutte?"
    },
    4: {
      title: "Gli Ostacoli Invisibili",
      subtitle: "Cosa ti fa perdere i segnali positivi",
      sections: [
        {
          icon: "🚧",
          title: "I 4 Ladri di Microfelicità",
          content: "Quattro ostacoli comuni impediscono di notare la microfelicità:\n\n• La Fretta — non c'è mai tempo per fermarsi\n• Il Perfezionismo — niente è mai abbastanza\n• L'Abitudine — si dà per scontato ciò che c'è\n• La Distrazione — la mente è sempre altrove",
          highlights: [
            "Riconoscere l'ostacolo è metà della soluzione",
            "Ognuno ha il suo ladro principale",
            "Piccoli aggiustamenti fanno grandi differenze"
          ]
        },
        {
          icon: "🔑",
          title: "L'Antidoto",
          content: "Per la Fretta: micro-pause intenzionali.\nPer il Perfezionismo: accettare il \"abbastanza buono\".\nPer l'Abitudine: lo sguardo del principiante.\nPer la Distrazione: ancore nel presente."
        }
      ],
      exercise: {
        instruction: "Identifica il tuo principale \"ladro di microfelicità\" e prova il suo antidoto.",
        steps: [
          "Rivedi i 4 ostacoli",
          "Identifica quello che ti riguarda di più",
          "Leggi l'antidoto corrispondente",
          "Applicalo almeno 3 volte oggi"
        ]
      },
      keyTakeaway: "Non ti manca la felicità. Hai solo ostacoli che ti impediscono di vederla."
    },
    5: {
      title: "Nutriente vs Sabotante",
      subtitle: "Non ogni piacere ti fa bene",
      sections: [
        {
          icon: "⚖️",
          title: "Due Tipi di Piacere",
          content: "Esistono piaceri che nutrono e piaceri che sabotano. Sembrano uguali nel momento, ma lasciano tracce diverse.\n\nIl piacere nutriente costruisce. Lascia energia, chiarezza, soddisfazione.\nIl piacere sabotante compensa. Lascia vuoto, stanchezza, voglia di altro.",
          highlights: [
            "Il piacere nutriente dura oltre il momento",
            "Il piacere sabotante richiede sempre più dose",
            "Non è moralismo — è riconoscimento"
          ]
        },
        {
          icon: "🧭",
          title: "Il Test del Dopo",
          content: "Come ti senti 10 minuti dopo? Se ti senti bene, era nutriente. Se ti senti vuoto o peggio, era sabotante.\n\nNon devi eliminare i piaceri sabotanti. Devi saperli riconoscere per scegliere consapevolmente."
        }
      ],
      exercise: {
        instruction: "Analizza 3 piaceri ricorrenti e classifica ciascuno come nutriente o sabotante.",
        steps: [
          "Elenca 3 attività che ti danno piacere",
          "Per ognuna, ricorda come ti sei sentito dopo",
          "Classifica: nutriente o sabotante?",
          "Decidi se cambiare qualcosa"
        ]
      },
      keyTakeaway: "La microfelicità autentica nutre. Se dopo ti senti vuoto, era solo una compensazione."
    },
    6: {
      title: "L'Amplificazione",
      subtitle: "10 secondi per creare una traccia che resta",
      sections: [
        {
          icon: "📈",
          title: "Dall'Istante alla Memoria",
          content: "Un momento positivo dura un secondo. Ma puoi trasformarlo in una memoria che dura anni. Il segreto è l'amplificazione intenzionale.\n\nQuando noti qualcosa di bello, non lasciarlo scivolare via. Tienilo. Espandilo. Rendilo tuo.",
          highlights: [
            "10 secondi di amplificazione = memoria duratura",
            "Coinvolgere il corpo intensifica l'effetto",
            "Collegare a valori crea significato"
          ]
        },
        {
          icon: "💫",
          title: "Le 3 Tecniche di Amplificazione",
          content: "1. Respira nel momento — inspira mentre senti la sensazione positiva\n2. Espandi nel corpo — senti dove la sensazione è più forte e lasciala diffondere\n3. Collega a un valore — chiediti: cosa significa questo per me?"
        }
      ],
      exercise: {
        instruction: "Pratica le 3 tecniche di amplificazione su almeno 3 momenti positivi oggi.",
        steps: [
          "Nota un momento positivo",
          "Inspira profondamente mentre lo senti",
          "Lascia la sensazione espandersi nel corpo",
          "Chiediti: cosa significa questo per me?",
          "Resta per 10 secondi pieni"
        ]
      },
      keyTakeaway: "Non basta notare. Bisogna amplificare. Altrimenti il momento svanisce come non fosse mai esistito."
    },
    7: {
      title: "Il Radar Integrato",
      subtitle: "Unire tutto in una pratica quotidiana",
      sections: [
        {
          icon: "🎯",
          title: "Il Sistema Completo",
          content: "In questi 7 giorni hai imparato:\n\n• I Segnali Deboli esistono e vanno cercati\n• R.A.D.A.R. li intercetta\n• I 5 Canali moltiplicano le opportunità\n• Gli Ostacoli vanno riconosciuti\n• Nutriente vs Sabotante guida le scelte\n• L'Amplificazione crea memoria",
          highlights: [
            "Il sistema diventa automatico con la pratica",
            "5 minuti al giorno bastano",
            "La qualità della vita cambia notando"
          ]
        },
        {
          icon: "🌅",
          title: "La Pratica Quotidiana",
          content: "Mattina: imposta l'intenzione di notare.\nDurante il giorno: R.A.D.A.R. sui momenti positivi.\nSera: ricorda 3 momenti e amplificali.\n\nQuesto è tutto. Semplice, ma trasformativo."
        }
      ],
      exercise: {
        instruction: "Progetta la tua pratica quotidiana di microfelicità.",
        steps: [
          "Scegli un momento mattutino per l'intenzione",
          "Identifica 3 momenti in cui praticare R.A.D.A.R.",
          "Scegli un momento serale per la revisione",
          "Scrivi il tuo piano in una frase"
        ]
      },
      keyTakeaway: "La felicità non è un obiettivo da raggiungere. È una realtà da notare. Oggi inizia a vederla."
    }
  }
};

// Helper per ottenere il contenuto di un giorno specifico
export function getDayContent(challenge: ChallengeType, day: DayNumber): DayContent {
  return DAY_CONTENT[challenge][day];
}

// Helper per ottenere tutti i giorni di una challenge
export function getChallengeDays(challenge: ChallengeType): DayContent[] {
  return Object.values(DAY_CONTENT[challenge]);
}
