# Specifica di Produzione Esercizi Vitaeology

**Versione:** 2.0
**Data:** 5 Febbraio 2026
**Scopo:** Riferimento vincolante per la produzione, validazione e inserimento degli esercizi

---

## IL TEAM E IL FLUSSO

```
FERNANDO (Decisore)
    │
    │ 1. Richiede esercizio o approva/corregge
    │
CLAUDE.AI (Produzione Contenuto)
    │
    │ 2. Produce l'esercizio completo in JSON
    │    seguendo questa specifica
    │
    │ 3. Presenta a Fernando per approvazione
    │
FERNANDO (Approvazione)
    │
    │ 4. Approva ✅ oppure chiede modifiche 🔄
    │
CLAUDE CODE (Esecuzione Tecnica)
    │
    │ 5. Scrive l'esercizio approvato
    │    direttamente in Supabase
    │
PIATTAFORMA → L'utente lo vede
```

**Regola fondamentale:** Nessun passaggio intermedio, nessun tool aggiuntivo, nessun export/import. Tre attori, un flusso lineare, un database di destinazione.

---

## INDICE

1. [Schema Completo Esercizio](#schema-completo-esercizio)
2. [Guida Campo per Campo](#guida-campo-per-campo)
3. [Esempio Esercizio Completo](#esempio-esercizio-completo)
4. [Checklist Validazione](#checklist-validazione)
5. [Principi Copy Obbligatori](#principi-copy-obbligatori)
6. [Priorità di Completamento](#priorità-di-completamento)
7. [Stato Esercizi da Completare](#stato-esercizi-da-completare)
8. [Procedura Operativa](#procedura-operativa)

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

ACCOGLIENZA
└── first_contact_tone      # Come accogli chi arriva in difficoltà

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
├── failure_responses[]     # Risposte validanti per tipo di blocco
└── ai_coach_context        # Suggerimenti + riferimenti knowledge base
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

### ACCOGLIENZA

#### `first_contact_tone`

Chi arriva a un esercizio potrebbe portare con sé frustrazione, stanchezza, o la sensazione di non farcela. La prima frase che legge deve farlo sentire nel posto giusto, non sotto esame.

```json
{
  "emotional_acknowledgment": "Frase che riconosce lo stato possibile senza diagnosticarlo",
  "immediate_reframe": "Frase che sposta l'attenzione su ciò che già possiede",
  "opening_warmth": "Tono della prima riga — accogliente, non clinico"
}
```

**Esempio:**

```json
{
  "emotional_acknowledgment": "Se arrivi a questo esercizio dopo una giornata pesante, sappi che è il momento giusto.",
  "immediate_reframe": "Il fatto che tu sia qui dice qualcosa sulla tua capacità di cercare risposte — e questa È già una capacità.",
  "opening_warmth": "Nessun esame, nessun voto. Solo uno spazio per riconoscere quello che fai già."
}
```

**Domanda guida per chi compila:**
> "Se questa persona ha appena avuto la peggior giornata del mese, la prima frase che legge la fa sentire riconosciuta o giudicata?"

**Regole:**
- Mai diagnosticare ("Il tuo problema è...")
- Mai sminuire ("Vedrai che non è niente")
- Riconoscere senza amplificare
- Aprire possibilità senza prescrivere

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

#### `failure_responses[]`

Risposte VALIDANTI per tipo di blocco. L'utente può fermarsi per ragioni diverse — la risposta deve incontrarlo là dove si trova.

```json
[
  {
    "block_type": "non_comprende",
    "signal": "L'utente chiede di rispiegare o dà risposte non pertinenti",
    "response": "Proviamo con un esempio diverso. Pensa all'ultima volta che hai cambiato idea su qualcosa durante una riunione — cos'è successo dentro di te in quel momento?",
    "strategy": "Semplifica e offri un aggancio concreto diverso"
  },
  {
    "block_type": "non_trova_esempi",
    "signal": "L'utente dice 'non mi viene in mente nulla' o resta in bianco",
    "response": "Forse stai cercando decisioni 'grandi'. Prova con scelte più piccole ma comunque significative — anche scegliere di NON decidere è una decisione.",
    "strategy": "Abbassa la soglia e allarga il campo"
  },
  {
    "block_type": "si_sente_inadeguato",
    "signal": "L'utente dice 'non sono capace' o si scusa per non riuscire",
    "response": "Il fatto che tu stia riflettendo su questo è già la capacità in azione. Non c'è un modo sbagliato di fare questo esercizio — c'è solo il tuo modo.",
    "strategy": "Valida lo sforzo come prova della capacità stessa"
  },
  {
    "block_type": "abbandono_parziale",
    "signal": "L'utente completa solo una parte e si ferma",
    "response": "Quello che hai fatto finora ha già valore. Puoi tornare quando vuoi — il tuo lavoro resta qui.",
    "strategy": "Riconosci il parziale come valido, mantieni la porta aperta"
  }
]
```

#### `ai_coach_context`

Contesto operativo per Fernando AI — suggerimenti pratici con riferimenti ai contenuti della knowledge base per il RAG.

```json
{
  "coaching_hints": [
    "Se l'utente fatica a trovare decisioni, suggerisci: assunzioni, licenziamenti, investimenti, cambio fornitori",
    "Se l'utente non trova pattern, aiutalo a cercare: luogo fisico, ora del giorno, stato emotivo pre-decisione"
  ],
  "related_knowledge_refs": [
    {
      "source": "leadership",
      "chapter": "Cap. 3 - Autoconsapevolezza",
      "key_passages": ["Il leader che si osserva", "Decisioni sotto pressione"],
      "use_when": "L'utente chiede 'perché è importante?' o cerca fondamento teorico"
    }
  ],
  "biographical_episodes": [
    {
      "episode_ref": "Decisione apertura secondo stabilimento 1987",
      "use_when": "L'utente chiede un esempio reale di autoconsapevolezza sotto pressione"
    }
  ]
}
```

**Regole per `related_knowledge_refs`:**
- 1-3 riferimenti per esercizio
- Ogni riferimento ha un `use_when` che spiega QUANDO il coach deve richiamarlo
- `key_passages` contiene termini di ricerca per il RAG
- `biographical_episodes` collega a episodi reali di Fernando — solo quando l'utente ne trarrebbe beneficio

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

  "first_contact_tone": {
    "emotional_acknowledgment": "Se arrivi qui dopo una di quelle giornate in cui tutto sembra urgente e niente sembra chiaro, sei nel posto giusto.",
    "immediate_reframe": "Il fatto che tu ti stia fermando a riflettere, mentre tutto intorno accelera, dice qualcosa di importante su di te.",
    "opening_warmth": "Nessun test, nessun voto. Solo uno spazio per guardare con calma quello che già fai ogni giorno."
  },

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

  "failure_responses": [
    {
      "block_type": "non_comprende",
      "signal": "L'utente chiede di rispiegare o dà risposte non pertinenti",
      "response": "Proviamo con un esempio diverso. Pensa all'ultima volta che hai cambiato idea su qualcosa durante una riunione — cos'è successo dentro di te in quel momento?",
      "strategy": "Semplifica e offri un aggancio concreto diverso"
    },
    {
      "block_type": "non_trova_esempi",
      "signal": "L'utente dice 'non mi viene in mente nulla' o resta in bianco",
      "response": "Forse stai cercando decisioni 'grandi'. Prova con scelte più piccole ma comunque significative — anche scegliere di NON decidere è una decisione.",
      "strategy": "Abbassa la soglia e allarga il campo"
    },
    {
      "block_type": "si_sente_inadeguato",
      "signal": "L'utente dice 'non sono capace' o si scusa per non riuscire",
      "response": "Il fatto che tu stia riflettendo su questo è già la capacità in azione. Non c'è un modo sbagliato di fare questo esercizio — c'è solo il tuo modo.",
      "strategy": "Valida lo sforzo come prova della capacità stessa"
    },
    {
      "block_type": "abbandono_parziale",
      "signal": "L'utente completa solo una parte e si ferma",
      "response": "Quello che hai fatto finora ha già valore. Puoi tornare quando vuoi — il tuo lavoro resta qui.",
      "strategy": "Riconosci il parziale come valido, mantieni la porta aperta"
    }
  ],

  "ai_coach_context": {
    "coaching_hints": [
      "Se l'utente fatica a trovare decisioni, suggerisci: assunzioni, licenziamenti, investimenti, cambio fornitori",
      "Se l'utente non trova pattern, aiutalo a cercare: luogo fisico, ora del giorno, stato emotivo pre-decisione"
    ],
    "related_knowledge_refs": [
      {
        "source": "leadership",
        "chapter": "Cap. 3 - Autoconsapevolezza",
        "key_passages": ["Il leader che si osserva", "Decisioni sotto pressione"],
        "use_when": "L'utente chiede 'perché è importante?' o cerca fondamento teorico"
      },
      {
        "source": "leadership",
        "chapter": "Cap. 1 - I 4 Pilastri",
        "key_passages": ["Vision come primo pilastro"],
        "use_when": "L'utente vuole capire dove si colloca questo esercizio nel percorso"
      }
    ],
    "biographical_episodes": [
      {
        "episode_ref": "Decisione apertura secondo stabilimento 1987",
        "use_when": "L'utente chiede un esempio reale di autoconsapevolezza sotto pressione"
      }
    ]
  }
}
```

---

## CHECKLIST VALIDAZIONE

Fernando usa questa checklist prima di dare il ✅ a un esercizio.

### Prevenzione Barriere
- [ ] **Glossary**: Tutti i termini non comuni hanno definizione + esempio?
- [ ] **Concrete examples**: Ci sono almeno 2 situazioni riconoscibili dall'imprenditore?
- [ ] **Prerequisites**: È chiaro cosa l'utente deve già sapere?

### Accoglienza
- [ ] **First contact tone**: C'è emotional_acknowledgment + immediate_reframe + opening_warmth?
- [ ] La prima frase accoglie chi arriva in difficoltà senza diagnosticare?
- [ ] Il tono apre possibilità senza prescrivere?

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

### Supporto Blocchi
- [ ] **Failure responses**: Ci sono risposte per almeno 3 dei 4 tipi di blocco?
- [ ] Ogni risposta è validante (non giudicante)?

### Contesto AI Coach
- [ ] **Knowledge refs**: Ci sono 1-3 riferimenti alla knowledge base con `use_when`?
- [ ] **Biographical episodes**: C'è almeno 1 episodio collegato (dove pertinente)?

### Linguaggio
- [ ] **Intro**: Presume capacità esistente (mai deficit)?
- [ ] **Nessun "devi"**: Sostituito con "puoi", "potresti"?
- [ ] **Nessun "ti manca"**: Sostituito con "potresti non aver ancora riconosciuto"?
- [ ] **Nessun "per caso"**: Sostituito con "senza direzione consapevole"?

---

## PRINCIPI COPY OBBLIGATORI

### 1. Principio Validante (AVERE vs ESSERE/FARE)

```
✅ AVERE: "Hai già...", "Possiedi...", "Puoi scegliere di..."
❌ ESSERE: "Sei/Non sei...", "Devi essere..."
❌ FARE: "Fai/Non fai...", "Devi fare..."
❌ DEFICIT: "Ti manca...", "Non hai..."
```

L'enfasi è sempre sulla possibilità di AVERE. La libertà non sta solo nell'avere, ma nella possibilità stessa di avere o non avere. Questo è ciò che distingue Vitaeology da approcci che giudicano l'identità o il comportamento.

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

### 4. Accoglienza di chi arriva in difficoltà

L'utente arriva spesso da uno stato di frustrazione, stanchezza o senso di inadeguatezza. Il copy deve:
1. **VALIDARE** lo stato ("Riconosco cosa stai attraversando")
2. **MAI diagnosticare** ("Il tuo problema è...")
3. **RICONOSCERE** capacità esistenti, anche nel semplice atto di cercare
4. **APRIRE** possibilità senza prescrivere

---

## PRIORITÀ DI COMPLETAMENTO

L'ordine segue il percorso dell'utente: ciò che incontra per primo deve essere impeccabile per primo.

### Priorità 1 — Q1 Leadership (lancio aprile 2026)
Primi esercizi che l'utente tocca. TUTTI i campi completi. Se l'esperienza al primo esercizio è scadente, non arriva al secondo.

```
Fondamentali L-F1 → L-F4     (4 esercizi)
Applicazione Q1               (13 esercizi)
```

### Priorità 2 — Q1 Risolutore e Microfelicità
Chi completa la Challenge e sceglie un percorso. Pronti e completi.

```
Fondamentali R-F1 → R-F4      (4 esercizi)
Fondamentali M-F1 → M-F4      (4 esercizi)
Applicazione Q1 di entrambi   (~12 esercizi)
```

### Priorità 3 — Q2-Q4 e Mentor
L'utente li incontra dopo settimane o mesi. Completabili progressivamente.

```
Leadership Applicazione Q2-Q4  (39 esercizi)
Leadership Mentor              (8 esercizi)
Risolutore/Microfelicità Q2+   (42 esercizi)
Mentor Risolutore/Microfelicità (6 esercizi)
```

**Regola operativa:** Ogni sessione di lavoro inizia dalla Priorità attiva più alta che ha ancora esercizi incompleti.

---

## STATO ESERCIZI DA COMPLETARE

### Leadership (64 totali)

| Tipo | Quantità | Stato | Campi Mancanti |
|------|----------|-------|----------------|
| Fondamentali | 4 | ✅ COMPLETI | — |
| Applicazione | 52 | ⚠️ MEDIO | glossary, why_it_works, first_contact_tone, failure_responses tipizzate, ai_coach_context |
| Mentor | 8 | ❓ DA VERIFICARE | — |

### Risolutore (31 totali)

| Tipo | Quantità | Stato | Campi Mancanti |
|------|----------|-------|----------------|
| Fondamentali | 4 | ❌ DA CREARE | Tutti |
| Applicazione | 24 | ⚠️ BASICO | Hanno solo instructions + deliverable |
| Mentor | 3 | ❌ DA CREARE | Tutti |

**Dimensioni Risolutore:**
- FP: Detective dei Pattern (PENSARE)
- FS: Antenna dei Segnali (SENTIRE)
- FR: Inventario Risorse (AVERE)
- RP: Riframing del Problema
- RC: Cicli di Conseguenze
- RV: Verifica delle Ipotesi
- RA: Azione Incrementale

### Microfelicità (31 totali)

| Tipo | Quantità | Stato | Campi Mancanti |
|------|----------|-------|----------------|
| Fondamentali | 4 | ❌ DA CREARE | Tutti |
| Applicazione | 24 | ⚠️ BASICO | Hanno solo instructions + deliverable |
| Mentor | 3 | ❌ DA CREARE | Tutti |

**Dimensioni Microfelicità (R.A.D.A.R.):**
- R1: Riconoscimento (notare)
- A1: Ancoraggio (fissare)
- D: Disconnessione (staccare)
- A2: Attivazione (creare)
- R2: Riconnessione (integrare)

---

## PROCEDURA OPERATIVA

### Come si produce un esercizio

**Fernando dice:**
> "Completami L-A3" oppure "Crea R-F1 basato su [indicazioni]"

**Claude.ai:**
1. Consulta questa specifica
2. Consulta il libro di riferimento (knowledge base)
3. Produce l'esercizio completo in JSON
4. Lo presenta a Fernando con la checklist compilata

**Fernando:**
- Legge l'esercizio
- Verifica i punti critici (intro validante, linguaggio, accoglienza)
- Approva ✅ oppure chiede modifiche 🔄

**Claude Code (dopo approvazione):**
- Riceve il JSON approvato
- Esegue l'inserimento in Supabase
- Conferma l'avvenuta scrittura

### Come si chiede una sessione di lavoro

```
"Sessione esercizi P1: completiamo i prossimi 3 della lista"
```

Claude.ai verifica lo stato, identifica i 3 esercizi P1 incompleti successivi, li produce uno alla volta, attende approvazione per ciascuno.

### Come si passa il lavoro a Claude Code

Dopo approvazione, Fernando apre Claude Code e dice:

```
"Inserisci in Supabase l'esercizio L-A3 approvato. Il JSON è questo: [incolla]"
```

Oppure, se gli esercizi approvati sono stati salvati in un file:

```
"Inserisci in Supabase tutti gli esercizi approvati dal file exercises-approved.json"
```

---

## CHANGELOG

| Versione | Data | Modifiche |
|----------|------|-----------|
| 1.0 | 05/02/2026 | Versione iniziale (con workflow Notion) |
| 1.1 | 05/02/2026 | Aggiunti first_contact_tone, failure_responses tipizzate, ai_coach_context, priorità |
| 2.0 | 05/02/2026 | Rimosso Notion. Flusso diretto: Claude.ai → Fernando → Claude Code → Supabase. Aggiunta Procedura Operativa. Rinominato in "Specifica di Produzione" |
