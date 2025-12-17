-- ============================================================
-- AGGIORNAMENTO RUOLI - ADMIN E STAFF
-- ============================================================
-- I clienti usano subscription_tier (explorer, leader, mentor, mastermind, partner_elite)
-- I ruoli sono SOLO per admin e consulenti interni
-- ============================================================

-- 0. Prima rimuovi riferimenti da profiles
UPDATE profiles SET role_id = NULL WHERE role_id IN (
  SELECT id FROM roles WHERE name IN ('premium', 'free')
);

-- 1. Rimuovi ruoli clienti (non servono, usano subscription_tier)
DELETE FROM role_permissions WHERE role_id IN (
  SELECT id FROM roles WHERE name IN ('premium', 'free')
);
DELETE FROM roles WHERE name IN ('premium', 'free');

-- 2. Aggiorna ruoli esistenti
UPDATE roles SET
  name = 'super_admin',
  display_name = 'Super Amministratore',
  description = 'Accesso completo: Fernando e owner. Gestione totale piattaforma.',
  level = 100
WHERE name = 'super_admin';

UPDATE roles SET
  name = 'content_admin',
  display_name = 'Admin Contenuti',
  description = 'Gestione esercizi, contenuti, RAG knowledge base.',
  level = 80
WHERE name = 'admin';

UPDATE roles SET
  name = 'tech_admin',
  display_name = 'Admin Tecnico',
  description = 'Gestione sistema, metriche, log, configurazioni tecniche.',
  level = 80
WHERE name = 'moderator';

-- 3. Aggiungi nuovi ruoli consulenti
INSERT INTO roles (name, display_name, description, level, is_system) VALUES
  ('consultant_tech', 'Consulente Tecnico', 'Consulente esterno con accesso a dashboard metriche e log tecnici.', 40, FALSE),
  ('consultant_comm', 'Consulente Comunicazione', 'Consulente esterno con accesso a contenuti e analytics utenti.', 40, FALSE)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  level = EXCLUDED.level;

-- ============================================================
-- 4. AGGIORNA PERMESSI PER NUOVI RUOLI
-- ============================================================

-- Pulisci associazioni esistenti e ricrea
DELETE FROM role_permissions;

-- SUPER_ADMIN: Tutti i permessi
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'super_admin';

-- CONTENT_ADMIN: Gestione contenuti
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'content_admin'
  AND p.name IN (
    'admin.dashboard.view',
    'admin.dashboard.metrics',
    'admin.dashboard.export',
    'users.view',
    'exercises.view.all',
    'exercises.create',
    'exercises.edit',
    'exercises.delete',
    'exercises.publish',
    'ai_coach.use',
    'ai_coach.unlimited',
    'ai_coach.admin',
    'ai_coach.prompts.edit',
    'ai_coach.rag.manage',
    'content.premium',
    'content.advanced',
    'content.create',
    'content.edit'
  );

-- TECH_ADMIN: Gestione tecnica
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'tech_admin'
  AND p.name IN (
    'admin.dashboard.view',
    'admin.dashboard.metrics',
    'admin.dashboard.export',
    'users.view',
    'users.edit',
    'ai_coach.use',
    'ai_coach.unlimited',
    'ai_coach.admin',
    'system.settings',
    'system.logs',
    'system.maintenance'
  );

-- CONSULTANT_TECH: Solo visualizzazione metriche tecniche
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'consultant_tech'
  AND p.name IN (
    'admin.dashboard.view',
    'admin.dashboard.metrics',
    'system.logs'
  );

-- CONSULTANT_COMM: Solo visualizzazione contenuti e analytics
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'consultant_comm'
  AND p.name IN (
    'admin.dashboard.view',
    'admin.dashboard.metrics',
    'users.view',
    'exercises.view.all',
    'content.premium',
    'content.advanced'
  );

-- ============================================================
-- 5. AGGIORNA UTENTI: Solo admin/staff hanno ruoli
-- ============================================================

-- Fernando = super_admin
UPDATE profiles
SET role_id = (SELECT id FROM roles WHERE name = 'super_admin')
WHERE email = 'fernando@vitaeology.com';

-- Rimuovi ruoli da utenti normali (usano subscription_tier)
UPDATE profiles
SET role_id = NULL
WHERE email != 'fernando@vitaeology.com';

-- ============================================================
-- RIEPILOGO RUOLI
-- ============================================================
-- super_admin (100)     → Fernando, owner. Accesso TOTALE.
-- content_admin (80)    → Staff gestione contenuti/esercizi/RAG
-- tech_admin (80)       → Staff gestione tecnica/metriche/sistema
-- consultant_tech (40)  → Consulenti esterni tech (solo lettura metriche)
-- consultant_comm (40)  → Consulenti esterni comm (solo lettura analytics)
-- ============================================================
