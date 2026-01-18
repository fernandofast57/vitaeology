# Exercise-Dimension Mapping Reference

## Overview

Questo documento descrive il mapping tra le dimensioni degli assessment e gli esercizi.
Ogni esercizio ha un `dimension_code` che lo collega direttamente alla dimensione dell'assessment.

## Ordine di Esecuzione SQL

```bash
1. 00_add_dimension_code.sql   # Aggiunge colonna dimension_code
2. 01_risolutore_exercises.sql # 14 esercizi Risolutore
3. 02_microfelicita_exercises.sql # 26 esercizi Microfelicita
```

---

## RISOLUTORE (7 Dimensioni - 14 Esercizi)

### Filtri (Capacita)

| Code | Dimensione | Pillar | Esercizi |
|------|------------|--------|----------|
| FP | Detective dei Pattern | PENSARE | FP-1, FP-2 |
| FS | Antenna dei Segnali | SENTIRE | FS-1, FS-2 |
| FR | Radar delle Risorse | AGIRE | FR-1, FR-2 |

### Traditori (Blocchi)

| Code | Dimensione | Pillar | Esercizi |
|------|------------|--------|----------|
| TP | Il Paralizzante | PENSARE | TP-1, TP-2 |
| TT | Il Timoroso | SENTIRE | TT-1, TT-2 |
| TC | Il Procrastinatore | AGIRE | TC-1, TC-2 |

### Scala

| Code | Dimensione | Pillar | Esercizi |
|------|------------|--------|----------|
| SR | Scala Risolutore | ESSERE | SR-1, SR-2 |

---

## MICROFELICITA (13 Dimensioni - 26 Esercizi)

### R.A.D.A.R. (5 Fasi)

| Code | Dimensione | Pillar | Esercizi |
|------|------------|--------|----------|
| RR | Rileva | SENTIRE | RR-1, RR-2 |
| RA | Accogli | ESSERE | RA-1, RA-2 |
| RD | Distingui | PENSARE | RD-1, RD-2 |
| RM | Amplifica | SENTIRE | RM-1, RM-2 |
| RS | Resta | ESSERE | RS-1, RS-2 |

### Sabotatori (5 Tipi)

| Code | Dimensione | Pillar | Esercizi |
|------|------------|--------|----------|
| SM | Minimizzazione Istantanea | PENSARE | SM-1, SM-2 |
| SA | Anticipo Protettivo | SENTIRE | SA-1, SA-2 |
| SI | Auto-Interruzione Cognitiva | PENSARE | SI-1, SI-2 |
| SC | Cambio Fuoco Immediato | SENTIRE | SC-1, SC-2 |
| SE | Correzione Emotiva | ESSERE | SE-1, SE-2 |

### Livelli (3 Campi)

| Code | Dimensione | Pillar | Esercizi |
|------|------------|--------|----------|
| L1 | Campo Interno | ESSERE | L1-1, L1-2 |
| L2 | Spazio Relazionale | SENTIRE | L2-1, L2-2 |
| L3 | Campo dei Contesti | AGIRE | L3-1, L3-2 |

---

## Mapping Pillar Riepilogo

### ESSERE (Visione)
- Risolutore: SR
- Microfelicita: RA, RS, SE, L1

### SENTIRE (Relazioni)
- Risolutore: FS, TT
- Microfelicita: RR, RM, SA, SC, L2

### PENSARE (Adattamento)
- Risolutore: FP, TP
- Microfelicita: RD, SM, SI

### AGIRE (Azione)
- Risolutore: FR, TC
- Microfelicita: L3

---

## Query Utili

### Esercizi per dimensione specifica
```sql
SELECT * FROM exercises
WHERE dimension_code = 'FP'
ORDER BY difficulty_level;
```

### Conteggio esercizi per pillar
```sql
SELECT pillar_primary, COUNT(*) as total
FROM exercises
WHERE dimension_code IS NOT NULL
GROUP BY pillar_primary;
```

### Esercizi per libro e dimensione
```sql
SELECT book_slug, dimension_code, COUNT(*) as exercises
FROM exercises
WHERE source_type = 'dimension'
GROUP BY book_slug, dimension_code
ORDER BY book_slug, dimension_code;
```

---

## Logica di Raccomandazione

1. Utente completa assessment (Risolutore o Microfelicita)
2. Sistema identifica le dimensioni con punteggio piu basso
3. Sistema recupera esercizi per quelle dimensioni usando `dimension_code`
4. Esercizi vengono ordinati per difficolta (base -> intermedio -> avanzato)
5. Viene presentato prima l'esercizio base della dimensione prioritaria
