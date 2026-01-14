# Changelog Vitaeology

> Registro automatico delle modifiche al progetto.
> Ultimo aggiornamento: 14/01/2026, 17:12:58

---

## 📅 mercoledì 14 gennaio 2026

### ✨ Nuova Funzionalità

- implement 4P×3F adaptive monitoring system (`b807379`)
- add automatic changelog generation script (`0f8ac52`)
- add automatic error alerts via email (`e67ef41`)
- add automated pre-deploy critical tests (`819b000`)
- **admin**: add Health Check Dashboard (`00fdc20`)
- **auth**: add resend confirmation email on login page (`a34d0f3`)

### 🐛 Correzione Bug

- **landing**: align Microfelicità headline with video hook (`c67e95d`)

### 📚 Documentazione

- apply Principio Validante corrections to video scripts (`75425e3`)

---

## 📅 lunedì 12 gennaio 2026

### ✨ Nuova Funzionalità

- **challenge**: add VideoPlaceholder component for HeyGen videos (`4943719`)
- **admin**: add PAROLE and CONCRETEZZA to Quality Audit UI (`e530b52`)
- implement PAROLE and CONCRETEZZA checks (Comprensione principle) (`198d227`)
- **db**: add RLS policies for radar tables (`3d3d200`)
- implement graduality check for Comprensione principle (`7829eaf`)

### 🐛 Correzione Bug

- resolve hydration mismatch in VideoPlaceholder component (`09033e6`)
- **ux**: add 'Applica tutti' button for comprensione scores (`219ae17`)
- resolve ESLint useEffect dependency warnings (`ceedd84`)
- **P1**: secure CRON_SECRET - remove client-side exposure (`38bf2b6`)
- remove last P2/P4 confusion from results page (`e405810`)
- remove P2/P4 confusion from exercise completion (`1a1da8c`)
- complete customer journey - no dead ends (`3baf3c0`)

### ♻️ Refactoring

- remove AI Coach CTAs from STOP points (`c949b42`)

### 📚 Documentazione

- update APP_STRUCTURE with 3 Comprensione checks (`6ac87d3`)
- add Framework dei 4 Prodotti as Principle #0 (`b6d35ff`)
- add STOP→START UX principle to CLAUDE.md (`56e3092`)

---

## 📅 domenica 11 gennaio 2026

### ✨ Nuova Funzionalità

- add subscription success page with celebration UI (`7efb865`)
- add Fernando AI Coach CTA to assessment results page (`2acd5fc`)
- add subscription email templates and webhook integration (`5e1c003`)
- add MilestonesWidget to dashboard (`ded89bb`)
- complete Framework Evangelista database schema (`f9e26f9`)
- add milestone UI components and API (`7e6e754`)
- add complete milestone system for user progress tracking (`72f9a0b`)

### 📝 Altro

- Add radar update eligibility tracking on exercise completion (`d3aebf7`)
- Add automatic radar snapshot on assessment completion (`eca2791`)
- Fix pillar field: pillar -> pillar_primary (`5c3b3e6`)
- Fix book_id -> book_slug across codebase (`e3a9a38`)
- Add path-specific context to AI Coach system prompt (`471eecc`)
- Integrate action cycles in exercise completion (`7c0546b`)
- Integrate AchievementsList in path dashboards (`5818951`)
- AchievementCard component with celebration system (`b44e49d`)
- Action cycles START:CHANGE:STOP (`717515d`)
- Adaptive path module (`c5084da`)
- RadarComparison (`b0b3a46`)
- Radar API routes (`d7072e6`)
- DashboardByPath (`c4f2d94`)
- 3 Dashboard (`ac50880`)

---

## 📅 sabato 10 gennaio 2026

### ✨ Nuova Funzionalità

- Discovery Questions + Mini-Profilo System (`75e0046`)

### 🐛 Correzione Bug

- correct assessment links in challenge complete page (`75820aa`)
- correct challenge URL paths in email templates (`970f546`)

---

## 📅 venerdì 9 gennaio 2026

### ✨ Nuova Funzionalità

- add bump offer for libro pages - Libro gratuito + Leader subscription (`40db53e`)
- add book PDF upload script and configure storage URLs (`332f4c2`)
- add PDF export for assessment results (`33aef41`)
- add affiliate tracking to libro checkout (no commissions) (`3163dd7`)

### 🐛 Correzione Bug

- challenge duration 5 → 7 giorni (7 occorrenze) (`1d909c0`)

### 📚 Documentazione

- add TARGETING_PERSONAS.md with psychographic profiles (`382fc10`)
- comprehensive audit report with 4P/12F matrix and go-live checklist (`6e7e092`)

---

## 📅 giovedì 8 gennaio 2026

### ✨ Nuova Funzionalità

- Complete affiliate program with commission structure (`9341089`)

### 🐛 Correzione Bug

- remove 1px gap between hero and section (-mt-px) (`0a1d88b`)
- align affiliate page fonts and colors with homepage (`65b3a69`)
- align affiliate page with homepage header and fonts (`0a6f42b`)

### ♻️ Refactoring

- affiliate landing v3 - Il passaparola nasce dall'esperienza (`b0c26ca`)
- Evangelista landing - recognition over promotion (`9d84047`)
- Complete affiliate landing page redesign (`7d0b2c5`)

---

## 📅 mercoledì 7 gennaio 2026

### ✨ Nuova Funzionalità

- aggiunge Google Analytics 4 per tracking conversioni (`e28fdb8`)
- add admin funnel dashboard and exercise recommendations (`cedd9bc`)
- add descriptions to APP_STRUCTURE.md (`520f589`)
- add admin challenge email dashboard and testing tools (`116e8d6`)
- Complete RBAC system implementation (`a520861`)
- add behavioral and A/B testing links to admin sidebar (`1f80a41`)
- add behavioral analytics SQL queries and stats API endpoint (`59b86e8`)

### 🐛 Correzione Bug

- popola month_name per 48 esercizi risolutore/microfelicita (`40f8e37`)
- filtra esercizi per current_path utente (`1d7c459`)
- aggiunta mappatura pillar DB→API in recommended exercises (`a5dce28`)
- corretto rilevamento pagine protette in generate-app-structure.js (`e632c66`)
- use correct challenge slugs from database (`f7461c7`)
- TypeScript types for Supabase joins in recommended API (`3bf33b9`)
- UTF-8 encoding for APP_STRUCTURE.md (`af71b66`)
- add admin index page with redirect to challenges (`8ff7ec8`)
- Initialize existing subscribers for email tracking (`c0cefd8`)
- Email system - log welcome email and fix cron job (`898b2f9`)
- add metadataBase to resolve OG image URL warnings (`b7912de`)

### 📚 Documentazione

- add complete application structure documentation (`abbe4ac`)

---

## 📅 sabato 3 gennaio 2026

### ✨ Nuova Funzionalità

- add dynamic OG image generation for challenge pages (`6c02460`)
- add behavioral analytics admin dashboard (`39c28f3`)
- add behavioral tracking system for challenge landing pages (`50b1c84`)

### 🐛 Correzione Bug

- add unique Open Graph metadata for each challenge landing page (`96435d5`)

---

## 📅 lunedì 29 dicembre 2025

### ✨ Nuova Funzionalità

- Re-enable cron jobs with Vercel Pro (`51498fd`)

---

## 📅 domenica 28 dicembre 2025

### ✨ Nuova Funzionalità

- Complete Value Ladder implementation + Email Automation (`131220a`)

### 🐛 Correzione Bug

- Remove all cron jobs temporarily to fix Vercel limit (`7c5a14f`)
- Reduce cron jobs to 2 (Vercel free tier limit) (`55a037e`)
- Add force-dynamic to all assessment API routes (`4b9a750`)
- Force dynamic rendering for results pages (`9985cf1`)
- Add Suspense boundary to useSearchParams in results pages (`6106236`)
- Escape quotes and apostrophes in JSX for ESLint (`7393a60`)

### 🔨 Manutenzione

- trigger Vercel deployment (`381ee95`)
- force Vercel sync (`c74d993`)
- trigger redeploy (`42c3729`)
- Add challenge-emails cron job + update env.example (`ef10915`)

---

## 📅 martedì 23 dicembre 2025

### 🐛 Correzione Bug

- italiano corretto batch 4 - sezione 1.8 (`3999c0e`)

---


## 📊 Statistiche

- **Totale commit**: 100
- **Nuove funzionalità**: 36
- **Bug fix**: 33
- **Refactoring**: 4

---

*Generato automaticamente da `npm run changelog`*
