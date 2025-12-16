# VITAEOLOGY v2 - 52 Esercizi SQL (Formato Unix)

## File Creati
| File | Settimane | Esercizi | Tipo |
|------|-----------|----------|------|
| Q1_unix.sql | 1-13 | 13 | Riconoscimento |
| Q2_unix.sql | 14-26 | 13 | Espansione |
| Q3_unix.sql | 27-39 | 13 | Sfida |
| Q4_unix.sql | 40-52 | 13 | Integrazione |

## Istruzioni per Supabase

1. Vai su **Supabase Dashboard** > **SQL Editor**
2. Copia il contenuto di `Q1_unix.sql` e incollalo
3. Clicca **RUN**
4. Ripeti per Q2, Q3, Q4 in ordine

## Verifica Finale
```sql
SELECT COUNT(*) FROM exercises_v2;
-- Deve restituire: 52

SELECT quarter, COUNT(*) FROM exercises_v2 GROUP BY quarter ORDER BY quarter;
-- Q1: 13, Q2: 13, Q3: 13, Q4: 13
```

## Note
- I file sono in formato Unix (senza caratteri \r)
- Ogni INSERT e su singola riga per evitare problemi JSON
- Gli accenti sono stati rimossi per compatibilita
