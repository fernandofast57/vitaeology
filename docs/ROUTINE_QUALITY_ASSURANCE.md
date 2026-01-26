# ROUTINE QUALITY ASSURANCE - Vitaeology

**Versione:** 1.0  
**Data:** 26 Gennaio 2026  
**Conformità:** MEGA_PROMPT v4.2 - Ciclo di Correzione Continua

---

## 1. Scopo del Documento

Questo documento definisce il **calendario e le procedure** per eseguire i controlli di qualità del sistema Vitaeology in modo sistematico e prevedibile.

### Principio Guida

> "La qualità non è un evento, è un'abitudine. I controlli periodici prevengono l'accumulo di debito tecnico."

Riferimento ai 4 Prodotti / 12 Fattori:
- **Istituzione**: Sistema di QA come strumento di produzione
- **Prodotto**: Report e correzioni
- **Viability**: Controlli regolari garantiscono longevità

---

## 2. Calendario Controlli

### 2.1 Matrice Frequenza

| Controllo | Frequenza | Durata | Priorità |
|-----------|-----------|--------|----------|
| Health Check Rapido | Giornaliero | 2 min | 🔴 Critica |
| Code Quality Scan | Pre-deploy | 5 min | 🔴 Critica |
| Review Health Dashboard | Settimanale | 10 min | 🟡 Alta |
| Analisi Trend Errori | Settimanale | 15 min | 🟡 Alta |
| Pulizia Log Vecchi | Mensile | 5 min | 🟢 Media |
| Calibrazione Soglie | Mensile | 30 min | 🟢 Media |
| Audit Completo | Trimestrale | 2 ore | 🟡 Alta |

### 2.2 Dettaglio per Momento

```
═══════════════════════════════════════════════════════════════════
                    CONTROLLI GIORNALIERI
═══════════════════════════════════════════════════════════════════

QUANDO: Ogni mattina prima di iniziare sviluppo (o dopo il caffè ☕)

COSA FARE:
1. Aprire /admin/health
2. Verificare tutti i servizi siano 🟢
3. Se qualcosa è 🔴 o 🟡 → Investigare prima di altro

PROMPT PER CLAUDE CODE:
"Esegui health check rapido del sistema Vitaeology. 
Verifica stato cron jobs ultime 24 ore e segnala anomalie."

TEMPO: ~2 minuti
OUTPUT: OK oppure lista problemi da risolvere

═══════════════════════════════════════════════════════════════════
                    CONTROLLI PRE-DEPLOY
═══════════════════════════════════════════════════════════════════

QUANDO: SEMPRE prima di merge a main o deploy a produzione

COSA FARE:
1. npm run quality:ci
2. Se score < 80 → Correggere prima di procedere
3. Se errori critici > 0 → STOP, risolvere obbligatoriamente
4. Verificare checklist manuale per logica business

PROMPT PER CLAUDE CODE:
"Esegui controllo qualità pre-deploy su Vitaeology.
Analizza codice modificato, verifica pattern problematici,
conferma che sia safe per produzione."

TEMPO: ~5 minuti
OUTPUT: Report qualità + OK/BLOCCO

═══════════════════════════════════════════════════════════════════
                    REVIEW SETTIMANALE
═══════════════════════════════════════════════════════════════════

QUANDO: Ogni Lunedì mattina (inizio settimana)

COSA FARE:
1. Aprire /admin/health
2. Analizzare sezione "Errori ultimi 7 giorni"
3. Identificare pattern ricorrenti
4. Creare task per risolvere problemi sistemici
5. Verificare tasso successo email > 95%

PROMPT PER CLAUDE CODE:
"Genera report settimanale QA per Vitaeology.
Analizza: errori ultimi 7 giorni, trend cron jobs,
tasso successo email, code quality score attuale.
Identifica top 3 aree da migliorare questa settimana."

TEMPO: ~15 minuti
OUTPUT: Report + Action items per la settimana

TEMPLATE REPORT SETTIMANALE:
┌─────────────────────────────────────────────────────────────┐
│ REPORT QA SETTIMANALE - Vitaeology                          │
│ Settimana: [DATA] - [DATA]                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ METRICHE CHIAVE:                                            │
│ • Uptime servizi: ___%                                      │
│ • Email success rate: ___%                                  │
│ • Errori totali: ___                                        │
│ • Code quality score: ___/100                               │
│                                                             │
│ PROBLEMI RISOLTI QUESTA SETTIMANA:                          │
│ 1. _______________                                          │
│ 2. _______________                                          │
│                                                             │
│ PROBLEMI DA RISOLVERE:                                      │
│ 1. [PRIORITÀ] _______________                               │
│ 2. [PRIORITÀ] _______________                               │
│                                                             │
│ AZIONI SETTIMANA PROSSIMA:                                  │
│ 1. _______________                                          │
│ 2. _______________                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════
                    MANUTENZIONE MENSILE
═══════════════════════════════════════════════════════════════════

QUANDO: Primo Lunedì del mese

COSA FARE:
1. Pulizia log > 90 giorni
2. Analisi trend mensile errori
3. Calibrazione soglie quality check
4. Review dipendenze npm per security
5. Backup configurazioni

PROMPT PER CLAUDE CODE:
"Esegui manutenzione mensile Vitaeology:
1. Pulisci system_logs più vecchi di 90 giorni
2. Genera report trend errori ultimo mese
3. Verifica se soglie code quality sono appropriate
4. Controlla npm audit per vulnerabilità
5. Conferma backup configurazioni critiche"

TEMPO: ~30 minuti
OUTPUT: Conferma manutenzione + eventuali alert

QUERY PULIZIA LOG:
DELETE FROM system_logs 
WHERE created_at < NOW() - INTERVAL '90 days';

VERIFICA DIPENDENZE:
npm audit
npm outdated

═══════════════════════════════════════════════════════════════════
                    AUDIT TRIMESTRALE
═══════════════════════════════════════════════════════════════════

QUANDO: Primo Lunedì di Gennaio, Aprile, Luglio, Ottobre

COSA FARE:
1. Review completo architettura vs MEGA_PROMPT
2. Analisi copertura test (se presenti)
3. Performance audit (tempi risposta API)
4. Security review (permessi, RLS, auth)
5. Documentazione aggiornamento
6. Pianificazione miglioramenti trimestre successivo

PROMPT PER CLAUDE CODE:
"Esegui audit trimestrale completo Vitaeology.

FASE 1 - ARCHITETTURA:
Verifica allineamento codebase con MEGA_PROMPT v4.2.
Identifica deviazioni e proponi correzioni.

FASE 2 - PERFORMANCE:
Analizza tempi risposta API principali.
Identifica bottleneck e ottimizzazioni.

FASE 3 - SICUREZZA:
Review RLS policies Supabase.
Verifica auth su tutti gli endpoint /api/.
Controlla gestione secrets.

FASE 4 - DOCUMENTAZIONE:
Verifica che docs/ sia aggiornato.
Identifica documentazione mancante.

FASE 5 - PIANIFICAZIONE:
Proponi top 5 miglioramenti per prossimo trimestre
basati su dati raccolti.

Output: Report completo con raccomandazioni prioritizzate."

TEMPO: ~2 ore
OUTPUT: Report audit + Piano trimestrale
```

---

## 3. Prompt Master per Claude Code

Usa questo prompt all'inizio di ogni sessione di sviluppo per attivare la mentalità QA:

```
═══════════════════════════════════════════════════════════════════
PROMPT: SESSIONE DI SVILUPPO CON QA INTEGRATO
═══════════════════════════════════════════════════════════════════

Contesto: Sto lavorando sul progetto Vitaeology.
Prima di procedere con qualsiasi sviluppo:

1. VERIFICA STATO SISTEMA
   - Controlla /admin/health (o simula il check se non disponibile)
   - Segnala eventuali errori cron/email ultime 24 ore

2. DURANTE LO SVILUPPO
   - Applica pattern da CODE_QUALITY_GUARD.md
   - Evita: catch vuoti, any type, console.log
   - Ogni funzione: max 50 righe, complessità < 10
   - Gestisci SEMPRE errori Supabase: const { data, error } = ...

3. PRIMA DI CONSIDERARE COMPLETATO
   - Esegui: npm run quality
   - Verifica score >= 80
   - Risolvi errori critici
   - Applica checklist manuale per logica business

4. LOGGING
   - Usa logSystem() per operazioni significative
   - Usa logCronExecution() per tutti i cron job
   - Usa logEmailSent() per ogni email

Riferimento documenti:
- /docs/HEALTH_MONITORING_SYSTEM.md
- /docs/CODE_QUALITY_GUARD.md
- /docs/ROUTINE_QUALITY_ASSURANCE.md

Procedi con lo sviluppo mantenendo questi principi attivi.
═══════════════════════════════════════════════════════════════════
```

---

## 4. Automazioni Consigliate

### 4.1 GitHub Actions (Futuro)

```yaml
# .github/workflows/quality-check.yml
name: Quality Check

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run quality:ci
```

### 4.2 Pre-commit Hook (Opzionale)

```bash
# .husky/pre-commit
#!/bin/sh
npm run quality:ci
if [ $? -ne 0 ]; then
  echo "❌ Quality check fallito. Correggi prima di committare."
  exit 1
fi
```

### 4.3 Cron Job Vercel per Health Alert

```typescript
// src/app/api/cron/health-alert/route.ts
// Esegue ogni ora, invia alert se problemi critici

export async function GET() {
  const healthData = await checkSystemHealth();
  
  if (healthData.criticalErrors > 0) {
    await sendAlertEmail({
      subject: '🚨 Vitaeology: Errori Critici Rilevati',
      body: `Trovati ${healthData.criticalErrors} errori critici.`
    });
  }
  
  return Response.json({ checked: true });
}
```

---

## 5. Metriche di Successo

### 5.1 KPI da Tracciare

| KPI | Target | Misurazione |
|-----|--------|-------------|
| Uptime Cron | > 99% | % esecuzioni success |
| Email Delivery | > 95% | % email inviate vs fallite |
| Code Quality Score | > 80 | Score medio settimanale |
| Errori Critici | 0 | Conteggio settimanale |
| Tempo Risoluzione Bug | < 24h | Media ore da rilevamento a fix |

### 5.2 Dashboard KPI (Futuro)

Considera di aggiungere a /admin/health una sezione trend:

```
TREND ULTIMI 30 GIORNI:
📈 Uptime: 99.2% (+0.5%)
📈 Email: 96.1% (+2.3%)
📉 Quality: 78 (-3)  ← ATTENZIONE
✅ Errori critici: 0
```

---

## 6. Escalation e Responsabilità

### 6.1 Matrice Responsabilità

| Evento | Azione | Responsabile | Tempo Max |
|--------|--------|--------------|-----------|
| Cron fallisce 3x | Investigare causa | Developer | 2 ore |
| Email rate < 90% | Verificare SMTP/DNS | Developer | 4 ore |
| Quality < 60 | Stop deploy, correggere | Developer | Immediato |
| Security alert | Patch + rotate secrets | Developer | 1 ora |

### 6.2 Procedura Escalation

```
1. RILEVAMENTO
   └─→ Sistema automatico o check manuale

2. CLASSIFICAZIONE
   └─→ Critico (blocca produzione) / Alto / Medio / Basso

3. NOTIFICA
   └─→ Critico: Immediata + log
   └─→ Altro: Prossimo check pianificato

4. RISOLUZIONE
   └─→ Documenta causa
   └─→ Implementa fix
   └─→ Verifica fix funziona
   └─→ Aggiorna sistema per prevenire ricorrenza

5. POST-MORTEM (per critici)
   └─→ Cosa è successo?
   └─→ Perché non è stato prevenuto?
   └─→ Come evitare in futuro?
```

---

## 7. Integrazione con Workflow Esistente

### 7.1 Prima di Ogni Sessione Claude Code

```
"Prima di iniziare, verifica:
1. Stato sistema da /admin/health
2. Ultimo code quality score
3. Eventuali errori aperti da risolvere

Poi procedi con [TASK SPECIFICO]"
```

### 7.2 Dopo Ogni Implementazione Significativa

```
"Ho completato [TASK]. Prima di considerarlo finito:
1. Esegui npm run quality
2. Verifica integrazione con logging system
3. Testa che non abbia rotto nulla di esistente
4. Aggiorna documentazione se necessario"
```

### 7.3 Fine Giornata di Sviluppo

```
"Concludi la sessione:
1. Commit di tutto il lavoro
2. Verifica /admin/health pulito
3. Documenta eventuali TODO per domani
4. Se ci sono warning quality, annota per risolverli"
```

---

## 8. Checklist Implementazione Sistema QA

### Fase 1: Infrastruttura (Settimana 1)
- [ ] Creare tabella system_logs
- [ ] Implementare system-logger.ts
- [ ] Integrare logging in cron esistenti
- [ ] Creare API /api/admin/health

### Fase 2: Dashboard (Settimana 2)
- [ ] Creare pagina /admin/health
- [ ] Implementare visualizzazione stato servizi
- [ ] Aggiungere lista errori recenti
- [ ] Configurare auto-refresh

### Fase 3: Code Quality (Settimana 3)
- [ ] Configurare ESLint potenziato
- [ ] Creare script code-quality-check.ts
- [ ] Aggiungere npm scripts
- [ ] Integrare in dashboard

### Fase 4: Routine (Settimana 4)
- [ ] Stabilire routine giornaliera
- [ ] Configurare reminder settimanale
- [ ] Documentare procedure
- [ ] Formare abitudine

---

## 9. Riferimenti

| Documento | Scopo |
|-----------|-------|
| HEALTH_MONITORING_SYSTEM.md | Dettagli tecnici monitoring |
| CODE_QUALITY_GUARD.md | Dettagli tecnici quality check |
| MEGA_PROMPT v4.2 | Principi architetturali |
| CONTROL_TOWER v1.1 | Stato progetto |

---

*Documento generato il 26/01/2026 - Vitaeology Routine QA v1.0*
