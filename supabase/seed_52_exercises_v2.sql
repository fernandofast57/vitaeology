-- =====================================================
-- VITAEOLOGY - Seed 52 Esercizi Settimanali
-- =====================================================

-- Prima elimina gli esercizi esistenti
DELETE FROM user_exercise_progress;
DELETE FROM exercises;

-- Inserisci i 52 esercizi settimanali
-- Nota: book_id viene preso dalla tabella books tramite subquery

INSERT INTO exercises (
  id, book_id, week_number, title, subtitle, characteristic_slug,
  exercise_type, difficulty_level, estimated_time_minutes, month_name,
  description, instructions, deliverable, reflection_prompts, is_active, sort_order
)

SELECT
  gen_random_uuid(),
  (SELECT id::uuid FROM books WHERE slug = 'leadership-autentica' LIMIT 1),
  week_number,
  title,
  subtitle,
  characteristic_slug,
  exercise_type,
  difficulty_level,
  estimated_time_minutes,
  month_name,
  description,
  instructions,
  deliverable,
  reflection_prompts::jsonb,
  true,
  sort_order
FROM (VALUES
-- MESE 1: ESSERE - Autenticità e Integrità (Sett. 1-4)
(1, 'Il Tuo Punto di Partenza', 'Scopri chi sei come leader oggi', 'autenticita', 'riflessione', 'base', 30, 'Gennaio',
'Prima di iniziare qualsiasi percorso di crescita, è fondamentale capire dove ti trovi. Questo esercizio ti aiuterà a fare una fotografia onesta della tua leadership attuale.',
'Trova un momento tranquillo di almeno 30 minuti. Prendi carta e penna e rispondi alle seguenti domande con totale onestà:

1. Quali sono i tuoi 3 punti di forza come leader?
2. Quali sono le 3 aree dove senti di dover migliorare?
3. Come ti descriverebbero i tuoi collaboratori?
4. Qual è la decisione più difficile che hai preso negli ultimi 6 mesi?
5. Cosa ti motiva ad essere un leader migliore?',
'Documento con auto-analisi completa + 3 obiettivi per i prossimi 3 mesi',
'["Cosa ti ha sorpreso di più di questa auto-analisi?", "Quanto sei stato onesto con te stesso?", "Quale area vuoi affrontare per prima?"]',
1),

(2, 'Il Primo Passo Difficile', 'Agisci con autenticità in una situazione sfidante', 'autenticita', 'azione', 'base', 45, 'Gennaio',
'L''autenticità si dimostra nelle azioni, non solo nelle parole. Questa settimana metterai in pratica l''essere genuino in una situazione reale.',
'Identifica una situazione lavorativa dove normalmente "reciteresti un ruolo" o diresti ciò che gli altri vogliono sentire.

Può essere:
- Una riunione dove hai un''opinione diversa dalla maggioranza
- Un feedback da dare a un collaboratore
- Una conversazione con il tuo capo su un tema delicato

Affronta questa situazione essendo completamente autentico, esprimendo la tua vera opinione in modo rispettoso ma diretto.',
'Report della situazione affrontata + risultati ottenuti + lezioni apprese',
'["Come ti sei sentito ad essere completamente autentico?", "Quale è stata la reazione degli altri?", "Lo rifaresti? Perché?"]',
2),

(3, 'Ammettere Non Lo So', 'Pratica l''umiltà intellettuale', 'integrita', 'sfida', 'base', 30, 'Gennaio',
'I leader con integrità riconoscono i propri limiti. Questa settimana praticherai l''arte di ammettere quando non sai qualcosa.',
'Per 5 giorni consecutivi, cerca attivamente opportunità per dire "Non lo so" o "Non sono sicuro".

Regole:
1. Deve essere genuino (non inventare situazioni)
2. Dopo aver ammesso di non sapere, chiedi aiuto o informazioni
3. Ringrazia chi ti aiuta
4. Documenta ogni situazione

Obiettivo: minimo 1 situazione al giorno per 5 giorni.',
'Diario di 5 giorni con situazioni + reazioni ricevute + come ti sei sentito',
'["È stato difficile ammettere di non sapere?", "Come hanno reagito gli altri?", "Cosa hai imparato da questa esperienza?"]',
3),

(4, 'Analisi Fallimento Recente', 'Trasforma un errore in apprendimento', 'integrita', 'analisi', 'base', 45, 'Gennaio',
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
'["Quanto è stato difficile analizzare il tuo errore?", "Hai scoperto pattern ricorrenti?", "Come ti senti ora riguardo a quel fallimento?"]',
4),

-- MESE 2: ESSERE - Consapevolezza e Presenza (Sett. 5-8)
(5, 'Il Feedback a 360°', 'Raccogli percezioni esterne su di te', 'consapevolezza-di-se', 'feedback', 'intermedio', 60, 'Febbraio',
'La consapevolezza di sé richiede di vedere noi stessi anche attraverso gli occhi degli altri.',
'Identifica 5 persone che ti conoscono in contesti diversi:
- 1 superiore
- 2 colleghi/pari
- 1 collaboratore/subordinato
- 1 persona della tua vita personale

Chiedi a ciascuno di rispondere a 3 domande:
1. Qual è il mio punto di forza principale come leader/persona?
2. Quale comportamento dovrei migliorare?
3. Cosa ti aspetti da me che non sto facendo?

Raccogli e sintetizza le risposte cercando pattern comuni.',
'Sintesi del feedback ricevuto + 3 temi ricorrenti + piano di miglioramento',
'["Quale feedback ti ha sorpreso di più?", "C''è coerenza tra come ti vedi e come ti vedono?", "Quale feedback è più difficile da accettare?"]',
5),

(6, 'Diario della Presenza', 'Sviluppa la consapevolezza momento per momento', 'presenza', 'riflessione', 'base', 20, 'Febbraio',
'Essere presenti significa essere pienamente nel momento. Per una settimana, praticherai la presenza consapevole.',
'Per 7 giorni consecutivi, 3 volte al giorno (mattina, pomeriggio, sera), fermati per 2 minuti e rispondi:

1. Dove sono in questo momento? (fisicamente ed emotivamente)
2. Cosa sto pensando?
3. Cosa sto provando nel corpo?
4. Sono presente o sto pensando al passato/futuro?
5. Valuta la tua presenza da 1 a 10

Usa un''app note o un quaderno per tracciare.',
'Diario di 7 giorni con 21 check-in di presenza + pattern identificati',
'["In quali momenti sei più presente?", "Cosa ti distrae maggiormente?", "Come è cambiata la tua consapevolezza durante la settimana?"]',
6),

(7, 'Meeting Senza Telefono', 'Pratica la presenza totale nelle riunioni', 'presenza', 'sfida', 'intermedio', 40, 'Febbraio',
'La presenza si dimostra dando attenzione totale. Questa settimana eliminerai le distrazioni tecnologiche nelle riunioni.',
'Per una settimana intera, in TUTTE le riunioni:

1. Lascia il telefono fuori dalla stanza o in modalità aereo
2. Chiudi email e notifiche sul computer
3. Prendi appunti a mano (non digitali)
4. Mantieni contatto visivo con chi parla
5. Fai almeno 1 domanda per riunione

Dopo ogni riunione, valuta:
- Quanto sei stato presente (1-10)?
- Cosa hai notato che normalmente ti sfugge?',
'Report settimanale delle riunioni + livello di presenza + osservazioni',
'["Cosa hai notato che normalmente ti sfuggiva?", "È stato difficile resistere alla tentazione del telefono?", "Come è cambiata la qualità delle tue riunioni?"]',
7),

(8, 'La Mappa delle Emozioni', 'Riconosci i tuoi trigger emotivi', 'consapevolezza-di-se', 'analisi', 'intermedio', 45, 'Febbraio',
'Conoscere i propri trigger emotivi è fondamentale per la leadership consapevole.',
'Per 2 settimane, ogni volta che provi un''emozione intensa (positiva o negativa), documenta:

1. Emozione provata (nome specifico)
2. Intensità (1-10)
3. Situazione/trigger
4. Pensieri automatici
5. Reazione comportamentale
6. Conseguenze

Dopo 2 settimane, analizza i pattern:
- Quali emozioni sono più frequenti?
- Quali situazioni le scatenano?',
'Mappa emotiva con almeno 10 episodi + 3 pattern identificati + strategie di gestione',
'["Quali pattern hai scoperto?", "C''è un''emozione dominante?", "Come puoi usare questa consapevolezza?"]',
8),

-- MESE 3: ESSERE - Resilienza e Umiltà (Sett. 9-13)
(9, 'Storia di Resilienza', 'Riscopri la tua forza interiore', 'resilienza', 'riflessione', 'base', 40, 'Marzo',
'Tutti abbiamo superato momenti difficili. Riconnettiti con la tua resilienza passata per rafforzare quella futura.',
'Ripensa a 3 momenti difficili della tua vita/carriera che hai superato.

Per ciascuno, scrivi:
1. Cosa è successo?
2. Come ti sei sentito nel momento peggiore?
3. Cosa ti ha aiutato ad andare avanti?
4. Quali risorse interiori hai usato?
5. Cosa hai imparato?
6. Come quell''esperienza ti ha reso più forte?

Identifica i pattern comuni: quali sono le TUE strategie di resilienza?',
'Documento con 3 storie di resilienza + pattern comuni + risorse personali identificate',
'["Quale storia ti ha toccato di più rivisitare?", "Quali risorse usi più spesso?", "Come puoi applicare queste risorse oggi?"]',
9),

(10, 'La Sfida Volontaria', 'Esci dalla zona di comfort deliberatamente', 'resilienza', 'sfida', 'avanzato', 60, 'Marzo',
'La resilienza si costruisce affrontando sfide. Questa settimana sceglierai volontariamente di fare qualcosa di difficile.',
'Scegli UNA sfida significativa da completare questa settimana:

- Parla in pubblico (anche una breve presentazione)
- Chiedi un aumento o promozione
- Affronta una conversazione che rimandi da tempo
- Impara qualcosa di completamente nuovo
- Fai qualcosa che ti spaventa (in modo sicuro)

Documenta:
- Prima: paure e resistenze
- Durante: cosa provi
- Dopo: cosa hai imparato',
'Report della sfida affrontata + emozioni provate + lezioni di resilienza',
'["Perché hai scelto questa sfida?", "Cosa hai scoperto su di te?", "La paura era giustificata?"]',
10),

(11, 'Chiedere Aiuto', 'Pratica l''umiltà di non farcela da solo', 'umilta', 'azione', 'intermedio', 30, 'Marzo',
'L''umiltà include riconoscere che non possiamo fare tutto da soli. Questa settimana praticherai l''arte di chiedere aiuto.',
'Identifica 3 situazioni questa settimana dove potresti chiedere aiuto:

1. Un compito dove qualcun altro è più esperto
2. Una decisione dove ti servirebbe un''altra prospettiva
3. Un''attività che ti sovraccarica

Per ciascuna:
- Chiedi aiuto esplicitamente
- Spiega perché chiedi proprio a quella persona
- Accetta l''aiuto con gratitudine
- Documenta l''esperienza',
'Report di 3 richieste di aiuto + risultati + riflessioni',
'["È stato difficile chiedere aiuto?", "Come hanno risposto le persone?", "Cosa hai imparato sull''umiltà?"]',
11),

(12, 'Celebra gli Altri', 'Riconosci pubblicamente i meriti altrui', 'umilta', 'azione', 'base', 25, 'Marzo',
'I leader umili mettono in luce gli altri. Questa settimana praticherai il riconoscimento pubblico.',
'Per 5 giorni, ogni giorno:

1. Identifica qualcuno che ha fatto qualcosa di buono
2. Riconosci il suo contributo PUBBLICAMENTE
3. Sii specifico su cosa ha fatto e perché è importante
4. Non aggiungere "anch''io ho fatto..." - focus solo su di loro

Documenta ogni riconoscimento e le reazioni.',
'Diario di 5 riconoscimenti pubblici + reazioni osservate',
'["Come ti sei sentito a mettere gli altri in luce?", "Come hanno reagito le persone celebrate?", "Cosa hai notato nel team?"]',
12),

(13, 'Review Primo Trimestre', 'Valuta i tuoi progressi ESSERE', 'autenticita', 'analisi', 'intermedio', 60, 'Marzo',
'È tempo di fermarsi e valutare i progressi fatti nelle prime 12 settimane focalizzate sul pilastro ESSERE.',
'Rivedi tutti gli esercizi completati nelle settimane 1-12.

Rispondi a:
1. Quali esercizi ti hanno impattato di più? Perché?
2. Cosa hai scoperto su di te che non sapevi?
3. Quali comportamenti sono cambiati?
4. Dove hai ancora difficoltà?

Valuta il tuo progresso in ogni area (1-10):
- Autenticità
- Integrità
- Consapevolezza di Sé
- Presenza
- Resilienza
- Umiltà',
'Report trimestrale con valutazioni + 2 aree di focus per il trimestre successivo',
'["Di cosa sei più orgoglioso?", "Cosa è stato più difficile?", "Come continuerai a crescere?"]',
13),

-- MESE 4: SENTIRE - Empatia e Intelligenza Emotiva (Sett. 14-17)
(14, 'Un Giorno nei Loro Panni', 'Pratica l''empatia profonda', 'empatia', 'riflessione', 'intermedio', 45, 'Aprile',
'L''empatia richiede di vedere il mondo dalla prospettiva dell''altro.',
'Scegli 3 persone con cui interagisci regolarmente.

Per ciascuna, dedica 15 minuti a immaginare:
1. Com''è la loro giornata tipo?
2. Quali pressioni subiscono?
3. Quali sono le loro paure lavorative?
4. Cosa li motiva?
5. Come si sentono quando interagiscono con te?
6. Di cosa avrebbero bisogno da te?

Poi VERIFICA: parla con loro e chiedi come stanno davvero.',
'Profili empatici di 3 persone + verifica delle tue intuizioni',
'["Quanto erano accurate le tue intuizioni?", "Cosa ti ha sorpreso?", "Come cambierà il tuo comportamento?"]',
14),

(15, 'Gestire le Emozioni Difficili', 'Sviluppa strategie per emozioni intense', 'intelligenza-emotiva', 'pianificazione', 'intermedio', 40, 'Aprile',
'L''intelligenza emotiva include la capacità di gestire emozioni difficili.',
'Identifica le 3 emozioni negative che provi più frequentemente al lavoro.

Per ciascuna, sviluppa:
1. Segnali precoci (come riconosci che sta arrivando?)
2. Trigger comuni (cosa la scatena di solito?)
3. Strategia di risposta immediata (cosa fare nei primi 30 secondi)
4. Strategia di gestione (come elaborarla)
5. Prevenzione (come ridurre la frequenza)

Crea una "scheda" per ogni emozione.',
'Toolkit con 3 schede di gestione emotiva + piano di implementazione',
'["Quale emozione è più sfidante per te?", "Hai già strategie che funzionano?", "Come testerai questo toolkit?"]',
15),

(16, 'Leggere la Stanza', 'Sviluppa la percezione emotiva del gruppo', 'intelligenza-emotiva', 'sfida', 'avanzato', 35, 'Aprile',
'I leader emotivamente intelligenti sanno "leggere la stanza". Allenerai questa capacità.',
'Per una settimana, in ogni riunione o interazione di gruppo:

PRIMA di entrare:
- Fermati 30 secondi
- Fai 3 respiri profondi

DURANTE:
- Osserva linguaggio corporeo, tono di voce
- Nota chi parla e chi tace
- Identifica l''emozione dominante del gruppo

DOPO:
- Scrivi cosa hai percepito
- Valuta: influenza sulla riunione

Fai questo per almeno 5 riunioni.',
'Diario di 5+ riunioni con osservazioni emotive + pattern identificati',
'["Cosa ti è più facile percepire?", "Cosa ti sfugge?", "Come puoi usare queste informazioni?"]',
16),

(17, 'Conversazione Empatica', 'Ascolta per capire, non per rispondere', 'empatia', 'azione', 'base', 30, 'Aprile',
'L''empatia si esprime attraverso l''ascolto profondo.',
'Questa settimana, conduci 3 conversazioni "empatiche":

1. Scegli qualcuno che sembra stressato/preoccupato
2. Chiedi "Come stai veramente?"
3. Ascolta SENZA:
   - Dare consigli
   - Condividere esperienze simili
   - Minimizzare i loro problemi
4. Usa solo:
   - Domande per capire meglio
   - Riflessi ("Sembra che tu ti senta...")
   - Silenzio
5. Chiudi con "Grazie per aver condiviso"',
'Report di 3 conversazioni empatiche + riflessioni',
'["Quanto è stato difficile non dare consigli?", "Come hanno risposto le persone?", "Cosa hai capito che normalmente ti sfugge?"]',
17),

-- MESE 5: SENTIRE - Ascolto e Compassione (Sett. 18-21)
(18, 'Ascolto a Tre Livelli', 'Approfondisci la qualità del tuo ascolto', 'ascolto-attivo', 'riflessione', 'intermedio', 35, 'Maggio',
'L''ascolto attivo opera a tre livelli: contenuto, emozioni e bisogni.',
'Per una settimana, in ogni conversazione importante pratica l''ascolto a tre livelli:

1. CONTENUTO: Cosa sta dicendo esattamente?
2. EMOZIONI: Come si sente?
3. BISOGNI: Cosa vuole veramente?

Dopo almeno 5 conversazioni, rifletti sui pattern.',
'Diario di 5+ conversazioni con analisi a tre livelli',
'["Quale livello ti viene più naturale?", "Quale richiede più pratica?", "Cosa hai scoperto ascoltando più profondamente?"]',
18),

(19, 'Pausa Prima di Parlare', 'Rompi il pattern della risposta automatica', 'ascolto-attivo', 'sfida', 'base', 25, 'Maggio',
'Spesso rispondiamo prima ancora di aver finito di ascoltare. Questa sfida ti rallenterà.',
'Per 5 giorni, applica la "regola dei 3 secondi":

Ogni volta che qualcuno finisce di parlare:
1. Conta mentalmente fino a 3 prima di rispondere
2. Usa questo tempo per processare quello che hanno detto

Tieni traccia:
- Quante volte ci riesci
- Come cambia la qualità delle tue risposte',
'Report di 5 giorni con conteggio + osservazioni',
'["È stato difficile aspettare?", "Come hanno reagito gli altri?", "Le tue risposte sono migliorate?"]',
19),

(20, 'Compassione in Azione', 'Trasforma la compassione in gesti concreti', 'compassione', 'azione', 'base', 30, 'Maggio',
'La compassione non è solo sentire, è agire.',
'Ogni giorno per 5 giorni, compì un atto di compassione:

- Offrire aiuto a chi è sovraccarico
- Scrivere un messaggio di apprezzamento
- Coprire un collega che ha difficoltà
- Ascoltare qualcuno che ha bisogno di sfogarsi
- Difendere qualcuno in sua assenza

Regole:
- Non aspettarti nulla in cambio
- Non pubblicizzare il tuo gesto',
'Diario privato di 5 atti di compassione + come ti sei sentito',
'["È stato naturale o hai dovuto sforzarti?", "Come hanno reagito le persone?", "Come ti senti dopo questa settimana?"]',
20),

(21, 'Auto-Compassione', 'Estendi la compassione a te stesso', 'compassione', 'riflessione', 'intermedio', 40, 'Maggio',
'Spesso siamo più duri con noi stessi che con gli altri.',
'Per una settimana, quando ti sorprendi a essere autocritico:

1. RICONOSCI: "Sto essendo duro con me stesso"
2. NORMALIZZA: "È umano fare errori"
3. RIFORMULA: "Cosa direi a un amico nella stessa situazione?"
4. AGISCI: Trattati come tratteresti quell''amico

Tieni un diario con le situazioni di autocritica.',
'Diario di auto-compassione di 7 giorni + riflessioni',
'["Quanto sei normalmente autocritico?", "È stato difficile essere gentile con te stesso?", "Cosa è cambiato dentro di te?"]',
21),

-- MESE 6: SENTIRE - Fiducia e Gratitudine (Sett. 22-26)
(22, 'Audit della Fiducia', 'Mappa le relazioni di fiducia nel tuo team', 'fiducia', 'analisi', 'intermedio', 45, 'Giugno',
'La fiducia è la base delle relazioni efficaci.',
'Crea una mappa delle tue relazioni professionali chiave (8-10 persone).

Per ciascuna, valuta da 1 a 10:
1. Quanto TI fidi di loro?
2. Quanto pensi che LORO si fidino di te?
3. Quanto è aperta la comunicazione?

Per relazioni sotto 6:
- Cosa ha eroso la fiducia?
- Cosa potresti fare per ricostruirla?

Identifica 2 relazioni prioritarie da migliorare.',
'Mappa della fiducia + piano per 2 relazioni prioritarie',
'["Ci sono sorprese nella mappa?", "Cosa erode la fiducia per te?", "Da dove inizierai?"]',
22),

(23, 'Mantenere una Promessa Difficile', 'Costruisci fiducia attraverso l''affidabilità', 'fiducia', 'sfida', 'avanzato', 40, 'Giugno',
'La fiducia si costruisce mantenendo le promesse, specialmente quelle difficili.',
'Identifica una promessa/impegno che hai fatto e che hai rimandato.

Questa settimana:
1. Riconosci l''impegno apertamente
2. Crea un piano specifico per mantenerlo
3. Comunica il piano all''altra persona
4. MANTIENI L''IMPEGNO
5. Chiedi feedback sulla tua affidabilità',
'Report dell''impegno mantenuto + feedback ricevuto',
'["Perché avevi rimandato?", "Come ti sei sentito a mantenere l''impegno?", "Cosa ha significato per l''altra persona?"]',
23),

(24, 'Diario della Gratitudine Lavorativa', 'Coltiva l''apprezzamento quotidiano', 'gratitudine', 'riflessione', 'base', 15, 'Giugno',
'La gratitudine trasforma la prospettiva.',
'Ogni sera, per 14 giorni, scrivi:

1. 3 cose per cui sei grato oggi al lavoro
2. 1 persona che ha contribuito positivamente
3. 1 sfida che ti ha fatto crescere

Regole:
- Sii specifico
- Non ripetere le stesse cose

Alla fine delle 2 settimane, rileggi tutto.',
'Diario di 14 giorni di gratitudine + sintesi dei pattern',
'["È stato facile trovare motivi di gratitudine?", "Cosa è cambiato nella tua prospettiva?", "Continuerai questa pratica?"]',
24),

(25, 'Esprimere Gratitudine', 'Trasforma la gratitudine in comunicazione', 'gratitudine', 'azione', 'base', 30, 'Giugno',
'La gratitudine ha più impatto quando viene espressa.',
'Scrivi 5 messaggi di gratitudine:

1. Qualcuno che ti ha aiutato di recente
2. Qualcuno che spesso dai per scontato
3. Qualcuno che fa un lavoro "invisibile"
4. Qualcuno che ti ha insegnato qualcosa
5. Qualcuno che ha creduto in te

Ogni messaggio deve essere specifico e genuino.',
'5 messaggi di gratitudine inviati + reazioni ricevute',
'["Come ti sei sentito a scrivere questi messaggi?", "Quali reazioni ti hanno sorpreso?", "Chi altro meriterebbe gratitudine?"]',
25),

(26, 'Review Secondo Trimestre', 'Valuta i tuoi progressi SENTIRE', 'empatia', 'analisi', 'intermedio', 60, 'Giugno',
'È tempo di valutare i progressi nel pilastro SENTIRE.',
'Rivedi gli esercizi delle settimane 14-25.

Rispondi a:
1. Come è cambiata la tua capacità di connetterti con gli altri?
2. Quale esercizio ha avuto più impatto?
3. Dove fai ancora fatica?

Valuta il tuo progresso (1-10):
- Empatia
- Intelligenza Emotiva
- Ascolto Attivo
- Compassione
- Fiducia
- Gratitudine',
'Report trimestrale + valutazioni + 2 pratiche da continuare',
'["Cosa è migliorato di più?", "Come hanno notato gli altri il cambiamento?", "Cosa integrerai nella tua routine?"]',
26),

-- MESE 7: PENSARE - Visione e Pensiero Critico (Sett. 27-30)
(27, 'Visione a 3 Anni', 'Definisci dove vuoi essere', 'visione-strategica', 'pianificazione', 'intermedio', 60, 'Luglio',
'I leader visionari sanno dove stanno andando.',
'Immagina di essere 3 anni nel futuro e tutto è andato perfettamente.

Descrivi in dettaglio:
1. RUOLO: Che posizione hai?
2. IMPATTO: Quale differenza stai facendo?
3. TEAM: Con chi lavori?
4. COMPETENZE: Cosa sai fare che oggi non sai?
5. STILE: Come ti descrivono come leader?
6. VITA: Come bilanci lavoro e vita personale?

Identifica 3 milestone e il primo passo.',
'Documento di visione a 3 anni + 3 milestone + primo passo',
'["Questa visione ti entusiasma?", "È realistica?", "Cosa ti manca per arrivarci?"]',
27),

(28, 'Devil''s Advocate', 'Sfida le tue convinzioni', 'pensiero-critico', 'sfida', 'avanzato', 45, 'Luglio',
'Il pensiero critico richiede di sfidare anche le proprie idee.',
'Identifica una decisione importante che hai preso o una convinzione forte.

Argomenta CONTRO di essa:
1. Quali sono i punti deboli?
2. Cosa direbbe qualcuno che non è d''accordo?
3. Quali dati contraddicono la tua view?
4. Cosa potrebbe andare storto?
5. Quali alternative non hai considerato?

Scrivi un documento di 1 pagina che attacca la tua posizione.',
'Documento "contro" la tua decisione + riflessione finale',
'["È stato difficile argomentare contro te stesso?", "Hai trovato punti validi?", "Cambierai qualcosa?"]',
28),

(29, 'Analisi delle Assunzioni', 'Scopri cosa dai per scontato', 'pensiero-critico', 'analisi', 'intermedio', 40, 'Luglio',
'Molte decisioni sbagliate derivano da assunzioni non verificate.',
'Prendi un progetto o iniziativa corrente.

Fai una lista di TUTTE le assunzioni:
1. Sul mercato/clienti
2. Sul team/risorse
3. Sulla timeline
4. Sulla tecnologia
5. Sui competitor

Per ogni assunzione:
- È un FATTO o una SUPPOSIZIONE?
- Come puoi verificarla?
- Cosa succede se è sbagliata?',
'Lista assunzioni + piano verifica per top 3',
'["Quante assunzioni stavi facendo senza rendertene conto?", "Quali sono più rischiose?", "Come cambierà il tuo approccio?"]',
29),

(30, 'Pensiero Sistemico', 'Vedi le connessioni nascoste', 'visione-strategica', 'riflessione', 'avanzato', 50, 'Luglio',
'I leader strategici vedono il sistema, non solo le parti.',
'Scegli un problema o sfida attuale.

Mappalo sistematicamente:
1. Disegna tutti gli attori coinvolti
2. Traccia le connessioni tra loro
3. Identifica i loop di feedback
4. Trova i "leverage points"
5. Considera effetti a breve vs lungo termine

Usa un grande foglio o strumento di mapping.',
'Mappa sistemica del problema + 3 leverage points + strategia',
'["Cosa hai visto che prima ti sfuggiva?", "Quali connessioni ti hanno sorpreso?", "Come userai questa prospettiva?"]',
30),

-- MESE 8: PENSARE - Creatività e Adattabilità (Sett. 31-34)
(31, '20 Idee in 20 Minuti', 'Allena il muscolo creativo', 'creativita', 'sfida', 'intermedio', 25, 'Agosto',
'La creatività si allena con la quantità prima della qualità.',
'Scegli un problema/sfida reale.

Imposta un timer di 20 minuti.
Genera 20 idee per risolverlo:

Regole:
- Non giudicare mentre generi
- Quantità > qualità
- Includi idee "pazze"
- Non fermarti finché non arrivi a 20

Dopo, seleziona le 3 più promettenti e sviluppa 1 idea in un piano.',
'20 idee + 3 selezionate + 1 piano d''azione',
'["A che numero hai iniziato a faticare?", "Le idee migliori erano all''inizio o alla fine?", "Userai questa tecnica in futuro?"]',
31),

(32, 'Cambia una Routine', 'Pratica l''adattabilità quotidiana', 'adattabilita', 'azione', 'base', 30, 'Agosto',
'L''adattabilità si costruisce uscendo dalle abitudini.',
'Per una settimana, cambia UNA routine ogni giorno:

- Giorno 1: Cambia il percorso per andare al lavoro
- Giorno 2: Cambia l''ordine delle attività mattutine
- Giorno 3: Mangia in un posto diverso
- Giorno 4: Usa uno strumento diverso
- Giorno 5: Cambia il modo in cui inizi una riunione

Documenta come ti sei sentito.',
'Diario di 5 cambiamenti + osservazioni + lezioni',
'["Quale cambiamento è stato più difficile?", "Hai scoperto qualcosa di meglio?", "Come reagisci normalmente al cambiamento?"]',
32),

(33, 'Prospettive Multiple', 'Guarda il problema da angoli diversi', 'creativita', 'riflessione', 'avanzato', 45, 'Agosto',
'La creatività nasce dal vedere le cose da prospettive diverse.',
'Prendi una decisione difficile.

Analizzala da 6 prospettive:
1. FATTI: Solo dati oggettivi
2. EMOZIONI: Cosa senti?
3. RISCHI: Cosa può andare storto?
4. BENEFICI: Cosa può andare bene?
5. ALTERNATIVE: Quali altre opzioni?
6. PROCESSO: Come decidere?

Dedica 5 minuti a ogni prospettiva.',
'Analisi a 6 prospettive + decisione finale',
'["Quale prospettiva ti ha dato più insight?", "Quale tendi a ignorare?", "Come userai questa tecnica?"]',
33),

(34, 'Piano B, C e D', 'Prepara alternative per ogni scenario', 'adattabilita', 'pianificazione', 'intermedio', 40, 'Agosto',
'I leader adattabili hanno sempre alternative pronte.',
'Prendi un progetto importante in corso.

Per il Piano A, identifica 3 cose che potrebbero andare storte.

Per ciascuna, sviluppa:
- PIANO B: Se [cosa va storta], allora [azione alternativa]
- Trigger: quando scatta?
- Azioni: cosa fai?
- Risorse: cosa ti serve?

Crea anche PIANO C e PIANO D.',
'Documento con Piano A + B + C + D',
'["Ti senti più preparato?", "Hai condiviso i piani con il team?", "Userai questo approccio per altri progetti?"]',
34),

-- MESE 9: PENSARE - Apprendimento e Problem Solving (Sett. 35-39)
(35, 'Impara Qualcosa di Nuovo', 'Mettiti nei panni del principiante', 'apprendimento-continuo', 'sfida', 'base', 60, 'Settembre',
'Per mantenere l''umiltà e la curiosità, impara regolarmente cose nuove.',
'Scegli qualcosa di completamente nuovo da imparare questa settimana:

- Una skill tecnica
- Una lingua (primi rudimenti)
- Uno strumento nuovo
- Un hobby completamente diverso

Dedica almeno 3 ore totali.

Documenta:
- Cosa hai scelto e perché
- Come ti sei sentito da principiante
- Cosa hai imparato sul processo di apprendimento',
'Report dell''apprendimento + riflessioni sull''essere principiante',
'["Come ti sei sentito a non essere competente?", "Cosa hai imparato sull''imparare?", "Come tratterai diversamente chi sta imparando?"]',
35),

(36, 'Insegna per Imparare', 'Consolida le tue conoscenze insegnando', 'apprendimento-continuo', 'azione', 'intermedio', 45, 'Settembre',
'Il modo migliore per imparare è insegnare.',
'Questa settimana, insegna qualcosa a qualcuno:

1. Scegli un argomento che conosci bene
2. Identifica qualcuno che potrebbe beneficiarne
3. Prepara una "mini-lezione" (15-30 minuti)
4. Conduci la sessione
5. Chiedi feedback

Nota quali lacune scopri nella tua conoscenza.',
'Piano della lezione + feedback ricevuto + lacune identificate',
'["Cosa hai scoperto di non sapere bene?", "Come è andata la sessione?", "Cosa insegnerai prossimamente?"]',
36),

(37, 'Root Cause Analysis', 'Vai alla radice dei problemi', 'problem-solving', 'analisi', 'avanzato', 50, 'Settembre',
'I bravi problem solver non si fermano ai sintomi.',
'Prendi un problema ricorrente.

Applica il metodo dei "5 Perché":
1. Problema: [descrivi]
2. Perché succede? → [risposta 1]
3. Perché [risposta 1]? → [risposta 2]
4. Perché [risposta 2]? → [risposta 3]
5. Perché [risposta 3]? → [risposta 4]
6. Perché [risposta 4]? → [ROOT CAUSE]

Identifica la root cause e proponi una soluzione.',
'Analisi 5 Perché + root cause + soluzione proposta',
'["La root cause ti ha sorpreso?", "È diversa da quella che pensavi?", "Come implementerai la soluzione?"]',
37),

(38, 'Decisione con Dati', 'Basa le decisioni su evidenze', 'problem-solving', 'pianificazione', 'intermedio', 45, 'Settembre',
'Le decisioni migliori sono basate su dati.',
'Prendi una decisione che devi prendere.

1. DEFINISCI i criteri di successo
2. RACCOGLI dati (almeno 3 fonti)
3. ANALIZZA cosa dicono i dati
4. DECIDI basandoti sui dati
5. Documenta il razionale',
'Framework decisionale + dati raccolti + decisione con razionale',
'["I dati hanno confermato o cambiato la tua intuizione?", "Quali dati sono stati più utili?", "Userai questo approccio regolarmente?"]',
38),

(39, 'Review Terzo Trimestre', 'Valuta i tuoi progressi PENSARE', 'pensiero-critico', 'analisi', 'intermedio', 60, 'Settembre',
'È tempo di valutare i progressi nel pilastro PENSARE.',
'Rivedi gli esercizi delle settimane 27-38.

Rispondi a:
1. Come è cambiato il tuo modo di pensare ai problemi?
2. Sei più strategico nelle decisioni?
3. Quale strumento/tecnica userai di più?

Valuta (1-10):
- Visione Strategica
- Pensiero Critico
- Creatività
- Adattabilità
- Apprendimento Continuo
- Problem Solving',
'Report trimestrale + valutazioni + 2 tecniche da integrare',
'["Qual è il cambiamento più significativo?", "Cosa userai di più?", "Come condividerai questi strumenti con il team?"]',
39),

-- MESE 10: AGIRE - Decisionalità e Comunicazione (Sett. 40-43)
(40, 'Decisione Veloce', 'Pratica la decisionalità sotto pressione', 'decisionalita', 'sfida', 'avanzato', 35, 'Ottobre',
'I leader devono saper decidere anche con informazioni incomplete.',
'Questa settimana, per OGNI decisione piccola/media:

1. Imposta un timer di 2 minuti
2. Decidi prima che scada
3. Non ripensarci dopo

Tieni traccia di almeno 10 decisioni rapide.

Regola: puoi "comprare" tempo solo per decisioni > 10.000€ o che impattano > 5 persone.',
'Log di 10+ decisioni rapide + tempi + qualità percepita',
'["Le decisioni rapide erano peggiori?", "Quanto tempo risparmi?", "Cosa ti impedisce normalmente di decidere velocemente?"]',
40),

(41, 'Comunicazione Chiara', 'Elimina ambiguità dai tuoi messaggi', 'comunicazione', 'azione', 'base', 30, 'Ottobre',
'La comunicazione efficace è chiara e diretta.',
'Per una settimana, prima di ogni comunicazione importante:

1. Scrivi in UNA frase cosa vuoi che l''altro CAPISCA
2. Scrivi in UNA frase cosa vuoi che l''altro FACCIA
3. Rimuovi tutto ciò che non serve
4. Chiedi "Un bambino di 10 anni capirebbe?"

Applica a almeno 5 email e 2 riunioni.',
'Prima/dopo di 5+ comunicazioni + feedback ricevuto',
'["Quanto erano più corte le versioni semplificate?", "Le persone hanno capito meglio?", "Cosa elimini più spesso?"]',
41),

(42, 'Conversazioni Difficili', 'Affronta dialoghi che eviti', 'comunicazione', 'sfida', 'avanzato', 50, 'Ottobre',
'I leader devono saper affrontare conversazioni scomode.',
'Identifica UNA conversazione difficile che stai rimandando.

PREPARAZIONE:
1. Chiarisci l''obiettivo
2. Anticipa le reazioni
3. Prepara come aprire

ESECUZIONE:
- Scegli momento e luogo appropriati
- Conduci la conversazione

DOPO:
- Documenta cosa è successo
- Cosa hai imparato',
'Piano conversazione + esecuzione + risultati + lezioni',
'["Come ti sei sentito prima, durante, dopo?", "È andata come ti aspettavi?", "Quale altra conversazione affronterai?"]',
42),

(43, 'La Decisione da Leader', 'Prendi una decisione impopolare', 'decisionalita', 'sfida', 'avanzato', 45, 'Ottobre',
'A volte i leader devono prendere decisioni impopolari.',
'Identifica una decisione che sai essere giusta ma che:
- Non piacerà a tutti
- Ti espone a critiche
- Richiede coraggio

PROCESSO:
1. Verifica che sia la cosa giusta
2. Prepara la comunicazione
3. Prendi la decisione
4. Comunica con trasparenza
5. Gestisci le reazioni',
'Decisione presa + comunicazione + reazioni + come hai gestito',
'["È stata dura?", "Come hai gestito le resistenze?", "Ti senti un leader più forte?"]',
43),

-- MESE 11: AGIRE - Delega e Motivazione (Sett. 44-47)
(44, 'Audit della Delega', 'Analizza cosa dovresti delegare', 'delega', 'analisi', 'intermedio', 40, 'Novembre',
'Molti leader non delegano abbastanza.',
'Fai un elenco di TUTTO quello che fai in una settimana tipica.

Per ogni attività, chiediti:
1. Solo IO posso farlo?
2. È il miglior uso del mio tempo?
3. Qualcun altro potrebbe imparare?
4. Delegarlo aiuterebbe a sviluppare altri?

Categorizza:
- DEVO fare io
- POTREI delegare
- DEVO delegare',
'Lista attività + categorizzazione + piano di delega per 3+ attività',
'["Quanto del tuo tempo è su attività delegabili?", "Cosa ti impedisce di delegare?", "A chi delegherai per primo?"]',
44),

(45, 'Delega Efficace', 'Pratica la delega strutturata', 'delega', 'azione', 'intermedio', 45, 'Novembre',
'Delegare bene è un''arte.',
'Scegli un''attività da delegare.

1. PREPARA: Cosa deleghi? Risultato atteso? Vincoli?
2. SCEGLI: Chi è la persona giusta?
3. COMUNICA: Spiega COSA e PERCHÉ
4. FOLLOW-UP: Monitora senza micro-management

Documenta il processo e i risultati.',
'Attività delegata + processo seguito + risultato + feedback',
'["È stato difficile lasciare il controllo?", "Come è andata?", "Cosa hai imparato sulla delega?"]',
45),

(46, 'Motivazione Personalizzata', 'Scopri cosa motiva ogni membro del team', 'motivazione', 'analisi', 'intermedio', 50, 'Novembre',
'Le persone sono motivate da cose diverse.',
'Per ogni membro del tuo team (o 5 collaboratori chiave):

INTERVISTA (15 min ciascuno):
1. Cosa ti piace di più del tuo lavoro?
2. Cosa ti frustra?
3. Qual è il tuo sogno professionale?
4. Cosa ti motiva a dare il massimo?
5. Cosa posso fare per supportarti meglio?

Crea una "scheda motivazionale" per ciascuno.',
'Schede motivazionali per 5+ persone + 1 azione per ciascuno',
'["Cosa ti ha sorpreso?", "Le motivazioni sono diverse da quello che pensavi?", "Come userai queste informazioni?"]',
46),

(47, 'Ispira con lo Scopo', 'Collega il lavoro a uno scopo più grande', 'motivazione', 'azione', 'avanzato', 40, 'Novembre',
'Le persone sono motivate dallo scopo.',
'In una riunione di team:

1. Condividi la VISIONE: Perché esistiamo come team?
2. COLLEGA al lavoro quotidiano
3. ASCOLTA: Chiedi cosa li motiva
4. CO-CREA: Come aumentare il significato?

Documenta la sessione.',
'Agenda e output della riunione + feedback del team + azioni',
'["Come ha reagito il team?", "Cosa li motiva di più?", "Cosa cambierai?"]',
47),

-- MESE 12: AGIRE - Accountability ed Execution (Sett. 48-52)
(48, 'Responsabilità Totale', 'Pratica l''accountability radicale', 'accountability', 'sfida', 'avanzato', 35, 'Dicembre',
'L''accountability significa assumersi la responsabilità totale.',
'Per una settimana, ogni volta che qualcosa va storto:

INVECE di dare la colpa, chiediti:
1. Cosa avrei potuto fare per prevenirlo?
2. Quali segnali ho ignorato?
3. Come posso risolvere ORA?
4. Come evitare che si ripeta?

Documenta almeno 5 situazioni.',
'Diario di 5 situazioni + risposte accountable + lezioni',
'["È stato difficile non dare la colpa?", "Cosa hai scoperto sul tuo ruolo?", "Come cambia il tuo potere?"]',
48),

(49, 'From Plan to Action', 'Trasforma i piani in azioni concrete', 'execution', 'pianificazione', 'intermedio', 45, 'Dicembre',
'Molti piani falliscono nell''esecuzione.',
'Prendi un piano che sta procedendo lentamente.

1. CLARIFCA: L''obiettivo è SMART?
2. SCOMPONI: Quali sono i prossimi 5 passi?
3. ELIMINA OSTACOLI
4. CREA URGENZA
5. MONITORA: Come traccerai i progressi?',
'Piano rivisto + 5 next actions + responsabili + timeline',
'["Cosa bloccava l''esecuzione?", "Il piano era abbastanza specifico?", "Cosa farai diversamente?"]',
49),

(50, 'Weekly Review', 'Crea la tua routine di accountability', 'accountability', 'pianificazione', 'base', 30, 'Dicembre',
'I leader efficaci hanno routine di review.',
'Progetta la TUA Weekly Review (30-60 min):

1. REVIEW: Cosa ho completato? Cosa no? Perché?
2. PLAN: Top 3 priorità prossima settimana?
3. ALIGN: Sono allineato ai miei obiettivi?

Fai la prima review questa settimana.',
'Template della tua Weekly Review + prima review completata',
'["Quanto tempo hai dedicato?", "Cosa hai scoperto?", "Quando la farai ogni settimana?"]',
50),

(51, 'Sprint Finale', 'Concludi qualcosa di importante', 'execution', 'sfida', 'avanzato', 60, 'Dicembre',
'L''execution si dimostra completando.',
'Identifica UN progetto importante che puoi COMPLETARE questa settimana.

Esegui uno "Sprint":
1. Lunedì: Pianifica le azioni
2. Martedì-Giovedì: Esegui con focus totale
3. Venerdì: Completa e celebra

L''obiettivo è COMPLETARE, non "lavorarci".',
'Progetto completato + come ci sei riuscito + lezioni sull''execution',
'["Ce l''hai fatta?", "Cosa ti ha aiutato a completare?", "Cosa applicherai in futuro?"]',
51),

(52, 'Il Bilancio del Leader', 'Review finale del tuo anno di crescita', 'autenticita', 'analisi', 'intermedio', 90, 'Dicembre',
'È il momento di guardare indietro all''intero anno di crescita.',
'PARTE 1: REVIEW ANNO
Valuta 1-10 le 24 caratteristiche nei 4 pilastri.

PARTE 2: TOP INSIGHTS
- 3 cose più importanti imparate
- 3 cambiamenti più significativi
- 3 aree da continuare a sviluppare

PARTE 3: NEXT YEAR
- Come continuerai a crescere?
- Quale supporto ti serve?',
'Bilancio completo + autovalutazione 24 caratteristiche + piano prossimo anno',
'["Di cosa sei più orgoglioso?", "Cosa è ancora difficile?", "Come sei cambiato come leader?"]',
52)

) AS t(week_number, title, subtitle, characteristic_slug, exercise_type, difficulty_level, estimated_time_minutes, month_name, description, instructions, deliverable, reflection_prompts, sort_order);

-- Verifica
SELECT COUNT(*) as totale FROM exercises;
