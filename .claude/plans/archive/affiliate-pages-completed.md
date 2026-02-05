# Piano: Completamento Pagine Affiliati

## Obiettivo

Completare le 4 pagine mancanti della sezione affiliati:
1. `/affiliate/payouts` - Storico pagamenti
2. `/affiliate/leaderboard` - Classifica top affiliati
3. `/affiliate/resources` - Materiali promozionali
4. `/affiliate/training` - Percorso 6 fasi

## Stato Attuale

### Già Implementato
- `/affiliate` - Landing page programma ✅
- `/affiliate/dashboard` - Dashboard principale ✅
- `/affiliate/links` - Gestione link tracciati ✅
- `/affiliate/termini` - Condizioni programma ✅
- API `/api/affiliate/stats` ✅
- API `/api/affiliate/payouts` (GET + POST) ✅
- API `/api/affiliate/commissions` ✅
- API `/api/affiliate/links` ✅
- API `/api/affiliate/track` ✅
- API `/api/affiliate/register` ✅

### Da Implementare
- Pagina `/affiliate/payouts`
- Pagina `/affiliate/leaderboard` + API
- Pagina `/affiliate/resources` + contenuti
- Pagina `/affiliate/training` + contenuti

---

## 1. PAYOUTS - Storico Pagamenti

**Effort:** 2-3 ore
**Priorità:** Alta (affiliati vogliono vedere i soldi)
**API:** ✅ Già pronta

### File da creare
```
src/app/affiliate/payouts/page.tsx
```

### Struttura pagina
```tsx
// Sezioni:
// 1. Saldo attuale + soglia minima payout
// 2. Bottone "Richiedi Payout" (se saldo >= soglia)
// 3. Tabella storico payouts con:
//    - Data richiesta
//    - Importo
//    - Metodo (PayPal/Bonifico)
//    - Stato (pending/processing/completed/failed)
//    - Data pagamento
```

### API esistente
```
GET /api/affiliate/payouts → { payouts[], saldo_disponibile, soglia_minima }
POST /api/affiliate/payouts → { metodo: 'paypal'|'bonifico' }
```

---

## 2. LEADERBOARD - Classifica Top Affiliati

**Effort:** 4-5 ore
**Priorità:** Media (gamification)
**API:** ❌ Da creare

### File da creare
```
src/app/affiliate/leaderboard/page.tsx
src/app/api/affiliate/leaderboard/route.ts
```

### API da implementare
```typescript
// GET /api/affiliate/leaderboard?period=month|all
// Response:
{
  leaderboard: [
    {
      posizione: 1,
      nome_visualizzato: "M***o R.", // Anonimizzato
      totale_commissioni: 1234.56,
      totale_clienti: 45,
      categoria: "PARTNER",
      is_current_user: false
    },
    // ... top 20
  ],
  current_user: {
    posizione: 34,
    totale_commissioni: 234.56,
    totale_clienti: 8
  }
}
```

### Query SQL
```sql
SELECT
  id,
  CONCAT(LEFT(nome, 1), '***', LEFT(cognome, 1), '.') as nome_visualizzato,
  totale_commissioni_euro,
  totale_clienti_attivi,
  categoria
FROM affiliates
WHERE stato = 'active'
ORDER BY totale_commissioni_euro DESC
LIMIT 20;
```

### Struttura pagina
- Header con posizione utente corrente
- Filtro periodo (questo mese / sempre)
- Tabella top 20 con evidenziazione se utente presente
- Card "La tua posizione" se fuori top 20

---

## 3. RESOURCES - Materiali Promozionali

**Effort:** 6-8 ore (incluso contenuto)
**Priorità:** Media (aiuta affiliati a promuovere)
**API:** Opzionale (può essere contenuto statico)

### File da creare
```
src/app/affiliate/resources/page.tsx
src/lib/affiliate/resources-data.ts  // Contenuti statici
```

### Contenuti da creare

#### Swipe Copy (email/social)
Per ogni challenge (Leadership, Ostacoli, Microfelicità):
- 3 versioni: Emotivo, Pratico, Domanda
- Totale: 9 swipe copy

Esempio struttura:
```typescript
export const SWIPE_COPIES = {
  leadership: [
    {
      tipo: 'emotivo',
      titolo: 'Per chi sente che manca qualcosa',
      testo: `Fare il leader non basta più...`,
      cta: 'Scopri la Challenge gratuita →'
    },
    // ...
  ],
  // ostacoli, microfelicita
};
```

#### Banner Social
Dimensioni da creare:
- Facebook/LinkedIn: 1200x628
- Instagram Feed: 1080x1080
- Instagram Stories: 1080x1920

Per ora: placeholder con istruzioni Canva o link a cartella Drive

#### Email Templates
- Welcome sequence per affiliato
- Template promozione challenge
- Template follow-up

### Struttura pagina
```
Tabs:
1. Swipe Copy → Cards con bottone "Copia"
2. Banner → Grid con preview + download
3. Email Templates → Accordion con "Copia HTML"
4. Link Pronti → Generator con UTM pre-configurati
```

---

## 4. TRAINING - Percorso 6 Fasi

**Effort:** 8-12 ore (incluso contenuto)
**Priorità:** Bassa (nice-to-have)
**API:** Opzionale (tracking progress)

### File da creare
```
src/app/affiliate/training/page.tsx
src/lib/affiliate/training-content.ts
```

### Le 6 Fasi (da GUIDA_COMPLETA_VITAEOLOGY_ADS_AFFILIATI_v5.txt)

```typescript
export const TRAINING_PHASES = [
  {
    fase: 1,
    titolo: 'Comprendere il PERCHÉ',
    durata: '15 min',
    descrizione: 'Prima di promuovere, devi capire e condividere la mission di Vitaeology',
    contenuto: `
      ## Perché Vitaeology?

      Non stai promuovendo "un corso online". Stai aiutando imprenditori
      a riconoscere le capacità di leadership che hanno GIÀ.

      ### Il Principio Validante
      - L'utente NON ha deficit da colmare
      - L'utente HA GIÀ le capacità
      - Il nostro ruolo è aiutarlo a RICONOSCERLE

      ### Esercizio
      Scrivi 3 motivi personali per cui credi in questo approccio.
    `,
    esercizio: 'Scrivi 3 motivi personali per cui credi in Vitaeology',
    completato: false
  },
  {
    fase: 2,
    titolo: 'Scegliere la Tua Nicchia',
    // ...
  },
  // ... fasi 3-6
];
```

### Struttura pagina
- Progress bar generale (0/6 fasi)
- Stepper verticale con fasi
- Contenuto fase corrente (markdown rendered)
- Checkbox "Ho completato questa fase"
- Badge sbloccabili

### Tracking Progress (opzionale)
```sql
-- Tabella opzionale
CREATE TABLE affiliate_training_progress (
  affiliate_id UUID REFERENCES affiliates(id),
  fase_numero INT,
  completato_at TIMESTAMPTZ,
  PRIMARY KEY (affiliate_id, fase_numero)
);
```

---

## Riepilogo Effort

| Pagina | Dev | Contenuto | Totale |
|--------|-----|-----------|--------|
| Payouts | 2-3h | - | **2-3h** |
| Leaderboard | 4-5h | - | **4-5h** |
| Resources | 3-4h | 3-4h | **6-8h** |
| Training | 4-5h | 4-7h | **8-12h** |
| **TOTALE** | 13-17h | 7-11h | **20-28h** |

## Ordine Implementazione Suggerito

1. **Payouts** (2-3h) - Più urgente, API già pronta
2. **Leaderboard** (4-5h) - Gamification immediata
3. **Resources** (6-8h) - Richiede contenuti
4. **Training** (8-12h) - Nice-to-have, può aspettare

## Dipendenze

- Nessuna dipendenza esterna
- Tutti i componenti UI possono riutilizzare stili da dashboard esistente
- Pattern di autenticazione già stabilito

## Come Procedere

Quando pronto, di': "Implementa affiliate payouts" (o altra pagina)
Il piano verrà seguito step by step.
