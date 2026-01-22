-- ============================================================
-- MIGRAZIONE: Sistema Codici Libro
-- Data: 2026-01-22
-- Descrizione: Permette ai lettori di attivare l'accesso
--              all'assessment tramite codice nel libro
-- ============================================================

-- Tabella codici libro
CREATE TABLE IF NOT EXISTS book_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,           -- Codice da inserire (es. "LEADERSHIP2026")
  book_slug VARCHAR(50) NOT NULL,             -- Slug libro (leadership, risolutore, microfelicita)
  description TEXT,                           -- Descrizione per admin
  max_uses INTEGER DEFAULT NULL,              -- NULL = illimitato
  current_uses INTEGER DEFAULT 0,             -- Contatore utilizzi
  is_active BOOLEAN DEFAULT true,             -- Attivo/disattivo
  valid_from TIMESTAMPTZ DEFAULT NOW(),       -- Validità da
  valid_until TIMESTAMPTZ DEFAULT NULL,       -- Validità fino a (NULL = sempre)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella log attivazioni (per tracciamento)
CREATE TABLE IF NOT EXISTS book_code_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID REFERENCES book_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),                     -- Per anti-abuse
  UNIQUE(code_id, user_id)                    -- Un utente può usare un codice una sola volta
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_book_codes_code ON book_codes(code);
CREATE INDEX IF NOT EXISTS idx_book_codes_book_slug ON book_codes(book_slug);
CREATE INDEX IF NOT EXISTS idx_book_code_activations_user ON book_code_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_book_code_activations_email ON book_code_activations(email);

-- RLS Policies
ALTER TABLE book_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_code_activations ENABLE ROW LEVEL SECURITY;

-- book_codes: solo lettura per tutti (il codice viene verificato via API)
CREATE POLICY "book_codes_select" ON book_codes
  FOR SELECT USING (is_active = true);

-- book_code_activations: utenti vedono solo le proprie
CREATE POLICY "book_code_activations_select" ON book_code_activations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "book_code_activations_insert" ON book_code_activations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_book_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER book_codes_updated_at
  BEFORE UPDATE ON book_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_book_codes_updated_at();

-- ============================================================
-- SEED: Inserimento codici per i 3 libri
-- ============================================================

INSERT INTO book_codes (code, book_slug, description) VALUES
  ('LEADERSHIP2026', 'leadership', 'Codice libro "Leadership Autentica" - Accesso Assessment Leadership 72 domande'),
  ('OSTACOLI2026', 'risolutore', 'Codice libro "Oltre gli Ostacoli" - Accesso Assessment Risolutore 48 domande'),
  ('MICROFELICITA2026', 'microfelicita', 'Codice libro "Microfelicità Digitale" - Accesso Assessment Microfelicità 47 domande')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- VERIFICA
-- ============================================================
-- SELECT * FROM book_codes;
