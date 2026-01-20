# PROMPT CLAUDE CODE - FIX GAP CUSTOMER JOURNEY
## Vitaeology - 11 Gennaio 2026
## Post-Audit: 4 Fix Necessari

---

## 📋 GAP DA RISOLVERE

| # | Gap | Priorità | Ciclo |
|---|-----|----------|-------|
| 1 | Email conferma upgrade subscription | 🔴 CRITICO | 7 STOP |
| 2 | CTA "Parla con Fernando" in Assessment Results | 🟡 MEDIA | 4 STOP |
| 3 | Pagina success subscription | 🟡 MEDIA | 7 STOP |
| 4 | Test live wrap-up AI Coach | 🟢 BASSA | 6 STOP |

---

## FIX 1: EMAIL CONFERMA UPGRADE (CRITICO)

### Prompt 1.1 - Crea File Email Subscription

```
Crea il file src/lib/email/subscription-emails.ts per le email relative alle subscription.

Il file deve esportare queste funzioni:

1. sendUpgradeConfirmationEmail(params):
```typescript
interface UpgradeEmailParams {
  email: string;
  firstName?: string;
  planName: 'leader' | 'mentor';
  planPrice: number;
  renewalDate: string;
  invoiceUrl?: string;
}
```

Contenuto email per piano LEADER (€149/anno):

Oggetto: "🎉 Benvenuto nel piano Leader, {firstName}!"

Corpo:
- Saluto personalizzato
- Conferma: "Hai sbloccato il piano Leader di Vitaeology"
- Riepilogo:
  - Piano: Leader
  - Prezzo: €149/anno
  - Prossimo rinnovo: {renewalDate}
  - Link fattura: {invoiceUrl}

- Sezione "COSA HAI SBLOCCATO":
  - ✅ Tutti i 52 esercizi settimanali
  - ✅ AI Coach Fernando illimitato
  - ✅ Radar evolutivo con confronto progressi
  - ✅ Storico completo delle tue riflessioni

- Sezione "INIZIA SUBITO" (CTA - fondamentale per STOP→START):
  - Bottone primario: "Vai alla Dashboard" → https://vitaeology.com/dashboard
  - Link secondario: "Esplora gli Esercizi" → https://vitaeology.com/exercises
  - Link secondario: "Parla con Fernando" → https://vitaeology.com/dashboard?openChat=true

- Footer:
  - "Domande? Rispondi a questa email"
  - Link gestione abbonamento

Contenuto email per piano MENTOR (€490/anno):
- Stesso template ma aggiungi:
  - ✅ 2 sessioni 1:1 con Fernando
  - ✅ Badge "Professionista Vitaeology"
  - ✅ Accesso a tutti e 3 i percorsi
  - Bottone extra: "Prenota la tua sessione 1:1" → link calendly o equivalente

2. sendSubscriptionRenewalReminder(params) - per reminder 7 giorni prima del rinnovo
3. sendSubscriptionCancelledEmail(params) - per cancellazione

Usa Resend per l'invio.
Segui lo stesso pattern degli altri file email (challenge-emails.ts).
Includi template HTML responsive.
```

---

### Prompt 1.2 - Integra Email in Webhook Stripe

```
Modifica src/app/api/stripe/webhook/route.ts per inviare l'email di conferma upgrade.

Trova il gestore dell'evento 'checkout.session.completed' o 'customer.subscription.created'.

Aggiungi questa logica DOPO aver aggiornato il database:

```typescript
import { sendUpgradeConfirmationEmail } from '@/lib/email/subscription-emails';

// Dentro il gestore dell'evento subscription
if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.created') {
  const session = event.data.object;
  
  // Recupera dati utente
  const customerEmail = session.customer_email || session.customer_details?.email;
  const customerName = session.customer_details?.name?.split(' ')[0]; // firstName
  
  // Determina piano
  const planName = session.metadata?.plan || 'leader'; // o da price_id
  const planPrice = planName === 'mentor' ? 490 : 149;
  
  // Calcola data rinnovo
  const renewalDate = new Date();
  renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  
  // Invia email
  await sendUpgradeConfirmationEmail({
    email: customerEmail,
    firstName: customerName,
    planName: planName as 'leader' | 'mentor',
    planPrice,
    renewalDate: renewalDate.toLocaleDateString('it-IT'),
    invoiceUrl: session.invoice_url || undefined
  });
  
  console.log('Upgrade confirmation email sent to:', customerEmail);
}
```

Assicurati che:
1. L'import sia corretto
2. L'email venga inviata solo per subscription (non per altri eventi)
3. Gestisci errori senza bloccare il webhook (try/catch)
4. Log per debug

Testa con: stripe trigger checkout.session.completed --add checkout_session:metadata[plan]=leader
```

---

## FIX 2: CTA AI COACH IN ASSESSMENT RESULTS

### Prompt 2.1 - Aggiungi CTA Fernando in Results

```
Modifica src/app/assessment/leadership/results/page.tsx per aggiungere la CTA "Parla con Fernando".

Trova la sezione con i bottoni/CTA esistenti (dovrebbero esserci "Vai alla Dashboard" e "Esplora Esercizi").

Aggiungi un terzo bottone/link:

```tsx
// Dopo gli altri CTA, aggiungi:
<Link
  href="/dashboard?openChat=true"
  className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
>
  <MessageCircle className="w-5 h-5" />
  Parla con Fernando dei tuoi risultati
</Link>
```

Oppure se usi un componente Button:
```tsx
<Button
  variant="secondary"
  onClick={() => router.push('/dashboard?openChat=true')}
  className="bg-amber-500 hover:bg-amber-600"
>
  <MessageCircle className="w-5 h-5 mr-2" />
  Parla con Fernando dei tuoi risultati
</Button>
```

Assicurati di:
1. Importare l'icona MessageCircle da lucide-react
2. Posizionare il bottone in modo visibile (non nascosto in fondo)
3. Usare colore distintivo (amber/gold per coerenza con tema Fernando)

Il testo deve essere invitante, tipo:
- "Parla con Fernando dei tuoi risultati"
- "Discuti il tuo profilo con Fernando"
- "Chiedi a Fernando come iniziare"

Mostra il diff delle modifiche.
```

---

## FIX 3: PAGINA SUCCESS SUBSCRIPTION

### Prompt 3.1 - Crea Pagina Success

```
Crea la pagina src/app/subscription/success/page.tsx per il post-checkout subscription.

La pagina deve:

1. STRUTTURA:
```tsx
export default async function SubscriptionSuccessPage({
  searchParams
}: {
  searchParams: { plan?: string; session_id?: string }
}) {
  const plan = searchParams.plan || 'leader';
  const isLeader = plan === 'leader';
  const isMentor = plan === 'mentor';
  
  return (
    // ... contenuto
  );
}
```

2. CONTENUTO VISIVO:
- Icona celebrativa grande (CheckCircle verde o confetti)
- Titolo: "Benvenuto nel piano {Leader/Mentor}! 🎉"
- Sottotitolo: "Il tuo percorso di crescita inizia ora"

3. SEZIONE "COSA PUOI FARE ORA":
Card grid con 3-4 opzioni:

Card 1:
- Icona: BarChart3
- Titolo: "Esplora la Dashboard"
- Descrizione: "Vedi il tuo radar e i tuoi progressi"
- CTA: Link a /dashboard

Card 2:
- Icona: Dumbbell
- Titolo: "Inizia un Esercizio"
- Descrizione: "52 esercizi ti aspettano"
- CTA: Link a /exercises

Card 3:
- Icona: MessageCircle
- Titolo: "Parla con Fernando"
- Descrizione: "Il tuo coach AI è pronto"
- CTA: Link a /dashboard?openChat=true

Card 4 (solo Mentor):
- Icona: Calendar
- Titolo: "Prenota la tua Sessione 1:1"
- Descrizione: "2 sessioni incluse nel piano"
- CTA: Link a calendly o pagina booking

4. MESSAGGIO FINALE:
"Hai domande? Il nostro team è qui per te: support@vitaeology.com"

5. NESSUN VICOLO CIECO:
- Almeno 3 CTA cliccabili
- Nessun testo senza azione
- Auto-redirect a dashboard dopo 30 secondi (opzionale)

Usa Tailwind, componenti shadcn/ui se disponibili.
Colori coerenti con il brand Vitaeology.
```

---

### Prompt 3.2 - Aggiorna Stripe Checkout Success URL

```
Modifica src/app/api/stripe/checkout/route.ts per reindirizzare alla nuova pagina success.

Trova dove viene creata la sessione Stripe checkout:

```typescript
const session = await stripe.checkout.sessions.create({
  // ... altri parametri
  success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success?plan={CHECKOUT_SESSION_LINE_ITEMS_PRICE_PRODUCT_METADATA_PLAN}&session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?cancelled=true`,
});
```

Oppure più semplicemente:
```typescript
success_url: `${baseUrl}/subscription/success?plan=${planName}&session_id={CHECKOUT_SESSION_ID}`,
```

Dove `planName` è 'leader' o 'mentor' in base al prezzo selezionato.

Assicurati che:
1. Il plan venga passato correttamente come query param
2. Il session_id sia incluso per eventuali verifiche
3. La cancel_url porti a /pricing con messaggio appropriato

Testa il redirect completando un checkout in modalità test Stripe.
```

---

## FIX 4: VERIFICA WRAP-UP AI COACH

### Prompt 4.1 - Test Script Wrap-up

```
Crea uno script di test per verificare che il wrap-up AI Coach funzioni.

Crea file: scripts/test-ai-wrap-up.ts

```typescript
/**
 * Test script per verificare wrap-up AI Coach
 * Esegui con: npx ts-node scripts/test-ai-wrap-up.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function testWrapUp() {
  console.log('🧪 Test Wrap-up AI Coach\n');
  
  // Simula conversazione con saluto finale
  const testMessages = [
    { role: 'user', content: 'Ciao Fernando, come posso migliorare la mia leadership?' },
    { role: 'assistant', content: '[risposta AI precedente]' },
    { role: 'user', content: 'Grazie mille Fernando, sei stato molto utile!' }
  ];
  
  console.log('📤 Invio messaggio di chiusura: "Grazie mille Fernando, sei stato molto utile!"');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-coach`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Aggiungi auth header se necessario
      },
      body: JSON.stringify({
        messages: testMessages,
        userId: 'test-user-id',
        pathType: 'leadership'
      })
    });
    
    const data = await response.json();
    
    console.log('\n📥 Risposta AI:\n');
    console.log(data.content || data.message);
    
    // Verifica elementi wrap-up
    const content = (data.content || data.message || '').toLowerCase();
    
    console.log('\n✅ Verifica elementi wrap-up:');
    
    const hasRiepilogo = content.includes('abbiamo parlato') || 
                         content.includes('discusso') ||
                         content.includes('emerso');
    console.log(`  - Riepilogo conversazione: ${hasRiepilogo ? '✅' : '❌'}`);
    
    const hasAzione = content.includes('prossim') ||
                      content.includes('potresti') ||
                      content.includes('ti consiglio') ||
                      content.includes('prova a');
    console.log(`  - Azione suggerita: ${hasAzione ? '✅' : '❌'}`);
    
    const hasEsercizio = content.includes('esercizio') ||
                         content.includes('pratica');
    console.log(`  - Esercizio menzionato: ${hasEsercizio ? '✅' : '❌'}`);
    
    const hasSaluto = content.includes('buon') ||
                      content.includes('a presto') ||
                      content.includes('in bocca al lupo');
    console.log(`  - Saluto caldo: ${hasSaluto ? '✅' : '❌'}`);
    
    const wrapUpScore = [hasRiepilogo, hasAzione, hasEsercizio, hasSaluto].filter(Boolean).length;
    console.log(`\n📊 Wrap-up Score: ${wrapUpScore}/4`);
    
    if (wrapUpScore >= 3) {
      console.log('✅ Wrap-up VALIDO');
    } else {
      console.log('⚠️ Wrap-up INCOMPLETO - verificare system prompt');
    }
    
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

testWrapUp();
```

Esegui lo script e verifica l'output.
Se il wrap-up è incompleto, il problema è nel system prompt - fornisci dettagli.
```

---

### Prompt 4.2 - Fix System Prompt se Necessario

```
Se il test wrap-up fallisce, migliora la sezione wrap-up nel system prompt.

File: src/lib/ai-coach/system-prompt.ts

Cerca la sezione WRAP-UP (dovrebbe essere la sezione 8) e assicurati contenga:

```typescript
// Nella funzione buildSystemPrompt, sezione WRAP-UP

const WRAP_UP_SECTION = `
## 8. WRAP-UP CONVERSAZIONE

Quando l'utente si congeda (parole chiave: "grazie", "ciao", "arrivederci", "devo andare", "a presto", "è stato utile"):

DEVI SEMPRE rispondere con questo schema:

1. ACCOGLI il saluto con calore
   "È stato un piacere parlare con te!"

2. RIEPILOGA brevemente (1-2 frasi)
   "In questa conversazione abbiamo esplorato [tema principale]..."

3. SUGGERISCI un'azione concreta per le prossime 24-48 ore
   "Nelle prossime ore, ti invito a [azione specifica e fattibile]..."

4. PROPONI un esercizio (se appropriato)
   "Se vuoi approfondire, l'esercizio '[Nome Esercizio]' potrebbe aiutarti..."

5. CHIUDI con calore e invito a tornare
   "Sono qui quando vorrai continuare. In bocca al lupo!"

ESEMPIO WRAP-UP COMPLETO:
"Grazie a te per questa bella conversazione! 

Abbiamo esplorato come la delega possa diventare uno strumento di crescita sia per te che per il tuo team.

Nelle prossime 24 ore, prova a identificare UN task che potresti delegare domani, anche piccolo. Osserva come ti fa sentire.

Se vuoi strutturare meglio questo processo, l'esercizio 'Pratica di Delega Progressiva' ti guida passo passo.

Sono qui quando vorrai continuare il percorso. Buon lavoro!"

NON rispondere MAI con solo "Ciao!" o "A presto!" senza il wrap-up completo.
`;
```

Verifica che:
1. La sezione esista nel prompt
2. Sia inclusa quando pathType è definito
3. I CLOSING_PATTERNS siano riconosciuti correttamente

Se manca, aggiungila. Mostra il diff.
```

---

## VERIFICA FINALE

### Prompt FINAL - Conferma Fix Applicati

```
Verifica che tutti e 4 i fix siano stati applicati correttamente.

Checklist:

1. EMAIL UPGRADE:
   - [ ] File src/lib/email/subscription-emails.ts esiste
   - [ ] Funzione sendUpgradeConfirmationEmail esportata
   - [ ] Webhook Stripe chiama la funzione
   - [ ] Template ha CTA (non vicolo cieco)

2. CTA AI COACH IN ASSESSMENT:
   - [ ] Bottone "Parla con Fernando" presente in results page
   - [ ] Link corretto (/dashboard?openChat=true)
   - [ ] Visivamente distintivo

3. PAGINA SUCCESS:
   - [ ] File src/app/subscription/success/page.tsx esiste
   - [ ] Mostra piano corretto (leader/mentor)
   - [ ] Ha almeno 3 CTA
   - [ ] Stripe checkout success_url aggiornato

4. WRAP-UP AI:
   - [ ] Sezione wrap-up nel system prompt
   - [ ] Test script creato
   - [ ] (Opzionale) Test manuale superato

Output:
```
## FIX VERIFICATION REPORT

| Fix | File | Status | Note |
|-----|------|--------|------|
| 1. Email Upgrade | subscription-emails.ts | ✅/❌ | |
| 2. CTA AI Coach | results/page.tsx | ✅/❌ | |
| 3. Pagina Success | subscription/success/page.tsx | ✅/❌ | |
| 4. Wrap-up AI | system-prompt.ts | ✅/❌ | |

PRONTO PER TESTER UMANI: ✅/❌
```

Se tutto ✅, fai commit:
git add .
git commit -m "fix: complete customer journey - no dead ends"
git push
```

---

## 📝 ORDINE ESECUZIONE

```
1.1 → Crea email subscription
1.2 → Integra in webhook
2.1 → Aggiungi CTA Fernando
3.1 → Crea pagina success
3.2 → Aggiorna Stripe URL
4.1 → Test wrap-up
4.2 → Fix prompt se necessario
FINAL → Verifica tutto
```

**Tempo stimato: 1-2 ore**

---

*Fix per Audit 11 Gennaio 2026*
*Gap: 1 critico, 3 minori → 0*
