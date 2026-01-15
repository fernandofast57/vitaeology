// Template email per i 7 giorni delle Challenge
// Basati su LEAD_MAGNET_CHALLENGE_VITAEOLOGY_v5_PULITO.md

type ChallengeKey = 'leadership-autentica' | 'oltre-ostacoli' | 'microfelicità';
type DayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface EmailContent {
  subject: string;
  html: string;
}

// Configurazione colori e nomi per ogni challenge
const CHALLENGE_CONFIG = {
  'leadership-autentica': {
    name: 'Leadership Autentica',
    color: '#D4AF37', // Oro Vitaeology
    urlPath: 'leadership',
    tag: 'challenge-leadership'
  },
  'oltre-ostacoli': {
    name: 'Oltre gli Ostacoli',
    color: '#10B981', // Emerald
    urlPath: 'ostacoli',
    tag: 'challenge-ostacoli'
  },
  'microfelicità': {
    name: 'Microfelicità',
    color: '#8B5CF6', // Violet
    urlPath: 'microfelicita',
    tag: 'challenge-microfelicita'
  }
};

// Titoli e subject lines per ogni giorno di ogni challenge
const DAY_TITLES: Record<ChallengeKey, Record<DayNumber, { title: string; subject: string }>> = {
  'leadership-autentica': {
    1: {
      title: "Quello che Già Fai Senza Accorgertene",
      subject: "Giorno 1: La leadership che non vedi"
    },
    2: {
      title: "La Voce che Sminuisce",
      subject: "Giorno 2: Il salvadanaio bucato"
    },
    3: {
      title: "Vedere le Cose Come Sono",
      subject: "Giorno 3: Il parabrezza sporco"
    },
    4: {
      title: "Agire Anche con la Paura",
      subject: "Giorno 4: Il muscolo del coraggio"
    },
    5: {
      title: "Non Esaurirti",
      subject: "Giorno 5: La batteria del telefono"
    },
    6: {
      title: "Il Tuo Modo Personale",
      subject: "Giorno 6: Come i cantanti"
    },
    7: {
      title: "Da Qui in Avanti",
      subject: "Giorno 7: Come imparare a guidare"
    }
  },
  'oltre-ostacoli': {
    1: {
      title: "Hai Già Risolto Cose Difficili",
      subject: "Giorno 1: La prova che non ti manca nulla"
    },
    2: {
      title: "Vedere gli Schemi",
      subject: "Giorno 2: Il rubinetto che perde"
    },
    3: {
      title: "Leggere Tra le Righe",
      subject: "Giorno 3: Quello che non ti dicono"
    },
    4: {
      title: "Trovare Risorse Nascoste",
      subject: "Giorno 4: Il frigo che sembra vuoto"
    },
    5: {
      title: "Il Metodo 5 Minuti",
      subject: "Giorno 5: Schema, Segnali, Risorse, Azione"
    },
    6: {
      title: "I Traditori Silenziosi",
      subject: "Giorno 6: Le credenze travestite"
    },
    7: {
      title: "Da Qui in Avanti",
      subject: "Giorno 7: Come una lingua straniera"
    }
  },
  'microfelicità': {
    1: {
      title: "Quello che Ti Perdi Ogni Giorno",
      subject: "Giorno 1: I 50 momenti che non vedi"
    },
    2: {
      title: "La Matematica dei Momenti",
      subject: "Giorno 2: Perché piccolo batte grande"
    },
    3: {
      title: "I 5 Passi per Notare",
      subject: "Giorno 3: R.A.D.A.R. in 10 secondi"
    },
    4: {
      title: "Gli Errori da Evitare",
      subject: "Giorno 4: I 4 errori che bloccano R.A.D.A.R."
    },
    5: {
      title: "Quando la Giornata È Dura",
      subject: "Giorno 5: Completare il quadro"
    },
    6: {
      title: "Come Farlo Diventare Automatico",
      subject: "Giorno 6: Le vitamine vicino al caffè"
    },
    7: {
      title: "Da Qui in Avanti",
      subject: "Giorno 7: I prossimi 21 giorni"
    }
  }
};

// Contenuti email per Leadership Autentica
const LEADERSHIP_EMAILS: Record<DayNumber, (nome: string) => string> = {
  1: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Pensa a quando guidi l'auto su una strada che conosci bene, con un amico seduto accanto che non la conosce. In quel momento, tu sei il punto di riferimento. Lui si fida di te. Tu decidi dove andare.</p>

    <p>Non hai bisogno di un titolo o di un corso: sei semplicemente <strong>quello che sa la strada</strong>.</p>

    <p>La stessa cosa succede in molte situazioni della tua vita, senza che tu lo noti consapevolmente:</p>
    <ul>
      <li>Quando un collega ti chiede "Tu cosa faresti?"</li>
      <li>Quando in famiglia aspettano che tu dica la tua prima di decidere</li>
      <li>Quando qualcuno ti racconta un problema e vuole sapere cosa ne pensi</li>
    </ul>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (5 minuti):</strong></p>
      <p style="margin: 10px 0 0 0;">Ripensa alla settimana appena passata e cerca 3 momenti in cui qualcuno ti ha chiesto un consiglio, un'opinione o una decisione. Per ogni momento, scrivi chi era, cosa ti ha chiesto, cosa hai risposto.</p>
    </div>

    <p>Guarda quello che hai scritto: hai la <strong>prova</strong> che qualcuno ti considera già un punto di riferimento.</p>
  `,
  2: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Hai mai fatto un buon lavoro e subito dopo pensato "Beh, chiunque l'avrebbe fatto"?</p>

    <p>Quella è la <strong>voce che sminuisce</strong>. La chiamiamo "Impostore" perché ti fa sentire un impostore — come se i tuoi successi non fossero davvero tuoi.</p>

    <p>Immagina di avere un <strong>salvadanaio</strong> dove metti una moneta ogni volta che fai qualcosa di buono. Ma c'è un buco sul fondo: ogni moneta che metti cade fuori senza che tu la veda.</p>

    <p>Alla fine dell'anno apri il salvadanaio e lo trovi vuoto. Pensi: "Non ho fatto niente di buono quest'anno." Ma non è vero — le monete c'erano, solo che non sono rimaste.</p>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (5 minuti):</strong></p>
      <p style="margin: 10px 0 0 0;">Riprendi i momenti di ieri. Per ogni momento, immagina che un collega che stimi molto abbia fatto esattamente la stessa cosa. Come giudichi l'azione quando la fa quella persona? E quando la fai tu?</p>
    </div>

    <p><em>Il valore di un'azione non cambia in base a chi la compie.</em></p>
  `,
  3: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Hai presente quando guidi con il <strong>parabrezza sporco</strong>? Vedi la strada, ma non benissimo. Tutto sembra un po' confuso. Poi ti fermi, pulisci il vetro, e improvvisamente vedi ogni dettaglio.</p>

    <p>La <strong>lucidità</strong> funziona così: non cambia la realtà, ma ti permette di vederla senza distorsioni.</p>

    <p>Le due distorsioni più comuni:</p>
    <ul>
      <li><strong>Vedere quello che vorresti</strong> ("Andrà tutto bene" quando i segnali dicono il contrario)</li>
      <li><strong>Vedere quello che temi</strong> ("Sarà un disastro" quando la situazione è gestibile)</li>
    </ul>

    <p>La lucidità sta nel mezzo: vedere quello che c'è, né meglio né peggio.</p>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (5 minuti):</strong></p>
      <p style="margin: 10px 0 0 0;">C'è qualcosa che stai evitando di guardare nella tua vita professionale? Scrivi cosa temi di scoprire e cosa succede se non guardi.</p>
    </div>

    <p><em>Se non vedi bene il problema, non puoi risolverlo.</em></p>
  `,
  4: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Pensa alla <strong>prima volta che hai guidato</strong> l'auto da solo, senza istruttore. Probabilmente avevi paura. Il cuore batteva forte, le mani erano sudate.</p>

    <p>Ma hai guidato lo stesso. Quella è stata un'azione coraggiosa.</p>

    <p>Il <strong>coraggio</strong> non è assenza di paura. È scegliere di agire anche se la paura c'è.</p>

    <p>Come funziona:</p>
    <ul>
      <li>Prima di agire: il cervello immagina tutti gli scenari peggiori</li>
      <li>Mentre agisci: l'attenzione si sposta sul compito, la paura diminuisce</li>
      <li>Dopo aver agito: il cervello registra "Ok, sono sopravvissuto"</li>
    </ul>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (3 minuti + 1 azione):</strong></p>
      <p style="margin: 10px 0 0 0;">Riprendi la situazione di ieri — quella che stavi evitando. Qual è il passo PIÙ PICCOLO che richiede un po' di coraggio? Non la soluzione completa. Solo il passo più piccolo possibile. Fallo oggi.</p>
    </div>

    <p><em>La paura non passa aspettando. Passa agendo.</em></p>
  `,
  5: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Immagina di avere una <strong>batteria del telefono</strong> che si ricarica di notte e si scarica durante il giorno. Se usi il telefono normalmente, arrivi a sera con un po' di carica residua. Ma se lo usi al massimo — video, giochi, schermo sempre acceso — alle 3 del pomeriggio è già morto.</p>

    <p>Tu funzioni allo stesso modo. Hai una quantità di energia disponibile ogni giorno:</p>
    <ul>
      <li>Alcune cose la <strong>consumano</strong>: riunioni stressanti, conflitti, decisioni difficili</li>
      <li>Altre la <strong>ricaricano</strong>: una pausa, una conversazione piacevole, un compito completato</li>
    </ul>

    <p>L'<strong>equilibrio</strong> significa sapere quando spingere e quando fermarti.</p>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (7 minuti):</strong></p>
      <p style="margin: 10px 0 0 0;">Dividi un foglio a metà. A sinistra: "MI RICARICA" (elenca 5 cose). A destra: "MI SCARICA" (elenca 5 cose). Guarda la tua settimana: quanto tempo dedichi a ogni colonna?</p>
    </div>

    <p><em>L'equilibrio non è debolezza. È strategia per durare nel tempo.</em></p>
  `,
  6: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Pensa a tre <strong>cantanti</strong> che ti piacciono. Hanno voci diverse, stili diversi, modi diversi di stare sul palco. Sarebbe assurdo dire: "L'unico modo giusto di cantare è il modo di Freddie Mercury."</p>

    <p>Lo stesso vale per essere un punto di riferimento. Non serve copiare lo stile di qualcun altro. Il punto è trovare il <strong>tuo modo naturale</strong>.</p>

    <p>Gli stili naturali più comuni:</p>
    <ul>
      <li><strong>Lucido</strong>: Vede i problemi prima degli altri, anticipa, previene</li>
      <li><strong>Deciso</strong>: Prende decisioni che altri evitano, sblocca situazioni</li>
      <li><strong>Connettivo</strong>: Crea armonia tra le persone, costruisce squadra</li>
      <li><strong>Creativo</strong>: Trova soluzioni non convenzionali, innova</li>
      <li><strong>Stabile</strong>: Mantiene la calma sotto pressione, rassicura</li>
    </ul>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (7 minuti):</strong></p>
      <p style="margin: 10px 0 0 0;">Raccogli quello che hai scritto nei giorni scorsi e cerca cosa hanno in comune. Completa: "Quando do il meglio di me come punto di riferimento, tendo a..."</p>
    </div>

    <p><em>Il tuo stile di leadership è unico. Non è un difetto, è la tua forza.</em></p>
  `,
  7: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Imparare qualcosa di nuovo è come <strong>imparare a guidare</strong>. La prima settimana di scuola guida non ti rende un pilota esperto — ti dà le basi. Poi, guidando tutti i giorni per mesi, quelle basi diventano automatiche.</p>

    <p>Ecco cosa hai imparato questa settimana:</p>
    <ul>
      <li><strong>Giorno 1</strong>: Sai che sei già punto di riferimento</li>
      <li><strong>Giorno 2</strong>: Conosci la voce che sminuisce</li>
      <li><strong>Giorno 3</strong>: Sai cos'è la lucidità</li>
      <li><strong>Giorno 4</strong>: Sai cos'è il coraggio</li>
      <li><strong>Giorno 5</strong>: Sai cos'è l'equilibrio</li>
      <li><strong>Giorno 6</strong>: Conosci il tuo stile naturale</li>
    </ul>

    <p><strong>La regola del consolidamento:</strong></p>
    <ul>
      <li>21 giorni di pratica: l'abitudine inizia a formarsi</li>
      <li>90 giorni: l'abitudine diventa stabile</li>
      <li>12 mesi: trasformazione profonda</li>
    </ul>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio finale (10 minuti):</strong></p>
      <p style="margin: 10px 0 0 0;">Scrivi 3 obiettivi su come vuoi essere quando sei punto di riferimento. Per ogni obiettivo, identifica quale capacità richiede. Scrivi: "Il mio primo passo concreto questa settimana è: ___"</p>
    </div>

    <p><em>Hai le basi. Ora serve pratica costante. Il leader che cerchi è già dentro di te.</em></p>
  `
};

// Contenuti email per Oltre gli Ostacoli
const OSTACOLI_EMAILS: Record<DayNumber, (nome: string) => string> = {
  1: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Pensa a quando impari ad <strong>andare in bicicletta</strong>. La prima volta qualcuno ti tiene. Poi, a un certo punto, pedali da solo. Non è successo nulla di magico — semplicemente il tuo corpo ha capito come stare in equilibrio.</p>

    <p>La capacità di risolvere problemi funziona allo stesso modo. Non è qualcosa che devi "imparare da zero". È qualcosa che il tuo cervello <strong>già fa</strong>.</p>

    <p>Pensa all'ultimo anno. Sicuramente c'è stata almeno una situazione difficile che hai risolto. In quel momento, non hai chiamato un esperto di "problem solving". Hai usato la tua testa, le tue risorse, la tua esperienza.</p>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (5 minuti):</strong></p>
      <p style="margin: 10px 0 0 0;">Trova 3 situazioni difficili che hai risolto negli ultimi 2-3 anni. Per ogni situazione, scrivi: qual era il problema, cosa hai fatto che ha funzionato, come ti sei sentito dopo.</p>
    </div>

    <p><em>La capacità risolutiva esiste in te. Queste prove lo dimostrano.</em></p>
  `,
  2: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Immagina di avere un <strong>rubinetto che perde</strong>. Ogni giorno metti uno straccio sotto per asciugare l'acqua. Potresti andare avanti anni così.</p>

    <p>Oppure puoi chiederti: "Perché perde?" Scopri che la guarnizione è usurata. Cambi la guarnizione. Il rubinetto smette di perdere.</p>

    <p>Lo straccio risolveva il <strong>sintomo</strong> (acqua per terra). La guarnizione risolve la <strong>causa</strong>.</p>

    <p>Chi vede lo <strong>schema</strong> che si ripete, risolve la causa. Chi non lo vede, rincorre i sintomi all'infinito.</p>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (5 minuti):</strong></p>
      <p style="margin: 10px 0 0 0;">Pensa a un problema attuale. Fatti questa domanda: "Se fossi un detective, quale schema ripetuto scoprirei?" È già successo in passato? C'è un momento specifico in cui si presenta?</p>
    </div>

    <p><em>I pattern si ripetono. Vederli ti permette di intervenire sulla causa.</em></p>
  `,
  3: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Hai presente quando qualcuno ti dice <strong>"Va tutto bene"</strong> ma dal tono capisci che non è vero?</p>

    <p>Le parole sono solo una parte della comunicazione. Spesso la parte più piccola.</p>

    <p>I segnali da osservare:</p>
    <ul>
      <li>Un cliente dice "Ci pensiamo" → Probabilmente ha obiezioni non espresse</li>
      <li>Un capo dice "Buon lavoro" senza guardarti negli occhi → Forse non è così soddisfatto</li>
      <li>Un collega evita sempre un certo argomento → Probabilmente c'è un problema lì</li>
    </ul>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (5 minuti):</strong></p>
      <p style="margin: 10px 0 0 0;">Scegli una relazione professionale importante. Fatti questa domanda: "Cosa mi sta comunicando che non dice a parole?" Analizza: tono delle email, tempi di risposta, argomenti evitati.</p>
    </div>

    <p><em>Quello che non viene detto spesso è più importante di quello che viene detto.</em></p>
  `,
  4: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Immagina di dover cucinare una cena per degli ospiti che arrivano tra un'ora. Apri il <strong>frigo</strong>, lo guardi, e pensi "Non c'è niente."</p>

    <p>Ma se guardi meglio — se apri i cassetti, controlli il freezer, guardi nella dispensa — trovi ingredienti che non ricordavi di avere.</p>

    <p>Il problema non era che non c'era cibo. È che non avevi guardato dappertutto.</p>

    <p>Le <strong>risorse nascoste</strong>:</p>
    <ul>
      <li>Relazioni: qualcuno che conosco può aiutare?</li>
      <li>Competenze trasferibili: cosa so fare che si applica anche qui?</li>
      <li>Cose già fatte: ho già risolto qualcosa di simile?</li>
      <li>Errori passati: cosa ho imparato dai tentativi falliti?</li>
    </ul>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (7 minuti):</strong></p>
      <p style="margin: 10px 0 0 0;">Riprendi il problema che hai identificato. Fatti questa domanda: "Cosa ho GIA che posso usare?" Rispondi per ogni categoria: Persone, Competenze, Cose già fatte, Strumenti, Errori passati.</p>
    </div>

    <p><em>Chi risolve problemi meglio non ha più risorse. Vede più risorse.</em></p>
  `,
  5: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Nei giorni scorsi hai visto tre strumenti separati: <strong>schemi</strong>, <strong>segnali</strong>, <strong>risorse</strong>. Sono come tre ingredienti di una ricetta. Separati sono utili. Insieme sono potenti.</p>

    <p><strong>Il Metodo 5 Minuti:</strong></p>
    <ol>
      <li>Prima lo <strong>schema</strong>: Capisci la struttura del problema</li>
      <li>Poi i <strong>segnali</strong>: Capisci cosa succede davvero</li>
      <li>Poi le <strong>risorse</strong>: Capisci cosa hai per agire</li>
      <li>Infine l'<strong>azione</strong>: Decidi il prossimo passo</li>
    </ol>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (5 minuti esatti):</strong></p>
      <p style="margin: 10px 0 0 0;">Scegli un problema attuale. Imposta il timer a 5 minuti.<br>
      MINUTO 1-2: "Quale schema si ripete?"<br>
      MINUTO 2-3: "Cosa non viene detto?"<br>
      MINUTO 3-4: "Cosa ho già che posso usare?"<br>
      MINUTO 4-5: "Qual è UNA cosa concreta che faccio entro domani?"</p>
    </div>

    <p><em>Hai già le idee. Ora hai anche un sistema per trasformarle in risultati.</em></p>
  `,
  6: (nome) => `
    <p>Ciao ${nome},</p>

    <p>A volte vedi lo schema, i segnali e le risorse — ma resti bloccato. In quel caso il problema non è fuori. È una <strong>voce dentro</strong> che ti frena.</p>

    <p>I <strong>3 Traditori Silenziosi</strong>:</p>
    <ul>
      <li><strong>Il Paralizzante</strong>: "Devo avere tutte le informazioni prima di agire" (si traveste da "prudenza")</li>
      <li><strong>Il Timoroso</strong>: "È meglio non agire che agire e sbagliare" (si traveste da "pensiero strategico")</li>
      <li><strong>Il Procrastinatore</strong>: "Devo aspettare il momento perfetto" (si traveste da "timing intelligente")</li>
    </ul>

    <p>Sembrano ragionevoli, ma sono sabotatori. Li chiamiamo Traditori perché <strong>tradiscono il tuo potenziale</strong> mentre sembrano proteggerti.</p>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (5 minuti):</strong></p>
      <p style="margin: 10px 0 0 0;">Riprendi l'azione del Giorno 5. L'hai già fatta? Se no, chiediti: quale credenza mi ha fermato? Identifica il Traditore e rispondi per iscritto: "Ti ho riconosciuto, [nome]. Ma la verità è: [il contrario]"</p>
    </div>

    <p><em>I Traditori perdono potere quando li riconosci.</em></p>
  `,
  7: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Pensa a una <strong>lingua straniera</strong> che hai studiato a scuola. Se l'hai usata spesso, la ricordi ancora. Se non l'hai mai usata dopo, l'hai dimenticata.</p>

    <p>La capacità risolutiva funziona allo stesso modo. Non basta "sapere" che esistono gli strumenti. Bisogna <strong>usarli</strong>.</p>

    <p>Ecco cosa hai imparato:</p>
    <ul>
      <li><strong>Giorno 1</strong>: La prova che sai già risolvere</li>
      <li><strong>Giorno 2</strong>: Come vedere schemi ripetuti</li>
      <li><strong>Giorno 3</strong>: Come leggere segnali non detti</li>
      <li><strong>Giorno 4</strong>: Come trovare risorse nascoste</li>
      <li><strong>Giorno 5</strong>: Come usare tutto in 5 minuti</li>
      <li><strong>Giorno 6</strong>: Come riconoscere le voci che bloccano</li>
    </ul>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio finale (10 minuti):</strong></p>
      <p style="margin: 10px 0 0 0;">Scrivi: "Il prossimo problema che affronterò con il metodo è: ___"<br>
      Decidi quando userai il metodo (minimo: ogni settimana su un problema).<br>
      Imposta un promemoria nel calendario.</p>
    </div>

    <p><em>Hai gli strumenti. Ora usali regolarmente. Il risolutore è già in te — attivalo.</em></p>
  `
};

// Contenuti email per Microfelicità
const MICROFELICITA_EMAILS: Record<DayNumber, (nome: string) => string> = {
  1: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Immagina di camminare per strada <strong>guardando il telefono</strong>. Intorno a te ci sono persone, vetrine, alberi, un cielo interessante. Ma tu non vedi niente di tutto questo perché stai fissando lo schermo.</p>

    <p>Questo è quello che succede con le piccole cose piacevoli della giornata. Ci sono — ma il tuo cervello è "occupato" con altro. Daniel Kahneman, premio Nobel, ha scoperto che il cervello è come il <strong>velcro per il negativo</strong> e come il <strong>teflon per il positivo</strong>.</p>

    <p>Il cervello umano è fatto per notare i problemi:</p>
    <ul>
      <li>50 piccole cose piacevoli al giorno → ne noti 2-3</li>
      <li>10 cose negative al giorno → le noti tutte e 10</li>
      <li>Fine giornata: "Non è successo niente di buono"</li>
    </ul>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #8B5CF6; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (3 minuti):</strong></p>
      <p style="margin: 10px 0 0 0;">Stasera, prima di dormire, trova 3 momenti piacevoli della giornata. Anche piccoli (un sapore, un silenzio, un sorriso, una luce). Se ne trovi meno di 3, è normale — il radar non è ancora calibrato.</p>
    </div>

    <p><em>Il benessere non manca. Non lo noti. Questa settimana impari a vederlo.</em></p>
  `,
  2: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Pensa ai momenti "grandi" di felicità: vacanze, promozioni, matrimoni. Quanti ne hai in un anno? <strong>3-4</strong>.</p>

    <p>Ora pensa ai momenti "piccoli": un caffè buono, una risata, un lavoro finito, un bel tramonto. Quanti potrebbero essercene ogni giorno? <strong>50? 100?</strong></p>

    <p>Facciamo i conti:</p>
    <ul>
      <li>Momenti grandi: ~4 all'anno</li>
      <li>Momenti piccoli (se li noti): ~18.000 all'anno</li>
      <li>Se il tuo benessere dipende solo dai grandi: 4 occasioni</li>
      <li>Se noti i piccoli: <strong>migliaia di occasioni</strong></li>
    </ul>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #8B5CF6; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (3 secondi per volta):</strong></p>
      <p style="margin: 10px 0 0 0;">Intercetta 3 momenti piacevoli *mentre succedono* — non alla sera a memoria. Quando succede: fermati mentalmente per 3 secondi. Di' a te stesso: "Questo. Proprio questo."</p>
    </div>

    <p><em>La felicità non è trovare eventi straordinari. È notare eventi ordinari.</em></p>
  `,
  3: (nome) => `
    <p>Ciao ${nome},</p>

    <p>I momenti piacevoli piccoli durano pochissimo. Se non li "catturi" nei primi 2 secondi, svaniscono. È come vedere una <strong>stella cadente</strong>. Se non guardi subito, l'hai persa.</p>

    <p><strong>R.A.D.A.R.</strong> — i 5 passi per catturare il benessere:</p>
    <ul>
      <li><strong>R</strong> = Rileva: Noti che sta succedendo qualcosa di piacevole (1-2 sec)</li>
      <li><strong>A</strong> = Accogli: Lasci che la sensazione arrivi senza giudicarla (1-2 sec)</li>
      <li><strong>D</strong> = Distingui: "Questo mi nutre o mi sabota?" (1-2 sec)</li>
      <li><strong>A</strong> = Amplifica: Mantieni l'attenzione per qualche secondo in più (3-5 sec)</li>
      <li><strong>R</strong> = Resta: Lasci che il focus si ritiri naturalmente (2 sec)</li>
    </ul>

    <p>Tempo totale: ~10 secondi</p>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #8B5CF6; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (30 secondi totali):</strong></p>
      <p style="margin: 10px 0 0 0;">Applica R.A.D.A.R. a 3 occasioni:<br>
      1. Il primo caffè/te della giornata<br>
      2. Un momento di silenzio/pausa<br>
      3. Qualsiasi momento a tua scelta</p>
    </div>

    <p><em>R.A.D.A.R.: 10 secondi per catturare il benessere.</em></p>
  `,
  4: (nome) => `
    <p>Ciao ${nome},</p>

    <p>R.A.D.A.R. può fallire per <strong>4 errori comuni</strong>. Tutti facili da correggere una volta che li conosci.</p>

    <p><strong>ERRORE 1: Cercare invece di notare</strong><br>
    Sintomo: "Dove sono questi momenti? Non li trovo!"<br>
    Correzione: Non cercare. Aspetta con attenzione aperta.</p>

    <p><strong>ERRORE 2: Aspettare sensazioni forti</strong><br>
    Sintomo: "Non sento niente di speciale"<br>
    Correzione: Abbassa la soglia. Se qualcosa è piacevole anche solo un po', conta.</p>

    <p><strong>ERRORE 3: Analizzare troppo</strong><br>
    Sintomo: "Ma cosa significa? Perché lo provo?"<br>
    Correzione: Prima senti (3 secondi), poi eventualmente analizza.</p>

    <p><strong>ERRORE 4: Fare R.A.D.A.R. solo in momenti speciali</strong><br>
    Sintomo: "Lo faccio quando sono rilassato"<br>
    Correzione: Fallo durante attività normali — lavarsi le mani, camminare, sedersi.</p>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #8B5CF6; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (5 minuti + pratica):</strong></p>
      <p style="margin: 10px 0 0 0;">Identifica il tuo errore principale (1, 2, 3 o 4). Scrivi: "Il mio errore è: ___". Applica la correzione specifica. Scegli UN momento ordinario della giornata e applica R.A.D.A.R. lì.</p>
    </div>

    <p><em>Gli errori sono normali. Correggerli è semplice.</em></p>
  `,
  5: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Quando hai una giornata difficile, il cervello fa zoom sul negativo. Tutto il resto scompare dalla vista. È come avere un <strong>riflettore</strong> puntato su una cosa: quella cosa la vedi benissimo, ma tutto il resto della stanza è al buio.</p>

    <p>R.A.D.A.R. non serve a *negare* il negativo. Non ti sto dicendo "pensa positivo".</p>

    <p>R.A.D.A.R. serve a <strong>completare il quadro</strong>. A vedere tutto, non solo il negativo.</p>

    <p>È come fare un bilancio economico: se scrivi solo le spese, pensi "Sono in rosso!" Ma non hai scritto le entrate. Il bilancio vero include entrambe.</p>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #8B5CF6; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (5 minuti):</strong></p>
      <p style="margin: 10px 0 0 0;">Scrivi cosa di negativo è successo oggi: "Oggi il negativo è stato: ___"<br>
      Poi domanda chiave: "Nonostante tutto, cosa di positivo è successo?"<br>
      Trova almeno 2 cose positive (anche piccole). Scrivi entrambi: il negativo E il positivo.</p>
    </div>

    <p><em>R.A.D.A.R. non nega il negativo. Lo bilancia con quello che c'è già di positivo.</em></p>
  `,
  6: (nome) => `
    <p>Ciao ${nome},</p>

    <p>La maggior parte delle buone intenzioni fallisce per un motivo semplice: dipendono dalla memoria. "Mi ricorderò di farlo" — ma poi non te lo ricordi.</p>

    <p>Molte persone tengono le <strong>vitamine vicino al caffè</strong>. Perché? Perché il caffè lo bevono già ogni mattina in automatico. Vedere le vitamine mentre fanno il caffè glielo ricorda.</p>

    <p><strong>La Formula:</strong><br>
    Invece di "mi ricorderò di fare R.A.D.A.R." dici:<br>
    "Quando [cosa che già faccio], faccio R.A.D.A.R."</p>

    <p>Possibili agganci: bere il primo caffè, sederti in macchina, lavarti le mani dopo pranzo, aprire il laptop, chiudere la porta di casa.</p>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #8B5CF6; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio di oggi (3 minuti + 1 pratica):</strong></p>
      <p style="margin: 10px 0 0 0;">Scorri la lista: caffè, sederti in macchina, aprire il laptop, lavarti le mani, inizio pasto, uscire di casa, tornare a casa.<br>
      Scegli UNA di queste azioni.<br>
      Scrivi: "Quando ___, faccio R.A.D.A.R."<br>
      Fallo oggi almeno una volta.</p>
    </div>

    <p><em>Collegare a un'abitudine esistente è il segreto per non dimenticare.</em></p>
  `,
  7: (nome) => `
    <p>Ciao ${nome},</p>

    <p>Imparare qualcosa di nuovo ha <strong>fasi precise</strong>:</p>
    <ul>
      <li><strong>Base (Giorni 1-7)</strong>: Capisci il concetto, fai le prime prove ← SEI QUI</li>
      <li><strong>Abitudine (Giorni 8-28)</strong>: Lo fai regolarmente, a volte dimentichi</li>
      <li><strong>Automatismo (Mesi 2-3)</strong>: Lo fai in automatico</li>
      <li><strong>Trasformazione (Mesi 4-12)</strong>: Fa parte di come sei</li>
    </ul>

    <p>Ecco cosa hai imparato:</p>
    <ul>
      <li>Giorno 1: I momenti ci sono — non li noti</li>
      <li>Giorno 2: Tanti piccoli battono pochi grandi</li>
      <li>Giorno 3: R.A.D.A.R. in 5 passi</li>
      <li>Giorno 4: 4 errori comuni</li>
      <li>Giorno 5: Non nega il negativo</li>
      <li>Giorno 6: Collegalo a qualcosa che già fai</li>
    </ul>

    <p><strong>La Regola per i Prossimi 21 Giorni:</strong><br>
    Fai R.A.D.A.R. almeno una volta al giorno, collegato all'aggancio che hai scelto.<br>
    Obiettivo: 21 X di fila. Se salti un giorno, ricomincia il conteggio.</p>

    <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #8B5CF6; margin: 20px 0;">
      <p style="margin: 0;"><strong>Esercizio finale (10 minuti):</strong></p>
      <p style="margin: 10px 0 0 0;">Conferma il tuo aggancio: "Quando ___, faccio R.A.D.A.R."<br>
      Imposta un modo per tenere traccia (calendario, app, nota).<br>
      Obiettivo: 21 X di fila.<br>
      Rispondi: "Se notassi 10 momenti positivi in più ogni giorno, come cambierebbe la mia settimana?"</p>
    </div>

    <p><em>Il benessere che cerchi ti sta già attraversando. Ora sai come notarlo.</em></p>
  `
};

// Funzione principale per generare l'email
export function getChallengeEmail(
  challenge: string,
  day: DayNumber,
  nome: string
): EmailContent {
  const challengeKey = challenge as ChallengeKey;
  const config = CHALLENGE_CONFIG[challengeKey];
  const dayInfo = DAY_TITLES[challengeKey]?.[day];

  if (!config || !dayInfo) {
    // Fallback per challenge non riconosciute
    return {
      subject: `Giorno ${day} della tua Sfida`,
      html: generateEmailWrapper(
        `<p>Ciao ${nome},</p><p>Continua la tua sfida su Vitaeology!</p>`,
        config?.color || '#D4AF37',
        config?.name || 'Sfida',
        day,
        challengeKey
      )
    };
  }

  // Seleziona il contenuto corretto in base alla challenge
  let contentFn: (nome: string) => string;

  switch (challengeKey) {
    case 'leadership-autentica':
      contentFn = LEADERSHIP_EMAILS[day];
      break;
    case 'oltre-ostacoli':
      contentFn = OSTACOLI_EMAILS[day];
      break;
    case 'microfelicità':
      contentFn = MICROFELICITA_EMAILS[day];
      break;
    default:
      contentFn = () => `<p>Ciao ${nome},</p><p>Continua la tua sfida!</p>`;
  }

  return {
    subject: dayInfo.subject,
    html: generateEmailWrapper(
      contentFn(nome),
      config.color,
      config.name,
      day,
      challengeKey
    )
  };
}

// Wrapper HTML per le email
function generateEmailWrapper(
  content: string,
  color: string,
  challengeName: string,
  day: DayNumber,
  challengeKey: ChallengeKey
): string {
  const config = CHALLENGE_CONFIG[challengeKey];
  const dayUrl = `https://vitaeology.com/challenge/${config?.urlPath}/day/${day}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <p style="color: #666; font-size: 14px; margin-bottom: 5px;">${challengeName}</p>
    <h1 style="color: ${color}; margin: 0; font-size: 24px;">Giorno ${day} di 7</h1>
  </div>

  ${content}

  <div style="text-align: center; margin: 40px 0 30px 0;">
    <a href="${dayUrl}" style="display: inline-block; background: ${color}; color: white; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 8px;">
      Vai al Giorno ${day} →
    </a>
  </div>

  <p>A domani,</p>
  <p><strong>Fernando Marongiu</strong><br>
  <span style="color: #666; font-size: 14px;">Fondatore Vitaeology</span></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="font-size: 12px; color: #999; text-align: center;">
    Hai ricevuto questa email perchéti sei iscritto alla Sfida ${challengeName}.<br>
    <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #999;">Cancella iscrizione</a>
  </p>

</body>
</html>
  `;
}

// ============================================================
// EMAIL SISTEMA IBRIDO - Reminder, Force Advance, Conversion
// ============================================================

/**
 * Email reminder per utenti inattivi
 * Tono: incoraggiante, non pressante
 */
export function getReminderEmail(
  challenge: string,
  day: number,
  nome: string
): EmailContent {
  const challengeKey = challenge as ChallengeKey;
  const config = CHALLENGE_CONFIG[challengeKey];
  const color = config?.color || '#D4AF37';
  const challengeName = config?.name || 'Sfida';
  const urlPath = config?.urlPath || 'leadership';
  const dayUrl = `https://vitaeology.com/challenge/${urlPath}/day/${day}`;

  return {
    subject: `${nome}, il tuo percorso ti aspetta`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <p style="color: #666; font-size: 14px; margin-bottom: 5px;">${challengeName}</p>
    <h1 style="color: ${color}; margin: 0; font-size: 24px;">Il tuo Giorno ${day} ti aspetta</h1>
  </div>

  <p>Ciao ${nome},</p>

  <p>Ho notato che non hai ancora completato il <strong>Giorno ${day}</strong> della tua sfida.</p>

  <p>Nessuna fretta. La vita è piena di impegni e a volte le cose scivolano.</p>

  <p>Ma volevo ricordarti che il tuo percorso è ancora lì, pronto per te. Bastano <strong>5-10 minuti</strong> per completare l'esercizio di oggi.</p>

  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <p style="margin: 0; color: #666;">
      <em>"Il momento perfetto non esiste. Esiste solo il momento in cui decidi di iniziare."</em>
    </p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="${dayUrl}" style="display: inline-block; background: ${color}; color: white; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 8px;">
      Riprendi il Giorno ${day} →
    </a>
  </div>

  <p>Sono qui se hai bisogno.</p>

  <p>Un abbraccio,</p>
  <p><strong>Fernando Marongiu</strong><br>
  <span style="color: #666; font-size: 14px;">Fondatore Vitaeology</span></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="font-size: 12px; color: #999; text-align: center;">
    Hai ricevuto questa email perchéti sei iscritto alla Sfida ${challengeName}.<br>
    <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #999;">Cancella iscrizione</a>
  </p>

</body>
</html>
    `
  };
}

/**
 * Email per avanzamento forzato (quando l'utente è inattivo da troppo tempo)
 * Tono: comprensivo, flessibile
 */
export function getForceAdvanceEmail(
  challenge: string,
  day: number,
  nome: string
): EmailContent {
  const challengeKey = challenge as ChallengeKey;
  const config = CHALLENGE_CONFIG[challengeKey];
  const color = config?.color || '#D4AF37';
  const challengeName = config?.name || 'Sfida';
  const urlPath = config?.urlPath || 'leadership';
  const dayUrl = `https://vitaeology.com/challenge/${urlPath}/day/${day}`;

  return {
    subject: `Giorno ${day}: proseguiamo insieme`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <p style="color: #666; font-size: 14px; margin-bottom: 5px;">${challengeName}</p>
    <h1 style="color: ${color}; margin: 0; font-size: 24px;">Giorno ${day} di 7</h1>
  </div>

  <p>Ciao ${nome},</p>

  <p>So che la vita a volte ci travolge. Non sempre riusciamo a seguire i ritmi che ci eravamo prefissati.</p>

  <p>Per questo ho deciso di sbloccarti il <strong>Giorno ${day}</strong>. Non voglio che ti senta indietro o sotto pressione.</p>

  <div style="background: linear-gradient(135deg, ${color}15, ${color}05); padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${color};">
    <p style="margin: 0;"><strong>Il tuo percorso è flessibile:</strong></p>
    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
      <li>Puoi completare i giorni saltati quando vuoi</li>
      <li>Ogni esercizio resta disponibile per sempre</li>
      <li>Non c'è un "ritardo" - c'è solo il tuo ritmo</li>
    </ul>
  </div>

  <p>L'importante è checontinui, anche se a modo tuo.</p>

  <div style="text-align: center; margin: 40px 0;">
    <a href="${dayUrl}" style="display: inline-block; background: ${color}; color: white; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 8px;">
      Vai al Giorno ${day} →
    </a>
  </div>

  <p>Ci vediamo dall'altra parte.</p>

  <p><strong>Fernando Marongiu</strong><br>
  <span style="color: #666; font-size: 14px;">Fondatore Vitaeology</span></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="font-size: 12px; color: #999; text-align: center;">
    Hai ricevuto questa email perchéti sei iscritto alla Sfida ${challengeName}.<br>
    <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #999;">Cancella iscrizione</a>
  </p>

</body>
</html>
    `
  };
}

/**
 * Email di conversione post-challenge
 * Tono: celebrativo, motivante
 */
export function getConversionEmail(
  challenge: string,
  nome: string
): EmailContent {
  const challengeKey = challenge as ChallengeKey;
  const config = CHALLENGE_CONFIG[challengeKey];
  const color = config?.color || '#D4AF37';
  const challengeName = config?.name || 'Sfida';

  return {
    subject: `Complimenti ${nome}! Scopri il tuo profilo completo`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
    <h1 style="color: ${color}; margin: 0; font-size: 28px;">Complimenti, ${nome}!</h1>
    <p style="color: #666; font-size: 16px;">Hai completato la ${challengeName}</p>
  </div>

  <p>Ciao ${nome},</p>

  <p>Ce l'hai fatta! <strong>7 giorni di crescita</strong>, portati a termine.</p>

  <p>In questi giorni hai scoperto strumenti pratici che puoi usare per sempre. Ma c'è molto di più da scoprire.</p>

  <div style="background: linear-gradient(135deg, ${color}22, ${color}08); padding: 25px; border-radius: 12px; margin: 30px 0;">
    <h2 style="color: ${color}; margin-top: 0; font-size: 20px;">Scopri il tuo Profilo Completo</h2>
    <p>L'<strong>Assessment Vitaeology</strong> è un test scientifico che mappa le tue capacità di leadership in 5 dimensioni:</p>
    <ul style="margin: 15px 0; padding-left: 20px;">
      <li><strong>Autenticità</strong> - Chi sei veramente come leader</li>
      <li><strong>Lucidità</strong> - Come leggi le situazioni</li>
      <li><strong>Coraggio</strong> - Come affronti le sfide</li>
      <li><strong>Equilibrio</strong> - Come gestisci le energie</li>
      <li><strong>Capacità Risolutiva</strong> - Come risolvi i problemi</li>
    </ul>
    <p style="margin-bottom: 0;"><strong>Tempo richiesto:</strong> 15 minuti<br>
    <strong>Risultato:</strong> Report personalizzato + esercizi su misura</p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://vitaeology.com/test" style="display: inline-block; background: ${color}; color: white; font-weight: bold; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-size: 18px;">
      Fai l'Assessment Gratuito →
    </a>
    <p style="color: #999; font-size: 13px; margin-top: 12px;">Gratuito • 15 minuti • Risultati immediati</p>
  </div>

  <p>Il leader che cerchi è già dentro di te. L'Assessment ti aiuta a vederlo chiaramente.</p>

  <p>In bocca al lupo!</p>
  <p><strong>Fernando Marongiu</strong><br>
  <span style="color: #666; font-size: 14px;">Fondatore Vitaeology</span></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="font-size: 12px; color: #999; text-align: center;">
    Hai ricevuto questa email perchéhai completato la Sfida ${challengeName}.<br>
    <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #999;">Cancella iscrizione</a>
  </p>

</body>
</html>
    `
  };
}

/**
 * Email recovery per chi non ha fatto l'Assessment dopo la challenge
 * Tono: gentile promemoria, soft urgency
 */
export function getRecoveryEmail(
  challenge: string,
  nome: string
): EmailContent {
  const challengeKey = challenge as ChallengeKey;
  const config = CHALLENGE_CONFIG[challengeKey];
  const color = config?.color || '#D4AF37';
  const challengeName = config?.name || 'Sfida';

  return {
    subject: `${nome}, il tuo Assessment ti aspetta`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: ${color}; margin: 0; font-size: 24px;">Il prossimo passo ti aspetta</h1>
  </div>

  <p>Ciao ${nome},</p>

  <p>Qualche giorno fa hai completato la <strong>${challengeName}</strong>. Complimenti ancora!</p>

  <p>Volevo ricordarti che c'è un passo successivo che potrebbe interessarti: l'<strong>Assessment Vitaeology</strong>.</p>

  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <p style="margin: 0 0 15px 0;"><strong>Perchéfare l'Assessment?</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
      <li>Scopri le tue <strong>5 dimensioni di leadership</strong></li>
      <li>Ricevi un <strong>report personalizzato</strong></li>
      <li>Ottieni <strong>esercizi su misura</strong> per te</li>
      <li>Traccia i tuoi <strong>progressi nel tempo</strong></li>
    </ul>
  </div>

  <p>Hai già dimostrato impegno completando la sfida. L'Assessment è il modo per trasformare quell'impegno in crescita concreta.</p>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://vitaeology.com/test" style="display: inline-block; background: ${color}; color: white; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 8px;">
      Fai l'Assessment →
    </a>
    <p style="color: #999; font-size: 13px; margin-top: 12px;">Gratuito • 15 minuti</p>
  </div>

  <p>Il momento giusto è quando ti senti pronto. Ma ricorda: il momento perfetto non esiste.</p>

  <p>Un abbraccio,</p>
  <p><strong>Fernando Marongiu</strong><br>
  <span style="color: #666; font-size: 14px;">Fondatore Vitaeology</span></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="font-size: 12px; color: #999; text-align: center;">
    Hai ricevuto questa email perchéhai partecipato alla Sfida ${challengeName}.<br>
    <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #999;">Cancella iscrizione</a>
  </p>

</body>
</html>
    `
  };
}

// Export per test e uso diretto
export { CHALLENGE_CONFIG, DAY_TITLES };
