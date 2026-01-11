# PROMPT CLAUDE CODE - STRUTTURA COMMISSIONI AFFILIATI

## Contesto
Implementazione nuova struttura commissioni affiliati basata su:
1. Livello abbonamento utente (commissione base)
2. Performance (bonus clienti attivi)
3. Milestone (bonus ricorrenti)

## Struttura Confermata

```
COMMISSIONE BASE (da abbonamento):
├── Leader (€149)      → 25%
├── Mentor (€490)      → 30%
├── Mastermind         → 35%
└── Consulente         → 40%

BONUS PERFORMANCE:
├── 10+ clienti attivi → +3%
└── 30+ clienti attivi → +5%

BONUS MILESTONE:
├── Prima vendita      → €25 una tantum
├── 50 clienti attivi  → €500/mese
└── 100 clienti attivi → €1,000/mese

CAP MASSIMO: 45%
```

---

## TASK 1: Migrazione Database

Esegui la migrazione SQL:

```bash
cd /path/to/vitaeology
supabase db push
# oppure esegui manualmente in Supabase SQL Editor
```

File: `supabase/migrations/20260108008_affiliate_commission_structure.sql`

Contenuto già preparato, include:
- Nuove colonne: `abbonamento_utente`, `commissione_base`, `bonus_performance`, `bonus_milestone_mensile`
- Tabella `affiliate_milestone_bonuses`
- Funzioni: `get_commissione_base_da_abbonamento()`, `get_bonus_performance()`, `calcola_commissione_affiliato()`
- Trigger per aggiornamento automatico
- View `v_affiliati_commissioni`

---

## TASK 2: Aggiorna API Registrazione

File: `src/app/api/affiliate/register/route.ts`

Modifica la registrazione per:
1. Verificare che l'utente abbia un abbonamento attivo
2. Determinare il livello abbonamento
3. Calcolare commissione base

```typescript
// Aggiungi dopo la validazione utente esistente

// Verifica abbonamento attivo
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('plan_type, status')
  .eq('user_id', user.id)
  .eq('status', 'active')
  .single();

if (!subscription) {
  return NextResponse.json(
    { error: 'Per diventare affiliato devi avere un abbonamento attivo' },
    { status: 400 }
  );
}

// Determina livello abbonamento
const abbonamentoUtente = subscription.plan_type === 'mentor' ? 'mentor' : 'leader';

// Commissione base
const commissioneBase = abbonamentoUtente === 'mentor' ? 30 : 25;

// Nella INSERT aggiungi:
// abbonamento_utente: abbonamentoUtente,
// commissione_base: commissioneBase,
// commissione_percentuale: commissioneBase,
```

---

## TASK 3: Aggiorna Webhook Stripe

File: `src/app/api/webhooks/stripe/route.ts`

Nella sezione `invoice.paid`, modifica il calcolo commissione:

```typescript
// Sostituisci il calcolo commissione fisso con:

// Ottieni commissione calcolata
const { data: commissione } = await supabase
  .rpc('calcola_commissione_affiliato', {
    p_affiliate_id: affiliateId,
    p_importo_vendita: amountPaid / 100 // converti da centesimi
  })
  .single();

const commissionAmount = commissione?.commissione_euro || 0;
const commissionPercentage = commissione?.commissione_percentuale || 25;

// Crea commissione con i valori calcolati
await supabase.from('affiliate_commissions').insert({
  affiliate_id: affiliateId,
  subscription_id: subscriptionId,
  tipo: isRenewal ? 'rinnovo' : 'iniziale',
  importo_vendita: amountPaid / 100,
  commissione_percentuale: commissionPercentage,
  importo_commissione: commissionAmount,
  stato: 'pending',
  dettaglio_calcolo: commissione?.dettaglio
});

// Aggiorna metriche affiliato
await supabase.rpc('aggiorna_metriche_affiliato', {
  p_affiliate_id: affiliateId
});

// Check milestone bonus
const { data: newMilestones } = await supabase
  .rpc('check_and_assign_milestone_bonus', {
    p_affiliate_id: affiliateId
  });

// Se nuovi milestone, invia notifica
if (newMilestones && newMilestones.length > 0) {
  for (const milestone of newMilestones) {
    // TODO: Invia email notifica milestone
    console.log(`Nuovo milestone per ${affiliateId}: ${milestone.milestone_type}`);
  }
}
```

---

## TASK 4: Aggiorna API Stats

File: `src/app/api/affiliate/stats/route.ts`

Aggiungi i nuovi campi nella risposta:

```typescript
// Nella query SELECT aggiungi:
const { data: affiliate } = await supabase
  .from('affiliates')
  .select(`
    *,
    abbonamento_utente,
    commissione_base,
    bonus_performance,
    bonus_milestone_mensile
  `)
  .eq('user_id', user.id)
  .single();

// Nella risposta aggiungi:
return NextResponse.json({
  // ... campi esistenti ...
  
  // Nuovi campi struttura commissioni
  struttura_commissioni: {
    abbonamento: affiliate.abbonamento_utente,
    commissione_base: affiliate.commissione_base,
    bonus_performance: affiliate.bonus_performance,
    commissione_totale: affiliate.commissione_base + affiliate.bonus_performance,
    bonus_milestone_mensile: affiliate.bonus_milestone_mensile,
    prossimo_bonus: affiliate.clienti_attivi < 10 
      ? { clienti_necessari: 10 - affiliate.clienti_attivi, bonus: '+3%' }
      : affiliate.clienti_attivi < 30
        ? { clienti_necessari: 30 - affiliate.clienti_attivi, bonus: '+5%' }
        : null
  }
});
```

---

## TASK 5: Aggiorna Dashboard Frontend

File: `src/app/affiliate/dashboard/page.tsx`

Aggiungi sezione struttura commissioni:

```tsx
{/* Sezione Commissioni */}
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-semibold text-[#0A2540] mb-4">
    La Tua Struttura Commissioni
  </h3>
  
  <div className="space-y-3">
    {/* Abbonamento */}
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Tuo abbonamento:</span>
      <span className="font-medium capitalize">
        {stats.struttura_commissioni.abbonamento}
      </span>
    </div>
    
    {/* Commissione Base */}
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Commissione base:</span>
      <span className="font-medium">
        {stats.struttura_commissioni.commissione_base}%
      </span>
    </div>
    
    {/* Bonus Performance */}
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Bonus performance:</span>
      <span className="font-medium text-green-600">
        +{stats.struttura_commissioni.bonus_performance}%
      </span>
    </div>
    
    {/* Totale */}
    <div className="flex justify-between items-center pt-3 border-t">
      <span className="font-semibold text-[#0A2540]">Totale:</span>
      <span className="font-bold text-xl text-[#F4B942]">
        {stats.struttura_commissioni.commissione_totale}%
      </span>
    </div>
    
    {/* Prossimo Bonus */}
    {stats.struttura_commissioni.prossimo_bonus && (
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          🎯 Porta ancora {stats.struttura_commissioni.prossimo_bonus.clienti_necessari} clienti 
          per sbloccare {stats.struttura_commissioni.prossimo_bonus.bonus}
        </p>
      </div>
    )}
    
    {/* Bonus Milestone */}
    {stats.struttura_commissioni.bonus_milestone_mensile > 0 && (
      <div className="mt-4 p-3 bg-[#F4B942]/10 rounded-lg">
        <p className="text-sm text-[#0A2540]">
          🏆 Bonus mensile attivo: €{stats.struttura_commissioni.bonus_milestone_mensile}/mese
        </p>
      </div>
    )}
  </div>
</div>
```

---

## TASK 6: Aggiorna Landing Affiliati

File: `src/app/affiliate/page.tsx`

Aggiorna la tabella commissioni:

```tsx
<table className="w-full">
  <thead>
    <tr className="border-b">
      <th className="text-left py-2">Tuo Abbonamento</th>
      <th className="text-center py-2">Commissione Base</th>
      <th className="text-center py-2">Con 10+ Clienti</th>
      <th className="text-center py-2">Con 30+ Clienti</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b">
      <td className="py-3">Leader (€149/anno)</td>
      <td className="text-center font-medium">25%</td>
      <td className="text-center text-green-600">28%</td>
      <td className="text-center text-green-600">30%</td>
    </tr>
    <tr className="border-b">
      <td className="py-3">Mentor (€490/anno)</td>
      <td className="text-center font-medium">30%</td>
      <td className="text-center text-green-600">33%</td>
      <td className="text-center text-green-600">35%</td>
    </tr>
    <tr className="border-b">
      <td className="py-3">Mastermind</td>
      <td className="text-center font-medium">35%</td>
      <td className="text-center text-green-600">38%</td>
      <td className="text-center text-green-600">40%</td>
    </tr>
    <tr>
      <td className="py-3">Consulente</td>
      <td className="text-center font-medium">40%</td>
      <td className="text-center text-green-600">43%</td>
      <td className="text-center text-green-600">45%</td>
    </tr>
  </tbody>
</table>

{/* Bonus Milestone */}
<div className="mt-6 p-4 bg-[#F4B942]/10 rounded-lg">
  <h4 className="font-semibold text-[#0A2540] mb-2">🏆 Bonus Milestone</h4>
  <ul className="space-y-1 text-sm">
    <li>• Prima vendita: <strong>€25</strong> una tantum</li>
    <li>• 50 clienti attivi: <strong>€500/mese</strong></li>
    <li>• 100 clienti attivi: <strong>€1,000/mese</strong></li>
  </ul>
</div>

{/* Nota abbonamento richiesto */}
<div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
  ℹ️ Per diventare affiliato devi avere un abbonamento Vitaeology attivo.
  La tua commissione base dipende dal tuo livello di abbonamento.
</div>
```

---

## TASK 7: Test Completo

```bash
# 1. Verifica migrazione
psql -c "SELECT * FROM v_affiliati_commissioni LIMIT 5;"

# 2. Test calcolo commissione
psql -c "SELECT * FROM calcola_commissione_affiliato('UUID_AFFILIATO', 149.00);"

# 3. Test API registrazione
curl -X POST http://localhost:3000/api/affiliate/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","nome":"Test"}'
# Deve fallire se utente non ha abbonamento attivo

# 4. Verifica dashboard
# Accedi come affiliato, verifica nuova sezione commissioni

# 5. Verifica landing
# Vai a /affiliate, verifica tabella aggiornata
```

---

## Checklist Implementazione

- [ ] Migrazione SQL eseguita
- [ ] API register aggiornata (verifica abbonamento)
- [ ] Webhook Stripe usa `calcola_commissione_affiliato()`
- [ ] API stats restituisce `struttura_commissioni`
- [ ] Dashboard mostra breakdown commissioni
- [ ] Landing mostra nuova tabella
- [ ] Test completo superato

---

## Note Importanti

1. **Retrocompatibilità:** La colonna `commissione_percentuale` esistente viene mantenuta e aggiornata automaticamente

2. **Trigger automatico:** Quando un utente cambia abbonamento, le sue commissioni affiliato si aggiornano automaticamente

3. **Milestone:** I bonus milestone sono tracked nella tabella `affiliate_milestone_bonuses` e devono essere pagati separatamente dalle commissioni standard

4. **Cap 45%:** La commissione totale non può superare il 45%, anche con tutti i bonus

---

*Generato in conformità con VITAEOLOGY_MEGA_PROMPT v4.3*
