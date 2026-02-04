# STATO DI FATTO: Vitaeology Application - Per Definizione Strategia Funnel

**Data:** 4 Febbraio 2026
**Scopo:** Documento completo per sessione strategica su Claude.ai - trasformare l'applicazione esistente in una strategia di marketing orientata al funneling.

---

## 1. PANORAMICA PRODOTTO

**Vitaeology** è una piattaforma SaaS per lo sviluppo della leadership destinata a imprenditori italiani (35-55 anni), fondata da Fernando Marongiu (68 anni, 50+ anni di esperienza imprenditoriale).

### Stack: Next.js 14, Supabase, Stripe, Resend, Claude AI, OpenAI (RAG)

### I 3 Percorsi Tematici

| Percorso | Slug | Colore | Tema Centrale |
|----------|------|--------|---------------|
| Leadership Autentica | `leadership` | Oro #D4AF37 | Guidare - I 4 Pilastri (24 caratteristiche) |
| Oltre gli Ostacoli | `ostacoli` | Verde #10B981 | Risolvere - I 3 Filtri (Pattern, Segnali, Risorse) |
| Microfelicita | `microfelicita` | Viola #8B5CF6 | Notare - R.A.D.A.R. (5 fasi) |

---

## 2. MAPPA COMPLETA DEGLI ASSET ESISTENTI

### 2.1 Pagine Pubbliche (Top of Funnel)

| Pagina | URL | Funzione Attuale | Tipo Funnel |
|--------|-----|-------------------|-------------|
| Homepage | `/` | Hub con 3 card challenge | Pre-frame / Traffic Hub |
| Landing Leadership | `/challenge/leadership` | Epiphany Bridge + Form iscrizione | Squeeze Page |
| Landing Ostacoli | `/challenge/ostacoli` | Epiphany Bridge + Form iscrizione | Squeeze Page |
| Landing Microfelicita | `/challenge/microfelicita` | Epiphany Bridge + Form iscrizione | Squeeze Page |
| Landing Libro Leadership | `/libro/leadership` | Sales page libro PDF | Sales Page |
| Landing Libro Risolutore | `/libro/risolutore` | Sales page libro PDF | Sales Page |
| Landing Libro Microfelicita | `/libro/microfelicita` | Sales page libro PDF | Sales Page |
| Pricing | `/pricing` | 3 tier (Explorer/Leader/Mentor) | Pricing Page (disconnessa) |

### 2.2 Pagine Autenticate (Middle/Bottom of Funnel)

| Pagina | URL | Funzione Attuale |
|--------|-----|-------------------|
| Day Pages | `/challenge/[type]/day/[1-7]` | Contenuto giornaliero + Discovery A/B/C |
| Complete Page | `/challenge/[type]/complete` | Mini-Profilo risultati + feedback |
| Dashboard | `/dashboard` | Hub percorsi attivi (redirect per singolo percorso) |
| Assessment Leadership | `/assessment/leadership` | 72 domande, radar chart 24 caratteristiche |
| Assessment Risolutore | `/assessment/risolutore` | 48 domande, 3 filtri |
| Assessment Microfelicita | `/assessment/microfelicita` | 47 domande, R.A.D.A.R. |
| Esercizi | `/exercises` | Lista 52 esercizi settimanali |
| AI Coach | nella Dashboard | Chat con Fernando AI (Claude + RAG) |

### 2.3 Sistema Email (Resend)

| Email | Trigger | Contenuto |
|-------|---------|-----------|
| Welcome | Iscrizione challenge | Benvenuto + domanda riflessiva |
| Day 1-7 | Cron 8:00 UTC, DOPO completamento giorno precedente | Contenuto giornaliero + CTA alla day page |
| Reminder | 48h inattivita | Incoraggiamento a continuare |
| Force Advance | 72h inattivita | Sblocco forzato giorno successivo |
| Challenge Complete | Completamento Day 7 | Congratulazioni |
| Conversion | Post-challenge | CTA Assessment gratuito |
| Recovery | 3 giorni post-challenge | Reminder Assessment |

### 2.4 Sistema Pagamenti (Stripe)

| Prodotto | Prezzo | Tipo | Stripe ID |
|----------|--------|------|-----------|
| Libro PDF Leadership | €9.90 | One-time | configurato |
| Libro PDF Risolutore | €9.90 | One-time | configurato |
| Libro PDF Microfelicita | €9.90 | One-time | configurato |
| Piano Leader | €149/anno (sconto da €199) | Subscription | `price_1SfitcHtGer2Hvotf8O7NlBs` |
| Piano Mentor | €490/anno (sconto da €590) | Subscription | `price_1Sfiw6HtGer2HvotaaY1IV2I` |
| Explorer | €0 gratuito | Free | nessuno |

### 2.5 Asset AI/Tech

| Asset | Stato | Descrizione |
|-------|-------|-------------|
| AI Coach Fernando | Attivo | Claude API + RAG su 3 libri (pgvector) |
| Discovery Questions | Attivo | 63 domande A/B/C (7 giorni x 3 domande x 3 challenge) |
| Mini-Profilo | Attivo | Scoring automatico basato su risposte discovery |
| Assessment Engine | Attivo | 3 assessment (72+48+47 domande) con scoring e radar chart |
| 126 Esercizi | Attivo | 12 Fondamentali + 100 Applicazione + 14 Mentor |
| Behavioral Tracking | Attivo | Exit intent, engagement score, return visitor detection |
| A/B Testing | Attivo | Framework per varianti landing (epiphany bridge attiva) |
| UTM Tracking | Attivo | Source/Medium/Campaign tracciati su subscriber |

---

## 3. FLUSSI UTENTE ATTUALI (Customer Journey AS-IS)

### 3.1 Flusso Principale: Challenge Gratuita

```
TRAFFICO (social, ads, organico)
    |
    v
HOMEPAGE (vitaeology.com)
    |  3 card: "Qual e la tua sfida oggi?"
    |  CTA: "Inizia i 7 Giorni" per ciascun percorso
    v
LANDING PAGE (/challenge/[type])
    |  Epiphany Bridge (storia Fernando)
    |  Form: Nome + Email + Turnstile captcha
    |  Behavioral: exit intent popup, engagement badge, return visitor banner
    |  Tracking: UTM, A/B variant, gtag events
    v
POST /api/challenge/subscribe
    |  Crea record challenge_subscribers (current_day: 0)
    |  Invia welcome email (Resend)
    |  Traccia ab_test_events
    v
SUCCESS STATE (nella stessa landing page)
    |  "Controlla la tua email"
    |  CTA: Link a /test (PROBLEMATICO - vedi sotto)
    v
EMAIL CRON (8:00 UTC giornaliero)
    |  Invia email Day N+1 SOLO SE l'utente ha completato Day N
    |  (User Agency: l'utente controlla la progressione)
    v
DAY PAGES (/challenge/[type]/day/[1-7])
    |  Auth required + subscription required
    |  Contenuto: video, principio, esercizio
    |  Discovery A/B/C: 3 domande strutturate per giorno
    |  Salvataggio risposte in challenge_discovery_responses (client Supabase)
    |  POST /api/challenge/complete-day
    |  Success: link al giorno successivo
    v
COMPLETE PAGE (/challenge/[type]/complete) [SOLO dopo Day 7]
    |  Mini-Profilo con barre dimensioni e % per dimensione
    |  Feedback form: "Cosa vorresti fare adesso?"
    |     - Assessment (link)
    |     - Esercizi (link)
    |     - Libro (link)
    |     - Ho bisogno di tempo (Dashboard)
    |  Sezione "Continua il Tuo Percorso": Assessment + Esercizi
    |  Sezione "Esplora le Altre Sfide"
    v
??? (FINE DEL FUNNEL ATTUALE - nessuna conversione strutturata)
```

### 3.2 Flusso Libro (Disconnesso)

```
/libro/[slug]
    |  Sales page con hero, pain points, benefici, capitoli, autore, CTA
    |  AcquistaButton -> Stripe Checkout (€9.90)
    |  BumpOffer (exit intent)
    v
/libro/[slug]/grazie
    |  Thank you page
    v
??? (nessun follow-up, nessun collegamento a challenge o assessment)
```

### 3.3 Flusso Pricing (Disconnesso)

```
/pricing
    |  3 tier: Explorer (gratis), Leader (€149), Mentor (€490)
    |  CTA -> /auth/signup o /auth/signup?plan=slug
    v
Signup -> Dashboard
    |  Dashboard mostra percorsi attivi
    v
Assessment, Esercizi, AI Coach
```

---

## 4. VALUE LADDER ATTUALE

```
LIVELLO 0: Challenge Gratuita (€0)
  - 7 giorni email + contenuto web
  - Discovery A/B/C (21 risposte)
  - Mini-Profilo (risultato)
  - COSTO ACQUISIZIONE: solo email

LIVELLO 1: Libro PDF (€9.90)
  - Leadership / Risolutore / Microfelicita
  - Pagamento Stripe one-time
  - Download immediato
  - NESSUN collegamento alla challenge

LIVELLO 2: Explorer (€0)
  - Assessment completo (72/48/47 domande)
  - Radar Chart interattivo
  - 5 messaggi AI Coach/giorno
  - 10 esercizi introduttivi

LIVELLO 3: Leader (€149/anno)
  - 1 percorso a scelta
  - AI Coach illimitato
  - 52 esercizi settimanali
  - Tracciamento progressi

LIVELLO 4: Mentor (€490/anno)
  - Tutti e 3 i percorsi
  - AI Coach cross-pollination
  - Q&A live con Fernando
  - Certificazione

FASE 2 (NON ATTIVA):
  - Mastermind (€2.997/anno)
  - Coaching Starter (€997 una tantum)
  - Coaching Intensive (€1.997 una tantum)
  - Partner Elite (€9.997/anno)
```

---

## 5. GAP E DISCONNESSIONI CRITICHE

### 5.1 Rotture nel Funnel (Pipeline Leaks)

| # | Gap | Dove | Impatto |
|---|-----|------|---------|
| **G1** | **Nessun bridge Challenge -> Libro** | Complete page | L'utente completa la challenge gratuita e non riceve nessuna offerta strutturata per il libro. Il Mini-Profilo mostra risultati ma senza "gap" che motivi l'acquisto. |
| **G2** | **Success state landing -> link morto** | Landing ostacoli e leadership | Dopo iscrizione, il link punta a `/test` (che non esiste come pagina pubblica accessibile). Solo microfelicita punta a `/assessment/microfelicita`. |
| **G3** | **Libro venduto senza contesto** | `/libro/[slug]` | Le landing libro non menzionano la challenge ne l'assessment. Sono pagine isolate. Un utente che ha fatto la challenge non viene indirizzato qui. |
| **G4** | **Pricing page disconnessa dal funnel** | `/pricing` | Nessun link dalla challenge, dal complete, o dalle email porta alla pricing page. Le CTA puntano a `/auth/signup` generico. |
| **G5** | **Nessuna OTO (One-Time Offer)** | Post-iscrizione challenge | Dopo l'iscrizione alla challenge non c'e nessuna thank you page con offerta. Lo stato success e un semplice messaggio nella stessa pagina. |
| **G6** | **Email post-challenge deboli** | Conversion + Recovery email | Le email di conversione post-challenge suggeriscono l'assessment gratuito, non il libro. Nessuna sequenza di vendita. |
| **G7** | **Complete page: troppe CTA** | `/challenge/[type]/complete` | Viola il principio STOP->START: offre Assessment, Esercizi, Libro, Dashboard, Feedback, Altre Sfide. L'utente non sa cosa scegliere. |
| **G8** | **Mini-Profilo non crea gap** | Complete page | Mostra risultati validanti ma non collega al "cosa manca". Non dice "il libro approfondisce questa dimensione" o "l'assessment completo analizza 24 caratteristiche vs le 4 del mini-profilo". |
| **G9** | **Nessun retargeting/pixel** | Tutte le pagine | Google Analytics (GA4) e Microsoft Clarity sono attivi ma non c'e Facebook Pixel, LinkedIn Insight Tag, o custom audiences. |
| **G10** | **Nessuna survey page** | Pre-challenge | Non c'e una survey page che segmenti l'utente prima della challenge (micro-commitment + personalizzazione). |

### 5.2 Opportunita Mancate

| # | Opportunita | Tipo Funnel |
|---|------------|-------------|
| **O1** | Thank You Page dopo iscrizione challenge con OTO libro a prezzo scontato | OTO / Bridge Page |
| **O2** | Bridge Page tra Mini-Profilo e Assessment completo che mostri il GAP (4 dimensioni vs 24) | Bridge Page |
| **O3** | Email sequence di vendita post-challenge (5-7 email) con storytelling e CTA libro | Follow-up Funnel |
| **O4** | Bump offer del libro durante il checkout dell'abbonamento | Order Bump |
| **O5** | Exit intent sulle day pages con "Vuoi il libro per approfondire?" | Micro-conversion |
| **O6** | Webinar/video di vendita dopo challenge come evento | Webinar Funnel |
| **O7** | Coupon temporizzato post-challenge ("48h per acquistare il libro a €7.90") | Urgency/Scarcity |
| **O8** | Affiliate program per beta tester (gia parzialmente implementato) | Referral Funnel |

---

## 6. MAPPATURA ASSET -> ELEMENTI FUNNEL

Basato sui principi del documento "Marketing Funnel Specifiche":

### 6.1 Elementi gia presenti

| Elemento Funnel | Asset Esistente | Stato |
|----------------|-----------------|-------|
| **Squeeze Page** | 3 landing challenge | Ottime (Epiphany Bridge, behavioral tracking) |
| **Lead Magnet** | Challenge 7 giorni gratuita | Completo e funzionante |
| **Email Follow-up** | 7 email giornaliere + reminder + recovery | Funzionanti, ma solo contenuto, no vendita |
| **Survey/Quiz** | Discovery A/B/C (3 domande/giorno) | Funzionante, genera Mini-Profilo |
| **Results Page** | Complete page con MiniProfileChart | Funzionante ma non ottimizzata per conversione |
| **Sales Page** | 3 landing libro | Esistenti ma disconnesse |
| **Checkout** | Stripe per libri e abbonamenti | Funzionante |
| **Member Area** | Dashboard + Assessment + Esercizi | Funzionante |

### 6.2 Elementi MANCANTI

| Elemento Funnel | Descrizione | Priorita |
|----------------|-------------|----------|
| **Thank You / OTO Page** | Pagina post-iscrizione challenge con offerta | ALTA |
| **Bridge Page** | Collegamento Mini-Profilo -> Assessment/Libro | ALTA |
| **Sales Email Sequence** | 5-7 email post-challenge orientate alla vendita | ALTA |
| **Order Bump** | Aggiunta libro durante checkout abbonamento | MEDIA |
| **Upsell Page** | Post-acquisto libro -> abbonamento | MEDIA |
| **Downsell Page** | Se rifiuta abbonamento -> libro singolo | MEDIA |
| **Webinar/VSL** | Video di vendita lungo post-challenge | BASSA (Fase 2) |
| **Application Page** | Per Mastermind/Coaching (Fase 2) | BASSA |

---

## 7. DATI QUANTITATIVI ATTUALI

### 7.1 Struttura Contenuti per Challenge

| Challenge | Giorni | Domande Discovery | Dimensioni Mini-Profilo | Domande Assessment Completo |
|-----------|--------|-------------------|------------------------|-----------------------------|
| Leadership | 7 | 21 (7x3) | 4 (Visione, Azione, Relazioni, Adattamento) | 72 (24 caratteristiche) |
| Ostacoli | 7 | 21 (7x3) | 3 (Pattern, Segnali, Risorse) | 48 (3 filtri) |
| Microfelicita | 7 | 21 (7x3) | 5 (R.A.D.A.R.) | 47 (5 fasi) |

### 7.2 Gap Mini-Profilo vs Assessment

Questo e il "gap naturale" su cui costruire la bridge page:

| Percorso | Mini-Profilo | Assessment Completo | Gap |
|----------|-------------|---------------------|-----|
| Leadership | 4 dimensioni, 21 risposte | 24 caratteristiche, 72 domande | 20 caratteristiche non esplorate |
| Ostacoli | 3 dimensioni, 21 risposte | 3 filtri approfonditi, 48 domande | 27 domande di approfondimento per filtro |
| Microfelicita | 5 dimensioni, 21 risposte | 5 fasi R.A.D.A.R., 47 domande | 26 domande di approfondimento per fase |

### 7.3 Pricing Points

```
€0.00  - Challenge (lead magnet)
€9.90  - Libro PDF (break-even funnel)
€0.00  - Explorer (assessment gratuito, 5 msg AI/giorno)
€149   - Leader (1 percorso, AI illimitato)
€490   - Mentor (3 percorsi, live Q&A)
```

---

## 8. PRINCIPI FONDAMENTALI DA RISPETTARE

### 8.1 Principio Validante (AVERE vs ESSERE)

Ogni comunicazione deve usare il linguaggio dell'AVERE (liberta):
- "Hai gia questa capacita" (non "Sei/Non sei")
- "Puoi scegliere di approfondire" (non "Ti manca")
- Il Mini-Profilo mostra cosa l'utente HA, non cosa gli manca

### 8.2 Principio STOP -> START

Ogni punto di completamento (STOP) deve avere UNA sola CTA chiara:
- Complete challenge -> UNA CTA (non 6 opzioni come ora)
- Acquisto libro -> UNA CTA (non "grazie e basta")
- Fine assessment -> UNA CTA verso esercizi

### 8.3 User Agency

L'utente controlla il ritmo:
- Le email arrivano SOLO dopo completamento del giorno precedente
- Nessuna forzatura o manipolazione aggressiva
- Urgenza naturale, non artificiale

### 8.4 Framework 4 Prodotti

- P1 (Sistema/Piattaforma) - Le pagine, i funnel, l'infrastruttura
- P2 (Output/Trasformazione) - Quello che l'utente riceve ai punti STOP
- P3 (Manutenzione) - Bug fix, ottimizzazioni
- P4 (Correzione) - AI Coach Fernando (disponibile on-demand, NON ai punti STOP)

---

## 9. INFRASTRUTTURA TECNICA DISPONIBILE

### 9.1 Cosa possiamo fare SUBITO (senza nuove integrazioni)

- Creare nuove pagine Next.js (thank you, bridge, upsell)
- Aggiungere email sequences con Resend (gia integrato)
- Creare nuovi checkout Stripe (gia integrato)
- Implementare logica di coupon/sconto temporizzato (Stripe supporta)
- Tracciare eventi custom su GA4 (gia configurato)
- Session recording con Microsoft Clarity (gia attivo)
- A/B testing sulle landing (framework gia presente)

### 9.2 Cosa richiederebbe nuove integrazioni

- Facebook Pixel / Meta Ads tracking
- LinkedIn Insight Tag
- SMS marketing (es. Twilio)
- Webinar platform (es. Zoom/StreamYard)
- Advanced analytics (es. Mixpanel/Amplitude)

### 9.3 Database gia pronto per

- `ab_test_events`: tracking A/B con variant, event_type, metadata
- `challenge_subscribers`: UTM tracking, variant, status lifecycle
- `challenge_discovery_responses`: scoring per dimensione
- `challenge_day_completions`: timestamp di ogni completamento
- `profiles`: subscription_tier, stripe_customer_id, current_path

---

## 10. FLUSSO FUNNEL IDEALE (Proposta di Partenza)

Basato sui principi del documento "Marketing Funnel Specifiche" e sugli asset esistenti:

```
FASE 1: ACQUISIZIONE (Break-Even Funnel)
=========================================

Traffico (Ads, Social, SEO)
    |
    v
Homepage (Traffic Hub)
    |  "Qual e la tua sfida oggi?" -> 3 percorsi
    v
Landing Challenge (Squeeze Page) [GIA ESISTENTE]
    |  Epiphany Bridge + Form
    |  Exit Intent Popup [GIA ESISTENTE]
    v
[NUOVO] Thank You Page / OTO
    |  "Iscrizione confermata! Mentre aspetti il Day 1..."
    |  OTO: Libro PDF a prezzo scontato (es. €7.90 invece di €9.90)
    |  Timer 15 minuti
    |  Se rifiuta: "Nessun problema, ci vediamo domani via email"
    v
Challenge 7 Giorni (Email + Day Pages) [GIA ESISTENTE]
    |  Discovery A/B/C [GIA ESISTENTE]
    v
[NUOVO] Bridge Page (Complete Page Ottimizzata)
    |  Mini-Profilo mostra 4 dimensioni
    |  "Hai esplorato 4 dimensioni. Ce ne sono 24 in totale."
    |  "Il libro contiene il framework completo + l'accesso all'Assessment"
    |  UNA SOLA CTA: "Scopri tutte le 24 caratteristiche" -> Libro
    v
[NUOVO] Sales Email Sequence (5-7 email, 1/giorno)
    |  Email 1: Risultati Mini-Profilo personalizzati
    |  Email 2: Storia Fernando correlata alla dimensione forte
    |  Email 3: Cosa contiene il libro (capitoli rilevanti per quel profilo)
    |  Email 4: Scarcity/Social proof
    |  Email 5: Ultima chance + downsell
    v
Acquisto Libro (€9.90) [GIA ESISTENTE]
    |
    v
[NUOVO] Thank You + Upsell
    |  "Il libro e tuo! Vuoi il percorso completo?"
    |  Upsell: Piano Leader (€149/anno) con 30 giorni trial
    |  Se rifiuta: "Inizia con l'Assessment gratuito incluso nel libro"


FASE 2: MONETIZZAZIONE (Profit Funnel)
=========================================

Explorer Gratuito (Assessment + AI Coach limitato)
    |
    v
Upgrade a Leader (€149/anno)
    |  1 percorso, AI illimitato, 52 esercizi
    v
Upgrade a Mentor (€490/anno)
    |  3 percorsi, Q&A live
    v
[FUTURO] Mastermind (€2.997/anno)
[FUTURO] Coaching 1:1 (€997-€1.997)
```

---

## 11. METRICHE DA TRACCIARE

| Metrica | Punto | Attuale | Tool |
|---------|-------|---------|------|
| Visitatori Homepage | Top | Non tracciato specificamente | GA4 |
| Click su card challenge | Top | gtag event (presente) | GA4 |
| Visite landing challenge | Middle | ab_test_events (presente) | Supabase + GA4 |
| Conversion rate iscrizione | Middle | Calcolabile da ab_test_events | Supabase |
| Open rate email | Middle | Non tracciato | Resend analytics |
| Day completion rate (per giorno) | Middle | challenge_day_completions | Supabase |
| Drop-off per giorno | Middle | Calcolabile | Supabase |
| Challenge completion rate | Bottom | ab_test_events (event: completed) | Supabase |
| Click CTA post-challenge | Bottom | Non tracciato | Da implementare |
| Acquisto libro | Bottom | Stripe webhook | Stripe |
| Upgrade a Leader/Mentor | Bottom | Stripe webhook | Stripe |

---

## 12. RIEPILOGO PER LA STRATEGIA

### Cosa c'e gia e funziona bene:
1. 3 landing challenge con Epiphany Bridge e behavioral tracking
2. Sistema email completo (7 giorni + reminder + recovery)
3. Discovery A/B/C che genera Mini-Profilo automatico
4. 3 Assessment completi con radar chart
5. 126 esercizi strutturati
6. AI Coach Fernando con RAG su 3 libri
7. Stripe payments configurato (libri + abbonamenti)
8. A/B testing framework attivo

### Cosa manca per avere un funnel completo:
1. **Thank You / OTO page** dopo iscrizione challenge
2. **Bridge page** ottimizzata che collega Mini-Profilo -> Libro/Assessment
3. **Sales email sequence** post-challenge (attualmente solo "fai l'assessment")
4. **Upsell/Downsell** dopo acquisto libro
5. **Una sola CTA** per ogni punto STOP (attualmente troppi link)
6. **Collegamento libro <-> challenge** (oggi sono mondi separati)
7. **Metriche di conversione** per ogni step del funnel

### La domanda strategica principale:
**Come trasformare i 3 funnel paralleli (challenge gratuita x3) in un sistema di funnel stacking dove la challenge e il break-even funnel, il libro e il front-end profit, e l'abbonamento e il backend?**
