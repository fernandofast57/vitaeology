-- =====================================================
-- VITAEOLOGY - Seed 52 Esercizi Settimanali
-- =====================================================
-- Esegui questo script su: Supabase Dashboard → SQL Editor
-- =====================================================

-- Prima elimina gli esercizi esistenti (opzionale, decommenta se vuoi resettare)
-- DELETE FROM user_exercise_progress;
-- DELETE FROM exercises;

-- Inserisci i 52 esercizi settimanali
INSERT INTO exercises (
  id, book_id, week_number, title, subtitle, characteristic_slug,
  exercise_type, difficulty_level, estimated_time_minutes, month_name,
  description, instructions, deliverable, reflection_prompts, is_active, sort_order
) VALUES

-- =====================================================
-- MESE 1: ESSERE - Autenticità e Integrità (Sett. 1-4)
-- =====================================================
(
  gen_random_uuid(), 1, 1,
  'Il Tuo Punto di Partenza',
  'Scopri chi sei come leader oggi',
  'autenticita',
  'riflessione', 'base', 30, 'Gennaio',
  'Prima di iniziare qualsiasi percorso di crescita, è fondamentale capire dove ti trovi. Questo esercizio ti aiuterà a fare una fotografia onesta della tua leadership attuale.',
  'Trova un momento tranquillo di almeno 30 minuti. Prendi carta e penna (o un documento digitale) e rispondi alle seguenti domande con totale onestà:\n\n1. Quali sono i tuoi 3 punti di forza come leader?\n2. Quali sono le 3 aree dove senti di dover migliorare?\n3. Come ti descriverebbero i tuoi collaboratori?\n4. Qual è la decisione più difficile che hai preso negli ultimi 6 mesi?\n5. Cosa ti motiva ad essere un leader migliore?',
  'Documento con auto-analisi completa + 3 obiettivi per i prossimi 3 mesi',
  '["Cosa ti ha sorpreso di più di questa auto-analisi?", "Quanto sei stato onesto con te stesso?", "Quale area vuoi affrontare per prima?"]'::jsonb,
  true, 1
),
(
  gen_random_uuid(), 1, 2,
  'Il Primo Passo Difficile',
  'Agisci con autenticità in una situazione sfidante',
  'autenticita',
  'azione', 'base', 45, 'Gennaio',
  'L''autenticità si dimostra nelle azioni, non solo nelle parole. Questa settimana metterai in pratica l''essere genuino in una situazione reale.',
  'Identifica una situazione lavorativa dove normalmente "reciteresti un ruolo" o diresti ciò che gli altri vogliono sentire.\n\nPuò essere:\n- Una riunione dove hai un''opinione diversa dalla maggioranza\n- Un feedback da dare a un collaboratore\n- Una conversazione con il tuo capo su un tema delicato\n\nAffronta questa situazione essendo completamente autentico, esprimendo la tua vera opinione in modo rispettoso ma diretto.',
  'Report della situazione affrontata + risultati ottenuti + lezioni apprese',
  '["Come ti sei sentito ad essere completamente autentico?", "Quale è stata la reazione degli altri?", "Lo rifaresti? Perché?"]'::jsonb,
  true, 2
),
(
  gen_random_uuid(), 1, 3,
  'Ammettere Non Lo So',
  'Pratica l''umiltà intellettuale',
  'integrita',
  'sfida', 'base', 30, 'Gennaio',
  'I leader con integrità riconoscono i propri limiti. Questa settimana praticherai l''arte di ammettere quando non sai qualcosa.',
  'Per 5 giorni consecutivi, cerca attivamente opportunità per dire "Non lo so" o "Non sono sicuro".\n\nRegole:\n1. Deve essere genuino (non inventare situazioni)\n2. Dopo aver ammesso di non sapere, chiedi aiuto o informazioni\n3. Ringrazia chi ti aiuta\n4. Documenta ogni situazione\n\nObiettivo: minimo 1 situazione al giorno per 5 giorni.',
  'Diario di 5 giorni con situazioni + reazioni ricevute + come ti sei sentito',
  '["È stato difficile ammettere di non sapere?", "Come hanno reagito gli altri?", "Cosa hai imparato da questa esperienza?"]'::jsonb,
  true, 3
),
(
  gen_random_uuid(), 1, 4,
  'Analisi Fallimento Recente',
  'Trasforma un errore in apprendimento',
  'integrita',
  'analisi', 'base', 45, 'Gennaio',
  'L''integrità include la capacità di riconoscere i propri errori e imparare da essi. Analizzerai un fallimento recente con occhio critico ma costruttivo.',
  'Pensa a un fallimento o errore significativo degli ultimi 6 mesi (progetto andato male, decisione sbagliata, conflitto gestito male).\n\nAnalizzalo usando questo framework:\n1. Cosa è successo esattamente? (fatti, non interpretazioni)\n2. Quali erano le tue responsabilità specifiche?\n3. Cosa avresti potuto fare diversamente?\n4. Quali segnali di allarme hai ignorato?\n5. Cosa hai imparato?\n6. Come applicherai questa lezione in futuro?',
  'Documento con analisi di 1 fallimento + 3 lezioni concrete + piano di applicazione',
  '["Quanto è stato difficile analizzare il tuo errore?", "Hai scoperto pattern ricorrenti?", "Come ti senti ora riguardo a quel fallimento?"]'::jsonb,
  true, 4
),

-- =====================================================
-- MESE 2: ESSERE - Consapevolezza e Presenza (Sett. 5-8)
-- =====================================================
(
  gen_random_uuid(), 1, 5,
  'Il Feedback a 360°',
  'Raccogli percezioni esterne su di te',
  'consapevolezza-di-se',
  'feedback', 'intermedio', 60, 'Febbraio',
  'La consapevolezza di sé richiede di vedere noi stessi anche attraverso gli occhi degli altri. Raccoglierai feedback da persone diverse.',
  'Identifica 5 persone che ti conoscono in contesti diversi:\n- 1 superiore\n- 2 colleghi/pari\n- 1 collaboratore/subordinato\n- 1 persona della tua vita personale\n\nChiedi a ciascuno (di persona o via email) di rispondere a 3 domande:\n1. Qual è il mio punto di forza principale come leader/persona?\n2. Quale comportamento dovrei migliorare?\n3. Cosa ti aspetti da me che non sto facendo?\n\nRaccogli e sintetizza le risposte cercando pattern comuni.',
  'Sintesi del feedback ricevuto + 3 temi ricorrenti + piano di miglioramento',
  '["Quale feedback ti ha sorpreso di più?", "C''è coerenza tra come ti vedi e come ti vedono?", "Quale feedback è più difficile da accettare?"]'::jsonb,
  true, 5
),
(
  gen_random_uuid(), 1, 6,
  'Diario della Presenza',
  'Sviluppa la consapevolezza momento per momento',
  'presenza',
  'riflessione', 'base', 20, 'Febbraio',
  'Essere presenti significa essere pienamente nel momento. Per una settimana, praticherai la presenza consapevole.',
  'Per 7 giorni consecutivi, 3 volte al giorno (mattina, pomeriggio, sera), fermati per 2 minuti e rispondi:\n\n1. Dove sono in questo momento? (fisicamente ed emotivamente)\n2. Cosa sto pensando?\n3. Cosa sto provando nel corpo?\n4. Sono presente o sto pensando al passato/futuro?\n5. Valuta la tua presenza da 1 a 10\n\nUsa un''app note o un quaderno per tracciare.',
  'Diario di 7 giorni con 21 check-in di presenza + pattern identificati',
  '["In quali momenti sei più presente?", "Cosa ti distrae maggiormente?", "Come è cambiata la tua consapevolezza durante la settimana?"]'::jsonb,
  true, 6
),
(
  gen_random_uuid(), 1, 7,
  'Meeting Senza Telefono',
  'Pratica la presenza totale nelle riunioni',
  'presenza',
  'sfida', 'intermedio', 40, 'Febbraio',
  'La presenza si dimostra dando attenzione totale. Questa settimana eliminerai le distrazioni tecnologiche nelle riunioni.',
  'Per una settimana intera, in TUTTE le riunioni:\n\n1. Lascia il telefono fuori dalla stanza o in modalità aereo\n2. Chiudi email e notifiche sul computer\n3. Prendi appunti a mano (non digitali)\n4. Mantieni contatto visivo con chi parla\n5. Fai almeno 1 domanda per riunione\n\nDopo ogni riunione, valuta:\n- Quanto sei stato presente (1-10)?\n- Cosa hai notato che normalmente ti sfugge?\n- Come hanno reagito gli altri?',
  'Report settimanale delle riunioni + livello di presenza + osservazioni',
  '["Cosa hai notato che normalmente ti sfuggiva?", "È stato difficile resistere alla tentazione del telefono?", "Come è cambiata la qualità delle tue riunioni?"]'::jsonb,
  true, 7
),
(
  gen_random_uuid(), 1, 8,
  'La Mappa delle Emozioni',
  'Riconosci i tuoi trigger emotivi',
  'consapevolezza-di-se',
  'analisi', 'intermedio', 45, 'Febbraio',
  'Conoscere i propri trigger emotivi è fondamentale per la leadership consapevole. Mapperai le situazioni che scatenano reazioni emotive intense.',
  'Per 2 settimane, ogni volta che provi un''emozione intensa (positiva o negativa), documenta:\n\n1. Emozione provata (nome specifico, non generico)\n2. Intensità (1-10)\n3. Situazione/trigger\n4. Pensieri automatici\n5. Reazione comportamentale\n6. Conseguenze\n\nDopo 2 settimane, analizza i pattern:\n- Quali emozioni sono più frequenti?\n- Quali situazioni le scatenano?\n- Come reagisci tipicamente?',
  'Mappa emotiva con almeno 10 episodi + 3 pattern identificati + strategie di gestione',
  '["Quali pattern hai scoperto?", "C''è un''emozione dominante?", "Come puoi usare questa consapevolezza?"]'::jsonb,
  true, 8
),

-- =====================================================
-- MESE 3: ESSERE - Resilienza e Umiltà (Sett. 9-13)
-- =====================================================
(
  gen_random_uuid(), 1, 9,
  'Storia di Resilienza',
  'Riscopri la tua forza interiore',
  'resilienza',
  'riflessione', 'base', 40, 'Marzo',
  'Tutti abbiamo superato momenti difficili. Riconnettiti con la tua resilienza passata per rafforzare quella futura.',
  'Ripensa a 3 momenti difficili della tua vita/carriera che hai superato.\n\nPer ciascuno, scrivi:\n1. Cosa è successo?\n2. Come ti sei sentito nel momento peggiore?\n3. Cosa ti ha aiutato ad andare avanti?\n4. Quali risorse interiori hai usato?\n5. Cosa hai imparato da quell''esperienza?\n6. Come quell''esperienza ti ha reso più forte?\n\nIdentifica i pattern comuni: quali sono le TUE strategie di resilienza?',
  'Documento con 3 storie di resilienza + pattern comuni + risorse personali identificate',
  '["Quale storia ti ha toccato di più rivisitare?", "Quali risorse usi più spesso?", "Come puoi applicare queste risorse oggi?"]'::jsonb,
  true, 9
),
(
  gen_random_uuid(), 1, 10,
  'La Sfida Volontaria',
  'Esci dalla zona di comfort deliberatamente',
  'resilienza',
  'sfida', 'avanzato', 60, 'Marzo',
  'La resilienza si costruisce affrontando sfide. Questa settimana sceglierai volontariamente di fare qualcosa di difficile.',
  'Scegli UNA sfida significativa da completare questa settimana:\n\n- Parla in pubblico (anche una breve presentazione)\n- Chiedi un aumento o promozione\n- Affronta una conversazione che rimandi da tempo\n- Impara qualcosa di completamente nuovo\n- Fai qualcosa che ti spaventa (in modo sicuro)\n\nDocumenta:\n- Prima: paure e resistenze\n- Durante: cosa provi\n- Dopo: cosa hai imparato\n\nL''obiettivo non è riuscire perfettamente, ma affrontare la sfida.',
  'Report della sfida affrontata + emozioni provate + lezioni di resilienza',
  '["Perché hai scelto questa sfida?", "Cosa hai scoperto su di te?", "La paura era giustificata?"]'::jsonb,
  true, 10
),
(
  gen_random_uuid(), 1, 11,
  'Chiedere Aiuto',
  'Pratica l''umiltà di non farcela da solo',
  'umilta',
  'azione', 'intermedio', 30, 'Marzo',
  'L''umiltà include riconoscere che non possiamo fare tutto da soli. Questa settimana praticherai l''arte di chiedere aiuto.',
  'Identifica 3 situazioni questa settimana dove potresti chiedere aiuto invece di fare tutto da solo:\n\n1. Un compito dove qualcun altro è più esperto\n2. Una decisione dove ti servirebbe un''altra prospettiva\n3. Un''attività che ti sovraccarica\n\nPer ciascuna:\n- Chiedi aiuto esplicitamente\n- Spiega perché chiedi proprio a quella persona\n- Accetta l''aiuto con gratitudine\n- Documenta l''esperienza',
  'Report di 3 richieste di aiuto + risultati + riflessioni',
  '["È stato difficile chiedere aiuto?", "Come hanno risposto le persone?", "Cosa hai imparato sull''umiltà?"]'::jsonb,
  true, 11
),
(
  gen_random_uuid(), 1, 12,
  'Celebra gli Altri',
  'Riconosci pubblicamente i meriti altrui',
  'umilta',
  'azione', 'base', 25, 'Marzo',
  'I leader umili mettono in luce gli altri. Questa settimana praticherai il riconoscimento pubblico.',
  'Per 5 giorni, ogni giorno:\n\n1. Identifica qualcuno che ha fatto qualcosa di buono (grande o piccolo)\n2. Riconosci il suo contributo PUBBLICAMENTE (in riunione, email al team, messaggio nel gruppo)\n3. Sii specifico su cosa ha fatto e perché è importante\n4. Non aggiungere "anch''io ho fatto..." - focus solo su di loro\n\nDocumenta ogni riconoscimento e le reazioni.',
  'Diario di 5 riconoscimenti pubblici + reazioni osservate',
  '["Come ti sei sentito a mettere gli altri in luce?", "Come hanno reagito le persone celebrate?", "Cosa hai notato nel team?"]'::jsonb,
  true, 12
),
(
  gen_random_uuid(), 1, 13,
  'Review Primo Trimestre',
  'Valuta i tuoi progressi ESSERE',
  'autenticita',
  'analisi', 'intermedio', 60, 'Marzo',
  'È tempo di fermarsi e valutare i progressi fatti nelle prime 12 settimane focalizzate sul pilastro ESSERE.',
  'Rivedi tutti gli esercizi completati nelle settimane 1-12.\n\nRispondi a:\n1. Quali esercizi ti hanno impattato di più? Perché?\n2. Cosa hai scoperto su di te che non sapevi?\n3. Quali comportamenti sono cambiati?\n4. Dove hai ancora difficoltà?\n5. Valuta il tuo progresso in ogni area (1-10):\n   - Autenticità\n   - Integrità\n   - Consapevolezza di Sé\n   - Presenza\n   - Resilienza\n   - Umiltà\n\nIdentifica 2 aree su cui continuare a lavorare.',
  'Report trimestrale con valutazioni + 2 aree di focus per il trimestre successivo',
  '["Di cosa sei più orgoglioso?", "Cosa è stato più difficile?", "Come continuerai a crescere?"]'::jsonb,
  true, 13
),

-- =====================================================
-- MESE 4: SENTIRE - Empatia e Intelligenza Emotiva (Sett. 14-17)
-- =====================================================
(
  gen_random_uuid(), 1, 14,
  'Un Giorno nei Loro Panni',
  'Pratica l''empatia profonda',
  'empatia',
  'riflessione', 'intermedio', 45, 'Aprile',
  'L''empatia richiede di vedere il mondo dalla prospettiva dell''altro. Questa settimana ti immergerai nelle esperienze altrui.',
  'Scegli 3 persone con cui interagisci regolarmente (collaboratore, collega, cliente).\n\nPer ciascuna, dedica 15 minuti a immaginare:\n\n1. Com''è la loro giornata tipo?\n2. Quali pressioni subiscono?\n3. Quali sono le loro paure lavorative?\n4. Cosa li motiva?\n5. Come si sentono quando interagiscono con te?\n6. Di cosa avrebbero bisogno da te che non stanno ricevendo?\n\nPoi VERIFICA: parla con loro e chiedi come stanno davvero.',
  'Profili empatici di 3 persone + verifica delle tue intuizioni',
  '["Quanto erano accurate le tue intuizioni?", "Cosa ti ha sorpreso?", "Come cambierà il tuo comportamento?"]'::jsonb,
  true, 14
),
(
  gen_random_uuid(), 1, 15,
  'Gestire le Emozioni Difficili',
  'Sviluppa strategie per emozioni intense',
  'intelligenza-emotiva',
  'pianificazione', 'intermedio', 40, 'Aprile',
  'L''intelligenza emotiva include la capacità di gestire emozioni difficili. Creerai un toolkit personale.',
  'Identifica le 3 emozioni negative che provi più frequentemente al lavoro (es. frustrazione, ansia, rabbia).\n\nPer ciascuna, sviluppa:\n\n1. Segnali precoci (come riconosci che sta arrivando?)\n2. Trigger comuni (cosa la scatena di solito?)\n3. Strategia di risposta immediata (cosa fare nei primi 30 secondi)\n4. Strategia di gestione (come elaborarla)\n5. Prevenzione (come ridurre la frequenza)\n\nCrea una "scheda" per ogni emozione da tenere a portata di mano.',
  'Toolkit con 3 schede di gestione emotiva + piano di implementazione',
  '["Quale emozione è più sfidante per te?", "Hai già strategie che funzionano?", "Come testerai questo toolkit?"]'::jsonb,
  true, 15
),
(
  gen_random_uuid(), 1, 16,
  'Leggere la Stanza',
  'Sviluppa la percezione emotiva del gruppo',
  'intelligenza-emotiva',
  'sfida', 'avanzato', 35, 'Aprile',
  'I leader emotivamente intelligenti sanno "leggere la stanza". Allenerai questa capacità.',
  'Per una settimana, in ogni riunione o interazione di gruppo:\n\nPRIMA di entrare:\n- Fermati 30 secondi\n- Fai 3 respiri profondi\n- Chiediti: "Cosa potrei aspettarmi emotivamente?"\n\nDURANTE:\n- Osserva linguaggio corporeo, tono di voce, energie\n- Nota chi parla e chi tace\n- Identifica l''emozione dominante del gruppo\n- Nota cambiamenti di energia\n\nDOPO:\n- Scrivi cosa hai percepito\n- Valuta: influenza sulla riunione\n\nFai questo per almeno 5 riunioni.',
  'Diario di 5+ riunioni con osservazioni emotive + pattern identificati',
  '["Cosa ti è più facile percepire?", "Cosa ti sfugge?", "Come puoi usare queste informazioni?"]'::jsonb,
  true, 16
),
(
  gen_random_uuid(), 1, 17,
  'Conversazione Empatica',
  'Ascolta per capire, non per rispondere',
  'empatia',
  'azione', 'base', 30, 'Aprile',
  'L''empatia si esprime attraverso l''ascolto profondo. Praticherai conversazioni dove l''unico obiettivo è capire.',
  'Questa settimana, conduci 3 conversazioni "empatiche":\n\n1. Scegli qualcuno che sembra stressato/preoccupato\n2. Chiedi "Come stai veramente?"\n3. Ascolta SENZA:\n   - Dare consigli\n   - Condividere esperienze simili\n   - Minimizzare i loro problemi\n   - Cercare soluzioni\n4. Usa solo:\n   - Domande per capire meglio\n   - Riflessi ("Sembra che tu ti senta...")\n   - Silenzio\n5. Chiudi con "Grazie per aver condiviso"\n\nDocumenta ogni conversazione.',
  'Report di 3 conversazioni empatiche + riflessioni su cosa hai imparato',
  '["Quanto è stato difficile non dare consigli?", "Come hanno risposto le persone?", "Cosa hai capito che normalmente ti sfugge?"]'::jsonb,
  true, 17
),

-- =====================================================
-- MESE 5: SENTIRE - Ascolto e Compassione (Sett. 18-21)
-- =====================================================
(
  gen_random_uuid(), 1, 18,
  'Ascolto a Tre Livelli',
  'Approfondisci la qualità del tuo ascolto',
  'ascolto-attivo',
  'riflessione', 'intermedio', 35, 'Maggio',
  'L''ascolto attivo opera a tre livelli: contenuto, emozioni e bisogni. Allenerai tutti e tre.',
  'Per una settimana, in ogni conversazione importante pratica l''ascolto a tre livelli:\n\n1. CONTENUTO: Cosa sta dicendo esattamente?\n   - Prendi note mentali dei punti chiave\n   - Riassumi per verificare comprensione\n\n2. EMOZIONI: Come si sente?\n   - Osserva tono, espressioni, postura\n   - Nomina l''emozione ("Sembri frustrato...")\n\n3. BISOGNI: Cosa vuole veramente?\n   - Oltre le parole, qual è il bisogno?\n   - Cosa non sta chiedendo esplicitamente?\n\nDopo almeno 5 conversazioni, rifletti sui pattern.',
  'Diario di 5+ conversazioni con analisi a tre livelli',
  '["Quale livello ti viene più naturale?", "Quale richiede più pratica?", "Cosa hai scoperto ascoltando più profondamente?"]'::jsonb,
  true, 18
),
(
  gen_random_uuid(), 1, 19,
  'Pausa Prima di Parlare',
  'Rompi il pattern della risposta automatica',
  'ascolto-attivo',
  'sfida', 'base', 25, 'Maggio',
  'Spesso rispondiamo prima ancora di aver finito di ascoltare. Questa sfida ti rallenterà.',
  'Per 5 giorni, applica la "regola dei 3 secondi":\n\nOgni volta che qualcuno finisce di parlare:\n1. Conta mentalmente fino a 3 prima di rispondere\n2. Usa questo tempo per:\n   - Assicurarti che abbiano finito\n   - Processare quello che hanno detto\n   - Formulare una risposta ponderata\n\nTieni traccia:\n- Quante volte ci riesci\n- Cosa noti nelle reazioni degli altri\n- Come cambia la qualità delle tue risposte',
  'Report di 5 giorni con conteggio + osservazioni + difficoltà incontrate',
  '["È stato difficile aspettare?", "Come hanno reagito gli altri?", "Le tue risposte sono migliorate?"]'::jsonb,
  true, 19
),
(
  gen_random_uuid(), 1, 20,
  'Compassione in Azione',
  'Trasforma la compassione in gesti concreti',
  'compassione',
  'azione', 'base', 30, 'Maggio',
  'La compassione non è solo sentire, è agire. Questa settimana tradurrai la cura in azioni concrete.',
  'Ogni giorno per 5 giorni, compì un atto di compassione verso qualcuno al lavoro:\n\nPuò essere:\n- Offrire aiuto a chi è sovraccarico\n- Scrivere un messaggio di apprezzamento\n- Coprire un collega che ha difficoltà\n- Ascoltare qualcuno che ha bisogno di sfogarsi\n- Difendere qualcuno in sua assenza\n\nRegole:\n- Non aspettarti nulla in cambio\n- Non pubblicizzare il tuo gesto\n- Documenta per te stesso',
  'Diario privato di 5 atti di compassione + come ti sei sentito',
  '["È stato naturale o hai dovuto sforzarti?", "Come hanno reagito le persone?", "Come ti senti dopo questa settimana?"]'::jsonb,
  true, 20
),
(
  gen_random_uuid(), 1, 21,
  'Auto-Compassione',
  'Estendi la compassione a te stesso',
  'compassione',
  'riflessione', 'intermedio', 40, 'Maggio',
  'Spesso siamo più duri con noi stessi che con gli altri. Praticherai l''auto-compassione.',
  'Per una settimana, quando ti sorprendi a essere autocritico:\n\n1. RICONOSCI: "Sto essendo duro con me stesso"\n2. NORMALIZZA: "È umano fare errori/avere difficoltà"\n3. RIFORMULA: "Cosa direi a un amico nella stessa situazione?"\n4. AGISCI: Trattati come tratteresti quell''amico\n\nTieni un diario:\n- Situazioni di autocritica\n- Cosa ti sei detto inizialmente\n- Come hai riformulato\n- Come ti sei sentito dopo\n\nObiettivo: almeno 1 pratica al giorno.',
  'Diario di auto-compassione di 7 giorni + riflessioni sul cambiamento',
  '["Quanto sei normalmente autocritico?", "È stato difficile essere gentile con te stesso?", "Cosa è cambiato dentro di te?"]'::jsonb,
  true, 21
),

-- =====================================================
-- MESE 6: SENTIRE - Fiducia e Gratitudine (Sett. 22-26)
-- =====================================================
(
  gen_random_uuid(), 1, 22,
  'Audit della Fiducia',
  'Mappa le relazioni di fiducia nel tuo team',
  'fiducia',
  'analisi', 'intermedio', 45, 'Giugno',
  'La fiducia è la base delle relazioni efficaci. Farai un assessment delle relazioni di fiducia intorno a te.',
  'Crea una mappa delle tue relazioni professionali chiave (8-10 persone).\n\nPer ciascuna, valuta da 1 a 10:\n1. Quanto TI fidi di loro?\n2. Quanto pensi che LORO si fidino di te?\n3. Quanto è aperta la comunicazione?\n4. Quanto sei disposto a mostrarti vulnerabile?\n5. Quanto sono disposti loro?\n\nPer relazioni sotto 6:\n- Cosa ha eroso la fiducia?\n- Cosa potresti fare per ricostruirla?\n\nIdentifica 2 relazioni prioritarie da migliorare.',
  'Mappa della fiducia + analisi delle relazioni deboli + piano per 2 relazioni prioritarie',
  '["Ci sono sorprese nella mappa?", "Cosa erode la fiducia per te?", "Da dove inizierai?"]'::jsonb,
  true, 22
),
(
  gen_random_uuid(), 1, 23,
  'Mantenere una Promessa Difficile',
  'Costruisci fiducia attraverso l''affidabilità',
  'fiducia',
  'sfida', 'avanzato', 40, 'Giugno',
  'La fiducia si costruisce mantenendo le promesse, specialmente quelle difficili. Metterai alla prova la tua affidabilità.',
  'Identifica una promessa/impegno che hai fatto e che hai rimandato o rischi di non mantenere.\n\nPuò essere:\n- Un feedback promesso\n- Una deadline che stai per mancare\n- Un favore che hai detto di fare\n- Un cambiamento che hai promesso\n\nQuesta settimana:\n1. Riconosci l''impegno apertamente\n2. Crea un piano specifico per mantenerlo\n3. Comunica il piano all''altra persona\n4. MANTIENI L''IMPEGNO\n5. Chiedi feedback sulla tua affidabilità',
  'Report dell''impegno mantenuto + feedback ricevuto + riflessioni',
  '["Perché avevi rimandato?", "Come ti sei sentito a mantenere l''impegno?", "Cosa ha significato per l''altra persona?"]'::jsonb,
  true, 23
),
(
  gen_random_uuid(), 1, 24,
  'Diario della Gratitudine Lavorativa',
  'Coltiva l''apprezzamento quotidiano',
  'gratitudine',
  'riflessione', 'base', 15, 'Giugno',
  'La gratitudine trasforma la prospettiva. Per due settimane praticherai la gratitudine focalizzata sul lavoro.',
  'Ogni sera, per 14 giorni, scrivi:\n\n1. 3 cose per cui sei grato oggi al lavoro\n2. 1 persona che ha contribuito positivamente alla tua giornata\n3. 1 sfida che ti ha fatto crescere\n\nRegole:\n- Sii specifico (non generico)\n- Cerca cose nuove ogni giorno\n- Non ripetere le stesse cose\n\nAlla fine delle 2 settimane, rileggi tutto e nota i pattern.',
  'Diario di 14 giorni di gratitudine + sintesi dei pattern',
  '["È stato facile trovare motivi di gratitudine?", "Cosa è cambiato nella tua prospettiva?", "Continuerai questa pratica?"]'::jsonb,
  true, 24
),
(
  gen_random_uuid(), 1, 25,
  'Esprimere Gratitudine',
  'Trasforma la gratitudine in comunicazione',
  'gratitudine',
  'azione', 'base', 30, 'Giugno',
  'La gratitudine ha più impatto quando viene espressa. Questa settimana la comunicherai attivamente.',
  'Scrivi 5 messaggi di gratitudine a persone del lavoro:\n\n1. Qualcuno che ti ha aiutato di recente\n2. Qualcuno che spesso dai per scontato\n3. Qualcuno che fa un lavoro "invisibile"\n4. Qualcuno che ti ha insegnato qualcosa\n5. Qualcuno che ha creduto in te\n\nOgni messaggio deve:\n- Essere specifico su cosa hanno fatto\n- Spiegare l''impatto su di te\n- Essere genuino, non formale\n\nPuoi mandarli via email, messaggio, o dirlo di persona.',
  '5 messaggi di gratitudine inviati + reazioni ricevute',
  '["Come ti sei sentito a scrivere questi messaggi?", "Quali reazioni ti hanno sorpreso?", "Chi altro meriterebbe gratitudine?"]'::jsonb,
  true, 25
),
(
  gen_random_uuid(), 1, 26,
  'Review Secondo Trimestre',
  'Valuta i tuoi progressi SENTIRE',
  'empatia',
  'analisi', 'intermedio', 60, 'Giugno',
  'È tempo di valutare i progressi nel pilastro SENTIRE delle ultime 13 settimane.',
  'Rivedi gli esercizi delle settimane 14-25.\n\nRispondi a:\n1. Come è cambiata la tua capacità di connetterti con gli altri?\n2. Quale esercizio ha avuto più impatto?\n3. In quali situazioni riesci ad essere più empatico?\n4. Dove fai ancora fatica?\n\nValuta il tuo progresso (1-10):\n- Empatia\n- Intelligenza Emotiva\n- Ascolto Attivo\n- Compassione\n- Fiducia\n- Gratitudine\n\nIdentifica 2 pratiche da mantenere.',
  'Report trimestrale + valutazioni + 2 pratiche da continuare',
  '["Cosa è migliorato di più?", "Come hanno notato gli altri il cambiamento?", "Cosa integrerai nella tua routine?"]'::jsonb,
  true, 26
),

-- =====================================================
-- MESE 7: PENSARE - Visione e Pensiero Critico (Sett. 27-30)
-- =====================================================
(
  gen_random_uuid(), 1, 27,
  'Visione a 3 Anni',
  'Definisci dove vuoi essere',
  'visione-strategica',
  'pianificazione', 'intermedio', 60, 'Luglio',
  'I leader visionari sanno dove stanno andando. Creerai una visione chiara del tuo futuro professionale.',
  'Immagina di essere 3 anni nel futuro e tutto è andato perfettamente.\n\nDescrivi in dettaglio:\n\n1. RUOLO: Che posizione hai? Che responsabilità?\n2. IMPATTO: Quale differenza stai facendo?\n3. TEAM: Con chi lavori? Come sono le relazioni?\n4. COMPETENZE: Cosa sai fare che oggi non sai?\n5. STILE: Come ti descrivono gli altri come leader?\n6. VITA: Come bilanci lavoro e vita personale?\n\nPoi identifica:\n- 3 milestone per arrivarci\n- Il primo passo da fare questo mese',
  'Documento di visione a 3 anni + 3 milestone + primo passo',
  '["Questa visione ti entusiasma?", "È realistica?", "Cosa ti manca per arrivarci?"]'::jsonb,
  true, 27
),
(
  gen_random_uuid(), 1, 28,
  'Devil''s Advocate',
  'Sfida le tue convinzioni',
  'pensiero-critico',
  'sfida', 'avanzato', 45, 'Luglio',
  'Il pensiero critico richiede di sfidare anche le proprie idee. Giocherai l''avvocato del diavolo contro te stesso.',
  'Identifica una decisione importante che hai preso recentemente o una convinzione forte che hai.\n\nOra, argomenta CONTRO di essa:\n\n1. Quali sono i punti deboli della tua posizione?\n2. Cosa direbbe qualcuno che non è d''accordo?\n3. Quali dati/fatti contraddicono la tua view?\n4. Cosa potrebbe andare storto?\n5. Quali alternative non hai considerato?\n\nScrivi un documento di 1 pagina che attacca la tua posizione.\n\nPoi rifletti: la tua posizione è ancora valida? Va modificata?',
  'Documento "contro" la tua decisione + riflessione finale + eventuali modifiche',
  '["È stato difficile argomentare contro te stesso?", "Hai trovato punti validi?", "Cambierai qualcosa?"]'::jsonb,
  true, 28
),
(
  gen_random_uuid(), 1, 29,
  'Analisi delle Assunzioni',
  'Scopri cosa dai per scontato',
  'pensiero-critico',
  'analisi', 'intermedio', 40, 'Luglio',
  'Molte decisioni sbagliate derivano da assunzioni non verificate. Smaschererai le tue assunzioni nascoste.',
  'Prendi un progetto o iniziativa corrente.\n\nFai una lista di TUTTE le assunzioni che stai facendo:\n\n1. Sul mercato/clienti\n2. Sul team/risorse\n3. Sulla timeline\n4. Sulla tecnologia/strumenti\n5. Sui competitor\n6. Sul budget\n7. Sul supporto management\n\nPer ogni assunzione:\n- È un FATTO o una SUPPOSIZIONE?\n- Come puoi verificarla?\n- Cosa succede se è sbagliata?\n\nIdentifica le 3 assunzioni più rischiose e crea un piano per verificarle.',
  'Lista assunzioni + classificazione + piano verifica per top 3',
  '["Quante assunzioni stavi facendo senza rendertene conto?", "Quali sono più rischiose?", "Come cambierà il tuo approccio?"]'::jsonb,
  true, 29
),
(
  gen_random_uuid(), 1, 30,
  'Pensiero Sistemico',
  'Vedi le connessioni nascoste',
  'visione-strategica',
  'riflessione', 'avanzato', 50, 'Luglio',
  'I leader strategici vedono il sistema, non solo le parti. Allenerai la visione d''insieme.',
  'Scegli un problema o sfida attuale del tuo team/organizzazione.\n\nMappalo sistematicamente:\n\n1. Disegna tutti gli attori coinvolti (persone, team, sistemi)\n2. Traccia le connessioni tra loro\n3. Identifica i loop di feedback (positivi e negativi)\n4. Trova i "leverage points" - dove un piccolo cambiamento ha grande impatto\n5. Identifica conseguenze non intenzionali\n6. Considera effetti a breve vs lungo termine\n\nUsa un grande foglio o strumento di mapping.',
  'Mappa sistemica del problema + 3 leverage points + strategia proposta',
  '["Cosa hai visto che prima ti sfuggiva?", "Quali connessioni ti hanno sorpreso?", "Come userai questa prospettiva?"]'::jsonb,
  true, 30
),

-- =====================================================
-- MESE 8: PENSARE - Creatività e Adattabilità (Sett. 31-34)
-- =====================================================
(
  gen_random_uuid(), 1, 31,
  '20 Idee in 20 Minuti',
  'Allena il muscolo creativo',
  'creativita',
  'sfida', 'intermedio', 25, 'Agosto',
  'La creatività si allena con la quantità prima della qualità. Forzerai il tuo cervello a generare idee.',
  'Scegli un problema/sfida reale (lavorativo o personale).\n\nImposta un timer di 20 minuti.\n\nGenera 20 idee per risolverlo:\n\nRegole:\n- Non giudicare mentre generi\n- Quantità > qualità\n- Includi idee "pazze"\n- Non fermarti finché non arrivi a 20\n- Se blocchi, chiediti "E se fosse il contrario?"\n\nDopo i 20 minuti:\n1. Cerchia le 3 più promettenti\n2. Combina 2 idee diverse\n3. Sviluppa 1 idea in un piano d''azione',
  '20 idee + 3 selezionate + 1 piano d''azione',
  '["A che numero hai iniziato a faticare?", "Le idee migliori erano all''inizio o alla fine?", "Userai questa tecnica in futuro?"]'::jsonb,
  true, 31
),
(
  gen_random_uuid(), 1, 32,
  'Cambia una Routine',
  'Pratica l''adattabilità quotidiana',
  'adattabilita',
  'azione', 'base', 30, 'Agosto',
  'L''adattabilità si costruisce uscendo dalle abitudini. Modificherai deliberatamente le tue routine.',
  'Per una settimana, cambia UNA routine ogni giorno:\n\n- Giorno 1: Cambia il percorso per andare al lavoro\n- Giorno 2: Cambia l''ordine delle tue attività mattutine\n- Giorno 3: Mangia in un posto diverso/con persone diverse\n- Giorno 4: Usa uno strumento diverso per un''attività abituale\n- Giorno 5: Cambia il modo in cui inizi una riunione\n\nPer ogni cambiamento documenta:\n- Come ti sei sentito (disagio, curiosità, frustrazione?)\n- Cosa hai notato di nuovo\n- Cosa hai imparato',
  'Diario di 5 cambiamenti + osservazioni + lezioni',
  '["Quale cambiamento è stato più difficile?", "Hai scoperto qualcosa di meglio?", "Come reagisci normalmente al cambiamento?"]'::jsonb,
  true, 32
),
(
  gen_random_uuid(), 1, 33,
  'Prospettive Multiple',
  'Guarda il problema da angoli diversi',
  'creativita',
  'riflessione', 'avanzato', 45, 'Agosto',
  'La creatività nasce dal vedere le cose da prospettive diverse. Esplorerai un problema da molti punti di vista.',
  'Prendi una decisione difficile che devi prendere.\n\nAnalizzala da 6 prospettive diverse:\n\n1. 🎩 CAPPELLO BIANCO: Solo fatti e dati - cosa sai oggettivamente?\n2. ❤️ CAPPELLO ROSSO: Emozioni e intuizioni - cosa senti?\n3. ⚫ CAPPELLO NERO: Rischi e problemi - cosa può andare storto?\n4. 💛 CAPPELLO GIALLO: Benefici e opportunità - cosa può andare bene?\n5. 💚 CAPPELLO VERDE: Alternative creative - quali altre opzioni?\n6. 🔵 CAPPELLO BLU: Processo - come decidere?\n\nDedica 5 minuti a ogni prospettiva.',
  'Analisi a 6 cappelli + decisione finale + razionale',
  '["Quale prospettiva ti ha dato più insight?", "Quale tendi a ignorare?", "Come userai questa tecnica?"]'::jsonb,
  true, 33
),
(
  gen_random_uuid(), 1, 34,
  'Piano B, C e D',
  'Prepara alternative per ogni scenario',
  'adattabilita',
  'pianificazione', 'intermedio', 40, 'Agosto',
  'I leader adattabili hanno sempre alternative pronte. Svilupperai piani di contingenza.',
  'Prendi un progetto/iniziativa importante in corso.\n\nPer il tuo Piano A (quello attuale), identifica:\n- 3 cose che potrebbero andare storte\n\nPer ciascuna, sviluppa:\n\n📋 PIANO B: Se [cosa va storta], allora [azione alternativa]\n- Trigger: quando scatta?\n- Azioni: cosa fai?\n- Risorse: cosa ti serve?\n\nPoi crea un PIANO C e PIANO D per gli scenari peggiori.\n\nCondividi i piani con il tuo team.',
  'Documento con Piano A + B + C + D per un progetto reale',
  '["Ti senti più preparato?", "Hai condiviso i piani con il team?", "Userai questo approccio per altri progetti?"]'::jsonb,
  true, 34
),

-- =====================================================
-- MESE 9: PENSARE - Apprendimento e Problem Solving (Sett. 35-39)
-- =====================================================
(
  gen_random_uuid(), 1, 35,
  'Impara Qualcosa di Nuovo',
  'Mettiti nei panni del principiante',
  'apprendimento-continuo',
  'sfida', 'base', 60, 'Settembre',
  'Per mantenere l''umiltà e la curiosità, ogni leader dovrebbe regolarmente imparare cose nuove. Tornerai studente.',
  'Scegli qualcosa di completamente nuovo da imparare questa settimana:\n\nPuò essere:\n- Una skill tecnica (es. base di programmazione)\n- Una lingua (primi rudimenti)\n- Uno strumento nuovo\n- Un hobby completamente diverso\n\nDedica almeno 3 ore totali questa settimana.\n\nDocumenta:\n- Cosa hai scelto e perché\n- Come ti sei sentito da principiante\n- Cosa hai imparato sul processo di apprendimento\n- Come questa esperienza influenza la tua empatia verso chi impara',
  'Report dell''apprendimento + riflessioni sull''essere principiante',
  '["Come ti sei sentito a non essere competente?", "Cosa hai imparato sull''imparare?", "Come tratterai diversamente chi sta imparando?"]'::jsonb,
  true, 35
),
(
  gen_random_uuid(), 1, 36,
  'Insegna per Imparare',
  'Consolida le tue conoscenze insegnando',
  'apprendimento-continuo',
  'azione', 'intermedio', 45, 'Settembre',
  'Il modo migliore per imparare è insegnare. Condividerai le tue conoscenze con altri.',
  'Questa settimana, insegna qualcosa a qualcuno:\n\n1. Scegli un argomento che conosci bene\n2. Identifica qualcuno che potrebbe beneficiarne\n3. Prepara una "mini-lezione" (15-30 minuti)\n4. Conduci la sessione\n5. Chiedi feedback\n\nMentre prepari e insegni, nota:\n- Quali lacune scopri nella tua conoscenza?\n- Cosa devi semplificare?\n- Quali domande non sai rispondere?\n\nUsa queste lacune per approfondire.',
  'Piano della lezione + feedback ricevuto + lacune identificate + piano di studio',
  '["Cosa hai scoperto di non sapere bene?", "Come è andata la sessione?", "Cosa insegnerai prossimamente?"]'::jsonb,
  true, 36
),
(
  gen_random_uuid(), 1, 37,
  'Root Cause Analysis',
  'Vai alla radice dei problemi',
  'problem-solving',
  'analisi', 'avanzato', 50, 'Settembre',
  'I bravi problem solver non si fermano ai sintomi. Userai tecniche per trovare la vera causa.',
  'Prendi un problema ricorrente nel tuo team/lavoro.\n\nApplica il metodo dei "5 Perché":\n\n1. Problema: [descrivi il problema]\n2. Perché succede? → [risposta 1]\n3. Perché [risposta 1]? → [risposta 2]\n4. Perché [risposta 2]? → [risposta 3]\n5. Perché [risposta 3]? → [risposta 4]\n6. Perché [risposta 4]? → [ROOT CAUSE]\n\nPoi usa il diagramma "Fishbone":\n- Categorie: Persone, Processi, Tecnologia, Ambiente\n- Per ogni categoria, identifica cause possibili\n\nIdentifica la root cause e proponi una soluzione.',
  'Analisi 5 Perché + Fishbone diagram + root cause + soluzione proposta',
  '["La root cause ti ha sorpreso?", "È diversa da quella che pensavi?", "Come implementerai la soluzione?"]'::jsonb,
  true, 37
),
(
  gen_random_uuid(), 1, 38,
  'Decisione con Dati',
  'Basa le decisioni su evidenze',
  'problem-solving',
  'pianificazione', 'intermedio', 45, 'Settembre',
  'Le decisioni migliori sono basate su dati. Praticherai il decision-making basato su evidenze.',
  'Prendi una decisione che devi prendere.\n\nINVECE di decidere d''istinto:\n\n1. DEFINISCI i criteri di decisione\n   - Cosa renderebbe questa decisione un successo?\n   - Quali metriche userai?\n\n2. RACCOGLI dati\n   - Quali dati ti servono?\n   - Dove li trovi?\n   - Raccogli almeno 3 fonti\n\n3. ANALIZZA\n   - Cosa dicono i dati?\n   - Ci sono pattern?\n   - Cosa è incerto?\n\n4. DECIDI\n   - Basandoti sui dati, qual è la scelta migliore?\n   - Documenta il razionale',
  'Framework decisionale compilato + dati raccolti + decisione con razionale',
  '["I dati hanno confermato o cambiato la tua intuizione?", "Quali dati sono stati più utili?", "Userai questo approccio regolarmente?"]'::jsonb,
  true, 38
),
(
  gen_random_uuid(), 1, 39,
  'Review Terzo Trimestre',
  'Valuta i tuoi progressi PENSARE',
  'pensiero-critico',
  'analisi', 'intermedio', 60, 'Settembre',
  'È tempo di valutare i progressi nel pilastro PENSARE.',
  'Rivedi gli esercizi delle settimane 27-38.\n\nRispondi a:\n1. Come è cambiato il tuo modo di pensare ai problemi?\n2. Sei più strategico nelle decisioni?\n3. Quale strumento/tecnica userai di più?\n4. Dove devi ancora migliorare?\n\nValuta il tuo progresso (1-10):\n- Visione Strategica\n- Pensiero Critico\n- Creatività\n- Adattabilità\n- Apprendimento Continuo\n- Problem Solving\n\nIdentifica 2 tecniche da integrare nella routine.',
  'Report trimestrale + valutazioni + 2 tecniche da integrare',
  '["Qual è il cambiamento più significativo?", "Cosa userai di più?", "Come condividerai questi strumenti con il team?"]'::jsonb,
  true, 39
),

-- =====================================================
-- MESE 10: AGIRE - Decisionalità e Comunicazione (Sett. 40-43)
-- =====================================================
(
  gen_random_uuid(), 1, 40,
  'Decisione Veloce',
  'Pratica la decisionalità sotto pressione',
  'decisionalita',
  'sfida', 'avanzato', 35, 'Ottobre',
  'I leader devono saper decidere anche con informazioni incomplete. Allenerai la decisionalità.',
  'Questa settimana, per OGNI decisione piccola/media:\n\n1. Imposta un timer di 2 minuti\n2. Decidi prima che scada\n3. Non ripensarci dopo\n\nTieni traccia:\n- Quante decisioni hai preso\n- Quanto tempo normalmente impiegheresti\n- Qualità delle decisioni rapide vs solite\n\nRegola: puoi "comprare" tempo extra solo per decisioni con impatto > 10.000€ o che impattano più di 5 persone.\n\nObiettivo: minimo 10 decisioni rapide questa settimana.',
  'Log di 10+ decisioni rapide + tempi + qualità percepita',
  '["Le decisioni rapide erano peggiori?", "Quanto tempo risparmi?", "Cosa ti impedisce normalmente di decidere velocemente?"]'::jsonb,
  true, 40
),
(
  gen_random_uuid(), 1, 41,
  'Comunicazione Chiara',
  'Elimina ambiguità dai tuoi messaggi',
  'comunicazione',
  'azione', 'base', 30, 'Ottobre',
  'La comunicazione efficace è chiara e diretta. Lavorerai sulla chiarezza dei tuoi messaggi.',
  'Per una settimana, prima di ogni comunicazione importante (email, messaggio, riunione):\n\n1. Scrivi in UNA frase cosa vuoi che l''altro CAPISCA\n2. Scrivi in UNA frase cosa vuoi che l''altro FACCIA\n3. Rimuovi tutto ciò che non serve a questi obiettivi\n4. Chiedi "Un bambino di 10 anni capirebbe?"\n5. Se no, semplifica\n\nApplica a:\n- Almeno 5 email importanti\n- Almeno 2 presentazioni/riunioni\n\nRaccogli feedback: "È stato chiaro?"',
  'Prima/dopo di 5+ comunicazioni + feedback ricevuto',
  '["Quanto erano più corte le versioni semplificate?", "Le persone hanno capito meglio?", "Cosa elimini più spesso?"]'::jsonb,
  true, 41
),
(
  gen_random_uuid(), 1, 42,
  'Conversazioni Difficili',
  'Affronta dialoghi che eviti',
  'comunicazione',
  'sfida', 'avanzato', 50, 'Ottobre',
  'I leader devono saper affrontare conversazioni scomode. Ne affronterai una che stai evitando.',
  'Identifica UNA conversazione difficile che stai rimandando:\n- Feedback negativo da dare\n- Conflitto da risolvere\n- Richiesta scomoda da fare\n- Verità da comunicare\n\nPREPARAZIONE:\n1. Chiarisci l''obiettivo\n2. Anticipa le reazioni\n3. Prepara come aprire\n4. Pianifica come gestire emozioni intense\n5. Definisci il "successo"\n\nESECUZIONE:\n- Scegli momento e luogo appropriati\n- Conduci la conversazione\n\nDOPO:\n- Documenta cosa è successo\n- Cosa hai imparato',
  'Piano conversazione + esecuzione + risultati + lezioni',
  '["Come ti sei sentito prima, durante, dopo?", "È andata come ti aspettavi?", "Quale altra conversazione affronterai?"]'::jsonb,
  true, 42
),
(
  gen_random_uuid(), 1, 43,
  'La Decisione da Leader',
  'Prendi una decisione impopolare',
  'decisionalita',
  'sfida', 'avanzato', 45, 'Ottobre',
  'A volte i leader devono prendere decisioni impopolari. Praticherai il coraggio decisionale.',
  'Identifica una decisione che sai essere giusta ma che:\n- Non piacerà a tutti\n- Ti espone a critiche\n- Richiede coraggio\n\nPuò essere:\n- Dire no a una richiesta popolare\n- Allocare risorse diversamente\n- Cambiare direzione su un progetto\n- Dare priorità a qualcosa vs altro\n\nPROCESSO:\n1. Verifica che sia la cosa giusta da fare\n2. Prepara la comunicazione\n3. Prendi la decisione\n4. Comunica con trasparenza (anche il "perché")\n5. Gestisci le reazioni\n6. Rimani fermo ma aperto al feedback',
  'Decisione presa + comunicazione + reazioni + come hai gestito',
  '["È stata dura?", "Come hai gestito le resistenze?", "Ti senti un leader più forte?"]'::jsonb,
  true, 43
),

-- =====================================================
-- MESE 11: AGIRE - Delega e Motivazione (Sett. 44-47)
-- =====================================================
(
  gen_random_uuid(), 1, 44,
  'Audit della Delega',
  'Analizza cosa dovresti delegare',
  'delega',
  'analisi', 'intermedio', 40, 'Novembre',
  'Molti leader non delegano abbastanza. Analizzerai dove potresti delegare di più.',
  'Fai un elenco di TUTTO quello che fai in una settimana tipica.\n\nPer ogni attività, chiediti:\n\n1. Solo IO posso farlo? (sì/no)\n2. È il miglior uso del mio tempo? (sì/no)\n3. Qualcun altro potrebbe imparare a farlo? (sì/no)\n4. Delegarlo aiuterebbe a sviluppare altri? (sì/no)\n\nCategorizza:\n- 🔴 DEVO fare io\n- 🟡 POTREI delegare\n- 🟢 DEVO delegare\n\nPer le attività 🟢, identifica A CHI delegare e QUANDO.',
  'Lista attività + categorizzazione + piano di delega per 3+ attività',
  '["Quanto del tuo tempo è su attività delegabili?", "Cosa ti impedisce di delegare?", "A chi delegherai per primo?"]'::jsonb,
  true, 44
),
(
  gen_random_uuid(), 1, 45,
  'Delega Efficace',
  'Pratica la delega strutturata',
  'delega',
  'azione', 'intermedio', 45, 'Novembre',
  'Delegare bene è un''arte. Praticherai la delega strutturata.',
  'Scegli un''attività da delegare questa settimana.\n\nSegui questo processo:\n\n1. PREPARA\n   - Cosa deleghi esattamente?\n   - Qual è il risultato atteso?\n   - Quali sono i vincoli/limiti?\n\n2. SCEGLI\n   - Chi è la persona giusta?\n   - Ha le competenze? Se no, cosa serve?\n\n3. COMUNICA\n   - Spiega il COSA e il PERCHÉ\n   - Chiarisci le aspettative\n   - Definisci check-points\n   - Offri supporto ma non controllo\n\n4. FOLLOW-UP\n   - Monitora senza micro-management\n   - Dai feedback costruttivo\n   - Celebra il successo',
  'Attività delegata + processo seguito + risultato + feedback dato',
  '["È stato difficile lasciare il controllo?", "Come è andata?", "Cosa hai imparato sulla delega?"]'::jsonb,
  true, 45
),
(
  gen_random_uuid(), 1, 46,
  'Motivazione Personalizzata',
  'Scopri cosa motiva ogni membro del team',
  'motivazione',
  'analisi', 'intermedio', 50, 'Novembre',
  'Le persone sono motivate da cose diverse. Mapperai i motivatori del tuo team.',
  'Per ogni membro del tuo team (o 5 collaboratori chiave):\n\nINTERVISTA (15 min ciascuno):\n1. Cosa ti piace di più del tuo lavoro?\n2. Cosa ti frustra?\n3. Qual è il tuo sogno professionale?\n4. Come preferisci ricevere feedback?\n5. Cosa ti motiva a dare il massimo?\n6. Cosa posso fare per supportarti meglio?\n\nCrea una "scheda motivazionale" per ciascuno.\n\nIdentifica 1 azione concreta per motivare meglio ciascuno.',
  'Schede motivazionali per 5+ persone + 1 azione per ciascuno',
  '["Cosa ti ha sorpreso?", "Le motivazioni sono diverse da quello che pensavi?", "Come userai queste informazioni?"]'::jsonb,
  true, 46
),
(
  gen_random_uuid(), 1, 47,
  'Ispira con lo Scopo',
  'Collega il lavoro a uno scopo più grande',
  'motivazione',
  'azione', 'avanzato', 40, 'Novembre',
  'Le persone sono motivate dallo scopo. Aiuterai il team a vedere il significato del loro lavoro.',
  'Questa settimana, in una riunione di team:\n\n1. Condividi la VISIONE:\n   - Perché esistiamo come team?\n   - Quale differenza facciamo?\n   - Chi impatta il nostro lavoro?\n\n2. COLLEGA al lavoro quotidiano:\n   - Come ogni ruolo contribuisce?\n   - Mostra l''impatto concreto\n   - Usa esempi reali\n\n3. ASCOLTA:\n   - Chiedi al team cosa li motiva\n   - Cosa vorrebbero che fosse diverso?\n\n4. CO-CREA:\n   - Come possiamo aumentare il significato?\n   - Quali piccoli cambiamenti?\n\nDocumenta la sessione.',
  'Agenda e output della riunione + feedback del team + azioni decise',
  '["Come ha reagito il team?", "Cosa li motiva di più?", "Cosa cambierai?"]'::jsonb,
  true, 47
),

-- =====================================================
-- MESE 12: AGIRE - Accountability ed Execution (Sett. 48-52)
-- =====================================================
(
  gen_random_uuid(), 1, 48,
  'Responsabilità Totale',
  'Pratica l''accountability radicale',
  'accountability',
  'sfida', 'avanzato', 35, 'Dicembre',
  'L''accountability significa assumersi la responsabilità totale, anche di ciò che non controlli direttamente.',
  'Per una settimana, applica l''"Accountability Radicale":\n\nOgni volta che qualcosa va storto, INVECE di:\n- Dare la colpa ad altri\n- Citare fattori esterni\n- Giustificare\n\nChiediti:\n1. Cosa avrei potuto fare per prevenirlo?\n2. Quali segnali ho ignorato?\n3. Come posso risolvere ORA?\n4. Come posso evitare che si ripeta?\n\nDocumenta almeno 5 situazioni e le tue risposte "accountable".',
  'Diario di 5 situazioni + risposte accountable + lezioni',
  '["È stato difficile non dare la colpa?", "Cosa hai scoperto sul tuo ruolo?", "Come cambia il tuo potere?"]'::jsonb,
  true, 48
),
(
  gen_random_uuid(), 1, 49,
  'From Plan to Action',
  'Trasforma i piani in azioni concrete',
  'execution',
  'pianificazione', 'intermedio', 45, 'Dicembre',
  'Molti piani falliscono nell''esecuzione. Praticherai la traduzione di strategie in azioni.',
  'Prendi un piano/progetto che sta procedendo lentamente.\n\nApplica il framework di execution:\n\n1. CLARIFCA: L''obiettivo è SMART?\n   - Specifico, Misurabile, Achievable, Relevant, Time-bound?\n\n2. SCOMPONI: Quali sono i prossimi 5 passi concreti?\n   - Azioni specifiche (non vaghe)\n   - Chi fa cosa\n   - Entro quando\n\n3. ELIMINA OSTACOLI:\n   - Cosa sta bloccando?\n   - Come rimuovere?\n\n4. CREA URGENZA:\n   - Perché ADESSO?\n   - Cosa succede se ritardiamo?\n\n5. MONITORA:\n   - Come traccerai i progressi?\n   - Check-point settimanali',
  'Piano rivisto + 5 next actions + responsabili + timeline + sistema di monitoraggio',
  '["Cosa bloccava l''esecuzione?", "Il piano era abbastanza specifico?", "Cosa farai diversamente la prossima volta?"]'::jsonb,
  true, 49
),
(
  gen_random_uuid(), 1, 50,
  'Weekly Review',
  'Crea la tua routine di accountability',
  'accountability',
  'pianificazione', 'base', 30, 'Dicembre',
  'I leader efficaci hanno routine di review. Creerai la tua pratica settimanale.',
  'Progetta la TUA Weekly Review (30-60 min ogni settimana):\n\n1. REVIEW (guardare indietro):\n   - Cosa ho completato?\n   - Cosa non ho completato? Perché?\n   - Quali vittorie celebrare?\n   - Quali lezioni?\n\n2. PLAN (guardare avanti):\n   - Top 3 priorità prossima settimana?\n   - Quali decisioni devo prendere?\n   - Chi devo sentire?\n   - Cosa potrebbe andare storto?\n\n3. ALIGN:\n   - Sono allineato ai miei obiettivi a 3 mesi?\n   - Cosa devo aggiustare?\n\nFai la prima review questa settimana.',
  'Template della tua Weekly Review + prima review completata',
  '["Quanto tempo hai dedicato?", "Cosa hai scoperto?", "Quando la farai ogni settimana?"]'::jsonb,
  true, 50
),
(
  gen_random_uuid(), 1, 51,
  'Sprint Finale',
  'Concludi qualcosa di importante',
  'execution',
  'sfida', 'avanzato', 60, 'Dicembre',
  'L''execution si dimostra completando. Questa settimana porterai a termine qualcosa di significativo.',
  'Identifica UN progetto/obiettivo importante che puoi COMPLETARE questa settimana:\n\nDeve essere:\n- Rimandato da tempo\n- Significativo (non banale)\n- Completabile in una settimana con focus\n\nEsegui uno "Sprint":\n\n1. Lunedì: Pianifica le azioni giorno per giorno\n2. Martedì-Giovedì: Esegui con focus totale\n3. Venerdì: Completa e celebra\n\nBlocca tempo nel calendario.\nElimina distrazioni.\nChiedi aiuto se serve.\n\nL''obiettivo è COMPLETARE, non "lavorarci".',
  'Progetto completato + come ci sei riuscito + cosa hai imparato sull''execution',
  '["Ce l''hai fatta?", "Cosa ti ha aiutato a completare?", "Cosa applicherai in futuro?"]'::jsonb,
  true, 51
),
(
  gen_random_uuid(), 1, 52,
  'Il Bilancio del Leader',
  'Review finale del tuo anno di crescita',
  'autenticita',
  'analisi', 'intermedio', 90, 'Dicembre',
  'È il momento di guardare indietro all''intero anno di crescita e pianificare il prossimo.',
  'PARTE 1: REVIEW ANNO\n\nRivisita tutti i 51 esercizi. Per ciascun pilastro valuta 1-10:\n\n🏛️ ESSERE:\n- Autenticità, Integrità, Consapevolezza, Presenza, Resilienza, Umiltà\n\n💗 SENTIRE:\n- Empatia, IE, Ascolto, Compassione, Fiducia, Gratitudine\n\n🧠 PENSARE:\n- Visione, Pensiero Critico, Creatività, Adattabilità, Apprendimento, Problem Solving\n\n⚡ AGIRE:\n- Decisionalità, Comunicazione, Delega, Motivazione, Accountability, Execution\n\nPARTE 2: TOP INSIGHTS\n- 3 cose più importanti che hai imparato\n- 3 cambiamenti più significativi\n- 3 aree da continuare a sviluppare\n\nPARTE 3: NEXT YEAR\n- Come continuerai a crescere?\n- Quale supporto ti serve?\n- Come condividerai con altri?',
  'Bilancio completo + autovalutazione 24 caratteristiche + piano per il prossimo anno',
  '["Di cosa sei più orgoglioso?", "Cosa è ancora difficile?", "Come sei cambiato come leader?"]'::jsonb,
  true, 52
)

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICA
-- =====================================================
-- SELECT COUNT(*) as totale FROM exercises;
-- SELECT week_number, title FROM exercises ORDER BY week_number;
