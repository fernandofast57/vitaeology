-- ============================================================
-- ASSESSMENT RISOLUTORE - Schema Database
-- Basato su "Oltre gli Ostacoli" (Rivoluzione Aurea - Libro I)
-- ============================================================

-- Nota: Riutilizza le tabelle esistenti _v2 per sessioni/risposte/risultati
-- Aggiunge solo le nuove tabelle per dimensioni e domande Risolutore

-- ============================================================
-- TABELLA 1: DIMENSIONI RISOLUTORE (7 dimensioni)
-- ============================================================

CREATE TABLE IF NOT EXISTS risolutore_dimensions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(2) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('filtro', 'traditore', 'scala')),
  scoring_type VARCHAR(10) NOT NULL CHECK (scoring_type IN ('direct', 'inverse')),
  description TEXT NOT NULL,
  color VARCHAR(7) NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserisci le 7 dimensioni
INSERT INTO risolutore_dimensions (code, name, category, scoring_type, description, color, sort_order) VALUES
-- 3 Filtri Risolutivi (scoring diretto)
('FP', 'Detective dei Pattern', 'filtro', 'direct', 'Capacità di riconoscere schemi ricorrenti e connessioni nascoste', '#10B981', 1),
('FS', 'Antenna dei Segnali', 'filtro', 'direct', 'Capacità di leggere bisogni non detti e comunicazioni nascoste', '#3B82F6', 2),
('FR', 'Radar delle Risorse', 'filtro', 'direct', 'Capacità di identificare e combinare creativamente risorse disponibili', '#8B5CF6', 3),
-- 3 Traditori Silenziosi (scoring inverso)
('TP', 'Il Paralizzante', 'traditore', 'inverse', 'Blocco che impedisce di iniziare per paura di sbagliare', '#EF4444', 4),
('TT', 'Il Timoroso', 'traditore', 'inverse', 'Paura del giudizio e dell''esposizione che limita l''azione', '#F97316', 5),
('TC', 'Il Procrastinatore', 'traditore', 'inverse', 'Tendenza a rimandare l''azione nonostante la consapevolezza', '#EAB308', 6),
-- Scala del Risolutore (scoring speciale per livelli)
('SR', 'Scala del Risolutore', 'scala', 'direct', 'Livello di maturità come risolutore (1-5)', '#6366F1', 7);

-- ============================================================
-- TABELLA 2: DOMANDE RISOLUTORE (48 domande)
-- ============================================================

CREATE TABLE IF NOT EXISTS risolutore_questions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  dimension_code VARCHAR(2) NOT NULL REFERENCES risolutore_dimensions(code),
  question_text TEXT NOT NULL,
  scoring_type VARCHAR(10) NOT NULL CHECK (scoring_type IN ('direct', 'inverse')),
  order_index INTEGER NOT NULL,
  level_group INTEGER, -- Solo per SR: 1-2, 3, 4-5
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INSERIMENTO 48 DOMANDE
-- ============================================================

-- FILTRO #01: DETECTIVE DEI PATTERN (FP01-FP06) - DIRECT
INSERT INTO risolutore_questions (code, dimension_code, question_text, scoring_type, order_index) VALUES
('FP01', 'FP', 'Quando affronto un problema ricorrente, riesco a identificare lo schema che si ripete', 'direct', 1),
('FP02', 'FP', 'Noto collegamenti tra situazioni apparentemente diverse che altri non vedono', 'direct', 2),
('FP03', 'FP', 'Prima di agire su un problema, mi chiedo "quando è già successo qualcosa di simile?"', 'direct', 3),
('FP04', 'FP', 'Riconosco i segnali precoci che indicano l''arrivo di una difficoltà già vista', 'direct', 4),
('FP05', 'FP', 'Di fronte a una crisi, riesco a vedere il pattern sottostante invece di reagire al singolo evento', 'direct', 5),
('FP06', 'FP', 'Uso le esperienze passate come mappa per orientarmi in situazioni nuove', 'direct', 6);

-- FILTRO #02: ANTENNA DEI SEGNALI (FS01-FS06) - DIRECT
INSERT INTO risolutore_questions (code, dimension_code, question_text, scoring_type, order_index) VALUES
('FS01', 'FS', 'Percepisco quando qualcuno ha bisogno di aiuto anche se non lo chiede esplicitamente', 'direct', 7),
('FS02', 'FS', 'Colgo il vero significato dietro le parole, non solo quello letterale', 'direct', 8),
('FS03', 'FS', 'Noto i cambiamenti di tono o di comportamento che indicano qualcosa di non detto', 'direct', 9),
('FS04', 'FS', 'Riesco a capire cosa preoccupa davvero le persone, oltre a quello che dichiarano', 'direct', 10),
('FS05', 'FS', 'Leggo l''atmosfera di una stanza appena entro, cogliendo tensioni o aperture', 'direct', 11),
('FS06', 'FS', 'Quando qualcuno dice "va tutto bene" ma non è vero, me ne accorgo', 'direct', 12);

-- FILTRO #03: RADAR DELLE RISORSE (FR01-FR06) - DIRECT
INSERT INTO risolutore_questions (code, dimension_code, question_text, scoring_type, order_index) VALUES
('FR01', 'FR', 'Vedo risorse e possibilità dove altri vedono solo limiti', 'direct', 13),
('FR02', 'FR', 'Riesco a combinare elementi diversi per creare soluzioni non convenzionali', 'direct', 14),
('FR03', 'FR', 'Quando mancano risorse tradizionali, trovo alternative creative', 'direct', 15),
('FR04', 'FR', 'Identifico competenze e talenti nelle persone che loro stesse non riconoscono', 'direct', 16),
('FR05', 'FR', 'Trasformo vincoli in opportunità di innovazione', 'direct', 17),
('FR06', 'FR', 'Mi chiedo "cosa posso ottenere temporaneamente o in prestito?" invece di fermarmi a "non ce l''ho"', 'direct', 18);

-- TRADITORE #01: IL PARALIZZANTE (TP01-TP06) - INVERSE
INSERT INTO risolutore_questions (code, dimension_code, question_text, scoring_type, order_index) VALUES
('TP01', 'TP', 'Aspetto di avere tutte le informazioni prima di fare il primo passo', 'inverse', 19),
('TP02', 'TP', 'L''idea di sbagliare mi blocca più della difficoltà stessa del problema', 'inverse', 20),
('TP03', 'TP', 'Rimugino a lungo sulle possibili conseguenze negative prima di agire', 'inverse', 21),
('TP04', 'TP', 'Preferisco non decidere piuttosto che rischiare una decisione sbagliata', 'inverse', 22),
('TP05', 'TP', 'Quando un problema sembra complesso, mi sento sopraffatto e non so da dove iniziare', 'inverse', 23),
('TP06', 'TP', 'La ricerca della perfezione mi impedisce di completare i progetti', 'inverse', 24);

-- TRADITORE #02: IL TIMOROSO (TT01-TT06) - INVERSE
INSERT INTO risolutore_questions (code, dimension_code, question_text, scoring_type, order_index) VALUES
('TT01', 'TT', 'Evito di proporre soluzioni per paura che vengano criticate', 'inverse', 25),
('TT02', 'TT', 'Mi preoccupo più di cosa penseranno gli altri che di risolvere il problema', 'inverse', 26),
('TT03', 'TT', 'Preferisco non espormi anche quando ho un''idea che potrebbe funzionare', 'inverse', 27),
('TT04', 'TT', 'Il timore di sembrare incompetente mi frena dal chiedere aiuto', 'inverse', 28),
('TT05', 'TT', 'Minimizzo i miei contributi per non attirare troppa attenzione', 'inverse', 29),
('TT06', 'TT', 'Ho difficoltà a sostenere le mie posizioni quando vengono messe in discussione', 'inverse', 30);

-- TRADITORE #03: IL PROCRASTINATORE (TC01-TC06) - INVERSE
INSERT INTO risolutore_questions (code, dimension_code, question_text, scoring_type, order_index) VALUES
('TC01', 'TC', 'So cosa dovrei fare ma trovo sempre un motivo per rimandare', 'inverse', 31),
('TC02', 'TC', 'Le attività urgenti hanno sempre la precedenza su quelle importanti', 'inverse', 32),
('TC03', 'TC', 'Inizio molti progetti con entusiasmo ma fatico a portarli a termine', 'inverse', 33),
('TC04', 'TC', 'Mi dico "lo faccio domani" anche per cose che potrei fare oggi', 'inverse', 34),
('TC05', 'TC', 'Dedico tempo a preparare invece che a fare, anche quando sono già pronto', 'inverse', 35),
('TC06', 'TC', 'Le scadenze sono l''unica cosa che mi fa passare all''azione', 'inverse', 36);

-- SCALA DEL RISOLUTORE (SR01-SR12) - DIRECT con level_group
-- Livello 1-2: SR01-SR04
INSERT INTO risolutore_questions (code, dimension_code, question_text, scoring_type, order_index, level_group) VALUES
('SR01', 'SR', 'Applico consapevolmente una strategia prima di affrontare un problema', 'direct', 37, 1),
('SR02', 'SR', 'Documento le mie soluzioni per poterle replicare in futuro', 'direct', 38, 1),
('SR03', 'SR', 'Ottengo risultati consistenti quando affronto problemi nel mio ambito', 'direct', 39, 1),
('SR04', 'SR', 'Ho sviluppato un metodo personale per gestire le difficoltà ricorrenti', 'direct', 40, 1);

-- Livello 3: SR05-SR08
INSERT INTO risolutore_questions (code, dimension_code, question_text, scoring_type, order_index, level_group) VALUES
('SR05', 'SR', 'Altri mi cercano per avere il mio punto di vista su problemi complessi', 'direct', 41, 2),
('SR06', 'SR', 'Riesco a influenzare i processi del mio team o organizzazione', 'direct', 42, 2),
('SR07', 'SR', 'Prendo decisioni autonome su questioni importanti nel mio ambito', 'direct', 43, 2),
('SR08', 'SR', 'Ho guadagnato credibilità come "persona che risolve" nel mio ambiente', 'direct', 44, 2);

-- Livello 4-5: SR09-SR12
INSERT INTO risolutore_questions (code, dimension_code, question_text, scoring_type, order_index, level_group) VALUES
('SR09', 'SR', 'Insegno ad altri come affrontare problemi in modo sistematico', 'direct', 45, 3),
('SR10', 'SR', 'Le mie soluzioni hanno impatto oltre il mio team o reparto', 'direct', 46, 3),
('SR11', 'SR', 'Contribuisco a cambiare il modo in cui la mia organizzazione affronta i problemi', 'direct', 47, 3),
('SR12', 'SR', 'Creo le condizioni perché altri sviluppino le proprie capacità risolutive', 'direct', 48, 3);

-- ============================================================
-- TABELLA 3: RISULTATI RISOLUTORE (per salvare risultati calcolati)
-- ============================================================

CREATE TABLE IF NOT EXISTS risolutore_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES user_assessments_v2(id) ON DELETE CASCADE,
  dimension_code VARCHAR(2) NOT NULL REFERENCES risolutore_dimensions(code),
  score DECIMAL(4,2) NOT NULL,
  percentage INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, dimension_code)
);

-- Tabella per il livello risolutore (scala 1-5)
CREATE TABLE IF NOT EXISTS risolutore_level_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES user_assessments_v2(id) ON DELETE CASCADE UNIQUE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  level_name VARCHAR(50) NOT NULL,
  level_description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELLA 4: RISPOSTE RISOLUTORE (scala 0-2)
-- Tabella separata perché scala diversa da Leadership (1-5)
-- ============================================================

CREATE TABLE IF NOT EXISTS risolutore_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES user_assessments_v2(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES risolutore_questions(id),
  raw_score INTEGER NOT NULL CHECK (raw_score BETWEEN 0 AND 2),
  normalized_score INTEGER NOT NULL CHECK (normalized_score BETWEEN 0 AND 2),
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_risolutore_answers_assessment
  ON risolutore_answers(assessment_id);

-- RLS per risposte
ALTER TABLE risolutore_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Risposte visibili al proprietario" ON risolutore_answers
  FOR SELECT USING (
    assessment_id IN (
      SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Risposte inseribili dal proprietario" ON risolutore_answers
  FOR INSERT WITH CHECK (
    assessment_id IN (
      SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Risposte aggiornabili dal proprietario" ON risolutore_answers
  FOR UPDATE USING (
    assessment_id IN (
      SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- AGGIORNA CHECK CONSTRAINT su user_assessments_v2
-- ============================================================

-- Rimuovi il vecchio constraint e aggiungi quello nuovo
ALTER TABLE user_assessments_v2
  DROP CONSTRAINT IF EXISTS user_assessments_v2_assessment_type_check;

ALTER TABLE user_assessments_v2
  ADD CONSTRAINT user_assessments_v2_assessment_type_check
  CHECK (assessment_type IN ('lite', 'full', 'risolutore', 'microfelicita'));

-- ============================================================
-- RLS (Row Level Security) - Politiche
-- ============================================================

-- Abilita RLS sulle nuove tabelle
ALTER TABLE risolutore_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risolutore_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risolutore_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE risolutore_level_results ENABLE ROW LEVEL SECURITY;

-- Politiche per dimensioni e domande (lettura pubblica)
CREATE POLICY "Dimensioni leggibili da tutti" ON risolutore_dimensions
  FOR SELECT USING (true);

CREATE POLICY "Domande leggibili da tutti" ON risolutore_questions
  FOR SELECT USING (true);

-- Politiche per risultati (solo proprietario)
CREATE POLICY "Risultati visibili al proprietario" ON risolutore_results
  FOR SELECT USING (
    assessment_id IN (
      SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Risultati inseribili dal proprietario" ON risolutore_results
  FOR INSERT WITH CHECK (
    assessment_id IN (
      SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Livello visibile al proprietario" ON risolutore_level_results
  FOR SELECT USING (
    assessment_id IN (
      SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Livello inseribile dal proprietario" ON risolutore_level_results
  FOR INSERT WITH CHECK (
    assessment_id IN (
      SELECT id FROM user_assessments_v2 WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- INDICI per performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_risolutore_questions_dimension
  ON risolutore_questions(dimension_code);

CREATE INDEX IF NOT EXISTS idx_risolutore_results_assessment
  ON risolutore_results(assessment_id);

CREATE INDEX IF NOT EXISTS idx_risolutore_level_results_assessment
  ON risolutore_level_results(assessment_id);

-- ============================================================
-- VERIFICA INSERIMENTO
-- ============================================================

-- Query di verifica (esegui dopo l'inserimento)
-- SELECT COUNT(*) as total_questions FROM risolutore_questions;
-- SELECT dimension_code, COUNT(*) as count FROM risolutore_questions GROUP BY dimension_code ORDER BY dimension_code;
-- SELECT * FROM risolutore_dimensions ORDER BY sort_order;
