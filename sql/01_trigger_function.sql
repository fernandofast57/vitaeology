-- =============================================
-- VITAEOLOGY v2 - SEZIONE 1/8
-- Funzione Trigger updated_at
-- Eseguire PRIMA di tutte le altre sezioni
-- =============================================

-- Funzione riutilizzabile per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Verifica
DO $$ BEGIN RAISE NOTICE '✅ Sezione 1/8 completata: Funzione trigger creata'; END $$;
