# 🚀 GUIDA IMPLEMENTAZIONE RAG - FERNANDO AI COACH

## Conformità: MEGA_PROMPT v4.1 | Data: 15 Dicembre 2025

---

## 📋 OVERVIEW

Questa guida ti accompagna nell'implementazione del sistema RAG (Retrieval Augmented Generation) per dare a **Fernando AI Coach** accesso ai contenuti completi dei tuoi 3 libri della Trilogia "Rivoluzione Aurea".

### Cosa Otterrai

✅ Fernando potrà citare storie specifiche (Elena, Marco, Giulia)  
✅ Fernando potrà applicare framework dettagliati (Tre Filtri, R.A.D.A.R.)  
✅ Fernando potrà usare esempi concreti e casi studio  
✅ Fernando potrà personalizzare risposte in base a contesto rilevante  

### Architettura

```
Utente scrive messaggio
        ↓
Sistema genera embedding (OpenAI ada-002)
        ↓
Cerca chunks rilevanti in Supabase (pgvector)
        ↓
Aggiunge contesto al system prompt di Fernando
        ↓
Claude risponde usando conoscenza specifica dai libri
```

---

## 📦 DELIVERABLES INCLUSI

| File | Scopo |
|------|-------|
| `01_book_knowledge_schema.sql` | Schema database Supabase con pgvector |
| `02_process_books.js` | Script per processare libri in chunks |
| `03_generate_embeddings.js` | Script per generare embeddings OpenAI |
| `04_import_to_supabase.js` | Script per importare in Supabase |
| `05_rag_module.ts` | Modulo TypeScript per integrazione API |

---

## 🔧 STEP 1: PREPARAZIONE SUPABASE

### 1.1 Abilita pgvector

1. Vai a **Supabase Dashboard** → tuo progetto
2. **Database** → **Extensions**
3. Cerca "vector" e abilita `pgvector`

### 1.2 Esegui Schema SQL

1. Vai a **SQL Editor**
2. Copia tutto il contenuto di `01_book_knowledge_schema.sql`
3. Esegui

**Verifica:**
```sql
-- Dovrebbe restituire la tabella vuota
SELECT * FROM book_knowledge LIMIT 1;

-- Dovrebbe restituire la funzione
SELECT proname FROM pg_proc WHERE proname = 'search_book_knowledge';
```

---

## 📚 STEP 2: PROCESSA I LIBRI

### 2.1 Setup Locale

```bash
# Crea cartella di lavoro
mkdir vitaeology-rag
cd vitaeology-rag

# Copia i file dalla guida
# (o clona se in repo)

# Copia i 3 libri nella cartella
cp /path/to/Libri_1_oltre_gli_ostacoli.docx .
cp /path/to/Libri_2_MicrofelicitÃ_.docx .
cp /path/to/Libri_3_Oltre_la_Bella_Figura.docx .
```

### 2.2 Esegui Processing

```bash
node 02_process_books.js . ./output
```

**Output atteso:**
```
📖 Processing: Oltre gli Ostacoli
   ✅ Chunks created: ~110

📖 Processing: Microfelicità
   ✅ Chunks created: ~177

📖 Processing: Leadership Autentica
   ✅ Chunks created: ~278

Total chunks: ~565
```

**File generati:**
- `output/book_chunks.json` - Chunks pronti per embedding
- `output/book_chunks_stats.json` - Statistiche

---

## 🧠 STEP 3: GENERA EMBEDDINGS

### 3.1 Ottieni API Key OpenAI

1. Vai a [platform.openai.com](https://platform.openai.com)
2. **API Keys** → Create new secret key
3. Copia la chiave (inizia con `sk-`)

### 3.2 Esegui Generazione

```bash
OPENAI_API_KEY=sk-xxx node 03_generate_embeddings.js
```

**Costo stimato:** ~$0.02 (meno di 2 centesimi!)

**Output:**
- `output/book_chunks_with_embeddings.json`
- `output/ready_for_supabase.json`

### 3.3 Alternativa: Mock per Testing

Se vuoi testare senza API:
```bash
node 03_generate_embeddings.js --mock
```
⚠️ Gli embeddings mock NON funzioneranno per ricerca semantica reale.

---

## 📤 STEP 4: IMPORTA IN SUPABASE

### 4.1 Ottieni Credenziali Supabase

1. **Supabase Dashboard** → tuo progetto
2. **Settings** → **API**
3. Copia:
   - `URL` (es. `https://xxx.supabase.co`)
   - `service_role` secret key (⚠️ NON la anon key!)

### 4.2 Esegui Import

```bash
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_KEY=eyJhbG... \
node 04_import_to_supabase.js --clear
```

**Opzioni:**
- `--clear` - Pulisce tabella prima di importare
- `--dry-run` - Simula senza scrivere

### 4.3 Verifica in Supabase

```sql
-- Conta righe importate
SELECT COUNT(*) FROM book_knowledge;
-- Atteso: ~565

-- Verifica distribuzione per libro
SELECT book_title, COUNT(*) 
FROM book_knowledge 
GROUP BY book_title;

-- Verifica distribuzione per tipo
SELECT content_type, COUNT(*) 
FROM book_knowledge 
GROUP BY content_type;

-- Test ricerca (con embedding placeholder)
SELECT * FROM search_book_knowledge(
  '[0.1, 0.2, ...]'::vector,  -- Sostituisci con vettore reale
  0.5,  -- threshold
  5     -- limit
);
```

---

## 🔌 STEP 5: INTEGRA NELL'API ROUTE

### 5.1 Copia il Modulo RAG

```bash
# Nel tuo progetto Vitaeology
cp 05_rag_module.ts app/lib/rag.ts
```

### 5.2 Installa Dipendenze

```bash
npm install openai @supabase/supabase-js
```

### 5.3 Configura Environment Variables

```env
# .env.local
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
OPENAI_API_KEY=sk-xxx
```

### 5.4 Modifica API Route

Apri `/app/api/ai-coach/route.ts` e integra:

```typescript
import { enrichWithBookKnowledge } from '@/lib/rag';

export async function POST(req: Request) {
  const { message, conversationId } = await req.json();
  
  // 🆕 Arricchisci con contesto dai libri
  const ragContext = await enrichWithBookKnowledge(message);
  
  // 🆕 System prompt arricchito
  const enrichedSystemPrompt = `
    ${FERNANDO_BASE_SYSTEM_PROMPT}
    
    ---
    CONTESTO RILEVANTE DAI LIBRI:
    
    Usa queste informazioni per arricchire le tue risposte con
    esempi specifici, storie e framework dai libri di Fernando.
    Integra naturalmente, NON citare "secondo il libro" o simili.
    Se il contesto non è rilevante, ignoralo.
    
    ${ragContext.formattedContext}
    ---
  `;
  
  // Chiamata a Claude API (come prima)
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    system: enrichedSystemPrompt,
    messages: conversationHistory,
    max_tokens: 1024
  });
  
  return Response.json({ 
    response: response.content[0].text,
    // Opzionale: per debug/analytics
    _debug: {
      ragSources: ragContext.sources,
      ragTokensUsed: ragContext.tokensUsed
    }
  });
}
```

---

## ✅ STEP 6: TEST E VERIFICA

### 6.1 Test Locali

```bash
npm run dev
```

### 6.2 Test Query

Prova queste query in chat:

1. **Test storie:**
   > "Come ha fatto Elena a gestire il cliente difficile?"
   
   Fernando dovrebbe rispondere usando dettagli specifici della storia di Elena dal libro.

2. **Test framework:**
   > "Spiegami il sistema R.A.D.A.R."
   
   Fernando dovrebbe spiegare il framework con dettagli accurati.

3. **Test biografia:**
   > "Raccontami dei tuoi primi anni come imprenditore"
   
   Fernando dovrebbe raccontare la storia di Torino 1974, i 9 anni di fallimenti, ecc.

### 6.3 Verifica Qualità

- [ ] Le risposte contengono dettagli specifici dai libri?
- [ ] I personaggi sono citati correttamente (Elena, Marco, Giulia)?
- [ ] I framework sono spiegati accuratamente?
- [ ] Il tono rimane validante (mai deficit-based)?
- [ ] L'integrazione è naturale (non "secondo il libro...")?

---

## 🚨 TROUBLESHOOTING

### Errore: "pgvector extension not found"

```sql
CREATE EXTENSION vector;
```

### Errore: "Function search_book_knowledge not found"

Riesegui lo schema SQL completo.

### Errore: "Invalid embedding dimension"

Verifica che gli embeddings abbiano esattamente 1536 dimensioni.

### Ricerca restituisce sempre 0 risultati

1. Verifica che ci siano dati: `SELECT COUNT(*) FROM book_knowledge WHERE embedding IS NOT NULL`
2. Abbassa threshold: `match_threshold: 0.5`
3. Verifica formato embedding: deve essere `[x,y,z,...]` stringa

### Risposte di Fernando non usano il contesto

1. Verifica che `ragContext.formattedContext` non sia vuoto
2. Aumenta `maxResults` in CONFIG
3. Verifica log per errori di ricerca

---

## 📊 COSTI STIMATI

| Voce | Costo |
|------|-------|
| OpenAI Embeddings (una tantum) | ~$0.02 |
| Supabase storage (565 righe) | Incluso nel free tier |
| OpenAI Embeddings per query | ~$0.0001/query |

**Costo mensile stimato (1000 query):** ~$0.10

---

## 🔄 AGGIORNAMENTI FUTURI

### Aggiungere nuovi contenuti

1. Aggiungi nuovo file a `/mnt/project/`
2. Modifica `CONFIG.books` in `02_process_books.js`
3. Riesegui processing + embeddings + import

### Migliorare la ricerca

- Implementa filtro per caratteristica leadership
- Aggiungi boost per tipi di contenuto specifici
- Implementa re-ranking basato su feedback utente

### Analytics

- Traccia quali chunks vengono usati di più
- Identifica gap nei contenuti
- Migliora embeddings per query comuni

---

## 📝 CHECKLIST FINALE

- [ ] pgvector abilitato in Supabase
- [ ] Schema SQL eseguito
- [ ] Libri processati in chunks
- [ ] Embeddings generati
- [ ] Dati importati in Supabase
- [ ] Modulo RAG copiato nel progetto
- [ ] API route modificata
- [ ] Environment variables configurate
- [ ] Test manuali completati
- [ ] Deploy su Vercel

---

## 📞 SUPPORTO

Se hai problemi:
1. Verifica i log di Supabase
2. Controlla la console del browser
3. Usa `console.log(ragContext)` per debug
4. Apri issue nel repository o chiedi nella prossima sessione Claude

---

**Buon lavoro Fernando! 🚀**

*Conformità MEGA_PROMPT v4.1 verificata ✅*
