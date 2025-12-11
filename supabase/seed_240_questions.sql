-- =====================================================
-- VITAEOLOGY - SEED COMPLETO DATABASE
-- 24 Caratteristiche del Libro + 240 Domande
-- =====================================================

-- STEP 1: Pulisci tabelle esistenti
DELETE FROM assessment_questions;
DELETE FROM characteristics;

-- STEP 2: Inserisci le 24 CARATTERISTICHE DEL LIBRO
-- PILASTRO I: VISIONE (1-6)
INSERT INTO characteristics (id, book_id, pillar, name, description, order_index) VALUES
(1, 1, 'VISIONE', 'Motivazione', 'Il fuoco interno che ti spinge ad agire', 1),
(2, 1, 'VISIONE', 'Coraggio', 'Dire verità scomode quando conta', 2),
(3, 1, 'VISIONE', 'Dedizione agli Obiettivi', 'Perseveranza oltre gli ostacoli', 3),
(4, 1, 'VISIONE', 'Conoscenza', 'Comprensione profonda rispetto a informazione superficiale', 4),
(5, 1, 'VISIONE', 'Onestà', 'Integrità anche quando costa', 5),
(6, 1, 'VISIONE', 'Ottimismo', 'Vedere possibilità rispetto a focalizzare problemi', 6);

-- PILASTRO II: AZIONE (7-12)
INSERT INTO characteristics (id, book_id, pillar, name, description, order_index) VALUES
(7, 1, 'AZIONE', 'Capacità di Giudicare', 'Valutare fatti rispetto a seguire ideologie', 7),
(8, 1, 'AZIONE', 'Entusiasmo', 'Energia orientata a impatto reale', 8),
(9, 1, 'AZIONE', 'Voglia di Correre Rischi', 'Rischi calcolati rispetto a temerità/paralisi', 9),
(10, 1, 'AZIONE', 'Energia Dinamica', 'Intensità sostenibile rispetto a burnout/apatia', 10),
(11, 1, 'AZIONE', 'Intraprendenza', 'Iniziativa senza aspettare permesso', 11),
(12, 1, 'AZIONE', 'Persuasione', 'Influenzare attraverso comprensione', 12);

-- PILASTRO III: RELAZIONI (13-18)
INSERT INTO characteristics (id, book_id, pillar, name, description, order_index) VALUES
(13, 1, 'RELAZIONI', 'Socievolezza', 'Connessione autentica rispetto a networking strumentale', 13),
(14, 1, 'RELAZIONI', 'Capacità di Comunicare', 'Chiarezza rispetto a confusione/retorica', 14),
(15, 1, 'RELAZIONI', 'Pazienza', 'Tempi naturali rispetto a spinte improduttive', 15),
(16, 1, 'RELAZIONI', 'Percezione', 'Leggere situazioni rispetto a proiettare aspettative', 16),
(17, 1, 'RELAZIONI', 'Perfezionismo', 'Eccellenza rispetto a rallentamento da perfezione', 17),
(18, 1, 'RELAZIONI', 'Senso dell''Umorismo', 'Leggerezza rispetto a drammatizzazione', 18);

-- PILASTRO IV: ADATTAMENTO (19-24)
INSERT INTO characteristics (id, book_id, pillar, name, description, order_index) VALUES
(19, 1, 'ADATTAMENTO', 'Versatilità', 'Molteplici competenze integrate', 19),
(20, 1, 'ADATTAMENTO', 'Adattabilità', 'Flessibilità intelligente rispetto a rigidità/caos', 20),
(21, 1, 'ADATTAMENTO', 'Curiosità', 'Esplorazione profonda rispetto a distrazione superficiale', 21),
(22, 1, 'ADATTAMENTO', 'Individualismo', 'Pensiero indipendente rispetto a conformismo/ribellione', 22),
(23, 1, 'ADATTAMENTO', 'Idealismo', 'Visione etica chiara rispetto a cinismo/utopismo', 23),
(24, 1, 'ADATTAMENTO', 'Immaginazione', 'Visione concreta rispetto a fantasia sterile', 24);

-- =====================================================
-- STEP 3: Inserisci le 240 DOMANDE
-- =====================================================

-- CARATTERISTICA #01: MOTIVAZIONE (characteristic_id = 1)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 1, 'Quando manca il riconoscimento esterno, il mio entusiasmo per il progetto svanisce rapidamente', 'inverse', 1),
(1, 1, 'Mi trovo spesso a lavorare duramente solo quando c''è una scadenza o una pressione esterna', 'inverse', 2),
(1, 1, 'Se nessuno nota il mio lavoro, tendo a perdere interesse', 'inverse', 3),
(1, 1, 'La mia produttività dipende fortemente dall''umore della giornata', 'inverse', 4),
(1, 1, 'Quando inizio un nuovo progetto con entusiasmo, riesco a mantenerlo solo nelle prime settimane', 'inverse', 5),
(1, 1, 'Mi capita di lavorare su qualcosa anche di notte, dimenticando l''ora, perché mi appassiona', 'direct', 6),
(1, 1, 'Anche senza applausi o riconoscimenti, continuo a dedicarmi ai miei progetti', 'direct', 7),
(1, 1, 'La mia spinta a lavorare viene da dentro, non da premi o minacce esterne', 'direct', 8),
(1, 1, 'Quando sono da solo a lavorare su qualcosa che mi interessa, la mia energia aumenta invece di diminuire', 'direct', 9),
(1, 1, 'Trovo motivazione nel lavoro stesso, non solo nei risultati o nei complimenti', 'direct', 10);

-- CARATTERISTICA #02: CORAGGIO (characteristic_id = 2)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 2, 'Quando devo prendere una decisione importante con un risultato incerto, tendo a rimandarla', 'inverse', 11),
(1, 2, 'Preferisco non esporre le mie idee se penso che possano essere criticate', 'inverse', 12),
(1, 2, 'Di fronte a un''opportunità rischiosa, la paura mi blocca anche quando so che potrebbe essere giusta', 'inverse', 13),
(1, 2, 'Evito le conversazioni difficili anche quando so che sarebbero necessarie', 'inverse', 14),
(1, 2, 'Quando un progetto ha un''alta probabilità di fallimento, preferisco non provarlo affatto', 'inverse', 15),
(1, 2, 'Prendo decisioni difficili anche quando non ho certezze sul risultato', 'direct', 16),
(1, 2, 'Espongo le mie idee anche se so che potrebbero essere impopolari', 'direct', 17),
(1, 2, 'Affronto conversazioni scomode quando necessario, senza rimandarle', 'direct', 18),
(1, 2, 'La paura non mi impedisce di agire quando riconosco che è la cosa giusta da fare', 'direct', 19),
(1, 2, 'Accetto rischi calcolati anche se l''incertezza mi fa paura', 'direct', 20);

-- CARATTERISTICA #03: DEDIZIONE AGLI OBIETTIVI (characteristic_id = 3)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 3, 'Cambio spesso obiettivi quando incontro le prime difficoltà', 'inverse', 21),
(1, 3, 'Ho molti progetti iniziati e pochi completati', 'inverse', 22),
(1, 3, 'Quando qualcosa diventa difficile, tendo a cercare alternative più facili', 'inverse', 23),
(1, 3, 'Gli ostacoli mi fanno dubitare se l''obiettivo valga davvero la pena', 'inverse', 24),
(1, 3, 'Mi distraggo facilmente con nuove opportunità abbandonando quelle vecchie', 'inverse', 25),
(1, 3, 'Quando mi impegno su un obiettivo, continuo fino al completamento nonostante gli ostacoli', 'direct', 26),
(1, 3, 'Le difficoltà rafforzano la mia determinazione invece di indebolirla', 'direct', 27),
(1, 3, 'Porto a termine i progetti che inizio, anche quando il percorso si complica', 'direct', 28),
(1, 3, 'Resto fedele ai miei obiettivi anche quando emergono alternative attraenti', 'direct', 29),
(1, 3, 'Gli ostacoli sono parte del percorso, non ragioni per abbandonare', 'direct', 30);

-- CARATTERISTICA #04: CONOSCENZA (characteristic_id = 4)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 4, 'Penso di sapere già abbastanza sul mio campo senza bisogno di studiare ancora', 'inverse', 31),
(1, 4, 'Evito di approfondire argomenti che sembrano complessi o difficili', 'inverse', 32),
(1, 4, 'Quando qualcuno menziona un concetto che non conosco, fingo di sapere invece di chiedere', 'inverse', 33),
(1, 4, 'Non dedico tempo regolare ad ampliare le mie competenze professionali', 'inverse', 34),
(1, 4, 'Considero lo studio come qualcosa che si fa a scuola, non nel lavoro quotidiano', 'inverse', 35),
(1, 4, 'Studio regolarmente argomenti del mio campo anche quando non è richiesto', 'direct', 36),
(1, 4, 'Quando incontro un concetto nuovo, cerco attivamente di comprenderlo a fondo', 'direct', 37),
(1, 4, 'Dedico tempo costante ad ampliare le mie conoscenze professionali', 'direct', 38),
(1, 4, 'Chiedo spiegazioni quando non comprendo qualcosa, invece di fingere', 'direct', 39),
(1, 4, 'La curiosità mi spinge ad approfondire anche concetti complessi', 'direct', 40);

-- CARATTERISTICA #05: ONESTÀ (characteristic_id = 5)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 5, 'Quando faccio un errore importante, cerco di minimizzarlo o di trovare scuse', 'inverse', 41),
(1, 5, 'Preferisco non ammettere di aver sbagliato se posso evitarlo', 'inverse', 42),
(1, 5, 'Quando un problema è colpa mia, tendo a spostare l''attenzione su fattori esterni', 'inverse', 43),
(1, 5, 'Mi risulta difficile dire "ho sbagliato io" senza aggiungere giustificazioni', 'inverse', 44),
(1, 5, 'Proteggo la mia immagine anche quando significa non essere completamente sincero', 'inverse', 45),
(1, 5, 'Quando sbaglio, lo ammetto chiaramente senza cercare scuse', 'direct', 46),
(1, 5, 'Riconosco apertamente le mie responsabilità anche quando è scomodo', 'direct', 47),
(1, 5, 'Preferisco essere onesto sulla mia incompetenza piuttosto che fingere di sapere', 'direct', 48),
(1, 5, 'Ammetto i miei errori non per obbligo ma per integrità personale', 'direct', 49),
(1, 5, 'La mia reputazione si basa sull''onestà, non sull''apparire infallibile', 'direct', 50);

-- CARATTERISTICA #06: OTTIMISMO (characteristic_id = 6)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 6, 'Di fronte a una difficoltà, tendo a vedere prima cosa può andare male', 'inverse', 51),
(1, 6, 'Quando un progetto ha problemi, penso subito che fallirà', 'inverse', 52),
(1, 6, 'Mi concentro più sui rischi che sulle opportunità in una situazione nuova', 'inverse', 53),
(1, 6, 'Il mio primo pensiero di fronte a un cambiamento è spesso "questo non funzionerà"', 'inverse', 54),
(1, 6, 'Vedo gli ostacoli come conferme che qualcosa è impossibile', 'inverse', 55),
(1, 6, 'Di fronte a difficoltà, cerco prima le soluzioni possibili', 'direct', 56),
(1, 6, 'Riesco a vedere opportunità anche in situazioni problematiche', 'direct', 57),
(1, 6, 'Affronto i cambiamenti pensando "come posso far funzionare questo?"', 'direct', 58),
(1, 6, 'Gli ostacoli sono sfide da risolvere, non prove di impossibilità', 'direct', 59),
(1, 6, 'Mantengo fiducia nelle possibilità anche quando il percorso è difficile', 'direct', 60);

-- CARATTERISTICA #07: CAPACITÀ DI GIUDICARE (characteristic_id = 7)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 7, 'Quando devo decidere, mi baso spesso su impressioni iniziali senza verificare i fatti', 'inverse', 61),
(1, 7, 'Tendo a confermare le mie opinioni cercando solo informazioni che le supportano', 'inverse', 62),
(1, 7, 'Cambio raramente idea anche quando emergono nuove evidenze contrarie', 'inverse', 63),
(1, 7, 'Giudico situazioni e persone basandomi su preconcetti', 'inverse', 64),
(1, 7, 'Prendo decisioni prima di avere informazioni sufficienti', 'inverse', 65),
(1, 7, 'Cerco di comprendere i fatti prima di formare un giudizio', 'direct', 66),
(1, 7, 'Sono disposto a cambiare opinione quando le evidenze lo richiedono', 'direct', 67),
(1, 7, 'Considero diversi punti di vista prima di decidere', 'direct', 68),
(1, 7, 'Riconosco i miei preconcetti e cerco di verificarli', 'direct', 69),
(1, 7, 'Valuto situazioni con una mentalità aperta anche quando ho preferenze personali', 'direct', 70);

-- CARATTERISTICA #08: ENTUSIASMO (characteristic_id = 8)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 8, 'Il mio entusiasmo per un progetto dura solo le prime settimane', 'inverse', 71),
(1, 8, 'Trasmetto stanchezza al team invece di un''energia positiva', 'inverse', 72),
(1, 8, 'Faccio fatica a mostrare entusiasmo anche per progetti che ritengo importanti', 'inverse', 73),
(1, 8, 'La mia energia cala rapidamente quando il lavoro diventa routine', 'inverse', 74),
(1, 8, 'Tendo a vedere il lavoro quotidiano come un peso da sopportare', 'inverse', 75),
(1, 8, 'Riesco a mantenere un entusiasmo genuino anche nella fase esecutiva dei progetti', 'direct', 76),
(1, 8, 'La mia energia positiva influenza l''atmosfera del team', 'direct', 77),
(1, 8, 'Trovo aspetti stimolanti anche in compiti routinari', 'direct', 78),
(1, 8, 'L''entusiasmo per ciò che faccio è autentico e visibile', 'direct', 79),
(1, 8, 'Affronto il lavoro quotidiano con un''energia costruttiva', 'direct', 80);

-- CARATTERISTICA #09: VOGLIA DI CORRERE RISCHI (characteristic_id = 9)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 9, 'Evito decisioni dove il fallimento è una possibilità concreta', 'inverse', 81),
(1, 9, 'Preferisco risultati certi anche se limitati piuttosto che opportunità incerte', 'inverse', 82),
(1, 9, 'La paura di sbagliare mi blocca anche quando il rischio è calcolato', 'inverse', 83),
(1, 9, 'Rimpiango opportunità non colte per paura, ma continuo a evitare rischi', 'inverse', 84),
(1, 9, 'Aspetto che le situazioni siano sicure al 100% prima di agire', 'inverse', 85),
(1, 9, 'Accetto rischi calcolati quando l''opportunità lo giustifica', 'direct', 86),
(1, 9, 'Vedo il fallimento come una possibilità di apprendimento, non come una catastrofe', 'direct', 87),
(1, 9, 'Agisco su opportunità promettenti anche senza garanzie', 'direct', 88),
(1, 9, 'Imparo dai miei errori invece di evitare nuove prove', 'direct', 89),
(1, 9, 'Bilancio rischi e opportunità senza farmi paralizzare dalla paura', 'direct', 90);

-- CARATTERISTICA #10: ENERGIA DINAMICA (characteristic_id = 10)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 10, 'Aspetto che le cose accadano invece di farle accadere', 'inverse', 91),
(1, 10, 'Reagisco agli eventi invece di crearli proattivamente', 'inverse', 92),
(1, 10, 'Attendo che qualcuno prenda l''iniziativa prima di muovermi', 'inverse', 93),
(1, 10, 'La mia energia è reattiva: rispondo quando stimolato, non anticipo', 'inverse', 94),
(1, 10, 'Preferisco attendere sviluppi piuttosto che generarli', 'inverse', 95),
(1, 10, 'Prendo l''iniziativa senza aspettare che qualcuno mi dica di farlo', 'direct', 96),
(1, 10, 'Creo opportunità invece di attendere che si presentino', 'direct', 97),
(1, 10, 'La mia energia genera movimento, non solo risponde a esso', 'direct', 98),
(1, 10, 'Agisco per far accadere le cose, non solo per reagire', 'direct', 99),
(1, 10, 'Sono proattivo nella creazione di un cambiamento positivo', 'direct', 100);

-- CARATTERISTICA #11: INTRAPRENDENZA (characteristic_id = 11)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 11, 'Di fronte a un problema, aspetto che qualcuno mi dia la soluzione', 'inverse', 101),
(1, 11, 'Seguo procedure stabilite anche quando sono inefficienti', 'inverse', 102),
(1, 11, 'Non cerco alternative se il metodo standard non funziona', 'inverse', 103),
(1, 11, 'Preferisco che altri prendano decisioni su come risolvere problemi', 'inverse', 104),
(1, 11, 'Mi sento perso quando non ho istruzioni chiare su come procedere', 'inverse', 105),
(1, 11, 'Trovo soluzioni creative quando i metodi standard non funzionano', 'direct', 106),
(1, 11, 'Prendo l''iniziativa nella risoluzione dei problemi senza attendere istruzioni', 'direct', 107),
(1, 11, 'Cerco attivamente alternative quando un approccio non dà risultati', 'direct', 108),
(1, 11, 'Mi muovo autonomamente anche in assenza di procedure definite', 'direct', 109),
(1, 11, 'Genero soluzioni invece di attendere che altri le propongano', 'direct', 110);

-- CARATTERISTICA #12: PERSUASIONE (characteristic_id = 12)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 12, 'Quando voglio convincere qualcuno, insisto fino a che non cede', 'inverse', 111),
(1, 12, 'Uso tattiche di pressione o senso di colpa per ottenere il consenso', 'inverse', 112),
(1, 12, 'Presento solo gli aspetti che supportano la mia posizione nascondendo i problemi', 'inverse', 113),
(1, 12, 'Manipolo le informazioni per far sembrare la mia idea migliore di ciò che è', 'inverse', 114),
(1, 12, 'Vedo il disaccordo come un ostacolo da superare, non come un contributo', 'inverse', 115),
(1, 12, 'Presento idee mostrando onestamente vantaggi e svantaggi', 'direct', 116),
(1, 12, 'Cerco di comprendere le obiezioni invece di schiacciarle', 'direct', 117),
(1, 12, 'Persuado attraverso la forza dell''idea, non la pressione', 'direct', 118),
(1, 12, 'Rispetto il disaccordo come un''opportunità di migliorare la proposta', 'direct', 119),
(1, 12, 'La mia influenza nasce dalla credibilità, non dalla manipolazione', 'direct', 120);

-- CARATTERISTICA #13: SOCIEVOLEZZA (characteristic_id = 13)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 13, 'Preferisco lavorare da solo perché le relazioni professionali mi pesano', 'inverse', 121),
(1, 13, 'Evito eventi sociali di lavoro quando possibile', 'inverse', 122),
(1, 13, 'Le conversazioni informali con i colleghi mi sembrano tempo perso', 'inverse', 123),
(1, 13, 'Faccio fatica a creare rapporti che vadano oltre lo stretto necessario professionale', 'inverse', 124),
(1, 13, 'Vedo le relazioni come complicazioni più che risorse', 'inverse', 125),
(1, 13, 'Costruisco attivamente relazioni positive nell''ambiente professionale', 'direct', 126),
(1, 13, 'Investo tempo in connessioni significative con colleghi e collaboratori', 'direct', 127),
(1, 13, 'Partecipo volentieri a momenti di condivisione del team', 'direct', 128),
(1, 13, 'Vedo le relazioni come una risorsa preziosa, non come una distrazione', 'direct', 129),
(1, 13, 'Creo naturalmente un''atmosfera positiva intorno a me', 'direct', 130);

-- CARATTERISTICA #14: CAPACITÀ DI COMUNICARE (characteristic_id = 14)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 14, 'Parlo per vincere la discussione, non per raggiungere una comprensione', 'inverse', 131),
(1, 14, 'Interrompo gli altri perché ciò che devo dire è più importante', 'inverse', 132),
(1, 14, 'Uso gergo tecnico senza preoccuparmi se l''altro comprende', 'inverse', 133),
(1, 14, 'Quando spiego qualcosa, do per scontato che l''altro capisca al volo', 'inverse', 134),
(1, 14, 'Mi concentro su cosa dire dopo invece di ascoltare davvero', 'inverse', 135),
(1, 14, 'Comunico per creare una comprensione condivisa, non per prevalere', 'direct', 136),
(1, 14, 'Ascolto attentamente prima di rispondere', 'direct', 137),
(1, 14, 'Adatto il linguaggio a chi ho davanti per essere chiaro', 'direct', 138),
(1, 14, 'Verifico che il messaggio sia stato compreso come intendevo', 'direct', 139),
(1, 14, 'Vedo la comunicazione come un ponte, non come una competizione', 'direct', 140);

-- CARATTERISTICA #15: PAZIENZA (characteristic_id = 15)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 15, 'Quando qualcosa richiede tempo per svilupparsi, mi irrito e voglio forzare i risultati', 'inverse', 141),
(1, 15, 'Premo per avere tutto subito anche quando i tempi naturali sono più lunghi', 'inverse', 142),
(1, 15, 'Mi innervosisco quando le persone non capiscono immediatamente ciò che spiego', 'inverse', 143),
(1, 15, 'Abbandono progetti che non danno risultati rapidi', 'inverse', 144),
(1, 15, 'La mia frustrazione è visibile quando i processi sono lenti', 'inverse', 145),
(1, 15, 'Rispetto i tempi naturali di sviluppo di progetti e persone', 'direct', 146),
(1, 15, 'Comprendo che risultati di valore richiedono tempo', 'direct', 147),
(1, 15, 'Mantengo la calma quando i processi sono più lenti del previsto', 'direct', 148),
(1, 15, 'Do tempo alle persone di comprendere senza pressarle', 'direct', 149),
(1, 15, 'La mia pazienza permette che le cose maturino naturalmente', 'direct', 150);

-- CARATTERISTICA #16: PERCEZIONE (characteristic_id = 16)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 16, 'Perdo dettagli importanti perché non osservo attentamente', 'inverse', 151),
(1, 16, 'Non colgo segnali non verbali in conversazioni o riunioni', 'inverse', 152),
(1, 16, 'Mi accorgo di cambiamenti nell''ambiente solo quando qualcuno me li fa notare', 'inverse', 153),
(1, 16, 'Faccio fatica a leggere l''atmosfera emotiva di una situazione', 'inverse', 154),
(1, 16, 'Passo oltre elementi importanti perché non presto attenzione', 'inverse', 155),
(1, 16, 'Noto rapidamente cambiamenti nell''ambiente o nelle persone', 'direct', 156),
(1, 16, 'Colgo segnali non verbali che altri non vedono', 'direct', 157),
(1, 16, 'Percepisco l''atmosfera emotiva di una situazione appena entro', 'direct', 158),
(1, 16, 'La mia attenzione cattura dettagli che altri perdono', 'direct', 159),
(1, 16, 'Osservo attentamente prima di agire o decidere', 'direct', 160);

-- CARATTERISTICA #17: PERFEZIONISMO (characteristic_id = 17) - NUOVE DOMANDE ALLINEATE AL LIBRO
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 17, 'Il mio standard elevato rallenta eccessivamente la consegna dei progetti', 'inverse', 161),
(1, 17, 'Continuo a rifinire dettagli anche quando il risultato è già più che accettabile', 'inverse', 162),
(1, 17, 'La ricerca della perfezione mi impedisce di concludere e passare oltre', 'inverse', 163),
(1, 17, 'Critico eccessivamente il mio lavoro anche quando altri lo trovano ottimo', 'inverse', 164),
(1, 17, 'Preferisco non consegnare piuttosto che consegnare qualcosa di imperfetto', 'inverse', 165),
(1, 17, 'Il mio standard di eccellenza produce qualità senza bloccare l''azione', 'direct', 166),
(1, 17, 'So quando un lavoro è abbastanza buono da essere consegnato', 'direct', 167),
(1, 17, 'Bilancio qualità e tempistiche senza sacrificare nessuna delle due', 'direct', 168),
(1, 17, 'La mia attenzione ai dettagli migliora i risultati senza rallentarli', 'direct', 169),
(1, 17, 'Perseguo l''eccellenza mantenendo produttività costante', 'direct', 170);

-- CARATTERISTICA #18: SENSO DELL'UMORISMO (characteristic_id = 18) - NUOVE DOMANDE ALLINEATE AL LIBRO
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 18, 'Quando qualcosa va storto, dramatizzo la situazione invece di ridimensionarla', 'inverse', 171),
(1, 18, 'Prendo tutto troppo sul serio, anche situazioni che richiedono leggerezza', 'inverse', 172),
(1, 18, 'Le difficoltà mi appesantiscono invece di stimolare la mia creatività', 'inverse', 173),
(1, 18, 'Faccio fatica a ridere di me stesso quando commetto errori', 'inverse', 174),
(1, 18, 'L''atmosfera intorno a me diventa tesa quando affronto problemi', 'inverse', 175),
(1, 18, 'Mantengo prospettiva e leggerezza anche nelle situazioni difficili', 'direct', 176),
(1, 18, 'Riesco a trovare aspetti ironici o leggeri anche in momenti complicati', 'direct', 177),
(1, 18, 'Il mio senso dell''umorismo alleggerisce l''atmosfera del team', 'direct', 178),
(1, 18, 'So ridere dei miei errori senza perdere la determinazione a migliorare', 'direct', 179),
(1, 18, 'La leggerezza mi aiuta ad affrontare le sfide con energia rinnovata', 'direct', 180);

-- CARATTERISTICA #19: VERSATILITÀ (characteristic_id = 19)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 19, 'Opero efficacemente solo nel mio campo specifico di competenza', 'inverse', 181),
(1, 19, 'Mi sento a disagio quando devo affrontare situazioni fuori dalla mia zona comfort', 'inverse', 182),
(1, 19, 'Faccio fatica ad applicare conoscenze di un ambito in contesti diversi', 'inverse', 183),
(1, 19, 'La mia profondità in un campo limita la mia ampiezza di vedute', 'inverse', 184),
(1, 19, 'Preferisco specializzarmi ultra-specificamente piuttosto che espandermi', 'inverse', 185),
(1, 19, 'Riesco a operare efficacemente in ambiti diversi senza perdere competenza', 'direct', 186),
(1, 19, 'Integro conoscenze da campi diversi per creare soluzioni', 'direct', 187),
(1, 19, 'Affronto situazioni nuove attingendo a competenze variegate', 'direct', 188),
(1, 19, 'Mantengo ampiezza di visione senza perdere profondità', 'direct', 189),
(1, 19, 'La mia capacità di operare in contesti diversi è un vantaggio', 'direct', 190);

-- CARATTERISTICA #20: ADATTABILITÀ (characteristic_id = 20)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 20, 'Quando la situazione cambia, faccio fatica ad adattare il mio approccio', 'inverse', 191),
(1, 20, 'Insisto su soluzioni che funzionavano prima anche se ora non funzionano', 'inverse', 192),
(1, 20, 'I cambiamenti nel contesto mi destabilizzano e rallentano', 'inverse', 193),
(1, 20, 'Preferisco che le cose restino stabili perché il cambiamento mi disorienta', 'inverse', 194),
(1, 20, 'Resisto alle modifiche anche quando sono necessarie', 'inverse', 195),
(1, 20, 'Adatto rapidamente il mio approccio quando la situazione cambia', 'direct', 196),
(1, 20, 'Riconosco quando vecchie soluzioni non funzionano più e le modifico', 'direct', 197),
(1, 20, 'I cambiamenti di contesto sono opportunità, non minacce', 'direct', 198),
(1, 20, 'Mantengo l''efficacia anche quando l''ambiente si trasforma', 'direct', 199),
(1, 20, 'La mia flessibilità mi permette di prosperare in contesti variabili', 'direct', 200);

-- CARATTERISTICA #21: CURIOSITÀ (characteristic_id = 21)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 21, 'Accetto informazioni superficiali senza approfondire', 'inverse', 201),
(1, 21, 'Quando incontro qualcosa di nuovo, non mi viene spontaneo esplorare', 'inverse', 202),
(1, 21, 'Resto nella mia zona di comfort conoscitivo senza espandere', 'inverse', 203),
(1, 21, 'Le domande che faccio sono di facciata, non cerco una vera comprensione', 'inverse', 204),
(1, 21, 'Mi accontento di spiegazioni semplici senza scavare più a fondo', 'inverse', 205),
(1, 21, 'Quando incontro qualcosa di nuovo, voglio comprenderlo a fondo', 'direct', 206),
(1, 21, 'Faccio domande per esplorare veramente, non per convenzione', 'direct', 207),
(1, 21, 'La curiosità mi spinge oltre le spiegazioni superficiali', 'direct', 208),
(1, 21, 'Cerco attivamente di ampliare i miei orizzonti conoscitivi', 'direct', 209),
(1, 21, 'L''esplorazione e la comprensione mi danno energia', 'direct', 210);

-- CARATTERISTICA #22: INDIVIDUALISMO (characteristic_id = 22)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 22, 'Seguo le opinioni del gruppo per non creare conflitto', 'inverse', 211),
(1, 22, 'Adatto le mie idee a ciò che è socialmente accettato', 'inverse', 212),
(1, 22, 'Evito di esprimere pensieri che potrebbero essere impopolari', 'inverse', 213),
(1, 22, 'Mi conformo alle aspettative anche quando non le condivido', 'inverse', 214),
(1, 22, 'La mia posizione dipende da ciò che pensa la maggioranza', 'inverse', 215),
(1, 22, 'Penso in modo indipendente anche quando differisco dal gruppo', 'direct', 216),
(1, 22, 'Esprimo le mie idee anche se controcorrente', 'direct', 217),
(1, 22, 'Le mie posizioni nascono da una riflessione autonoma, non dal conformismo', 'direct', 218),
(1, 22, 'Non ho bisogno dell''approvazione per mantenere le mie convinzioni', 'direct', 219),
(1, 22, 'Rispetto le opinioni altrui senza sacrificare il mio pensiero', 'direct', 220);

-- CARATTERISTICA #23: IDEALISMO (characteristic_id = 23)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 23, 'Sono completamente cinico: non credo in nessun valore più alto', 'inverse', 221),
(1, 23, 'Considero gli ideali come un''ingenuità da superare', 'inverse', 222),
(1, 23, 'Agisco solo per interesse personale senza considerazioni etiche', 'inverse', 223),
(1, 23, 'Vedo chi ha principi come ingenuo o ipocrita', 'inverse', 224),
(1, 23, 'Giustifico qualsiasi mezzo se raggiunge il risultato', 'inverse', 225),
(1, 23, 'Mantengo una visione etica anche quando è scomodo', 'direct', 226),
(1, 23, 'Gli ideali guidano le mie scelte senza rendermi ingenuo', 'direct', 227),
(1, 23, 'Credo in valori più alti senza perdere pragmatismo', 'direct', 228),
(1, 23, 'Le mie decisioni rispettano principi, non solo la convenienza', 'direct', 229),
(1, 23, 'Bilancio idealismo e realismo senza oscillare tra i due', 'direct', 230);

-- CARATTERISTICA #24: IMMAGINAZIONE (characteristic_id = 24)
INSERT INTO assessment_questions (book_id, characteristic_id, question_text, scoring_type, order_index) VALUES
(1, 24, 'Vedo solo ciò che esiste, faccio fatica a immaginare alternative', 'inverse', 231),
(1, 24, 'Le mie proposte sono ripetizioni di ciò che ho già visto', 'inverse', 232),
(1, 24, 'Non riesco a visualizzare come qualcosa potrebbe essere diverso', 'inverse', 233),
(1, 24, 'La creatività mi sembra un lusso non necessario', 'inverse', 234),
(1, 24, 'Preferisco copiare soluzioni esistenti piuttosto che inventarne', 'inverse', 235),
(1, 24, 'Visualizzo possibilità che non esistono ancora ma potrebbero esistere', 'direct', 236),
(1, 24, 'Immagino soluzioni creative a problemi complessi', 'direct', 237),
(1, 24, 'Vedo connessioni inaspettate tra elementi diversi', 'direct', 238),
(1, 24, 'La mia immaginazione genera opzioni praticabili, non solo fantasie', 'direct', 239),
(1, 24, 'Creo mentalmente scenari futuri che guidano le azioni presenti', 'direct', 240);

-- =====================================================
-- STEP 4: VERIFICA FINALE
-- =====================================================

SELECT 'CARATTERISTICHE' as tipo, COUNT(*) as totale FROM characteristics;
SELECT 'DOMANDE' as tipo, COUNT(*) as totale FROM assessment_questions;

SELECT pillar, COUNT(*) as caratteristiche 
FROM characteristics 
GROUP BY pillar 
ORDER BY MIN(order_index);

SELECT c.name as caratteristica, COUNT(q.id) as domande
FROM characteristics c
LEFT JOIN assessment_questions q ON c.id = q.characteristic_id
GROUP BY c.id, c.name
ORDER BY c.order_index;
