-- ============================================================
-- ESERCIZI RISOLUTORE - COMPLETI CON DIMENSION_CODE
-- 14 esercizi mappati alle 7 dimensioni assessment
-- Eseguire DOPO 00_add_dimension_code.sql
-- ============================================================

-- Pulisci esercizi dimension precedenti per risolutore (evita duplicati)
DELETE FROM exercises
WHERE book_slug = 'risolutore'
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
-- FP: DETECTIVE DEI PATTERN (PENSARE)
-- ═══════════════════════════════════════════════════════════════
(
  'FP-1: Il Diario dei Pattern',
  'Sei già un detective dei pattern - lo fai ogni giorno senza accorgertene. Quando riconosci che "questo è già successo", stai usando questo filtro. Questa settimana lo renderai consapevole.',
  'risolutore', 'dimension', 'PENSARE', 25, 'base', 20,
  'Per 5 giorni, ogni sera scrivi: (1) Una situazione che hai affrontato (2) Quando è già successo qualcosa di simile? (3) Cosa hai fatto allora che ha funzionato? Non cercare pattern complessi - nota quelli semplici che già vedi.',
  'Diario di 5 giorni con almeno 1 pattern riconosciuto per giorno',
  ARRAY['Quale pattern ho notato più facilmente?', 'In quale area della mia vita riconosco pattern più velocemente?', 'Come mi sento quando vedo il pattern invece di reagire al singolo evento?'],
  'FP'
),
(
  'FP-2: Mappa dei Pattern Ricorrenti',
  'Nella tua esperienza ci sono schemi che si ripetono - problemi che tornano, dinamiche che si riproducono. Non è sfortuna: è un pattern. E tu sai già riconoscerli.',
  'risolutore', 'dimension', 'PENSARE', 26, 'intermedio', 30,
  'Crea una mappa visiva dei 5 problemi più ricorrenti nella tua attività. Per ognuno: (1) Disegna il ciclo (cosa scatena → cosa succede → come finisce) (2) Dove nel ciclo potresti intervenire? (3) Quale segnale ti avvisa che il pattern sta iniziando?',
  'Mappa visiva di 5 pattern con punti di intervento identificati',
  ARRAY['Quale pattern mi costa di più in termini di tempo/energia?', 'Dove ho già interrotto un pattern con successo?', 'Quale pattern potrei spezzare questa settimana?'],
  'FP'
),

-- ═══════════════════════════════════════════════════════════════
-- FS: ANTENNA DEI SEGNALI (SENTIRE)
-- ═══════════════════════════════════════════════════════════════
(
  'FS-1: Leggere il Non Detto',
  'Percepisci già quando qualcosa non torna, quando le parole dicono una cosa ma il tono ne dice un''altra. Questa antenna è sempre accesa - ora imparerai ad ascoltarla consapevolmente.',
  'risolutore', 'dimension', 'SENTIRE', 27, 'base', 15,
  'Scegli 3 conversazioni importanti questa settimana. Durante ognuna, nota: (1) Cosa dicono le parole? (2) Cosa dice il tono? (3) Cosa dice il corpo/comportamento? (4) C''è coerenza o dissonanza? Scrivi le osservazioni subito dopo.',
  '3 analisi di conversazioni con segnali verbali e non verbali identificati',
  ARRAY['Quando ho sentito dissonanza tra parole e segnali, avevo ragione?', 'Quali segnali colgo più naturalmente?', 'Come posso usare questa informazione senza giudicare?'],
  'FS'
),
(
  'FS-2: L''Atmosfera della Stanza',
  'Sai già leggere l''atmosfera di un ambiente - quando entri in una riunione tesa, lo senti. Questo esercizio allena a usare questa capacità strategicamente.',
  'risolutore', 'dimension', 'SENTIRE', 28, 'intermedio', 20,
  'Per una settimana, ogni volta che entri in un nuovo ambiente (riunione, ufficio, casa): (1) Fermati 3 secondi sulla soglia (2) Nota: qual è l''energia? Tesa, rilassata, frenetica? (3) Chi sembra a suo agio? Chi no? (4) Scrivi la tua lettura in 10 parole.',
  'Registro di 7+ letture di atmosfera con verifica successiva',
  ARRAY['Quanto spesso la mia prima lettura era accurata?', 'Cosa mi ha aiutato a leggere correttamente?', 'Come posso usare questa informazione per facilitare situazioni?'],
  'FS'
),

-- ═══════════════════════════════════════════════════════════════
-- FR: RADAR DELLE RISORSE (AGIRE)
-- ═══════════════════════════════════════════════════════════════
(
  'FR-1: L''Inventario Nascosto',
  'Hai più risorse di quelle che pensi. Competenze dimenticate, contatti non attivati, esperienze non valorizzate. Il tuo radar le vede già - questo esercizio le porta in superficie.',
  'risolutore', 'dimension', 'AGIRE', 29, 'base', 25,
  'Crea un inventario completo delle tue risorse: (1) Competenze: cosa sai fare? (anche cose "ovvie") (2) Relazioni: chi conosci che potrebbe aiutare? (3) Esperienze: cosa hai attraversato che ti ha insegnato? (4) Strumenti: cosa possiedi o puoi accedere? Lista almeno 20 voci.',
  'Inventario scritto di almeno 20 risorse in 4 categorie',
  ARRAY['Quale risorsa avevo dimenticato di avere?', 'Quale risorsa uso troppo poco?', 'Quale risorsa potrei combinare con altre?'],
  'FR'
),
(
  'FR-2: Trasforma Vincoli in Risorse',
  'Ogni vincolo nasconde una risorsa. "Non ho budget" diventa "devo essere creativo". "Non ho tempo" diventa "devo semplificare". Il radar delle risorse vede opportunità dove altri vedono limiti.',
  'risolutore', 'dimension', 'AGIRE', 30, 'avanzato', 30,
  'Prendi un problema attuale con un vincolo chiaro (budget, tempo, persone, competenze). (1) Descrivi il vincolo (2) Chiediti: "Se questo vincolo fosse un vantaggio, quale sarebbe?" (3) Lista 5 modi in cui il vincolo potrebbe diventare una risorsa (4) Scegli 1 e prova.',
  'Analisi di 1 vincolo trasformato in risorsa con piano d''azione',
  ARRAY['Come mi sentivo prima di vedere il vincolo come risorsa?', 'Cosa mi ha aiutato a cambiare prospettiva?', 'Dove altro posso applicare questo approccio?'],
  'FR'
),

-- ═══════════════════════════════════════════════════════════════
-- TP: IL PARALIZZANTE (PENSARE)
-- ═══════════════════════════════════════════════════════════════
(
  'TP-1: Agire con il 70%',
  'Il Paralizzante ti convince che servono più informazioni. Ma tu hai già preso decisioni importanti senza sapere tutto - e molte sono andate bene. Non hai bisogno del 100% per agire.',
  'risolutore', 'dimension', 'PENSARE', 31, 'base', 15,
  'Identifica una decisione che stai rimandando per "raccogliere più dati". (1) Scrivi: quali informazioni HAI già? (2) Sono sufficienti per il PROSSIMO PASSO (non per tutto il percorso)? (3) Se hai il 70%, agisci entro 24 ore. Il restante 30% lo imparerai facendo.',
  'Una decisione presa con informazioni parziali + risultato documentato',
  ARRAY['Quanto del 30% mancante era davvero necessario?', 'Cosa ho imparato agendo che non avrei imparato aspettando?', 'Come mi sento dopo aver agito nonostante l''incertezza?'],
  'TP'
),
(
  'TP-2: La Settimana delle Decisioni Rapide',
  'Il Paralizzante rallenta tutto. Ma la velocità di decisione è un muscolo che puoi allenare. Questa settimana allenerai la decisione rapida su cose piccole.',
  'risolutore', 'dimension', 'PENSARE', 32, 'intermedio', 20,
  'Per 7 giorni, ogni decisione piccola (cosa mangiare, quale task fare prima, come rispondere) va presa in massimo 30 secondi. (1) Nota quando il Paralizzante vuole più tempo (2) Decidi comunque (3) Registra: la decisione rapida era peggiore di quella lenta?',
  'Diario di 7 giorni con almeno 5 decisioni rapide per giorno',
  ARRAY['Le decisioni rapide erano qualitativamente diverse da quelle lente?', 'In quali situazioni il Paralizzante era più forte?', 'Cosa ho guadagnato in tempo ed energia?'],
  'TP'
),

-- ═══════════════════════════════════════════════════════════════
-- TT: IL TIMOROSO (SENTIRE)
-- ═══════════════════════════════════════════════════════════════
(
  'TT-1: L''Errore Realistico',
  'Il Timoroso esagera le conseguenze dell''errore. Ma hai già sbagliato in passato - e sei ancora qui. Gli errori raramente sono catastrofici come temiamo.',
  'risolutore', 'dimension', 'SENTIRE', 33, 'base', 15,
  'Identifica qualcosa che eviti per paura di sbagliare. (1) Scrivi: cosa succederebbe REALMENTE se sbagliassi? (scenario realistico, non catastrofico) (2) Quanto è recuperabile? (3) Cosa impareresti dall''errore? (4) Se il rischio realistico è accettabile, fallo questa settimana.',
  'Analisi di 1 paura con scenario realistico + azione intrapresa',
  ARRAY['Lo scenario realistico era diverso da quello temuto?', 'Se ho sbagliato, è stato gestibile?', 'Cosa mi ha trattenuto in passato che ora sembra irrazionale?'],
  'TT'
),
(
  'TT-2: Il Portfolio degli Errori Utili',
  'Ogni persona di successo ha un portfolio di errori che l''hanno formata. I tuoi errori passati ti hanno insegnato. Non sono fallimenti - sono formazione.',
  'risolutore', 'dimension', 'SENTIRE', 34, 'intermedio', 25,
  'Lista i 10 errori più significativi della tua carriera/vita. Per ognuno scrivi: (1) Cosa è successo (2) Cosa ho imparato (3) Come quell''apprendimento mi ha servito dopo. Questa diventa la prova che gli errori sono investimenti, non perdite.',
  'Portfolio scritto di 10 errori con apprendimenti e applicazioni',
  ARRAY['Quale errore mi ha insegnato di più?', 'Quale errore rifarei sapendo cosa so ora?', 'Come posso ricordarmi di questa lista quando il Timoroso si attiva?'],
  'TT'
),

-- ═══════════════════════════════════════════════════════════════
-- TC: IL PROCRASTINATORE (AGIRE)
-- ═══════════════════════════════════════════════════════════════
(
  'TC-1: I Primi 5 Minuti',
  'Il Procrastinatore blocca l''inizio, non il processo. Una volta partito, spesso continui. Il segreto è ingannare il Procrastinatore con micro-inizi.',
  'risolutore', 'dimension', 'AGIRE', 35, 'base', 10,
  'Scegli qualcosa che stai rimandando da almeno 1 settimana. (1) Definisci cosa faresti nei primi 5 minuti (solo i primi 5) (2) Imposta un timer (3) Fai SOLO quei 5 minuti (4) Dopo 5 minuti puoi smettere... ma nota se vuoi continuare.',
  'Una task procrastinata iniziata con tecnica 5 minuti',
  ARRAY['Ho continuato oltre i 5 minuti?', 'Cosa rendeva difficile iniziare che non c''era una volta iniziato?', 'Dove altro posso applicare i 5 minuti?'],
  'TC'
),
(
  'TC-2: La Mappa delle Procrastinazioni',
  'Non procrastini tutto allo stesso modo. Alcune cose le fai subito, altre le rimandi sempre. Capire il pattern ti permette di hackerarlo.',
  'risolutore', 'dimension', 'AGIRE', 36, 'intermedio', 25,
  'Per 2 settimane, traccia ogni procrastinazione: (1) Cosa stai rimandando? (2) Che emozione genera? (noia, paura, sopraffazione?) (3) Da quanto lo rimandi? Dopo 2 settimane, analizza: ci sono pattern? Certi tipi di task? Certe emozioni?',
  'Mappa di 2 settimane con analisi dei pattern di procrastinazione',
  ARRAY['Quale emozione scatena più procrastinazione?', 'Quale tipo di task rimando di più?', 'Quale strategia potrebbe funzionare per quel tipo specifico?'],
  'TC'
),

-- ═══════════════════════════════════════════════════════════════
-- SR: SCALA RISOLUTORE (ESSERE)
-- ═══════════════════════════════════════════════════════════════
(
  'SR-1: Il Tuo Metodo Documentato',
  'Hai già un metodo per risolvere problemi - lo usi inconsciamente. Questo esercizio lo rende esplicito e replicabile.',
  'risolutore', 'dimension', 'ESSERE', 37, 'intermedio', 30,
  'Pensa a 3 problemi complessi che hai risolto con successo. Per ognuno: (1) Come hai iniziato? (2) Quali domande ti sei fatto? (3) Come hai trovato la soluzione? (4) Cerca i pattern comuni. (5) Scrivi il TUO metodo in 5 passi.',
  'Documento con il tuo metodo personale di problem solving in 5 passi',
  ARRAY['Quale passo del mio metodo è più forte?', 'Quale passo tendo a saltare?', 'Come posso insegnare questo metodo a qualcuno?'],
  'SR'
),
(
  'SR-2: Moltiplicatore - Insegna a Risolvere',
  'Il livello più alto del Risolutore non è risolvere problemi - è creare altri risolutori. Quando insegni, consolidi e moltiplichi.',
  'risolutore', 'dimension', 'ESSERE', 38, 'avanzato', 45,
  'Identifica qualcuno nel tuo team/vita che affronta spesso problemi. (1) Invece di risolvere per loro, guidali attraverso i 3 Filtri (2) Fai domande invece di dare risposte (3) Dopo, chiedi: "Come ti è sembrato questo processo?" (4) Documenta cosa hai imparato insegnando.',
  'Report di 1 sessione di coaching con i 3 Filtri + apprendimenti',
  ARRAY['Cosa è stato difficile nel non dare la soluzione?', 'Cosa ha capito l''altra persona che non avrebbe capito se avessi risolto io?', 'Come posso creare più opportunità di insegnare?'],
  'SR'
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
WHERE book_slug = 'risolutore' AND source_type = 'dimension'
GROUP BY dimension_code, pillar_primary
ORDER BY dimension_code;
