-- =============================================
-- VITAEOLOGY v2 - SEZIONE 3/8
-- INSERT 24 Caratteristiche
-- Eseguire DOPO sezione 2
-- =============================================

INSERT INTO characteristics (
  slug, name_familiar, name_barrios, pillar, pillar_order, 
  description_validante, color_hex, sort_order
) VALUES
-- PILASTRO 1: VISION 🔵
('autoconsapevolezza', 'Autoconsapevolezza', 'Motivazione', 'Vision', 1, 
 'La capacità di vedere te stesso mentre operi', '#0F4C81', 1),
('coraggio', 'Coraggio', 'Coraggio', 'Vision', 2, 
 'La capacità di agire nonostante l''incertezza', '#0F4C81', 2),
('visione', 'Visione', 'Dedizione agli Obiettivi', 'Vision', 3, 
 'La capacità di vedere oltre l''immediato', '#0F4C81', 3),
('pensiero-strategico', 'Pensiero Strategico', 'Conoscenza', 'Vision', 4, 
 'La capacità di connettere cause e effetti', '#0F4C81', 4),
('valori', 'Valori', 'Onestà', 'Vision', 5, 
 'La capacità di operare con integrità', '#0F4C81', 5),
('creativita', 'Creatività', 'Ottimismo', 'Vision', 6, 
 'La capacità di vedere possibilità dove altri vedono ostacoli', '#0F4C81', 6),

-- PILASTRO 2: ACTION 🔴
('decisionalita', 'Decisionalità', 'Capacità di Giudicare', 'Action', 1, 
 'La capacità di scegliere con chiarezza', '#C1272D', 7),
('disciplina', 'Disciplina', 'Entusiasmo', 'Action', 2, 
 'La capacità di mantenere energia costante', '#C1272D', 8),
('innovazione', 'Innovazione', 'Voglia di Correre Rischi', 'Action', 3, 
 'La capacità di esplorare il nuovo', '#C1272D', 9),
('perseveranza', 'Perseveranza', 'Energia Dinamica', 'Action', 4, 
 'La capacità di continuare nonostante gli ostacoli', '#C1272D', 10),
('responsabilita', 'Responsabilità', 'Intraprendenza', 'Action', 5, 
 'La capacità di assumerti ownership', '#C1272D', 11),
('efficienza', 'Efficienza', 'Persuasione', 'Action', 6, 
 'La capacità di ottenere risultati con risorse limitate', '#C1272D', 12),

-- PILASTRO 3: RELATIONS 🟢
('fiducia', 'Fiducia', 'Socievolezza', 'Relations', 1, 
 'La capacità di costruire relazioni autentiche', '#2D9B6D', 13),
('comunicazione', 'Comunicazione', 'Comunicazione', 'Relations', 2, 
 'La capacità di creare comprensione condivisa', '#2D9B6D', 14),
('ascolto', 'Ascolto', 'Pazienza', 'Relations', 3, 
 'La capacità di ricevere prima di rispondere', '#2D9B6D', 15),
('empatia', 'Empatia', 'Percezione', 'Relations', 4, 
 'La capacità di sentire ciò che l''altro sente', '#2D9B6D', 16),
('delega', 'Delega', 'Empatia', 'Relations', 5, 
 'La capacità di far crescere altri attraverso responsabilità', '#2D9B6D', 17),
('feedback', 'Feedback', 'Capacità di Delegare', 'Relations', 6, 
 'La capacità di restituire informazioni utili', '#2D9B6D', 18),

-- PILASTRO 4: ADAPTATION 🟠
('sviluppo-team', 'Sviluppo Team', 'Versatilità', 'Adaptation', 1, 
 'La capacità di far crescere le persone', '#E87722', 19),
('adattabilita', 'Adattabilità', 'Adattabilità', 'Adaptation', 2, 
 'La capacità di cambiare approccio quando serve', '#E87722', 20),
('apprendimento', 'Apprendimento Continuo', 'Curiosità', 'Adaptation', 3, 
 'La capacità di restare aperto al nuovo', '#E87722', 21),
('inclusione', 'Inclusione', 'Individualismo', 'Adaptation', 4, 
 'La capacità di valorizzare le differenze', '#E87722', 22),
('resilienza', 'Resilienza', 'Idealismo', 'Adaptation', 5, 
 'La capacità di riprendersi dopo le difficoltà', '#E87722', 23),
('orientamento-risultati', 'Orientamento ai Risultati', 'Immaginazione', 'Adaptation', 6, 
 'La capacità di tradurre visione in outcome', '#E87722', 24);

-- Verifica
DO $$ 
DECLARE row_count INTEGER;
BEGIN 
  SELECT COUNT(*) INTO row_count FROM characteristics;
  RAISE NOTICE '✅ Sezione 3/8 completata: % caratteristiche inserite', row_count;
END $$;
