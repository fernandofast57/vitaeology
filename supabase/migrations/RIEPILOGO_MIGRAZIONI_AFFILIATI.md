# VITAEOLOGY - DATABASE SCHEMA AFFILIATI

## Riepilogo Migrazioni Fase 1

**Data:** 08 Gennaio 2026  
**Conformità:** VITAEOLOGY_MEGA_PROMPT v4.3 | Framework 4P/12F  
**Status:** ✅ COMPLETATO

---

## CHECKLIST CONFORMITÀ

- ✅ Dichiarazione di conformità al MEGA_PROMPT
- ✅ Riferimenti al Documento Guida (4P/12F)
- ✅ Log decisioni architetturali

---

## FILE MIGRAZIONI CREATI

| # | File | Dimensione | Descrizione |
|---|------|------------|-------------|
| 1 | `20260108001_affiliates_table.sql` | 7.0 KB | Tabella principale profilo affiliati |
| 2 | `20260108002_affiliate_links_table.sql` | 6.0 KB | Link tracciati con UTM |
| 3 | `20260108003_affiliate_clicks_table.sql` | 7.0 KB | Tracking click (cookie 90gg) |
| 4 | `20260108004_affiliate_commissions_table.sql` | 9.5 KB | Commissioni 30-40% ricorrente |
| 5 | `20260108005_affiliate_payouts_table.sql` | 9.0 KB | Richieste payout (soglia €50) |
| 6 | `20260108006_affiliate_tracking_modifications.sql` | 11 KB | Modifiche tabelle esistenti |
| 7 | `20260108007_affiliate_stats_functions.sql` | 14 KB | Funzioni statistiche dashboard |

**Totale:** 63.5 KB di SQL

---

## STRUTTURA DATABASE

### Diagramma Relazioni

```
┌─────────────────┐
│    affiliates   │ ←── Tabella principale
└────────┬────────┘
         │
    ┌────┴────┬──────────────┐
    │         │              │
    ▼         ▼              ▼
┌─────────┐ ┌──────────┐ ┌──────────┐
│  links  │ │  clicks  │ │commissions│
└─────────┘ └────┬─────┘ └────┬─────┘
                 │            │
                 └────┬───────┘
                      ▼
                ┌──────────┐
                │ payouts  │
                └──────────┘
```

### Tabelle Create

#### 1. `affiliates` (Profilo)
- `id`, `user_id`, `email`, `nome`, `cognome`
- `ref_code` - Codice univoco (es: AFF-ABC123)
- `categoria` - BASE, PRO, PARTNER, SUPER
- `commissione_percentuale` - 30%, 35%, 40%
- `bonus_mensile_euro` - €500 per SUPER
- `stato` - pending, active, suspended, terminated
- Metriche aggregate (cache)
- Fase training (0-6)

#### 2. `affiliate_links` (Link)
- Destinazione: challenge, pricing, homepage, libro
- URL generato con ref code
- Parametri UTM
- Contatori click/conversioni

#### 3. `affiliate_clicks` (Click)
- `cookie_id` - ID univoco per attribuzione
- `cookie_expires_at` - 90 giorni
- `stato_conversione` - click → signup → challenge → converted
- Device, browser, geolocation
- GDPR compliant (IP anonimizzato)

#### 4. `affiliate_commissions` (Commissioni)
- Riferimenti Stripe (subscription, invoice)
- Prodotto: leader, mentor, coaching, mastermind, corporate
- Tipo: initial, recurring, bonus, upgrade
- Stato: pending → approved → paid

#### 5. `affiliate_payouts` (Pagamenti)
- Soglia minima €50
- Metodi: bonifico, PayPal, Stripe
- Stato: pending → processing → completed

#### 6. `subscription_affiliate_tracking` (Join table)
- Collega subscription Stripe ad affiliato
- Tracking conversioni post-cookie

---

## FUNZIONI CREATE

### Tracking
- `generate_affiliate_ref_code()` - Genera codice univoco
- `build_affiliate_url()` - Costruisce URL con parametri
- `get_valid_affiliate_cookie()` - Verifica cookie valido
- `track_challenge_subscription_referral()` - Registra referral

### Commissioni
- `calculate_affiliate_commission()` - Calcola importo
- `create_affiliate_commission_from_stripe()` - Crea da webhook
- `check_affiliate_category_upgrade()` - Verifica upgrade
- `handle_affiliate_commission_refund()` - Gestisce rimborsi

### Payout
- `create_affiliate_payout_request()` - Richiesta pagamento
- `complete_affiliate_payout()` - Completa pagamento
- `cancel_affiliate_payout()` - Annulla richiesta

### Statistiche
- `get_affiliate_stats()` - Stats singolo affiliato
- `get_affiliate_leaderboard()` - Classifica
- `get_affiliate_program_stats()` - Stats globali admin
- `get_affiliate_performance_report()` - Report per periodo
- `recalculate_all_affiliate_metrics()` - Cron job

### Manutenzione
- `expire_old_affiliate_cookies()` - Scade cookie vecchi

---

## RLS POLICIES

Tutte le tabelle hanno Row Level Security abilitato:

| Tabella | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| affiliates | Owner/Admin | Admin/Service | Owner | Admin |
| affiliate_links | Owner/Admin | Owner attivo | Owner | Owner/Admin |
| affiliate_clicks | Owner/Admin | Service | Service/Admin | - |
| affiliate_commissions | Owner/Admin | Service | Service/Admin | - |
| affiliate_payouts | Owner/Admin | Owner attivo | Admin | - |

---

## APPLICAZIONE FRAMEWORK 4P/12F

| Prodotto | Implementazione | Q | Ql | Vi |
|----------|-----------------|---|----|----|
| **P1: Istituzione** | Tabelle, RLS, indexes, triggers | 7 migrazioni | Schema completo | Scalabile |
| **P2: Prodotto** | Affiliati, commissioni, link | Metriche auto | Validazione | Performance |
| **P3: Riparazione** | Upgrade auto, monitoring, cron | Trigger | Efficace | Automatico |
| **P4: Correzione** | Funzioni stats, audit trail | Report | Misurabile | Iterativo |

---

## ISTRUZIONI DEPLOY

### 1. Esegui migrazioni in ordine

```bash
# Via Supabase CLI
supabase db push

# Oppure manualmente nell'ordine:
# 1. 20260108001_affiliates_table.sql
# 2. 20260108002_affiliate_links_table.sql
# 3. 20260108003_affiliate_clicks_table.sql
# 4. 20260108004_affiliate_commissions_table.sql
# 5. 20260108005_affiliate_payouts_table.sql
# 6. 20260108006_affiliate_tracking_modifications.sql
# 7. 20260108007_affiliate_stats_functions.sql
```

### 2. Verifica creazione

```sql
-- Verifica tabelle
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'affiliate%';

-- Verifica funzioni
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name LIKE '%affiliate%';
```

### 3. Test base

```sql
-- Crea affiliato test
INSERT INTO affiliates (email, nome, stato) 
VALUES ('test@example.com', 'Test', 'active');

-- Verifica stats
SELECT * FROM get_affiliate_program_stats();
```

---

## PROSSIMI PASSI (FASE 2)

1. **API Endpoints** - Implementare route Next.js
2. **Tracking Cookie** - Middleware per salvare ref code
3. **Webhook Stripe** - Gestione commissioni
4. **Frontend Pages** - /affiliate, /affiliate/dashboard

---

## RIFERIMENTI DOCUMENTO GUIDA

- **Sezione 8:** Categorie affiliati e commissioni
- **Sezione 9:** 6 fasi training (Jim Edwards)
- **Sezione 11:** Struttura app (pagine, API, componenti)
- **Sezione 12:** Flusso utente affiliato
- **Sezione 13:** Framework 4P/12F applicato

---

*Documento generato in conformità con VITAEOLOGY_MEGA_PROMPT v4.3*
*Control Tower: FASE 5 - Programma Affiliati*
