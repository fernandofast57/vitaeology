# Istruzioni per Claude Code - Aggiornamento 52 Esercizi

## File da Usare

I 52 esercizi sono divisi in 4 file JSON:

1. `esercizi_Q1_settimane_1-13.json` - Gennaio-Marzo (osservazione e riflessione)
2. `esercizi_Q2_settimane_14-26.json` - Aprile-Giugno (azioni piccole e sicure)
3. `esercizi_Q3_settimane_27-39.json` - Luglio-Settembre (azioni più impegnative)
4. `esercizi_Q4_settimane_40-52.json` - Ottobre-Dicembre (sfide vere e integrazione)

---

## PROMPT DA COPIARE IN CLAUDE CODE

### Aggiornare TUTTI gli Esercizi

```
Leggi i 4 file JSON degli esercizi nella cartella esercizi-completi:
- esercizi_Q1_settimane_1-13.json
- esercizi_Q2_settimane_14-26.json  
- esercizi_Q3_settimane_27-39.json
- esercizi_Q4_settimane_40-52.json

Per ogni esercizio, genera una query SQL UPSERT per la tabella 'exercises' in Supabase.

La tabella ha questa struttura:
- id (uuid, primary key)
- week_number (integer, unique)
- title (text)
- subtitle (text)
- characteristic_slug (text)
- description (text)
- instructions (text)
- deliverable (text)
- reflection_prompts (jsonb)
- exercise_type (text)
- difficulty_level (text)
- estimated_time_minutes (integer)
- month_name (text)
- book_id (integer, default 1)
- created_at (timestamp)
- updated_at (timestamp)

Usa week_number come chiave per l'UPSERT (ON CONFLICT).

Genera tutte le query e mostrami il file SQL completo prima di eseguirlo.
```

---

### Aggiornare UN Singolo Esercizio

```
Aggiorna l'esercizio settimana [N] nel database Supabase.

Titolo: [nuovo titolo]
Sottotitolo: [caratteristica]
Tipo: [riflessione/azione/analisi/sfida/feedback/pianificazione]
Difficoltà: [base/intermedio/avanzato]
Tempo: [minuti] minuti

Descrizione: [nuova descrizione - max 3 frasi semplici]

Istruzioni: [nuove istruzioni - con esempi concreti]

Deliverable: [cosa produrrà l'utente]

Domande riflessione:
1. [domanda 1]
2. [domanda 2]
3. [domanda 3]

Genera la query UPDATE ed eseguila.
```

---

### Verificare lo Stato Attuale

```
Mostrami tutti gli esercizi nella tabella 'exercises' con:
- week_number
- title
- difficulty_level
- estimated_time_minutes
- exercise_type

Ordina per week_number.
```

---

## QUERY SQL DI ESEMPIO

### UPDATE singolo esercizio:

```sql
UPDATE exercises SET
  title = 'Fermati e Guarda Indietro',
  subtitle = 'Autoconsapevolezza',
  description = 'Questa settimana non devi fare nulla di difficile. Ti chiedo solo di fermarti un momento e guardare indietro a tre scelte che hai fatto nell''ultimo anno.',
  instructions = '1. Trova 15-20 minuti di tranquillità...',
  deliverable = 'Un foglio con 3 decisioni e come ti sentivi per ognuna.',
  reflection_prompts = '["Guardando queste 3 decisioni, noti qualcosa che hanno in comune?", "C''è una decisione che rifaresti esattamente uguale?", "Ce n''è una che oggi faresti diversamente?"]'::jsonb,
  exercise_type = 'riflessione',
  difficulty_level = 'base',
  estimated_time_minutes = 20,
  month_name = 'Gennaio',
  updated_at = NOW()
WHERE week_number = 1;
```

### UPSERT (inserisce se non esiste, aggiorna se esiste):

```sql
INSERT INTO exercises (
  week_number, title, subtitle, characteristic_slug,
  description, instructions, deliverable, reflection_prompts,
  exercise_type, difficulty_level, estimated_time_minutes, month_name
) VALUES (
  1, 'Fermati e Guarda Indietro', 'Autoconsapevolezza', 'autoconsapevolezza',
  'Descrizione...', 'Istruzioni...', 'Deliverable...',
  '["Domanda 1", "Domanda 2", "Domanda 3"]'::jsonb,
  'riflessione', 'base', 20, 'Gennaio'
)
ON CONFLICT (week_number) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  characteristic_slug = EXCLUDED.characteristic_slug,
  description = EXCLUDED.description,
  instructions = EXCLUDED.instructions,
  deliverable = EXCLUDED.deliverable,
  reflection_prompts = EXCLUDED.reflection_prompts,
  exercise_type = EXCLUDED.exercise_type,
  difficulty_level = EXCLUDED.difficulty_level,
  estimated_time_minutes = EXCLUDED.estimated_time_minutes,
  month_name = EXCLUDED.month_name,
  updated_at = NOW();
```

---

## PRINCIPI APPLICATI (per riferimento)

Ogni esercizio rispetta i 3 principi della Comprensione:

1. **PAROLE FAMILIARI**: Nessun termine tecnico senza spiegazione
2. **CONCRETEZZA**: Ogni istruzione ha un esempio pratico
3. **GRADUALITÀ**: 
   - Settimane 1-13: Solo osservazione e riflessione
   - Settimane 14-26: Azioni piccole e sicure
   - Settimane 27-39: Azioni più impegnative
   - Settimane 40-52: Sfide vere + integrazione

---

## NOTE IMPORTANTI

- Esegui sempre un backup prima di aggiornamenti massivi
- Verifica che la tabella `exercises` abbia la colonna `week_number` con UNIQUE constraint
- Se manca il constraint: `ALTER TABLE exercises ADD CONSTRAINT exercises_week_number_unique UNIQUE (week_number);`
- Ricorda di escapare gli apostrofi con doppio apostrofo: `l'assessment` → `l''assessment`
