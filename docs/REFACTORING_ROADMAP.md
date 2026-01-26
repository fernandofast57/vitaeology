# Refactoring Roadmap - Vitaeology

**Creato:** 26 Gennaio 2026
**Target:** Marzo 2026
**Prerequisiti:** Health Monitoring attivo, Test 100 click completato

---

## Priorità Refactoring

| Priorità | Componente | Righe | Rischio | Dipendenze |
|----------|------------|-------|---------|------------|
| 1 | ChatWidget.tsx | 1037 | ALTO | Prodotto core |
| 2 | exercise-recommendation.ts | 951 | MEDIO | AI Coach |
| 3 | challenge-day-templates.ts | 1020 | BASSO | Email system |

---

## 1. ChatWidget.tsx - Struttura Attuale

### Overview
- **File:** `src/components/ai-coach/ChatWidget.tsx`
- **Righe:** 1037
- **Complessità:** ALTA (20+ state variables, 10+ useCallback/useEffect)

### Componenti Logici Interni

```
ChatWidget (1037 righe)
├── ThinkingIndicator (linee 10-54)
│   └── Indicatore animato "Fernando sta pensando..."
│
├── State Management (linee 78-103)
│   ├── UI States: isOpen, isLoading, sidebarOpen, isMobileMenuOpen
│   ├── Message States: messages, input, sessionId
│   ├── Feedback States: feedbackLoading, starRatingMessageId, starHoverValue
│   ├── Edit States: editingMessageIndex, editContent, isSubmittingEdit
│   └── Refs: messagesEndRef, editTextareaRef, lastAssistantTimestamp
│
├── Data Fetching (linee 113-224)
│   ├── loadConversationHistory() - Carica cronologia iniziale
│   └── loadSessionMessages() - Carica sessione specifica
│
├── Signal Tracking (linee 249-296)
│   ├── recordSignal() - Registra segnali impliciti
│   └── beforeunload handler - Traccia abbandono
│
├── Feedback System (linee 298-366)
│   ├── sendFeedback() - Thumbs up/down
│   └── sendStarRating() - Valutazione 1-5 stelle
│
├── Message Editing (linee 368-493)
│   ├── isMessageEditable() - Verifica se modificabile
│   ├── startEditing() / cancelEditing()
│   ├── handleEditSubmit() - Invia modifica
│   └── handleEditKeyDown() - Keyboard shortcuts
│
├── Reformulation (linee 495-541)
│   └── handleReformulate() - Riformula risposta AI
│
├── Send Message (linee 543-624)
│   └── sendMessage() - Invio messaggio principale
│
└── Render (linee 633-1037)
    ├── Closed State - FAB button (linee 633-656)
    ├── Mobile Sidebar Overlay (linee 660-679)
    ├── Main Container (linee 681-1034)
    │   ├── Desktop Sidebar (linee 686-694)
    │   ├── Header (linee 698-783)
    │   ├── Message List (linee 785-996)
    │   │   ├── Loading History
    │   │   ├── Empty State
    │   │   ├── Message Items (con editing, feedback, reformulate)
    │   │   └── ThinkingIndicator
    │   └── Input Area (linee 998-1032)
```

### Dipendenze Esterne
```typescript
import ConversationHistory from './ConversationHistory';  // Già estratto
import ExportButton from './ExportButton';                // Già estratto
```

### Piano di Splitting (Marzo 2026)

#### Fase 1: Estrarre Custom Hook
```typescript
// src/hooks/useChatWidget.ts
export function useChatWidget(userContext, currentPath) {
  // Tutti gli stati
  // Tutte le funzioni di data fetching
  // Tutte le funzioni di feedback
  // Signal tracking
  return { ... }
}
```

#### Fase 2: Estrarre Componenti UI
```typescript
// src/components/ai-coach/MessageList.tsx
// - Render lista messaggi
// - Editing inline
// - Feedback/rating UI

// src/components/ai-coach/ChatInput.tsx
// - Input text
// - Send button
// - Keyboard handling

// src/components/ai-coach/ChatHeader.tsx
// - Header con avatar
// - Pulsanti controllo (history, new, close)
```

#### Fase 3: Risultato Finale
```
ChatWidget.tsx (~200 righe)
├── useChatWidget hook
├── ChatHeader
├── MessageList
├── ChatInput
└── Orchestrazione
```

---

## 2. exercise-recommendation.ts - Struttura Attuale

### Overview
- **File:** `src/lib/services/exercise-recommendation.ts`
- **Righe:** 951
- **Complessità:** MEDIA (logica per 3 percorsi diversi)

### Piano di Splitting

```typescript
// src/lib/services/recommendations/
├── index.ts              // Factory + exports
├── base.ts               // Interfacce comuni
├── leadership.ts         // Logica Leadership
├── risolutore.ts         // Logica Risolutore
└── microfelicita.ts      // Logica Microfelicità
```

---

## 3. challenge-day-templates.ts - Valutazione

### Overview
- **File:** `src/lib/email/challenge-day-templates.ts`
- **Righe:** 1020
- **Complessità:** BASSA (ripetizione by design)

### Decisione: NON REFACTORARE
I contenuti email sono diversi per ogni giorno/challenge. La "ripetizione" è contenuto, non codice. Parametrizzare richiederebbe un sistema di template che:
- Aggiungerebbe complessità
- Renderebbe difficile la modifica dei contenuti
- Non porterebbe benefici reali

---

## Prerequisiti per Refactoring

### Obbligatori
- [ ] Health Monitoring System attivo e funzionante
- [ ] Test advertising 100 click completato
- [ ] Baseline metriche di errore stabilita
- [ ] Test coverage per ChatWidget (almeno smoke tests)

### Consigliati
- [ ] Feature flags per rollback graduale
- [ ] A/B testing per nuovo vs vecchio componente
- [ ] Monitoring performance rendering

---

## Cronologia Refactoring

| Data | Fase | Deliverable |
|------|------|-------------|
| Marzo W1 | Preparazione | Test coverage + feature flags |
| Marzo W2 | Hook extraction | useChatWidget.ts |
| Marzo W3 | UI components | MessageList, ChatInput, ChatHeader |
| Marzo W4 | Integration + Testing | ChatWidget v2 con A/B |
| Aprile W1 | Rollout | 100% traffico su v2 |

---

## Metriche di Successo

1. **Zero regressioni** - Nessun nuovo errore in Health Monitoring
2. **Performance** - Render time <= versione attuale
3. **Maintainability** - File < 300 righe ciascuno
4. **Test coverage** - > 80% per componenti estratti
