# PROMPT CLAUDE CODE - TEST CUSTOMER JOURNEY
## Verifica Cicli START→CHANGE→STOP
### Vitaeology - 11 Gennaio 2026

---

## 📋 ISTRUZIONI

Esegui questi prompt in ordine su Claude Code.
Ogni prompt testa UN ciclo completo START→CHANGE→STOP.
Se un test fallisce, il prompt genera il fix.

---

## PRE-TEST: VERIFICA AMBIENTE

### Prompt 0.1 - Setup Test Environment

```
Prepara l'ambiente di test per il Customer Journey Vitaeology.

1. Verifica che il progetto sia nella directory corretta (vitaeology o vitaeology-app)

2. Verifica che questi file esistano:
   - package.json
   - src/app/page.tsx
   - src/app/challenge/[slug]/page.tsx
   - src/app/api/challenge/subscribe/route.ts
   - .env.local (con SUPABASE_URL, SUPABASE_ANON_KEY, RESEND_API_KEY)

3. Verifica connessione Supabase:
   - Esegui: npx supabase status
   - Oppure verifica che le variabili env siano settate

4. Verifica che il dev server parta:
   - npm run dev
   - Controlla che localhost:3000 risponda

5. Crea un utente test su Supabase se non esiste:
   - Email: test-journey@vitaeology.com
   - Password: TestJourney2026!

Mostra lo stato di ogni verifica con ✅ o ❌
```

---

## CICLO 1: ADS → LANDING → ISCRIZIONE

### Prompt 1.1 - Test Landing Pages Esistono

```
Testa che le 3 landing page delle Challenge esistano e siano raggiungibili.

Verifica questi file:
1. src/app/challenge/leadership/page.tsx (o src/app/challenge/[slug]/page.tsx con slug 'leadership')
2. Equivalente per 'ostacoli'
3. Equivalente per 'microfelicita'

Per ogni landing verifica:
- Il file esiste
- Esporta un componente React valido
- Contiene un form di iscrizione (cerca <form o <input type="email")
- Ha una CTA visibile (cerca button o Button)

Se manca qualcosa, crealo seguendo questo template:
- Titolo challenge
- 3 benefici bullet point
- Form email con bottone "Inizia la Challenge Gratuita"
- Footer con privacy policy link

Output: Lista delle 3 landing con status ✅/❌ e eventuali fix applicati.
```

---

### Prompt 1.2 - Test API Iscrizione Challenge

```
Testa l'API di iscrizione alla Challenge.

File da verificare: src/app/api/challenge/subscribe/route.ts

Test da eseguire:

1. Verifica che l'endpoint esista e gestisca POST

2. Verifica la logica:
   - Riceve { email, challengeSlug }
   - Valida email format
   - Salva in tabella challenge_subscribers
   - Invia email di benvenuto via Resend
   - Ritorna { success: true, subscriberId }

3. Verifica gestione errori:
   - Email già iscritta → messaggio appropriato (non errore)
   - Email invalida → errore 400
   - challengeSlug invalido → errore 400

4. Simula una chiamata test:
```typescript
// Test call
const response = await fetch('/api/challenge/subscribe', {
  method: 'POST',
  body: JSON.stringify({
    email: 'test-' + Date.now() + '@test.com',
    challengeSlug: 'leadership'
  })
});
```

Se l'API ha problemi, correggila.
Mostra il risultato del test con ✅/❌.
```

---

### Prompt 1.3 - Test Email Benvenuto (STOP del Ciclo 1)

```
Verifica che l'email di benvenuto venga inviata correttamente dopo l'iscrizione.

File da verificare:
- src/lib/email/challenge-emails.ts (o equivalente)
- Template email Day 0 / Welcome

Verifica:
1. Esiste una funzione sendWelcomeEmail o sendDay0Email
2. Usa Resend API correttamente
3. Il template contiene:
   - Oggetto: Conferma iscrizione / Benvenuto
   - Corpo: Conferma + Cosa aspettarsi + Quando arriva Day 1
   - CTA: Link alla dashboard o "Rispondi a questa email"
   - È presente il PROSSIMO PASSO (teaser Day 1)

4. Verifica che il template NON sia un vicolo cieco:
   - Deve avere almeno UN link cliccabile
   - Deve menzionare cosa succede domani

Se manca il teaser del prossimo passo, aggiungilo:
"Domani riceverai il primo giorno della Challenge: [TITOLO DAY 1]. Preparati a scoprire..."

Output: ✅/❌ con dettagli su cosa è stato verificato/corretto.
```

---

## CICLO 2: CHALLENGE DAY 1-6

### Prompt 2.1 - Test Contenuti 7 Giorni Esistono

```
Verifica che esistano i contenuti per tutti i 7 giorni della Challenge Leadership.

File da verificare: src/lib/challenge/day-content.ts (o equivalente)

Per ogni giorno (1-7) verifica che esista:
- title: string
- content: string (almeno 200 caratteri)
- discoveryQuestions: array di 3 domande
- teaser: string (anticipazione giorno successivo, tranne Day 7)

Struttura attesa:
```typescript
{
  day: 1,
  title: "...",
  content: "...",
  discoveryQuestions: [
    { id: "d1q1", question: "...", type: "text" },
    { id: "d1q2", question: "...", type: "scale" },
    { id: "d1q3", question: "...", type: "text" }
  ],
  teaser: "Domani scoprirai..." // Solo Day 1-6
}
```

Se mancano giorni o contenuti, elenca cosa manca.
Non inventare contenuti - segnala solo i gap.

Output: Tabella 7 giorni con ✅/❌ per ogni elemento.
```

---

### Prompt 2.2 - Test Email Giornaliere (Cron)

```
Verifica il sistema di invio email giornaliere della Challenge.

File da verificare:
- src/app/api/cron/challenge-emails/route.ts
- Configurazione cron (vercel.json o simile)

Verifica:
1. L'endpoint cron esiste e gestisce GET o POST
2. La logica:
   - Recupera iscritti con status 'active'
   - Calcola il giorno corrente per ogni iscritto (based on subscribed_at)
   - Invia email del giorno appropriato
   - Aggiorna last_email_sent o campo equivalente

3. Verifica che ogni email del giorno contenga:
   - Contenuto del giorno
   - Link alle 3 domande Discovery
   - Teaser del giorno successivo (STOP → prossimo START)

4. Verifica configurazione cron:
   - Schedulato per le 8:00 mattina (ora italiana)
   - Timezone corretta

Se manca qualcosa, implementalo o segnala cosa manca.

Output: ✅/❌ per ogni verifica.
```

---

### Prompt 2.3 - Test Salvataggio Risposte Discovery

```
Verifica che le risposte Discovery vengano salvate correttamente.

File da verificare:
- src/app/api/challenge/discovery/route.ts (o equivalente)
- Pagina con form domande

Verifica:
1. Esiste endpoint POST per salvare risposte
2. Salva in tabella challenge_discovery_responses:
   - subscriber_id o user_id
   - day_number
   - question_id
   - answer_text
   - created_at

3. Dopo salvataggio, la UI mostra:
   - Conferma "Risposte salvate"
   - Progress (es. "Giorno 3 di 7 completato")
   - Teaser giorno successivo
   - CTA chiaro per tornare domani

4. Verifica che NON ci sia vicolo cieco:
   - Dopo submit → feedback visivo
   - Link o messaggio su cosa fare dopo

Se manca il feedback post-submit, aggiungilo.

Output: ✅/❌ con dettagli.
```

---

## CICLO 3: CHALLENGE COMPLETE (Day 7)

### Prompt 3.1 - Test Pagina Completamento Challenge

```
Verifica la pagina di completamento Challenge (Day 7 o /challenge/complete).

File da verificare:
- src/app/challenge/complete/page.tsx
- Oppure logica in src/app/challenge/[slug]/day/[day]/page.tsx per day=7

Verifica che la pagina contenga:

1. RISULTATO - Mini-Profilo:
   - Componente che mostra radar/chart basato sulle 21 risposte
   - Per Leadership: 4 Pilastri (Visione, Azione, Relazioni, Adattamento)
   - Testo: "Ecco cosa emerge dalle tue riflessioni"

2. RICHIAMO - Recap settimana:
   - "Questa settimana hai scoperto..."
   - Highlights dei 7 giorni

3. PASSO - CTA chiare (STOP → prossimo START):
   - "Fai l'Assessment Completo" → link a /assessment/leadership
   - "Acquista il Libro" → link a pagina libro
   - "Parla con Fernando" → link a AI Coach

Se manca qualcuno di questi elementi, segnala cosa manca.
Il componente Mini-Profilo potrebbe essere MiniProfileChart.tsx.

Output: ✅/❌ per RISULTATO, RICHIAMO, PASSO.
```

---

### Prompt 3.2 - Test Email Day 7 (Completamento)

```
Verifica l'email del Day 7 che celebra il completamento.

File: Template email Day 7 in src/lib/email/challenge-emails.ts

L'email deve contenere:

1. CELEBRAZIONE:
   - Congratulazioni per aver completato la Challenge
   - Riconoscimento dell'impegno (7 giorni!)

2. MINI-PROFILO:
   - Riepilogo visivo o testuale dei risultati
   - Link a pagina /challenge/complete per vedere il radar

3. PROSSIMI PASSI (STOP → START):
   - CTA 1: "Scopri il tuo profilo completo" → Assessment
   - CTA 2: "Approfondisci con il libro" → Libro
   - CTA 3: "Inizia il percorso Leader" → Pricing/Upgrade

Verifica che NON finisca con "Grazie e arrivederci" senza CTA.
Deve sempre proporre il prossimo passo.

Output: ✅/❌ con contenuto verificato.
```

---

## CICLO 4: ASSESSMENT

### Prompt 4.1 - Test Flusso Assessment Start

```
Verifica l'inizio del flusso Assessment.

File da verificare:
- src/app/assessment/leadership/page.tsx (o /assessment/page.tsx)

Verifica:
1. Pagina accessibile senza login (Explorer gratuito)
2. Intro chiara:
   - Cosa è l'assessment
   - Quanto tempo richiede (~15-20 min per 72 domande)
   - Cosa otterrai (radar 24 caratteristiche)
3. CTA "Inizia Assessment" ben visibile
4. Se richiede login, il flusso auth funziona
5. Progress bar o indicatore domande visibile

Se manca l'intro o la CTA, aggiungila.

Output: ✅/❌ per ogni elemento.
```

---

### Prompt 4.2 - Test Domande Assessment

```
Verifica che le 72 domande dell'Assessment Leadership siano presenti e funzionanti.

File da verificare:
- src/lib/assessment/questions.ts (o database)
- Tabella Supabase: assessment_questions

Verifica:
1. Esistono 72 domande per assessment_type='leadership'
2. Ogni domanda ha:
   - id univoco
   - question_text
   - characteristic_id (collegamento a quale delle 24 caratteristiche)
   - question_type (scale/text)

3. Componente QuestionCard:
   - Mostra domanda
   - Input risposta (slider 1-10 o scala Likert)
   - Bottone Avanti/Prossima
   - Progress bar aggiornata

4. Salvataggio risposta:
   - Ogni risposta salvata in user_answers
   - Non si perdono risposte se refresh pagina (localStorage o DB)

5. Navigazione:
   - Può tornare indietro
   - Non può saltare domande (o può?)

Output: Numero domande trovate + ✅/❌ per logica.
```

---

### Prompt 4.3 - Test Risultati Assessment (STOP Ciclo 4)

```
Verifica la pagina risultati Assessment - questo è il STOP del ciclo 4.

File: src/app/assessment/leadership/results/page.tsx

CRITICO - Verifica che contenga:

1. RADAR CHART 24 CARATTERISTICHE:
   - Componente LeadershipRadarChart o equivalente
   - Dati reali dell'utente (non placeholder)
   - Tutte 24 caratteristiche visibili

2. INTERPRETAZIONE:
   - Top 5 punti di forza (punteggi più alti)
   - Top 5 aree di crescita (punteggi più bassi)
   - Linguaggio positivo (Principio Validante)

3. PROSSIMI PASSI (STOP → START) - FONDAMENTALE:
   - CTA "Inizia con l'esercizio consigliato" → link a esercizio specifico
   - CTA "Parla con Fernando" → apre AI Coach
   - CTA "Esplora tutti gli esercizi" → /exercises
   - Per Explorer: "Sblocca il percorso completo" → /pricing

4. Salvataggio Snapshot:
   - I risultati vengono salvati in user_radar_snapshots
   - O almeno in user_assessments + characteristic_scores

VERIFICA CHE NON CI SIA VICOLO CIECO:
- Nessun "Grazie!" senza CTA
- Almeno 2 azioni proposte

Se manca qualcosa, segnala cosa e dove andrebbe aggiunto.

Output: ✅/❌ per ogni sezione critica.
```

---

## CICLO 5: ESERCIZI

### Prompt 5.1 - Test Lista Esercizi

```
Verifica la pagina lista esercizi.

File: src/app/exercises/page.tsx

Verifica:
1. Mostra lista esercizi dal database
2. Filtri funzionanti (per caratteristica, difficoltà, stato)
3. Card esercizio mostra:
   - Titolo
   - Caratteristica collegata
   - Tempo stimato
   - Stato (completato/da fare/locked)
4. Esercizi locked mostrano:
   - Lucchetto visivo
   - Messaggio "Disponibile con piano Leader"
   - CTA upgrade

5. Click su esercizio → va a pagina dettaglio

Output: ✅/❌ + numero esercizi trovati.
```

---

### Prompt 5.2 - Test Dettaglio Esercizio

```
Verifica la pagina dettaglio esercizio.

File: src/app/exercises/[id]/page.tsx

Verifica struttura:
1. HEADER:
   - Titolo esercizio
   - Caratteristica di riferimento
   - Tempo stimato
   - Breadcrumb navigazione

2. CONTENUTO:
   - Descrizione/introduzione
   - Step o istruzioni
   - Domande di riflessione (3)

3. AZIONE:
   - Form per note/riflessioni utente
   - Bottone "Segna come Completato"
   - Salvataggio in user_exercise_progress

4. POST-COMPLETAMENTO (STOP):
   - Verifica che ExerciseCompletionCard venga mostrato
   - Contiene: celebrazione, stats, prossimo esercizio, CTA AI Coach

Output: ✅/❌ per ogni sezione.
```

---

### Prompt 5.3 - Test Completamento Esercizio (STOP Ciclo 5)

```
Verifica il flusso post-completamento esercizio.

File: src/components/exercises/ExerciseCompletionCard.tsx

CRITICO - Deve contenere:

1. CELEBRAZIONE:
   - Messaggio positivo ("Ottimo lavoro!")
   - Animazione o visual celebrativo

2. STATS:
   - Esercizi completati totali
   - Progress verso obiettivo
   - Tempo investito (opzionale)

3. PROSSIMO PASSO (STOP → START):
   - "Prossimo esercizio consigliato: [TITOLO]" con link
   - "Parla con Fernando del tuo progresso" → apre chat
   - "Torna alla lista" → /exercises

4. NON DEVE ESSERE VICOLO CIECO:
   - Sempre almeno 2 CTA
   - Mai solo "Completato!" senza azioni

Verifica che il componente venga effettivamente renderizzato dopo il click su "Segna Completato".

Output: ✅/❌ + screenshot mentale del flusso.
```

---

## CICLO 6: AI COACH

### Prompt 6.1 - Test Apertura Chat AI

```
Verifica l'apertura della chat con Fernando AI Coach.

File: src/components/ai-coach/ChatWidget.tsx

Verifica:
1. Widget accessibile da:
   - Icona floating in basso a destra
   - Link diretti da altre pagine
   - Query param ?openChat=true

2. Apertura:
   - Animazione smooth
   - Messaggio di benvenuto Fernando
   - Input messaggio funzionante

3. Autenticazione:
   - Se utente non loggato → prompt login o messaggio
   - Se loggato → carica context utente

4. Limite messaggi (Explorer):
   - Traccia messaggi giornalieri
   - Mostra warning quando vicino al limite
   - Mostra upgrade CTA quando raggiunto

Output: ✅/❌ per ogni verifica.
```

---

### Prompt 6.2 - Test Conversazione AI

```
Verifica che la conversazione con AI Coach funzioni.

File: src/app/api/ai-coach/route.ts

Test da eseguire:
1. Invia messaggio semplice: "Ciao Fernando"
   - Risposta arriva in < 5 secondi
   - Risposta è in italiano
   - Risposta è nel tono di Fernando (caldo, incoraggiante)

2. Verifica context:
   - AI conosce nome utente (se disponibile)
   - AI sa quali esercizi ha completato
   - AI sa i risultati assessment

3. Verifica RAG:
   - Domanda su caratteristica specifica
   - Risposta cita o riferisce contenuti del libro

4. Messaggi salvati:
   - In ai_coach_conversations
   - Con user_id, session_id, role, content

Output: ✅/❌ per ogni test.
```

---

### Prompt 6.3 - Test Wrap-up Chat (STOP Ciclo 6)

```
Verifica il wrap-up quando l'utente termina la chat.

File: 
- src/lib/ai-coach/system-prompt.ts (sezione WRAP-UP)
- src/app/api/ai-coach/route.ts (isClosingMessage detection)

Simula fine conversazione con messaggi tipo:
- "Grazie Fernando"
- "Ciao, a presto"
- "Devo andare"

VERIFICA che la risposta contenga:

1. RIEPILOGO:
   - "In questa conversazione abbiamo parlato di..."
   - Punti chiave discussi

2. AZIONE CONCRETA:
   - "Nelle prossime 24-48 ore potresti..."
   - Azione specifica e fattibile

3. ESERCIZIO SUGGERITO:
   - "Ti consiglio l'esercizio [NOME]..."
   - Link all'esercizio se possibile

4. CHIUSURA CALDA:
   - Non fredda o robotica
   - Invito a tornare

Se il wrap-up non viene generato, verifica:
- CLOSING_PATTERNS in system-prompt.ts
- isClosingMessage() in route.ts

Output: ✅/❌ + esempio risposta wrap-up.
```

---

## CICLO 7: UPGRADE

### Prompt 7.1 - Test Trigger Upgrade

```
Verifica i punti dove l'utente Explorer vede l'invito a upgrade.

Cerca in tutto il codebase i punti di "gating":

1. ESERCIZI LOCKED:
   - File: src/components/exercises/LockedExerciseView.tsx
   - Verifica: Mostra messaggio + CTA pricing

2. LIMITE AI COACH:
   - File: src/components/ai-coach/ChatWidget.tsx
   - Verifica: Dopo 5 messaggi → messaggio limite + CTA

3. ASSESSMENT COMPLETO:
   - Dopo risultati → "Sblocca tutti gli esercizi"

4. DASHBOARD:
   - Banner o card upgrade se Explorer

Per ogni punto verifica:
- Messaggio chiaro del valore (cosa ottiene con upgrade)
- CTA che porta a /pricing
- Non blocca completamente l'esperienza (graceful degradation)

Output: Lista punti upgrade con ✅/❌.
```

---

### Prompt 7.2 - Test Checkout Stripe

```
Verifica il flusso checkout Stripe.

File:
- src/app/pricing/page.tsx
- src/app/api/stripe/checkout/route.ts
- src/app/api/stripe/webhook/route.ts

Verifica:
1. Pagina pricing mostra:
   - Piano Leader €149/anno
   - Piano Mentor €490/anno
   - Benefici di ogni piano
   - CTA "Inizia" per ogni piano

2. Click su CTA:
   - Crea sessione Stripe checkout
   - Redirect a checkout.stripe.com
   - Pre-compila email se utente loggato

3. Webhook post-pagamento:
   - Riceve evento checkout.session.completed
   - Aggiorna subscription in database
   - Aggiorna tier utente (explorer → leader)

4. Redirect post-pagamento:
   - success_url porta a pagina di conferma
   - Pagina conferma ha:
     - "Benvenuto nel piano Leader!"
     - Accesso immediato ai contenuti
     - CTA "Vai alla Dashboard" (STOP → START)

Output: ✅/❌ per ogni step del flusso.
```

---

### Prompt 7.3 - Test Email Conferma Upgrade

```
Verifica l'email di conferma post-upgrade.

File: src/lib/email/subscription-emails.ts (o in webhook)

L'email deve contenere:

1. CONFERMA:
   - "Benvenuto nel piano [LEADER/MENTOR]!"
   - Riepilogo acquisto (prezzo, data rinnovo)
   - Fattura/ricevuta link

2. COSA HAI SBLOCCATO:
   - Lista benefici ora disponibili
   - Per Leader: 52 esercizi, AI illimitato
   - Per Mentor: + sessioni 1:1

3. PROSSIMO PASSO (STOP → START):
   - "Inizia subito con..." 
   - Link diretto a esercizio consigliato o dashboard
   - Link a prenotazione 1:1 (se Mentor)

4. SUPPORTO:
   - Come contattare per domande
   - Link a FAQ

Output: ✅/❌ per ogni sezione.
```

---

## TEST FINALE: VERIFICA COMPLETA

### Prompt FINAL - Audit Completo Cicli

```
Esegui un audit completo di tutti i cicli START→CHANGE→STOP del Customer Journey Vitaeology.

Genera un report con questa struttura:

## REPORT AUDIT CUSTOMER JOURNEY
## Data: [oggi]

### CICLO 1: ADS → ISCRIZIONE
- START (Landing): ✅/❌
- CHANGE (Form): ✅/❌  
- STOP (Email conferma + CTA): ✅/❌
- Gap trovati: [lista]

### CICLO 2: CHALLENGE DAYS
- START (Email giorno): ✅/❌
- CHANGE (Domande Discovery): ✅/❌
- STOP (Conferma + Teaser): ✅/❌
- Gap trovati: [lista]

### CICLO 3: CHALLENGE COMPLETE
- START (Day 7): ✅/❌
- CHANGE (Ultime domande): ✅/❌
- STOP (Mini-profilo + CTA): ✅/❌
- Gap trovati: [lista]

### CICLO 4: ASSESSMENT
- START (Pagina intro): ✅/❌
- CHANGE (72 domande): ✅/❌
- STOP (Radar + CTA esercizi): ✅/❌
- Gap trovati: [lista]

### CICLO 5: ESERCIZI
- START (Selezione): ✅/❌
- CHANGE (Completamento): ✅/❌
- STOP (Celebrazione + Prossimo): ✅/❌
- Gap trovati: [lista]

### CICLO 6: AI COACH
- START (Apertura chat): ✅/❌
- CHANGE (Conversazione): ✅/❌
- STOP (Wrap-up + Azione): ✅/❌
- Gap trovati: [lista]

### CICLO 7: UPGRADE
- START (Trigger upgrade): ✅/❌
- CHANGE (Checkout): ✅/❌
- STOP (Conferma + Accesso): ✅/❌
- Gap trovati: [lista]

---

## RIEPILOGO
- Cicli completi: X/7
- Gap critici (vicoli ciechi): [lista]
- Gap minori: [lista]
- Pronto per tester umani: ✅/❌

## AZIONI IMMEDIATE
[Lista ordinata per priorità dei fix necessari]
```

---

## 🔄 PROMPT FIX AUTOMATICI

### Se trovi un vicolo cieco

```
Ho trovato un vicolo cieco nel Customer Journey Vitaeology.

Posizione: [CICLO X - FASE STOP]
File: [path/to/file.tsx]
Problema: [descrizione - es. "Dopo completamento esercizio non c'è CTA per prossimo passo"]

Correggi aggiungendo:
1. Se manca CTA → Aggiungi bottone/link al prossimo passo logico
2. Se manca feedback → Aggiungi messaggio di conferma
3. Se manca teaser → Aggiungi anticipazione di cosa viene dopo

Segui i principi:
- Principio Validante (linguaggio positivo)
- Felicità in ogni punto (valore percepito)
- STOP crea desiderio per START

Applica la correzione e mostra il diff.
```

---

*Documento creato: 11 Gennaio 2026*
*Per: Claude Code Terminal*
*Progetto: Vitaeology Customer Journey Test*
