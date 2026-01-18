-- ============================================================
-- ESERCIZI MICROFELICITA - COMPLETI CON DIMENSION_CODE
-- 26 esercizi mappati alle 13 dimensioni assessment
-- Eseguire DOPO 00_add_dimension_code.sql
-- ============================================================

-- Pulisci esercizi dimension precedenti per microfelicita (evita duplicati)
DELETE FROM exercises
WHERE book_slug = 'microfelicita'
AND source_type = 'dimension';

-- ═══════════════════════════════════════════════════════════════
-- INSERIMENTO ESERCIZI CON DIMENSION_CODE
-- ═══════════════════════════════════════════════════════════════

INSERT INTO exercises (
  title, description, book_slug, source_type, pillar_primary,
  week_number, difficulty_level, estimated_time_minutes,
  instructions, deliverable, reflection_prompts, dimension_code
)
VALUES

-- ═══════════════════════════════════════════════════════════════
-- R.A.D.A.R. FASE RR: RILEVA (SENTIRE)
-- Capacita di notare piccoli momenti piacevoli durante la giornata
-- ═══════════════════════════════════════════════════════════════
(
  'RR-1: I 50 Momenti Invisibili',
  'I momenti piacevoli ci sono gia - succedono continuamente. Il problema non e che mancano, e che non li noti. Questo esercizio allena il tuo radar a rilevarli.',
  'microfelicita', 'dimension', 'SENTIRE', 25, 'base', 15,
  'Per 3 giorni, scrivi 15-20 momenti piacevoli al giorno. Qualsiasi cosa: un caffe caldo, un raggio di sole, un sorriso, un pensiero bello. Non devono essere grandi - cerca i PICCOLI. Alla fine avrai 50+ momenti.',
  'Lista di almeno 50 momenti piacevoli raccolti in 3 giorni',
  ARRAY['Quanti di questi momenti avrei notato senza l''esercizio?', 'Qual e stato il momento piu piccolo che ho notato?', 'Come mi sento dopo averli scritti?'],
  'RR'
),
(
  'RR-2: Il Radar delle Prime 2 Ore',
  'Le prime 2 ore della giornata contengono piu momenti piacevoli di quanti pensi. Ma di solito sei in modalita "fare" e non "notare". Questo esercizio cambia la mattina.',
  'microfelicita', 'dimension', 'SENTIRE', 26, 'intermedio', 10,
  'Per una settimana, nelle prime 2 ore dopo il risveglio: (1) Cerca attivamente almeno 5 micro-momenti piacevoli (2) Annotali sul telefono appena li noti (3) A fine settimana: quale momento ricorreva?',
  'Registro di 7 giorni di momenti mattutini + pattern identificati',
  ARRAY['Cosa c''era sempre nelle mie mattine che non avevo mai notato?', 'Come e cambiata la mia mattinata notando questi momenti?', 'Quale momento voglio proteggere?'],
  'RR'
),

-- ═══════════════════════════════════════════════════════════════
-- R.A.D.A.R. FASE RA: ACCOGLI (ESSERE)
-- Capacita di accettare i momenti piacevoli senza giudizio
-- ═══════════════════════════════════════════════════════════════
(
  'RA-1: Accogliere Senza "Ma"',
  'La mente vuole sempre aggiungere un "ma" ai momenti piacevoli: "E bello, ma durera poco", "E piacevole, ma non me lo merito". Questo esercizio insegna ad accogliere senza filtri.',
  'microfelicita', 'dimension', 'ESSERE', 27, 'base', 15,
  'Per 5 giorni, quando noti un momento piacevole: (1) Osserva se arriva un "ma" o un "si, pero" (2) NON seguire quel pensiero (3) Torna al momento semplice (4) Annota: "Ho notato [momento]. La mente voleva dire [ma...]. Sono rimasto nel momento."',
  'Diario di 5 giorni con i "ma" intercettati e lasciati andare',
  ARRAY['Quali "ma" arrivavano piu spesso?', 'Cosa succede quando non seguo il "ma"?', 'Il momento diventa piu o meno intenso senza il "ma"?'],
  'RA'
),
(
  'RA-2: Il Momento E Abbastanza',
  'Non serve che il momento piacevole sia importante, significativo o duraturo. Deve solo essere piacevole. Questo esercizio abbassa la soglia di cio che "merita" di essere notato.',
  'microfelicita', 'dimension', 'ESSERE', 28, 'intermedio', 20,
  'Per 3 giorni, cerca i momenti piu "insignificanti" possibili: il suono dell''acqua, il peso del corpo sulla sedia, un respiro profondo. (1) Nota almeno 10 momenti "insignificanti" al giorno (2) Accogli ognuno come se fosse importante (3) Scrivi: sono abbastanza?',
  'Lista di 30 momenti "insignificanti" con riflessione su ciascuno',
  ARRAY['Qual era il momento piu piccolo che sono riuscito ad accogliere?', 'La parola "insignificante" ha ancora senso dopo questo esercizio?', 'Cosa ho imparato sull''accogliere?'],
  'RA'
),

-- ═══════════════════════════════════════════════════════════════
-- R.A.D.A.R. FASE RD: DISTINGUI (PENSARE)
-- Capacita di riconoscere la qualita autentica dei momenti
-- ═══════════════════════════════════════════════════════════════
(
  'RD-1: Genuino vs Forzato',
  'Non tutti i momenti "piacevoli" sono uguali. Alcuni sono genuini, altri sono forzati o di compensazione. Questo esercizio affina la tua capacita di distinguere.',
  'microfelicita', 'dimension', 'PENSARE', 29, 'base', 20,
  'Per una settimana, quando noti qualcosa di piacevole, chiediti: (1) Questo piacere e genuino o sto cercando di compensare qualcosa? (2) Sto godendo il momento o sto scappando da qualcos''altro? (3) Segna G (genuino) o C (compensazione) accanto al momento.',
  'Registro di 7 giorni con distinzione G/C per ogni momento',
  ARRAY['Quale proporzione era genuina vs compensazione?', 'Come riconosco la differenza?', 'I momenti genuini hanno qualcosa in comune?'],
  'RD'
),
(
  'RD-2: La Qualita del Piacere',
  'Il piacere ha qualita diverse: puo essere calmo o eccitato, pieno o leggero, profondo o superficiale. Questo esercizio sviluppa un vocabolario piu ricco.',
  'microfelicita', 'dimension', 'PENSARE', 30, 'intermedio', 15,
  'Per 5 giorni, descrivi ogni momento piacevole con 3 aggettivi. Non usare "bello" o "piacevole" - cerca parole piu precise: tranquillo, caldo, elettrico, morbido, espansivo, intimo, luminoso...',
  'Lista di 25+ momenti con 3 aggettivi ciascuno',
  ARRAY['Quali aggettivi uso piu spesso?', 'Quali qualita di piacere preferisco?', 'Quali qualita sono piu rare nella mia vita?'],
  'RD'
),

-- ═══════════════════════════════════════════════════════════════
-- R.A.D.A.R. FASE RM: AMPLIFICA (SENTIRE)
-- Capacita di intensificare e prolungare i momenti piacevoli
-- ═══════════════════════════════════════════════════════════════
(
  'RM-1: I 10 Secondi Magici',
  'La differenza tra notare e sentire sono 10 secondi. Quando noti qualcosa di piacevole e vai subito oltre, il cervello non registra. 10 secondi cambiano tutto.',
  'microfelicita', 'dimension', 'SENTIRE', 31, 'base', 10,
  'Per una settimana, quando noti un momento piacevole: (1) FERMATI (2) Resta nel momento per 10 secondi (conta mentalmente) (3) Respira (4) Nota cosa succede nel corpo. Fallo almeno 5 volte al giorno.',
  'Registro di 35+ momenti amplificati con nota su cosa e cambiato',
  ARRAY['Cosa succedeva nel corpo durante i 10 secondi?', 'Il momento diventava piu intenso, meno, o diverso?', 'Quale momento e stato piu amplificato?'],
  'RM'
),
(
  'RM-2: Il Respiro che Amplifica',
  'Il respiro e un amplificatore naturale. Quando associ un momento piacevole a un respiro profondo, lo ancori nel corpo.',
  'microfelicita', 'dimension', 'SENTIRE', 32, 'intermedio', 15,
  'Per 5 giorni: (1) Quando noti un momento piacevole, fai 3 respiri profondi DENTRO il momento (2) Inspira: assorbi il piacere (3) Espira: lascia che si espanda (4) Nota la differenza tra momento con respiro e senza.',
  'Diario di 5 giorni con almeno 5 momenti "respirati" per giorno',
  ARRAY['Come cambia il momento quando respiro dentro?', 'Il corpo trattiene qualcosa del momento dopo?', 'Quanto dura l''effetto dell''amplificazione?'],
  'RM'
),

-- ═══════════════════════════════════════════════════════════════
-- R.A.D.A.R. FASE RS: RESTA (ESSERE)
-- Capacita di completare il ciclo senza abbandonare prematuramente
-- ═══════════════════════════════════════════════════════════════
(
  'RS-1: Non Andare Via Prima',
  'Spesso abbandoniamo i momenti piacevoli troppo presto. La mente dice "ok, basta" e torniamo ai pensieri. Questo esercizio allena a restare fino alla fine naturale.',
  'microfelicita', 'dimension', 'ESSERE', 33, 'base', 15,
  'Per 5 giorni, scegli 3 momenti al giorno e RESTA finche non finiscono naturalmente. Non sei tu a decidere quando il momento finisce - lascia che il momento ti dica quando e completo. Annota quanto e durato e come ti sei sentito.',
  'Registro di 15 momenti vissuti "fino alla fine" con durata',
  ARRAY['Quanto duravano in media i momenti completi?', 'Cosa mi faceva voler andare via prima?', 'Come mi sentivo restando fino alla fine?'],
  'RS'
),
(
  'RS-2: Il Ciclo Completo',
  'R.A.D.A.R. e un ciclo. Quando lo completi, il momento si integra. Quando lo interrompi, si perde. Questo esercizio ti fa praticare il ciclo intero.',
  'microfelicita', 'dimension', 'ESSERE', 34, 'avanzato', 20,
  'Per 3 giorni, scegli 5 momenti e applica tutto R.A.D.A.R.: (R) Rileva il momento (A) Accogli senza "ma" (D) Distingui la qualita (A) Amplifica con il respiro (R) Resta fino alla fine. Scrivi l''esperienza completa.',
  'Diario di 15 esperienze R.A.D.A.R. complete',
  ARRAY['Quale fase era piu facile?', 'Quale fase saltavo o accorciavo?', 'Come cambia l''esperienza quando completo tutto il ciclo?'],
  'RS'
),

-- ═══════════════════════════════════════════════════════════════
-- SABOTATORE SM: MINIMIZZAZIONE ISTANTANEA (PENSARE)
-- Tendenza a svalutare immediatamente i momenti positivi
-- ═══════════════════════════════════════════════════════════════
(
  'SM-1: Cattura il Minimizzatore',
  'Il sabotatore Minimizzazione agisce in frazioni di secondo: "E poco", "Non conta", "Poteva essere meglio". Questo esercizio ti insegna a vederlo mentre agisce.',
  'microfelicita', 'dimension', 'PENSARE', 35, 'base', 15,
  'Per una settimana, ogni volta che noti qualcosa di piacevole, ascolta cosa dice la mente SUBITO DOPO. Scrivi la frase esatta del minimizzatore. Es: "Si, ma e solo un caffe", "Non e niente di speciale".',
  'Collezione di frasi del minimizzatore con frequenza',
  ARRAY['Quali frasi usa piu spesso il mio minimizzatore?', 'Quando e piu attivo?', 'Da dove vengono queste frasi?'],
  'SM'
),
(
  'SM-2: Rispondi al Minimizzatore',
  'Una volta che vedi il minimizzatore, puoi rispondergli. Non per combatterlo, ma per offrire una prospettiva alternativa.',
  'microfelicita', 'dimension', 'PENSARE', 36, 'intermedio', 20,
  'Per 5 giorni, quando il minimizzatore parla, rispondi: (1) Ascolta cosa dice (2) Scrivi una risposta gentile ma ferma (3) Es: "E solo un caffe" -> "E un caffe che sto bevendo adesso, e posso godermelo". Nota come cambia l''esperienza.',
  'Diario di 5 giorni con dialoghi minimizzatore-risposta',
  ARRAY['Rispondere cambia qualcosa?', 'Il minimizzatore diventa meno forte?', 'Quale risposta funziona meglio per me?'],
  'SM'
),

-- ═══════════════════════════════════════════════════════════════
-- SABOTATORE SA: ANTICIPO PROTETTIVO (SENTIRE)
-- Tendenza a preoccuparsi durante i momenti positivi
-- ═══════════════════════════════════════════════════════════════
(
  'SA-1: La Paura che Finisca',
  'Il sabotatore Anticipo sussurra: "Goditi, ma ricorda che finira", "Meglio non affezionarsi troppo". E una protezione che rovina il presente.',
  'microfelicita', 'dimension', 'SENTIRE', 37, 'base', 15,
  'Per una settimana, nota quando la mente pensa al dopo DURANTE un momento piacevole. Scrivi: (1) Il momento (2) Il pensiero anticipatore (3) Come ha cambiato l''esperienza.',
  'Registro di anticipazioni durante momenti piacevoli',
  ARRAY['Quanto spesso anticipo durante i momenti belli?', 'Cosa cerco di proteggermi anticipando?', 'La protezione funziona davvero?'],
  'SA'
),
(
  'SA-2: Questo Momento Basta',
  'L''antidoto all''anticipo e tornare al presente. Ogni volta che la mente va al futuro, riportala al momento. Il momento presente e l''unico che puoi vivere.',
  'microfelicita', 'dimension', 'SENTIRE', 38, 'intermedio', 15,
  'Per 5 giorni, quando noti l''anticipo, usa questa frase: "Questo momento basta. Adesso sono qui." Ripetila 3 volte, poi torna al momento. Nota quante volte devi usarla e se diventa piu facile.',
  'Diario di 5 giorni con conteggio "ritorni al presente"',
  ARRAY['Quante volte ho dovuto "tornare" in media?', 'Diventa piu facile con la pratica?', 'Come mi sento quando resto nel presente?'],
  'SA'
),

-- ═══════════════════════════════════════════════════════════════
-- SABOTATORE SI: AUTO-INTERRUZIONE COGNITIVA (PENSARE)
-- Tendenza a interrompere i momenti piacevoli con pensieri
-- ═══════════════════════════════════════════════════════════════
(
  'SI-1: Il Pensiero che Interrompe',
  'Stai godendo un momento e... un pensiero ti porta via. Lavoro, problemi, cose da fare. Il sabotatore Interruzione ti toglie dal presente continuamente.',
  'microfelicita', 'dimension', 'PENSARE', 39, 'base', 15,
  'Per una settimana, nota quando un pensiero ti porta via da un momento piacevole. (1) Cosa stavi vivendo? (2) Che pensiero ti ha interrotto? (3) Dove ti ha portato? (4) Poteva aspettare?',
  'Mappa di 7 giorni di interruzioni con analisi pattern',
  ARRAY['Quali pensieri interrompono piu spesso?', 'Potevano davvero aspettare?', 'Quanto del mio tempo piacevole perdo cosi?'],
  'SI'
),
(
  'SI-2: Il Parcheggio dei Pensieri',
  'Non puoi fermare i pensieri, ma puoi parcheggiarli. Questo esercizio insegna a notare il pensiero, riconoscere che puo aspettare, e tornare al momento.',
  'microfelicita', 'dimension', 'PENSARE', 40, 'intermedio', 20,
  'Per 5 giorni, quando un pensiero interrompe: (1) Nota il pensiero (2) Di'': "Ti vedo. Puoi aspettare 2 minuti." (3) Visualizza di parcheggiarlo da qualche parte (4) Torna al momento (5) Dopo 2 minuti, occupati del pensiero se serve.',
  'Diario di 5 giorni con pensieri parcheggiati e risultati',
  ARRAY['I pensieri parcheggiati erano urgenti come sembravano?', 'Riesco a tornare al momento dopo il parcheggio?', 'Quale visualizzazione funziona meglio per me?'],
  'SI'
),

-- ═══════════════════════════════════════════════════════════════
-- SABOTATORE SC: CAMBIO DI FUOCO IMMEDIATO (SENTIRE)
-- Tendenza a spostare l'attenzione verso il negativo
-- ═══════════════════════════════════════════════════════════════
(
  'SC-1: Notare il Cambio',
  'Stai bene, poi l''attenzione si sposta su qualcosa di negativo. Non l''hai scelto - e successo. Il sabotatore Cambio Fuoco ti ruba il positivo dandoti il negativo.',
  'microfelicita', 'dimension', 'SENTIRE', 41, 'base', 15,
  'Per una settimana, nota quando l''attenzione passa da qualcosa di piacevole a qualcosa di spiacevole. (1) Da cosa a cosa? (2) E stato un tuo scelta o e "successo"? (3) Il negativo era piu urgente del positivo?',
  'Registro di 7 giorni di cambi di fuoco',
  ARRAY['Quante volte al giorno succede?', 'Il negativo era davvero piu importante?', 'Cosa mi attira verso il negativo?'],
  'SC'
),
(
  'SC-2: Scegliere Dove Guardare',
  'Non puoi impedire che la mente noti il negativo. Ma puoi scegliere di tornare al positivo. Questo esercizio allena la scelta consapevole dell''attenzione.',
  'microfelicita', 'dimension', 'SENTIRE', 42, 'intermedio', 15,
  'Per 5 giorni, quando noti un cambio di fuoco verso il negativo: (1) Nota che e successo (2) Chiediti: devo occuparmene ORA? (3) Se no, SCEGLI di tornare al positivo (4) Nota come ti senti dopo la scelta.',
  'Diario di 5 giorni con scelte consapevoli di focus',
  ARRAY['Quanto spesso potevo tornare al positivo?', 'Come mi sento quando scelgo io dove guardare?', 'Il negativo puo aspettare piu di quanto pensavo?'],
  'SC'
),

-- ═══════════════════════════════════════════════════════════════
-- SABOTATORE SE: CORREZIONE EMOTIVA (ESSERE)
-- Tendenza a riequilibrare verso il basso le emozioni positive
-- ═══════════════════════════════════════════════════════════════
(
  'SE-1: Il Tetto delle Emozioni',
  'Alcune persone hanno un "tetto" emotivo: quando si sentono troppo bene, qualcosa le riporta giu. E il sabotatore Correzione che dice "non esagerare".',
  'microfelicita', 'dimension', 'ESSERE', 43, 'base', 15,
  'Per una settimana, nota quando un''emozione positiva viene "corretta": (1) Quanto positivo stavi sentendo (1-10)? (2) Cosa ti ha riportato giu? (3) Era necessario o automatico?',
  'Registro di 7 giorni di correzioni emotive',
  ARRAY['Ho un tetto emotivo? A che livello?', 'Chi o cosa mi ha insegnato a non sentirmi "troppo" bene?', 'Cosa succederebbe se lasciassi l''emozione salire?'],
  'SE'
),
(
  'SE-2: Lascia Salire',
  'Puoi scegliere di non correggere. Quando arriva la correzione, puoi notarla e lasciar continuare l''emozione positiva. E un esercizio di permesso.',
  'microfelicita', 'dimension', 'ESSERE', 44, 'intermedio', 20,
  'Per 5 giorni, quando senti la correzione arrivare: (1) Nota la voce che dice "basta cosi" (2) Rispondi: "Posso sentirmi cosi bene. E sicuro." (3) Lascia che l''emozione continui (4) Nota dove arriva se non la fermi.',
  'Diario di 5 giorni con emozioni non corrette',
  ARRAY['Cosa succede quando non correggo?', 'L''emozione diventa troppo intensa o si stabilizza?', 'Di cosa avevo paura che non e successo?'],
  'SE'
),

-- ═══════════════════════════════════════════════════════════════
-- LIVELLO L1: CAMPO INTERNO (ESSERE)
-- Capacita di riconoscere microfelicita personali
-- ═══════════════════════════════════════════════════════════════
(
  'L1-1: La Mia Firma di Benessere',
  'Hai un modo unico di sentirti bene. Certe cose funzionano per te che non funzionano per altri. Questo esercizio mappa la tua firma personale di microfelicita.',
  'microfelicita', 'dimension', 'ESSERE', 45, 'base', 25,
  'Fai una lista di 20 cose che ti fanno stare bene (piccole, quotidiane). Per ognuna nota: (1) Quale senso coinvolge? (2) Quando funziona meglio? (3) Con che frequenza la vivi? Cerca pattern: cosa hanno in comune quelle piu potenti?',
  'Mappa personale di 20 fonti di microfelicita con analisi',
  ARRAY['Quali sensi uso di piu?', 'Quali fonti sono sottoutilizzate?', 'Come posso viverne di piu senza sforzo?'],
  'L1'
),
(
  'L1-2: La Giornata Progettata',
  'Ora che conosci le tue fonti, puoi progettare una giornata che le includa. Non per forza tutte, ma abbastanza per raggiungere una massa critica di microfelicita.',
  'microfelicita', 'dimension', 'ESSERE', 46, 'intermedio', 30,
  'Progetta una giornata ideale includendo almeno 10 delle tue fonti di microfelicita. (1) Scrivi la giornata ora per ora (2) Vivi quella giornata (3) Nota: e stato artificiale o naturale? Faticoso o energizzante?',
  'Progetto di giornata + report dell''esperienza vissuta',
  ARRAY['La giornata progettata era sostenibile?', 'Cosa terrei per sempre?', 'Cosa era troppo o troppo poco?'],
  'L1'
),

-- ═══════════════════════════════════════════════════════════════
-- LIVELLO L2: SPAZIO RELAZIONALE (SENTIRE)
-- Capacita di riconoscere microfelicita condivise
-- ═══════════════════════════════════════════════════════════════
(
  'L2-1: Microfelicita a Due',
  'Le microfelicita condivise sono diverse da quelle personali. Non le vivi da solo - le vivi CON qualcuno. Questo esercizio esplora il territorio relazionale.',
  'microfelicita', 'dimension', 'SENTIRE', 47, 'base', 20,
  'Per una settimana, nota i momenti piacevoli che vivi CON altri (non solo accanto ad altri). (1) Cosa stavate facendo? (2) Cosa rendeva piacevole farlo INSIEME? (3) Avresti potuto viverlo da solo? (4) Cosa aggiunge l''altro?',
  'Registro di 7 giorni di microfelicita condivise',
  ARRAY['Quante microfelicita della mia settimana sono condivise?', 'Con chi condivido di piu?', 'Cosa aggiunge la condivisione?'],
  'L2'
),
(
  'L2-2: Creare Momenti Condivisi',
  'Puoi creare intenzionalmente momenti di microfelicita condivisa. Non sono spontanei - sono progettati. E funzionano ugualmente.',
  'microfelicita', 'dimension', 'SENTIRE', 48, 'intermedio', 25,
  'Questa settimana, crea intenzionalmente 5 momenti di microfelicita condivisa con persone diverse. (1) Pianifica un piccolo momento piacevole DA VIVERE INSIEME (2) Vivilo con attenzione (3) Nota: funziona anche se e intenzionale?',
  'Registro di 5 momenti condivisi creati intenzionalmente',
  ARRAY['I momenti creati erano meno autentici?', 'L''altro ha notato che era intenzionale?', 'Quale momento ha funzionato meglio?'],
  'L2'
),

-- ═══════════════════════════════════════════════════════════════
-- LIVELLO L3: CAMPO DEI CONTESTI (AGIRE)
-- Capacita di riconoscere microfelicita nei gruppi e contesti
-- ═══════════════════════════════════════════════════════════════
(
  'L3-1: L''Atmosfera del Gruppo',
  'I gruppi hanno microfelicita collettive: momenti in cui tutti si sentono bene insieme. Questo esercizio allena a notarli e contribuirvi.',
  'microfelicita', 'dimension', 'AGIRE', 49, 'intermedio', 20,
  'Per una settimana, in ogni situazione di gruppo (riunione, cena, evento): (1) Nota se ci sono momenti di benessere collettivo (2) Cosa li ha generati? (3) Come puoi contribuire a crearne?',
  'Registro di 7 giorni di microfelicita di gruppo',
  ARRAY['Quanto spesso i gruppi vivono microfelicita?', 'Cosa le genera piu spesso?', 'Posso influenzare l''atmosfera del gruppo?'],
  'L3'
),
(
  'L3-2: Facilitare la Microfelicita Collettiva',
  'Puoi diventare una persona che crea microfelicita nei contesti in cui entra. Non servono grandi gesti - servono piccole attenzioni.',
  'microfelicita', 'dimension', 'AGIRE', 50, 'avanzato', 30,
  'Per 5 giorni, entra in ogni gruppo con l''intenzione di contribuire a un momento di benessere collettivo. (1) Cosa puoi fare di piccolo per migliorare l''atmosfera? (2) Fallo (3) Nota l''effetto - anche se piccolo.',
  'Diario di 5 giorni di contributi alla microfelicita collettiva',
  ARRAY['Cosa funziona meglio per migliorare l''atmosfera?', 'Gli altri notano quando contribuisco?', 'Come mi sento nel ruolo di facilitatore?'],
  'L3'
);

-- ============================================================
-- VERIFICA INSERIMENTO
-- ============================================================
SELECT
  dimension_code,
  pillar_primary,
  COUNT(*) as exercises,
  STRING_AGG(title, ', ' ORDER BY week_number) as titles
FROM exercises
WHERE book_slug = 'microfelicita' AND source_type = 'dimension'
GROUP BY dimension_code, pillar_primary
ORDER BY dimension_code;
