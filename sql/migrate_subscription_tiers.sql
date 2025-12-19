-- ============================================================
-- MIGRAZIONE: Aggiornamento subscription_tier a Value Ladder
-- Data: 2025-12-18
-- ============================================================
--
-- Questo script:
-- 1. Rimuove il vecchio CHECK constraint
-- 2. Migra i dati esistenti (free → explorer, professional → leader)
-- 3. Crea il nuovo CHECK constraint con i valori Value Ladder
--
-- ESEGUI SU: Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Rimuovi il vecchio constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

-- Step 2: Migra i dati esistenti ai nuovi valori
UPDATE profiles
SET subscription_tier = 'explorer'
WHERE subscription_tier IN ('free', 'trial');

UPDATE profiles
SET subscription_tier = 'leader'
WHERE subscription_tier = 'professional';

-- Step 3: Crea il nuovo constraint con i valori Value Ladder
-- Fase 1: explorer, leader, mentor
-- Fase 2 (futuro): mastermind, partner_elite
ALTER TABLE profiles
ADD CONSTRAINT profiles_subscription_tier_check
CHECK (subscription_tier IN ('explorer', 'leader', 'mentor', 'mastermind', 'partner_elite'));

-- Step 4: Verifica
SELECT subscription_tier, COUNT(*) as count
FROM profiles
GROUP BY subscription_tier;

-- ============================================================
-- FATTO! I tier ora usano la nuova nomenclatura Value Ladder
-- ============================================================
