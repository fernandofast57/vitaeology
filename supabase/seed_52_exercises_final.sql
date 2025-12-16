-- =====================================================
-- VITAEOLOGY - Seed 52 Esercizi Settimanali
-- PREREQUISITO: Eseguire prima la migrazione book_id UUID -> INTEGER
-- =====================================================
-- TIPI VALIDI exercise_type: riflessione, azione, sfida, analisi, feedback, pianificazione
-- TIPI VALIDI difficulty_level: base, intermedio, avanzato

-- Prima elimina gli esercizi esistenti
DELETE FROM user_exercise_progress;
DELETE FROM exercises;

-- Inserisci i 52 esercizi settimanali
-- book_id = 1 (INTEGER, riferimento a books.id)

INSERT INTO exercises (
  id, book_id, week_number, title, subtitle, characteristic_slug,
  exercise_type, difficulty_level, estimated_time_minutes, month_name,
  description, instructions, deliverable, reflection_prompts, is_active, sort_order
) VALUES

-- =====================================================
-- MESE 1: ESSERE - Autenticità e Integrità (Sett. 1-4)
-- =====================================================

(gen_random_uuid(), 1, 1, 'Il Tuo Punto di Partenza', 'Scopri chi sei come leader oggi', 'autenticita', 'riflessione', 'base', 30, 'Gennaio',
'Prima di iniziare qualsiasi percorso di crescita, è fondamentale capire dove ti trovi. Questo esercizio ti aiuterà a fare una fotografia onesta della tua leadership attuale.',
'Trova un momento tranquillo di almeno 30 minuti. Prendi carta e penna e rispondi alle seguenti domande con totale onestà:

1. Quali sono i tuoi 3 punti di forza come leader?
2. Quali sono le 3 aree dove senti di dover migliorare?
3. Come ti descriverebbero i tuoi collaboratori?
4. Qual è la decisione più difficile che hai preso negli ultimi 6 mesi?
5. Cosa ti motiva ad essere un leader migliore?',
'Documento con auto-analisi completa + 3 obiettivi per i prossimi 3 mesi',
'["Cosa ti ha sorpreso di più di questa auto-analisi?", "Quanto sei stato onesto con te stesso?", "Quale area vuoi affrontare per prima?"]'::jsonb,
true, 1),

(gen_random_uuid(), 1, 2, 'Il Primo Passo Difficile', 'Agisci con autenticità in una situazione sfidante', 'autenticita', 'azione', 'base', 45, 'Gennaio',
'L''autenticità si dimostra nelle azioni, non solo nelle parole. Questa settimana metterai in pratica l''essere genuino in una situazione reale.',
'Identifica una situazione lavorativa dove normalmente "reciteresti un ruolo" o diresti ciò che gli altri vogliono sentire.

Può essere:
- Una riunione dove hai un''opinione diversa dalla maggioranza
- Un feedback da dare a un collaboratore
- Una conversazione con il tuo capo su un tema delicato

Affronta questa situazione essendo completamente autentico, esprimendo la tua vera opinione in modo rispettoso ma diretto.',
'Report della situazione affrontata + risultati ottenuti + lezioni apprese',
'["Come ti sei sentito ad essere completamente autentico?", "Quale è stata la reazione degli altri?", "Lo rifaresti? Perché?"]'::jsonb,
true, 2),

(gen_random_uuid(), 1, 3, 'Ammettere Non Lo So', 'Pratica l''umiltà intellettuale', 'integrita', 'sfida', 'base', 30, 'Gennaio',
'I leader con integrità riconoscono i propri limiti. Questa settimana praticherai l''arte di ammettere quando non sai qualcosa.',
'Per 5 giorni consecutivi, cerca attivamente opportunità per dire "Non lo so" o "Non sono sicuro".

Regole:
1. Deve essere genuino (non inventare situazioni)
2. Dopo aver ammesso di non sapere, chiedi aiuto o informazioni
3. Ringrazia chi ti aiuta
4. Documenta ogni situazione

Obiettivo: minimo 1 situazione al giorno per 5 giorni.',
'Diario di 5 giorni con situazioni + reazioni ricevute + come ti sei sentito',
'["È stato difficile ammettere di non sapere?", "Come hanno reagito gli altri?", "Cosa hai imparato da questa esperienza?"]'::jsonb,
true, 3),

(gen_random_uuid(), 1, 4, 'Analisi Fallimento Recente', 'Trasforma un errore in apprendimento', 'integrita', 'analisi', 'base', 45, 'Gennaio',
'L''integrità include la capacità di riconoscere i propri errori e imparare da essi. Analizzerai un fallimento recente con occhio critico ma costruttivo.',
'Pensa a un fallimento o errore significativo degli ultimi 6 mesi.

Analizzalo usando questo framework:
1. Cosa è successo esattamente? (fatti, non interpretazioni)
2. Quali erano le tue responsabilità specifiche?
3. Cosa avresti potuto fare diversamente?
4. Quali segnali di allarme hai ignorato?
5. Cosa hai imparato?
6. Come applicherai questa lezione in futuro?',
'Documento con analisi di 1 fallimento + 3 lezioni concrete + piano di applicazione',
'["Quanto è stato difficile analizzare il tuo errore?", "Hai scoperto pattern ricorrenti?", "Come ti senti ora riguardo a quel fallimento?"]'::jsonb,
true, 4),

-- =====================================================
-- MESE 2: ESSERE - Consapevolezza e Presenza (Sett. 5-8)
-- =====================================================

(gen_random_uuid(), 1, 5, 'Il Feedback a 360°', 'Raccogli percezioni esterne su di te', 'consapevolezza-di-se', 'feedback', 'intermedio', 60, 'Febbraio',
'La consapevolezza di sé richiede di vedere noi stessi anche attraverso gli occhi degli altri.',
'Identifica 5 persone che ti conoscono in contesti diversi:
- 1 superiore
- 2 colleghi/pari
- 1 collaboratore/subordinato
- 1 persona fuori dal lavoro (amico, familiare)

Chiedi a ciascuno di rispondere a 3 domande:
1. Qual è il mio punto di forza principale?
2. Quale comportamento dovrei migliorare?
3. Come mi comporto sotto pressione?

Raccogli le risposte in forma anonima se possibile.',
'Report con feedback raccolto + analisi pattern comuni + 2 aree di miglioramento identificate',
'["Quali feedback ti hanno sorpreso?", "C''è coerenza tra come ti vedi e come ti vedono?", "Quale feedback è più difficile da accettare?"]'::jsonb,
true, 5),

(gen_random_uuid(), 1, 6, 'Mindfulness per Leader', 'Sviluppa la presenza mentale', 'presenza', 'azione', 'base', 20, 'Febbraio',
'La presenza è la capacità di essere completamente nel momento. I leader presenti prendono decisioni migliori e connettono meglio con gli altri.',
'Per 7 giorni consecutivi, pratica 10 minuti di mindfulness al mattino:

1. Siediti in posizione comoda
2. Chiudi gli occhi
3. Concentrati sul respiro
4. Quando la mente vaga, riportala gentilmente al respiro
5. Non giudicare i pensieri, osservali e lasciali andare

Usa un''app come Headspace, Calm o semplicemente un timer.
Dopo ogni sessione, scrivi una parola che descrive come ti senti.',
'Diario di 7 giorni con parole chiave + 3 osservazioni su come la pratica ha influenzato la tua giornata',
'["È stato difficile mantenere la pratica quotidiana?", "Hai notato cambiamenti nella tua capacità di concentrazione?", "Come puoi integrare questa pratica nella tua routine?"]'::jsonb,
true, 6),

(gen_random_uuid(), 1, 7, 'Ascolto Profondo', 'Pratica l''ascolto senza interrompere', 'presenza', 'azione', 'base', 30, 'Febbraio',
'L''ascolto profondo è una delle competenze più rare e preziose della leadership. Quando ascolti veramente, le persone si sentono viste e valorizzate.',
'Per 5 giorni, in almeno una conversazione al giorno:

1. Ascolta senza interrompere MAI
2. Non pensare alla tua risposta mentre l''altro parla
3. Mantieni il contatto visivo
4. Fai domande di chiarimento prima di esprimere la tua opinione
5. Ripeti ciò che hai capito prima di rispondere

Documenta ogni conversazione: con chi, quanto è durata, come ti sei sentito.',
'Report di 5 conversazioni + osservazioni su cosa hai notato di diverso',
'["Quanto è stato difficile non interrompere?", "Cosa hai notato nelle reazioni degli altri?", "Cosa hai scoperto che normalmente ti saresti perso?"]'::jsonb,
true, 7),

(gen_random_uuid(), 1, 8, 'I Tuoi Valori Fondamentali', 'Definisci la tua bussola interiore', 'consapevolezza-di-se', 'riflessione', 'intermedio', 45, 'Febbraio',
'I valori sono la bussola che guida le nostre decisioni. Conoscere i propri valori fondamentali rende le decisioni difficili più chiare.',
'Esercizio di identificazione valori:

1. Scrivi 20 valori che ritieni importanti
2. Riducili a 10 eliminando i meno essenziali
3. Riducili a 5
4. Riducili a 3 - questi sono i tuoi valori fondamentali

Per ciascuno dei 3 valori:
- Definisci cosa significa per te
- Dai un esempio di quando lo hai vissuto
- Dai un esempio di quando lo hai violato
- Come puoi viverlo di più?',
'Documento con 3 valori fondamentali + definizioni personali + piano di allineamento',
'["Questi valori ti rappresentano davvero?", "Quanto le tue azioni quotidiane riflettono questi valori?", "Quale valore è più sfidante da vivere?"]'::jsonb,
true, 8),

-- =====================================================
-- MESE 3: ESSERE - Resilienza e Vulnerabilità (Sett. 9-12)
-- =====================================================

(gen_random_uuid(), 1, 9, 'Mappa dello Stress', 'Identifica i tuoi trigger', 'resilienza', 'analisi', 'base', 30, 'Marzo',
'Conoscere i propri trigger di stress è il primo passo per gestirli meglio.',
'Per 7 giorni, tieni un diario dello stress:

Ogni volta che senti tensione, documenta:
1. Cosa è successo (evento trigger)
2. Livello di stress (1-10)
3. Reazione fisica (dove senti la tensione)
4. Pensiero automatico (cosa ti sei detto)
5. Azione intrapresa

A fine settimana, analizza i pattern.',
'Diario di 7 giorni + analisi pattern + 3 trigger principali identificati',
'["Quali pattern hai notato?", "Ci sono trigger che puoi evitare?", "Come reagisci tipicamente allo stress?"]'::jsonb,
true, 9),

(gen_random_uuid(), 1, 10, 'La Vulnerabilità come Forza', 'Condividi una difficoltà con il team', 'vulnerabilita', 'sfida', 'avanzato', 45, 'Marzo',
'La vulnerabilità autentica crea connessione e fiducia. Non significa debolezza, ma coraggio di mostrarsi umani.',
'Identifica una situazione appropriata per condividere una difficoltà o incertezza con il tuo team.

Può essere:
- Un progetto dove non hai tutte le risposte
- Una sfida personale che influenza il lavoro
- Un errore passato e cosa hai imparato

Condividi in modo autentico, senza cercare simpatia ma connessione.
Documenta le reazioni e come ti sei sentito.',
'Report dell''esperienza + reazioni del team + riflessioni personali',
'["Come ti sei sentito prima, durante e dopo?", "Come ha reagito il team?", "Faresti diversamente qualcosa?"]'::jsonb,
true, 10),

(gen_random_uuid(), 1, 11, 'Piano di Recovery', 'Crea la tua routine di recupero', 'resilienza', 'pianificazione', 'intermedio', 40, 'Marzo',
'La resilienza non è resistere indefinitamente, ma sapere come recuperare. I leader efficaci hanno routine di recovery.',
'Crea il tuo Piano di Recovery personale:

1. FISICO: Cosa ti ricarica fisicamente? (sonno, esercizio, natura)
2. MENTALE: Come svuoti la mente? (hobby, meditazione, lettura)
3. EMOTIVO: Chi ti supporta? (relazioni chiave)
4. SPIRITUALE: Cosa dà significato? (valori, scopo)

Per ogni area:
- Identifica 2-3 attività di recovery
- Pianifica quando farle nella settimana
- Implementa per 2 settimane',
'Piano di recovery completo + calendario settimanale + diario di 2 settimane di implementazione',
'["Quali attività funzionano meglio?", "Quanto è difficile fare tempo per il recovery?", "Come ti senti dopo 2 settimane?"]'::jsonb,
true, 11),

(gen_random_uuid(), 1, 12, 'Revisione Trimestrale ESSERE', 'Bilancio del primo pilastro', 'autenticita', 'riflessione', 'intermedio', 60, 'Marzo',
'Ogni 3 mesi è importante fermarsi e valutare i progressi. Questo esercizio chiude il pilastro ESSERE.',
'Rivedi tutti gli esercizi del trimestre e rispondi:

1. AUTENTICITÀ: Quanto sei più autentico rispetto a 3 mesi fa? (1-10)
2. INTEGRITÀ: Come è cambiato il tuo rapporto con errori e fallimenti?
3. CONSAPEVOLEZZA: Cosa sai di te che prima non sapevi?
4. PRESENZA: Sei più presente nelle interazioni?
5. RESILIENZA: Come gestisci lo stress ora vs prima?
6. VULNERABILITÀ: Sei più aperto con gli altri?

Quali 3 cambiamenti concreti hai fatto? Quali 3 vuoi fare nel prossimo trimestre?',
'Report di revisione trimestrale + piano per il prossimo trimestre',
'["Di cosa sei più orgoglioso?", "Cosa è stato più difficile?", "Cosa farai diversamente nei prossimi 3 mesi?"]'::jsonb,
true, 12),

-- =====================================================
-- MESE 4: SENTIRE - Intelligenza Emotiva (Sett. 13-16)
-- =====================================================

(gen_random_uuid(), 1, 13, 'Vocabolario Emotivo', 'Espandi il tuo lessico delle emozioni', 'intelligenza-emotiva', 'azione', 'base', 30, 'Aprile',
'Più parole hai per descrivere le emozioni, meglio puoi comprenderle e gestirle.',
'Per 7 giorni, pratica l''espansione del vocabolario emotivo:

1. 3 volte al giorno, fermati e chiediti: "Cosa sto provando?"
2. Non accontentarti di "bene" o "male" - cerca la parola precisa
3. Usa questa lista come guida: frustrato, ansioso, entusiasta, confuso, grato, irritato, curioso, sopraffatto, motivato, insicuro, orgoglioso, deluso

4. Scrivi: situazione + emozione precisa + intensità (1-10)',
'Diario emotivo di 7 giorni + 10 nuove parole emotive che hai iniziato a usare',
'["Quali emozioni provi più frequentemente?", "È stato difficile trovare le parole giuste?", "Come cambia la tua esperienza quando nomini l''emozione?"]'::jsonb,
true, 13),

(gen_random_uuid(), 1, 14, 'Trigger Emotivi', 'Mappa le tue reazioni automatiche', 'intelligenza-emotiva', 'analisi', 'intermedio', 45, 'Aprile',
'Tutti abbiamo trigger emotivi - situazioni che scatenano reazioni automatiche. Conoscerli è il primo passo per gestirli.',
'Per 5 giorni, documenta ogni volta che hai una reazione emotiva intensa:

Framework STAR-E:
- Situazione: cosa è successo
- Trigger: cosa ha scatenato la reazione
- Automatismo: reazione immediata
- Risultato: conseguenze della reazione
- Evoluzione: come avresti voluto reagire

Cerca pattern: ci sono trigger ricorrenti?',
'Report con 5+ situazioni analizzate + 3 trigger principali + strategie alternative',
'["Quali trigger ti sorprendono?", "Da dove vengono questi trigger?", "Quale automatismo vuoi cambiare per primo?"]'::jsonb,
true, 14),

(gen_random_uuid(), 1, 15, 'Empatia in Azione', 'Pratica la comprensione profonda', 'empatia', 'azione', 'base', 30, 'Aprile',
'L''empatia è la capacità di comprendere e condividere i sentimenti degli altri. È fondamentale per la leadership.',
'Questa settimana, pratica l''empatia attiva con 3 persone diverse:

Per ogni interazione:
1. Prima di rispondere, chiediti: "Cosa sta provando questa persona?"
2. Valida l''emozione: "Capisco che ti senti..."
3. Fai domande per capire meglio: "Aiutami a capire..."
4. Non offrire soluzioni subito, prima ascolta

Documenta: persona, situazione, emozione identificata, tua risposta, reazione dell''altro.',
'Report di 3 interazioni empatiche + osservazioni su cosa hai notato',
'["È stato naturale o forzato?", "Come hanno reagito le persone?", "Cosa hai scoperto che non sapevi?"]'::jsonb,
true, 15),

(gen_random_uuid(), 1, 16, 'Gestione della Rabbia', 'Trasforma la frustrazione in energia', 'intelligenza-emotiva', 'sfida', 'avanzato', 45, 'Aprile',
'La rabbia è un''emozione potente che può distruggere o costruire. Imparare a gestirla è essenziale per un leader.',
'Quando senti montare la frustrazione o rabbia questa settimana:

Tecnica STOP:
- Stop: fermati, non reagire
- Take a breath: 3 respiri profondi
- Observe: cosa sto provando? dove lo sento nel corpo?
- Proceed: scegli come rispondere

Pratica almeno 3 volte durante la settimana.
Documenta: trigger, intensità (1-10), tecnica usata, risultato.',
'Diario di 3+ situazioni + analisi efficacia tecnica STOP',
'["Riesci a fermarti prima di reagire?", "La pausa cambia la tua risposta?", "Quale parte della tecnica funziona meglio?"]'::jsonb,
true, 16),

-- =====================================================
-- MESE 5: SENTIRE - Relazioni e Comunicazione (Sett. 17-20)
-- =====================================================

(gen_random_uuid(), 1, 17, 'Mappa delle Relazioni', 'Analizza il tuo network', 'comunicazione', 'analisi', 'base', 40, 'Maggio',
'Le relazioni sono il tessuto della leadership. Capire il proprio network è fondamentale.',
'Crea una mappa delle tue relazioni professionali:

1. Disegna 3 cerchi concentrici
2. Centro: relazioni fondamentali (5-7 persone)
3. Medio: relazioni importanti (10-15 persone)
4. Esterno: conoscenze utili (20+ persone)

Per ogni persona nel cerchio interno:
- Qualità della relazione (1-10)
- Ultima interazione significativa
- Cosa potresti migliorare',
'Mappa relazioni + analisi qualità + piano per rafforzare 3 relazioni chiave',
'["Ci sono relazioni che hai trascurato?", "Il tuo network è bilanciato?", "Chi manca che dovresti coltivare?"]'::jsonb,
true, 17),

(gen_random_uuid(), 1, 18, 'Feedback Costruttivo', 'Impara a dare feedback efficace', 'comunicazione', 'azione', 'intermedio', 45, 'Maggio',
'Dare feedback è un''arte. Fatto bene, accelera la crescita. Fatto male, demotiva e crea conflitto.',
'Pratica il modello SBI-I per dare feedback:

- Situation: descrivi il contesto specifico
- Behavior: descrivi il comportamento osservato (fatti, non interpretazioni)
- Impact: spiega l''impatto del comportamento
- Intent: chiedi l''intenzione e proponi alternative

Dai almeno 2 feedback questa settimana usando questo modello.
Uno positivo e uno costruttivo.',
'Report di 2 feedback dati + reazioni ricevute + riflessioni',
'["Il modello SBI-I ti è sembrato naturale?", "Come hanno reagito le persone?", "Cosa migliorerai la prossima volta?"]'::jsonb,
true, 18),

(gen_random_uuid(), 1, 19, 'Ricevere Feedback', 'Impara ad accogliere critiche', 'comunicazione', 'sfida', 'intermedio', 30, 'Maggio',
'Ricevere feedback è spesso più difficile che darlo. Questa settimana praticherai l''apertura alle critiche.',
'Chiedi attivamente feedback a 3 persone diverse:

Domande da fare:
1. "Cosa dovrei smettere di fare?"
2. "Cosa dovrei iniziare a fare?"
3. "Cosa dovrei continuare a fare?"

Regole:
- Ascolta senza interrompere
- Non giustificarti
- Ringrazia sinceramente
- Fai domande per capire meglio',
'Report di 3 feedback ricevuti + pattern identificati + azioni concrete',
'["È stato difficile non giustificarti?", "Quale feedback è stato più utile?", "Quale più difficile da accettare?"]'::jsonb,
true, 19),

(gen_random_uuid(), 1, 20, 'Conversazioni Difficili', 'Affronta un dialogo che stai evitando', 'comunicazione', 'sfida', 'avanzato', 60, 'Maggio',
'I leader efficaci non evitano le conversazioni difficili. Le affrontano con preparazione e coraggio.',
'Identifica una conversazione difficile che stai rimandando.

Preparazione:
1. Qual è l''obiettivo della conversazione?
2. Quali sono i fatti (non interpretazioni)?
3. Come potrebbe sentirsi l''altro?
4. Qual è il risultato ideale per entrambi?
5. Cosa potrebbe andare storto e come gestirlo?

Affronta la conversazione e documenta il processo.',
'Report pre-conversazione + come è andata + lezioni apprese',
'["La preparazione ha aiutato?", "Cosa è andato diversamente dal previsto?", "Come ti senti dopo?"]'::jsonb,
true, 20),

-- =====================================================
-- MESE 6: SENTIRE - Motivazione e Ispirazione (Sett. 21-24)
-- =====================================================

(gen_random_uuid(), 1, 21, 'I Tuoi Motivatori', 'Scopri cosa ti muove davvero', 'motivazione', 'riflessione', 'base', 40, 'Giugno',
'Conoscere i propri motivatori profondi permette di trovare energia anche nei momenti difficili.',
'Esplora i tuoi motivatori usando questi ambiti:

1. REALIZZAZIONE: Cosa ti dà senso di accomplishment?
2. APPARTENENZA: Quanto è importante per te il team?
3. AUTONOMIA: Quanto conta la libertà decisionale?
4. COMPETENZA: Quanto ti motiva imparare e crescere?
5. SCOPO: Qual è il significato più profondo del tuo lavoro?

Per ogni ambito, dai un punteggio 1-10 e spiega perché.',
'Profilo motivazionale personale + analisi + come usare questa conoscenza',
'["Ti riconosci in questo profilo?", "Ci sono motivatori che sottovalutavi?", "Come puoi nutrire di più i tuoi motivatori?"]'::jsonb,
true, 21),

(gen_random_uuid(), 1, 22, 'Motivare gli Altri', 'Scopri cosa muove il tuo team', 'motivazione', 'azione', 'intermedio', 45, 'Giugno',
'Ogni persona è motivata da cose diverse. I leader efficaci sanno come attivare i motivatori di ciascuno.',
'Conduci conversazioni 1:1 con 3 membri del tuo team:

Domande da esplorare:
1. "Cosa ti piace di più del tuo lavoro?"
2. "Quando ti senti più energizzato?"
3. "Cosa ti frustra di più?"
4. "Come posso supportarti meglio?"
5. "Dove vorresti crescere?"

Non dare soluzioni, ascolta e prendi appunti.',
'Report di 3 conversazioni + profilo motivazionale di ogni persona + come adatterai il tuo approccio',
'["Hai scoperto qualcosa di sorprendente?", "Come cambierà il tuo modo di gestirli?", "Quali azioni concrete farai?"]'::jsonb,
true, 22),

(gen_random_uuid(), 1, 23, 'Storytelling per Leader', 'Impara a ispirare con le storie', 'ispirazione', 'azione', 'intermedio', 50, 'Giugno',
'Le storie muovono le persone più dei dati. I grandi leader sanno raccontare storie che ispirano azione.',
'Crea e racconta una storia di leadership:

Struttura:
1. SFIDA: Descrivi una difficoltà che hai affrontato
2. SCELTA: Quale decisione difficile hai dovuto prendere?
3. RISULTATO: Cosa è successo?
4. LEZIONE: Cosa hai imparato?
5. APPLICAZIONE: Come si applica a chi ascolta?

Prepara la storia e raccontala a qualcuno. Chiedi feedback.',
'Storia scritta + feedback ricevuto + versione migliorata',
'["La storia ha coinvolto chi ascoltava?", "Quale parte ha avuto più impatto?", "Come puoi usare lo storytelling di più?"]'::jsonb,
true, 23),

(gen_random_uuid(), 1, 24, 'Revisione Trimestrale SENTIRE', 'Bilancio del secondo pilastro', 'intelligenza-emotiva', 'riflessione', 'intermedio', 60, 'Giugno',
'Secondo checkpoint trimestrale. È tempo di valutare i progressi nel pilastro SENTIRE.',
'Rivedi gli esercizi delle ultime 12 settimane:

1. INTELLIGENZA EMOTIVA: Quanto meglio riconosci e gestisci le emozioni? (1-10)
2. EMPATIA: Sei più capace di capire gli altri?
3. COMUNICAZIONE: Come è migliorata la qualità delle tue conversazioni?
4. RELAZIONI: Il tuo network è più forte?
5. MOTIVAZIONE: Sai cosa muove te e il tuo team?
6. ISPIRAZIONE: Riesci a motivare gli altri?

Quali 3 cambiamenti hai fatto? Quali 3 vuoi fare?',
'Report di revisione trimestrale + piano per il prossimo trimestre',
'["Quale area è cresciuta di più?", "Dove hai ancora difficoltà?", "Come integrerai ESSERE e SENTIRE?"]'::jsonb,
true, 24),

-- =====================================================
-- MESE 7: PENSARE - Pensiero Strategico (Sett. 25-28)
-- =====================================================

(gen_random_uuid(), 1, 25, 'Visione a 3 Anni', 'Definisci dove vuoi arrivare', 'pensiero-strategico', 'riflessione', 'intermedio', 60, 'Luglio',
'La visione è il faro che guida ogni decisione. Senza una visione chiara, ogni strada sembra giusta.',
'Esercizio di visioning:

1. Immagina te stesso tra 3 anni - dove sei? cosa fai? con chi?
2. Descrivi una giornata tipo nel tuo futuro ideale
3. Quali risultati hai raggiunto?
4. Quali competenze hai sviluppato?
5. Come ti sentiresti se questa visione si realizzasse?

Scrivi la tua visione in prima persona, al presente.',
'Documento visione 3 anni + 5 milestone chiave + prima azione da fare',
'["Questa visione ti emoziona?", "È realistica ma ambiziosa?", "Cosa ti impedisce di iniziare oggi?"]'::jsonb,
true, 25),

(gen_random_uuid(), 1, 26, 'Analisi SWOT Personale', 'Valuta punti di forza e opportunità', 'pensiero-strategico', 'analisi', 'base', 45, 'Luglio',
'L''analisi SWOT è uno strumento classico che funziona anche per lo sviluppo personale.',
'Crea la tua SWOT personale:

STRENGTHS (Punti di Forza):
- Cosa fai meglio degli altri?
- Quali competenze uniche hai?
- Cosa ti viene naturale?

WEAKNESSES (Debolezze):
- Dove fai fatica?
- Quali competenze ti mancano?
- Cosa eviti di fare?

OPPORTUNITIES (Opportunità):
- Quali trend puoi sfruttare?
- Quali relazioni puoi sviluppare?
- Quali competenze sono richieste?

THREATS (Minacce):
- Cosa potrebbe ostacolarti?
- Quali cambiamenti ti preoccupano?
- Cosa stanno facendo i tuoi competitor?',
'Matrice SWOT completa + 3 strategie derivate',
'["La SWOT ti rappresenta?", "Quali insight hai avuto?", "Come userai questi insight?"]'::jsonb,
true, 26),

(gen_random_uuid(), 1, 27, 'Pensiero Sistemico', 'Vedi le connessioni nascoste', 'pensiero-strategico', 'analisi', 'avanzato', 60, 'Luglio',
'Il pensiero sistemico vede oltre i singoli eventi per capire i pattern e le strutture sottostanti.',
'Scegli un problema ricorrente nel tuo lavoro.

Analizzalo con il pensiero sistemico:
1. Quali sono i sintomi visibili?
2. Quali comportamenti causano questi sintomi?
3. Quali incentivi guidano questi comportamenti?
4. Quali credenze/assunzioni sostengono il sistema?
5. Dove sono i circoli viziosi?
6. Dove si potrebbe intervenire per cambiare il sistema?

Disegna una mappa delle connessioni.',
'Mappa sistemica del problema + 3 punti di leverage + proposta di intervento',
'["Vedere il sistema ha cambiato la tua prospettiva?", "Quali connessioni ti hanno sorpreso?", "Come applicherai questo approccio?"]'::jsonb,
true, 27),

(gen_random_uuid(), 1, 28, 'Scenari Futuri', 'Preparati per più possibilità', 'pensiero-strategico', 'analisi', 'avanzato', 60, 'Luglio',
'I leader strategici non prevedono il futuro, si preparano per più futuri possibili.',
'Crea 3 scenari per i prossimi 2 anni:

1. OTTIMISTA: Tutto va meglio del previsto
2. REALISTA: Evoluzione normale
3. PESSIMISTA: Sfide significative

Per ogni scenario:
- Quali eventi lo causerebbero?
- Come influenzerebbe il tuo ruolo?
- Quali competenze sarebbero cruciali?
- Come ti prepareresti?

Identifica azioni valide per tutti e 3 gli scenari.',
'3 scenari dettagliati + azioni robuste + piano di monitoraggio',
'["Quale scenario è più probabile?", "Per quale sei meno preparato?", "Quali segnali dovresti monitorare?"]'::jsonb,
true, 28),

-- =====================================================
-- MESE 8: PENSARE - Decision Making (Sett. 29-32)
-- =====================================================

(gen_random_uuid(), 1, 29, 'Il Tuo Stile Decisionale', 'Scopri come prendi decisioni', 'decision-making', 'riflessione', 'base', 40, 'Agosto',
'Ognuno ha un proprio stile decisionale. Conoscerlo aiuta a prendere decisioni migliori.',
'Analizza le ultime 10 decisioni significative che hai preso:

Per ogni decisione:
1. Quanto tempo hai impiegato?
2. Hai chiesto input ad altri?
3. Hai analizzato dati o seguito l''intuito?
4. Eri sicuro o incerto?
5. Come è andata?

Identifica il tuo pattern:
- Sei veloce o riflessivo?
- Collaborativo o autonomo?
- Analitico o intuitivo?
- Sicuro o prudente?',
'Analisi 10 decisioni + profilo decisionale + aree di miglioramento',
'["Ti riconosci in questo profilo?", "Il tuo stile funziona nella maggior parte dei casi?", "Cosa vorresti cambiare?"]'::jsonb,
true, 29),

(gen_random_uuid(), 1, 30, 'Framework DECIDE', 'Struttura le decisioni complesse', 'decision-making', 'azione', 'intermedio', 50, 'Agosto',
'Per le decisioni importanti, un framework strutturato riduce errori e bias.',
'Usa il framework DECIDE per una decisione che devi prendere:

D - Define the problem: Qual è esattamente la decisione?
E - Establish criteria: Quali sono i criteri di successo?
C - Consider alternatives: Quali sono le opzioni?
I - Identify best alternative: Quale opzione soddisfa meglio i criteri?
D - Develop action plan: Come implementerai?
E - Evaluate results: Come misurerai il successo?

Applica a una decisione reale.',
'Decisione analizzata con DECIDE + azione intrapresa + risultati',
'["Il framework ha migliorato la qualità della decisione?", "Quali step sono stati più utili?", "Lo useresti di nuovo?"]'::jsonb,
true, 30),

(gen_random_uuid(), 1, 31, 'Bias Cognitivi', 'Riconosci le trappole mentali', 'decision-making', 'analisi', 'avanzato', 45, 'Agosto',
'Tutti abbiamo bias cognitivi che influenzano le nostre decisioni. Riconoscerli è il primo passo per neutralizzarli.',
'Studia questi bias comuni e cerca esempi nella tua esperienza:

1. CONFIRMATION BIAS: Cerchi solo info che confermano ciò che pensi
2. ANCHORING: Ti fissi sul primo dato ricevuto
3. SUNK COST: Continui per i costi già sostenuti
4. AVAILABILITY: Dai peso a ciò che ricordi facilmente
5. OVERCONFIDENCE: Sopravvaluti le tue capacità predittive

Per ogni bias, trova un esempio personale e una strategia di mitigazione.',
'Analisi 5 bias + esempi personali + strategie di mitigazione',
'["Quale bias ti influenza di più?", "È stato difficile riconoscerli in te stesso?", "Come applicherai queste strategie?"]'::jsonb,
true, 31),

(gen_random_uuid(), 1, 32, 'Decisioni sotto Pressione', 'Impara a decidere quando conta', 'decision-making', 'sfida', 'avanzato', 45, 'Agosto',
'Le decisioni più importanti spesso arrivano nei momenti di maggiore pressione. Prepararsi è fondamentale.',
'Crea il tuo protocollo per decisioni urgenti:

1. PAUSA: Come ti fermi 30 secondi prima di reagire?
2. PRIORITÀ: Come identifichi cosa è veramente urgente?
3. INFORMAZIONI: Quali sono i dati essenziali?
4. OPZIONI: Quali sono le 2-3 alternative principali?
5. DECISIONE: Come scegli quando non puoi analizzare tutto?
6. COMUNICAZIONE: Come comunichi la decisione?

Scrivi il protocollo e provalo la prossima volta che serve.',
'Protocollo decisioni urgenti + test in situazione reale + aggiustamenti',
'["Il protocollo funziona sotto pressione?", "Cosa manca?", "Come lo migliorerai?"]'::jsonb,
true, 32),

-- =====================================================
-- MESE 9: PENSARE - Innovazione e Creatività (Sett. 33-36)
-- =====================================================

(gen_random_uuid(), 1, 33, 'Challenge Your Assumptions', 'Metti in discussione ciò che dai per scontato', 'innovazione', 'riflessione', 'intermedio', 40, 'Settembre',
'L''innovazione inizia mettendo in discussione le assunzioni che tutti danno per scontate.',
'Identifica un processo o pratica nel tuo lavoro che "si è sempre fatto così".

1. Elenca tutte le assunzioni sottostanti
2. Per ogni assunzione, chiediti: "Perché?"
3. Continua a chiedere "Perché?" almeno 5 volte
4. Cosa rimarrebbe se l''assunzione fosse falsa?
5. Quali alternative emergono?

Proponi almeno un''idea innovativa basata su questa analisi.',
'Analisi assunzioni + 5 Perché + proposta innovativa',
'["Quali assunzioni ti hanno sorpreso?", "È stato difficile metterle in discussione?", "La tua proposta è realizzabile?"]'::jsonb,
true, 33),

(gen_random_uuid(), 1, 34, 'Brainstorming Strutturato', 'Genera idee con metodo', 'innovazione', 'azione', 'base', 45, 'Settembre',
'Il brainstorming efficace non è caos creativo, ma processo strutturato.',
'Conduci una sessione di brainstorming su una sfida reale:

Preparazione:
1. Definisci chiaramente il problema
2. Invita 3-5 persone diverse

Sessione (30 min):
- 10 min: generazione libera (quantità, non qualità)
- 10 min: combinazione e sviluppo idee
- 10 min: selezione top 3 idee

Regole: nessun giudizio durante generazione, costruire sulle idee altrui.',
'Report brainstorming + top 3 idee + piano per svilupparne una',
'["Il processo ha funzionato?", "Quale fase è stata più produttiva?", "Come miglioreresti la prossima sessione?"]'::jsonb,
true, 34),

(gen_random_uuid(), 1, 35, 'Cross-Pollination', 'Impara da settori diversi', 'innovazione', 'azione', 'intermedio', 50, 'Settembre',
'Le idee migliori spesso vengono da settori completamente diversi dal tuo.',
'Esplora un settore completamente diverso dal tuo:

1. Scegli un settore che ti incuriosisce
2. Leggi 3 articoli su innovazioni in quel settore
3. Identifica 3 pratiche interessanti
4. Chiediti: come potrei applicarle al mio lavoro?
5. Sviluppa almeno un''idea concreta',
'Report su settore esplorato + 3 pratiche + 1 idea da implementare',
'["Cosa ti ha colpito di più del settore esplorato?", "È stato difficile fare il collegamento?", "Come implementerai l''idea?"]'::jsonb,
true, 35),

(gen_random_uuid(), 1, 36, 'Revisione Trimestrale PENSARE', 'Bilancio del terzo pilastro', 'pensiero-strategico', 'riflessione', 'intermedio', 60, 'Settembre',
'Terzo checkpoint trimestrale. Valuta i progressi nel pilastro PENSARE.',
'Rivedi gli esercizi delle ultime 12 settimane:

1. PENSIERO STRATEGICO: Hai una visione più chiara? (1-10)
2. DECISION MAKING: Decidi meglio ora?
3. INNOVAZIONE: Sei più creativo?
4. Come hai integrato ESSERE + SENTIRE + PENSARE?

Ripassa:
- La tua visione a 3 anni è ancora valida?
- Il tuo stile decisionale è migliorato?
- Hai implementato idee innovative?

Quali 3 cambiamenti hai fatto? Quali 3 vuoi fare?',
'Report di revisione trimestrale + piano per il prossimo trimestre',
'["Quale competenza è cresciuta di più?", "Come si integrano i tre pilastri finora?", "Cosa porterai nel pilastro AGIRE?"]'::jsonb,
true, 36),

-- =====================================================
-- MESE 10: AGIRE - Execution Excellence (Sett. 37-40)
-- =====================================================

(gen_random_uuid(), 1, 37, 'Da Strategia ad Azione', 'Trasforma i piani in risultati', 'execution', 'pianificazione', 'intermedio', 50, 'Ottobre',
'La differenza tra leader mediocri e grandi leader è l''esecuzione. Le idee senza azione sono solo sogni.',
'Prendi un obiettivo strategico e trasformalo in azioni concrete:

1. OBIETTIVO: Cosa vuoi raggiungere?
2. RISULTATI CHIAVE: Come saprai di aver raggiunto l''obiettivo? (3 misure)
3. INIZIATIVE: Quali azioni specifiche farai? (5-7 azioni)
4. TIMELINE: Quando farai ogni azione?
5. RESPONSABILITÀ: Chi fa cosa?
6. RISORSE: Cosa serve?
7. OSTACOLI: Cosa potrebbe bloccarti?

Inizia l''esecuzione questa settimana.',
'Piano d''azione completo + prime azioni eseguite + ostacoli incontrati',
'["Il piano è realistico?", "Hai iniziato l''esecuzione?", "Cosa ti ha bloccato?"]'::jsonb,
true, 37),

(gen_random_uuid(), 1, 38, 'Time Management Audit', 'Scopri dove va il tuo tempo', 'execution', 'analisi', 'base', 40, 'Ottobre',
'Non puoi gestire ciò che non misuri. Questa settimana scoprirai dove va veramente il tuo tempo.',
'Per 5 giorni lavorativi, traccia il tuo tempo in blocchi di 30 minuti:

Categorie:
- STRATEGICO: pensare, pianificare, innovare
- OPERATIVO: fare, eseguire, produrre
- RELAZIONALE: riunioni, 1:1, comunicazione
- AMMINISTRATIVO: email, report, burocrazia
- INTERRUZIONI: imprevisti, urgenze
- PERSONALE: pause, altro

A fine settimana: analizza dove va il tempo vs dove dovrebbe andare.',
'Diario 5 giorni + analisi distribuzione tempo + piano di ottimizzazione',
'["Ti aspettavi questa distribuzione?", "Quanto tempo sprechi?", "Cosa cambierai?"]'::jsonb,
true, 38),

(gen_random_uuid(), 1, 39, 'Delega Efficace', 'Moltiplica il tuo impatto', 'execution', 'azione', 'intermedio', 45, 'Ottobre',
'Delegare non è scaricare lavoro, è moltiplicare l''impatto attraverso gli altri.',
'Identifica 3 attività che dovresti delegare e delega almeno 1:

Framework di delega:
1. COSA: Definisci chiaramente il risultato atteso
2. PERCHÉ: Spiega l''importanza e il contesto
3. COME: Dai linee guida, non micro-istruzioni
4. QUANDO: Definisci deadline e check-point
5. SUPPORTO: Offri risorse e disponibilità
6. FEEDBACK: Pianifica il momento di revisione

Dopo la delega, resisti alla tentazione di controllare troppo.',
'3 attività identificate + 1 delegata + risultati + lezioni',
'["È stato difficile lasciare andare?", "Il risultato è stato accettabile?", "Cosa faresti diversamente?"]'::jsonb,
true, 39),

(gen_random_uuid(), 1, 40, 'Meeting Effectiveness', 'Trasforma le riunioni in azione', 'execution', 'azione', 'base', 35, 'Ottobre',
'Le riunioni sono dove muore la produttività o nasce l''azione. Dipende da come le gestisci.',
'Per 2 settimane, migliora le tue riunioni:

Prima:
- Serve davvero questa riunione?
- Qual è l''obiettivo specifico?
- Chi deve esserci veramente?
- Qual è l''agenda?

Durante:
- Inizia puntuale
- Mantieni il focus
- Assegna azioni con responsabili e deadline
- Finisci in anticipo

Dopo:
- Invia action items entro 24h
- Follow-up sui progressi',
'Checklist riunioni + analisi 5 riunioni + miglioramenti misurati',
'["Le tue riunioni sono più efficaci?", "Quanto tempo hai risparmiato?", "Cosa funziona meglio?"]'::jsonb,
true, 40),

-- =====================================================
-- MESE 11: AGIRE - Team Leadership (Sett. 41-44)
-- =====================================================

(gen_random_uuid(), 1, 41, 'Team Assessment', 'Valuta la salute del tuo team', 'team-leadership', 'analisi', 'intermedio', 50, 'Novembre',
'Prima di migliorare un team, devi capire dove si trova oggi.',
'Valuta il tuo team su queste dimensioni (1-10):

1. CHIAREZZA: Tutti sanno cosa devono fare?
2. COMPETENZA: Hanno le skill necessarie?
3. MOTIVAZIONE: Sono coinvolti e motivati?
4. FIDUCIA: Si fidano l''uno dell''altro?
5. COMUNICAZIONE: Comunicano apertamente?
6. CONFLITTO: Gestiscono i conflitti costruttivamente?
7. RISULTATI: Raggiungono gli obiettivi?

Per ogni area sotto 7, identifica una azione di miglioramento.',
'Assessment completo + aree prioritarie + piano di miglioramento',
'["La valutazione riflette la realtà?", "Quale area è più urgente?", "Come coinvolgerai il team nel miglioramento?"]'::jsonb,
true, 41),

(gen_random_uuid(), 1, 42, 'One-on-One Excellence', 'Trasforma i 1:1 in momenti di crescita', 'team-leadership', 'azione', 'base', 40, 'Novembre',
'I one-on-one sono il momento più importante per sviluppare i collaboratori.',
'Per le prossime 2 settimane, migliora i tuoi 1:1:

Struttura suggerita (30 min):
- 10 min: Loro agenda (cosa vogliono discutere)
- 10 min: Tua agenda (feedback, allineamento)
- 10 min: Sviluppo (crescita, carriera, supporto)

Domande potenti:
- "Cosa ti blocca?"
- "Come posso aiutarti?"
- "Cosa vorresti fare di più/meno?"
- "Come ti senti nel team?"

Conduci almeno 3 1:1 con questa struttura.',
'Report 3 1:1 + feedback ricevuto + cosa cambierai',
'["La nuova struttura funziona?", "I collaboratori hanno apprezzato?", "Cosa hai scoperto?"]'::jsonb,
true, 42),

(gen_random_uuid(), 1, 43, 'Gestione Conflitti', 'Trasforma il conflitto in opportunità', 'team-leadership', 'sfida', 'avanzato', 50, 'Novembre',
'Il conflitto è inevitabile nei team. La differenza la fa come viene gestito.',
'Se c''è un conflitto attivo nel team, affrontalo. Altrimenti, prepara un protocollo:

Protocollo SOLVE:
- See: Osserva il conflitto senza giudicare
- Own: Prendi responsabilità come leader
- Listen: Ascolta tutte le parti separatamente
- Value: Riconosci le prospettive valide di ognuno
- Explore: Cerca soluzioni win-win

Se affronti un conflitto reale, documenta il processo.',
'Protocollo conflitti + applicazione a caso reale (se disponibile) + lezioni',
'["È stato difficile rimanere neutrale?", "La soluzione soddisfa tutti?", "Come prevenirai conflitti futuri?"]'::jsonb,
true, 43),

(gen_random_uuid(), 1, 44, 'Sviluppo Talenti', 'Fai crescere i tuoi collaboratori', 'team-leadership', 'pianificazione', 'intermedio', 60, 'Novembre',
'I migliori leader si misurano da quanti leader hanno sviluppato.',
'Per ogni membro del tuo team:

1. Qual è il suo potenziale?
2. Quali competenze dovrebbe sviluppare?
3. Quale esperienza sarebbe formativa?
4. Come puoi supportare la sua crescita?

Crea un piano di sviluppo per almeno 2 collaboratori e condividilo con loro.',
'Piano sviluppo 2 collaboratori + loro feedback + prossimi passi',
'["I collaboratori hanno apprezzato l''attenzione?", "I piani sono realistici?", "Come monitorerai i progressi?"]'::jsonb,
true, 44),

-- =====================================================
-- MESE 12: AGIRE - Legacy e Impatto (Sett. 45-48)
-- =====================================================

(gen_random_uuid(), 1, 45, 'La Tua Legacy', 'Definisci l''impatto che vuoi lasciare', 'leadership-impact', 'riflessione', 'avanzato', 60, 'Dicembre',
'I leader pensano oltre il presente. Quale eredità vuoi lasciare?',
'Immagina di lasciare il tuo ruolo attuale tra 3 anni.

1. Cosa vorresti che le persone dicessero di te?
2. Quali cambiamenti duraturi avrai creato?
3. Chi avrai sviluppato che continuerà il tuo lavoro?
4. Quale impatto avrai avuto oltre il tuo team immediato?
5. Di cosa sarai più orgoglioso?

Scrivi la tua "legacy statement" in 100 parole.',
'Legacy statement + 3 azioni per iniziare a costruirla',
'["Questa legacy ti ispira?", "È allineata con i tuoi valori?", "Cosa devi fare diversamente per realizzarla?"]'::jsonb,
true, 45),

(gen_random_uuid(), 1, 46, 'Succession Planning', 'Prepara chi verrà dopo di te', 'leadership-impact', 'pianificazione', 'avanzato', 50, 'Dicembre',
'Un leader che non prepara successori non è un vero leader.',
'Crea un piano di successione per il tuo ruolo:

1. COMPETENZE CHIAVE: Cosa deve saper fare chi ti sostituirà?
2. CANDIDATI POTENZIALI: Chi potrebbe crescere in questo ruolo?
3. GAP ANALYSIS: Cosa manca a ciascun candidato?
4. PIANO DI SVILUPPO: Come colmerai i gap?
5. TIMELINE: Quando potrebbero essere pronti?
6. DOCUMENTAZIONE: Cosa devi documentare del tuo lavoro?',
'Piano successione completo + prime azioni di sviluppo',
'["Hai identificato candidati validi?", "Il piano è realistico?", "Cosa inizi a fare subito?"]'::jsonb,
true, 46),

(gen_random_uuid(), 1, 47, 'Impatto Sistemico', 'Cambia il sistema, non solo i sintomi', 'leadership-impact', 'analisi', 'avanzato', 60, 'Dicembre',
'I leader con impatto duraturo cambiano i sistemi, non solo i risultati immediati.',
'Identifica un''opportunità di cambiamento sistemico:

1. Quale problema ricorrente potresti risolvere alla radice?
2. Quali sono le cause sistemiche, non solo i sintomi?
3. Chi dovrebbe essere coinvolto per un cambiamento duraturo?
4. Quali resistenze incontrerai?
5. Qual è il primo passo per iniziare il cambiamento?

Sviluppa una proposta concreta e presentala a chi può supportarti.',
'Proposta cambiamento sistemico + feedback ricevuto + prossimi passi',
'["La proposta affronta le cause vere?", "Hai ottenuto supporto?", "Cosa serve per procedere?"]'::jsonb,
true, 47),

(gen_random_uuid(), 1, 48, 'Revisione Annuale', 'Celebra i progressi, pianifica il futuro', 'autenticita', 'riflessione', 'intermedio', 90, 'Dicembre',
'Un anno di crescita merita una riflessione profonda. Questo è il momento di celebrare e pianificare.',
'Rivedi l''intero anno di esercizi:

PER OGNI PILASTRO (ESSERE, SENTIRE, PENSARE, AGIRE):
- Dove eri a inizio anno? (1-10)
- Dove sei ora? (1-10)
- Quali sono stati i 3 momenti di svolta?
- Cosa hai imparato di più importante?

COMPLESSIVAMENTE:
- Di cosa sei più orgoglioso?
- Cosa faresti diversamente?
- Quali obiettivi per il prossimo anno?
- Chi vuoi ringraziare per il supporto?',
'Report annuale completo + obiettivi prossimo anno + messaggio di gratitudine a qualcuno',
'["Quanto sei cresciuto quest''anno?", "Cosa ti ha sorpreso di più del percorso?", "Come continuerai a crescere?"]'::jsonb,
true, 48),

-- =====================================================
-- BONUS: Settimane 49-52 - Consolidamento
-- =====================================================

(gen_random_uuid(), 1, 49, 'Rituale Mattutino', 'Crea la tua routine di leadership', 'presenza', 'azione', 'base', 30, 'Dicembre',
'I grandi leader hanno rituali che li preparano ad essere al meglio ogni giorno.',
'Crea e testa un rituale mattutino di 15-30 minuti:

Elementi possibili:
- 5 min: Mindfulness/meditazione
- 5 min: Revisione priorità giornata
- 5 min: Gratitudine (3 cose)
- 5 min: Visualizzazione successo
- 5 min: Movimento/stretching

Testa per 7 giorni e adatta alle tue esigenze.',
'Rituale definito + diario 7 giorni + versione finale ottimizzata',
'["Il rituale migliora le tue giornate?", "È sostenibile?", "Cosa cambierai?"]'::jsonb,
true, 49),

(gen_random_uuid(), 1, 50, 'Mentor e Mentee', 'Ricevi e dai mentorship', 'team-leadership', 'azione', 'intermedio', 45, 'Dicembre',
'La mentorship è un ciclo: ricevi da chi è più avanti, dai a chi è più indietro.',
'Attiva entrambi i lati della mentorship:

COME MENTEE:
- Identifica qualcuno da cui vorresti imparare
- Chiedi un incontro di 30 minuti
- Prepara 3 domande specifiche
- Chiedi se può essere un rapporto continuativo

COME MENTOR:
- Identifica qualcuno che potresti aiutare
- Offri il tuo supporto
- Ascolta cosa gli serve
- Proponi un percorso',
'Report entrambe le conversazioni + valore ricevuto/dato + prossimi passi',
'["Come ti sei sentito in entrambi i ruoli?", "Cosa hai imparato come mentee?", "Cosa hai dato come mentor?"]'::jsonb,
true, 50),

(gen_random_uuid(), 1, 51, 'Personal Board', 'Crea il tuo consiglio di amministrazione personale', 'leadership-impact', 'pianificazione', 'avanzato', 45, 'Dicembre',
'I migliori leader hanno un network di consiglieri fidati.',
'Crea il tuo Personal Board of Directors:

Ruoli necessari:
1. SPONSOR: Chi ti supporta nella carriera
2. MENTOR: Chi ti guida con la sua esperienza
3. COACH: Chi ti sfida a crescere
4. CONNECTOR: Chi ti apre porte
5. PEER: Chi capisce le tue sfide

Per ogni ruolo:
- Chi potrebbe ricoprirlo?
- Che relazione hai già?
- Come puoi svilupparla?',
'Personal Board definito + piano per attivare ogni relazione',
'["Hai le persone giuste intorno a te?", "Quale relazione è più da sviluppare?", "Come manterrai il Board attivo?"]'::jsonb,
true, 51),

(gen_random_uuid(), 1, 52, 'Il Prossimo Capitolo', 'Pianifica la tua continua evoluzione', 'pensiero-strategico', 'riflessione', 'intermedio', 60, 'Dicembre',
'La crescita non finisce mai. Questo è l''inizio del prossimo capitolo.',
'Pianifica il tuo secondo anno di crescita:

1. CONSOLIDAMENTO: Quali esercizi ripeterai?
2. APPROFONDIMENTO: Quali aree vuoi esplorare di più?
3. NUOVE SFIDE: Cosa non hai ancora provato?
4. SUPPORTO: Di chi avrai bisogno?
5. MISURA: Come traccerai i progressi?

Crea un piano trimestrale per il prossimo anno.',
'Piano annuale con obiettivi trimestrali + primo passo da fare lunedì',
'["Sei motivato per il prossimo anno?", "Il piano è ambizioso ma realistico?", "Cosa inizi a fare subito?"]'::jsonb,
true, 52);
