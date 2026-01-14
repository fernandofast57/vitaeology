# Guida Scelta Hosting Video per Vitaeology

## Contesto

Dobbiamo ospitare **24 video** generati con HeyGen:
- 3 video hero (landing page delle 3 challenge)
- 21 video giornalieri (7 giorni × 3 challenge)

I video verranno embeddati nelle pagine della piattaforma Vitaeology.

---

## Opzioni Disponibili

### 1. YouTube (Unlisted)

**Costo:** Gratis

**Come funziona:**
- Crei un canale YouTube (o usi uno esistente)
- Carichi i video come "Non in elenco" (unlisted)
- I video non appaiono nelle ricerche, solo chi ha il link può vederli
- Embeddi il player YouTube nelle pagine

**Pro:**
- Zero costi
- Bandwidth illimitato
- CDN globale (caricamento veloce ovunque)
- Nessun limite di storage

**Contro:**
- Potenziali pubblicità (raro su canali piccoli/video nuovi)
- Logo YouTube visibile nel player
- L'utente può cliccare e uscire verso YouTube
- Look meno "premium"

**Ideale per:** Test iniziale, budget zero, MVP

---

### 2. Vimeo Pro

**Costo:** ~€16/mese (€192/anno)

**Come funziona:**
- Account Vimeo Pro
- Carichi i video
- Player pulito senza branding
- Controlli avanzati sull'embed

**Pro:**
- Zero pubblicità
- Player personalizzabile (colori, controlli)
- Nessun logo Vimeo (se vuoi)
- Look professionale
- Analytics sui video

**Contro:**
- Costo mensile
- Limite storage (dipende dal piano)

**Ideale per:** Prodotto professionale, brand curato

---

### 3. Bunny Stream

**Costo:** ~€1 per 1000 visualizzazioni

**Come funziona:**
- Servizio di streaming dedicato
- Carichi video, ottieni URL per embed
- Player neutro, nessun branding

**Pro:**
- Molto economico
- Nessun branding esterno
- Buona qualità streaming
- Pay-per-use (paghi solo quello che usi)

**Contro:**
- Richiede setup tecnico
- Meno conosciuto
- Dashboard meno intuitiva

**Ideale per:** Chi vuole controllo totale a basso costo

---

### 4. HeyGen CDN (URL diretti)

**Costo:** Incluso nell'abbonamento HeyGen

**Come funziona:**
- Quando generi un video su HeyGen, ottieni un URL diretto
- Embeddi direttamente quel URL

**Pro:**
- Già pagato con HeyGen
- Zero setup aggiuntivo
- Video MP4 diretto, nessun player esterno

**Contro:**
- Non chiaro se gli URL scadono
- Potenziali limiti di bandwidth
- Meno controllo

**Ideale per:** Soluzione rapida se gli URL sono permanenti

---

## Confronto Rapido

| Criterio | YouTube | Vimeo Pro | Bunny | HeyGen |
|----------|---------|-----------|-------|--------|
| Costo | €0 | €16/mese | ~€1/1000 views | €0 (incluso) |
| Ads | Possibili | No | No | No |
| Branding esterno | Sì | No (opzionale) | No | No |
| Setup | Facile | Facile | Medio | Facile |
| Look professionale | Medio | Alto | Alto | Alto |
| Affidabilità | Altissima | Alta | Alta | Da verificare |

---

## Domande da Considerare

1. **Budget:** Possiamo spendere €16/mese per un look più professionale?

2. **Ads:** Le pubblicità su YouTube sarebbero un problema per il brand?

3. **Controllo:** Vogliamo controllo totale sul player o va bene un player esterno?

4. **Scala:** Quante visualizzazioni prevediamo? (100/mese vs 10.000/mese cambia i costi)

5. **Velocità:** Quanto velocemente dobbiamo andare live?

---

## Raccomandazione

**Fase 1 (MVP/Test):**
→ **YouTube Unlisted** - Zero costi, veloce da implementare, vediamo come va.

**Fase 2 (Se il progetto scala):**
→ **Vimeo Pro** - €16/mese per look professionale senza ads.

**Alternativa se vuoi subito qualità:**
→ **Vimeo Pro** da subito - €192/anno è poco rispetto al valore percepito del prodotto.

---

## Prossimi Passi

1. Scegli la piattaforma
2. Crea account (se necessario)
3. Fammi sapere quale hai scelto
4. Ti preparo gli script per i 24 video
5. Generi i video su HeyGen
6. Carichi sulla piattaforma scelta
7. Mi dai gli URL e li integro nel codice

---

## Note Tecniche

Il componente `VideoPlaceholder.tsx` è già pronto. Supporta:
- Video MP4 diretti (HeyGen, Bunny)
- Può essere esteso per YouTube/Vimeo embed

Basta comunicarmi la scelta e adatto il codice di conseguenza.
