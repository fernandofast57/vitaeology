-- Esercizi per libro "Microfelicità Digitale"
-- 24 esercizi basati su: R.A.D.A.R., 5 Canali, 5 Sabotatori

INSERT INTO exercises (title, description, book_slug, source_type, pillar_primary, week_number, difficulty_level, estimated_time_minutes)
VALUES

-- ═══ CORE R.A.D.A.R. (5 esercizi) ═══
(
  'R - Rileva: I Momenti che Non Vedi',
  'Prenditi 2 minuti. Ripensa alle ultime 24 ore. Quali momenti piacevoli ci sono stati, anche minimo: un caffè caldo, una luce bella, una parola gentile. Non cercare momenti grandi - cerca i piccoli. Scrivi almeno 5.',
  'microfelicita', 'original', 'SENTIRE', 1, 'base', 10
),
(
  'A - Accogli: Non Giudicare il Momento',
  'Quando noti un momento piacevole, la mente vuole subito valutarlo ("sì ma...", "è poco..."). Oggi, quando rilevi un momento, accoglilo senza giudizio. È piacevole? Basta così. Non serve che sia importante.',
  'microfelicita', 'original', 'ESSERE', 2, 'base', 15
),
(
  'D - Distingui: Separa il Canale',
  'I momenti piacevoli arrivano da canali diversi: vista, suono, tatto, gusto, pensiero. Oggi, ogni volta che noti qualcosa di piacevole, identifica il canale. Qual è il tuo canale dominante?',
  'microfelicita', 'original', 'PENSARE', 3, 'base', 15
),
(
  'A - Amplifica: Resta 10 Secondi in Più',
  'Quando noti un momento piacevole, invece di passare oltre, FERMATI. Resta nel momento per 10 secondi in più. Respira. Lascia che il corpo registri la sensazione. L''amplificazione trasforma notare in sentire.',
  'microfelicita', 'original', 'SENTIRE', 4, 'base', 15
),
(
  'R - Ripeti: Crea il Pattern Quotidiano',
  'R.A.D.A.R. funziona con la ripetizione. Scegli 3 momenti fissi della giornata (es: colazione, pranzo, sera) e fai R.A.D.A.R. in ognuno. Dopo 7 giorni diventa automatico.',
  'microfelicita', 'original', 'AGIRE', 5, 'base', 10
),

-- ═══ CORE 5 CANALI (5 esercizi) ═══
(
  'Canale Vista - Il Bello Invisibile',
  'Oggi concentrati SOLO sulla vista. Cerca: un colore che ti piace, una forma interessante, un gioco di luce. Ne troverai decine - di solito non li noti perché non guardi.',
  'microfelicita', 'original', 'SENTIRE', 6, 'base', 15
),
(
  'Canale Suono - Le Frequenze Piacevoli',
  'Oggi concentrati SOLO sui suoni. Il silenzio, una voce familiare, musica in sottofondo, suoni della natura. Quali suoni ti fanno sentire bene senza che tu lo sappia?',
  'microfelicita', 'original', 'SENTIRE', 7, 'base', 15
),
(
  'Canale Tatto - Le Sensazioni Dimenticate',
  'Oggi concentrati sul tatto. La temperatura dell''aria, il tessuto dei vestiti, una stretta di mano, l''acqua calda. Il corpo sente continuamente - la mente raramente ascolta.',
  'microfelicita', 'original', 'SENTIRE', 8, 'base', 15
),
(
  'Canale Gusto - Oltre il Nutrirsi',
  'Al prossimo pasto, mangia i primi 3 bocconi con attenzione totale. Sapore, consistenza, temperatura. Il cibo è una fonte di microfelicità 3 volte al giorno - di solito la sprechi.',
  'microfelicita', 'original', 'SENTIRE', 9, 'base', 15
),
(
  'Canale Pensiero - I Momenti Interni',
  'Non tutti i momenti piacevoli sono sensoriali. Un ricordo bello, un''idea che ti entusiasma, gratitudine per qualcuno. Oggi nota i momenti piacevoli che nascono dentro, non fuori.',
  'microfelicita', 'original', 'PENSARE', 10, 'intermedio', 15
),

-- ═══ CHALLENGE FOLLOWUP (7 esercizi) ═══
(
  'Consolidamento Day 1 - I 50 Momenti',
  'Riprendi la lista del Day 1 (momenti piacevoli nelle ultime 24h). Aggiungine altri 10. La lista crescerà ogni volta che la riprendi - il radar si sta calibrando.',
  'microfelicita', 'original', 'ESSERE', 11, 'base', 15
),
(
  'Consolidamento Day 2 - Quantità Batte Intensità',
  'Conta: quanti momenti piacevoli hai notato oggi? Non importa quanto piccoli. Più ne noti, più il radar si affina. Obiettivo: superare il numero di ieri.',
  'microfelicita', 'original', 'PENSARE', 12, 'base', 10
),
(
  'Consolidamento Day 3 - Il Tuo Canale Dominante',
  'Dopo 3 giorni di pratica, quale canale usi di più? Vista? Suono? Oggi esplora un canale che usi poco. Potresti scoprire una nuova fonte di microfelicità.',
  'microfelicita', 'original', 'SENTIRE', 13, 'base', 15
),
(
  'Consolidamento Day 4 - Amplifica di Più',
  'Oggi, quando noti un momento piacevole, resta 30 secondi (non 10). Esagera l''amplificazione. Nota come cambia l''intensità della sensazione.',
  'microfelicita', 'original', 'SENTIRE', 14, 'base', 10
),
(
  'Consolidamento Day 5 - R.A.D.A.R. e Stress',
  'Scegli un momento stressante della giornata. Applica R.A.D.A.R. DURANTE lo stress. Cosa di piacevole c''è anche in quel momento? R.A.D.A.R. non nega il negativo - completa il quadro.',
  'microfelicita', 'original', 'ESSERE', 15, 'intermedio', 15
),
(
  'Consolidamento Day 6 - L''Aggancio',
  'Scegli un''azione quotidiana (primo caffè, aprire il laptop, tornare a casa). Collegala a R.A.D.A.R. "Quando [azione], faccio R.A.D.A.R." Questo crea l''abitudine.',
  'microfelicita', 'original', 'AGIRE', 16, 'base', 10
),
(
  'Consolidamento Day 7 - Il Piano 21 Giorni',
  'Scrivi il tuo piano per i prossimi 21 giorni: quale aggancio userai? Quante volte al giorno? Come traccerai? Ricorda: costanza batte intensità.',
  'microfelicita', 'original', 'AGIRE', 17, 'intermedio', 15
),

-- ═══ AVANZATI (7 esercizi) ═══
(
  'R.A.D.A.R. in Coppia',
  'Fai R.A.D.A.R. insieme a qualcuno (partner, collega, amico). Condividete i momenti notati. Vedrai cose che non avresti visto da solo. Il radar condiviso vede di più.',
  'microfelicita', 'original', 'SENTIRE', 18, 'intermedio', 20
),
(
  'La Giornata R.A.D.A.R. Intensiva',
  'Un giorno intero dedicato. Ogni ora, fermati 2 minuti per R.A.D.A.R. Scrivi tutto. A fine giornata avrai 16+ momenti documentati. Quanti ne avresti notati senza questo esercizio?',
  'microfelicita', 'original', 'AGIRE', 19, 'avanzato', 30
),
(
  'R.A.D.A.R. Retrospettivo',
  'Applica R.A.D.A.R. a un ricordo del passato. Una vacanza, un progetto completato, un periodo difficile superato. Anche nel passato ci sono microfelicità non notate.',
  'microfelicita', 'original', 'PENSARE', 20, 'intermedio', 20
),
(
  'Insegna R.A.D.A.R. a Qualcuno',
  'Il modo migliore per padroneggiare qualcosa è insegnarlo. Spiega R.A.D.A.R. a qualcuno e guidalo nel primo esercizio. Cosa noti insegnando?',
  'microfelicita', 'original', 'SENTIRE', 21, 'avanzato', 30
),
(
  'R.A.D.A.R. e Decisioni',
  'La prossima decisione importante, dopo aver valutato pro/contro, aggiungi: "Quale opzione mi darà più microfelicità quotidiana?" Non è l''unico criterio, ma spesso è quello dimenticato.',
  'microfelicita', 'original', 'PENSARE', 22, 'avanzato', 20
),
(
  'Il Tuo Profilo Microfelicità',
  'Dopo settimane di pratica, scrivi il tuo profilo: quali canali usi di più? Quali momenti noti più spesso? Quali sabotatori ti bloccano? Questo è il tuo manuale personale.',
  'microfelicita', 'original', 'ESSERE', 23, 'avanzato', 30
),
(
  'R.A.D.A.R. come Filosofia di Vita',
  'Rifletti: come cambierebbe la tua vita se notassi 10 momenti piacevoli in più ogni giorno? 70 a settimana. 3650 all''anno. R.A.D.A.R. non aggiunge momenti - ti insegna a vedere quelli che già ci sono.',
  'microfelicita', 'original', 'ESSERE', 24, 'avanzato', 20
);

-- Verifica inserimento
SELECT book_slug, COUNT(*) as total,
       COUNT(CASE WHEN difficulty_level = 'base' THEN 1 END) as base,
       COUNT(CASE WHEN difficulty_level = 'intermedio' THEN 1 END) as intermedio,
       COUNT(CASE WHEN difficulty_level = 'avanzato' THEN 1 END) as avanzato
FROM exercises
WHERE book_slug = 'microfelicita'
GROUP BY book_slug;
