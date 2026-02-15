# GLOSSARIO NAMING CODEBASE - Vitaeology

**Versione:** 1.0
**Data:** 15 Febbraio 2026
**Scopo:** Fonte unica di verita per naming convention, prevenzione duplicati funzionali

---

## 1. SUPABASE CLIENT

### Regola Canonica

| Contesto | Import | Funzione | Singleton |
|----------|--------|----------|-----------|
| Server (no user context) | `@/lib/supabase/service` | `getServiceClient()` | Si |
| Server (user cookies/SSR) | `@/lib/supabase/server` | `createClient()` | No (per-request) |
| Client (browser) | `@/lib/supabase/client` | `createClient()` | Si (per-tab) |
| Middleware | `@/lib/supabase/middleware` | `updateSession()` | No |

### Alias Accettato
```typescript
// In @/lib/supabase/service.ts:
export const getSupabaseClient = getServiceClient; // Alias per compatibilita
```

### VIETATO
```typescript
// MAI definire localmente:
function getSupabase() { return createClient(...) }     // VIETATO
function getServiceClient() { return createClient(...) } // VIETATO (se locale)
const supabaseAdmin = createClient(URL, SERVICE_KEY);    // VIETATO (module-level)
```

### File da migrare (21 totali)
Tutti i file con definizione locale devono importare da `@/lib/supabase/service`:

**14 file con `getSupabase()` locale:**
- `src/app/api/admin/awareness/route.ts`
- `src/app/api/admin/monitoring/route.ts`
- `src/app/api/awareness/calculate/route.ts`
- `src/app/api/cron/challenge-emails/route.ts`
- `src/app/api/cron/affiliate-emails/route.ts`
- `src/app/api/cron/monitoring/route.ts`
- `src/app/api/libro/checkout/route.ts`
- `src/app/api/stripe/checkout/route.ts`
- `src/app/api/stripe/portal/route.ts`
- `src/lib/awareness/indicators.ts`
- `src/lib/awareness/update-level.ts`
- `src/lib/email/challenge-emails.ts`
- `src/lib/email/affiliate-emails.ts`
- `src/lib/system-logger.ts`

**7 file con `getServiceClient()` locale:**
- `src/app/api/admin/corrections/route.ts`
- `src/app/api/admin/feedback-patterns/route.ts`
- `src/app/api/admin/quality-audit/route.ts`
- `src/app/api/coach/feedback/route.ts`
- `src/app/api/exercises/complete/route.ts`
- `src/app/api/milestones/route.ts`
- `src/lib/auth/permissions.ts`

---

## 2. PATH/SLUG MAPPING

### Fonte Unica di Verita: `src/lib/path-mappings.ts`

| Contesto | Leadership | Ostacoli | Microfelicita |
|----------|------------|----------|---------------|
| **Frontend URL** | `leadership` | `ostacoli` | `microfelicita` |
| **Database** | `leadership` | `risolutore` | `microfelicita` |
| **Challenge DB** | `leadership-autentica` | `oltre-ostacoli` | `microfelicita` |
| **RAG Legacy** | `leadership` | `problemi` | `benessere` |

### Funzioni Canoniche
```typescript
import {
  toFrontendSlug,
  toDatabaseSlug,
  toChallengeDbValue,
  toLegacyPath,
  FRONTEND_TO_DATABASE,
  DATABASE_TO_FRONTEND,
  FRONTEND_TO_CHALLENGE_DB,
  CHALLENGE_DB_TO_FRONTEND,
  DATABASE_DISPLAY_NAMES,
  DATABASE_COLORS,
} from '@/lib/path-mappings';
```

### VIETATO
```typescript
// MAI creare mappature locali:
const map = { ostacoli: 'risolutore' };           // VIETATO
const CHALLENGE_TYPE_MAP = { leadership: '...' };  // VIETATO (se locale)
const slugToPathType = { risolutore: 'ostacoli' }; // VIETATO
```

### File con mappature locali residue (2, legacy accettabile)
- `src/lib/rag.ts` - `PATH_TO_BOOK` (legacy RAG, da migrare a `BY_LEGACY_PATH`)
- `src/lib/pathways.ts` - `LEGACY_PATH_MAPPING` (backward compat, da migrare)

---

## 3. EMAIL (Resend)

### Pattern Canonico: `send*Email()` -> `Promise<EmailResult>`

| Funzione | File | Scopo |
|----------|------|-------|
| `sendChallengeEmail()` | `src/lib/email/challenge-emails.ts` | Challenge drip (7 tipi) |
| `sendBookEmail()` | `src/lib/email/send-book-email.ts` | Acquisto libro singolo |
| `sendTrilogyEmail()` | `src/lib/email/send-book-email.ts` | Acquisto trilogia |
| `sendUpgradeConfirmationEmail()` | `src/lib/email/subscription-emails.ts` | Upgrade subscription |
| `sendSubscriptionRenewalReminder()` | `src/lib/email/subscription-emails.ts` | Promemoria rinnovo |
| `sendSubscriptionCancelledEmail()` | `src/lib/email/subscription-emails.ts` | Cancellazione |
| `sendAffiliateEmail()` | `src/lib/email/affiliate-emails.ts` | 16 tipi email affiliati |
| `sendAffiliateNotification()` | `src/lib/email/affiliate-emails.ts` | Notifiche affiliati |
| `sendBetaWelcomeEmail()` | `src/lib/email/beta-tester-emails.ts` | Welcome beta |
| `sendBetaWaitlistEmail()` | `src/lib/email/beta-tester-emails.ts` | Waitlist beta |
| `sendAffiliateInviteEmail()` | `src/lib/email/beta-tester-emails.ts` | Invito affiliato |
| `sendBetaPremiumActivatedEmail()` | `src/lib/email/beta-tester-emails.ts` | Premium attivato |
| `sendErrorAlert()` | `src/lib/error-alerts.ts` | Alert errori admin |
| `sendWeeklyReportEmail()` | `src/lib/ai-coach/email-report.ts` | Report settimanale AI |

### Template OTP (CONSOLIDATO)
File: `src/lib/email/auth-emails.ts`
```typescript
generateOTPEmailTemplate(otp, type: 'signup' | 'confirmation' | 'password_reset', name?)
```

Sostituisce (ora deprecate):
- `generateOTPEmail()` in `src/app/api/auth/signup/route.ts`
- `generateConfirmationEmail()` in `src/app/api/auth/resend-confirmation/route.ts`
- `generateResetPasswordEmail()` in `src/app/api/auth/forgot-password/route.ts`

### Client Resend (CONSOLIDATO)
File: `src/lib/email/client.ts`
```typescript
import { getResend } from '@/lib/email/client';
```
Singleton. Tutte le istanze locali `getResend()` sono state migrate.

### VIETATO
```typescript
// MAI usare pattern generate* locali per template OTP:
function generateOTPEmail() { ... }  // VIETATO - usa generateOTPEmailTemplate()
// MAI creare istanze Resend inline in API routes
```

---

## 4. ASSESSMENT

### Funzioni per Tipo (3 file con pattern identico)

| Operazione | Leadership | Microfelicita | Risolutore |
|------------|------------|---------------|------------|
| File | `supabase/assessment.ts` | `supabase/microfelicita.ts` | `supabase/risolutore.ts` |
| Carica domande | `loadLeadershipQuestions()` | `loadMicrofelicitaQuestions()` | `loadRisolutoreQuestions()` |
| Crea sessione | `createAssessmentSession()` | `createMicrofelicitaSession()` | `createRisolutoreSession()` |
| Sessione in corso | `getInProgressAssessment()` | `getInProgressMicrofelicita()` | `getInProgressRisolutore()` |
| Carica risposte | `loadAnswers()` | `loadMicrofelicitaAnswers()` | `loadRisolutoreAnswers()` |
| Salva risposta | `saveAnswer()` | `saveMicrofelicitaAnswer()` | `saveRisolutoreAnswer()` |
| Completa | `completeAssessment()` | `completeMicrofelicitaAssessment()` | `completeRisolutoreAssessment()` |

**Stato attuale:** 30 funzioni duplicate (10 per tipo). Funzionali ma ridondanti.
**Futuro:** Creare `assessment-generic.ts` con funzioni parametriche.

### Funzioni Unificate (gia corrette)
| Funzione | File |
|----------|------|
| `checkAssessmentAccess()` | `src/lib/assessment-access.ts` |
| `markChallengeConvertedToAssessment()` | `src/lib/challenges.ts` |

---

## 5. AUTENTICAZIONE

### Pattern API Routes (canonico)
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
}
```

### Admin Verification
| Funzione | File | Uso |
|----------|------|-----|
| `verifyAdminFromRequest()` | `src/lib/admin/verify-admin.ts` | API routes admin (role >= 80) |
| `verifyStaffFromRequest()` | `src/lib/admin/verify-admin.ts` | API routes staff (role >= 40) |
| `verifyPermissionFromRequest()` | `src/lib/admin/verify-admin.ts` | RBAC granulare |
| `getAuthorizationContext()` | `src/lib/auth/authorization.ts` | Server Components |

### Regola
- **API routes admin:** usare `verify-admin.ts` (service role)
- **Server Components/middleware:** usare `authorization.ts` (user session)

---

## 6. RATE LIMITING

### Libreria: `src/lib/rate-limiter.ts`

| Funzione | Scopo |
|----------|-------|
| `checkRateLimit(ip, config)` | Verifica limite |
| `getClientIP(request)` | Estrae IP |
| `rateLimitExceededResponse(resetIn)` | Risposta 429 |
| `validateEmail(email)` | Format + spam |
| `isValidEmailFormat(email)` | RFC 5322 |
| `isSpamEmail(email)` | Pattern spam |

### Rate Limit Predefiniti
| Nome | Limite | Usato per |
|------|--------|-----------|
| `publicForm` | 5 req/min | Signup, beta, contact |
| `challengeSubscribe` | 10 req/min | Landing challenge |
| `api` | 30 req/min | API generiche |
| `auth` | 10 req/15min | Auth endpoints |

---

## 7. SICUREZZA

| Funzione | File | Scopo |
|----------|------|-------|
| `verifyTurnstileToken()` | `src/lib/turnstile.ts` | CAPTCHA Cloudflare |
| `turnstileFailedResponse()` | `src/lib/turnstile.ts` | Risposta errore |
| `isIPBlocked()` | `src/lib/validation/ip-blocklist.ts` | Check blocklist |
| `blockIP()` | `src/lib/validation/ip-blocklist.ts` | Blocca IP |
| `validateName()` | `src/lib/validation/name-validator.ts` | Anti-spam nomi |
| `logSignupAttempt()` | `src/lib/validation/signup-logger.ts` | Audit trail |
| `shouldAutoBlockIP()` | `src/lib/validation/signup-logger.ts` | Auto-block |

---

## 8. SERVIZI ESTERNI

### Factory Canoniche

| Servizio | Factory | File | Singleton |
|----------|---------|------|-----------|
| **Anthropic Claude** | `getAnthropicClient()` | `src/lib/ai-clients.ts` | Si |
| **OpenAI** | `getOpenAIClient()` | `src/lib/ai-clients.ts` | Si |
| **Supabase Service** | `getServiceClient()` | `src/lib/supabase/service.ts` | Si |
| **Resend** | `getResend()` | `src/lib/email/client.ts` | Si |

### Senza Factory (da creare)
- **Stripe:** `getStripe()` definito localmente in `stripe/checkout/route.ts`

### Variabili Ambiente Server-Only
`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `CRON_SECRET`, `TURNSTILE_SECRET_KEY`, `PDF_URL_LEADERSHIP`, `PDF_URL_RISOLUTORE`, `PDF_URL_MICROFELICITA`

### Variabili Ambiente Client
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`

---

## 9. CRON JOBS

| Endpoint | Schedule | Secret |
|----------|----------|--------|
| `/api/cron/monitoring` | */15 * * * * | CRON_SECRET |
| `/api/cron/challenge-emails` | 0 8 * * * | CRON_SECRET |
| `/api/cron/affiliate-emails` | 0 9 * * * | CRON_SECRET |
| `/api/cron/beta-approval` | 0 9 * * * | CRON_SECRET |
| `/api/cron/beta-premium-expiry` | 0 1 * * * | CRON_SECRET |
| `/api/ai-coach/cron/combined` | 0 23 * * * | CRON_SECRET |

### Pattern Validazione (canonico)
```typescript
const authHeader = request.headers.get('authorization');
if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## 10. CONFIG FILES

| File | Scopo | Export Principali |
|------|-------|-------------------|
| `src/config/pricing.ts` | Value Ladder (8 tier) | `PRICING_TIERS`, `getAllTiers()` |
| `src/config/videos.ts` | Video URLs (R2 CDN) | `LANDING_VIDEOS`, `CHALLENGE_VIDEOS` |
| `src/lib/path-mappings.ts` | Slug mapping | Vedi sezione 2 |
| `src/lib/challenge/config.ts` | Challenge config | Re-export da path-mappings |

---

## RIEPILOGO PRIORITA REFACTORING

| # | Problema | Severita | File | Azione | Stato |
|---|----------|----------|------|--------|-------|
| 1 | Supabase client locale (31 file) | ALTA | 31 | Migrare a `getServiceClient()` | ✅ COMPLETATO |
| 2 | Slug mapping locale (2 file legacy) | BASSA | 2 | Migrare `rag.ts`, `pathways.ts` | Da fare |
| 3 | Template OTP duplicati (3 file) | MEDIA | 3 | Creare `auth-emails.ts` | ✅ COMPLETATO |
| 4 | Assessment funzioni duplicate (30) | MEDIA | 3 | Creare `assessment-generic.ts` (post-lancio) | Da fare |
| 5 | Factory Resend mancante (13 file) | BASSA | 13 | Creare factory singleton | ✅ COMPLETATO |
| 6 | Factory Stripe mancante | BASSA | 1 | Creare `getStripe()` centralizzata | Da fare |
| 6 | Clarity ID hardcoded | BASSA | 1 | Spostare in env var |
