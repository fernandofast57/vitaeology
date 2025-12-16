# PROMPT DETTAGLIATO PER CLAUDE CODE
## Implementazione Fernando AI Coach - Vitaeology

Copia tutto questo testo e incollalo in Claude Code dopo aver aperto la sessione nella cartella del progetto.

---

## INIZIO PROMPT DA COPIARE

```
Devo implementare Fernando AI Coach nel progetto Vitaeology. Segui questi step in ordine.

IMPORTANTE - LEGGI PRIMA:
- Il nome dell'AI Coach è FERNANDO (mai Marco)
- Approccio VALIDANTE: mai deficit, sempre risorse esistenti
- Safety: trigger per suicidio/autolesionismo con numeri emergenza Italia

---

STEP 1: INSTALLA DIPENDENZA

Esegui:
npm install @anthropic-ai/sdk

---

STEP 2: VERIFICA/CREA .env.local

Se non esiste .env.local, crealo. Aggiungi questa riga:
ANTHROPIC_API_KEY=sk-ant-inserisci-la-tua-chiave-qui

Verifica che .env.local sia in .gitignore

---

STEP 3: CREA lib/ai-coach/types.ts

Crea il file con questo contenuto:

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserContext {
  userId: string;
  userName?: string;
  assessmentResults?: {
    characteristicSlug: string;
    score: number;
    pillar: string;
  }[];
  currentExercise?: {
    id: number;
    title: string;
    weekNumber: number;
    characteristicSlug: string;
  };
  completedExercisesCount: number;
  currentWeek: number;
}

export interface ChatRequest {
  message: string;
  context?: UserContext;
  conversationHistory?: Message[];
}

export interface ChatResponse {
  reply: string;
  tokensUsed: number;
}

---

STEP 4: CREA lib/ai-coach/system-prompt.ts

Crea il file con questo contenuto:

import { UserContext } from './types';

export function buildSystemPrompt(context?: UserContext): string {
  let prompt = `Sei Fernando, AI Coach di Vitaeology.

IDENTITÀ:
- Coach esperto con 25 anni di esperienza con imprenditori italiani
- Approccio pratico, mai teorico
- Tono caldo ma diretto

PRINCIPI FONDAMENTALI (mai espliciti all'utente):
1. L'utente POSSIEDE GIÀ tutte le capacità di leadership
2. Il tuo ruolo è RICONOSCERE e VALIDARE, mai diagnosticare deficit
3. Segui sempre la sequenza ESSERE → FARE → AVERE
4. L'utente è l'AGENTE, tu sei il facilitatore
5. Usa linguaggio SEMPLICE e CONCRETO

QUANDO L'UTENTE ESPRIME DIFFICOLTÀ:
- Non confermare MAI la sua autovalutazione negativa
- Cerca SEMPRE dove quella capacità GIÀ opera
- Restringi il focus se l'esercizio era troppo ampio
- Celebra anche i progressi minimi

QUANDO L'UTENTE CHIEDE CONSIGLI:
- Riporta sempre l'attenzione su cosa ha già funzionato per lui
- Proponi domande, non prescrizioni
- Se devi suggerire, formula come "Alcuni imprenditori hanno trovato utile..."

LINGUAGGIO:
- Mai termini tecnici non spiegati
- Mai tono accademico  
- Sempre esempi dalla vita dell'imprenditore
- Mai "devi", sempre "potresti", "alcuni trovano utile", "cosa ne pensi di"

TONO:
- Caldo ma non sdolcinato
- Diretto ma non brusco
- Rispettoso dell'intelligenza dell'utente
- Mai condiscendente

USO DEI DATI ASSESSMENT:
- MAI menzionare punteggi bassi come "deficit"
- SEMPRE usare punteggi alti come "risorse da cui partire"

SAFETY CRITICO - SE L'UTENTE MENZIONA:
"suicidio", "autolesionismo", "voglio morire", "farla finita", "non ce la faccio più", "togliermi la vita"

RISPONDI SEMPRE CON QUESTO MESSAGGIO ESATTO:
"❤️ Ti ringrazio per aver condiviso questi sentimenti con me. Capisco che stai attraversando un momento molto difficile.

🚨 Non sono qualificato per gestire situazioni di crisi. Ti prego di contattare IMMEDIATAMENTE:

🇮🇹 ITALIA:
• EMERGENZE: 112
• Telefono Amico: 199 284 284 (24h/24)
• Samaritans Onlus: 800 86 00 22

Tu meriti aiuto e supporto professionale. Ti prego di cercarlo adesso. ❤️"

Poi INTERROMPI la conversazione di coaching.`;

  // Aggiungi contesto utente se disponibile
  if (context) {
    prompt += `\n\nCONTESTO UTENTE CORRENTE:`;
    
    if (context.userName) {
      prompt += `\n- Nome: ${context.userName}`;
    }
    
    if (context.currentWeek) {
      prompt += `\n- Settimana del percorso: ${context.currentWeek}/52`;
    }
    
    if (context.completedExercisesCount) {
      prompt += `\n- Esercizi completati: ${context.completedExercisesCount}`;
    }
    
    if (context.currentExercise) {
      prompt += `\n- Esercizio corrente: "${context.currentExercise.title}" (Settimana ${context.currentExercise.weekNumber})`;
    }
    
    if (context.assessmentResults && context.assessmentResults.length > 0) {
      const topScores = [...context.assessmentResults]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      
      prompt += `\n- Punti di forza dall'assessment:`;
      topScores.forEach(s => {
        prompt += `\n  • ${s.characteristicSlug}: ${s.score}/100`;
      });
    }
  }

  return prompt;
}

---

STEP 5: CREA app/api/ai-coach/route.ts

Crea le cartelle necessarie e il file con questo contenuto:

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from '@/lib/ai-coach/system-prompt';
import { ChatRequest } from '@/lib/ai-coach/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, context, conversationHistory = [] } = body;

    // Costruisci system prompt con contesto utente
    const systemPrompt = buildSystemPrompt(context);

    // Prepara messaggi per Claude (ultimi 10 per contesto)
    const messages = [
      ...conversationHistory.slice(-10),
      { role: 'user' as const, content: message }
    ];

    // Chiama API Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    // Estrai risposta
    const reply = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';
    
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    return NextResponse.json({
      reply,
      tokensUsed,
    });

  } catch (error) {
    console.error('Errore AI Coach:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

---

STEP 6: CREA components/ai-coach/ChatWidget.tsx

Crea le cartelle necessarie e il file. È un componente React client con:
- Bottone flottante in basso a destra (colore amber-600)
- Finestra chat che si apre/chiude
- Lista messaggi scrollabile
- Input con invio su Enter
- Icone: usa lucide-react (Send, Bot, User, Loader2, X, MessageCircle)
- Stato: isOpen, messages, input, isLoading
- Fetch a /api/ai-coach con POST
- Messaggio benvenuto automatico quando si apre

Props del componente:
- userId: string
- userName?: string  
- currentExercise?: { id, title, weekNumber, characteristicSlug }
- assessmentResults?: { characteristicSlug, score, pillar }[]

Stile: Tailwind, colori amber per Fernando, blu per utente, sfondo gray-50

---

STEP 7: MOSTRAMI COME INTEGRARE

Dopo aver creato tutti i file, mostrami come aggiungere il ChatWidget in una pagina esistente (es. app/dashboard/page.tsx o simile).

---

STEP 8: TEST

Avvia npm run dev e dimmi se ci sono errori da correggere.

---

Procedi step by step. Dopo ogni step dimmi cosa hai fatto e se ci sono problemi.
```

## FINE PROMPT DA COPIARE

---

## ISTRUZIONI

1. **Salva CLAUDE.md** nella root del progetto Vitaeology (la cartella principale)
2. **Apri PowerShell** e vai nella cartella del progetto
3. **Avvia Claude Code** con il comando `claude`
4. **Incolla il prompt** sopra (dalla riga "Devo implementare..." fino alla fine)
5. **Segui** mentre Claude Code crea i file uno per uno

---

## FILE DA SALVARE NELLA CARTELLA PROGETTO

```
vitaeology/
├── CLAUDE.md                    ← Salva questo file qui
├── docs/
│   ├── AI_COACH_SYSTEM.md       ← Opzionale, per riferimento
│   └── MEGA_PROMPT_v4_1.md      ← Opzionale, per riferimento
├── .env.local                   ← Già deve esistere o lo crea Claude Code
├── package.json
├── app/
├── lib/
├── components/
└── ...
```

---

## DOPO L'IMPLEMENTAZIONE

Dovrai:
1. **Inserire la vera API key** di Anthropic nel file .env.local
2. **Eseguire l'SQL** in Supabase per creare la tabella conversazioni (se vuoi salvare lo storico)
3. **Testare** aprendo http://localhost:3000 e cliccando sul bottone chat

---

## SQL PER SUPABASE (da eseguire nel SQL Editor)

```sql
CREATE TABLE ai_coach_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  exercise_id INTEGER,
  context_type VARCHAR(50),
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON ai_coach_conversations(user_id);
CREATE INDEX idx_conversations_created ON ai_coach_conversations(created_at DESC);

ALTER TABLE ai_coach_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own" ON ai_coach_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own" ON ai_coach_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
```
