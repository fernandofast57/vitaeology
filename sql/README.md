# 📦 Schema Completo Vitaeology - Istruzioni Esecuzione

## Struttura File (12 Blocchi)

```
sql/
├── 01_profiles_extension.sql  ← Sistema Lead
├── 02_profiles_indexes.sql
├── 03_lead_magnets.sql
├── 04_funnel_events.sql
├── 05_funnel_events_rls.sql
├── 06_email_tables.sql
├── 07_email_data.sql
├── 08_subscription_plans.sql  ← Tabelle Prioritarie 🔴
├── 09_support_tickets.sql     
├── 10_support_tickets_rls.sql
├── 11_feedback_errors.sql     ← Priorità Media 🟡
├── 12_production_metrics.sql  ← Dashboard 12 Fattori
```

---

## Comandi per Claude Code (Terminale)

### Opzione A: Supabase CLI (se installato)

```bash
# Verifica connessione
supabase db ping

# Esegui in sequenza
supabase db execute -f sql/01_profiles_extension.sql
supabase db execute -f sql/02_profiles_indexes.sql
supabase db execute -f sql/03_lead_magnets.sql
supabase db execute -f sql/04_funnel_events.sql
supabase db execute -f sql/05_funnel_events_rls.sql
supabase db execute -f sql/06_email_tables.sql
supabase db execute -f sql/07_email_data.sql
```

### Opzione B: Via Dashboard Supabase

1. Vai su: https://supabase.com/dashboard
2. Seleziona progetto Vitaeology
3. Menu laterale → **SQL Editor**
4. Copia-incolla contenuto di ogni file
5. Clicca **Run** (verifica output prima del prossimo)

---

## Checklist Esecuzione

| Blocco | File | Verifica Attesa |
|--------|------|-----------------|
| 1 | 01_profiles_extension | 3 righe: lead_source, first_funnel, referral_code |
| 2 | 02_profiles_indexes | 4 indici idx_profiles_* |
| 3 | 03_lead_magnets | 3 righe: quiz, pdf, audio |
| 4 | 04_funnel_events | columns_count = 12 |
| 5 | 05_funnel_events_rls | 3 policy names |
| 6 | 06_email_tables | 2 righe con count 0 |
| 7 | 07_email_data | 3 righe: benessere=5, leadership=5, problemi=5 |
| 8 | 08_subscription_plans | 9 piani (Trial→Partner Elite) |
| 9 | 09_support_tickets | 2 tabelle create |
| 10 | 10_support_tickets_rls | 8 policy names |
| 11 | 11_feedback_errors | 2 tabelle (user_feedback, error_logs) |
| 12 | 12_production_metrics | 1 tabella + 1 view + 1 funzione |

---

## Rollback (se serve)

```sql
-- ATTENZIONE: cancella dati!
DROP TABLE IF EXISTS public.email_sends CASCADE;
DROP TABLE IF EXISTS public.email_sequences CASCADE;
DROP TABLE IF EXISTS public.funnel_events CASCADE;
DROP TABLE IF EXISTS public.lead_magnets CASCADE;

ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS lead_source,
  DROP COLUMN IF EXISTS first_funnel,
  DROP COLUMN IF EXISTS lead_magnet_type,
  DROP COLUMN IF EXISTS lead_magnet_downloaded_at,
  DROP COLUMN IF EXISTS utm_source,
  DROP COLUMN IF EXISTS utm_medium,
  DROP COLUMN IF EXISTS utm_campaign,
  DROP COLUMN IF EXISTS referral_code,
  DROP COLUMN IF EXISTS converted_to_customer_at;
```

---

## Conformità MEGA_PROMPT

✅ Task Atomico rispettato (7 blocchi separati)
✅ Ogni blocco verificabile singolarmente
✅ Ordine esecuzione chiaro (1→7)
✅ Rollback disponibile
