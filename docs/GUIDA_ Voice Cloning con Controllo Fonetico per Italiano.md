# GUIDA: Voice Cloning con Controllo Fonetico per Italiano
## Piattaforme con SSML e IPA per Espressività Avanzata

---

## 🎯 IL PROBLEMA CON HEYGEN

**Limitazioni HeyGen per Italiano:**
- ❌ Voice cloning poco espressivo in italiano
- ❌ Nessun controllo fonetico (SSML/IPA)
- ❌ Intonazione piatta, robotica
- ❌ Pronuncia errata nomi propri/tecnici
- ❌ Impossibile controllare pause, enfasi, tono

**Cosa serve:**
- ✅ Controllo fonetico (IPA o CMU Arpabet)
- ✅ SSML (Speech Synthesis Markup Language)
- ✅ Espressività italiana naturale
- ✅ Cloning voce da campioni brevi (1-5 minuti)

---

## 🏆 TOP 3 PIATTAFORME CONSIGLIATE

### 1. **ELEVENLABS** (Miglior Scelta Generale)

#### Perché ElevenLabs è il Migliore

**Pro:**
- ✅ **SSML completo** con phoneme tags (IPA + CMU)
- ✅ **Italiano nativo** eccellente (non tradotto)
- ✅ **Voice cloning** da 1 minuto audio (Instant) o 30 minuti (Professional)
- ✅ **32+ lingue** automatiche (clone voce funziona in tutte)
- ✅ **Pronunciation Dictionary** (salva correzioni fonetiche)
- ✅ **Emotional range** configurabile (stability, similarity, style)
- ✅ **API robusta** per integrazione
- ✅ **Qualità audio** superiore (44.1kHz)

**Contro:**
- ❌ Costo medio-alto (€22-99/mese)
- ❌ Curva apprendimento SSML/IPA

---

#### Pricing ElevenLabs

| Piano | Prezzo/mese | Caratteri/mese | Voice Cloning | SSML/IPA |
|-------|-------------|----------------|---------------|----------|
| **Free** | €0 | 10.000 | 3 voci instant | ✅ |
| **Starter** | €5 | 30.000 | 10 voci instant | ✅ |
| **Creator** | €22 | 100.000 | 30 voci instant | ✅ |
| **Pro** | €99 | 500.000 | 160 voci instant + Professional | ✅ |
| **Scale** | €330 | 2M | Unlimited | ✅ |

**Consiglio:** Inizia con **Creator (€22/mese)** per testare voice cloning + SSML avanzato.

---

#### Come Usare SSML/IPA in ElevenLabs

**Esempio 1: Correggere Pronuncia Nome**

```xml
<speak>
  Ciao, sono <phoneme alphabet="ipa" ph="ferˈnando">Fernando</phoneme> 
  <phoneme alphabet="ipa" ph="maroŋˈɡiu">Marongiu</phoneme>.
</speak>
```

**Esempio 2: Controllare Pause ed Enfasi**

```xml
<speak>
  La leadership <emphasis level="strong">autentica</emphasis> 
  <break time="500ms"/> 
  non è un talento innato, 
  <break time="1s"/> 
  ma una competenza che si sviluppa.
</speak>
```

**Esempio 3: Cambiare Velocità e Tono**

```xml
<speak>
  <prosody rate="slow" pitch="-2st">
    Questa frase è lenta e con tono più basso.
  </prosody>
  
  <prosody rate="fast" pitch="+3st">
    Questa è veloce e con tono più alto!
  </prosody>
</speak>
```

**Esempio 4: Pronunciation Dictionary (Permanente)**

Invece di usare SSML ogni volta, salva correzioni:

1. Vai su ElevenLabs → Settings → Pronunciation Dictionary
2. Aggiungi entry:
   - **Parola:** Vitaeology
   - **IPA:** /vitaˈɔlodʒi/
   - **Tipo:** Alias (o Phoneme)
3. Ora ogni volta che scrivi "Vitaeology", usa pronuncia corretta

---

#### Workflow Completo ElevenLabs

**Step 1: Clone Voce Fernando**

1. Vai su **Voice Lab** → **Add Voice** → **Instant Voice Cloning**
2. Registra 1-5 minuti audio:
   - Ambiente silenzioso
   - Microfono qualità (non smartphone)
   - Leggi testo vario (domande, affermazioni, emozioni)
   - Evita rumori di fondo, respiri forti
3. Upload audio → Nome voce: "Fernando Autentico"
4. ElevenLabs processa (2-5 minuti)

**Tip:** Per qualità superiore, usa **Professional Voice Cloning** (30 minuti audio, €99/mese).

---

**Step 2: Testare Espressività**

1. Vai su **Speech Synthesis**
2. Seleziona voce "Fernando Autentico"
3. Configura parametri:
   - **Stability:** 0.5-0.7 (più basso = più variazione emotiva)
   - **Similarity:** 0.7-0.9 (fedeltà alla voce originale)
   - **Style Exaggeration:** 0.3-0.5 (enfasi espressiva)
4. Scrivi testo test:

```
Ciao, sono Fernando. Oggi parliamo di leadership autentica. 
Sai qual è il segreto? Non è il carisma. È la vulnerabilità.
```

5. Genera audio → Ascolta → Itera parametri

---

**Step 3: Aggiungere SSML per Controllo Fino**

```xml
<speak>
  Ciao, sono <phoneme alphabet="ipa" ph="ferˈnando">Fernando</phoneme>.
  <break time="500ms"/>
  
  Oggi parliamo di <emphasis level="strong">leadership autentica</emphasis>.
  <break time="800ms"/>
  
  Sai qual è il segreto? 
  <break time="1s"/>
  
  <prosody rate="slow" pitch="-1st">
    Non è il carisma.
  </prosody>
  <break time="500ms"/>
  
  <prosody rate="medium" pitch="+2st" volume="loud">
    È la vulnerabilità.
  </prosody>
</speak>
```

---

**Step 4: Salvare Pronunciation Dictionary**

Per termini ricorrenti (Vitaeology, Barrios, etc.):

1. Settings → Pronunciation Dictionary → Add
2. Inserisci:
   - **Vitaeology:** /vitaˈɔlodʒi/
   - **Barrios:** /ˈbarrios/ (non "barrios" inglese)
   - **Marongiu:** /maroŋˈɡiu/
3. Salva → Ora funziona in tutti i testi

---

**Step 5: Integrare in Produzione**

**Opzione A: Web UI** (per contenuti singoli)
- Genera audio → Download MP3/WAV
- Usa in video, podcast, etc.

**Opzione B: API** (per automazione)

```python
import requests

url = "https://api.elevenlabs.io/v1/text-to-speech/VOICE_ID"
headers = {
    "xi-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "text": "<speak>Ciao, sono Fernando...</speak>",
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {
        "stability": 0.6,
        "similarity_boost": 0.8,
        "style": 0.4
    }
}

response = requests.post(url, json=data, headers=headers)
with open("output.mp3", "wb") as f:
    f.write(response.content)
```

---

### 2. **RESEMBLE AI** (Miglior per Enterprise)

#### Perché Resemble AI

**Pro:**
- ✅ **SSML completo** (pause, enfasi, velocità)
- ✅ **Voice cloning** da 3 minuti audio
- ✅ **Italiano nativo** supportato
- ✅ **Speech-to-Speech** real-time (converti voce live)
- ✅ **Localization** (clone voce inglese → italiano automatico)
- ✅ **Watermarking** (protezione deepfake)
- ✅ **On-premise** deployment (per dati sensibili)

**Contro:**
- ❌ Più costoso di ElevenLabs (€200-500+/mese)
- ❌ Meno documentazione pubblica SSML
- ❌ Qualità italiana leggermente inferiore a ElevenLabs

---

#### Pricing Resemble AI

| Piano | Prezzo/mese | Caratteri/mese | Voice Cloning | SSML |
|-------|-------------|----------------|---------------|------|
| **Basic** | €0.06/sec | Pay-as-you-go | ✅ | ✅ |
| **Pro** | Custom | Custom | ✅ | ✅ |
| **Enterprise** | Custom | Unlimited | ✅ | ✅ |

**Consiglio:** Contatta sales per quote personalizzato (minimo ~€200/mese).

---

#### Workflow Resemble AI

**Step 1: Clone Voce**

1. Vai su **Voice Cloning** → Upload 3-10 minuti audio
2. Resemble processa (10-30 minuti)
3. Voce disponibile in dashboard

**Step 2: Usare SSML**

```xml
<speak>
  <prosody rate="0.9" pitch="+2st">
    Ciao, sono Fernando Marongiu.
  </prosody>
  <break time="500ms"/>
  
  <emphasis level="strong">Vitaeology</emphasis> 
  è il mio metodo per sviluppare leadership autentica.
</speak>
```

**Step 3: Speech-to-Speech (Bonus)**

Funzionalità unica Resemble: converti voce live in clone.

1. Registra audio con tua voce naturale (con emozioni)
2. Resemble converte in clone mantenendo intonazione
3. Risultato: Espressività naturale + voce clonata

**Caso d'uso:** Registri video con tua voce vera, poi sostituisci con clone per privacy.

---

### 3. **SPEECHIFY** (Alternativa Budget-Friendly)

#### Perché Speechify

**Pro:**
- ✅ **Voice cloning** gratuito (30 secondi audio)
- ✅ **Italiano supportato**
- ✅ **No signup** per test
- ✅ **Facile da usare** (no curva apprendimento)

**Contro:**
- ❌ **NO SSML** (nessun controllo fonetico)
- ❌ Qualità inferiore a ElevenLabs/Resemble
- ❌ Espressività limitata
- ❌ Non adatto per produzione professionale

**Consiglio:** Usa solo per test rapidi, non per Vitaeology.

---

## 📚 GUIDA IPA (International Phonetic Alphabet) per Italiano

### Perché Serve IPA

**Problema:** AI non sa pronunciare nomi propri, tecnicismi, parole straniere.

**Soluzione:** Usa IPA per specificare pronuncia esatta.

---

### IPA Italiano - Simboli Principali

#### Vocali

| Lettera | IPA | Esempio | Pronuncia |
|---------|-----|---------|-----------|
| a | /a/ | casa | ˈkasa |
| e (aperta) | /ɛ/ | bello | ˈbɛllo |
| e (chiusa) | /e/ | mela | ˈmela |
| i | /i/ | vino | ˈvino |
| o (aperta) | /ɔ/ | porta | ˈpɔrta |
| o (chiusa) | /o/ | sole | ˈsole |
| u | /u/ | luna | ˈluna |

#### Consonanti

| Lettera | IPA | Esempio | Pronuncia |
|---------|-----|---------|-----------|
| b | /b/ | bello | ˈbɛllo |
| c (+ a,o,u) | /k/ | casa | ˈkasa |
| c (+ e,i) | /tʃ/ | ciao | tʃao |
| d | /d/ | dado | ˈdado |
| f | /f/ | fatto | ˈfatto |
| g (+ a,o,u) | /ɡ/ | gatto | ˈɡatto |
| g (+ e,i) | /dʒ/ | gente | ˈdʒɛnte |
| gl | /ʎ/ | figlio | ˈfiʎʎo |
| gn | /ɲ/ | gnomo | ˈɲɔmo |
| l | /l/ | latte | ˈlatte |
| m | /m/ | mamma | ˈmamma |
| n | /n/ | nonna | ˈnɔnna |
| p | /p/ | papà | paˈpa |
| r | /r/ | rosso | ˈrosso |
| s (sorda) | /s/ | sole | ˈsole |
| s (sonora) | /z/ | casa | ˈkaza |
| sc (+ e,i) | /ʃ/ | scena | ˈʃɛna |
| t | /t/ | tavolo | ˈtavolo |
| v | /v/ | vino | ˈvino |
| z (sorda) | /ts/ | grazie | ˈɡrattsie |
| z (sonora) | /dz/ | zero | ˈdzɛro |

---

### Esempi Pratici Vitaeology

#### Nome: Fernando Marongiu

**Trascrizione IPA:**
```
Fernando: /ferˈnando/
Marongiu: /maroŋˈɡiu/
```

**SSML ElevenLabs:**
```xml
<phoneme alphabet="ipa" ph="ferˈnando">Fernando</phoneme>
<phoneme alphabet="ipa" ph="maroŋˈɡiu">Marongiu</phoneme>
```

---

#### Termine: Vitaeology

**Trascrizione IPA:**
```
Vitaeology: /vitaˈɔlodʒi/
```

**SSML:**
```xml
<phoneme alphabet="ipa" ph="vitaˈɔlodʒi">Vitaeology</phoneme>
```

---

#### Termine: Leadership Autentica

**Trascrizione IPA:**
```
Leadership: /ˈlidərʃip/ (inglese) o /ˈliderʃip/ (italianizzato)
Autentica: /auˈtɛntika/
```

**SSML:**
```xml
<phoneme alphabet="ipa" ph="ˈliderʃip">Leadership</phoneme>
<phoneme alphabet="ipa" ph="auˈtɛntika">autentica</phoneme>
```

---

### Tool per Generare IPA

**1. IPA Reader** (https://ipa-reader.com/)
- Inserisci testo italiano
- Genera trascrizione IPA automatica
- Ascolta pronuncia

**2. EasyPronunciation** (https://easypronunciation.com/it/)
- Converte testo italiano → IPA
- Supporta enfasi (ˈ) e pause

**3. Manuale:**
- Usa tabella sopra
- Enfasi: ˈ prima della sillaba accentata (es. ˈkasa)
- Lunghezza: ː dopo vocale lunga (raro in italiano)

---

## 🎬 WORKFLOW CONSIGLIATO PER VITAEOLOGY

### Scenario: Video Corso Leadership con Voce Clonata Fernando

#### Step 1: Preparazione (1 volta)

1. **Registra campione voce Fernando** (5 minuti)
   - Ambiente silenzioso
   - Microfono Rode NT-USB o simile
   - Leggi script vario:
     - Introduzione personale
     - Spiegazione concetto leadership
     - Domande retoriche
     - Affermazioni enfatiche
     - Tono conversazionale

2. **Carica su ElevenLabs** → Professional Voice Cloning
   - Tempo processing: 30 minuti
   - Costo: €99/mese (piano Pro)

3. **Crea Pronunciation Dictionary**
   - Vitaeology: /vitaˈɔlodʒi/
   - Barrios: /ˈbarrios/
   - Marongiu: /maroŋˈɡiu/
   - Altri termini tecnici

---

#### Step 2: Produzione Contenuti (Ricorrente)

**Per ogni video/lezione:**

1. **Scrivi script** (Google Docs)
   - Testo naturale, conversazionale
   - Segna pause con `[PAUSA 1s]`
   - Segna enfasi con `**parola**`

2. **Converti in SSML** (manuale o script Python)

```python
def text_to_ssml(text):
    # Sostituisci [PAUSA Xs] con <break time="Xs"/>
    text = re.sub(r'\[PAUSA (\d+)s\]', r'<break time="\1s"/>', text)
    
    # Sostituisci **parola** con <emphasis>parola</emphasis>
    text = re.sub(r'\*\*(.*?)\*\*', r'<emphasis level="strong">\1</emphasis>', text)
    
    # Wrap in <speak>
    return f"<speak>{text}</speak>"

script = """
Ciao, sono Fernando. [PAUSA 1s]
Oggi parliamo di **leadership autentica**. [PAUSA 2s]
Il framework Vitaeology si basa su 26 anni di ricerca.
"""

ssml = text_to_ssml(script)
print(ssml)
```

3. **Genera audio ElevenLabs**
   - API o Web UI
   - Download MP3 (44.1kHz)

4. **Sincronizza con video**
   - Import audio in editor (Premiere, DaVinci)
   - Sincronizza con avatar/slides

---

#### Step 3: Ottimizzazione (Iterativo)

**Test A/B parametri voce:**

| Parametro | Valore A | Valore B | Migliore per |
|-----------|----------|----------|--------------|
| Stability | 0.5 | 0.7 | A = emotivo, B = stabile |
| Similarity | 0.8 | 0.9 | B = più fedele |
| Style | 0.3 | 0.5 | B = più espressivo |

**Raccogli feedback:**
- Invia campioni a 5-10 persone
- Domanda: "Suona naturale? Troppo robotico?"
- Itera parametri

---

## 💰 CONFRONTO COSTI

### Scenario: 100 Video da 10 Minuti (1.000 Minuti Audio)

| Piattaforma | Piano | Costo Setup | Costo Mensile | Costo/Video | Totale Anno 1 |
|-------------|-------|-------------|---------------|-------------|---------------|
| **HeyGen Pro** | Pro | €0 | €89 | €0.89 | €1.068 |
| **ElevenLabs** | Pro | €0 | €99 | €0.99 | €1.188 |
| **Resemble AI** | Pro | €500 | €250 | €2.50 | €3.500 |
| **Speechify** | Free | €0 | €0 | €0 | €0 |

**Nota:** HeyGen costa meno ma qualità italiana inferiore. ElevenLabs miglior rapporto qualità/prezzo.

---

## 🎯 RACCOMANDAZIONE FINALE PER FERNANDO

### Soluzione Ottimale: **ElevenLabs Pro (€99/mese)**

**Perché:**
1. ✅ **Qualità italiana superiore** - Espressività naturale
2. ✅ **SSML/IPA completo** - Controllo totale pronuncia
3. ✅ **Professional Voice Cloning** - Clone fedele da 30 min audio
4. ✅ **Pronunciation Dictionary** - Salva correzioni permanenti
5. ✅ **API robusta** - Automazione produzione contenuti
6. ✅ **32+ lingue** - Clone funziona in tutte (futuro internazionalizzazione)

**ROI:**
- Costo: €99/mese = €1.188/anno
- Risparmio tempo: 10 ore/mese (no registrazione voce) = €500-1.000/mese valore
- Scalabilità: Produci 100+ video/anno senza ri-registrare
- **Break-even:** 2-3 mesi

---

### Piano B: **Resemble AI** (se serve Speech-to-Speech)

**Quando usare:**
- Vuoi registrare con voce naturale (emozioni vere)
- Poi sostituire con clone per privacy
- Budget >€200/mese

---

### Piano C: **HeyGen + ElevenLabs Hybrid**

**Workflow:**
1. Genera audio con **ElevenLabs** (voce espressiva)
2. Usa **HeyGen** solo per avatar video (sincronizza con audio ElevenLabs)
3. Best of both worlds: Voce perfetta + Avatar realistico

**Costo:** €89 (HeyGen) + €99 (ElevenLabs) = **€188/mese**

---

## 📋 CHECKLIST IMPLEMENTAZIONE

### Settimana 1: Setup

- [ ] Registrare 30 minuti campione voce Fernando
- [ ] Creare account ElevenLabs Pro (€99/mese)
- [ ] Caricare audio → Professional Voice Cloning
- [ ] Testare qualità clone (5 script diversi)
- [ ] Creare Pronunciation Dictionary (10 termini chiave)

### Settimana 2: Test

- [ ] Scrivere 3 script test (intro, lezione, CTA)
- [ ] Convertire in SSML con pause/enfasi
- [ ] Generare audio con parametri diversi
- [ ] A/B test con 10 persone
- [ ] Scegliere parametri ottimali

### Settimana 3: Produzione

- [ ] Scrivere script primo video corso (10 lezioni)
- [ ] Generare audio tutte le lezioni
- [ ] Sincronizzare con slides/avatar
- [ ] Review qualità finale
- [ ] Pubblicare

### Settimana 4: Automazione

- [ ] Creare script Python per text → SSML
- [ ] Integrare API ElevenLabs
- [ ] Setup workflow batch (10 video/giorno)
- [ ] Documentare processo per team

---

## 🔗 RISORSE UTILI

### Documentazione

- **ElevenLabs SSML:** https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices
- **ElevenLabs Phoneme:** https://help.elevenlabs.io/hc/en-us/articles/16712320194577
- **IPA Italiano:** https://en.wikipedia.org/wiki/Italian_phonology
- **IPA Reader:** https://ipa-reader.com/

### Community

- **Reddit r/ElevenLabs:** https://reddit.com/r/ElevenLabs
- **Discord ElevenLabs:** https://discord.gg/elevenlabs

### Tool

- **SSML Validator:** https://www.w3.org/TR/speech-synthesis11/
- **IPA Converter:** https://easypronunciation.com/it/

---

**Guida creata per Fernando Marongiu — Dicembre 2025**
