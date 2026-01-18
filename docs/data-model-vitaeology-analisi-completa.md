# DATA MODEL VITAEOLOGY: ANALISI E PROPOSTA OTTIMALE

**Data:** 17 Gennaio 2026  
**Progetto:** Vitaeology Leadership Development Platform  
**Criticità:** ALTA - Fondazione architetturale

---

## 🚨 IL PROBLEMA CRITICO

> **"Se definisci bene le entità ORA, il resto evolve.  
> Se sbagli, riparti da zero."**

Hai assolutamente ragione. Ho analizzato il database attuale (171 migrations) e identificato **5 domande critiche** che determinano se il progetto scala o collassa.

---

## 📊 ANALISI DATA MODEL ATTUALE

### Schema Attuale (Semplificato)

```
profiles
├─ id (UUID)
├─ subscription_tier (TEXT: 'free', 'leader', 'mentor')
├─ subscription_status (TEXT: 'active', 'canceled', 'past_due')
├─ current_path (TEXT: 'leadership', 'problemi', 'benessere')  ← HARDCODED!
└─ is_consultant (BOOLEAN) ← Manca nel schema principale!

books
├─ id (SERIAL)
├─ slug (TEXT: 'leadership-autentica') ← HARDCODED!
└─ is_active (BOOLEAN)

exercises
├─ id (SERIAL)
├─ book_id (FK → books) ← 1 esercizio = 1 libro
├─ characteristic_id (FK → characteristics)
└─ is_premium (BOOLEAN)

affiliates
├─ id (UUID)
├─ user_id (FK → profiles)
├─ abbonamento_utente (TEXT: 'leader', 'mentor', 'mastermind', 'consulente') ← ENUM FISSO!
├─ commissione_base (DECIMAL) ← FISSO per tier!
└─ bonus_performance (DECIMAL)
```

---

## ❌ PROBLEMI IDENTIFICATI

### 1. **Percorsi Hardcoded** (CRITICO)

**Problema:**
```sql
current_path TEXT CHECK (current_path IN ('leadership', 'problemi', 'benessere'))
```

**Rischio:**
- ✅ Funziona per 3 percorsi fissi
- ❌ **Non scala** se aggiungi percorso 4 (es. "Negoziazione")
- ❌ **Non supporta bundle** (utente con 2-3 percorsi)
- ❌ **Richiede migration** per ogni nuovo percorso

**Impatto:** Se lanci percorso 4, devi:
1. Modificare CHECK constraint
2. Migrare tutti i dati
3. Aggiornare codice frontend (hardcoded switch)
4. Riavviare server

**Tempo:** 2-3 giorni + rischio downtime

---

### 2. **Esercizi Legati a 1 Solo Percorso** (CRITICO)

**Problema:**
```sql
exercises
├─ book_id (FK → books) ← 1 esercizio = 1 libro
```

**Rischio:**
- ✅ Funziona se esercizio appartiene a 1 percorso
- ❌ **Non supporta esercizi cross-percorso** (es. "Resilienza" utile per Leadership + Ostacoli)
- ❌ **Duplicazione dati** se stesso esercizio serve a 2 percorsi
- ❌ **Impossibile creare "percorsi personalizzati"** (mix esercizi da 3 percorsi)

**Impatto:** Se utente ha bundle 3 percorsi:
- Vede 52 × 3 = 156 esercizi (anche se molti sono simili)
- Non può creare percorso personalizzato
- Spreco storage (duplicati)

**Tempo:** Refactoring completo tabella exercises + migrations

---

### 3. **Tier Utente Enum Fisso** (MEDIO)

**Problema:**
```sql
subscription_tier TEXT CHECK (subscription_tier IN ('free', 'leader', 'mentor'))
```

**Rischio:**
- ✅ Funziona per 3 tier fissi
- ❌ **Non scala** se aggiungi tier 4 (es. "Mastermind")
- ❌ **Permessi hardcoded** nel codice (if tier === 'leader')
- ❌ **Richiede migration** per ogni nuovo tier

**Impatto:** Se lanci tier "Mastermind":
1. Modificare CHECK constraint
2. Aggiornare codice permessi (50+ file)
3. Testare regressioni

**Tempo:** 1-2 giorni

---

### 4. **Ruolo Consulente Non Separato** (CRITICO)

**Problema:**
```sql
-- Consulente è un "abbonamento_utente" in affiliates
abbonamento_utente TEXT CHECK (...IN ('leader', 'mentor', 'mastermind', 'consulente'))

-- Ma manca is_consultant in profiles!
```

**Rischio:**
- ❌ **Consulente = Tier subscription** (confusione semantica)
- ❌ **Non puoi essere Mentor + Consulente** (mutually exclusive)
- ❌ **Permessi consulente hardcoded** (if abbonamento === 'consulente')
- ❌ **Impossibile tracciare certificazione** (data, esame, licenza)

**Impatto:** Se utente Mentor vuole diventare Consulente:
- Deve "upgradare" abbonamento a "consulente"
- Perde accesso Mentor (downgrade?)
- Non puoi tracciare "Mentor certificato" vs "Consulente non-Mentor"

**Tempo:** Refactoring completo sistema ruoli + permissions

---

### 5. **Commissioni Fisse per Tier** (MEDIO)

**Problema:**
```sql
-- Commissione base è FUNZIONE di abbonamento_utente
get_commissione_base_da_abbonamento('leader') → 25%
get_commissione_base_da_abbonamento('mentor') → 30%
```

**Rischio:**
- ✅ Funziona per commissioni uniformi
- ❌ **Non supporta commissioni variabili per prodotto** (es. 40% su libro, 25% su subscription)
- ❌ **Non supporta promozioni** (es. "Gennaio: 35% su tutto")
- ❌ **Richiede modifica funzione** per ogni cambio commissione

**Impatto:** Se vuoi lanciare promo "Febbraio: +5% commissioni":
1. Modificare funzione SQL
2. Deploy migration
3. Testare calcoli

**Tempo:** 1 giorno

---

## ✅ DATA MODEL OTTIMALE

### Principi Guida

1. **Dinamico > Hardcoded** - Nuovi percorsi/tier senza migration
2. **Relazioni Many-to-Many** - Esercizi condivisi tra percorsi
3. **Separazione Concerns** - Tier ≠ Ruolo ≠ Permessi
4. **Configurabile** - Commissioni/pricing in tabella, non codice
5. **Scalabile** - Supporta 3 percorsi oggi, 10 domani

---

### Schema Ottimale

```
┌─────────────────────────────────────────────────────────────┐
│                      UTENTI & AUTENTICAZIONE                 │
└─────────────────────────────────────────────────────────────┘

profiles
├─ id (UUID, PK)
├─ email (TEXT)
├─ full_name (TEXT)
├─ stripe_customer_id (TEXT)
├─ created_at (TIMESTAMPTZ)
└─ updated_at (TIMESTAMPTZ)

┌─────────────────────────────────────────────────────────────┐
│                      PERCORSI (DINAMICI)                     │
└─────────────────────────────────────────────────────────────┘

pathways  ← NUOVA TABELLA
├─ id (SERIAL, PK)
├─ slug (TEXT, UNIQUE) ← 'leadership', 'ostacoli', 'microfelicita'
├─ name (TEXT) ← 'Leadership Autentica'
├─ description (TEXT)
├─ color_hex (TEXT) ← '#D4AF37'
├─ icon_name (TEXT) ← 'book'
├─ order_index (INTEGER) ← 1, 2, 3
├─ is_active (BOOLEAN) ← true/false
├─ created_at (TIMESTAMPTZ)
└─ updated_at (TIMESTAMPTZ)

user_pathways  ← NUOVA TABELLA (Many-to-Many)
├─ id (UUID, PK)
├─ user_id (UUID, FK → profiles)
├─ pathway_id (INTEGER, FK → pathways)
├─ is_active (BOOLEAN) ← true se percorso attivo
├─ started_at (TIMESTAMPTZ)
├─ completed_at (TIMESTAMPTZ)
├─ progress_percentage (INTEGER) ← 0-100
├─ created_at (TIMESTAMPTZ)
└─ UNIQUE(user_id, pathway_id)

┌─────────────────────────────────────────────────────────────┐
│                      ESERCIZI (CROSS-PERCORSO)               │
└─────────────────────────────────────────────────────────────┘

exercises
├─ id (SERIAL, PK)
├─ title (TEXT)
├─ description (TEXT)
├─ instructions (TEXT)
├─ week_number (INTEGER)
├─ duration_minutes (INTEGER)
├─ difficulty (TEXT) ← 'facile', 'medio', 'difficile'
├─ created_at (TIMESTAMPTZ)
└─ updated_at (TIMESTAMPTZ)

pathway_exercises  ← NUOVA TABELLA (Many-to-Many)
├─ id (SERIAL, PK)
├─ pathway_id (INTEGER, FK → pathways)
├─ exercise_id (INTEGER, FK → exercises)
├─ order_index (INTEGER) ← Ordine esercizio nel percorso
├─ is_required (BOOLEAN) ← true se obbligatorio
├─ created_at (TIMESTAMPTZ)
└─ UNIQUE(pathway_id, exercise_id)

user_exercise_progress
├─ id (UUID, PK)
├─ user_id (UUID, FK → profiles)
├─ exercise_id (INTEGER, FK → exercises)
├─ pathway_id (INTEGER, FK → pathways) ← NUOVO! Traccia percorso
├─ status (TEXT) ← 'not_started', 'in_progress', 'completed'
├─ notes (TEXT)
├─ rating (INTEGER)
├─ started_at (TIMESTAMPTZ)
├─ completed_at (TIMESTAMPTZ)
├─ created_at (TIMESTAMPTZ)
└─ UNIQUE(user_id, exercise_id, pathway_id)

┌─────────────────────────────────────────────────────────────┐
│                      TIER & SUBSCRIPTION                     │
└─────────────────────────────────────────────────────────────┘

subscription_tiers  ← NUOVA TABELLA
├─ id (SERIAL, PK)
├─ slug (TEXT, UNIQUE) ← 'explorer', 'leader', 'mentor', 'mastermind'
├─ name (TEXT) ← 'Leader'
├─ description (TEXT)
├─ price_monthly (DECIMAL) ← €12.42
├─ price_yearly (DECIMAL) ← €149
├─ stripe_price_id_monthly (TEXT)
├─ stripe_price_id_yearly (TEXT)
├─ max_pathways (INTEGER) ← 1, 2, 3, NULL (unlimited)
├─ ai_coach_messages_per_day (INTEGER) ← 20, 50, NULL (unlimited)
├─ priority_support (BOOLEAN)
├─ order_index (INTEGER)
├─ is_active (BOOLEAN)
├─ created_at (TIMESTAMPTZ)
└─ updated_at (TIMESTAMPTZ)

user_subscriptions  ← NUOVA TABELLA
├─ id (UUID, PK)
├─ user_id (UUID, FK → profiles)
├─ tier_id (INTEGER, FK → subscription_tiers)
├─ status (TEXT) ← 'active', 'canceled', 'past_due'
├─ stripe_subscription_id (TEXT)
├─ current_period_start (TIMESTAMPTZ)
├─ current_period_end (TIMESTAMPTZ)
├─ cancel_at_period_end (BOOLEAN)
├─ created_at (TIMESTAMPTZ)
├─ updated_at (TIMESTAMPTZ)
└─ UNIQUE(user_id) ← 1 utente = 1 subscription attiva

┌─────────────────────────────────────────────────────────────┐
│                      RUOLI & PERMESSI                        │
└─────────────────────────────────────────────────────────────┘

roles  ← NUOVA TABELLA
├─ id (SERIAL, PK)
├─ slug (TEXT, UNIQUE) ← 'admin', 'consultant', 'user'
├─ name (TEXT) ← 'Consulente Certificato'
├─ description (TEXT)
├─ level (INTEGER) ← 100 (admin), 50 (consultant), 10 (user)
├─ created_at (TIMESTAMPTZ)
└─ updated_at (TIMESTAMPTZ)

user_roles  ← NUOVA TABELLA (Many-to-Many)
├─ id (UUID, PK)
├─ user_id (UUID, FK → profiles)
├─ role_id (INTEGER, FK → roles)
├─ granted_at (TIMESTAMPTZ)
├─ granted_by (UUID, FK → profiles) ← Chi ha assegnato ruolo
├─ expires_at (TIMESTAMPTZ) ← NULL se permanente
├─ created_at (TIMESTAMPTZ)
└─ UNIQUE(user_id, role_id)

permissions  ← NUOVA TABELLA
├─ id (SERIAL, PK)
├─ slug (TEXT, UNIQUE) ← 'exercises.view_all', 'ai_coach.unlimited'
├─ name (TEXT)
├─ description (TEXT)
├─ category (TEXT) ← 'exercises', 'ai_coach', 'admin'
├─ created_at (TIMESTAMPTZ)
└─ updated_at (TIMESTAMPTZ)

role_permissions  ← NUOVA TABELLA (Many-to-Many)
├─ id (SERIAL, PK)
├─ role_id (INTEGER, FK → roles)
├─ permission_id (INTEGER, FK → permissions)
├─ created_at (TIMESTAMPTZ)
└─ UNIQUE(role_id, permission_id)

tier_permissions  ← NUOVA TABELLA (Many-to-Many)
├─ id (SERIAL, PK)
├─ tier_id (INTEGER, FK → subscription_tiers)
├─ permission_id (INTEGER, FK → permissions)
├─ created_at (TIMESTAMPTZ)
└─ UNIQUE(tier_id, permission_id)

┌─────────────────────────────────────────────────────────────┐
│                      CONSULENTI & CERTIFICAZIONE             │
└─────────────────────────────────────────────────────────────┘

consultant_certifications  ← NUOVA TABELLA
├─ id (UUID, PK)
├─ user_id (UUID, FK → profiles)
├─ certification_number (TEXT, UNIQUE) ← 'VIT-2026-001'
├─ status (TEXT) ← 'pending', 'active', 'suspended', 'revoked'
├─ training_completed_at (TIMESTAMPTZ)
├─ exam_passed_at (TIMESTAMPTZ)
├─ exam_score (INTEGER) ← 0-100
├─ certified_at (TIMESTAMPTZ)
├─ certified_by (UUID, FK → profiles) ← Fernando
├─ expires_at (TIMESTAMPTZ) ← NULL se permanente
├─ license_agreement_signed (BOOLEAN)
├─ license_agreement_signed_at (TIMESTAMPTZ)
├─ created_at (TIMESTAMPTZ)
├─ updated_at (TIMESTAMPTZ)
└─ UNIQUE(user_id)

┌─────────────────────────────────────────────────────────────┐
│                      COMMISSIONI (CONFIGURABILI)             │
└─────────────────────────────────────────────────────────────┘

commission_structures  ← NUOVA TABELLA
├─ id (SERIAL, PK)
├─ name (TEXT) ← 'Leader Base', 'Promo Febbraio 2026'
├─ description (TEXT)
├─ tier_id (INTEGER, FK → subscription_tiers) ← NULL se globale
├─ role_id (INTEGER, FK → roles) ← NULL se non specifico
├─ product_type (TEXT) ← 'subscription', 'book', 'consultation', NULL (all)
├─ base_percentage (DECIMAL) ← 25.00
├─ bonus_performance_10_clients (DECIMAL) ← 3.00
├─ bonus_performance_30_clients (DECIMAL) ← 5.00
├─ max_percentage (DECIMAL) ← 45.00
├─ is_active (BOOLEAN)
├─ valid_from (TIMESTAMPTZ)
├─ valid_until (TIMESTAMPTZ) ← NULL se permanente
├─ created_at (TIMESTAMPTZ)
└─ updated_at (TIMESTAMPTZ)

affiliate_commissions
├─ id (UUID, PK)
├─ affiliate_id (UUID, FK → affiliates)
├─ user_id (UUID, FK → profiles) ← Cliente acquisito
├─ commission_structure_id (INTEGER, FK → commission_structures) ← NUOVO!
├─ product_type (TEXT) ← 'subscription', 'book', 'consultation'
├─ importo_vendita (DECIMAL)
├─ commissione_percentuale (DECIMAL)
├─ commissione_euro (DECIMAL)
├─ stato (TEXT) ← 'pending', 'approved', 'paid', 'cancelled'
├─ created_at (TIMESTAMPTZ)
└─ updated_at (TIMESTAMPTZ)
```

---

## 🎯 RISPOSTE ALLE 5 DOMANDE CRITICHE

### 1. **Percorso: Hardcoded o Tabella Dinamica?**

**RISPOSTA: Tabella Dinamica (`pathways`)**

**Perché:**
- ✅ **Scalabile**: Aggiungi percorso 4 con INSERT, non migration
- ✅ **Supporta bundle**: Utente ha N percorsi attivi (`user_pathways`)
- ✅ **Configurabile**: Colore, icona, ordine in database
- ✅ **Disattivabile**: `is_active = false` senza cancellare dati

**Esempio:**
```sql
-- Aggiungere percorso "Negoziazione" (5 minuti)
INSERT INTO pathways (slug, name, color_hex, icon_name, order_index, is_active)
VALUES ('negoziazione', 'Negoziazione Efficace', '#FF6B6B', 'handshake', 4, true);

-- Utente attiva percorso Leadership + Negoziazione
INSERT INTO user_pathways (user_id, pathway_id, is_active)
VALUES 
  ('user-uuid', 1, true),  -- Leadership
  ('user-uuid', 4, true);  -- Negoziazione
```

**Migrazione da Schema Attuale:**
```sql
-- Step 1: Creare tabella pathways
CREATE TABLE pathways (...);

-- Step 2: Popolare con 3 percorsi esistenti
INSERT INTO pathways (slug, name, color_hex, icon_name, order_index, is_active) VALUES
  ('leadership', 'Leadership Autentica', '#D4AF37', 'book', 1, true),
  ('ostacoli', 'Oltre gli Ostacoli', '#10B981', 'shield', 2, true),
  ('microfelicita', 'Microfelicità Digitale', '#8B5CF6', 'heart', 3, true);

-- Step 3: Migrare profiles.current_path → user_pathways
INSERT INTO user_pathways (user_id, pathway_id, is_active, started_at)
SELECT 
  p.id,
  pw.id,
  true,
  p.created_at
FROM profiles p
JOIN pathways pw ON pw.slug = p.current_path;

-- Step 4: Drop colonna current_path (dopo verifica)
ALTER TABLE profiles DROP COLUMN current_path;
```

**Tempo Migrazione:** 2-3 ore (+ testing)

---

### 2. **Esercizio: Legato a 1 Percorso o Many-to-Many?**

**RISPOSTA: Many-to-Many (`pathway_exercises`)**

**Perché:**
- ✅ **Riuso esercizi**: "Resilienza" appartiene a Leadership + Ostacoli
- ✅ **Nessuna duplicazione**: 1 esercizio, N percorsi
- ✅ **Percorsi personalizzati**: Mix esercizi da 3 percorsi
- ✅ **Ordine flessibile**: Esercizio 5 in Leadership, esercizio 12 in Ostacoli

**Esempio:**
```sql
-- Esercizio "Diario Resilienza" appartiene a 2 percorsi
INSERT INTO exercises (title, description, week_number, difficulty)
VALUES ('Diario Resilienza', 'Scrivi 3 sfide superate questa settimana', 5, 'medio');

-- Associa a Leadership (settimana 5)
INSERT INTO pathway_exercises (pathway_id, exercise_id, order_index, is_required)
VALUES (1, 42, 5, true);

-- Associa a Ostacoli (settimana 12)
INSERT INTO pathway_exercises (pathway_id, exercise_id, order_index, is_required)
VALUES (2, 42, 12, true);
```

**Migrazione da Schema Attuale:**
```sql
-- Step 1: Creare tabella pathway_exercises
CREATE TABLE pathway_exercises (...);

-- Step 2: Rimuovere book_id da exercises
ALTER TABLE exercises DROP COLUMN book_id;

-- Step 3: Migrare associazioni esistenti
-- (Assumendo exercises.book_id → pathways.id mapping)
INSERT INTO pathway_exercises (pathway_id, exercise_id, order_index, is_required)
SELECT 
  pw.id,
  e.id,
  e.week_number,
  true
FROM exercises e
JOIN books b ON e.book_id = b.id
JOIN pathways pw ON pw.slug = CASE b.slug
    WHEN 'leadership-autentica' THEN 'leadership'
    WHEN 'oltre-ostacoli' THEN 'ostacoli'
    WHEN 'microfelicita' THEN 'microfelicita'
  END;
```

**Tempo Migrazione:** 1-2 ore (+ testing)

---

### 3. **Tier Utente: Enum Fisso o Tabella?**

**RISPOSTA: Tabella (`subscription_tiers`)**

**Perché:**
- ✅ **Scalabile**: Aggiungi tier "Mastermind" con INSERT
- ✅ **Configurabile**: Pricing, limiti, Stripe ID in database
- ✅ **Testabile**: Tier "Beta" con `is_active = false`
- ✅ **Storico**: Cambio pricing senza perdere dati vecchi

**Esempio:**
```sql
-- Aggiungere tier "Mastermind" (5 minuti)
INSERT INTO subscription_tiers (
  slug, name, price_yearly, max_pathways, 
  ai_coach_messages_per_day, priority_support, is_active
) VALUES (
  'mastermind', 'Mastermind', 2997, NULL, NULL, true, true
);

-- Utente upgrade a Mastermind
UPDATE user_subscriptions
SET tier_id = 4  -- Mastermind
WHERE user_id = 'user-uuid';
```

**Migrazione da Schema Attuale:**
```sql
-- Step 1: Creare tabella subscription_tiers
CREATE TABLE subscription_tiers (...);

-- Step 2: Popolare con tier esistenti
INSERT INTO subscription_tiers (slug, name, price_yearly, max_pathways, ...) VALUES
  ('explorer', 'Explorer', 0, 1, 5, false, true),
  ('leader', 'Leader', 149, 1, 20, false, true),
  ('mentor', 'Mentor', 490, 3, 50, true, true);

-- Step 3: Creare tabella user_subscriptions
CREATE TABLE user_subscriptions (...);

-- Step 4: Migrare profiles.subscription_tier → user_subscriptions
INSERT INTO user_subscriptions (user_id, tier_id, status, created_at)
SELECT 
  p.id,
  st.id,
  COALESCE(p.subscription_status, 'active'),
  p.created_at
FROM profiles p
JOIN subscription_tiers st ON st.slug = COALESCE(p.subscription_tier, 'explorer');

-- Step 5: Drop colonne subscription_* da profiles (dopo verifica)
ALTER TABLE profiles 
  DROP COLUMN subscription_tier,
  DROP COLUMN subscription_status;
```

**Tempo Migrazione:** 2-3 ore (+ testing)

---

### 4. **Ruolo Consulente: Separato da Tier?**

**RISPOSTA: SÌ, Separato (`roles` + `consultant_certifications`)**

**Perché:**
- ✅ **Semantica chiara**: Tier = Subscription, Ruolo = Permessi
- ✅ **Combinabile**: Utente può essere Mentor + Consulente
- ✅ **Tracciabilità**: Certificazione, esame, licenza in tabella dedicata
- ✅ **Scadenza**: Certificazione può scadere, tier no

**Esempio:**
```sql
-- Utente Mentor diventa Consulente Certificato
INSERT INTO user_roles (user_id, role_id, granted_by)
VALUES ('user-uuid', 2, 'fernando-uuid');  -- role_id 2 = Consultant

INSERT INTO consultant_certifications (
  user_id, certification_number, status, 
  exam_passed_at, exam_score, certified_by
) VALUES (
  'user-uuid', 'VIT-2026-001', 'active',
  '2026-06-15', 92, 'fernando-uuid'
);

-- Query: Utente è Mentor + Consulente?
SELECT 
  us.tier_id,
  st.slug AS tier_slug,
  ur.role_id,
  r.slug AS role_slug
FROM profiles p
LEFT JOIN user_subscriptions us ON us.user_id = p.id
LEFT JOIN subscription_tiers st ON st.id = us.tier_id
LEFT JOIN user_roles ur ON ur.user_id = p.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE p.id = 'user-uuid';

-- Risultato:
-- tier_slug: 'mentor'
-- role_slug: 'consultant'
```

**Migrazione da Schema Attuale:**
```sql
-- Step 1: Creare tabelle roles, user_roles, consultant_certifications
CREATE TABLE roles (...);
CREATE TABLE user_roles (...);
CREATE TABLE consultant_certifications (...);

-- Step 2: Popolare roles
INSERT INTO roles (slug, name, level) VALUES
  ('admin', 'Amministratore', 100),
  ('consultant', 'Consulente Certificato', 50),
  ('user', 'Utente', 10);

-- Step 3: Migrare consulenti da affiliates.abbonamento_utente
INSERT INTO user_roles (user_id, role_id, granted_at)
SELECT 
  a.user_id,
  2,  -- role_id 2 = Consultant
  a.created_at
FROM affiliates a
WHERE a.abbonamento_utente = 'consulente';

-- Step 4: Creare certificazioni placeholder
INSERT INTO consultant_certifications (user_id, certification_number, status, certified_at)
SELECT 
  a.user_id,
  'VIT-LEGACY-' || a.id,
  'active',
  a.created_at
FROM affiliates a
WHERE a.abbonamento_utente = 'consulente';

-- Step 5: Rimuovere 'consulente' da enum abbonamento_utente
ALTER TABLE affiliates 
DROP CONSTRAINT affiliates_abbonamento_utente_check;

ALTER TABLE affiliates 
ADD CONSTRAINT affiliates_abbonamento_utente_check 
CHECK (abbonamento_utente IN ('leader', 'mentor', 'mastermind'));
```

**Tempo Migrazione:** 3-4 ore (+ testing)

---

### 5. **Commissione: Fissa per Tier o Configurabile?**

**RISPOSTA: Configurabile (`commission_structures`)**

**Perché:**
- ✅ **Flessibile**: Commissioni diverse per prodotto (libro vs subscription)
- ✅ **Promozioni**: "Febbraio: +5% su tutto" con INSERT
- ✅ **Storico**: Traccia quale struttura commissioni era attiva
- ✅ **A/B Test**: Testa commissioni 30% vs 35% per Mentor

**Esempio:**
```sql
-- Struttura commissioni base Leader
INSERT INTO commission_structures (
  name, tier_id, base_percentage, 
  bonus_performance_10_clients, max_percentage, is_active
) VALUES (
  'Leader Base', 2, 25.00, 3.00, 45.00, true
);

-- Promo Febbraio 2026: +5% su subscription
INSERT INTO commission_structures (
  name, tier_id, product_type, base_percentage, 
  valid_from, valid_until, is_active
) VALUES (
  'Promo Febbraio 2026', NULL, 'subscription', 30.00,
  '2026-02-01', '2026-02-28', true
);

-- Calcolo commissione (usa struttura attiva più specifica)
SELECT 
  cs.base_percentage + 
  CASE 
    WHEN a.totale_clienti_attivi >= 30 THEN cs.bonus_performance_30_clients
    WHEN a.totale_clienti_attivi >= 10 THEN cs.bonus_performance_10_clients
    ELSE 0
  END AS commissione_totale
FROM affiliates a
JOIN user_subscriptions us ON us.user_id = a.user_id
JOIN commission_structures cs ON (
  cs.tier_id = us.tier_id OR cs.tier_id IS NULL
) AND (
  cs.product_type = 'subscription' OR cs.product_type IS NULL
) AND cs.is_active = true
WHERE a.id = 'affiliate-uuid'
ORDER BY cs.tier_id DESC NULLS LAST, cs.product_type DESC NULLS LAST
LIMIT 1;
```

**Migrazione da Schema Attuale:**
```sql
-- Step 1: Creare tabella commission_structures
CREATE TABLE commission_structures (...);

-- Step 2: Popolare con strutture esistenti
INSERT INTO commission_structures (
  name, tier_id, base_percentage, 
  bonus_performance_10_clients, bonus_performance_30_clients, 
  max_percentage, is_active
) VALUES
  ('Leader Base', 2, 25.00, 3.00, 5.00, 45.00, true),
  ('Mentor Base', 3, 30.00, 3.00, 5.00, 45.00, true),
  ('Mastermind Base', 4, 35.00, 3.00, 5.00, 45.00, true),
  ('Consulente Base', NULL, 40.00, 3.00, 5.00, 45.00, true);

-- Step 3: Aggiungere commission_structure_id a affiliate_commissions
ALTER TABLE affiliate_commissions
ADD COLUMN commission_structure_id INTEGER REFERENCES commission_structures(id);

-- Step 4: Backfill commission_structure_id (best-effort)
UPDATE affiliate_commissions ac
SET commission_structure_id = (
  SELECT cs.id
  FROM commission_structures cs
  JOIN affiliates a ON a.id = ac.affiliate_id
  JOIN user_subscriptions us ON us.user_id = a.user_id
  WHERE cs.tier_id = us.tier_id
  LIMIT 1
);

-- Step 5: Drop funzioni hardcoded
DROP FUNCTION get_commissione_base_da_abbonamento;
DROP FUNCTION calcola_commissione_affiliato;
```

**Tempo Migrazione:** 2-3 ore (+ testing)

---

## 📋 PIANO MIGRAZIONE COMPLETO

### Fase 1: Preparazione (1 Giorno)

**Obiettivo:** Creare tabelle nuove senza toccare esistenti

**Azioni:**
1. ✅ Creare tabelle `pathways`, `user_pathways`, `pathway_exercises`
2. ✅ Creare tabelle `subscription_tiers`, `user_subscriptions`
3. ✅ Creare tabelle `roles`, `user_roles`, `permissions`, `role_permissions`, `tier_permissions`
4. ✅ Creare tabelle `consultant_certifications`
5. ✅ Creare tabelle `commission_structures`
6. ✅ Popolare dati iniziali (3 percorsi, 3 tier, 3 ruoli, 4 strutture commissioni)

**Rischio:** BASSO (nessun impatto su produzione)

---

### Fase 2: Migrazione Dati (1 Giorno)

**Obiettivo:** Copiare dati da schema vecchio a nuovo

**Azioni:**
1. ✅ Migrare `profiles.current_path` → `user_pathways`
2. ✅ Migrare `exercises.book_id` → `pathway_exercises`
3. ✅ Migrare `profiles.subscription_tier` → `user_subscriptions`
4. ✅ Migrare `affiliates.abbonamento_utente = 'consulente'` → `user_roles` + `consultant_certifications`
5. ✅ Backfill `affiliate_commissions.commission_structure_id`

**Rischio:** MEDIO (doppio schema temporaneo)

---

### Fase 3: Aggiornamento Codice (2-3 Giorni)

**Obiettivo:** Refactoring codice per usare nuovo schema

**Azioni:**
1. ✅ Aggiornare query `current_path` → `user_pathways`
2. ✅ Aggiornare query `exercises` → `pathway_exercises`
3. ✅ Aggiornare query `subscription_tier` → `user_subscriptions`
4. ✅ Aggiornare query `is_consultant` → `user_roles`
5. ✅ Aggiornare calcolo commissioni → `commission_structures`
6. ✅ Test end-to-end completo

**Rischio:** ALTO (regressioni possibili)

---

### Fase 4: Cleanup (1 Giorno)

**Obiettivo:** Rimuovere schema vecchio

**Azioni:**
1. ✅ Drop colonne `profiles.current_path`, `profiles.subscription_tier`, `profiles.subscription_status`
2. ✅ Drop colonna `exercises.book_id`
3. ✅ Drop constraint `affiliates.abbonamento_utente` (rimuovi 'consulente')
4. ✅ Drop funzioni `get_commissione_base_da_abbonamento`, `calcola_commissione_affiliato`
5. ✅ Verifica finale produzione

**Rischio:** BASSO (schema nuovo già testato)

---

### Timeline Totale: 5-6 Giorni

| Fase | Durata | Rischio | Blocca Produzione? |
|------|--------|---------|---------------------|
| **1. Preparazione** | 1 giorno | BASSO | ❌ No |
| **2. Migrazione Dati** | 1 giorno | MEDIO | ❌ No |
| **3. Aggiornamento Codice** | 2-3 giorni | ALTO | ✅ Sì (deploy staging) |
| **4. Cleanup** | 1 giorno | BASSO | ✅ Sì (deploy prod) |

**Finestra Deployment:** Weekend (Sabato-Domenica)

---

## 🎯 RACCOMANDAZIONI FINALI

### 1. **Implementa Nuovo Schema PRIMA di Lanciare Cross-Selling**

**Perché:**
- Cross-selling richiede `user_pathways` (bundle 2-3 percorsi)
- Professionalizzazione richiede `consultant_certifications`
- Commissioni variabili richiedono `commission_structures`

**Timeline:**
- Settimana 1-2: Migrazione schema
- Settimana 3-4: Cross-selling implementazione
- Settimana 5-6: Test + lancio Q2

---

### 2. **Usa Feature Flags per Rollout Graduale**

**Esempio:**
```typescript
// src/lib/features.ts
export const FEATURES = {
  NEW_SCHEMA: process.env.NEXT_PUBLIC_FEATURE_NEW_SCHEMA === 'true',
  CROSS_SELLING: process.env.NEXT_PUBLIC_FEATURE_CROSS_SELLING === 'true',
};

// src/app/dashboard/page.tsx
if (FEATURES.NEW_SCHEMA) {
  // Usa user_pathways
  const pathways = await getUserPathways(userId);
} else {
  // Usa current_path (fallback)
  const currentPath = await getCurrentPath(userId);
}
```

---

### 3. **Testa in Staging con Dati Reali**

**Checklist:**
- ✅ Migrare copia database produzione → staging
- ✅ Eseguire migration script
- ✅ Testare tutti i flussi utente (signup, subscription, esercizi, commissioni)
- ✅ Verificare performance query (EXPLAIN ANALYZE)
- ✅ Rollback test (verifica backup funziona)

---

### 4. **Documenta Schema per Team**

**Crea:**
- ✅ Diagramma ER (Entity-Relationship)
- ✅ README schema (questo documento)
- ✅ Migration guide (step-by-step)
- ✅ API docs aggiornate (Swagger/OpenAPI)

---

## ✅ CONCLUSIONE

### Il Data Model Ottimale È:

1. **Dinamico** - Percorsi/tier in tabelle, non enum
2. **Flessibile** - Many-to-Many per esercizi/percorsi
3. **Separato** - Tier ≠ Ruolo ≠ Permessi
4. **Configurabile** - Commissioni in tabella, non codice
5. **Scalabile** - Supporta 3 percorsi oggi, 10 domani

### Migrazione Richiede:

- **Tempo:** 5-6 giorni (1 settimana)
- **Rischio:** MEDIO-ALTO (refactoring codice)
- **Blocco Produzione:** 2 giorni (staging + prod deploy)

### Ma Vale la Pena Perché:

- ✅ **Evita refactoring futuro** (ripartire da zero)
- ✅ **Supporta strategia 3 percorsi** (cross-selling + bundle)
- ✅ **Supporta professionalizzazione** (consulenti certificati)
- ✅ **Supporta commissioni variabili** (promozioni + A/B test)
- ✅ **Scala a 10+ percorsi** (senza migration)

---

**Raccomandazione Finale:** **FAI MIGRAZIONE ORA, PRIMA DI LANCIARE CROSS-SELLING.**

Se lanci cross-selling con schema attuale, dovrai:
1. Refactoring completo dopo 3-6 mesi
2. Downtime produzione (2-3 giorni)
3. Rischio perdita dati
4. Frustrazione utenti

**Meglio investire 1 settimana ora che 1 mese dopo.** 🚀

---

**Report creato per Fernando Marongiu — 17 Gennaio 2026**
