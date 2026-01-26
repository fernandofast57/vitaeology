# HEALTH MONITORING SYSTEM - Vitaeology

**Versione:** 1.0  
**Data:** 26 Gennaio 2026  
**Conformità:** MEGA_PROMPT v4.2 - Sezione Qualità e Correzione

---

## 1. Scopo del Documento

Questo documento definisce il sistema di monitoring interno per Vitaeology, progettato per fornire visibilità in tempo reale sullo stato di salute del sistema e identificare problemi prima che impattino gli utenti.

### Principio Guida

> "La visibilità è il prerequisito della correzione. Non puoi sistemare ciò che non vedi."

Riferimento ai 4 Prodotti: questo sistema appartiene alla categoria **Correzione dell'Output** - identifica quando i prodotti del sistema (email, cron, API) non funzionano correttamente.

---

## 2. Architettura del Sistema

### 2.1 Componenti

```
┌─────────────────────────────────────────────────────────────┐
│                    HEALTH MONITORING                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │   CRON      │    │   EMAIL     │    │    API      │    │
│  │   JOBS      │───▶│   SERVICE   │───▶│  ENDPOINTS  │    │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    │
│         │                  │                  │            │
│         ▼                  ▼                  ▼            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              SYSTEM_LOGS (Supabase)                 │  │
│  └─────────────────────────────────────────────────────┘  │
│                          │                                 │
│                          ▼                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              /admin/health (Dashboard)              │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Flusso Dati

1. Ogni servizio (cron, email, API) logga le proprie esecuzioni
2. I log vengono salvati nella tabella `system_logs`
3. La dashboard `/admin/health` visualizza lo stato aggregato
4. Alert automatici notificano anomalie

---

## 3. Implementazione Tecnica

### 3.1 Schema Database

```sql
-- Tabella principale per i log di sistema
CREATE TABLE system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Identificazione del servizio
  service VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  
  -- Risultato dell'operazione
  status VARCHAR(20) NOT NULL,
  status_code INTEGER,
  
  -- Dettagli operazione
  message TEXT,
  metadata JSONB,
  
  -- Informazioni errore (se presente)
  error_message TEXT,
  error_stack TEXT,
  
  -- Metriche performance
  duration_ms INTEGER,
  
  -- Constraint per validazione
  CONSTRAINT valid_service CHECK (service IN ('cron', 'email', 'api', 'auth', 'coach')),
  CONSTRAINT valid_status CHECK (status IN ('success', 'error', 'warning'))
);

-- Indici per query performanti
CREATE INDEX idx_system_logs_service ON system_logs(service);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX idx_system_logs_status ON system_logs(status);
CREATE INDEX idx_system_logs_service_action ON system_logs(service, action);

-- Policy RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Solo service_role può inserire
CREATE POLICY "Service role can insert" ON system_logs
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Solo admin possono leggere
CREATE POLICY "Admin can read" ON system_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

### 3.2 Utility di Logging

**File:** `src/lib/system-logger.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

// Tipi supportati
type ServiceType = 'cron' | 'email' | 'api' | 'auth' | 'coach';
type StatusType = 'success' | 'error' | 'warning';

interface LogEntry {
  service: ServiceType;
  action: string;
  status: StatusType;
  statusCode?: number;
  message: string;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
  errorStack?: string;
  durationMs?: number;
}

/**
 * Registra un evento nel sistema di logging
 */
export async function logSystem(entry: LogEntry): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('system_logs')
    .insert({
      service: entry.service,
      action: entry.action,
      status: entry.status,
      status_code: entry.statusCode,
      message: entry.message,
      metadata: entry.metadata,
      error_message: entry.errorMessage,
      error_stack: entry.errorStack,
      duration_ms: entry.durationMs
    });
    
  if (error) {
    console.error('[SystemLogger] Failed to log:', error);
  }
}

/**
 * Wrapper per logging esecuzioni cron
 */
export async function logCronExecution(
  action: string,
  status: StatusType,
  details: {
    message?: string;
    metadata?: Record<string, unknown>;
    error?: Error;
    durationMs?: number;
  }
): Promise<void> {
  await logSystem({
    service: 'cron',
    action,
    status,
    message: details.message || `Cron ${action} ${status}`,
    metadata: details.metadata,
    errorMessage: details.error?.message,
    errorStack: details.error?.stack,
    durationMs: details.durationMs
  });
}

/**
 * Wrapper per logging invio email
 */
export async function logEmailSent(
  recipient: string,
  template: string,
  success: boolean,
  error?: Error
): Promise<void> {
  await logSystem({
    service: 'email',
    action: template,
    status: success ? 'success' : 'error',
    message: success 
      ? `Email ${template} inviata a ${recipient}`
      : `Fallimento invio ${template} a ${recipient}`,
    metadata: { recipient, template },
    errorMessage: error?.message,
    errorStack: error?.stack
  });
}

/**
 * Helper per misurare durata esecuzione
 */
export function createTimer(): () => number {
  const start = Date.now();
  return () => Date.now() - start;
}
```

### 3.3 Esempio Integrazione in Cron

```typescript
// src/app/api/cron/challenge-emails/route.ts

import { logCronExecution, createTimer } from '@/lib/system-logger';

export async function GET(request: Request) {
  const timer = createTimer();
  
  try {
    // Verifica autorizzazione...
    
    // Logica cron...
    const emailsSent = await processEmails();
    
    // Log successo
    await logCronExecution('challenge-emails', 'success', {
      message: `Processate ${emailsSent} email`,
      metadata: { emailsSent, timestamp: new Date().toISOString() },
      durationMs: timer()
    });
    
    return Response.json({ success: true, emailsSent });
    
  } catch (error) {
    // Log errore
    await logCronExecution('challenge-emails', 'error', {
      message: 'Errore durante processamento email',
      error: error as Error,
      durationMs: timer()
    });
    
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

## 4. Dashboard Admin Health

### 4.1 Layout Pagina

**Route:** `/admin/health`

```
┌─────────────────────────────────────────────────────────────────┐
│  🏥 Sistema di Salute - Vitaeology              [↻ Refresh]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STATO SERVIZI                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ ✅ CRON  │ │ ✅ EMAIL │ │ ✅ API   │ │ ✅ COACH │          │
│  │ 100%     │ │ 98%      │ │ 100%     │ │ 95%      │          │
│  │ 2m fa    │ │ 5m fa    │ │ 1m fa    │ │ 3m fa    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ULTIME ESECUZIONI CRON                                         │
│  ┌────────────────┬──────────┬─────────────┬──────────────┐   │
│  │ Azione         │ Stato    │ Quando      │ Durata       │   │
│  ├────────────────┼──────────┼─────────────┼──────────────┤   │
│  │ challenge-email│ ✅       │ 5 min fa    │ 341ms        │   │
│  │ monitoring     │ ✅       │ 15 min fa   │ 89ms         │   │
│  │ challenge-email│ ❌ 401   │ 1 ora fa    │ 698ms        │   │
│  └────────────────┴──────────┴─────────────┴──────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  EMAIL ULTIME 24 ORE                                            │
│  Inviate: 47  │  Fallite: 2  │  Tasso successo: 95.9%          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ERRORI RECENTI (ultimi 7 giorni)                               │
│  🔴 26/01 09:49 - cron/challenge-emails - 401 Unauthorized     │
│  🔴 25/01 14:22 - email/welcome - SMTP timeout                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 API Endpoint

**File:** `src/app/api/admin/health/route.ts`

```typescript
interface HealthResponse {
  timestamp: string;
  services: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'down';
      successRate: number;
      lastRun: string | null;
      lastError: string | null;
    };
  };
  recentLogs: Array<{
    id: string;
    service: string;
    action: string;
    status: string;
    message: string;
    createdAt: string;
    durationMs: number | null;
  }>;
  emailStats: {
    sent24h: number;
    failed24h: number;
    successRate: number;
  };
  recentErrors: Array<{
    id: string;
    service: string;
    action: string;
    errorMessage: string;
    createdAt: string;
  }>;
}
```

---

## 5. Query di Riferimento

### 5.1 Ultime N Esecuzioni per Servizio

```sql
SELECT 
  id, service, action, status, message, 
  duration_ms, created_at
FROM system_logs 
WHERE service = $1
ORDER BY created_at DESC 
LIMIT $2;
```

### 5.2 Tasso Successo Ultime 24 Ore

```sql
SELECT 
  service,
  COUNT(*) FILTER (WHERE status = 'success') as successes,
  COUNT(*) FILTER (WHERE status = 'error') as errors,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'success')::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    1
  ) as success_rate
FROM system_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY service;
```

### 5.3 Errori Ultimi 7 Giorni

```sql
SELECT 
  id, service, action, error_message, 
  metadata, created_at
FROM system_logs 
WHERE status = 'error' 
AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 50;
```

### 5.4 Statistiche Email

```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'success') as sent,
  COUNT(*) FILTER (WHERE status = 'error') as failed
FROM system_logs 
WHERE service = 'email'
AND created_at > NOW() - INTERVAL '24 hours';
```

---

## 6. Manutenzione

### 6.1 Pulizia Log Vecchi

Eseguire mensilmente per evitare crescita infinita della tabella:

```sql
-- Mantiene solo ultimi 90 giorni
DELETE FROM system_logs 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### 6.2 Monitoraggio Dimensione Tabella

```sql
SELECT 
  pg_size_pretty(pg_total_relation_size('system_logs')) as size,
  COUNT(*) as rows
FROM system_logs;
```

---

## 7. Checklist Implementazione

- [x] Creare tabella `system_logs` in Supabase → `sql/system_logs.sql`
- [x] Configurare RLS policies → Incluse in `sql/system_logs.sql`
- [x] Creare `src/lib/system-logger.ts` → Completato
- [ ] Integrare in `cron/challenge-emails` (opzionale - post 100 utenti)
- [x] Creare `/api/cron/monitoring` → Completato con 4P×3F
- [x] Creare API `/api/admin/health` → Completato
- [x] Creare pagina `/admin/health` → Completato
- [x] Creare pagina `/admin/monitoring` → Dashboard 4P×3F avanzata
- [x] Configurare auto-refresh dashboard → 60 secondi

### SQL Migrations da eseguire in Supabase:
1. `sql/system_logs.sql` - Event logging
2. `sql/system_metrics_12f.sql` - Metriche 4P×3F (se non già eseguito)

---

## 8. Riferimenti MEGA_PROMPT

| Sezione | Allineamento |
|---------|--------------|
| 4 Prodotti | Correzione dell'Output Generato |
| Qualità | Grado di perfezione del monitoraggio |
| Viability | Longevità tramite log persistenti |
| Stack | Next.js 14 + Supabase + TypeScript |

---

*Documento generato il 26/01/2026 - Vitaeology Health Monitoring System v1.0*
