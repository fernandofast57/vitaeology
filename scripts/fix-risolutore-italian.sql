-- =====================================================
-- FIX: Corregge grammatica italiana esercizi Risolutore
-- Data: 7 Gennaio 2026
-- GRAMMATICA: Verificata secondo Regole_di_Grammatica_italiana.md
-- =====================================================

-- ═══════════════════════════════════════════════════
-- CORE 3 FILTRI (weeks 1-4)
-- ═══════════════════════════════════════════════════
UPDATE exercises SET
  title = 'Il Filtro Pattern: Riconosci gli Schemi',
  description = 'Identifica un problema attuale. Chiediti: "Questo è già successo? Cosa c''è sotto?" Scrivi 3 situazioni passate simili e trova il pattern comune. Il pattern ti indica dove intervenire davvero.'
WHERE book_slug = 'risolutore' AND week_number = 1;

UPDATE exercises SET
  title = 'Il Filtro Segnali: Leggi il Non Detto',
  description = 'Scegli una situazione con tensione (con un cliente, un collaboratore o un partner). Osserva: cosa sta comunicando che non dice a parole? Scrivi 3 segnali non verbali o comportamentali che hai notato e chiediti cosa ti dicono.'
WHERE book_slug = 'risolutore' AND week_number = 2;

UPDATE exercises SET
  description = 'Prendi un problema che ti sembra bloccato. Chiediti: "Cosa ho già che posso usare?" Fai una lista delle tue competenze, dei tuoi contatti, delle esperienze passate e degli strumenti disponibili. Scegli una risorsa da attivare oggi.'
WHERE book_slug = 'risolutore' AND week_number = 3;

UPDATE exercises SET
  title = 'Integrazione dei 3 Filtri: la Visione Completa',
  description = 'Applica tutti e 3 i filtri allo stesso problema: (1) Qual è il pattern ricorrente? (2) Quali segnali stai ignorando? (3) Quali risorse hai già? Scrivi un piano d''azione basato sulle 3 risposte.'
WHERE book_slug = 'risolutore' AND week_number = 4;

-- ═══════════════════════════════════════════════════
-- CORE 3 TRADITORI (weeks 5-8)
-- ═══════════════════════════════════════════════════
UPDATE exercises SET
  description = 'Il Paralizzante dice: "Devo avere tutte le informazioni prima di agire". Identifica una decisione che stai rimandando per "raccogliere più dati". Chiediti: ho abbastanza informazioni per il prossimo passo? Se sì, fallo oggi.'
WHERE book_slug = 'risolutore' AND week_number = 5;

UPDATE exercises SET
  description = 'Il Timoroso dice: "È meglio non agire che agire e sbagliare". Identifica una situazione dove la paura dell''errore ti blocca. Scrivi: cosa succederebbe REALMENTE se sbagliassi? Di solito è molto meno grave di quanto temi.'
WHERE book_slug = 'risolutore' AND week_number = 6;

UPDATE exercises SET
  description = 'Il Procrastinatore dice: "Devo aspettare il momento perfetto". Il momento perfetto non esiste. Identifica qualcosa che stai aspettando di iniziare. Qual è il primo micro-passo? Fallo entro 24 ore.'
WHERE book_slug = 'risolutore' AND week_number = 7;

UPDATE exercises SET
  description = 'Scrivi una situazione attuale dove sei bloccato. Identifica quale dei 3 Traditori ti sta fermando. Applica l''antidoto specifico: per il Paralizzante, agisci con informazioni parziali; per il Timoroso, accetta l''errore come feedback; per il Procrastinatore, inizia imperfetto adesso.'
WHERE book_slug = 'risolutore' AND week_number = 8;

-- ═══════════════════════════════════════════════════
-- CORE METODO 5 MINUTI (weeks 9-12)
-- ═══════════════════════════════════════════════════
UPDATE exercises SET
  title = 'Metodo 5 Minuti: il Problema Urgente',
  description = 'Prendi un problema urgente. Imposta un timer di 5 minuti. Minuto 1: definisci il problema in una frase. Minuti 2-3: applica il Filtro Pattern e il Filtro Segnali. Minuto 4: applica il Filtro Risorse. Minuto 5: scrivi un''azione da fare subito.'
WHERE book_slug = 'risolutore' AND week_number = 9;

UPDATE exercises SET
  title = 'Metodo 5 Minuti: la Decisione Difficile',
  description = 'Hai una decisione da prendere? Imposta un timer di 5 minuti. Applica i 3 Filtri rapidamente. Al minuto 5, DECIDI. Se dopo 5 minuti non hai abbastanza informazioni, la decisione è: "raccolgo le informazioni X entro la data Y, poi decido".'
WHERE book_slug = 'risolutore' AND week_number = 10;

UPDATE exercises SET
  title = 'Metodo 5 Minuti: il Conflitto Interpersonale',
  description = 'C''è tensione con qualcuno? Imposta un timer di 5 minuti. Filtro Pattern: è già successo con questa persona? Filtro Segnali: cosa non sta dicendo? Filtro Risorse: come hai risolto tensioni simili in passato? Azione: una cosa da fare o dire oggi.'
WHERE book_slug = 'risolutore' AND week_number = 11;

UPDATE exercises SET
  title = 'Metodo 5 Minuti: la Crisi Aziendale',
  description = 'Scenario: un problema grave con tempo limitato. Imposta un timer di 5 minuti. Vai dritto all''essenziale. Quale pattern conosci? Quali segnali indicano la vera causa? Quali risorse attivi subito? Decisione in 5 minuti, esecuzione immediata.'
WHERE book_slug = 'risolutore' AND week_number = 12;

-- ═══════════════════════════════════════════════════
-- CHALLENGE FOLLOWUP (weeks 13-19)
-- ═══════════════════════════════════════════════════
UPDATE exercises SET
  title = 'Consolidamento Day 1: le Prove che Sai Risolvere',
  description = 'Riprendi la lista del Day 1 della challenge (i problemi che hai risolto). Aggiungine altri 3. Per ognuno scrivi: quale Filtro hai usato inconsapevolmente? Stai già usando i 3 Filtri, ora lo fai consapevolmente.'
WHERE book_slug = 'risolutore' AND week_number = 13;

UPDATE exercises SET
  title = 'Consolidamento Day 2: Sfida il Paralizzante',
  description = 'Oggi fai una cosa senza avere tutte le informazioni. Qualcosa di piccolo, ma reale. Nota: cosa succede? Il Paralizzante ti aveva mentito sulla necessità di avere "più dati"?'
WHERE book_slug = 'risolutore' AND week_number = 14;

UPDATE exercises SET
  title = 'Consolidamento Day 3: Sfida il Timoroso',
  description = 'Oggi fai una cosa che potresti sbagliare. Accetta in anticipo che l''errore è possibile. Falla comunque. Nota: l''errore (se c''è stato) è stato catastrofico o gestibile?'
WHERE book_slug = 'risolutore' AND week_number = 15;

UPDATE exercises SET
  title = 'Consolidamento Day 4: Sfida il Procrastinatore',
  description = 'Scegli qualcosa che stai rimandando da almeno 2 settimane. Fai SOLO il primo passo oggi. Non tutto il compito, solo l''inizio. Il momento perfetto è sempre adesso.'
WHERE book_slug = 'risolutore' AND week_number = 16;

UPDATE exercises SET
  title = 'Consolidamento Day 5: il Filtro Pattern in Azione',
  description = 'Scegli un problema attuale. Cerca attivamente il pattern: quando è successo qualcosa di simile? Cosa hai fatto allora? Quella soluzione (o una sua variante) funzionerebbe anche ora?'
WHERE book_slug = 'risolutore' AND week_number = 17;

UPDATE exercises SET
  title = 'Consolidamento Day 6: il Filtro Segnali in Azione',
  description = 'In una conversazione importante oggi, concentrati sui segnali non verbali. Cosa dicono le pause, il tono e la postura? Scrivi 3 osservazioni concrete. Cosa comunicano che le parole non dicono?'
WHERE book_slug = 'risolutore' AND week_number = 18;

UPDATE exercises SET
  title = 'Consolidamento Day 7: il Tuo Sistema Risolutore',
  description = 'Riassumi il TUO modo personale di usare i 3 Filtri. Quale usi più naturalmente? Quale devi ricordarti di usare? Scrivi la tua formula: "Quando ho un problema, io..."'
WHERE book_slug = 'risolutore' AND week_number = 19;

-- ═══════════════════════════════════════════════════
-- AVANZATI (weeks 20-24)
-- ═══════════════════════════════════════════════════
UPDATE exercises SET
  title = 'Il Problema Sistemico: Oltre il Sintomo',
  description = 'Identifica un problema che continua a ripresentarsi nella tua azienda o nella tua vita. Non risolverlo di nuovo: cerca la CAUSA SISTEMICA. Quale processo, incentivo o struttura lo genera? Intervieni lì, non sul sintomo.'
WHERE book_slug = 'risolutore' AND week_number = 20;

UPDATE exercises SET
  title = 'La Crisi Simulata: Stress Test Mentale',
  description = 'Immagina: il tuo cliente più importante ti lascia domani. Imposta un timer di 10 minuti. Applica i 3 Filtri. Scrivi un piano d''azione concreto. Questo esercizio prepara la mente a reagire lucidamente sotto pressione reale.'
WHERE book_slug = 'risolutore' AND week_number = 21;

UPDATE exercises SET
  description = 'Osserva un collaboratore bloccato su qualcosa. Quale dei 3 Traditori lo sta fermando? Come puoi aiutarlo a vederlo senza giudicarlo? L''abilità di riconoscere i Traditori negli altri ti rende un leader migliore.'
WHERE book_slug = 'risolutore' AND week_number = 22;

UPDATE exercises SET
  title = 'La Mappa dei Problemi Ricorrenti',
  description = 'Elenca i 5 problemi che si ripresentano più spesso nella tua attività. Per ognuno, identifica: qual è il pattern? Quale Traditore ti blocca nel risolverlo definitivamente? Quale risorsa non stai usando?'
WHERE book_slug = 'risolutore' AND week_number = 23;

UPDATE exercises SET
  title = 'Il Risolutore che Sei Diventato',
  description = 'Confronta come affrontavi i problemi 3 mesi fa rispetto a oggi. Cosa è cambiato? Quali Filtri usi automaticamente? Quali Traditori hai imparato a riconoscere prima? Scrivi la tua evoluzione come risolutore.'
WHERE book_slug = 'risolutore' AND week_number = 24;

-- Verifica
SELECT week_number, title, LEFT(description, 60) as description_preview
FROM exercises
WHERE book_slug = 'risolutore'
ORDER BY week_number;
