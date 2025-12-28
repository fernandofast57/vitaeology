-- STEP 1: Tabella dimensioni Microfelicità
CREATE TABLE IF NOT EXISTS microfelicita_dimensions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(3) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('radar', 'sabotatore', 'livello')),
  scoring_type VARCHAR(10) NOT NULL CHECK (scoring_type IN ('direct', 'inverse')),
  description TEXT NOT NULL,
  color VARCHAR(7) NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5 Fasi R.A.D.A.R. (scoring diretto)
INSERT INTO microfelicita_dimensions (code, name, category, scoring_type, description, color, sort_order) VALUES
('RR', 'Rileva', 'radar', 'direct', 'Capacità di cogliere il primo segnale debole di benessere', '#8B5CF6', 1),
('RA', 'Accogli', 'radar', 'direct', 'Capacità di lasciare arrivare il segnale senza resistenza', '#A78BFA', 2),
('RD', 'Distingui', 'radar', 'direct', 'Capacità di riconoscere se un segnale è nutriente o sabotante', '#C4B5FD', 3),
('RM', 'Amplifica', 'radar', 'direct', 'Capacità di mantenere l''attenzione sul segnale per 2-3 secondi', '#DDD6FE', 4),
('RS', 'Resta', 'radar', 'direct', 'Capacità di stabilizzare l''esperienza e completare il ciclo', '#EDE9FE', 5),
-- 5 Sabotatori Automatici (scoring inverso)
('SM', 'Minimizzazione Istantanea', 'sabotatore', 'inverse', 'Pattern che svaluta immediatamente il segnale positivo', '#EF4444', 6),
('SA', 'Anticipo Protettivo', 'sabotatore', 'inverse', 'Pattern che proietta preoccupazioni future sul momento presente', '#F97316', 7),
('SI', 'Auto-Interruzione Cognitiva', 'sabotatore', 'inverse', 'Pattern che riempie lo spazio con analisi premature', '#EAB308', 8),
('SC', 'Cambio di Fuoco Immediato', 'sabotatore', 'inverse', 'Pattern che sposta l''attenzione su elementi più urgenti', '#84CC16', 9),
('SE', 'Correzione Emotiva', 'sabotatore', 'inverse', 'Pattern che riequilibra verso il basso per non esagerare', '#22C55E', 10),
-- 3 Livelli (scoring diretto)
('L1', 'Campo Interno', 'livello', 'direct', 'Capacità di riconoscere micro-momenti nella propria giornata', '#3B82F6', 11),
('L2', 'Spazio Relazionale', 'livello', 'direct', 'Capacità di leggere micro-segnali nelle interazioni con altri', '#6366F1', 12),
('L3', 'Campo dei Contesti', 'livello', 'direct', 'Capacità di leggere e influenzare dinamiche di gruppo', '#8B5CF6', 13)
ON CONFLICT (code) DO NOTHING;
