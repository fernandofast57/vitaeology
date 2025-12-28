-- ============================================================
-- LEADERSHIP LITE v2 - Struttura dal Libro
-- 24 Caratteristiche + 72 Domande (3 per caratteristica)
-- Data: 2024-12-24
-- ============================================================

-- ============================================================
-- 1. TABELLA CHARACTERISTICS_V2
-- ============================================================

CREATE TABLE IF NOT EXISTS public.characteristics_v2 (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(2) NOT NULL UNIQUE,
  pillar VARCHAR(20) NOT NULL CHECK (pillar IN ('visione', 'azione', 'relazioni', 'adattamento')),
  pillar_order INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index per ricerche
CREATE INDEX IF NOT EXISTS idx_characteristics_v2_slug ON characteristics_v2(slug);
CREATE INDEX IF NOT EXISTS idx_characteristics_v2_code ON characteristics_v2(code);
CREATE INDEX IF NOT EXISTS idx_characteristics_v2_pillar ON characteristics_v2(pillar);

-- RLS
ALTER TABLE public.characteristics_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view characteristics_v2" ON public.characteristics_v2;
CREATE POLICY "Anyone can view characteristics_v2"
ON public.characteristics_v2 FOR SELECT
USING (true);

-- ============================================================
-- 2. INSERT 24 CARATTERISTICHE
-- ============================================================

INSERT INTO characteristics_v2 (name, slug, code, pillar, pillar_order, description) VALUES
-- PILASTRO 1: VISIONE (6 caratteristiche)
('Motivazione', 'motivazione', 'MO', 'visione', 1, 'Il fuoco interno che ti spinge ad agire'),
('Coraggio', 'coraggio', 'CO', 'visione', 2, 'Dire verità scomode quando conta'),
('Dedizione agli Obiettivi', 'dedizione-obiettivi', 'DE', 'visione', 3, 'Perseveranza oltre gli ostacoli'),
('Conoscenza', 'conoscenza', 'CN', 'visione', 4, 'Comprensione profonda rispetto a informazione superficiale'),
('Onestà', 'onesta', 'ON', 'visione', 5, 'Integrità anche quando costa'),
('Ottimismo', 'ottimismo', 'OT', 'visione', 6, 'Vedere possibilità rispetto a focalizzare problemi'),

-- PILASTRO 2: AZIONE (6 caratteristiche)
('Sicurezza in Sé', 'sicurezza-se', 'SI', 'azione', 7, 'Fiducia nelle proprie capacità e decisioni'),
('Resilienza', 'resilienza', 'RE', 'azione', 8, 'Riprendersi dagli errori e trasformarli in apprendimento'),
('Apertura al Rischio', 'apertura-rischio', 'RI', 'azione', 9, 'Rischi calcolati basati su analisi, non paure'),
('Energia Dinamica', 'energia-dinamica', 'ED', 'azione', 10, 'Creare opportunità invece di attendere'),
('Intraprendenza', 'intraprendenza', 'IN', 'azione', 11, 'Iniziativa e soluzioni creative'),
('Persuasione', 'persuasione', 'PE', 'azione', 12, 'Influenzare attraverso la forza delle idee'),

-- PILASTRO 3: RELAZIONI (6 caratteristiche)
('Socievolezza', 'socievolezza', 'SO', 'relazioni', 13, 'Connessione autentica con gli altri'),
('Comunicazione', 'comunicazione', 'CM', 'relazioni', 14, 'Ascoltare attentamente e rispondere con chiarezza'),
('Pazienza', 'pazienza', 'PA', 'relazioni', 15, 'Comprendere che risultati di valore richiedono tempo'),
('Percezione', 'percezione', 'PC', 'relazioni', 16, 'Cogliere segnali non verbali e comprendere'),
('Empatia', 'empatia', 'EM', 'relazioni', 17, 'Mettersi nei panni degli altri prima di giudicare'),
('Senso dell''Umorismo', 'senso-umorismo', 'UM', 'relazioni', 18, 'Leggerezza che alleggerisce senza sminuire'),

-- PILASTRO 4: ADATTAMENTO (6 caratteristiche)
('Versatilità', 'versatilita', 'VE', 'adattamento', 19, 'Integrare conoscenze da campi diversi'),
('Adattabilità', 'adattabilita', 'AD', 'adattamento', 20, 'Adattare rapidamente l''approccio al cambiamento'),
('Curiosità', 'curiosita', 'CU', 'adattamento', 21, 'Volontà di comprendere a fondo'),
('Individualismo', 'individualismo', 'ID', 'adattamento', 22, 'Pensiero indipendente anche quando differisce dal gruppo'),
('Idealismo', 'idealismo', 'IL', 'adattamento', 23, 'Credere in valori più alti senza perdere pragmatismo'),
('Immaginazione', 'immaginazione', 'IM', 'adattamento', 24, 'Immaginare soluzioni creative a problemi complessi')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 3. TABELLA ASSESSMENT_QUESTIONS_V2
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assessment_questions_v2 (
  id SERIAL PRIMARY KEY,
  characteristic_id INTEGER NOT NULL REFERENCES characteristics_v2(id),
  code VARCHAR(4) NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(15) NOT NULL CHECK (question_type IN ('passive', 'interlocutory', 'active')),
  scoring_type VARCHAR(10) NOT NULL CHECK (scoring_type IN ('inverse', 'direct')),
  order_index INTEGER NOT NULL,
  is_lite BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_questions_v2_char ON assessment_questions_v2(characteristic_id);
CREATE INDEX IF NOT EXISTS idx_questions_v2_code ON assessment_questions_v2(code);
CREATE INDEX IF NOT EXISTS idx_questions_v2_lite ON assessment_questions_v2(is_lite) WHERE is_lite = TRUE;

-- RLS
ALTER TABLE public.assessment_questions_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active questions_v2" ON public.assessment_questions_v2;
CREATE POLICY "Anyone can view active questions_v2"
ON public.assessment_questions_v2 FOR SELECT
USING (is_active = true);

-- ============================================================
-- 4. INSERT 72 DOMANDE LITE
-- ============================================================

-- Helper: inserisce domanda con lookup characteristic
INSERT INTO assessment_questions_v2 (characteristic_id, code, question_text, question_type, scoring_type, order_index, is_lite)
SELECT c.id, q.code, q.question_text, q.question_type, q.scoring_type, q.order_index, TRUE
FROM characteristics_v2 c
JOIN (VALUES
  -- MOTIVAZIONE (MO)
  ('MO', 'MO02', 'Mi trovo spesso a lavorare duramente solo quando c''è una scadenza o pressione esterna', 'passive', 'inverse', 2),
  ('MO', 'MO05', 'Quando inizio un nuovo progetto con entusiasmo, riesco a mantenerlo solo le prime settimane', 'interlocutory', 'inverse', 5),
  ('MO', 'MO08', 'La mia spinta a lavorare viene da dentro, non da premi o minacce esterne', 'active', 'direct', 8),

  -- CORAGGIO (CO)
  ('CO', 'CO03', 'Di fronte a un''opportunità rischiosa, la paura mi blocca anche quando so che potrebbe essere giusta', 'passive', 'inverse', 3),
  ('CO', 'CO04', 'Evito le conversazioni difficili anche quando so che sarebbero necessarie', 'interlocutory', 'inverse', 4),
  ('CO', 'CO09', 'La paura non mi impedisce di agire quando riconosco che è la cosa giusta da fare', 'active', 'direct', 9),

  -- DEDIZIONE (DE)
  ('DE', 'DE02', 'Ho molti progetti iniziati e pochi completati', 'passive', 'inverse', 2),
  ('DE', 'DE04', 'Gli ostacoli mi fanno dubitare se l''obiettivo valga davvero la pena', 'interlocutory', 'inverse', 4),
  ('DE', 'DE07', 'Le difficoltà rafforzano la mia determinazione invece di indebolirla', 'active', 'direct', 7),

  -- CONOSCENZA (CN)
  ('CN', 'CN01', 'Penso di sapere già abbastanza sul mio campo senza bisogno di studiare ancora', 'passive', 'inverse', 1),
  ('CN', 'CN05', 'Considero lo studio come qualcosa che si fa a scuola, non nel lavoro quotidiano', 'interlocutory', 'inverse', 5),
  ('CN', 'CN07', 'Quando incontro un concetto nuovo, cerco attivamente di comprenderlo a fondo', 'active', 'direct', 7),

  -- ONESTÀ (ON)
  ('ON', 'ON02', 'Ometto informazioni importanti se rivelano miei errori', 'passive', 'inverse', 2),
  ('ON', 'ON05', 'Evito di ammettere quando non so qualcosa', 'interlocutory', 'inverse', 5),
  ('ON', 'ON06', 'Ammetto i miei errori apertamente, anche quando potrei nasconderli', 'active', 'direct', 6),

  -- OTTIMISMO (OT)
  ('OT', 'OT02', 'Quando qualcosa va male, penso che andrà sempre peggio', 'passive', 'inverse', 2),
  ('OT', 'OT05', 'Faccio fatica a vedere il lato positivo delle situazioni difficili', 'interlocutory', 'inverse', 5),
  ('OT', 'OT09', 'Riesco a trovare aspetti positivi anche nelle situazioni sfidanti', 'active', 'direct', 9),

  -- SICUREZZA (SI)
  ('SI', 'SI02', 'Cerco continuamente conferme esterne prima di fidarmi delle mie decisioni', 'passive', 'inverse', 2),
  ('SI', 'SI05', 'Mi sento inadeguato rispetto ai colleghi anche quando i risultati dicono il contrario', 'interlocutory', 'inverse', 5),
  ('SI', 'SI07', 'Prendo decisioni senza bisogno costante di conferme esterne', 'active', 'direct', 7),

  -- RESILIENZA (RE)
  ('RE', 'RE01', 'Quando fallisco, faccio fatica a riprendermi e ripartire', 'passive', 'inverse', 1),
  ('RE', 'RE04', 'Gli errori passati continuano a pesarmi invece di diventare lezioni', 'interlocutory', 'inverse', 4),
  ('RE', 'RE07', 'Trasformo gli insuccessi in opportunità di apprendimento', 'active', 'direct', 7),

  -- RISCHIO (RI)
  ('RI', 'RI03', 'La possibilità di perdere mi blocca anche quando potrei guadagnare molto di più', 'passive', 'inverse', 3),
  ('RI', 'RI04', 'Scelgo sempre l''opzione più sicura, anche quando non è la migliore', 'interlocutory', 'inverse', 4),
  ('RI', 'RI09', 'Prendo rischi calcolati basati su analisi, non su paure', 'active', 'direct', 9),

  -- ENERGIA (ED)
  ('ED', 'ED01', 'Aspetto che le cose accadano invece di farle accadere', 'passive', 'inverse', 1),
  ('ED', 'ED04', 'La mia energia è reattiva: rispondo quando stimolato, non anticipo', 'interlocutory', 'inverse', 4),
  ('ED', 'ED07', 'Creo opportunità invece di attendere che si presentino', 'active', 'direct', 7),

  -- INTRAPRENDENZA (IN)
  ('IN', 'IN01', 'Di fronte a un problema, aspetto che qualcuno mi dia la soluzione', 'passive', 'inverse', 1),
  ('IN', 'IN05', 'Mi sento perso quando non ho istruzioni chiare su come procedere', 'interlocutory', 'inverse', 5),
  ('IN', 'IN06', 'Trovo soluzioni creative quando i metodi standard non funzionano', 'active', 'direct', 6),

  -- PERSUASIONE (PE)
  ('PE', 'PE01', 'Quando voglio convincere qualcuno, insisto fino a che non cede', 'passive', 'inverse', 1),
  ('PE', 'PE05', 'Vedo il disaccordo come ostacolo da superare, non come contributo', 'interlocutory', 'inverse', 5),
  ('PE', 'PE08', 'Persuado attraverso la forza dell''idea, non la pressione', 'active', 'direct', 8),

  -- SOCIEVOLEZZA (SO)
  ('SO', 'SO01', 'Preferisco lavorare da solo perché le relazioni professionali mi pesano', 'passive', 'inverse', 1),
  ('SO', 'SO05', 'Vedo le relazioni come complicazioni più che risorse', 'interlocutory', 'inverse', 5),
  ('SO', 'SO09', 'Vedo le relazioni come una risorsa preziosa, non come distrazione', 'active', 'direct', 9),

  -- COMUNICAZIONE (CM)
  ('CM', 'CM02', 'Interrompo gli altri perché ciò che devo dire è più importante', 'passive', 'inverse', 2),
  ('CM', 'CM05', 'Mi concentro su cosa dire dopo invece di ascoltare davvero', 'interlocutory', 'inverse', 5),
  ('CM', 'CM07', 'Ascolto attentamente prima di rispondere', 'active', 'direct', 7),

  -- PAZIENZA (PA)
  ('PA', 'PA01', 'Quando qualcosa richiede tempo per svilupparsi, mi irrito e voglio forzare risultati', 'passive', 'inverse', 1),
  ('PA', 'PA04', 'Abbandono progetti che non danno risultati rapidi', 'interlocutory', 'inverse', 4),
  ('PA', 'PA07', 'Comprendo che risultati di valore richiedono tempo', 'active', 'direct', 7),

  -- PERCEZIONE (PC)
  ('PC', 'PC01', 'Perdo dettagli importanti perché non osservo attentamente', 'passive', 'inverse', 1),
  ('PC', 'PC05', 'La mia attenzione è superficiale, non cogliendo ciò che sta sotto la superficie', 'interlocutory', 'inverse', 5),
  ('PC', 'PC07', 'Colgo segnali non verbali e li uso per comprendere meglio', 'active', 'direct', 7),

  -- EMPATIA (EM)
  ('EM', 'EM02', 'Tendo a giudicare le emozioni altrui invece di comprenderle', 'passive', 'inverse', 2),
  ('EM', 'EM05', 'Rispondo ai problemi altrui con soluzioni logiche invece di comprensione emotiva', 'interlocutory', 'inverse', 5),
  ('EM', 'EM07', 'Mi metto nei panni degli altri prima di giudicare', 'active', 'direct', 7),

  -- UMORISMO (UM)
  ('UM', 'UM01', 'Prendo tutto troppo seriamente, anche quando leggerezza aiuterebbe', 'passive', 'inverse', 1),
  ('UM', 'UM04', 'Quando sono sotto pressione, perdo completamente la capacità di sdrammatizzare', 'interlocutory', 'inverse', 4),
  ('UM', 'UM06', 'Uso l''umorismo per alleggerire situazioni tese senza sminuirle', 'active', 'direct', 6),

  -- VERSATILITÀ (VE)
  ('VE', 'VE02', 'Quando devo operare fuori dalla mia zona di comfort, la mia efficacia crolla', 'passive', 'inverse', 2),
  ('VE', 'VE05', 'Faccio fatica ad applicare ciò che so a contesti nuovi', 'interlocutory', 'inverse', 5),
  ('VE', 'VE07', 'Integro conoscenze da campi diversi per creare soluzioni', 'active', 'direct', 7),

  -- ADATTABILITÀ (AD)
  ('AD', 'AD02', 'Insisto su soluzioni che funzionavano prima anche se ora non funzionano', 'passive', 'inverse', 2),
  ('AD', 'AD04', 'Preferisco che le cose restino stabili perché il cambiamento mi disorienta', 'interlocutory', 'inverse', 4),
  ('AD', 'AD06', 'Adatto rapidamente il mio approccio quando la situazione cambia', 'active', 'direct', 6),

  -- CURIOSITÀ (CU)
  ('CU', 'CU01', 'Accetto informazioni superficiali senza approfondire', 'passive', 'inverse', 1),
  ('CU', 'CU05', 'Mi accontento di spiegazioni semplici senza scavare più a fondo', 'interlocutory', 'inverse', 5),
  ('CU', 'CU06', 'Quando incontro qualcosa di nuovo, voglio comprenderlo a fondo', 'active', 'direct', 6),

  -- INDIVIDUALISMO (ID)
  ('ID', 'ID01', 'Seguo le opinioni del gruppo per non creare conflitto', 'passive', 'inverse', 1),
  ('ID', 'ID04', 'Mi conformo alle aspettative anche quando non le condivido', 'interlocutory', 'inverse', 4),
  ('ID', 'ID06', 'Penso in modo indipendente anche quando differisco dal gruppo', 'active', 'direct', 6),

  -- IDEALISMO (IL)
  ('IL', 'IL03', 'Agisco solo per interesse personale senza considerazioni etiche', 'passive', 'inverse', 3),
  ('IL', 'IL05', 'Giustifico qualsiasi mezzo se raggiunge il risultato', 'interlocutory', 'inverse', 5),
  ('IL', 'IL08', 'Credo in valori più alti senza perdere pragmatismo', 'active', 'direct', 8),

  -- IMMAGINAZIONE (IM)
  ('IM', 'IM01', 'Vedo solo ciò che esiste, faccio fatica a immaginare alternative', 'passive', 'inverse', 1),
  ('IM', 'IM05', 'Preferisco copiare soluzioni esistenti piuttosto che inventarne', 'interlocutory', 'inverse', 5),
  ('IM', 'IM07', 'Immagino soluzioni creative a problemi complessi', 'active', 'direct', 7)

) AS q(char_code, code, question_text, question_type, scoring_type, order_index)
ON c.code = q.char_code
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 5. VERIFICA
-- ============================================================

-- Verifica caratteristiche
SELECT 'Caratteristiche v2:' as info, COUNT(*) as count FROM characteristics_v2;

-- Verifica domande per pilastro
SELECT
  c.pillar,
  COUNT(q.id) as domande_count
FROM characteristics_v2 c
LEFT JOIN assessment_questions_v2 q ON q.characteristic_id = c.id
GROUP BY c.pillar
ORDER BY MIN(c.pillar_order);

-- Verifica totale domande LITE
SELECT 'Domande LITE:' as info, COUNT(*) as count FROM assessment_questions_v2 WHERE is_lite = TRUE;

-- Verifica distribuzione per tipo
SELECT
  question_type,
  scoring_type,
  COUNT(*) as count
FROM assessment_questions_v2
GROUP BY question_type, scoring_type
ORDER BY question_type;
