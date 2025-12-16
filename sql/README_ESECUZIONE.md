# 🗄️ FASE 1: Database Schema - Istruzioni per Claude Code

## Esecuzione Sequenziale in Supabase

Esegui questi 8 file SQL **nell'ordine indicato**, uno alla volta, nel SQL Editor di Supabase.

---

## 📋 SEQUENZA DI ESECUZIONE

| # | File | Cosa crea | Verifica |
|---|------|-----------|----------|
| 1 | `01_trigger_function.sql` | Funzione trigger `update_updated_at_column` | Nessun errore |
| 2 | `02_characteristics_table.sql` | Tabella `characteristics` + indici | Tabella esiste |
| 3 | `03_characteristics_data.sql` | 24 righe in `characteristics` | `SELECT COUNT(*) FROM characteristics;` = 24 |
| 4 | `04_exercises_table.sql` | Tabella `exercises_v2` + indici | Tabella esiste |
| 5 | `05_user_progress_table.sql` | Tabella `user_exercise_progress_v2` | Tabella esiste |
| 6 | `06_rls_policies.sql` | RLS policies su tutte le tabelle | Nessun errore |
| 7 | `07_views.sql` | 2 viste utili | Viste esistono |
| 8 | `08_helper_functions.sql` | 2 funzioni helper | Funzioni esistono |

---

## 🚀 COMANDI PER CLAUDE CODE

### Opzione A: Copia file nel progetto

```bash
# Crea cartella migrations
mkdir -p supabase/migrations

# Copia tutti i file
cp sql/01_trigger_function.sql supabase/migrations/
cp sql/02_characteristics_table.sql supabase/migrations/
cp sql/03_characteristics_data.sql supabase/migrations/
cp sql/04_exercises_table.sql supabase/migrations/
cp sql/05_user_progress_table.sql supabase/migrations/
cp sql/06_rls_policies.sql supabase/migrations/
cp sql/07_views.sql supabase/migrations/
cp sql/08_helper_functions.sql supabase/migrations/
```

### Opzione B: Esegui direttamente in Supabase Dashboard

1. Vai su **Supabase Dashboard** → **SQL Editor**
2. Apri ogni file in sequenza
3. Copia il contenuto
4. Incolla nel SQL Editor
5. Clicca **Run**
6. Attendi conferma prima di procedere al successivo

---

## ✅ VERIFICA FINALE

Dopo aver eseguito tutti i file, esegui queste query di verifica:

```sql
-- 1. Verifica caratteristiche
SELECT COUNT(*) as total, pillar 
FROM characteristics 
GROUP BY pillar 
ORDER BY pillar;
-- Deve restituire: Action=6, Adaptation=6, Relations=6, Vision=6

-- 2. Verifica tabelle esistono
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('characteristics', 'exercises_v2', 'user_exercise_progress_v2');
-- Deve restituire 3 righe

-- 3. Verifica RLS attivo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('characteristics', 'exercises_v2', 'user_exercise_progress_v2');
-- rowsecurity deve essere TRUE per tutte

-- 4. Verifica viste
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';
-- Deve includere: characteristics_with_exercise_count, user_progress_detailed

-- 5. Verifica funzioni
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';
-- Deve includere: get_next_exercise_for_user, get_pillar_completion, update_updated_at_column
```

---

## ⚠️ TROUBLESHOOTING

### Errore: "relation already exists"
→ La tabella esiste già. Se vuoi ricrearla, esegui prima:
```sql
DROP TABLE IF EXISTS nome_tabella CASCADE;
```

### Errore: "function already exists"
→ Le funzioni usano `CREATE OR REPLACE`, quindi non dovrebbe accadere. Se persiste:
```sql
DROP FUNCTION IF EXISTS nome_funzione;
```

### Errore: "violates foreign key constraint"
→ Stai eseguendo i file fuori ordine. Ricomincia dalla sezione 1.

### Errore: "permission denied"
→ Verifica di essere connesso con un utente con privilegi sufficienti (service_role).

---

## 📊 RISULTATO ATTESO

Dopo l'esecuzione completa avrai:

| Elemento | Quantità |
|----------|----------|
| Tabelle | 3 (characteristics, exercises_v2, user_exercise_progress_v2) |
| Righe in characteristics | 24 |
| Indici | 11 |
| RLS Policies | 6 |
| Viste | 2 |
| Funzioni | 3 |
| Trigger | 3 |

---

## 🔗 PROSSIMO PASSO

Dopo aver verificato che tutto funziona:
→ **FASE 2: MAPPING_BARRIOS_FAMILIARI.md**
