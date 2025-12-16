# CLAUDE.md - Istruzioni per Claude Code
## Progetto: Vitaeology - Leadership Development Platform

---

## CONTESTO PROGETTO

Vitaeology è una piattaforma SaaS per lo sviluppo della leadership destinata a imprenditori italiani (35-55 anni).

**Stack tecnologico:**
- Next.js 14 (App Router)
- TypeScript
- Supabase (PostgreSQL + Auth)
- Tailwind CSS
- Stripe (pagamenti)
- Vercel (hosting)

**Owner:** Fernando Marongiu

---

## PRINCIPI FONDAMENTALI (OBBLIGATORI)

### 1. Principio Validante
- MAI usare linguaggio deficit ("ti manca", "area debole", "devi migliorare")
- SEMPRE linguaggio validante ("dove già operi", "puoi espandere", "riconosci")
- L'utente POSSIEDE GIÀ tutte le capacità di leadership

### 2. User Agency
- L'utente è l'AGENTE attivo, non un paziente passivo
- Mai prescrizioni dirette ("devi fare X")
- Sempre domande e facilitazione ("cosa ha funzionato in passato?")

### 3. Sequenza ESSERE → FARE → AVERE
- Prima identità (chi sei), poi comportamento (cosa fai), poi risultato (cosa ottieni)
- Struttura invisibile ma sempre presente

### 4. Framework Comprensione
- Parole semplici, mai gergo tecnico non spiegato
- Esempi concreti dalla vita dell'imprenditore
- Progressione graduale

---

## AI COACH - NOME CORRETTO

**Il nome dell'AI Coach è FERNANDO, mai Marco.**

Questo è CRITICO. In tutto il codice, prompt, UI:
- ✅ "Sono Fernando, il tuo AI Coach"
- ❌ "Sono Marco" (ERRORE GRAVE)

---

## SAFETY PROTOCOLS

Se l'utente menziona: "suicidio", "autolesionismo", "voglio morire", "farla finita", "non ce la faccio più"

Risposta OBBLIGATORIA:
```
❤️ Ti ringrazio per aver condiviso questi sentimenti. Capisco che stai attraversando un momento molto difficile.

🚨 Non sono qualificato per gestire situazioni di crisi. Ti prego di contattare IMMEDIATAMENTE:

🇮🇹 ITALIA:
• EMERGENZE: 112
• Telefono Amico: 199 284 284 (24h/24)
• Samaritans Onlus: 800 86 00 22

Tu meriti aiuto professionale. ❤️
```

---

## STRUTTURA FILE AI COACH

```
lib/
├── ai-coach/
│   ├── types.ts           # Interfacce TypeScript
│   └── system-prompt.ts   # Prompt Fernando (principi validanti)

app/
├── api/
│   └── ai-coach/
│       └── route.ts       # API endpoint Claude

components/
├── ai-coach/
│   └── ChatWidget.tsx     # Widget chat UI
```

---

## COLORI BRAND VITAEOLOGY

```css
/* Palette ufficiale */
--vitaeology-gold: #D4AF37;      /* Oro principale */
--vitaeology-amber: #F59E0B;     /* Amber per accenti */
--vitaeology-amber-dark: #D97706; /* Amber scuro hover */
--vitaeology-cream: #FFFBEB;     /* Sfondo chiaro */
--vitaeology-charcoal: #1F2937;  /* Testo principale */
```

---

## COMANDI UTILI

```bash
# Avvia dev server
npm run dev

# Build produzione
npm run build

# Lint
npm run lint

# Installa dipendenza
npm install <package>
```

---

## DATABASE SUPABASE

Tabella conversazioni AI Coach (già creata):
- `ai_coach_conversations`
- Campi: id, user_id, role, content, exercise_id, context_type, tokens_used, created_at
- RLS attivo: ogni utente vede solo le sue conversazioni

---

## NOTE PER CLAUDE CODE

1. Quando crei componenti React, usa `'use client'` se necessario
2. Usa sempre TypeScript strict
3. Segui convenzioni Next.js 14 App Router
4. Tailwind per styling, no CSS separato
5. Commenta il codice in italiano
