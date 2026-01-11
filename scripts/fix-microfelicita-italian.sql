-- =====================================================
-- FIX: Corregge grammatica italiana esercizi Microfelicità
-- Data: 7 Gennaio 2026
-- GRAMMATICA: Verificata secondo Regole_di_Grammatica_italiana.md
-- =====================================================

-- ═══════════════════════════════════════════════════
-- CORE R.A.D.A.R. (weeks 1-5)
-- ═══════════════════════════════════════════════════
UPDATE exercises SET
  title = 'R: Rileva i Momenti che Non Vedi',
  description = 'Prenditi 2 minuti. Ripensa alle ultime 24 ore. Quali momenti piacevoli ci sono stati che hai lasciato passare senza notarli? Il caffè caldo, un sorriso, un raggio di sole. Scrivine almeno 3. Rilevare è il primo passo: non puoi goderti ciò che non noti.'
WHERE book_slug = 'microfelicita' AND week_number = 1;

UPDATE exercises SET
  title = 'A: Accogli Senza Giudicare il Momento',
  description = 'Quando noti un momento piacevole, la mente vuole subito valutarlo ("sì ma...", "però...", "non è abbastanza"). Oggi, quando rilevi un momento piacevole, accoglilo senza giudizio. Non deve essere perfetto. Non deve durare. Basta che ci sia.'
WHERE book_slug = 'microfelicita' AND week_number = 2;

UPDATE exercises SET
  title = 'D: Distingui il Canale Sensoriale',
  description = 'I momenti piacevoli arrivano da canali diversi: vista, suono, tatto, gusto, pensiero. Oggi, ogni volta che noti un momento piacevole, chiediti: da quale canale arriva? Distinguere ti aiuta ad amplificare e a cercare attivamente.'
WHERE book_slug = 'microfelicita' AND week_number = 3;

UPDATE exercises SET
  title = 'A: Amplifica Restando 10 Secondi in Più',
  description = 'Quando noti un momento piacevole, invece di passare oltre, FERMATI. Resta nel momento per 10 secondi in più. Respira. Senti. Questo semplice gesto amplifica l''impatto emotivo del momento. 10 secondi cambiano tutto.'
WHERE book_slug = 'microfelicita' AND week_number = 4;

UPDATE exercises SET
  title = 'R: Ripeti e Crea il Pattern Quotidiano',
  description = 'Il metodo R.A.D.A.R. funziona con la ripetizione. Scegli 3 momenti fissi della giornata (ad esempio: mattina, pranzo, sera). In quei momenti, attiva R.A.D.A.R. per 2 minuti. La ripetizione crea l''abitudine.'
WHERE book_slug = 'microfelicita' AND week_number = 5;

-- ═══════════════════════════════════════════════════
-- CORE 5 CANALI (weeks 6-10)
-- ═══════════════════════════════════════════════════
UPDATE exercises SET
  title = 'Canale Vista: il Bello Invisibile',
  description = 'Oggi concentrati SOLO sulla vista. Cerca: un colore che ti piace, una forma interessante, un gioco di luce. Il bello visivo è ovunque, ma lo vediamo solo se lo cerchiamo. Annota almeno 5 momenti visivi piacevoli.'
WHERE book_slug = 'microfelicita' AND week_number = 6;

UPDATE exercises SET
  title = 'Canale Suono: le Frequenze Piacevoli',
  description = 'Oggi concentrati SOLO sui suoni. Il silenzio, una voce familiare, la musica in sottofondo, il rumore della pioggia, una risata. Quali suoni ti danno piacere? Cercali attivamente. Annota almeno 5 momenti sonori piacevoli.'
WHERE book_slug = 'microfelicita' AND week_number = 7;

UPDATE exercises SET
  title = 'Canale Tatto: le Sensazioni Dimenticate',
  description = 'Oggi concentrati sul tatto. La temperatura dell''aria, il tessuto dei vestiti, una stretta di mano, l''acqua calda sulla pelle. Quante sensazioni tattili piacevoli ignoriamo ogni giorno? Annota almeno 5 momenti tattili.'
WHERE book_slug = 'microfelicita' AND week_number = 8;

UPDATE exercises SET
  title = 'Canale Gusto: Oltre il Semplice Nutrirsi',
  description = 'Al prossimo pasto, mangia i primi 3 bocconi con attenzione totale. Nota il sapore, la consistenza, la temperatura. Non stiamo solo nutrendo il corpo: stiamo gustando. Questo canale è spesso ignorato fuori dai pasti.'
WHERE book_slug = 'microfelicita' AND week_number = 9;

UPDATE exercises SET
  title = 'Canale Pensiero: i Momenti Interni',
  description = 'Non tutti i momenti piacevoli sono sensoriali. Un ricordo bello, un''idea che ti entusiasma, un pensiero di gratitudine, la soddisfazione per qualcosa che hai fatto. Oggi nota i momenti piacevoli interni, quelli che nascono nella mente.'
WHERE book_slug = 'microfelicita' AND week_number = 10;

-- ═══════════════════════════════════════════════════
-- CHALLENGE FOLLOWUP (weeks 11-17)
-- ═══════════════════════════════════════════════════
UPDATE exercises SET
  title = 'Consolidamento Day 1: i 50 Momenti',
  description = 'Riprendi la lista del Day 1 (i momenti piacevoli nelle ultime 24 ore). Aggiungine altri. L''obiettivo è arrivare a 50 momenti piacevoli in una settimana. Non devono essere grandi. La quantità conta più dell''intensità.'
WHERE book_slug = 'microfelicita' AND week_number = 11;

UPDATE exercises SET
  title = 'Consolidamento Day 2: la Quantità Batte l''Intensità',
  description = 'Conta: quanti momenti piacevoli hai notato oggi? Non importa quanto piccoli. Più ne noti, più il tuo cervello impara a cercarli. La ricerca mostra che frequenza batte intensità per il benessere. Punta a 10 al giorno.'
WHERE book_slug = 'microfelicita' AND week_number = 12;

UPDATE exercises SET
  title = 'Consolidamento Day 3: il Tuo Canale Dominante',
  description = 'Dopo 3 giorni di pratica, quale canale usi di più? Vista? Suono? Tatto? Gusto? Pensiero? Oggi esplora un canale che usi meno. Potresti scoprire una fonte di microfelicità che hai sempre ignorato.'
WHERE book_slug = 'microfelicita' AND week_number = 13;

UPDATE exercises SET
  title = 'Consolidamento Day 4: Amplifica Ancora di Più',
  description = 'Oggi, quando noti un momento piacevole, resta 30 secondi (non 10). Esagera l''amplificazione. Nota cosa succede quando dai più tempo al momento. Il cervello ha bisogno di tempo per registrare il positivo.'
WHERE book_slug = 'microfelicita' AND week_number = 14;

UPDATE exercises SET
  title = 'Consolidamento Day 5: R.A.D.A.R. e lo Stress',
  description = 'Scegli un momento stressante della giornata. Applica il metodo R.A.D.A.R. DURANTE lo stress: c''è qualcosa di piacevole anche lì? Forse no. Ma l''atto di cercare cambia la tua relazione con il momento difficile.'
WHERE book_slug = 'microfelicita' AND week_number = 15;

UPDATE exercises SET
  title = 'Consolidamento Day 6: l''Aggancio Quotidiano',
  description = 'Scegli un''azione quotidiana (il primo caffè, aprire il laptop, tornare a casa). Collegala a R.A.D.A.R.: ogni volta che fai quell''azione, attivi automaticamente la ricerca di momenti piacevoli. L''aggancio crea l''abitudine.'
WHERE book_slug = 'microfelicita' AND week_number = 16;

UPDATE exercises SET
  title = 'Consolidamento Day 7: il Piano per 21 Giorni',
  description = 'Scrivi il tuo piano per i prossimi 21 giorni: quale aggancio userai? Quante volte al giorno attiverai R.A.D.A.R.? Quali canali esplorerai? 21 giorni per costruire un''abitudine che cambia la percezione della vita.'
WHERE book_slug = 'microfelicita' AND week_number = 17;

-- ═══════════════════════════════════════════════════
-- AVANZATI (weeks 18-24)
-- ═══════════════════════════════════════════════════
UPDATE exercises SET
  title = 'R.A.D.A.R. in Coppia',
  description = 'Pratica R.A.D.A.R. insieme a qualcuno (partner, collega, amico). Condividete i momenti piacevoli notati. La condivisione amplifica l''effetto e crea connessione. Prova per una settimana con la stessa persona.'
WHERE book_slug = 'microfelicita' AND week_number = 18;

UPDATE exercises SET
  title = 'La Giornata R.A.D.A.R. Intensiva',
  description = 'Un giorno intero dedicato al metodo. Ogni ora, fermati 2 minuti per attivare R.A.D.A.R. Scrivi tutti i momenti piacevoli notati. A fine giornata, conta: quanti ne hai trovati? Questo esercizio resetta la percezione.'
WHERE book_slug = 'microfelicita' AND week_number = 19;

UPDATE exercises SET
  title = 'R.A.D.A.R. Retrospettivo',
  description = 'Applica R.A.D.A.R. a un ricordo del passato. Una vacanza, un progetto completato, un periodo difficile superato. Cerca i momenti piacevoli che c''erano ma che forse non hai notato allora. Puoi rilevare anche nel passato.'
WHERE book_slug = 'microfelicita' AND week_number = 20;

UPDATE exercises SET
  title = 'Insegna R.A.D.A.R. a Qualcuno',
  description = 'Il modo migliore per padroneggiare qualcosa è insegnarlo. Spiega R.A.D.A.R. a qualcuno che non lo conosce. Le 5 lettere, i canali, l''amplificazione. Insegnando, rafforzi la tua pratica e diffondi benessere.'
WHERE book_slug = 'microfelicita' AND week_number = 21;

UPDATE exercises SET
  title = 'R.A.D.A.R. e le Decisioni',
  description = 'La prossima decisione importante: dopo aver valutato pro e contro, aggiungi una domanda: "Quale opzione mi porterà più momenti piacevoli quotidiani?" Non la felicità grande, ma la microfelicità frequente.'
WHERE book_slug = 'microfelicita' AND week_number = 22;

UPDATE exercises SET
  title = 'Il Tuo Profilo di Microfelicità',
  description = 'Dopo settimane di pratica, scrivi il tuo profilo: quali canali usi di più? Quali momenti ricorrono? Quando durante la giornata noti più facilmente? Questo profilo è la tua mappa personale per la microfelicità.'
WHERE book_slug = 'microfelicita' AND week_number = 23;

UPDATE exercises SET
  title = 'R.A.D.A.R. come Filosofia di Vita',
  description = 'Rifletti: come cambierebbe la tua vita se notassi 10 momenti piacevoli in più ogni giorno? 70 a settimana. 3.650 all''anno. R.A.D.A.R. non è una tecnica, è un modo di guardare il mondo. Sei diventato un esperto nel trovare il bello nascosto.'
WHERE book_slug = 'microfelicita' AND week_number = 24;

-- Verifica
SELECT week_number, title FROM exercises
WHERE book_slug = 'microfelicita'
ORDER BY week_number;
