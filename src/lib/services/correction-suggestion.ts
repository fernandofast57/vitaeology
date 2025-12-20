/**
 * CorrectionSuggestionService
 *
 * Genera suggerimenti di correzione automatici basati su:
 * 1. Pattern rilevati frequentemente
 * 2. Audit con score basso
 * 3. Feedback negativo ricorrente
 *
 * Tipi di correzione:
 * - prompt_adjustment: Modifica al system prompt
 * - add_rag_chunk: Aggiunta di contenuto RAG correttivo
 * - flag_for_review: Segnalazione per revisione manuale
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// TYPES
// ============================================================

export interface CorrectionSuggestion {
  pattern_id: string;
  pattern_name: string;
  pattern_type: string;
  correction_type: 'prompt_adjustment' | 'add_rag_chunk' | 'flag_for_review';
  description: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  based_on: {
    detections: number;
    confirmed: number;
    false_positive_rate: number;
  };
}

export interface ActiveCorrection {
  id: string;
  pattern_id: string | null;
  correction_type: string;
  description: string;
  content: string;
  status: string;
  effectiveness_score: number | null;
  applied_count: number;
  created_at?: string;
}

export interface PromptAdjustment {
  id: string;
  pattern_type: string;
  instruction: string;
  priority: number;
}

export interface RAGChunk {
  id: string;
  pattern_type: string;
  content: string;
  metadata: {
    type: 'correction';
    pattern_id: string;
    created_at: string;
  };
}

// ============================================================
// TEMPLATE CORREZIONI PER PATTERN
// ============================================================

const CORRECTION_TEMPLATES: Record<string, {
  prompt_adjustment: string;
  rag_chunk: string;
}> = {
  troppo_lungo: {
    prompt_adjustment: `IMPORTANTE: Mantieni le risposte CONCISE (max 200 parole).
- Vai dritto al punto
- Usa frasi brevi e dirette
- Evita ripetizioni e ridondanze
- Se serve approfondire, chiedi prima all'utente`,
    rag_chunk: `[Guida Brevità Risposte]
Le risposte efficaci sono brevi e focalizzate. Un buon coach:
- Risponde in modo diretto senza preamboli
- Usa 2-3 frasi per punto principale
- Lascia spazio all'utente per elaborare
- Chiede se vuole approfondimenti invece di darli non richiesti`,
  },

  manca_validazione: {
    prompt_adjustment: `CRITICO: INIZIA SEMPRE riconoscendo le risorse dell'utente.
- Prima di tutto, valida ciò che l'utente già fa bene
- Mai iniziare con "dovresti" o suggerimenti
- Usa frasi come "Noto che già..." o "Il fatto che tu..."
- Solo dopo la validazione, offri prospettive aggiuntive`,
    rag_chunk: `[Principio Validante]
Ogni risposta deve iniziare riconoscendo le capacità già presenti:
- "Vedo che stai già facendo X, questo è significativo perché..."
- "Il fatto che tu abbia notato Y dimostra..."
- "La tua consapevolezza di Z è già un passo importante..."
Mai usare: "dovresti", "ti manca", "il problema è", "non hai"`,
  },

  troppo_prescrittivo: {
    prompt_adjustment: `FONDAMENTALE: Usa DOMANDE invece di prescrizioni.
- Trasforma ogni "devi fare X" in "cosa succederebbe se...?"
- Invece di dare soluzioni, facilita la riflessione
- L'utente è l'esperto della propria vita
- Il tuo ruolo è facilitare, non dirigere`,
    rag_chunk: `[User Agency]
L'utente mantiene sempre il controllo. Invece di:
- "Devi fare X" → "Cosa ti attrae dell'idea di X?"
- "È necessario che" → "Come ti sentiresti se...?"
- "Dovresti provare" → "Hai mai considerato...?"
- "La soluzione è" → "Quali opzioni vedi tu?"`,
  },

  linguaggio_complesso: {
    prompt_adjustment: `ACCESSIBILITÀ: Usa linguaggio SEMPLICE e quotidiano.
- Evita termini tecnici (framework, paradigma, implementare)
- Usa parole della vita di tutti i giorni
- Fai esempi concreti dalla vita dell'imprenditore
- Se devi usare un termine tecnico, spiegalo subito`,
    rag_chunk: `[Linguaggio Accessibile]
Parla come parlerebbe un amico saggio, non un professore:
- "framework" → "modo di organizzare le cose"
- "implementare" → "mettere in pratica"
- "ottimizzare" → "migliorare"
- "paradigma" → "modo di vedere le cose"
Usa sempre esempi dalla vita reale dell'imprenditore.`,
  },

  cita_fonti: {
    prompt_adjustment: `IMPORTANTE: NON citare fonti, autori o studi.
- Applica la conoscenza senza menzionare da dove viene
- Mai "secondo gli studi" o "come dice [autore]"
- Integra naturalmente i concetti senza attribuzione
- Parla dalla tua esperienza come coach`,
    rag_chunk: `[Conoscenza Operativa]
La conoscenza si applica, non si cita:
- NO: "Secondo Goleman, l'intelligenza emotiva..."
- SÌ: "Riconoscere le tue emozioni ti permette di..."
- NO: "Gli studi dimostrano che..."
- SÌ: "Nella mia esperienza, quando le persone..."
Sii la fonte, non citare altre fonti.`,
  },

  tono_giudicante: {
    prompt_adjustment: `CRITICO: Mantieni NEUTRALITÀ e curiosità genuina.
- Mai giudicare scelte passate o presenti
- Evita "sbagliato", "errore", "non avresti dovuto"
- Sostituisci giudizi con curiosità: "cosa ti ha portato a..."
- Ogni scelta ha avuto senso nel suo contesto`,
    rag_chunk: `[Neutralità Coaching]
Un coach non giudica, esplora con curiosità:
- Invece di "è stato un errore" → "cosa hai imparato da quella esperienza?"
- Invece di "non avresti dovuto" → "cosa ti ha guidato in quella scelta?"
- Invece di "purtroppo" → "e ora, con questa consapevolezza..."
Ogni decisione passata era la migliore possibile con le informazioni disponibili.`,
  },

  off_topic: {
    prompt_adjustment: `FOCUS: Resta sul tema della leadership e del benessere imprenditoriale.
- Se la domanda è fuori tema, riporta gentilmente al focus
- Collega sempre alla crescita personale e professionale
- Non rispondere a domande tecniche non pertinenti`,
    rag_chunk: `[Mantenere il Focus]
Se l'utente devia dal tema:
- "Capisco la tua curiosità su X. Come coach, mi concentro su Y. Posso chiederti come questo si collega al tuo percorso di leadership?"
- Riporta sempre alla crescita personale e imprenditoriale`,
  },

  non_risponde: {
    prompt_adjustment: `PERTINENZA: Rispondi DIRETTAMENTE alla domanda dell'utente.
- Leggi attentamente cosa chiede
- Rispondi prima alla domanda specifica
- Solo dopo puoi ampliare se utile
- Se non capisci, chiedi chiarimenti`,
    rag_chunk: `[Rispondere alla Domanda]
Prima di tutto, rispondi a ciò che è stato chiesto:
1. Identifica la domanda specifica
2. Dai una risposta diretta
3. Se necessario, chiedi chiarimenti
4. Solo dopo amplia con riflessioni aggiuntive`,
  },
};

// ============================================================
// SERVICE CLASS
// ============================================================

export class CorrectionSuggestionService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Genera suggerimenti di correzione basati sui pattern più problematici
   */
  async generateSuggestions(): Promise<CorrectionSuggestion[]> {
    const suggestions: CorrectionSuggestion[] = [];

    // Carica pattern con statistiche
    const { data: patterns, error } = await this.supabase
      .from('ai_coach_patterns')
      .select('*')
      .eq('is_active', true)
      .gt('times_detected', 0)
      .order('times_detected', { ascending: false });

    if (error || !patterns) {
      console.error('Errore caricamento patterns:', error);
      return [];
    }

    for (const pattern of patterns) {
      // Verifica se esiste già una correzione attiva per questo pattern
      const { data: existingCorrection } = await this.supabase
        .from('ai_coach_auto_corrections')
        .select('id')
        .eq('pattern_id', pattern.id)
        .in('status', ['approved', 'auto_applied'])
        .single();

      if (existingCorrection) continue;

      const template = CORRECTION_TEMPLATES[pattern.pattern_type];
      if (!template) continue;

      // Calcola priorità e confidence
      const confirmationRate = pattern.times_detected > 0
        ? pattern.times_confirmed / pattern.times_detected
        : 0;
      const falsePositiveRate = pattern.false_positive_rate || 0;

      // Alta priorità se: molte detection, alto confirmation rate, basso FP rate
      let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
      let confidence = 0.5;

      if (pattern.times_detected >= 10 && confirmationRate >= 0.7 && falsePositiveRate < 0.2) {
        priority = 'critical';
        confidence = 0.9;
      } else if (pattern.times_detected >= 5 && confirmationRate >= 0.5) {
        priority = 'high';
        confidence = 0.75;
      } else if (pattern.times_detected >= 3) {
        priority = 'medium';
        confidence = 0.6;
      }

      // Severity del pattern influenza priorità
      if (pattern.severity === 'critical') {
        priority = 'critical';
        confidence = Math.min(confidence + 0.1, 1);
      } else if (pattern.severity === 'high' && priority !== 'critical') {
        priority = 'high';
      }

      // Suggerisci prompt_adjustment per pattern frequenti
      suggestions.push({
        pattern_id: pattern.id,
        pattern_name: pattern.pattern_name,
        pattern_type: pattern.pattern_type,
        correction_type: 'prompt_adjustment',
        description: `Correzione prompt per pattern "${pattern.pattern_name}"`,
        content: template.prompt_adjustment,
        priority,
        confidence,
        based_on: {
          detections: pattern.times_detected,
          confirmed: pattern.times_confirmed,
          false_positive_rate: falsePositiveRate,
        },
      });

      // Suggerisci anche RAG chunk se alta priorità
      if (priority === 'high' || priority === 'critical') {
        suggestions.push({
          pattern_id: pattern.id,
          pattern_name: pattern.pattern_name,
          pattern_type: pattern.pattern_type,
          correction_type: 'add_rag_chunk',
          description: `Contenuto RAG correttivo per "${pattern.pattern_name}"`,
          content: template.rag_chunk,
          priority,
          confidence: confidence * 0.9,
          based_on: {
            detections: pattern.times_detected,
            confirmed: pattern.times_confirmed,
            false_positive_rate: falsePositiveRate,
          },
        });
      }
    }

    // Ordina per priorità e confidence
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    suggestions.sort((a, b) => {
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return b.confidence - a.confidence;
    });

    return suggestions;
  }

  /**
   * Applica un suggerimento creando una correzione nel database
   */
  async applySuggestion(
    suggestion: CorrectionSuggestion,
    autoApply: boolean = false
  ): Promise<{ success: boolean; correction_id?: string; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('ai_coach_auto_corrections')
        .insert({
          pattern_id: suggestion.pattern_id,
          correction_type: suggestion.correction_type,
          description: suggestion.description,
          content: suggestion.content,
          status: autoApply ? 'auto_applied' : 'pending',
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, correction_id: data.id };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  /**
   * Carica tutte le correzioni attive (approved o auto_applied)
   */
  async getActiveCorrections(): Promise<ActiveCorrection[]> {
    const { data, error } = await this.supabase
      .from('ai_coach_auto_corrections')
      .select('*')
      .in('status', ['approved', 'auto_applied'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Errore caricamento correzioni attive:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Genera le istruzioni da aggiungere al system prompt
   * basate sulle correzioni attive
   */
  async getPromptAdjustments(): Promise<PromptAdjustment[]> {
    const corrections = await this.getActiveCorrections();

    const adjustments: PromptAdjustment[] = [];
    let priority = 1;

    for (const correction of corrections) {
      if (correction.correction_type === 'prompt_adjustment') {
        // Carica info pattern per il tipo
        let patternType = 'general';
        if (correction.pattern_id) {
          const { data: pattern } = await this.supabase
            .from('ai_coach_patterns')
            .select('pattern_type')
            .eq('id', correction.pattern_id)
            .single();

          if (pattern) {
            patternType = pattern.pattern_type;
          }
        }

        adjustments.push({
          id: correction.id,
          pattern_type: patternType,
          instruction: correction.content,
          priority: priority++,
        });
      }
    }

    return adjustments;
  }

  /**
   * Genera i chunk RAG correttivi da aggiungere al contesto
   */
  async getRAGChunks(): Promise<RAGChunk[]> {
    const corrections = await this.getActiveCorrections();

    const chunks: RAGChunk[] = [];

    for (const correction of corrections) {
      if (correction.correction_type === 'add_rag_chunk') {
        // Carica info pattern
        let patternType = 'general';
        if (correction.pattern_id) {
          const { data: pattern } = await this.supabase
            .from('ai_coach_patterns')
            .select('pattern_type')
            .eq('id', correction.pattern_id)
            .single();

          if (pattern) {
            patternType = pattern.pattern_type;
          }
        }

        chunks.push({
          id: correction.id,
          pattern_type: patternType,
          content: correction.content,
          metadata: {
            type: 'correction',
            pattern_id: correction.pattern_id || '',
            created_at: correction.created_at || new Date().toISOString(),
          },
        });
      }
    }

    return chunks;
  }

  /**
   * Aggiorna l'efficacia di una correzione dopo l'uso
   */
  async updateEffectiveness(
    correctionId: string,
    wasEffective: boolean
  ): Promise<void> {
    const { data: correction } = await this.supabase
      .from('ai_coach_auto_corrections')
      .select('effectiveness_score, applied_count')
      .eq('id', correctionId)
      .single();

    if (!correction) return;

    const newCount = (correction.applied_count || 0) + 1;
    const currentScore = correction.effectiveness_score || 0.5;

    // Media mobile dell'efficacia
    const weight = Math.min(0.3, 1 / newCount);
    const newScore = currentScore * (1 - weight) + (wasEffective ? 1 : 0) * weight;

    await this.supabase
      .from('ai_coach_auto_corrections')
      .update({
        effectiveness_score: Math.round(newScore * 100) / 100,
        applied_count: newCount,
        last_evaluated_at: new Date().toISOString(),
      })
      .eq('id', correctionId);
  }

  /**
   * Genera il blocco di istruzioni correttive per il system prompt
   */
  async generateCorrectionBlock(): Promise<string> {
    const adjustments = await this.getPromptAdjustments();

    if (adjustments.length === 0) {
      return '';
    }

    let block = '\n\n## CORREZIONI ATTIVE (basate su feedback)\n\n';

    for (const adj of adjustments) {
      block += `### ${adj.pattern_type.replace(/_/g, ' ').toUpperCase()}\n`;
      block += adj.instruction + '\n\n';
    }

    return block;
  }
}

// ============================================================
// FACTORY FUNCTIONS
// ============================================================

let serviceInstance: CorrectionSuggestionService | null = null;

export function getCorrectionSuggestionService(
  supabase: SupabaseClient
): CorrectionSuggestionService {
  if (!serviceInstance) {
    serviceInstance = new CorrectionSuggestionService(supabase);
  }
  return serviceInstance;
}

export function createCorrectionSuggestionService(
  supabase: SupabaseClient
): CorrectionSuggestionService {
  return new CorrectionSuggestionService(supabase);
}
