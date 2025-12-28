-- STEP 1: Tabella dimensioni
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

INSERT INTO risolutore_dimensions (code, name, category, scoring_type, description, color, sort_order) VALUES
('FP', 'Detective dei Pattern', 'filtro', 'direct', 'Capacità di riconoscere schemi ricorrenti e connessioni nascoste', '#10B981', 1),
('FS', 'Antenna dei Segnali', 'filtro', 'direct', 'Capacità di leggere bisogni non detti e comunicazioni nascoste', '#3B82F6', 2),
('FR', 'Radar delle Risorse', 'filtro', 'direct', 'Capacità di identificare e combinare creativamente risorse disponibili', '#8B5CF6', 3),
('TP', 'Il Paralizzante', 'traditore', 'inverse', 'Blocco che impedisce di iniziare per paura di sbagliare', '#EF4444', 4),
('TT', 'Il Timoroso', 'traditore', 'inverse', 'Paura del giudizio e dell''esposizione che limita l''azione', '#F97316', 5),
('TC', 'Il Procrastinatore', 'traditore', 'inverse', 'Tendenza a rimandare l''azione nonostante la consapevolezza', '#EAB308', 6),
('SR', 'Scala del Risolutore', 'scala', 'direct', 'Livello di maturità come risolutore (1-5)', '#6366F1', 7)
ON CONFLICT (code) DO NOTHING;
