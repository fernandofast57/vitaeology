# ARCHITETTURA DASHBOARD VITAEOLOGY - VERSIONE DEFINITIVA

**Data:** 18 Gennaio 2026  
**Versione:** 2.0  
**Status:** Approvato da Fernando  
**Riferimento:** Conforme a MEGA_PROMPT v4.3 e CONTROL_TOWER v1.2

---

## 1. PRINCIPI FONDAMENTALI

### 1.1 Principio Validante
- MAI linguaggio deficit ("ti manca", "area debole")
- SEMPRE linguaggio validante ("dove già operi", "puoi espandere")
- L'utente POSSIEDE GIÀ tutte le capacità

### 1.2 Framework Comprensione
La verifica dell'apprendimento si basa su:
- **Affinità:** Vicinanza verso l'argomento
- **Realtà:** Accordo con l'argomento
- **Comunicazione:** Flusso di idee tra terminali affini, reali e in comunicazione

### 1.3 Tre Barriere alla Comprensione
1. **Parola mal compresa** → Ogni termine non comune deve essere spiegato o sostituito
2. **Mancanza di concretezza** → Paragoni tra realtà conoscibili e conosciute
3. **Gradiente saltato** → Gradualità di apprendimento corretta

---

## 2. STRUTTURA TIER E ACCESSI

### 2.1 Matrice Accesso

| Contenuto | Challenge €0 | Leader €149/anno | Mentor €490/anno |
|-----------|--------------|------------------|------------------|
| Challenge 7 giorni | ✅ | ✅ | ✅ |
| **Percorsi disponibili** | ❌ | 1 a scelta | Tutti e 3 |
| Assessment iniziale (iniziale) | ❌ | ✅ (1 percorso) | ✅ (3 percorsi) |
| Esercizi personalizzati AI | ❌ | ✅ (1 pool) | ✅ (3 pool) |
| AI Coach Fernando illimitato | ❌ | ✅ | ✅ |
| Cross-pollination percorsi | ❌ | ❌ | ✅ |
| Esame Certificazione (240 dom) | ❌ | ❌ | ✅ (dopo completamento) |
| Sessioni 1:1 con Fernando | ❌ | ❌ | 2/anno |

### 2.2 Flusso Utente

```
CHALLENGE (€0)
│
├── 7 giorni email + pagine dedicate
├── 21 domande Discovery (3 per giorno)
└── Mini-profilo finale
    │
    ▼
LEADER (€149/anno) - Sceglie 1 percorso
│
├── Assessment iniziale del percorso scelto
├── AI Fernando propone esercizi personalizzati dal pool
├── Progressi tracciati + radar evoluzione
└── ✅ Percorso completato
    │
    ▼ (può acquistare altri percorsi o upgrade)
    
MENTOR (€490/anno) - Tutti e 3 i percorsi
│
├── Percorso Leadership
│   ├── Assessment iniziale (72 domande)
│   ├── AI propone esercizi personalizzati
│   └── ✅ Completato
│
├── Percorso Ostacoli
│   ├── Assessment iniziale (48 domande)
│   ├── AI propone esercizi personalizzati
│   └── ✅ Completato
│
├── Percorso Microfelicità
│   ├── Assessment iniziale (47 domande)
│   ├── AI propone esercizi personalizzati
│   └── ✅ Completato
│
└── ▼ (tutti e 3 completati)
    
    ESAME CERTIFICAZIONE MENTOR (240 domande)
    │
    ├── ❌ Barriere identificate → Correzione → Riesame
    └── ✅ Superato → CERTIFICAZIONE MENTOR
```

---

## 3. ASSESSMENT INIZIALI (per percorso)

### 3.1 Scopo
Gli assessment iniziali servono a:
- Creare il **radar iniziale** dell'utente
- Identificare **aree di leva** per personalizzazione esercizi
- Fornire **punto di partenza** misurabile

### 3.2 Struttura per Percorso

| Percorso | Domande | Struttura | Output |
|----------|---------|-----------|--------|
| **Leadership** | 72 | 24 caratteristiche × 3 domande | Radar 24 assi / 4 pilastri |
| **Ostacoli** | 48 | 3 Filtri + 3 Traditori + Scala Risolutore | Radar 6 dimensioni + Livello |
| **Microfelicità** | 47 | 5 R.A.D.A.R. + 5 Sabotatori + 3 Livelli | Radar 13 dimensioni |

### 3.3 Scoring
- Scala 1-5 (Quasi mai → Costantemente)
- Scoring diretto (no inverse)
- Media per dimensione
- Visualizzazione radar chart

---

## 4. SISTEMA ESERCIZI PERSONALIZZATI

### 4.1 Paradigma

**NON esiste** percorso sequenziale "Settimana 1, 2, 3..."

**AI Fernando:**
- Ha accesso al **pool completo** di esercizi del percorso acquistato
- Conosce i **risultati assessment** dell'utente
- Conosce gli **esercizi già completati** e le riflessioni
- **Propone** l'esercizio giusto per quella persona in quel momento
- **Spiega perché** quell'esercizio è rilevante

### 4.2 Pool Esercizi

| Percorso | Esercizi nel Pool | Source |
|----------|-------------------|--------|
| Leadership | 52 | 52-esercizi-vitaeology.docx |
| Ostacoli | 14 (dimension) + 24 (original) | insert-exercises-risolutore-v2.sql |
| Microfelicità | 26 (dimension) + 24 (original) | insert-exercises-microfelicita-v2.sql |

### 4.3 Logica Proposta AI

```typescript
// Pseudo-codice logica AI Fernando
function proponiEsercizio(utente) {
  const assessmentResults = getAssessmentResults(utente);
  const eserciziCompletati = getEserciziCompletati(utente);
  const riflessioniUtente = getRiflessioni(utente);
  const percorsiAttivi = getPercorsiAttivi(utente);
  
  // Identifica aree di leva (punteggi più bassi)
  const areeLeva = identificaAreeLeva(assessmentResults);
  
  // Filtra esercizi disponibili (non completati, del percorso giusto)
  const eserciziDisponibili = filtraEsercizi(percorsiAttivi, eserciziCompletati);
  
  // Seleziona esercizio più rilevante per area di leva
  const esercizio = selezionaPerRilevanza(eserciziDisponibili, areeLeva);
  
  // Genera spiegazione personalizzata del PERCHÉ
  const spiegazione = generaSpiegazione(esercizio, areeLeva, riflessioniUtente);
  
  return { esercizio, spiegazione };
}
```

### 4.4 Accesso per Tier

| Tier | Pool Accessibili | Cross-pollination |
|------|------------------|-------------------|
| Leader | Solo pool del percorso scelto | ❌ |
| Mentor | Tutti e 3 i pool | ✅ AI può collegare concetti tra percorsi |

---

## 5. ESAME CERTIFICAZIONE MENTOR

### 5.1 Prerequisiti
- Abbonamento Mentor attivo (€490/anno)
- **Tutti e 3 i percorsi completati**
- Assessment iniziale di tutti e 3 i percorsi superati

### 5.2 Scopo
L'esame **NON è un voto** ma una **verifica di comprensione reale**.

Verifica che il candidato abbia:
1. **Compreso** i principi fondamentali di tutti e 3 i percorsi
2. **Applicato** concretamente gli esercizi nella vita reale
3. **Integrato** la teoria con la pratica

### 5.3 Struttura 240 Domande

| Percorso | Domande | Distribuzione |
|----------|---------|---------------|
| Leadership | 80 | 27 Dati Stabili + 27 Doingness + 26 Teoria |
| Ostacoli | 80 | 27 Dati Stabili + 27 Doingness + 26 Teoria |
| Microfelicità | 80 | 27 Dati Stabili + 27 Doingness + 26 Teoria |

### 5.4 Tre Livelli di Verifica

| Livello | Cosa Verifica | Tipo Domanda | Esempio |
|---------|---------------|--------------|---------|
| **1. DATI STABILI** | Regole, assiomi, principi | "Qual è..." / "Cosa significa..." | "Quali sono i 3 Traditori e cosa rappresenta ciascuno?" |
| **2. DOINGNESS** | Come si fa esattamente | "Come applichi..." / "Descrivi passo per passo..." | "Come riconosci concretamente quando il Timoroso sta operando in te?" |
| **3. TEORIA** | Perché si fa | "Perché funziona..." / "Qual è lo scopo di..." | "Perché i Traditori sabotano la capacità risolutiva già presente?" |

### 5.5 Controllo Barriere Comprensione

Durante l'esame, AI Fernando verifica le 3 barriere:

| Barriera | Segnale | Verifica | Azione Correttiva |
|----------|---------|----------|-------------------|
| **Parola mal compresa** | Risposta confusa su terminologia | "Definisci con parole tue: [termine]" | Chiarimento termine + riesame sezione |
| **Mancanza concretezza** | Risposta teorica senza esempi | "Fai un esempio dalla tua esperienza reale" | Esercizio pratico aggiuntivo + riesame |
| **Gradiente saltato** | Confusione su sequenza logica | "Qual è il passo precedente a questo?" | Ritorno al passo precedente + riesame |

### 5.6 Esito Esame

```
ESAME CERTIFICAZIONE
│
├── Sezione Leadership (80 domande)
│   ├── Dati Stabili: ✅/❌
│   ├── Doingness: ✅/❌
│   └── Teoria: ✅/❌
│
├── Sezione Ostacoli (80 domande)
│   ├── Dati Stabili: ✅/❌
│   ├── Doingness: ✅/❌
│   └── Teoria: ✅/❌
│
├── Sezione Microfelicità (80 domande)
│   ├── Dati Stabili: ✅/❌
│   ├── Doingness: ✅/❌
│   └── Teoria: ✅/❌
│
└── ESITO FINALE
    │
    ├── Barriere identificate?
    │   ├── SÌ → Correzione specifica → Riesame sezione
    │   └── NO → Continua
    │
    └── Tutti i livelli superati?
        ├── SÌ → ✅ CERTIFICAZIONE MENTOR
        └── NO → Identificazione gap → Piano recupero → Riesame
```

### 5.7 Certificazione Mentor

La certificazione attesta che il Mentor:
- **Comprende** i Dati Stabili di tutti e 3 i percorsi
- **Sa applicare** concretamente ogni metodologia
- **Conosce la teoria** del perché funziona
- **Non ha barriere** alla comprensione residue

---

## 6. DASHBOARD UTENTE - STRUTTURA

### 6.1 Navigazione

```
/dashboard (Home)
│
├── 📊 Overview
│   ├── Tier attuale
│   ├── Percorsi attivi/completati
│   ├── Prossimo esercizio suggerito
│   └── Statistiche rapide
│
├── 🎯 /challenges
│   └── Stato 3 challenge (se attive)
│
├── 📚 /percorsi
│   ├── /leadership (se acquistato)
│   ├── /ostacoli (se acquistato)
│   └── /microfelicita (se acquistato)
│
├── 📈 /assessment
│   ├── Assessment iniziale disponibili
│   ├── Risultati radar
│   └── Esame Certificazione (se Mentor + 3 percorsi completati)
│
├── 🤖 /ai-coach
│   └── Chat con Fernando
│
└── ⚙️ /profilo
    ├── Abbonamento
    ├── Impostazioni
    └── Certificazioni ottenute
```

### 6.2 Vista Percorso (per ciascun percorso acquistato)

```
/dashboard/percorsi/leadership
│
├── RADAR ATTUALE
│   └── Visualizzazione 24 caratteristiche / 4 pilastri
│
├── PROSSIMO ESERCIZIO (proposto da AI)
│   ├── Titolo esercizio
│   ├── Perché è rilevante per te
│   └── [Inizia Esercizio]
│
├── ESERCIZI COMPLETATI
│   ├── Lista con data completamento
│   ├── Riflessioni salvate
│   └── Valutazione personale
│
├── PROGRESSO
│   ├── % percorso completato
│   ├── Radar prima/dopo
│   └── Milestone raggiunte
│
└── [Se tutti e 3 completati + Mentor]
    └── [Accedi a Esame Certificazione]
```

---

## 7. TABELLE DATABASE AGGIUNTIVE

### 7.1 Tracciamento Percorsi

```sql
CREATE TABLE user_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  path_type TEXT NOT NULL,  -- 'leadership', 'ostacoli', 'microfelicita'
  status TEXT DEFAULT 'active',  -- 'active', 'completed', 'certified'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  exercises_completed INTEGER DEFAULT 0,
  UNIQUE(user_id, path_type)
);
```

### 7.2 Esame Certificazione

```sql
CREATE TABLE mentor_certification_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress',  -- 'in_progress', 'passed', 'needs_review'
  
  -- Punteggi per sezione
  leadership_dati_stabili DECIMAL(5,2),
  leadership_doingness DECIMAL(5,2),
  leadership_teoria DECIMAL(5,2),
  
  ostacoli_dati_stabili DECIMAL(5,2),
  ostacoli_doingness DECIMAL(5,2),
  ostacoli_teoria DECIMAL(5,2),
  
  microfelicita_dati_stabili DECIMAL(5,2),
  microfelicita_doingness DECIMAL(5,2),
  microfelicita_teoria DECIMAL(5,2),
  
  -- Barriere identificate
  barriers_found JSONB DEFAULT '[]',  -- [{type, section, details}]
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  certified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.3 Risposte Esame

```sql
CREATE TABLE mentor_exam_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES mentor_certification_exams(id) ON DELETE CASCADE,
  question_id UUID,  -- riferimento a domanda esame
  
  -- Risposta
  answer_text TEXT,
  verification_level TEXT,  -- 'dati_stabili', 'doingness', 'teoria'
  path_type TEXT,  -- 'leadership', 'ostacoli', 'microfelicita'
  
  -- Valutazione
  is_correct BOOLEAN,
  barrier_type TEXT,  -- NULL, 'parola_malcompresa', 'mancanza_concretezza', 'gradiente_saltato'
  ai_feedback TEXT,
  
  answered_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. PROSSIMI PASSI IMPLEMENTAZIONE

### 8.1 Priorità Alta
- [ ] Creare tabella `user_paths` per tracciamento percorsi
- [ ] Modificare logica AI Coach per proposta esercizi personalizzata
- [ ] Costruire dashboard percorso con radar evoluzione

### 8.2 Priorità Media
- [ ] Progettare 240 domande esame certificazione (80 × 3 percorsi)
- [ ] Implementare logica verifica barriere comprensione
- [ ] Creare flusso esame con correzione iterativa

### 8.3 Priorità Bassa
- [ ] Badge e certificazioni visuali
- [ ] Export certificazione PDF
- [ ] Sistema notifiche progresso

---

## 9. CHECKLIST CONFORMITÀ

✅ Conforme a Principio Validante  
✅ Conforme a USER_AGENCY_GUIDELINES.md  
✅ Conforme a Framework Comprensione (Trilogia Filosofica)  
✅ Assessment FULL riprogettato come Esame Certificazione  
✅ Esercizi NON sequenziali ma proposti da AI  
✅ Verifica 3 Livelli (Dati Stabili, Doingness, Teoria)  
✅ Controllo 3 Barriere Comprensione  

---

**Documento approvato:** 18 Gennaio 2026  
**Prossima revisione:** Dopo implementazione MVP  
**Owner:** Fernando Marongiu
