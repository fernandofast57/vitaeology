-- Esercizi per libro "Oltre gli Ostacoli" (Risolutore)
-- 24 esercizi basati su: 3 Filtri, 3 Traditori, Metodo 5 Minuti

INSERT INTO exercises (title, description, book_slug, source_type, pillar_primary, week_number, difficulty_level, estimated_time_minutes)
VALUES

-- ═══ CORE 3 FILTRI (4 esercizi) ═══
(
  'Il Filtro Pattern - Riconosci i Cicli',
  'Ogni problema ha un pattern. Prendi una sfida attuale e chiediti: "Quando è già successo? Cosa c''è sotto?" Scrivi 3 situazioni passate simili e trova il pattern comune. Il pattern ti dice dove intervenire.',
  'risolutore', 'original', 'PENSARE', 1, 'base', 15
),
(
  'Il Filtro Segnali - Leggi il Non Detto',
  'Scegli una situazione con tensione (cliente, collaboratore, partner). Osserva: cosa sta comunicando che non dice a parole? Scrivi 3 segnali non verbali o comportamentali che hai notato.',
  'risolutore', 'original', 'SENTIRE', 2, 'base', 15
),
(
  'Il Filtro Risorse - Trova Quello che Hai Già',
  'Prendi un problema che ti sembra bloccato. Chiediti: "Cosa ho già che posso usare?" Lista: competenze, contatti, esperienze passate, strumenti. Scegli 1 risorsa da attivare oggi.',
  'risolutore', 'original', 'AGIRE', 3, 'base', 15
),
(
  'Integrazione 3 Filtri - Visione Completa',
  'Applica tutti e 3 i filtri allo stesso problema: (1) Qual è il pattern? (2) Quali segnali stai ignorando? (3) Quali risorse hai già? Scrivi un piano d''azione basato sulle 3 risposte.',
  'risolutore', 'original', 'ESSERE', 4, 'intermedio', 25
),

-- ═══ CORE 3 TRADITORI (4 esercizi) ═══
(
  'Riconosci il Paralizzante',
  'Il Paralizzante dice: "Devo avere tutte le informazioni prima di agire". Identifica una decisione che stai rimandando per "raccogliere più dati". Chiediti: ho abbastanza per il prossimo passo? Se sì, fallo oggi.',
  'risolutore', 'original', 'PENSARE', 5, 'base', 15
),
(
  'Riconosci il Timoroso',
  'Il Timoroso dice: "È meglio non agire che agire e sbagliare". Identifica una situazione dove la paura dell''errore ti blocca. Scrivi: cosa succederebbe REALMENTE se sbagliassi? Di solito è meno grave di quanto temi.',
  'risolutore', 'original', 'SENTIRE', 6, 'base', 15
),
(
  'Riconosci il Procrastinatore',
  'Il Procrastinatore dice: "Devo aspettare il momento perfetto". Il momento perfetto non esiste. Identifica qualcosa che stai aspettando di iniziare. Qual è il primo micro-passo? Fallo entro 24 ore.',
  'risolutore', 'original', 'AGIRE', 7, 'base', 15
),
(
  'Neutralizza i 3 Traditori',
  'Scrivi una situazione attuale. Identifica quale dei 3 Traditori ti sta bloccando. Applica l''antidoto specifico: Paralizzante → agisci con info parziali. Timoroso → accetta l''errore come feedback. Procrastinatore → inizia imperfetto ora.',
  'risolutore', 'original', 'ESSERE', 8, 'intermedio', 20
),

-- ═══ CORE METODO 5 MINUTI (4 esercizi) ═══
(
  'Metodo 5 Minuti - Problema Urgente',
  'Prendi un problema urgente. Timer 5 minuti. Minuto 1: Definisci il problema in 1 frase. Minuto 2-3: Applica Filtro Pattern + Segnali. Minuto 4: Filtro Risorse. Minuto 5: Scrivi 1 azione da fare ora.',
  'risolutore', 'original', 'AGIRE', 9, 'base', 10
),
(
  'Metodo 5 Minuti - Decisione Difficile',
  'Hai una decisione da prendere? Timer 5 minuti. Applica i 3 Filtri rapidamente. Al minuto 5, DECIDI. Se dopo 5 minuti non hai abbastanza info, la decisione è: "raccolgo info X entro data Y".',
  'risolutore', 'original', 'PENSARE', 10, 'intermedio', 10
),
(
  'Metodo 5 Minuti - Conflitto Interpersonale',
  'C''è tensione con qualcuno? Timer 5 minuti. Filtro Pattern: è già successo con questa persona? Filtro Segnali: cosa non sta dicendo? Filtro Risorse: come hai risolto situazioni simili? Azione: 1 cosa da fare/dire.',
  'risolutore', 'original', 'SENTIRE', 11, 'intermedio', 10
),
(
  'Metodo 5 Minuti - Crisi Aziendale',
  'Scenario: problema grave, tempo limitato. Timer 5 minuti. Vai dritto all''essenziale. Quale pattern conosci? Quali segnali indicano la vera causa? Quali risorse attivi ORA? Decisione in 5 minuti, esecuzione immediata.',
  'risolutore', 'original', 'ESSERE', 12, 'avanzato', 10
),

-- ═══ CHALLENGE FOLLOWUP (7 esercizi) ═══
(
  'Consolidamento Day 1 - Le Prove che Sai Risolvere',
  'Riprendi la lista del Day 1 (problemi risolti). Aggiungine altri 3. Per ognuno scrivi: quale Filtro hai usato inconsapevolmente? Stai già usando i 3 Filtri - ora impari a farlo consapevolmente.',
  'risolutore', 'original', 'ESSERE', 13, 'base', 15
),
(
  'Consolidamento Day 2 - Sfida il Paralizzante',
  'Oggi fai una cosa senza avere tutte le informazioni. Qualcosa di piccolo. Nota: cosa succede? Il Paralizzante ti aveva mentito?',
  'risolutore', 'original', 'PENSARE', 14, 'base', 10
),
(
  'Consolidamento Day 3 - Sfida il Timoroso',
  'Oggi fai una cosa che potresti sbagliare. Accetta in anticipo che l''errore è possibile. Falla comunque. Nota: l''errore è stato catastrofico o gestibile?',
  'risolutore', 'original', 'SENTIRE', 15, 'base', 10
),
(
  'Consolidamento Day 4 - Sfida il Procrastinatore',
  'Scegli qualcosa che stai rimandando da almeno 2 settimane. Fai SOLO il primo passo oggi. Non tutto, solo l''inizio. Il momento perfetto è adesso.',
  'risolutore', 'original', 'AGIRE', 16, 'base', 10
),
(
  'Consolidamento Day 5 - Filtro Pattern in Azione',
  'Scegli un problema attuale. Cerca il pattern: quando è successo qualcosa di simile? Cosa hai fatto allora? Funzionerebbe anche ora?',
  'risolutore', 'original', 'PENSARE', 17, 'base', 15
),
(
  'Consolidamento Day 6 - Filtro Segnali in Azione',
  'In una conversazione oggi, concentrati sui segnali non verbali. Cosa dicono le pause, il tono, la postura? Scrivi 3 osservazioni.',
  'risolutore', 'original', 'SENTIRE', 18, 'base', 10
),
(
  'Consolidamento Day 7 - Il Tuo Sistema Risolutore',
  'Riassumi il TUO modo di usare i 3 Filtri. Quale usi più naturalmente? Quale devi ricordarti di usare? Scrivi la tua formula personale.',
  'risolutore', 'original', 'ESSERE', 19, 'intermedio', 15
),

-- ═══ AVANZATI (5 esercizi) ═══
(
  'Problema Sistemico - Oltre il Sintomo',
  'Identifica un problema che continua a ripresentarsi. Non risolverlo di nuovo - cerca la CAUSA SISTEMICA. Quale processo, incentivo o struttura lo genera? Intervieni lì.',
  'risolutore', 'original', 'PENSARE', 20, 'avanzato', 30
),
(
  'Crisi Simulata - Stress Test',
  'Immagina: il tuo cliente più importante ti lascia domani. Timer 10 minuti. Applica i 3 Filtri. Piano d''azione scritto. Questo esercizio prepara la mente a reagire sotto pressione.',
  'risolutore', 'original', 'AGIRE', 21, 'avanzato', 15
),
(
  'I Traditori degli Altri',
  'Osserva un collaboratore bloccato su qualcosa. Quale Traditore lo sta fermando? Paralizzante, Timoroso o Procrastinatore? Come puoi aiutarlo a superarlo senza dirgli cosa fare?',
  'risolutore', 'original', 'SENTIRE', 22, 'avanzato', 20
),
(
  'Mappa dei Problemi Ricorrenti',
  'Crea una mappa dei problemi che affronti più spesso. Per ognuno: qual è il pattern? Quale Traditore si attiva? Quale Filtro useresti? Questa mappa diventa il tuo manuale di pronto intervento.',
  'risolutore', 'original', 'ESSERE', 23, 'avanzato', 45
),
(
  'Il Risolutore Insegna',
  'Spiega il metodo dei 3 Filtri + 3 Traditori a qualcuno. Insegnare consolida. Nota le domande che ti fanno - rivelano cosa devi ancora approfondire tu stesso.',
  'risolutore', 'original', 'ESSERE', 24, 'avanzato', 30
);

-- Verifica inserimento
SELECT book_slug, COUNT(*) as total,
       COUNT(CASE WHEN difficulty_level = 'base' THEN 1 END) as base,
       COUNT(CASE WHEN difficulty_level = 'intermedio' THEN 1 END) as intermedio,
       COUNT(CASE WHEN difficulty_level = 'avanzato' THEN 1 END) as avanzato
FROM exercises
WHERE book_slug = 'risolutore'
GROUP BY book_slug;
