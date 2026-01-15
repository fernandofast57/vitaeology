// Contenuti delle Day Pages per le 3 Challenge
// 7 giorni × 3 challenge = 21 pagine
// AGGIORNATO da LEAD_MAGNET_CHALLENGE_VITAEOLOGY_v5_PULITO.md

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
  videoUrl?: string;
  sections: ContentSection[];
  exercise?: DayExercise;
  keyTakeaway: string;
}

export const DAY_CONTENT: Record<ChallengeType, Record<DayNumber, DayContent>> = {
  // =====================================================
  // LEADERSHIP AUTENTICA - 7 giorni
  // Fonte: LEAD_MAGNET v5 - "7 Giorni per Riconoscere il Leader che Sei Già"
  // =====================================================
  leadership: {
    1: {
      title: "Quello che Già Fai Senza Accorgertene",
      subtitle: "La scoperta che cambia tutto",
      principle: "Essere leader significa essere un punto di riferimento per altri. Tu lo sei già — in alcuni momenti della tua vita — anche se non ci hai mai pensato in questi termini.",
      sections: [
        {
          icon: "🚗",
          title: "Già Lo Fai",
          content: "Pensa a quando guidi l'auto su una strada che conosci bene, con un amico seduto accanto che non la conosce. In quel momento, tu sei il punto di riferimento. Lui si fida di te. Tu decidi dove andare. Non hai bisogno di un titolo o di un corso: sei semplicemente quello che sa la strada.\n\nLa stessa cosa succede in molte situazioni della tua vita, senza che tu ci faccia caso.",
          highlights: [
            "Quando un collega ti chiede \"Tu cosa faresti?\"",
            "Quando in famiglia aspettano che tu dica la tua prima di decidere",
            "Quando qualcuno ti racconta un problema e vuole sapere cosa ne pensi"
          ]
        },
        {
          icon: "👓",
          title: "Il Problema Non È Che Ti Manca",
          content: "Il problema non è che ti manca questa capacità. Il problema è che non la *noti*. È come avere gli occhiali sul naso e cercarli ovunque: ci sono, ma non li vedi perché sono troppo vicini.\n\nQuesta settimana imparerai a notare ciò che già fai."
        }
      ],
      exercise: {
        instruction: "Trova le Prove: Ripensa alla settimana appena passata e cerca 3 momenti in cui qualcuno si è rivolto a te.",
        steps: [
          "Siediti un momento e ripensa alla settimana appena passata",
          "Cerca 3 momenti in cui qualcuno ti ha chiesto un consiglio, un'opinione o una decisione",
          "Per ogni momento, scrivi: chi era, cosa ti ha chiesto, cosa hai risposto",
          "Guarda quello che hai scritto: hai la prova che qualcuno ti considera già un punto di riferimento"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "La leadership che cerchi fuori è già dentro di te. Oggi iniziamo a vederla."
    },
    2: {
      title: "La Voce che Sminuisce",
      subtitle: "Perché dici \"non conta\" quando invece conta",
      principle: "C'è una voce nella tua testa che sminuisce i tuoi successi. Funziona sempre allo stesso modo, quindi puoi imparare a riconoscerla.",
      sections: [
        {
          icon: "🗣️",
          title: "L'Impostore Interno",
          content: "Hai mai fatto un buon lavoro e subito dopo pensato \"Beh, chiunque l'avrebbe fatto\"? Oppure ricevuto un complimento e risposto \"Ma no, figurati, niente di speciale\"?\n\nQuella è la voce che sminuisce. La chiamiamo \"Impostore\" perché ti fa sentire un impostore — come se i tuoi successi non fossero davvero tuoi.",
          highlights: [
            "Fai qualcosa di buono",
            "La voce dice: \"Non conta\", \"È stato fortuna\", \"Chiunque l'avrebbe fatto\"",
            "Tu non registri il successo",
            "Ti sembra di non avere capacità"
          ]
        },
        {
          icon: "🏦",
          title: "Il Salvadanaio Bucato",
          content: "Immagina di avere un salvadanaio dove metti una moneta ogni volta che fai qualcosa di buono. Ma c'è un buco sul fondo: ogni moneta che metti cade fuori senza che tu la veda.\n\nAlla fine dell'anno apri il salvadanaio e lo trovi vuoto. Pensi: \"Non ho fatto niente di buono quest'anno.\" Ma non è vero — le monete c'erano, solo che non sono rimaste.\n\nLa voce che sminuisce è quel buco nel salvadanaio."
        }
      ],
      exercise: {
        instruction: "Vedi il Doppio Standard: riprendi i momenti di ieri e immagina che li avesse fatti qualcuno che stimi.",
        steps: [
          "Riprendi i momenti che hai scritto ieri",
          "Per ogni momento, immagina che un collega che stimi molto abbia fatto esattamente la stessa cosa",
          "Scrivi: \"Se quella persona avesse dato quel consiglio, direi che...\"",
          "Confronta: come giudichi l'azione quando la fa quella persona? E quando la fai tu?",
          "Nota la differenza: se riconosci valore quando lo fa un altro, quel valore c'è anche quando lo fai tu"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Il valore di un'azione non cambia in base a chi la compie. Impara a riconoscere il tuo."
    },
    3: {
      title: "Vedere le Cose Come Sono",
      subtitle: "La capacità che sta alla base di tutto il resto",
      principle: "Lucidità significa vedere una situazione per quello che è — non per quello che vorresti che fosse, non per quello che temi che sia. È come pulire gli occhiali: la realtà non cambia, ma tu la vedi meglio.",
      sections: [
        {
          icon: "🚗",
          title: "Il Parabrezza Sporco",
          content: "Hai presente quando guidi con il parabrezza sporco? Vedi la strada, ma non benissimo. Tutto sembra un po' confuso. Poi ti fermi, pulisci il vetro, e improvvisamente vedi ogni dettaglio.\n\nLa lucidità funziona così: non cambia la realtà, ma ti permette di vederla senza distorsioni.",
          highlights: [
            "Vedere quello che vorresti (\"Andrà tutto bene\" quando i segnali dicono il contrario)",
            "Vedere quello che temi (\"Sarà un disastro\" quando la situazione è gestibile)",
            "La lucidità sta nel mezzo: vedere quello che c'è, né meglio né peggio"
          ]
        },
        {
          icon: "💡",
          title: "La Buona Notizia",
          content: "Hai già usato la lucidità. Ogni volta che hai preso una decisione difficile guardando in faccia una realtà scomoda — anche se non ti piaceva — hai usato questa capacità.\n\nNon è qualcosa da imparare da zero. È qualcosa da usare più spesso e più consapevolmente."
        }
      ],
      exercise: {
        instruction: "Accendi la Luce su Qualcosa: pensa a qualcosa che stai evitando di guardare.",
        steps: [
          "C'è qualcosa che stai evitando di guardare nella tua vita professionale?",
          "Scrivi la situazione: \"Sto evitando di guardare: ___\"",
          "Scrivi cosa temi di scoprire: \"Se guardo davvero, potrei scoprire che: ___\"",
          "Scrivi cosa succede se non guardi: \"Se continuo a non guardare, tra 6 mesi: ___\""
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Se non vedi bene il problema, non puoi risolverlo. La lucidità è il primo passo."
    },
    4: {
      title: "Agire Anche con la Paura",
      subtitle: "Il coraggio non è quello che pensi",
      principle: "Il coraggio non è assenza di paura. È scegliere di agire anche se la paura c'è. È come attraversare una stanza buia: hai paura, ma cammini lo stesso.",
      sections: [
        {
          icon: "🚗",
          title: "La Prima Volta al Volante",
          content: "Pensa alla prima volta che hai guidato l'auto da solo, senza istruttore. Probabilmente avevi paura. Il cuore batteva forte, le mani erano sudate, controllavi lo specchietto ogni tre secondi.\n\nMa hai guidato lo stesso. Quella è stata un'azione coraggiosa. Non hai aspettato che la paura passasse. Hai agito *con* la paura.",
          highlights: [
            "Prima di agire: il cervello immagina tutti gli scenari peggiori",
            "Mentre agisci: l'attenzione si sposta sul compito, la paura diminuisce",
            "Dopo aver agito: il cervello registra \"Ok, sono sopravvissuto\" e la prossima volta sarà più facile"
          ]
        },
        {
          icon: "💪",
          title: "Il Muscolo del Coraggio",
          content: "Chi aspetta che la paura passi prima di agire, non agisce mai. Chi agisce nonostante la paura, allena il \"muscolo\" del coraggio — e ogni volta diventa un po' più facile.\n\nNon servono grandi gesti eroici. Il coraggio si costruisce con piccole azioni quotidiane."
        }
      ],
      exercise: {
        instruction: "Il Passo Più Piccolo: riprendi la situazione di ieri e fai un passo minimo.",
        steps: [
          "Riprendi la situazione che hai scritto ieri — quella che stavi evitando di guardare",
          "Chiediti: qual è il passo PIÙ PICCOLO che richiede un po' di coraggio?",
          "Non la soluzione completa. Solo il passo più piccolo possibile",
          "Scrivi: \"Il mio passo piccolo oggi è: ___\"",
          "Fallo. Oggi, non domani"
        ],
        duration: "3 minuti + 1 azione"
      },
      keyTakeaway: "La paura non passa aspettando. Passa agendo. Un piccolo passo alla volta."
    },
    5: {
      title: "Non Esaurirti",
      subtitle: "Come durare nel tempo senza bruciarti",
      principle: "Equilibrio significa sapere quando spingere e quando fermarti. È come correre una maratona: se parti troppo forte, non arrivi al traguardo.",
      sections: [
        {
          icon: "🔋",
          title: "La Batteria del Telefono",
          content: "Immagina di avere una batteria del telefono che si ricarica di notte e si scarica durante il giorno. Se usi il telefono normalmente, arrivi a sera con un po' di carica residua. Ma se lo usi al massimo — video, giochi, schermo sempre acceso — alle 3 del pomeriggio è già morto.\n\nTu funzioni allo stesso modo. Hai una quantità di energia disponibile ogni giorno.",
          highlights: [
            "Alcune cose la consumano: riunioni stressanti, conflitti, decisioni difficili",
            "Altre la ricaricano: una pausa, una conversazione piacevole, un compito completato",
            "Se spendi più di quello che recuperi, vai in rosso"
          ]
        },
        {
          icon: "🚗",
          title: "Il Motore Non È Difettoso",
          content: "Pensa a un'auto. Se la tieni sempre al massimo dei giri, il motore si surriscalda e si rompe. Non è che l'auto sia debole — è che nessun motore è progettato per andare sempre al massimo.\n\nTu non sei una macchina difettosa se hai bisogno di pause. Sei un essere umano con risorse limitate che vanno gestite."
        }
      ],
      exercise: {
        instruction: "Mappa la Tua Energia: dividi un foglio a metà e identifica cosa ti ricarica e cosa ti scarica.",
        steps: [
          "Sulla metà sinistra scrivi: \"MI RICARICA\" — elenca almeno 5 cose",
          "Sulla metà destra scrivi: \"MI SCARICA\" — elenca almeno 5 cose",
          "Guarda la tua settimana: quanto tempo dedichi a ogni colonna?",
          "Scegli UNA azione: ridurre qualcosa da \"SCARICA\" o aumentare qualcosa da \"RICARICA\""
        ],
        duration: "7 minuti"
      },
      keyTakeaway: "L'equilibrio non è debolezza. È strategia per durare nel tempo."
    },
    6: {
      title: "Il Tuo Modo Personale",
      subtitle: "Non devi copiare nessuno",
      principle: "Non esiste un modello unico di leader. Ognuno ha il suo stile naturale — alcuni sono più riflessivi, altri più decisi, altri più empatici. Tutti validi.",
      sections: [
        {
          icon: "🎵",
          title: "Come i Cantanti",
          content: "Pensa a tre cantanti che ti piacciono. Hanno voci diverse, stili diversi, modi diversi di stare sul palco. Sarebbe assurdo dire: \"L'unico modo giusto di cantare è il modo di Freddie Mercury.\" Ci sono mille modi giusti di cantare.\n\nLo stesso vale per essere un punto di riferimento. Non devi copiare lo stile di qualcun altro. Devi trovare il *tuo* modo naturale.",
          highlights: [
            "Lucido: Vede i problemi prima degli altri, anticipa, previene",
            "Deciso: Prende decisioni che altri evitano, sblocca situazioni",
            "Connettivo: Crea armonia tra le persone, costruisce squadra",
            "Creativo: Trova soluzioni non convenzionali, innova",
            "Stabile: Mantiene la calma sotto pressione, rassicura"
          ]
        },
        {
          icon: "🎯",
          title: "Il Tuo Mix",
          content: "Nessuno stile è migliore degli altri. E la maggior parte delle persone ha un mix, con uno stile dominante.\n\nSpesso gli altri vedono i nostri punti di forza meglio di noi."
        }
      ],
      exercise: {
        instruction: "Trova il Tuo Stile: raccogli i tuoi esercizi precedenti e cerca il pattern.",
        steps: [
          "Raccogli quello che hai scritto nei giorni scorsi",
          "Cerca cosa hanno in comune. Quale modo di operare emerge?",
          "Completa: \"Quando do il meglio di me come punto di riferimento, tendo a...\"",
          "(Opzionale) Chiedi a 1-2 persone: \"Secondo te, qual è il mio punto di forza nelle situazioni difficili?\""
        ],
        duration: "7 minuti"
      },
      keyTakeaway: "Il tuo stile di leadership è unico. Non è un difetto, è la tua forza."
    },
    7: {
      title: "Da Qui in Avanti",
      subtitle: "Come continuare dopo questa settimana",
      principle: "7 giorni sono l'inizio, non la fine. Per consolidare una capacità servono settimane e mesi di pratica. Ma adesso hai la base — sai cosa cercare e come cercarlo.",
      sections: [
        {
          icon: "🚗",
          title: "Come Imparare a Guidare",
          content: "Imparare qualcosa di nuovo è come imparare a guidare. La prima settimana di scuola guida non ti rende un pilota esperto — ti dà le basi. Poi, guidando tutti i giorni per mesi, quelle basi diventano automatiche.",
          highlights: [
            "Giorno 1: Sai che sei già punto di riferimento",
            "Giorno 2: Conosci la voce che sminuisce",
            "Giorno 3: Sai cos'è la lucidità",
            "Giorno 4: Sai cos'è il coraggio",
            "Giorno 5: Sai cos'è l'equilibrio",
            "Giorno 6: Conosci il tuo stile naturale"
          ]
        },
        {
          icon: "📈",
          title: "La Regola del Consolidamento",
          content: "21 giorni di pratica consapevole: l'abitudine inizia a formarsi.\n90 giorni: l'abitudine diventa stabile.\n12 mesi: trasformazione profonda.\n\nNon devi correre. Devi essere costante."
        }
      ],
      exercise: {
        instruction: "Il Tuo Piano per Continuare: definisci 3 obiettivi e il primo passo.",
        steps: [
          "Scrivi 3 obiettivi su come vuoi essere quando sei punto di riferimento",
          "Per ogni obiettivo, identifica quale capacità richiede (Lucidità, Coraggio, Equilibrio)",
          "Scegli una strada: da solo o con Vitaeology",
          "Scrivi: \"Il mio primo passo concreto questa settimana è: ___\""
        ],
        duration: "10 minuti"
      },
      keyTakeaway: "Hai le basi. Ora serve pratica costante. Il leader che cerchi è già dentro di te."
    }
  },

  // =====================================================
  // OLTRE GLI OSTACOLI - 7 giorni
  // Fonte: LEAD_MAGNET v5 - "7 Giorni per Risvegliare il Risolutore che Hai Dentro"
  // =====================================================
  ostacoli: {
    1: {
      title: "Hai Già Risolto Cose Difficili",
      subtitle: "La prova che non ti manca nulla",
      principle: "Risolvere problemi è una capacità che hai già. L'hai usata molte volte senza farci caso. Il punto non è imparare qualcosa di nuovo — è usare consapevolmente ciò che già sai fare.",
      sections: [
        {
          icon: "🚲",
          title: "Come Andare in Bicicletta",
          content: "Pensa a quando impari ad andare in bicicletta. La prima volta qualcuno ti tiene. Poi, a un certo punto, pedali da solo. Non è successo nulla di magico — semplicemente il tuo corpo ha capito come stare in equilibrio.\n\nLa capacità di risolvere problemi funziona allo stesso modo. Non è qualcosa che devi \"imparare da zero\". È qualcosa che il tuo cervello già fa — in certi momenti, in certe condizioni."
        },
        {
          icon: "🔍",
          title: "La Prova",
          content: "Pensa all'ultimo anno. Sicuramente c'è stata almeno una situazione difficile che hai risolto. Magari una scadenza impossibile che hai rispettato. Un conflitto che hai gestito. Un problema tecnico che hai sistemato.\n\nIn quel momento, non hai chiamato un esperto di \"problem solving\". Hai usato la tua testa, le tue risorse, la tua esperienza. Hai risolto.",
          highlights: [
            "Non usi questa capacità sempre",
            "A volte ti blocchi su problemi più piccoli di quelli che hai già risolto",
            "Questa settimana impari ad attivarla quando serve — non solo quando capita"
          ]
        }
      ],
      exercise: {
        instruction: "Raccogli le Prove: trova 3 situazioni difficili che hai risolto negli ultimi 2-3 anni.",
        steps: [
          "Pensa agli ultimi 2-3 anni della tua vita professionale",
          "Trova 3 situazioni difficili che hai risolto tu",
          "Per ogni situazione, scrivi: qual era il problema, cosa hai fatto che ha funzionato, come ti sei sentito dopo"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "La capacità risolutiva esiste in te. Queste prove lo dimostrano."
    },
    2: {
      title: "Vedere gli Schemi",
      subtitle: "Come trovare la causa invece di rincorrere i sintomi",
      principle: "I problemi non sono eventi isolati. Sono manifestazioni di schemi che si ripetono. Chi vede lo schema, risolve la causa. Chi non lo vede, rincorre i sintomi all'infinito.",
      sections: [
        {
          icon: "🚰",
          title: "Il Rubinetto che Perde",
          content: "Immagina di avere un rubinetto che perde. Ogni giorno metti uno straccio sotto per asciugare l'acqua. Ogni giorno lo straccio si bagna. Potresti andare avanti anni così.\n\nOppure puoi chiederti: \"Perché perde?\" Scopri che la guarnizione è usurata. Cambi la guarnizione. Il rubinetto smette di perdere. Non ti serve più lo straccio.\n\nLo straccio risolveva il *sintomo* (acqua per terra). La guarnizione risolve la *causa* (perché c'è acqua per terra)."
        },
        {
          icon: "🔄",
          title: "Il Filtro dei Pattern",
          content: "Questo vale per tutti i problemi. Un collaboratore sbaglia è un sintomo. Un collaboratore sbaglia sempre lo stesso tipo di errore è uno schema.\n\nLo schema rivela la causa (forse non ha capito una procedura, o gli manca uno strumento). Chi vede lo schema può intervenire sulla causa.",
          highlights: [
            "Il cervello umano è fatto per vedere schemi",
            "Lo fa già in automatico in molte situazioni",
            "La domanda \"Quale schema si ripete?\" accende questa capacità"
          ]
        }
      ],
      exercise: {
        instruction: "Cerca lo Schema: prendi un problema attuale e cerca il pattern che si ripete.",
        steps: [
          "Pensa a un problema attuale che ti dà fastidio",
          "Scrivi: \"Il problema è: ___\"",
          "Fatti questa domanda: \"Se fossi un detective, quale schema ripetuto scoprirei?\"",
          "Cerca: è già successo in passato? C'è un momento specifico in cui si presenta? C'è qualcuno coinvolto ogni volta?",
          "Scrivi: \"Lo schema che vedo è: ___\""
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "I pattern si ripetono. Vederli ti permette di intervenire sulla causa, non sui sintomi."
    },
    3: {
      title: "Leggere Tra le Righe",
      subtitle: "Quello che non ti dicono ma puoi capire",
      principle: "Le persone comunicano molto più di quello che dicono a parole. Il tono, i tempi, gli argomenti evitati — sono tutti segnali. Chi li legge, capisce cosa succede davvero.",
      sections: [
        {
          icon: "🗣️",
          title: "\"Va Tutto Bene\"",
          content: "Hai presente quando qualcuno ti dice \"Va tutto bene\" ma dal tono capisci che non è vero? Oppure quando ti dicono \"Non c'è fretta\" e il giorno dopo ti sollecitano?\n\nLe parole sono solo una parte della comunicazione. Spesso la parte più piccola.",
          highlights: [
            "Un cliente dice \"Ci pensiamo\" → Probabilmente ha obiezioni non espresse",
            "Un capo dice \"Buon lavoro\" senza guardarti negli occhi → Forse non è così soddisfatto",
            "Un collega evita sempre un certo argomento → Probabilmente c'è un problema lì"
          ]
        },
        {
          icon: "📡",
          title: "Il Filtro dei Segnali",
          content: "Non si tratta di \"leggere nel pensiero\". Si tratta di prestare attenzione a segnali che sono lì, visibili, ma che spesso ignoriamo perché ci concentriamo solo sulle parole.\n\nI segnali da osservare: tono delle email, tempi di risposta, argomenti evitati, linguaggio del corpo."
        }
      ],
      exercise: {
        instruction: "Ascolta i Segnali: scegli una relazione professionale importante e decodifica i segnali.",
        steps: [
          "Scegli una relazione professionale importante (capo, cliente, collaboratore, socio)",
          "Fatti questa domanda: \"Cosa mi sta comunicando che non dice a parole?\"",
          "Analizza: tono delle email, tempi di risposta, argomenti evitati, linguaggio del corpo",
          "Scrivi un'ipotesi: \"Credo che questa persona stia comunicando che: ___\""
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "Quello che non viene detto spesso è più importante di quello che viene detto."
    },
    4: {
      title: "Trovare Risorse Nascoste",
      subtitle: "Hai più carte in mano di quelle che vedi",
      principle: "Quando affronti un problema, la prima reazione è \"non ho abbastanza risorse\". Quasi sempre è falso. Ci sono risorse che non stai vedendo.",
      sections: [
        {
          icon: "🍳",
          title: "Il Frigo che Sembra Vuoto",
          content: "Immagina di dover cucinare una cena per degli ospiti che arrivano tra un'ora. Apri il frigo, lo guardi, e pensi \"Non c'è niente.\"\n\nMa se guardi meglio — se apri i cassetti, controlli il freezer, guardi nella dispensa — trovi ingredienti che non ricordavi di avere.\n\nIl problema non era che non c'era cibo. È che non avevi guardato dappertutto."
        },
        {
          icon: "🔍",
          title: "Il Filtro delle Risorse",
          content: "La prima reazione è vedere cosa manca: tempo, soldi, competenze, persone. Ma se guardi meglio, trovi risorse che non consideravi.",
          highlights: [
            "Relazioni: qualcuno che conosco può aiutare?",
            "Competenze trasferibili: cosa so fare che si applica anche qui?",
            "Cose già fatte: ho già risolto qualcosa di simile?",
            "Tempo nascosto: cosa sto facendo che potrei smettere di fare?",
            "Errori passati: cosa ho imparato dai tentativi falliti?"
          ]
        }
      ],
      exercise: {
        instruction: "L'Inventario Completo: fai un inventario di tutte le risorse che hai per il tuo problema.",
        steps: [
          "Riprendi il problema che hai identificato",
          "Fatti questa domanda: \"Cosa ho GIÀ che posso usare?\"",
          "Rispondi per ogni categoria: Persone, Competenze, Cose già fatte, Strumenti, Tempo, Errori passati",
          "Cerchia almeno 3 risorse che non avevi considerato inizialmente"
        ],
        duration: "7 minuti"
      },
      keyTakeaway: "Chi risolve problemi meglio non ha più risorse. Vede più risorse."
    },
    5: {
      title: "Il Metodo 5 Minuti",
      subtitle: "Come usare tutto insieme sotto pressione",
      principle: "I tre filtri funzionano meglio insieme, in sequenza. Schema → Segnali → Risorse → Azione. Il tutto in 5 minuti, anche sotto pressione.",
      sections: [
        {
          icon: "🧩",
          title: "I Tre Ingredienti",
          content: "Nei giorni scorsi hai visto tre strumenti separati:\n1. Cercare schemi (Giorno 2)\n2. Leggere segnali (Giorno 3)\n3. Trovare risorse (Giorno 4)\n\nSono come tre ingredienti di una ricetta. Separati sono utili. Insieme sono potenti."
        },
        {
          icon: "⚡",
          title: "La Sequenza",
          content: "1. Prima lo schema: Capisci la struttura del problema (non solo i sintomi)\n2. Poi i segnali: Capisci cosa succede davvero (non solo quello che viene detto)\n3. Poi le risorse: Capisci cosa hai per agire (non solo cosa manca)\n4. Infine l'azione: Decidi il prossimo passo",
          highlights: [
            "Il cervello si blocca senza struttura",
            "Le domande specifiche guidano il pensiero",
            "Un'azione imperfetta è meglio di un'analisi infinita"
          ]
        }
      ],
      exercise: {
        instruction: "Il Metodo Completo: usa un timer di 5 minuti e applica tutti e tre i filtri.",
        steps: [
          "Scegli un problema attuale. Imposta il timer a 5 minuti",
          "MINUTO 1-2 — SCHEMA: \"Quale schema si ripete?\"",
          "MINUTO 2-3 — SEGNALI: \"Cosa non viene detto? Quali bisogni nascosti?\"",
          "MINUTO 3-4 — RISORSE: \"Cosa ho già che posso usare?\"",
          "MINUTO 4-5 — AZIONE: \"Qual è UNA cosa concreta che faccio entro domani?\""
        ],
        duration: "5 minuti esatti"
      },
      keyTakeaway: "Hai già le idee. Ora hai anche un sistema per trasformarle in risultati."
    },
    6: {
      title: "I Traditori Silenziosi",
      subtitle: "La voce che ti ferma prima di iniziare",
      principle: "A volte vedi lo schema, i segnali e le risorse — ma resti bloccato. In quel caso il problema non è fuori. È una voce dentro che ti frena. Se la riconosci, perde potere.",
      sections: [
        {
          icon: "🎭",
          title: "Le Credenze Travestite",
          content: "Hai presente quella vocina che dice \"E se va male?\" oppure \"Chi ti credi di essere?\" oppure \"Meglio non rischiare\"?\n\nQuella voce ha uno scopo: proteggerti. Cerca di evitarti fallimenti, figuracce, dolore. Il problema è che lo fa bloccandoti — anche quando agire sarebbe la cosa giusta."
        },
        {
          icon: "🌀",
          title: "I 3 Traditori Silenziosi",
          content: "Le convinzioni limitanti operano in silenzio. I tre Traditori più comuni sono:\n\n• Il Paralizzante: \"Devo avere tutte le informazioni prima di agire\"\n• Il Timoroso: \"È meglio non agire che agire e sbagliare\"\n• Il Procrastinatore: \"Devo aspettare il momento perfetto\"\n\nSembrano ragionevoli, ma sono sabotatrici. Le chiamiamo Traditori Silenziosi perché tradiscono il tuo potenziale mentre sembrano proteggerti.",
          highlights: [
            "Il Paralizzante si traveste da \"prudenza\"",
            "Il Timoroso si traveste da \"pensiero strategico\"",
            "Il Procrastinatore si traveste da \"timing intelligente\""
          ]
        }
      ],
      exercise: {
        instruction: "Riconosci e Rispondi: identifica quale Traditore ti ha bloccato e rispondigli.",
        steps: [
          "Riprendi l'azione del Giorno 5. L'hai già fatta?",
          "Se no, chiediti: quale credenza mi ha fermato?",
          "Identifica il Traditore (Paralizzante, Timoroso, Procrastinatore)",
          "Rispondi per iscritto: \"Ti ho riconosciuto, [nome]. Ma la verità è: [il contrario]\"",
          "Fai l'azione prima di sera"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "I Traditori perdono potere quando li riconosci. Smascherarli è metà della vittoria."
    },
    7: {
      title: "Da Qui in Avanti",
      subtitle: "Come continuare dopo questa settimana",
      principle: "Gli strumenti si arrugginiscono se non li usi. L'unico modo per mantenere attiva la capacità risolutiva è usarla su problemi reali, regolarmente.",
      sections: [
        {
          icon: "🗣️",
          title: "Come una Lingua Straniera",
          content: "Pensa a una lingua straniera che hai studiato a scuola. Se l'hai usata spesso, la ricordi ancora. Se non l'hai mai usata dopo, l'hai dimenticata.\n\nLa capacità risolutiva funziona allo stesso modo. Non basta \"sapere\" che esistono gli strumenti. Bisogna usarli.",
          highlights: [
            "Giorno 1: La prova che sai già risolvere",
            "Giorno 2: Come vedere schemi ripetuti",
            "Giorno 3: Come leggere segnali non detti",
            "Giorno 4: Come trovare risorse nascoste",
            "Giorno 5: Come usare tutto in 5 minuti",
            "Giorno 6: Come riconoscere le voci che bloccano"
          ]
        },
        {
          icon: "📈",
          title: "La Regola del Mantenimento",
          content: "Uso frequente = rafforzamento\nNon uso = indebolimento\n\nNon serve usarli ogni giorno. Ma ogni volta che affronti un problema non banale, hai un'occasione per praticare."
        }
      ],
      exercise: {
        instruction: "Il Piano per Continuare: definisci il prossimo problema e quando userai il metodo.",
        steps: [
          "Scrivi: \"Il prossimo problema che affronterò con il metodo è: ___\"",
          "Decidi quando userai il metodo (minimo: ogni settimana su un problema)",
          "Imposta un promemoria nel calendario",
          "Scrivi: \"Il mio primo passo questa settimana è: ___\""
        ],
        duration: "10 minuti"
      },
      keyTakeaway: "Hai gli strumenti. Ora usali regolarmente. Il risolutore è già in te — attivalo."
    }
  },

  // =====================================================
  // MICROFELICITÀ - 7 giorni
  // Fonte: LEAD_MAGNET v5 - "7 Giorni per Notare il Benessere che Già Ti Attraversa"
  // =====================================================
  microfelicita: {
    1: {
      title: "Quello che Ti Perdi Ogni Giorno",
      subtitle: "La scoperta più semplice (e più ignorata)",
      principle: "Ogni giorno ti succedono piccole cose piacevoli. Non le noti. Il problema non è che mancano — è che non le registri.",
      sections: [
        {
          icon: "📱",
          title: "Guardare il Telefono",
          content: "Immagina di camminare per strada guardando il telefono. Intorno a te ci sono persone, vetrine, alberi, un cielo interessante. Ma tu non vedi niente di tutto questo perché stai fissando lo schermo.\n\nQuesto è quello che succede con le piccole cose piacevoli della giornata. Ci sono — ma il tuo cervello è \"occupato\" con altro."
        },
        {
          icon: "🧠",
          title: "Perché Succede",
          content: "Il cervello umano è fatto per notare i problemi. È una questione di sopravvivenza: i nostri antenati che notavano i pericoli vivevano più a lungo. Quelli distratti venivano mangiati dai predatori.",
          highlights: [
            "50 piccole cose piacevoli al giorno → ne noti 2-3",
            "10 cose negative al giorno → le noti tutte e 10",
            "Fine giornata: \"Non è successo niente di buono\""
          ]
        }
      ],
      exercise: {
        instruction: "Il Primo Inventario: stasera, prima di dormire, trova 3 momenti piacevoli della giornata.",
        steps: [
          "Siediti un momento e ripensa alla giornata di oggi",
          "Cerca 3 momenti piacevoli, anche piccoli (un sapore, un silenzio, un sorriso, una luce)",
          "Scrivi i 3 momenti brevemente",
          "Se ne trovi meno di 3, è normale — il radar non è ancora calibrato"
        ],
        duration: "3 minuti"
      },
      keyTakeaway: "Il benessere non manca. Non lo noti. Questa settimana impari a vederlo."
    },
    2: {
      title: "La Matematica dei Momenti",
      subtitle: "Perché piccolo batte grande",
      principle: "Il benessere quotidiano dipende da quante volte stai bene, non da quanto intensamente stai bene. 50 momenti piccoli battono 4 momenti grandi.",
      sections: [
        {
          icon: "🔢",
          title: "Facciamo i Conti",
          content: "Pensa ai momenti \"grandi\" di felicità: vacanze, promozioni, matrimoni. Quanti ne hai in un anno? 3-4.\n\nOra pensa ai momenti \"piccoli\": un caffè buono, una risata, un lavoro finito, un bel tramonto. Quanti potrebbero essercene ogni giorno? 50? 100?",
          highlights: [
            "Momenti grandi: ~4 all'anno",
            "Momenti piccoli (se li noti): ~18.000 all'anno",
            "Se il tuo benessere dipende solo dai grandi: 4 occasioni",
            "Se noti i piccoli: migliaia di occasioni"
          ]
        },
        {
          icon: "🧠",
          title: "L'Adattamento",
          content: "C'è di più: i momenti grandi perdono effetto nel tempo. Il cervello si abitua. Una promozione ti rende felice per qualche settimana, poi torni allo stato normale.\n\nI momenti piccoli, invece, funzionano ogni volta — se li noti consapevolmente. Non c'è adattamento perché ogni momento è nuovo."
        }
      ],
      exercise: {
        instruction: "Intercetta in Tempo Reale: oggi intercetta 3 momenti piacevoli mentre succedono.",
        steps: [
          "Oggi l'obiettivo è intercettare 3 momenti *mentre succedono* — non alla sera a memoria",
          "Quando succede qualcosa di piacevole: fermati mentalmente per 3 secondi",
          "Di' a te stesso: \"Questo. Proprio questo.\"",
          "Non analizzare. Solo nota.",
          "Alla sera, conta: quanti ne hai intercettati?"
        ],
        duration: "3 secondi per volta, tutto il giorno"
      },
      keyTakeaway: "La felicità non è trovare eventi straordinari. È notare eventi ordinari."
    },
    3: {
      title: "I 5 Passi per Notare",
      subtitle: "R.A.D.A.R.: un metodo semplice da usare sempre",
      principle: "R.A.D.A.R. = Rileva → Accogli → Distingui → Amplifica → Resta. Cinque passi per notare un momento piacevole mentre accade. Tempo totale: 10 secondi.",
      sections: [
        {
          icon: "⭐",
          title: "La Stella Cadente",
          content: "I momenti piacevoli piccoli durano pochissimo. Se non li \"catturi\" nei primi 2 secondi, svaniscono.\n\nÈ come vedere una stella cadente. Se non guardi subito, l'hai persa. Non puoi dire \"la guarderò dopo\" — dopo non c'è più."
        },
        {
          icon: "📡",
          title: "I 5 Passi di R.A.D.A.R.",
          content: "R = Rileva: Noti che sta succedendo qualcosa di piacevole (1-2 sec)\nA = Accogli: Lasci che la sensazione arrivi senza giudicarla (1-2 sec)\nD = Distingui: Ti chiedi \"Questo mi nutre o mi sabota?\" (1-2 sec)\nA = Amplifica: Mantieni l'attenzione per qualche secondo in più (3-5 sec)\nR = Resta: Lasci che il focus si ritiri naturalmente (2 sec)",
          highlights: [
            "Tempo totale: ~10 secondi",
            "Sembra semplice — e lo è",
            "La semplicità è il punto: deve essere così facile che lo fai davvero"
          ]
        }
      ],
      exercise: {
        instruction: "Le Prime 3 Prove: applica R.A.D.A.R. a 3 occasioni specifiche oggi.",
        steps: [
          "OCCASIONE 1: Il primo caffè/tè della giornata — applica R.A.D.A.R.",
          "OCCASIONE 2: Un momento di silenzio/pausa — applica R.A.D.A.R.",
          "OCCASIONE 3: Qualsiasi momento a tua scelta — applica R.A.D.A.R.",
          "Alla sera, scrivi: quante volte l'ho fatto? È stato facile o difficile?"
        ],
        duration: "30 secondi totali, distribuiti"
      },
      keyTakeaway: "R.A.D.A.R.: Rileva, Accogli, Distingui, Amplifica, Resta. 10 secondi per catturare il benessere."
    },
    4: {
      title: "Gli Errori da Evitare",
      subtitle: "Se non funziona, probabilmente stai facendo uno di questi",
      principle: "R.A.D.A.R. può fallire per 4 errori comuni. Tutti facili da correggere una volta che li conosci.",
      sections: [
        {
          icon: "🔍",
          title: "Errore 1 e 2",
          content: "ERRORE 1: Cercare invece di notare\nSintomo: \"Dove sono questi momenti? Non li trovo!\"\nCorrezione: Non cercare. Aspetta con attenzione aperta.\n\nERRORE 2: Aspettare sensazioni forti\nSintomo: \"Non sento niente di speciale\"\nCorrezione: Abbassa la soglia. Se qualcosa è piacevole anche solo un po', conta."
        },
        {
          icon: "🧠",
          title: "Errore 3 e 4",
          content: "ERRORE 3: Analizzare troppo\nSintomo: \"Ma cosa significa? Perché lo provo?\"\nCorrezione: Prima senti (3 secondi), poi eventualmente analizza.\n\nERRORE 4: Fare R.A.D.A.R. solo in momenti speciali\nSintomo: \"Lo faccio quando sono rilassato\"\nCorrezione: Fallo durante attività normali — lavarsi le mani, camminare, sedersi."
        }
      ],
      exercise: {
        instruction: "Correggi il Tuo Errore: identifica quale errore ti appartiene di più e applica la correzione.",
        steps: [
          "Identifica il tuo errore principale (1, 2, 3 o 4)",
          "Scrivi: \"Il mio errore è: ___\"",
          "Applica la correzione specifica per quell'errore",
          "Scegli UN momento ordinario della giornata e applica R.A.D.A.R. lì"
        ],
        duration: "5 minuti + pratica"
      },
      keyTakeaway: "Gli errori sono normali. Correggerli è semplice. Non smettere di provare."
    },
    5: {
      title: "Quando la Giornata È Dura",
      subtitle: "R.A.D.A.R. non cancella il negativo — lo bilancia",
      principle: "La microfelicità non nega i problemi. Aggiunge quello che manca. Anche nelle giornate difficili, qualcosa di piacevole c'è — solo che non lo vedi perché il negativo prende tutta l'attenzione.",
      sections: [
        {
          icon: "🔦",
          title: "Il Riflettore",
          content: "Quando hai una giornata difficile, il cervello fa zoom sul negativo. Tutto il resto scompare dalla vista.\n\nÈ come avere un riflettore puntato su una cosa: quella cosa la vedi benissimo, ma tutto il resto della stanza è al buio."
        },
        {
          icon: "📊",
          title: "Completare il Quadro",
          content: "R.A.D.A.R. non serve a *negare* il negativo. Non ti sto dicendo \"pensa positivo\". Il negativo è reale e merita attenzione.\n\nR.A.D.A.R. serve a *completare* il quadro. A vedere tutto, non solo il negativo.\n\nÈ come fare un bilancio economico: se scrivi solo le spese, pensi \"Sono in rosso!\" Ma non hai scritto le entrate. Il bilancio vero include entrambe.",
          highlights: [
            "\"Nonostante\" non \"invece di\"",
            "I due coesistono",
            "R.A.D.A.R. aggiunge le \"entrate\" che il cervello ha ignorato"
          ]
        }
      ],
      exercise: {
        instruction: "Completa il Quadro: riconosci il negativo E cerca il positivo nonostante tutto.",
        steps: [
          "Scrivi cosa di negativo è successo oggi: \"Oggi il negativo è stato: ___\"",
          "Domanda chiave: \"Nonostante tutto, cosa di positivo è successo?\"",
          "Trova almeno 2 cose positive (anche piccole: ho respirato, ero al sicuro, qualcuno mi ha considerato)",
          "Scrivi entrambi: il negativo E il positivo"
        ],
        duration: "5 minuti"
      },
      keyTakeaway: "R.A.D.A.R. non nega il negativo. Lo bilancia con quello che c'è già di positivo."
    },
    6: {
      title: "Come Farlo Diventare Automatico",
      subtitle: "Il segreto per non dimenticare",
      principle: "Un'abitudine nuova diventa automatica quando la colleghi a qualcosa che già fai. Non devi \"ricordarti\" di fare R.A.D.A.R. — il gesto che già fai te lo ricorda.",
      sections: [
        {
          icon: "💊",
          title: "Le Vitamine Vicino al Caffè",
          content: "La maggior parte delle buone intenzioni fallisce per un motivo semplice: dipendono dalla memoria. \"Mi ricorderò di farlo\" — ma poi non te lo ricordi.\n\nMolte persone tengono le vitamine vicino al caffè. Perché? Perché il caffè lo bevono già ogni mattina senza pensarci. Vedere le vitamine mentre fanno il caffè glielo ricorda."
        },
        {
          icon: "🔗",
          title: "La Formula",
          content: "Invece di \"mi ricorderò di fare R.A.D.A.R.\" dici:\n\n\"Quando [cosa che già faccio], faccio R.A.D.A.R.\"\n\nX può essere: bere il primo caffè, sederti in macchina, lavarti le mani dopo pranzo, aprire il laptop, chiudere la porta di casa.\n\nDopo qualche settimana, il collegamento diventa automatico.",
          highlights: [
            "Un solo aggancio è sufficiente",
            "Meglio una cosa tutti i giorni che cinque cose per tre giorni",
            "Puoi aggiungere un promemoria visivo (post-it, nota telefono)"
          ]
        }
      ],
      exercise: {
        instruction: "Scegli il Tuo Aggancio: collega R.A.D.A.R. a qualcosa che già fai ogni giorno.",
        steps: [
          "Scorri la lista: caffè, sederti in macchina, aprire il laptop, lavarti le mani, inizio pasto, uscire di casa, tornare a casa",
          "Scegli UNA di queste azioni",
          "Scrivi: \"Quando ___, faccio R.A.D.A.R.\"",
          "Fallo oggi almeno una volta"
        ],
        duration: "3 minuti + 1 pratica"
      },
      keyTakeaway: "Notare è il primo passo. Amplificare trasforma l'istante in memoria duratura."
    },
    7: {
      title: "Da Qui in Avanti",
      subtitle: "Come continuare dopo questa settimana",
      principle: "7 giorni sono l'inizio. Servono 21 giorni perché qualcosa diventi abitudine. Servono mesi perché diventi parte di te. Ma adesso hai tutto quello che serve per iniziare.",
      sections: [
        {
          icon: "📈",
          title: "Le Fasi",
          content: "Imparare qualcosa di nuovo ha fasi precise:\n\n• Base (Giorni 1-7): Capisci il concetto, fai le prime prove\n• Abitudine (Giorni 8-28): Lo fai regolarmente, a volte dimentichi\n• Automatismo (Mesi 2-3): Lo fai senza pensarci\n• Trasformazione (Mesi 4-12): Fa parte di come sei\n\nSei alla fine della fase Base. Hai capito cosa fare. Ora serve pratica.",
          highlights: [
            "Giorno 1: I momenti ci sono — non li noti",
            "Giorno 2: Tanti piccoli battono pochi grandi",
            "Giorno 3: R.A.D.A.R. in 5 passi",
            "Giorno 4: 4 errori comuni",
            "Giorno 5: Non nega il negativo",
            "Giorno 6: Collegalo a qualcosa che già fai"
          ]
        },
        {
          icon: "🎯",
          title: "La Regola per i Prossimi 21 Giorni",
          content: "Fai R.A.D.A.R. almeno una volta al giorno, collegato all'aggancio che hai scelto.\n\nNon deve essere perfetto. Deve essere *costante*.\n\nObiettivo: 21 X di fila. Se salti un giorno, ricomincia il conteggio."
        }
      ],
      exercise: {
        instruction: "Il Piano per le Prossime 3 Settimane: conferma il tuo aggancio e inizia il conteggio.",
        steps: [
          "Conferma il tuo aggancio: \"Quando ___, faccio R.A.D.A.R.\"",
          "Imposta un modo per tenere traccia (calendario, app, nota)",
          "Obiettivo: 21 X di fila",
          "Rispondi: \"Se notassi 10 momenti positivi in più ogni giorno, come cambierebbe la mia settimana?\""
        ],
        duration: "10 minuti"
      },
      keyTakeaway: "Il benessere che cerchi ti sta già attraversando. Ora sai come notarlo."
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
