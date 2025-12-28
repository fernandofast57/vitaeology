-- ============================================================
-- FIX CARATTERISTICHE #7, #8, #17
-- Correzione con dati originali dal libro
-- Data: 2024-12-24
-- ============================================================

-- ============================================================
-- 0. PRIMA: Aggiorna constraint per includere 'standard'
-- ============================================================

ALTER TABLE assessment_questions_v2
DROP CONSTRAINT IF EXISTS assessment_questions_v2_question_type_check;

ALTER TABLE assessment_questions_v2
ADD CONSTRAINT assessment_questions_v2_question_type_check
CHECK (question_type IN ('passive', 'interlocutory', 'active', 'standard'));

-- ============================================================
-- 1. AGGIORNA CARATTERISTICHE
-- ============================================================

-- #7: Sicurezza → Capacità di Giudicare
UPDATE characteristics_v2
SET
  name = 'Capacità di Giudicare',
  slug = 'capacita-giudicare',
  code = 'CG',
  description = 'Valutare fatti oggettivi separando dai pregiudizi personali'
WHERE pillar_order = 7;

-- #8: Resilienza → Entusiasmo
UPDATE characteristics_v2
SET
  name = 'Entusiasmo',
  slug = 'entusiasmo',
  code = 'EN',
  description = 'Energia contagiosa orientata verso obiettivi specifici'
WHERE pillar_order = 8;

-- #17: Empatia → Perfezionismo
UPDATE characteristics_v2
SET
  name = 'Perfezionismo',
  slug = 'perfezionismo',
  code = 'PF',
  description = 'Ricerca di eccellenza bilanciata con pragmatismo'
WHERE pillar_order = 17;

-- ============================================================
-- 2. ELIMINA DOMANDE VECCHIE
-- ============================================================

DELETE FROM assessment_questions_v2
WHERE code IN ('SI02', 'SI05', 'SI07', 'RE01', 'RE04', 'RE07', 'EM02', 'EM05', 'EM07');

-- ============================================================
-- 3. INSERISCI DOMANDE NUOVE (scoring diretto, tipo standard)
-- ============================================================

-- Capacità di Giudicare (CG)
INSERT INTO assessment_questions_v2 (characteristic_id, code, question_text, question_type, scoring_type, order_index, is_lite)
SELECT c.id, 'CG01',
  'Prima di formare un''opinione definitiva su una situazione complessa, con quale frequenza cerco di comprendere tutti i fatti rilevanti piuttosto che saltare a conclusioni immediate?',
  'standard', 'direct', 1, TRUE
FROM characteristics_v2 c WHERE c.code = 'CG';

INSERT INTO assessment_questions_v2 (characteristic_id, code, question_text, question_type, scoring_type, order_index, is_lite)
SELECT c.id, 'CG02',
  'COSA caratterizza i miei giudizi: apertura mentale che può cambiare idea di fronte a nuove evidenze, o rigidità che difende le posizioni iniziali?',
  'standard', 'direct', 2, TRUE
FROM characteristics_v2 c WHERE c.code = 'CG';

INSERT INTO assessment_questions_v2 (characteristic_id, code, question_text, question_type, scoring_type, order_index, is_lite)
SELECT c.id, 'CG03',
  'Quando devo valutare persone o situazioni, con quale costanza riesco a separare i fatti oggettivi dai miei pregiudizi personali?',
  'standard', 'direct', 3, TRUE
FROM characteristics_v2 c WHERE c.code = 'CG';

-- Entusiasmo (EN)
INSERT INTO assessment_questions_v2 (characteristic_id, code, question_text, question_type, scoring_type, order_index, is_lite)
SELECT c.id, 'EN01',
  'Quando lavoro su progetti che mi coinvolgono, COSA trasmetto abitualmente agli altri: energia contagiosa che li ispira o competenza fredda che li tiene a distanza?',
  'standard', 'direct', 1, TRUE
FROM characteristics_v2 c WHERE c.code = 'EN';

INSERT INTO assessment_questions_v2 (characteristic_id, code, question_text, question_type, scoring_type, order_index, is_lite)
SELECT c.id, 'EN02',
  'La mia energia è orientata verso obiettivi specifici o tende a disperdersi in molteplici direzioni simultanee senza focus chiaro?',
  'standard', 'direct', 2, TRUE
FROM characteristics_v2 c WHERE c.code = 'EN';

INSERT INTO assessment_questions_v2 (characteristic_id, code, question_text, question_type, scoring_type, order_index, is_lite)
SELECT c.id, 'EN03',
  'Di fronte a compiti ripetitivi ma necessari, con quale frequenza riesco a mantenere energia positiva piuttosto che cadere in routine meccanica?',
  'standard', 'direct', 3, TRUE
FROM characteristics_v2 c WHERE c.code = 'EN';

-- Perfezionismo (PF)
INSERT INTO assessment_questions_v2 (characteristic_id, code, question_text, question_type, scoring_type, order_index, is_lite)
SELECT c.id, 'PF01',
  'Quando produco qualcosa di importante, COSA riconosco che orienta la mia attenzione ai dettagli: ricerca di eccellenza che eleva la qualità o ossessione che paralizza l''azione?',
  'standard', 'direct', 1, TRUE
FROM characteristics_v2 c WHERE c.code = 'PF';

INSERT INTO assessment_questions_v2 (characteristic_id, code, question_text, question_type, scoring_type, order_index, is_lite)
SELECT c.id, 'PF02',
  'Con quale frequenza riesco a bilanciare standard elevati con pragmatismo, consegnando risultati eccellenti senza perdermi in perfezionamenti infiniti?',
  'standard', 'direct', 2, TRUE
FROM characteristics_v2 c WHERE c.code = 'PF';

INSERT INTO assessment_questions_v2 (characteristic_id, code, question_text, question_type, scoring_type, order_index, is_lite)
SELECT c.id, 'PF03',
  'Di fronte a piccole imperfezioni in un lavoro complessivamente solido, COSA riconosci che opera: capacità di accettarle strategicamente o bisogno compulsivo di correggerle tutte?',
  'standard', 'direct', 3, TRUE
FROM characteristics_v2 c WHERE c.code = 'PF';
