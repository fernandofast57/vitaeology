-- ============================================================
-- ESERCIZI MICROFELICITA V2 - MAPPATI ALLE 13 DIMENSIONI ASSESSMENT
-- 26 esercizi (2 per dimensione):
-- - R.A.D.A.R. (5): RR, RA, RD, RM, RS
-- - Sabotatori (5): SM, SA, SI, SC, SE
-- - Livelli (3): L1, L2, L3
-- Conformità: Principio Validante - "Già possiedi questa capacità"
-- ============================================================

INSERT INTO exercises (
  title, description, book_slug, source_type, pillar_primary,
  week_number, difficulty_level, estimated_time_minutes,
  instructions, deliverable, reflection_prompts
)
VALUES

-- ═══════════════════════════════════════════════════════════════
-- R.A.D.A.R. FASE RR: RILEVA (2 esercizi)
-- Capacità di notare piccoli momenti piacevoli durante la giornata
-- ═══════════════════════════════════════════════════════════════
(
  'RR-1: I 50 Momenti Invisibili',
  'I momenti piacevoli ci sono già - succedono continuamente. Il problema non è che mancano, è che non li noti. Questo esercizio allena il tuo radar a rilevarli.',
  'microfelicita', 'dimension', 'SENTIRE', 25, 'base', 15,
  'Per 3 giorni, scrivi 15-20 momenti piacevoli al giorno. Qualsiasi cosa: un caffè caldo, un raggio di sole, un sorriso, un pensiero bello. Non devono essere grandi - cerca i PICCOLI. Alla fine avrai 50+ momenti.',
  'Lista di almeno 50 momenti piacevoli raccolti in 3 giorni',
  ARRAY['Quanti di questi momenti avrei notato senza l''esercizio?', 'Qual è stato il momento più piccolo che ho notato?', 'Come mi sento dopo averli scritti?']
),
(
  'RR-2: Il Radar delle Prime 2 Ore',
  'Le prime 2 ore della giornata contengono più momenti piacevoli di quanti pensi. Ma di solito sei in modalità "fare" e non "notare". Questo esercizio cambia la mattina.',
  'microfelicita', 'dimension', 'SENTIRE', 26, 'intermedio', 10,
  'Per una settimana, nelle prime 2 ore dopo il risveglio: (1) Cerca attivamente almeno 5 micro-momenti piacevoli (2) Annotali sul telefono appena li noti (3) A fine settimana: quale momento ricorreva?',
  'Registro di 7 giorni di momenti mattutini + pattern identificati',
  ARRAY['Cosa c''era sempre nelle mie mattine che non avevo mai notato?', 'Come è cambiata la mia mattinata notando questi momenti?', 'Quale momento voglio proteggere?']
),

-- ═══════════════════════════════════════════════════════════════
-- R.A.D.A.R. FASE RA: ACCOGLI (2 esercizi)
-- Capacità di accettare i momenti piacevoli senza giudizio
-- ═══════════════════════════════════════════════════════════════
(
  'RA-1: Accogliere Senza "Ma"',
  'La mente vuole sempre aggiungere un "ma" ai momenti piacevoli: "È bello, ma durerà poco", "È piacevole, ma non me lo merito". Questo esercizio insegna ad accogliere senza filtri.',
  'microfelicita', 'dimension', 'ESSERE', 27, 'base', 15,
  'Per 5 giorni, quando noti un momento piacevole: (1) Osserva se arriva un "ma" o un "sì, però" (2) NON seguire quel pensiero (3) Torna al momento semplice (4) Annota: "Ho notato [momento]. La mente voleva dire [ma...]. Sono rimasto nel momento."',
  'Diario di 5 giorni con i "ma" intercettati e lasciati andare',
  ARRAY['Quali "ma" arrivavano più spesso?', 'Cosa succede quando non seguo il "ma"?', 'Il momento diventa più o meno intenso senza il "ma"?']
),
(
  'RA-2: Il Momento È Abbastanza',
  'Non serve che il momento piacevole sia importante, significativo o duraturo. Deve solo essere piacevole. Questo esercizio abbassa la soglia di ciò che "merita" di essere notato.',
  'microfelicita', 'dimension', 'ESSERE', 28, 'intermedio', 20,
  'Per 3 giorni, cerca i momenti più "insignificanti" possibili: il suono dell''acqua, il peso del corpo sulla sedia, un respiro profondo. (1) Nota almeno 10 momenti "insignificanti" al giorno (2) Accogli ognuno come se fosse importante (3) Scrivi: sono abbastanza?',
  'Lista di 30 momenti "insignificanti" con riflessione su ciascuno',
  ARRAY['Qual era il momento più piccolo che sono riuscito ad accogliere?', 'La parola "insignificante" ha ancora senso dopo questo esercizio?', 'Cosa ho imparato sull''accogliere?']
),

-- ═══════════════════════════════════════════════════════════════
-- R.A.D.A.R. FASE RD: DISTINGUI (2 esercizi)
-- Capacità di riconoscere la qualità autentica dei momenti
-- ═══════════════════════════════════════════════════════════════
(
  'RD-1: Genuino vs Forzato',
  'Non tutti i momenti "piacevoli" sono uguali. Alcuni sono genuini, altri sono forzati o di compensazione. Questo esercizio affina la tua capacità di distinguere.',
  'microfelicita', 'dimension', 'PENSARE', 29, 'base', 20,
  'Per una settimana, quando noti qualcosa di piacevole, chiediti: (1) Questo piacere è genuino o sto cercando di compensare qualcosa? (2) Sto godendo il momento o sto scappando da qualcos''altro? (3) Segna G (genuino) o C (compensazione) accanto al momento.',
  'Registro di 7 giorni con distinzione G/C per ogni momento',
  ARRAY['Quale proporzione era genuina vs compensazione?', 'Come riconosco la differenza?', 'I momenti genuini hanno qualcosa in comune?']
),
(
  'RD-2: La Qualità del Piacere',
  'Il piacere ha qualità diverse: può essere calmo o eccitato, pieno o leggero, profondo o superficiale. Questo esercizio sviluppa un vocabolario più ricco.',
  'microfelicita', 'dimension', 'PENSARE', 30, 'intermedio', 15,
  'Per 5 giorni, descrivi ogni momento piacevole con 3 aggettivi. Non usare "bello" o "piacevole" - cerca parole più precise: tranquillo, caldo, elettrico, morbido, espansivo, intimo, luminoso...',
  'Lista di 25+ momenti con 3 aggettivi ciascuno',
  ARRAY['Quali aggettivi uso più spesso?', 'Quali qualità di piacere preferisco?', 'Quali qualità sono più rare nella mia vita?']
),

-- ═══════════════════════════════════════════════════════════════
-- R.A.D.A.R. FASE RM: AMPLIFICA (2 esercizi)
-- Capacità di intensificare e prolungare i momenti piacevoli
-- ═══════════════════════════════════════════════════════════════
(
  'RM-1: I 10 Secondi Magici',
  'La differenza tra notare e sentire sono 10 secondi. Quando noti qualcosa di piacevole e vai subito oltre, il cervello non registra. 10 secondi cambiano tutto.',
  'microfelicita', 'dimension', 'SENTIRE', 31, 'base', 10,
  'Per una settimana, quando noti un momento piacevole: (1) FERMATI (2) Resta nel momento per 10 secondi (conta mentalmente) (3) Respira (4) Nota cosa succede nel corpo. Fallo almeno 5 volte al giorno.',
  'Registro di 35+ momenti amplificati con nota su cosa è cambiato',
  ARRAY['Cosa succedeva nel corpo durante i 10 secondi?', 'Il momento diventava più intenso, meno, o diverso?', 'Quale momento è stato più amplificato?']
),
(
  'RM-2: Il Respiro che Amplifica',
  'Il respiro è un amplificatore naturale. Quando associ un momento piacevole a un respiro profondo, lo ancori nel corpo.',
  'microfelicita', 'dimension', 'SENTIRE', 32, 'intermedio', 15,
  'Per 5 giorni: (1) Quando noti un momento piacevole, fai 3 respiri profondi DENTRO il momento (2) Inspira: assorbi il piacere (3) Espira: lascia che si espanda (4) Nota la differenza tra momento con respiro e senza.',
  'Diario di 5 giorni con almeno 5 momenti "respirati" per giorno',
  ARRAY['Come cambia il momento quando respiro dentro?', 'Il corpo trattiene qualcosa del momento dopo?', 'Quanto dura l''effetto dell''amplificazione?']
),

-- ═══════════════════════════════════════════════════════════════
-- R.A.D.A.R. FASE RS: RESTA (2 esercizi)
-- Capacità di completare il ciclo senza abbandonare prematuramente
-- ═══════════════════════════════════════════════════════════════
(
  'RS-1: Non Andare Via Prima',
  'Spesso abbandoniamo i momenti piacevoli troppo presto. La mente dice "ok, basta" e torniamo ai pensieri. Questo esercizio allena a restare fino alla fine naturale.',
  'microfelicita', 'dimension', 'ESSERE', 33, 'base', 15,
  'Per 5 giorni, scegli 3 momenti al giorno e RESTA finché non finiscono naturalmente. Non sei tu a decidere quando il momento finisce - lascia che il momento ti dica quando è completo. Annota quanto è durato e come ti sei sentito.',
  'Registro di 15 momenti vissuti "fino alla fine" con durata',
  ARRAY['Quanto duravano in media i momenti completi?', 'Cosa mi faceva voler andare via prima?', 'Come mi sentivo restando fino alla fine?']
),
(
  'RS-2: Il Ciclo Completo',
  'R.A.D.A.R. è un ciclo. Quando lo completi, il momento si integra. Quando lo interrompi, si perde. Questo esercizio ti fa praticare il ciclo intero.',
  'microfelicita', 'dimension', 'ESSERE', 34, 'avanzato', 20,
  'Per 3 giorni, scegli 5 momenti e applica tutto R.A.D.A.R.: (R) Rileva il momento (A) Accogli senza "ma" (D) Distingui la qualità (A) Amplifica con il respiro (R) Resta fino alla fine. Scrivi l''esperienza completa.',
  'Diario di 15 esperienze R.A.D.A.R. complete',
  ARRAY['Quale fase era più facile?', 'Quale fase saltavo o accorciavo?', 'Come cambia l''esperienza quando completo tutto il ciclo?']
),

-- ═══════════════════════════════════════════════════════════════
-- SABOTATORE SM: MINIMIZZAZIONE ISTANTANEA (2 esercizi)
-- Tendenza a svalutare immediatamente i momenti positivi
-- ═══════════════════════════════════════════════════════════════
(
  'SM-1: Cattura il Minimizzatore',
  'Il sabotatore Minimizzazione agisce in frazioni di secondo: "È poco", "Non conta", "Poteva essere meglio". Questo esercizio ti insegna a vederlo mentre agisce.',
  'microfelicita', 'dimension', 'PENSARE', 35, 'base', 15,
  'Per una settimana, ogni volta che noti qualcosa di piacevole, ascolta cosa dice la mente SUBITO DOPO. Scrivi la frase esatta del minimizzatore. Es: "Sì, ma è solo un caffè", "Non è niente di speciale".',
  'Collezione di frasi del minimizzatore con frequenza',
  ARRAY['Quali frasi usa più spesso il mio minimizzatore?', 'Quando è più attivo?', 'Da dove vengono queste frasi?']
),
(
  'SM-2: Rispondi al Minimizzatore',
  'Una volta che vedi il minimizzatore, puoi rispondergli. Non per combatterlo, ma per offrire una prospettiva alternativa.',
  'microfelicita', 'dimension', 'PENSARE', 36, 'intermedio', 20,
  'Per 5 giorni, quando il minimizzatore parla, rispondi: (1) Ascolta cosa dice (2) Scrivi una risposta gentile ma ferma (3) Es: "È solo un caffè" → "È un caffè che sto bevendo adesso, e posso godermelo". Nota come cambia l''esperienza.',
  'Diario di 5 giorni con dialoghi minimizzatore-risposta',
  ARRAY['Rispondere cambia qualcosa?', 'Il minimizzatore diventa meno forte?', 'Quale risposta funziona meglio per me?']
),

-- ═══════════════════════════════════════════════════════════════
-- SABOTATORE SA: ANTICIPO PROTETTIVO (2 esercizi)
-- Tendenza a preoccuparsi durante i momenti positivi
-- ═══════════════════════════════════════════════════════════════
(
  'SA-1: La Paura che Finisca',
  'Il sabotatore Anticipo sussurra: "Goditi, ma ricorda che finirà", "Meglio non affezionarsi troppo". È una protezione che rovina il presente.',
  'microfelicita', 'dimension', 'SENTIRE', 37, 'base', 15,
  'Per una settimana, nota quando la mente pensa al dopo DURANTE un momento piacevole. Scrivi: (1) Il momento (2) Il pensiero anticipatore (3) Come ha cambiato l''esperienza.',
  'Registro di anticipazioni durante momenti piacevoli',
  ARRAY['Quanto spesso anticipo durante i momenti belli?', 'Cosa cerco di proteggermi anticipando?', 'La protezione funziona davvero?']
),
(
  'SA-2: Questo Momento Basta',
  'L''antidoto all''anticipo è tornare al presente. Ogni volta che la mente va al futuro, riportala al momento. Il momento presente è l''unico che puoi vivere.',
  'microfelicita', 'dimension', 'SENTIRE', 38, 'intermedio', 15,
  'Per 5 giorni, quando noti l''anticipo, usa questa frase: "Questo momento basta. Adesso sono qui." Ripetila 3 volte, poi torna al momento. Nota quante volte devi usarla e se diventa più facile.',
  'Diario di 5 giorni con conteggio "ritorni al presente"',
  ARRAY['Quante volte ho dovuto "tornare" in media?', 'Diventa più facile con la pratica?', 'Come mi sento quando resto nel presente?']
),

-- ═══════════════════════════════════════════════════════════════
-- SABOTATORE SI: AUTO-INTERRUZIONE COGNITIVA (2 esercizi)
-- Tendenza a interrompere i momenti piacevoli con pensieri
-- ═══════════════════════════════════════════════════════════════
(
  'SI-1: Il Pensiero che Interrompe',
  'Stai godendo un momento e... un pensiero ti porta via. Lavoro, problemi, cose da fare. Il sabotatore Interruzione ti toglie dal presente continuamente.',
  'microfelicita', 'dimension', 'PENSARE', 39, 'base', 15,
  'Per una settimana, nota quando un pensiero ti porta via da un momento piacevole. (1) Cosa stavi vivendo? (2) Che pensiero ti ha interrotto? (3) Dove ti ha portato? (4) Poteva aspettare?',
  'Mappa di 7 giorni di interruzioni con analisi pattern',
  ARRAY['Quali pensieri interrompono più spesso?', 'Potevano davvero aspettare?', 'Quanto del mio tempo piacevole perdo così?']
),
(
  'SI-2: Il Parcheggio dei Pensieri',
  'Non puoi fermare i pensieri, ma puoi parcheggiarli. Questo esercizio insegna a notare il pensiero, riconoscere che può aspettare, e tornare al momento.',
  'microfelicita', 'dimension', 'PENSARE', 40, 'intermedio', 20,
  'Per 5 giorni, quando un pensiero interrompe: (1) Nota il pensiero (2) Di'': "Ti vedo. Puoi aspettare 2 minuti." (3) Visualizza di parcheggiarlo da qualche parte (4) Torna al momento (5) Dopo 2 minuti, occupati del pensiero se serve.',
  'Diario di 5 giorni con pensieri parcheggiati e risultati',
  ARRAY['I pensieri parcheggiati erano urgenti come sembravano?', 'Riesco a tornare al momento dopo il parcheggio?', 'Quale visualizzazione funziona meglio per me?']
),

-- ═══════════════════════════════════════════════════════════════
-- SABOTATORE SC: CAMBIO DI FUOCO IMMEDIATO (2 esercizi)
-- Tendenza a spostare l'attenzione verso il negativo
-- ═══════════════════════════════════════════════════════════════
(
  'SC-1: Notare il Cambio',
  'Stai bene, poi l''attenzione si sposta su qualcosa di negativo. Non l''hai scelto - è successo. Il sabotatore Cambio Fuoco ti ruba il positivo dandoti il negativo.',
  'microfelicita', 'dimension', 'SENTIRE', 41, 'base', 15,
  'Per una settimana, nota quando l''attenzione passa da qualcosa di piacevole a qualcosa di spiacevole. (1) Da cosa a cosa? (2) È stato un tuo scelta o è "successo"? (3) Il negativo era più urgente del positivo?',
  'Registro di 7 giorni di cambi di fuoco',
  ARRAY['Quante volte al giorno succede?', 'Il negativo era davvero più importante?', 'Cosa mi attira verso il negativo?']
),
(
  'SC-2: Scegliere Dove Guardare',
  'Non puoi impedire che la mente noti il negativo. Ma puoi scegliere di tornare al positivo. Questo esercizio allena la scelta consapevole dell''attenzione.',
  'microfelicita', 'dimension', 'SENTIRE', 42, 'intermedio', 15,
  'Per 5 giorni, quando noti un cambio di fuoco verso il negativo: (1) Nota che è successo (2) Chiediti: devo occuparmene ORA? (3) Se no, SCEGLI di tornare al positivo (4) Nota come ti senti dopo la scelta.',
  'Diario di 5 giorni con scelte consapevoli di focus',
  ARRAY['Quanto spesso potevo tornare al positivo?', 'Come mi sento quando scelgo io dove guardare?', 'Il negativo può aspettare più di quanto pensavo?']
),

-- ═══════════════════════════════════════════════════════════════
-- SABOTATORE SE: CORREZIONE EMOTIVA (2 esercizi)
-- Tendenza a riequilibrare verso il basso le emozioni positive
-- ═══════════════════════════════════════════════════════════════
(
  'SE-1: Il Tetto delle Emozioni',
  'Alcune persone hanno un "tetto" emotivo: quando si sentono troppo bene, qualcosa le riporta giù. È il sabotatore Correzione che dice "non esagerare".',
  'microfelicita', 'dimension', 'ESSERE', 43, 'base', 15,
  'Per una settimana, nota quando un''emozione positiva viene "corretta": (1) Quanto positivo stavi sentendo (1-10)? (2) Cosa ti ha riportato giù? (3) Era necessario o automatico?',
  'Registro di 7 giorni di correzioni emotive',
  ARRAY['Ho un tetto emotivo? A che livello?', 'Chi o cosa mi ha insegnato a non sentirmi "troppo" bene?', 'Cosa succederebbe se lasciassi l''emozione salire?']
),
(
  'SE-2: Lascia Salire',
  'Puoi scegliere di non correggere. Quando arriva la correzione, puoi notarla e lasciar continuare l''emozione positiva. È un esercizio di permesso.',
  'microfelicita', 'dimension', 'ESSERE', 44, 'intermedio', 20,
  'Per 5 giorni, quando senti la correzione arrivare: (1) Nota la voce che dice "basta così" (2) Rispondi: "Posso sentirmi così bene. È sicuro." (3) Lascia che l''emozione continui (4) Nota dove arriva se non la fermi.',
  'Diario di 5 giorni con emozioni non corrette',
  ARRAY['Cosa succede quando non correggo?', 'L''emozione diventa troppo intensa o si stabilizza?', 'Di cosa avevo paura che non è successo?']
),

-- ═══════════════════════════════════════════════════════════════
-- LIVELLO L1: CAMPO INTERNO (2 esercizi)
-- Capacità di riconoscere microfelicità personali
-- ═══════════════════════════════════════════════════════════════
(
  'L1-1: La Mia Firma di Benessere',
  'Hai un modo unico di sentirti bene. Certe cose funzionano per te che non funzionano per altri. Questo esercizio mappa la tua firma personale di microfelicità.',
  'microfelicita', 'dimension', 'ESSERE', 45, 'base', 25,
  'Fai una lista di 20 cose che ti fanno stare bene (piccole, quotidiane). Per ognuna nota: (1) Quale senso coinvolge? (2) Quando funziona meglio? (3) Con che frequenza la vivi? Cerca pattern: cosa hanno in comune quelle più potenti?',
  'Mappa personale di 20 fonti di microfelicità con analisi',
  ARRAY['Quali sensi uso di più?', 'Quali fonti sono sottoutilizzate?', 'Come posso viverne di più senza sforzo?']
),
(
  'L1-2: La Giornata Progettata',
  'Ora che conosci le tue fonti, puoi progettare una giornata che le includa. Non per forza tutte, ma abbastanza per raggiungere una massa critica di microfelicità.',
  'microfelicita', 'dimension', 'ESSERE', 46, 'intermedio', 30,
  'Progetta una giornata ideale includendo almeno 10 delle tue fonti di microfelicità. (1) Scrivi la giornata ora per ora (2) Vivi quella giornata (3) Nota: è stato artificiale o naturale? Faticoso o energizzante?',
  'Progetto di giornata + report dell''esperienza vissuta',
  ARRAY['La giornata progettata era sostenibile?', 'Cosa terrei per sempre?', 'Cosa era troppo o troppo poco?']
),

-- ═══════════════════════════════════════════════════════════════
-- LIVELLO L2: SPAZIO RELAZIONALE (2 esercizi)
-- Capacità di riconoscere microfelicità condivise
-- ═══════════════════════════════════════════════════════════════
(
  'L2-1: Microfelicità a Due',
  'Le microfelicità condivise sono diverse da quelle personali. Non le vivi da solo - le vivi CON qualcuno. Questo esercizio esplora il territorio relazionale.',
  'microfelicita', 'dimension', 'SENTIRE', 47, 'base', 20,
  'Per una settimana, nota i momenti piacevoli che vivi CON altri (non solo accanto ad altri). (1) Cosa stavate facendo? (2) Cosa rendeva piacevole farlo INSIEME? (3) Avresti potuto viverlo da solo? (4) Cosa aggiunge l''altro?',
  'Registro di 7 giorni di microfelicità condivise',
  ARRAY['Quante microfelicità della mia settimana sono condivise?', 'Con chi condivido di più?', 'Cosa aggiunge la condivisione?']
),
(
  'L2-2: Creare Momenti Condivisi',
  'Puoi creare intenzionalmente momenti di microfelicità condivisa. Non sono spontanei - sono progettati. E funzionano ugualmente.',
  'microfelicita', 'dimension', 'SENTIRE', 48, 'intermedio', 25,
  'Questa settimana, crea intenzionalmente 5 momenti di microfelicità condivisa con persone diverse. (1) Pianifica un piccolo momento piacevole DA VIVERE INSIEME (2) Vivilo con attenzione (3) Nota: funziona anche se è intenzionale?',
  'Registro di 5 momenti condivisi creati intenzionalmente',
  ARRAY['I momenti creati erano meno autentici?', 'L''altro ha notato che era intenzionale?', 'Quale momento ha funzionato meglio?']
),

-- ═══════════════════════════════════════════════════════════════
-- LIVELLO L3: CAMPO DEI CONTESTI (2 esercizi)
-- Capacità di riconoscere microfelicità nei gruppi e contesti
-- ═══════════════════════════════════════════════════════════════
(
  'L3-1: L''Atmosfera del Gruppo',
  'I gruppi hanno microfelicità collettive: momenti in cui tutti si sentono bene insieme. Questo esercizio allena a notarli e contribuirvi.',
  'microfelicita', 'dimension', 'AGIRE', 49, 'intermedio', 20,
  'Per una settimana, in ogni situazione di gruppo (riunione, cena, evento): (1) Nota se ci sono momenti di benessere collettivo (2) Cosa li ha generati? (3) Come puoi contribuire a crearne?',
  'Registro di 7 giorni di microfelicità di gruppo',
  ARRAY['Quanto spesso i gruppi vivono microfelicità?', 'Cosa le genera più spesso?', 'Posso influenzare l''atmosfera del gruppo?']
),
(
  'L3-2: Facilitare la Microfelicità Collettiva',
  'Puoi diventare una persona che crea microfelicità nei contesti in cui entra. Non servono grandi gesti - servono piccole attenzioni.',
  'microfelicita', 'dimension', 'AGIRE', 50, 'avanzato', 30,
  'Per 5 giorni, entra in ogni gruppo con l''intenzione di contribuire a un momento di benessere collettivo. (1) Cosa puoi fare di piccolo per migliorare l''atmosfera? (2) Fallo (3) Nota l''effetto - anche se piccolo.',
  'Diario di 5 giorni di contributi alla microfelicità collettiva',
  ARRAY['Cosa funziona meglio per migliorare l''atmosfera?', 'Gli altri notano quando contribuisco?', 'Come mi sento nel ruolo di facilitatore?']
);

-- ============================================================
-- VERIFICA INSERIMENTO
-- ============================================================
SELECT
  book_slug,
  COUNT(*) as total_exercises,
  COUNT(CASE WHEN difficulty_level = 'base' THEN 1 END) as base,
  COUNT(CASE WHEN difficulty_level = 'intermedio' THEN 1 END) as intermedio,
  COUNT(CASE WHEN difficulty_level = 'avanzato' THEN 1 END) as avanzato
FROM exercises
WHERE book_slug = 'microfelicita'
GROUP BY book_slug;

-- Mostra esercizi inseriti
SELECT week_number, title, difficulty_level, pillar_primary, source_type
FROM exercises
WHERE book_slug = 'microfelicita' AND source_type = 'dimension'
ORDER BY week_number;
