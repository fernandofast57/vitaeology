# GUIDA PRODUZIONE VIDEO HEYGEN
## Come Usare gli Script Vitaeology su HeyGen Avatar IV

**Versione:** 1.0
**Data:** 27 Gennaio 2026
**Per:** Fernando Marongiu - Vitaeology

---

## INDICE

1. [Panoramica Workflow](#panoramica)
2. [Setup Iniziale HeyGen](#setup)
3. [Creare un Nuovo Progetto](#nuovo-progetto)
4. [Inserire le Scene](#inserire-scene)
5. [Configurare le Direttive](#configurare-direttive)
6. [Motion Prompts - Come Funzionano](#motion-prompts)
7. [Workflow Scena per Scena](#workflow-scena)
8. [Esportazione e Quality Check](#esportazione)
9. [Troubleshooting](#troubleshooting)
10. [Checklist Produzione](#checklist)

---

<a name="panoramica"></a>
## 1. PANORAMICA WORKFLOW

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW PRODUZIONE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. SETUP AVATAR                                            │
│     └─> Seleziona/Crea avatar Fernando                      │
│     └─> Configura voce (voice clone o preset)               │
│                                                             │
│  2. CREA PROGETTO                                           │
│     └─> Nuovo video → Scegli aspect ratio                   │
│     └─> Imposta durata stimata                              │
│                                                             │
│  3. AGGIUNGI SCENE (una per volta)                          │
│     └─> Copia testo script                                  │
│     └─> Configura SHOT (inquadratura)                       │
│     └─> Configura CAMERA (movimento)                        │
│     └─> Configura MOTION (gesti avatar)                     │
│     └─> Preview e aggiusta                                  │
│                                                             │
│  4. ASSEMBLA E RIVEDI                                       │
│     └─> Preview video completo                              │
│     └─> Aggiusta timing e transizioni                       │
│                                                             │
│  5. ESPORTA                                                 │
│     └─> Render finale 1080p                                 │
│     └─> Download MP4                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

<a name="setup"></a>
## 2. SETUP INIZIALE HEYGEN

### 2.1 Accesso e Piano

1. Vai su **app.heygen.com**
2. Verifica di avere un piano che supporti **Avatar IV** (Creator o superiore)
3. Controlla i crediti disponibili

### 2.2 Configurazione Avatar

**Opzione A: Usa Avatar Stock (più veloce)**
1. Vai su **Avatars** → **Stock Avatars**
2. Cerca un avatar maschile professionale 50-60 anni
3. Seleziona e salva nei preferiti

**Opzione B: Crea Avatar Personalizzato (consigliato per Fernando)**
1. Vai su **Avatars** → **Create Avatar**
2. Carica video di Fernando (minimo 2 minuti, buona qualità)
3. Segui il wizard di creazione
4. Attendi elaborazione (24-48 ore)

### 2.3 Configurazione Voce

**Opzione A: Voice Clone (consigliato)**
1. Vai su **Voices** → **Voice Clone**
2. Carica audio di Fernando (minimo 1 minuto, voce chiara)
3. Attendi elaborazione
4. Testa con frase di prova

**Opzione B: Voce Stock Italiana**
1. Vai su **Voices** → **Stock Voices**
2. Filtra per **Italian** → **Male**
3. Scegli voce matura, professionale
4. Testa con frase di prova

### 2.4 Settings Globali Consigliati

```
┌─────────────────────────────────────────┐
│ SETTINGS HEYGEN CONSIGLIATI             │
├─────────────────────────────────────────┤
│ Avatar Engine:     Avatar IV            │
│ More Expressive:   ON                   │
│ Prompt Refinement: ON                   │
│ Auto Gestures:     OFF (usiamo manual)  │
│ Background:        Custom/Upload        │
│ Resolution:        1080p                │
└─────────────────────────────────────────┘
```

---

<a name="nuovo-progetto"></a>
## 3. CREARE UN NUOVO PROGETTO

### 3.1 Nuovo Video

1. Click **Create Video** → **AI Avatar**
2. Seleziona **Template Blank** (non usare template pre-fatti)

### 3.2 Impostazioni Progetto

| Impostazione | Video Homepage | Video Landing |
|--------------|----------------|---------------|
| **Aspect Ratio** | 16:9 (landscape) | 16:9 o 9:16 (mobile) |
| **Resolution** | 1080p | 1080p |
| **Background** | Ufficio/Studio professionale | Stesso della Homepage |

### 3.3 Background Consigliato

**Opzione 1: Background HeyGen Stock**
- Cerca "office" o "studio" nella libreria
- Scegli sfondo con libreria o ambiente professionale
- Toni caldi, non troppo luminoso

**Opzione 2: Background Custom**
- Carica immagine dello studio di Fernando
- Risoluzione minima: 1920x1080
- Evita sfondi troppo "busy"

---

<a name="inserire-scene"></a>
## 4. INSERIRE LE SCENE

### 4.1 Struttura Scene in HeyGen

In HeyGen ogni "scena" è un **blocco separato**. Per ogni scena del nostro script:

1. Click **+ Add Scene** (o duplica scena precedente)
2. Incolla il **testo parlato** (solo il dialogo, non le direttive)
3. Configura le impostazioni della scena

### 4.2 Cosa Copiare dallo Script

**DAL NOSTRO SCRIPT:**
```
═══════════════════════════════════════════════════════════════════
SCENA 1 — HOOK
═══════════════════════════════════════════════════════════════════
SHOT: CLOSE-UP
CAMERA: Slow zoom-in
MOTION: Leans slightly forward, direct eye contact, knowing expression
LIGHTING: Warm professional, soft bokeh
───────────────────────────────────────────────────────────────────
L'hai già fatto. Non te lo ricordi.

[PAUSA — 2 sec]

Parlo di guidare. Di risolvere. Di essere felice.
───────────────────────────────────────────────────────────────────
```

**IN HEYGEN COPI SOLO:**
```
L'hai già fatto. Non te lo ricordi.

Parlo di guidare. Di risolvere. Di essere felice.
```

Le direttive (SHOT, CAMERA, MOTION) le configuri nei pannelli HeyGen.

### 4.3 Gestire le Pause

Per le pause indicate come `[PAUSA — 2 sec]`:

**Metodo 1: Punteggiatura**
- Usa `...` per pause brevi (1 sec)
- Usa `.` seguito da a capo per pause medie (1.5 sec)

**Metodo 2: Scene Separate**
- Crea una scena vuota di 2 secondi
- Oppure: aggiungi silenzio nell'audio

**Metodo 3: SSML (avanzato)**
```
L'hai già fatto. <break time="2s"/> Non te lo ricordi.
```

---

<a name="configurare-direttive"></a>
## 5. CONFIGURARE LE DIRETTIVE

### 5.1 SHOT (Inquadratura)

In HeyGen, l'inquadratura si configura nel pannello **Avatar Position/Framing**:

| Nostro Codice | In HeyGen | Come Configurare |
|---------------|-----------|------------------|
| `CLOSE-UP` | Close-up / Head shot | Slider framing verso "Close" |
| `MEDIUM-CLOSE` | Medium close-up | Slider a metà-close |
| `MEDIUM` | Medium shot / Waist up | Slider centrale |
| `WIDE` | Full body | Slider verso "Wide" |

**Dove trovarlo:**
1. Seleziona la scena
2. Click sull'avatar
3. Pannello destro → **Framing** o **Avatar Size**
4. Usa lo slider o i preset

### 5.2 CAMERA (Movimento Camera)

In HeyGen, il movimento camera si configura in **Camera Movement** o **Animation**:

| Nostro Codice | In HeyGen | Come Configurare |
|---------------|-----------|------------------|
| `Slow zoom-in` | Zoom In (Slow) | Camera → Zoom In, Speed: Slow |
| `Locked` | Static / No movement | Camera → None / Static |
| `Gentle push-in` | Dolly In (Subtle) | Camera → Push In, Intensity: Low |
| `Subtle zoom-out` | Zoom Out (Slow) | Camera → Zoom Out, Speed: Slow |

**Dove trovarlo:**
1. Seleziona la scena
2. Pannello destro → **Camera** o **Animation**
3. Scegli il tipo di movimento
4. Regola velocità/intensità

### 5.3 LIGHTING

HeyGen non ha controllo diretto sul lighting, ma puoi influenzarlo con:

1. **Background**: Scegli sfondi con illuminazione calda
2. **Color Grading**: Post-produzione se necessario
3. **Avatar Settings**: Alcuni avatar hanno opzioni di illuminazione

Il nostro standard `Warm professional, soft bokeh` si ottiene con:
- Background con toni caldi
- Evitare sfondi troppo contrastati
- Avatar ben illuminato (default di solito ok)

---

<a name="motion-prompts"></a>
## 6. MOTION PROMPTS - COME FUNZIONANO

### 6.1 Cosa Sono

I Motion Prompts sono istruzioni testuali che dicono all'avatar come muoversi e quale espressione avere. In HeyGen Avatar IV si inseriscono nel campo **"Motion Prompt"** o **"Avatar Behavior"**.

### 6.2 Dove Inserirli

1. Seleziona la scena
2. Click sull'avatar
3. Cerca il campo **"Motion"**, **"Gesture"**, o **"Avatar Prompt"**
4. Incolla il motion prompt dal nostro script

### 6.3 Traduzione dei Nostri Motion Prompts

| Nostro Motion Prompt | Cosa Fa |
|---------------------|---------|
| `Leans slightly forward, direct eye contact, knowing expression` | Si sporge, guarda in camera, espressione consapevole |
| `Open hand gesture while explaining` | Gesto mani aperte mentre spiega |
| `Softens expression, leans in slightly, understanding nod` | Espressione morbida, si avvicina, annuisce comprensivo |
| `Nods confidently, meaningful pause` | Annuisce sicuro, pausa significativa |
| `Warm smile, gentle nod, relaxed posture` | Sorriso caldo, annuisce gentile, postura rilassata |
| `Raises eyebrow slightly, confident half-smile` | Alza sopracciglio, mezzo sorriso sicuro |
| `Tilts head thoughtfully` | Inclina testa pensieroso |
| `Speaks naturally, occasional gentle nods` | Parla naturalmente, annuisce ogni tanto |
| `Points toward camera` | Indica verso la camera |

### 6.4 Best Practices Motion Prompts

```
✅ DO:
- Un gesto principale per scena
- Emozione coerente col testo
- Movimento sottile, non esagerato

❌ DON'T:
- Troppi gesti nella stessa scena
- Movimenti contraddittori
- Espressioni non coerenti col tono
```

### 6.5 Se HeyGen Non Supporta Motion Prompts Testuali

Alcuni piani/versioni potrebbero non avere motion prompts testuali. Alternative:

1. **Gesture Library**: Scegli gesti predefiniti dalla libreria
2. **Expression Presets**: Usa preset emotivi (Happy, Serious, Thoughtful)
3. **Auto Gestures**: Attiva e lascia che HeyGen generi automaticamente

---

<a name="workflow-scena"></a>
## 7. WORKFLOW SCENA PER SCENA

### 7.1 Esempio Pratico: Scena 1 Homepage

**Dallo script:**
```
SCENA 1 — HOOK
SHOT: CLOSE-UP
CAMERA: Slow zoom-in
MOTION: Leans slightly forward, direct eye contact, knowing expression

Testo: "L'hai già fatto. Non te lo ricordi. [PAUSA] Parlo di guidare. Di risolvere. Di essere felice."
```

**In HeyGen:**

| Step | Azione |
|------|--------|
| 1 | Crea nuova scena |
| 2 | Incolla testo: `L'hai già fatto. Non te lo ricordi... Parlo di guidare. Di risolvere. Di essere felice.` |
| 3 | Avatar Framing: Sposta slider verso **Close-up** |
| 4 | Camera Movement: Seleziona **Zoom In**, Speed: **Slow** |
| 5 | Motion Prompt: `Leans slightly forward, direct eye contact, knowing expression` |
| 6 | Preview scena |
| 7 | Aggiusta se necessario |

### 7.2 Checklist Per Ogni Scena

```
□ Testo incollato (solo dialogo, no direttive)
□ Inquadratura configurata (SHOT)
□ Movimento camera configurato (CAMERA)
□ Motion prompt inserito (MOTION)
□ Preview eseguita
□ Timing verificato
□ Transizione dalla scena precedente ok
```

### 7.3 Transizioni Tra Scene

**Consigliato:**
- **Cut secco** tra la maggior parte delle scene
- **Dissolve breve (0.5s)** solo per cambi emotivi importanti
- **Nessuna transizione fancy** (no wipe, slide, etc.)

---

<a name="esportazione"></a>
## 8. ESPORTAZIONE E QUALITY CHECK

### 8.1 Preview Completa

Prima di esportare:

1. **Play dall'inizio alla fine** senza interruzioni
2. Verifica:
   - [ ] Timing naturale (non troppo veloce)
   - [ ] Transizioni fluide
   - [ ] Audio chiaro
   - [ ] Gesti coerenti
   - [ ] Nessun glitch visivo

### 8.2 Settings Esportazione

```
┌─────────────────────────────────────────┐
│ SETTINGS EXPORT                         │
├─────────────────────────────────────────┤
│ Resolution:     1080p (1920x1080)       │
│ Format:         MP4                     │
│ Quality:        High                    │
│ Frame Rate:     30fps (o 24fps)         │
│ Audio:          Incluso                 │
└─────────────────────────────────────────┘
```

### 8.3 Quality Check Post-Export

Dopo il download, verifica:

| Check | Cosa Verificare |
|-------|-----------------|
| **Audio** | Voce chiara, no distorsioni, volume costante |
| **Video** | No artefatti, lip-sync corretto |
| **Timing** | Pause naturali, ritmo giusto |
| **Gesti** | Coerenti col parlato, non ripetitivi |
| **Transizioni** | Fluide, non brusche |

### 8.4 Naming Convention File

```
vitaeology_homepage_v1_2026-01-27.mp4
vitaeology_landing_leadership_v1_2026-01-27.mp4
vitaeology_landing_ostacoli_v1_2026-01-27.mp4
vitaeology_landing_microfelicita_v1_2026-01-27.mp4
```

---

<a name="troubleshooting"></a>
## 9. TROUBLESHOOTING

### 9.1 Problemi Comuni e Soluzioni

| Problema | Causa Probabile | Soluzione |
|----------|-----------------|-----------|
| **Lip-sync non allineato** | Testo troppo veloce | Aggiungi pause, rallenta |
| **Gesti ripetitivi** | Auto-gestures attivo | Disattiva, usa manual |
| **Avatar "robotico"** | More Expressive OFF | Attiva More Expressive |
| **Inquadratura sbagliata** | Framing non salvato | Verifica per ogni scena |
| **Audio basso** | Settings voce | Aumenta volume in export |
| **Video troppo lungo** | Troppe pause | Riduci pause, taglia |
| **Transizioni brusche** | Cut troppo secchi | Aggiungi micro-dissolve |

### 9.2 Se il Motion Prompt Non Funziona

1. **Semplifica**: Usa prompt più corti
2. **Inglese**: Prova a scrivere in inglese
3. **Preset**: Usa gesture preset invece di testo
4. **Supporto**: Contatta HeyGen support

### 9.3 Se la Voce Suona Innaturale

1. **Punteggiatura**: Aggiungi virgole per pause naturali
2. **Frasi corte**: Spezza frasi lunghe
3. **SSML**: Usa tag per controllo fine
4. **Altra voce**: Prova voce diversa

---

<a name="checklist"></a>
## 10. CHECKLIST PRODUZIONE COMPLETA

### 10.1 Pre-Produzione

```
□ Account HeyGen attivo con crediti sufficienti
□ Avatar selezionato/creato
□ Voce configurata e testata
□ Background scelto
□ Script stampato/disponibile
```

### 10.2 Produzione (Per Ogni Video)

```
□ Nuovo progetto creato
□ Aspect ratio corretto
□ Background impostato

Per ogni scena:
  □ Testo incollato
  □ SHOT configurato
  □ CAMERA configurato
  □ MOTION inserito
  □ Preview singola scena ok

□ Preview video completo
□ Timing totale verificato
□ Transizioni verificate
```

### 10.3 Post-Produzione

```
□ Export in 1080p
□ Quality check audio
□ Quality check video
□ File nominato correttamente
□ Backup salvato
```

### 10.4 Deployment

```
□ Upload su hosting (Vimeo/YouTube/Vercel)
□ Embed code generato
□ Test su pagina live
□ Test su mobile
□ Velocità caricamento ok
```

---

## TIMELINE PRODUZIONE STIMATA

| Video | Scene | Tempo Stimato |
|-------|-------|---------------|
| Homepage (120s) | 6 | 2-3 ore |
| Landing Leadership (60s) | 6 | 1-2 ore |
| Landing Ostacoli (60s) | 6 | 1-2 ore |
| Landing Microfelicità (60s) | 6 | 1-2 ore |
| **TOTALE** | **24** | **6-10 ore** |

*Tempo per operatore con esperienza HeyGen. Prima volta: raddoppiare.*

---

## RISORSE UTILI

- **HeyGen Help Center**: help.heygen.com
- **HeyGen Academy**: academy.heygen.com
- **Avatar IV Documentation**: Cerca "Avatar IV" nell'help center
- **Voice Clone Guide**: help.heygen.com/voice-clone

---

*Guida creata per Vitaeology - Gennaio 2026*
*Compatibile con HeyGen Avatar IV*
