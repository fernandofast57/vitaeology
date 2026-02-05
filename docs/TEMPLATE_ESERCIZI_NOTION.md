# Template Esercizi Vitaeology per Notion

**Versione:** 1.0
**Data:** 5 Febbraio 2026
**Uso:** Creazione contenuti esercizi in Notion + Claude.ai

---

## INDICE

1. [Schema Completo Esercizio](#schema-completo-esercizio)
2. [Guida Campo per Campo](#guida-campo-per-campo)
3. [Esempio Esercizio Completo](#esempio-esercizio-completo)
4. [Checklist Validazione](#checklist-validazione)
5. [Principi Copy Obbligatori](#principi-copy-obbligatori)
6. [Stato Esercizi da Completare](#stato-esercizi-da-completare)

---

## SCHEMA COMPLETO ESERCIZIO

```
IDENTIFICAZIONE
├── code                    # Es: "L-F1", "R-A5", "M-M2"
├── title                   # Titolo evocativo (max 50 char)
├── subtitle                # Sottotitolo descrittivo
├── book_slug               # leadership | risolutore | microfelicita
├── level                   # fondamentale | applicazione | mentor
└── target                  # all | leader | mentor | mastermind

CATEGORIZZAZIONE
├── pillar                  # Vision | Action | Relations | Adaptation
├── exercise_type           # riconoscimento | espansione | sfida | integrazione
├── difficulty_level        # base | intermedio | avanzato
├── quarter                 # Q1 | Q2 | Q3 | Q4
├── estimated_time_minutes  # 15-45
└── dimension_code          # Per Risolutore/Microfelicità (es: FP, FS, FR)

PREVENZIONE 3 BARRIERE
├── glossary[]              # Termini con definizione + esempio
├── concrete_examples[]     # Situazioni riconoscibili + applicazione
└── prerequisites[]         # Cosa deve già sapere l'utente

LIVELLO 1: DATI STABILI (COSA)
└── key_concepts[]          # Concetto + definizione + why_important

LIVELLO 2: DOINGNESS (COME)
├── intro_validante         # PRESUME capacità esistente
├── phase_1_recognition     # ESSERE - Chi eri quando...
├── phase_2_pattern         # FARE - Cosa facevi...
├── phase_3_expansion       # AVERE - Come ricreare...
└── deliverable             # Output tangibile richiesto

LIVELLO 3: TEORIA (PERCHÉ)
└── why_it_works            # Principio + spiegazione + base scientifica

VERIFICA E SUPPORTO
├── reflection_prompts[]    # Domande per 3 livelli comprensione
├── failure_response        # Risposta validante se non completa
└── ai_coach_hints[]        # Suggerimenti per AI Coach Fernando
```

---

## GUIDA CAMPO PER CAMPO

### IDENTIFICAZIONE

#### `code`
Formato: `[LIBRO]-[LIVELLO][NUMERO]`
- **L** = Leadership, **R** = Risolutore, **M** = Microfelicità
- **F** = Fondamentale, **A** = Applicazione, **M** = Mentor

Esempi:
- `L-F1` = Leadership Fondamentale 1
- `R-A5` = Risolutore Applicazione 5
- `M-M2` = Microfelicità Mentor 2

#### `title`
- Max 50 caratteri
- Evocativo, non descrittivo
- Usa metafore o immagini

```
❌ "Esercizio sull'autoconsapevolezza"
✅ "Lo Specchio del Leader"

❌ "Come riconoscere i pattern"
✅ "Il Detective dei Pattern"
```

#### `subtitle`
- Esplicita il concetto
- Max 60 caratteri
- Collega al libro/framework

```
Esempio: "Riconosci dove già usi l'autoconsapevolezza"
```

---

### PREVENZIONE 3 BARRIERE

#### `glossary[]`
Per ogni termine non comune:

```json
{
  "term": "Autoconsapevolezza",
  "definition": "La capacità di osservare te stesso mentre agisci",
  "example": "Quando guidi e ti accorgi di star pensando ad altro - quel momento di 'accorgerti' È autoconsapevolezza"
}
```

**Regole:**
- Definizione in linguaggio quotidiano
- Esempio dalla vita dell'imprenditore
- 2-5 termini per esercizio

#### `concrete_examples[]`
Situazioni che l'imprenditore riconosce:

```json
{
  "situation": "Sei in una riunione tesa e noti che ti stai irrigidendo",
  "application": "Il fatto stesso di NOTARE che ti stai irrigidendo è autoconsapevolezza in azione"
}
```

**Regole:**
- 2-3 esempi per esercizio
- Situazioni specifiche, non generiche
- Collegamento diretto al concetto

#### `prerequisites[]`
Lista di cosa l'utente deve già sapere:

```json
["Aver completato L-F1: I 4 Pilastri"]
```

- Vuoto per esercizi base
- Max 2 prerequisiti

---

### LIVELLO 1: DATI STABILI

#### `key_concepts[]`
I concetti fondamentali dell'esercizio:

```json
{
  "concept": "L'attenzione crea scelta",
  "definition": "Quando noti cosa stai facendo, puoi scegliere se continuare o cambiare",
  "why_important": "Senza notare, reagisci automaticamente. Notando, hai opzioni."
}
```

**Regole:**
- 2-4 concetti per esercizio
- Ogni concetto deve essere testabile ("Cos'è X?")
- `why_important` spiega il valore pratico

---

### LIVELLO 2: DOINGNESS

#### `intro_validante`
**CRITICO** - Deve PRESUMERE che l'utente già possiede la capacità.

```
❌ "Questo esercizio ti insegnerà l'autoconsapevolezza"
❌ "Molti leader non hanno questa capacità"
❌ "Devi sviluppare questa skill"

✅ "Probabilmente prendi decisioni importanti ogni settimana senza chiamarle 'leadership'. Questo esercizio ti aiuta a RICONOSCERE la consapevolezza che già operi naturalmente."
```

**Struttura:**
1. Riconosci cosa già fa
2. Spiega cosa farà l'esercizio
3. Enfatizza RICONOSCIMENTO non ACQUISIZIONE

#### `phase_1_recognition` (ESSERE)
Chi era l'utente quando operava questa capacità:

```json
{
  "title": "Riconoscimento - Chi Eri",
  "being_focus": "L'identità di chi osserva se stesso",
  "prompt": "Ricorda 3 decisioni importanti dell'ultimo anno. Per ognuna: come ti sentivi DURANTE?",
  "instructions": [
    "Trova un momento tranquillo di 10 minuti",
    "Scrivi 3 decisioni importanti dell'ultimo anno",
    "Per ogni decisione, nota l'emozione che provavi MENTRE decidevi",
    "Non giudicare se erano 'giuste' - osserva solo l'esperienza"
  ]
}
```

#### `phase_2_pattern` (FARE)
Cosa faceva quando la capacità operava:

```json
{
  "title": "Pattern - Cosa Facevi",
  "doing_focus": "Le condizioni che favorivano la consapevolezza",
  "prompt": "Cerca il pattern comune tra quei momenti",
  "guiding_questions": [
    "Eri solo o con altri?",
    "Era mattina, pomeriggio o sera?",
    "Eri in fretta o avevi calma?",
    "Dove ti trovavi fisicamente?"
  ]
}
```

#### `phase_3_expansion` (AVERE)
Come ricreare intenzionalmente:

```json
{
  "title": "Espansione - Come Ricreare",
  "having_focus": "La capacità di ricreare quelle condizioni intenzionalmente",
  "prompt": "Come puoi ricreare quelle condizioni quando serve?",
  "action_steps": [
    "Scegli UNA condizione che puoi replicare facilmente",
    "Identifica UNA situazione della prossima settimana dove la userai",
    "Scrivi un promemoria per ricordarti"
  ]
}
```

#### `deliverable`
Output tangibile che dimostra completamento:

```
"Documento con: 3 decisioni + emozioni durante + pattern comune + 1 condizione da replicare + 1 situazione dove la userai"
```

**Regole:**
- Specifico e misurabile
- Include tutti i componenti delle 3 fasi
- L'utente sa esattamente cosa produrre

---

### LIVELLO 3: TEORIA

#### `why_it_works`
Spiega il PERCHÉ funziona:

```json
{
  "principle": "L'attenzione crea scelta",
  "explanation": "Quando noti cosa stai facendo, puoi scegliere se continuare o cambiare. Senza notare, reagisci automaticamente. L'autoconsapevolezza trasforma reazioni automatiche in scelte consapevoli.",
  "scientific_basis": "Metacognizione - la capacità del cervello di osservare i propri processi mentali"
}
```

---

### VERIFICA E SUPPORTO

#### `reflection_prompts[]`
Una domanda per ogni livello di comprensione:

```json
[
  {
    "level": "dati_stabili",
    "question": "Con parole tue, cos'è l'autoconsapevolezza?"
  },
  {
    "level": "doingness",
    "question": "Descrivi i passi che hai seguito per identificare il tuo pattern"
  },
  {
    "level": "teoria",
    "question": "Perché notare cosa fai ti dà più potere di scelta?"
  }
]
```

#### `failure_response`
Risposta VALIDANTE se l'utente non completa:

```
❌ "Non hai fatto l'esercizio correttamente"
❌ "Devi impegnarti di più"

✅ "Forse stai cercando decisioni 'grandi'. Prova con decisioni più piccole ma comunque significative per te - anche scegliere di NON decidere è una decisione."
```

**Regole:**
- Mai giudicante
- Offre prospettiva alternativa
- Mantiene agency dell'utente

#### `ai_coach_hints[]`
Suggerimenti per Fernando AI:

```json
[
  "Se l'utente fatica a trovare decisioni, suggerisci: assunzioni, licenziamenti, investimenti, cambio fornitori",
  "Se l'utente non trova pattern, aiutalo a cercare: luogo fisico, ora del giorno, stato emotivo pre-decisione"
]
```

---

## ESEMPIO ESERCIZIO COMPLETO

```json
{
  "code": "L-F2",
  "title": "La Consapevolezza che Già Operi",
  "subtitle": "Riconosci dove già usi l'autoconsapevolezza",
  "book_slug": "leadership",
  "level": "fondamentale",
  "target": "all",

  "pillar": "Vision",
  "exercise_type": "riconoscimento",
  "difficulty_level": "base",
  "quarter": "Q1",
  "estimated_time_minutes": 25,

  "glossary": [
    {
      "term": "Autoconsapevolezza",
      "definition": "La capacità di osservare te stesso mentre agisci, come se ti guardassi dall'esterno",
      "example": "Quando guidi e ti accorgi di star pensando ad altro - quel momento di 'accorgerti' È autoconsapevolezza"
    }
  ],

  "concrete_examples": [
    {
      "situation": "Sei in una riunione tesa e noti che ti stai irrigidendo",
      "application": "Il fatto stesso di NOTARE che ti stai irrigidendo è autoconsapevolezza in azione"
    },
    {
      "situation": "Stai per rispondere a un'email irritante e ti fermi",
      "application": "Quel momento di pausa prima di reagire è autoconsapevolezza operativa"
    }
  ],

  "prerequisites": [],

  "key_concepts": [
    {
      "concept": "Autoconsapevolezza",
      "definition": "Vedere te stesso mentre operi",
      "why_important": "Senza vedere cosa fai, non puoi scegliere di cambiarlo"
    },
    {
      "concept": "L'attenzione crea scelta",
      "definition": "Notare = poter scegliere; Non notare = reagire automaticamente",
      "why_important": "Trasforma reazioni in decisioni"
    }
  ],

  "intro_validante": "Probabilmente prendi decisioni importanti ogni settimana senza chiamarle 'leadership'. Questo esercizio ti aiuta a RICONOSCERE la consapevolezza che già operi naturalmente - non a sviluppare qualcosa che ti manca.",

  "phase_1_recognition": {
    "title": "Riconoscimento - Chi Eri",
    "being_focus": "L'identità di chi osserva se stesso",
    "prompt": "Ricorda 3 decisioni importanti dell'ultimo anno. Per ognuna: come ti sentivi DURANTE?",
    "instructions": [
      "Trova un momento tranquillo di 10 minuti",
      "Scrivi 3 decisioni importanti dell'ultimo anno",
      "Per ogni decisione, nota l'emozione che provavi MENTRE decidevi",
      "Non giudicare se erano 'giuste' - osserva solo l'esperienza"
    ]
  },

  "phase_2_pattern": {
    "title": "Pattern - Cosa Facevi",
    "doing_focus": "Le condizioni che favorivano la consapevolezza",
    "prompt": "Cerca il pattern comune tra quei momenti",
    "guiding_questions": [
      "Eri solo o con altri?",
      "Era mattina, pomeriggio o sera?",
      "Eri in fretta o avevi calma?",
      "Dove ti trovavi fisicamente?"
    ]
  },

  "phase_3_expansion": {
    "title": "Espansione - Come Ricreare",
    "having_focus": "La capacità di ricreare quelle condizioni intenzionalmente",
    "prompt": "Come puoi ricreare quelle condizioni quando serve?",
    "action_steps": [
      "Scegli UNA condizione che puoi replicare facilmente",
      "Identifica UNA situazione della prossima settimana dove la userai",
      "Scrivi un promemoria per ricordarti"
    ]
  },

  "deliverable": "Documento con: 3 decisioni + emozioni durante + pattern comune + 1 condizione da replicare + 1 situazione dove la userai",

  "why_it_works": {
    "principle": "L'attenzione crea scelta",
    "explanation": "Quando noti cosa stai facendo, puoi scegliere se continuare o cambiare. Senza notare, reagisci automaticamente. L'autoconsapevolezza trasforma reazioni automatiche in scelte consapevoli.",
    "scientific_basis": "Metacognizione - la capacità del cervello di osservare i propri processi mentali"
  },

  "reflection_prompts": [
    {
      "level": "dati_stabili",
      "question": "Con parole tue, cos'è l'autoconsapevolezza?"
    },
    {
      "level": "doingness",
      "question": "Descrivi i passi che hai seguito per identificare il tuo pattern"
    },
    {
      "level": "teoria",
      "question": "Perché notare cosa fai ti dà più potere di scelta?"
    }
  ],

  "failure_response": "Forse stai cercando decisioni 'grandi'. Prova con decisioni più piccole ma comunque significative per te - anche scegliere di NON decidere è una decisione.",

  "ai_coach_hints": [
    "Se l'utente fatica a trovare decisioni, suggerisci: assunzioni, licenziamenti, investimenti, cambio fornitori",
    "Se l'utente non trova pattern, aiutalo a cercare: luogo fisico, ora del giorno, stato emotivo pre-decisione"
  ]
}
```

---

## CHECKLIST VALIDAZIONE

Prima di considerare un esercizio completo:

### Prevenzione Barriere
- [ ] **Glossary**: Tutti i termini non comuni hanno definizione + esempio?
- [ ] **Concrete examples**: Ci sono almeno 2 situazioni riconoscibili dall'imprenditore?
- [ ] **Prerequisites**: È chiaro cosa l'utente deve già sapere?

### Livello 1 - Dati Stabili
- [ ] **Key concepts**: Ogni concetto ha definizione + why_important?
- [ ] L'utente saprà rispondere a "Cos'è [X]?"

### Livello 2 - Doingness
- [ ] **Intro validante**: Presume capacità esistente? (MAI deficit!)
- [ ] **Phase 1-2-3**: Tutte e 3 le fasi sono complete?
- [ ] **Instructions/steps**: Sono concreti e sequenziali?
- [ ] **Deliverable**: È specifico e misurabile?
- [ ] L'utente saprà rispondere a "Come si fa [X]?"

### Livello 3 - Teoria
- [ ] **Why it works**: C'è principle + explanation?
- [ ] L'utente saprà rispondere a "Perché funziona [X]?"

### Verifica Comprensione
- [ ] **Reflection prompts**: Ci sono domande per tutti e 3 i livelli?

### Linguaggio
- [ ] **Intro**: Presume capacità esistente (mai deficit)?
- [ ] **Failure response**: È validante (non giudicante)?
- [ ] **Nessun "devi"**: Sostituito con "puoi", "potresti"?
- [ ] **Nessun "ti manca"**: Sostituito con "potresti non aver ancora riconosciuto"?

---

## PRINCIPI COPY OBBLIGATORI

### 1. Principio Validante (AVERE vs ESSERE/FARE)

```
✅ AVERE: "Hai già...", "Possiedi...", "Puoi scegliere di..."
❌ ESSERE: "Sei/Non sei...", "Devi essere..."
❌ FARE: "Fai/Non fai...", "Devi fare..."
❌ DEFICIT: "Ti manca...", "Non hai..."
```

### 2. User Agency

```
✅ "Potresti considerare..."
✅ "Un'opzione è..."
✅ "Se lo desideri..."
❌ "Devi fare..."
❌ "È necessario che tu..."
```

### 3. Linguaggio Proibito

| ❌ Proibito | ✅ Alternativa |
|-------------|----------------|
| "per caso" | "senza direzione consapevole" |
| "ti manca" | "potresti non aver ancora riconosciuto" |
| "devi" | "puoi", "potresti" |
| "Complimenti!" | (rimuovere) |
| "Bravo!" | (rimuovere) |
| "Non sei capace" | "questa capacità è ancora da esplorare" |

### 4. Entry Point -7 (Rovina)

L'utente arriva spesso da uno stato di frustrazione. Il copy deve:
1. **VALIDARE** lo stato ("Riconosco cosa stai provando")
2. **MAI diagnosticare** ("Il tuo problema è...")
3. **RICONOSCERE** capacità esistenti
4. **APRIRE** possibilità senza prescrivere

---

## STATO ESERCIZI DA COMPLETARE

### Leadership (64 totali)

| Tipo | Quantità | Stato | Note |
|------|----------|-------|------|
| Fondamentali | 4 | ✅ COMPLETI | Schema completo |
| Applicazione | 52 | ⚠️ MEDIO | Hanno phase_1/2/3 ma mancano glossary, why_it_works |
| Mentor | 8 | ❓ DA VERIFICARE | — |

### Risolutore (31 totali)

| Tipo | Quantità | Stato | Note |
|------|----------|-------|------|
| Fondamentali | 4 | ❌ DA CREARE | — |
| Applicazione | 24 | ⚠️ BASICO | Solo instructions + deliverable |
| Mentor | 3 | ❌ DA CREARE | — |

**Dimensioni Risolutore (per mapping):**
- FP: Detective dei Pattern (PENSARE)
- FS: Antenna dei Segnali (SENTIRE)
- FR: Inventario Risorse (AVERE)
- RP: Riframing del Problema
- RC: Cicli di Conseguenze
- RV: Verifica delle Ipotesi
- RA: Azione Incrementale

### Microfelicità (31 totali)

| Tipo | Quantità | Stato | Note |
|------|----------|-------|------|
| Fondamentali | 4 | ❌ DA CREARE | — |
| Applicazione | 24 | ⚠️ BASICO | Solo instructions + deliverable |
| Mentor | 3 | ❌ DA CREARE | — |

**Dimensioni Microfelicità (R.A.D.A.R.):**
- R1: Riconoscimento (notare)
- A1: Ancoraggio (fissare)
- D: Disconnessione (staccare)
- A2: Attivazione (creare)
- R2: Riconnessione (integrare)

---

## WORKFLOW NOTION

### Struttura Database Consigliata

```
Notion Database: Esercizi Vitaeology
├── Properties
│   ├── Code (Title)
│   ├── Title (Text)
│   ├── Book (Select: leadership, risolutore, microfelicita)
│   ├── Level (Select: fondamentale, applicazione, mentor)
│   ├── Status (Select: Da fare, In corso, Review, Completo)
│   ├── Pillar (Select: Vision, Action, Relations, Adaptation)
│   ├── Difficulty (Select: base, intermedio, avanzato)
│   └── Dimension Code (Text - per Risolutore/Microfelicità)
│
└── Page Content
    ├── Identificazione
    ├── Glossary (Toggle)
    ├── Concrete Examples (Toggle)
    ├── Key Concepts (Toggle)
    ├── Intro Validante (Text)
    ├── Phase 1: Recognition (Toggle)
    ├── Phase 2: Pattern (Toggle)
    ├── Phase 3: Expansion (Toggle)
    ├── Deliverable (Text)
    ├── Why It Works (Toggle)
    ├── Reflection Prompts (Toggle)
    ├── Failure Response (Text)
    └── AI Coach Hints (Toggle)
```

### Processo di Creazione

1. **Setup**: Crea database Notion con properties
2. **Import**: Importa esercizi esistenti (quelli basici)
3. **Espansione**: Per ogni esercizio, completa i campi mancanti
4. **Review**: Usa checklist validazione
5. **Export**: Esporta JSON per import nel database

---

## OUTPUT FINALE

Quando tutti gli esercizi sono completi, esporta da Notion come JSON e importa nel database Supabase usando:

```bash
node scripts/import-exercises-from-notion.js exercises.json
```

(Script da creare quando pronti)
