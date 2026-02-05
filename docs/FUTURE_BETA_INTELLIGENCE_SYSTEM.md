# PROMPT PER CLAUDE CODE: Sistema di Intelligenza Beta Tester

## CONTESTO

Vitaeology è una piattaforma di sviluppo leadership per imprenditori e manager italiani (35-55 anni). Stiamo lanciando un test con 100 click per trovare 20-30 beta tester attraverso 3 challenge gratuite di 7 giorni (Leadership Autentica, Oltre gli Ostacoli, Microfelicità).

L'AI Coach attuale è basato su RAG con 966 chunk estratti dai 3 libri. L'obiettivo è far evolvere l'AI Coach da "esperto dei libri" a "esperto delle necessità reali degli utenti", usando le interazioni dei beta tester come guida.

## COSA ESISTE GIÀ (non ricostruire)

Controlla questi componenti esistenti prima di procedere:

### AI Coach
- `lib/ai-coach/` → system-prompt, user-memory, pattern-recognition, pattern-autocorrection, implicit-signals, daily-metrics, weekly-report
- `/api/ai-coach` → chat, conversations, history, feedback, signals, export
- `/api/ai-coach/cron/` → daily-metrics, weekly-report

### Servizi qualità
- `lib/services/parole-check.ts` → verifica termini tecnici
- `lib/services/concretezza-check.ts` → verifica esempi concreti
- `lib/services/graduality-check.ts` → verifica gradualità
- `lib/services/pattern-detection.ts` → rilevamento pattern
- `lib/services/correction-suggestion.ts` → suggerimenti correzione

### Beta Testing
- `/api/beta/apply`, `/api/beta/testers`, `/api/beta/feedback`, `/api/beta/stats`
- `/api/challenge/beta-feedback`

### Admin
- `/admin/ai-coach` → stats AI Coach
- `/admin/feedback-patterns` → pattern feedback
- `/admin/quality-audit` → audit qualità risposte
- `/admin/beta-testing` → gestione beta tester

### Analytics
- `lib/analytics/behavioral.ts`
- `/api/analytics/behavioral`

---

## FASE 1: ANALISI — Interaction Intelligence Layer

### 1.1 Crea tabella Supabase `beta_interaction_topics`

Questa tabella serve a categorizzare automaticamente ogni conversazione dei beta tester con l'AI Coach.

```sql
CREATE TABLE beta_interaction_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  conversation_id UUID NOT NULL,
  message_id UUID NOT NULL,
  
  -- Categorizzazione automatica
  topic_category TEXT NOT NULL,
  -- Valori attesi: 'leadership', 'ostacoli', 'microfelicita', 
  -- 'relazioni_team', 'gestione_stress', 'decisioni', 
  -- 'comunicazione', 'conflitti', 'motivazione', 
  -- 'equilibrio_vita_lavoro', 'altro'
  
  topic_subcategory TEXT,
  -- Sotto-categoria più specifica, esempio: 
  -- 'delega', 'feedback_difficile', 'licenziamento', etc.
  
  user_need_type TEXT NOT NULL,
  -- Cosa cerca l'utente: 'metodo_pratico', 'validazione', 
  -- 'comprensione', 'sfogo', 'strategia', 'confronto'
  
  sentiment TEXT DEFAULT 'neutro',
  -- 'positivo', 'neutro', 'frustrato', 'confuso', 'urgente'
  
  -- Tracciamento copertura RAG
  rag_coverage TEXT DEFAULT 'coperto',
  -- 'coperto' = i libri rispondono bene
  -- 'parziale' = i libri toccano il tema ma non bastano
  -- 'gap' = i libri non coprono questa necessità
  
  rag_gap_description TEXT,
  -- Se rag_coverage = 'gap' o 'parziale', descrivi cosa manca
  
  -- Metadata
  challenge_origin TEXT,
  -- Da quale challenge arriva il beta tester
  
  is_beta_tester BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indici per query frequenti
CREATE INDEX idx_bit_topic ON beta_interaction_topics(topic_category);
CREATE INDEX idx_bit_need ON beta_interaction_topics(user_need_type);
CREATE INDEX idx_bit_gap ON beta_interaction_topics(rag_coverage);
CREATE INDEX idx_bit_user ON beta_interaction_topics(user_id);
CREATE INDEX idx_bit_created ON beta_interaction_topics(created_at);
```

### 1.2 Crea tabella `rag_gap_registry`

Registro dei temi che i libri non coprono, aggregato dalle interazioni.

```sql
CREATE TABLE rag_gap_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  gap_topic TEXT NOT NULL,
  -- Esempio: "gestione licenziamento collaboratore"
  
  gap_description TEXT NOT NULL,
  -- Descrizione dettagliata di cosa gli utenti chiedono
  
  occurrence_count INT DEFAULT 1,
  -- Quante volte questo gap è emerso
  
  unique_users_count INT DEFAULT 1,
  -- Quanti utenti diversi hanno sollevato il tema
  
  sample_questions JSONB DEFAULT '[]',
  -- Array di domande reali degli utenti (anonimizzate)
  
  priority TEXT DEFAULT 'bassa',
  -- 'critica', 'alta', 'media', 'bassa'
  -- Calcolata: critica se >5 utenti diversi, alta se >3, etc.
  
  status TEXT DEFAULT 'identificato',
  -- 'identificato', 'in_analisi', 'contenuto_creato', 'integrato'
  
  resolution_notes TEXT,
  -- Come è stato risolto il gap
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.3 Modifica il flusso AI Coach per classificare automaticamente

Il file da modificare è `lib/ai-coach/system-prompt.ts` (o dove viene costruito il prompt di sistema dell'AI Coach).

Aggiungi al sistema di post-processing delle risposte (dopo che l'AI Coach ha risposto) una chiamata di classificazione. NON aggiungere latenza alla risposta dell'utente: la classificazione avviene in modo asincrono dopo la risposta.

Crea `lib/ai-coach/interaction-classifier.ts`:

```typescript
// Questo modulo classifica ogni interazione utente-AI Coach
// Viene chiamato DOPO che la risposta è stata inviata all'utente
// per non aggiungere latenza alla conversazione

interface InteractionClassification {
  topic_category: string;
  topic_subcategory: string | null;
  user_need_type: string;
  sentiment: string;
  rag_coverage: 'coperto' | 'parziale' | 'gap';
  rag_gap_description: string | null;
}

// Usa una chiamata Claude API leggera (haiku) per classificare
// Input: messaggio utente + risposta AI Coach + contesto conversazione
// Output: InteractionClassification

// IMPORTANTE: La classificazione deve tenere conto del 
// Principio Validante di Vitaeology:
// - L'utente HA GIÀ le capacità
// - Il sentiment "frustrato" non significa deficit, 
//   significa che l'utente sta cercando di attivare qualcosa
// - Un "gap" RAG non è un fallimento, è un'opportunità 
//   per espandere il supporto
```

La logica di classificazione:

1. Dopo ogni risposta dell'AI Coach a un beta tester, chiama `classifyInteraction()`
2. Salva il risultato in `beta_interaction_topics`
3. Se `rag_coverage` è 'gap' o 'parziale', aggiorna `rag_gap_registry`:
   - Se il gap esiste già, incrementa contatori
   - Se è nuovo, crea una nuova entry
   - Ricalcola la priorità in base ai contatori

### 1.4 Verifica integrazione con sistemi esistenti

Il `pattern-detection.ts` esistente già rileva pattern nei feedback. Assicurati che:
- I topic rilevati dall'interaction classifier siano coerenti con i pattern già rilevati
- Non ci sia duplicazione di logica
- Il `daily-metrics` e `weekly-report` includano i nuovi dati

---

## FASE 2: IMPLEMENTAZIONE — Dashboard e Visualizzazione

### 2.1 Nuova pagina admin: `/admin/beta-intelligence`

Questa è la pagina chiave per Fernando. Deve mostrare a colpo d'occhio:

**Sezione 1: Mappa dei Bisogni**
- Grafico a bolle o treemap che mostra i topic_category per frequenza
- Cliccando su una categoria, si vedono le sotto-categorie
- Colore basato su rag_coverage: verde (coperto), giallo (parziale), rosso (gap)

**Sezione 2: Gap RAG — Priorità Sviluppo**
- Tabella dalla `rag_gap_registry` ordinata per priorità
- Colonne: tema, occorrenze, utenti unici, priorità, stato
- Azione: cambiare stato (identificato → in_analisi → contenuto_creato → integrato)

**Sezione 3: Trend Temporale**
- Grafico linea che mostra come cambiano i topic nel tempo
- Utile per capire se i bisogni evolvono durante la challenge

**Sezione 4: Confronto per Challenge**
- Chi arriva da Leadership Autentica cosa chiede all'AI Coach?
- Chi arriva da Oltre gli Ostacoli cosa chiede?
- Chi arriva da Microfelicità cosa chiede?
- Questo dato è cruciale: indica se la challenge attrae il pubblico giusto

**Sezione 5: Insight per l'AI Coach**
- Tipo di bisogno più frequente (metodo_pratico vs validazione vs comprensione)
- Questo orienta come l'AI Coach dovrebbe rispondere, non solo cosa sa

### 2.2 API endpoints necessari

```
GET  /api/admin/beta-intelligence/topics      → aggregazione topic
GET  /api/admin/beta-intelligence/gaps         → lista gap con priorità
PATCH /api/admin/beta-intelligence/gaps/[id]   → aggiorna stato gap
GET  /api/admin/beta-intelligence/trends       → trend temporali
GET  /api/admin/beta-intelligence/by-challenge → confronto per challenge
GET  /api/admin/beta-intelligence/needs-map    → mappa bisogni aggregata
```

### 2.3 Integrazione con dashboard admin esistente

Aggiungi un widget riassuntivo nella dashboard admin principale (`/admin`) che mostri:
- Numero totale interazioni classificate
- Top 3 gap RAG per priorità
- Distribuzione bisogni (grafico a torta semplice)
- Link diretto a `/admin/beta-intelligence`

---

## FASE 3: EVOLUZIONE AI COACH

### 3.1 Sistema di espansione competenze

Crea `lib/ai-coach/competence-expansion.ts`:

Quando un gap RAG viene marcato come "contenuto_creato", il sistema deve:

1. Permettere di aggiungere nuovi chunk al RAG senza rifare tutto il sistema
2. I nuovi chunk devono essere taggati come `source: 'beta_feedback'` per distinguerli dai chunk dei libri (`source: 'libro'`)
3. I nuovi chunk possono venire da:
   - Risposte manuali di Fernando a domande frequenti
   - Contenuti creati appositamente per colmare il gap
   - Best practice estratte dalle conversazioni stesse

Crea la tabella:

```sql
CREATE TABLE rag_expansion_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  content TEXT NOT NULL,
  -- Il contenuto del nuovo chunk
  
  source TEXT DEFAULT 'beta_feedback',
  -- 'beta_feedback', 'fernando_manual', 'best_practice'
  
  related_gap_id UUID REFERENCES rag_gap_registry(id),
  -- Collegamento al gap che questo chunk risolve
  
  topic_tags TEXT[] DEFAULT '{}',
  -- Tag per matching più preciso
  
  embedding VECTOR(1536),
  -- Embedding per ricerca semantica (stesso formato RAG esistente)
  
  is_active BOOLEAN DEFAULT true,
  -- Può essere disattivato senza eliminarlo
  
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.2 Modifica RAG per includere chunk espansi

Il file `lib/rag.ts` (966 chunk dai libri) deve essere esteso per:
- Cercare anche in `rag_expansion_chunks` durante la ricerca semantica
- Dare priorità ai chunk espansi quando il topic corrisponde (perché sono più specifici)
- Mantenere i chunk dei libri come base, i chunk espansi come specializzazione

### 3.3 Adattamento tono risposta

Basandoti sui dati di `user_need_type` più frequenti, il system prompt dell'AI Coach deve adattarsi:

- Se la maggior parte chiede `metodo_pratico` → risposte più strutturate con passi concreti
- Se la maggior parte chiede `validazione` → risposte che prima riconoscono e poi guidano
- Se la maggior parte chiede `comprensione` → risposte più esplorative e dialogiche

Questo non è hardcoded ma viene calcolato dal `weekly-report` e aggiorna dinamicamente una variabile nel system prompt.

---

## VINCOLI TECNICI

1. **Classificazione asincrona**: Mai aggiungere latenza alla risposta dell'AI Coach. La classificazione avviene dopo.
2. **Costi API**: Usa Claude Haiku per la classificazione (non Sonnet/Opus). Budget stimato: ~€0.01 per classificazione.
3. **Privacy**: Le `sample_questions` nel gap registry devono essere anonimizzate (niente nomi, aziende, dettagli identificativi).
4. **Principio Validante**: La classificazione del sentiment deve rispettare la filosofia Vitaeology. "Frustrato" non è negativo, è qualcuno che sta cercando di attivare una capacità che ha già.
5. **Gradualità**: Non serve tutto insieme. L'ordine di implementazione è: Fase 1 → test con 5-10 interazioni reali → Fase 2 → raccolta dati per 2 settimane → Fase 3.
6. **Framework 4P/12F**: Questa implementazione è P4 (correzione del prodotto generato) che alimenta P1 (istituzione di ciò che produce). I dati dei beta tester correggono e ridefiniscono la struttura dell'AI Coach.

## ORDINE DI ESECUZIONE

```
STEP 1: Crea le tabelle Supabase (beta_interaction_topics, rag_gap_registry)
STEP 2: Crea interaction-classifier.ts
STEP 3: Integra il classifier nel flusso post-risposta dell'AI Coach
STEP 4: Testa con 5-10 interazioni simulate
STEP 5: Crea gli endpoint API per admin
STEP 6: Crea la pagina /admin/beta-intelligence
STEP 7: Integra widget nella dashboard admin esistente
--- PAUSA: raccogli dati reali per 2 settimane ---
STEP 8: Crea rag_expansion_chunks e il sistema di espansione
STEP 9: Modifica lib/rag.ts per includere chunk espansi
STEP 10: Implementa adattamento dinamico tono risposta
```

## TEST

Dopo ogni step, verifica che:
- I sistemi esistenti (AI Coach, beta feedback, pattern detection) continuino a funzionare
- La classificazione non rallenti la risposta dell'AI Coach
- I dati nella dashboard siano coerenti
- Il Principio Validante sia rispettato nella classificazione

## RISULTATO ATTESO

Al termine, Fernando potrà:
1. Vedere esattamente cosa chiedono i beta tester all'AI Coach
2. Identificare dove i libri non bastano e serve nuovo contenuto
3. Sapere quale challenge attrae quale tipo di bisogno
4. Espandere progressivamente le competenze dell'AI Coach basandosi su dati reali
5. Orientare lo sviluppo futuro della piattaforma sulle necessità effettive, non su ipotesi
