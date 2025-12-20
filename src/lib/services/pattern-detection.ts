/**
 * PatternDetectionService
 *
 * Servizio per analisi automatica dei pattern nelle risposte AI Coach.
 * Rileva problemi basati su regole configurabili e feedback utente.
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// INTERFACES
// ============================================================

export interface PatternRule {
  type: 'word_count' | 'keyword_match' | 'pattern_match' | 'text_length' | 'regex' | 'sentiment';
  condition?: 'greater_than' | 'less_than' | 'equals' | 'contains' | 'starts_with' | 'ends_with';
  value?: number | string;
  keywords?: string[];
  patterns?: string[];
  negative_patterns?: string[];
  negative_starts?: string[];
  check_start?: boolean;
  check_end?: boolean;
  context?: 'ai_response' | 'user_message' | 'both';
  weight?: number;
  min_matches?: number;
}

export interface Pattern {
  id: string;
  pattern_name: string;
  pattern_type: string;
  pattern_category?: string;
  description?: string;
  detection_rules: PatternRule | PatternRule[];
  trigger_keywords?: string[];
  trigger_phrases?: string[];
  regex_patterns?: string[];
  confidence_threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggested_fix?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DetectionResult {
  pattern_id: string;
  pattern_name: string;
  pattern_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  match_details: Record<string, unknown>;
  triggered_by: string[];
  suggested_fix?: string;
}

export interface AnalysisContext {
  user_frustrated?: boolean;
  user_sentiment?: 'positive' | 'negative' | 'neutral';
  conversation_length?: number;
  previous_thumbs_down?: boolean;
  exercise_context?: string;
}

export interface PatternMatch {
  id: string;
  pattern_id: string;
  conversation_id: string;
  message_id?: string;
  confidence: number;
  matched_text?: string;
  match_details?: Record<string, unknown>;
  feedback_type?: string;
  feedback_text?: string;
  reviewed: boolean;
  confirmed?: boolean;
  created_at: string;
}

// ============================================================
// PATTERN DETECTION SERVICE
// ============================================================

export class PatternDetectionService {
  private supabase: SupabaseClient;
  private patterns: Pattern[] = [];
  private lastPatternLoad: Date | null = null;
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minuti

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // ============================================================
  // PUBLIC METHODS
  // ============================================================

  /**
   * Carica i pattern dal database con caching
   */
  async loadPatterns(forceRefresh = false): Promise<void> {
    // Verifica cache
    if (
      !forceRefresh &&
      this.lastPatternLoad &&
      this.patterns.length > 0 &&
      Date.now() - this.lastPatternLoad.getTime() < this.CACHE_DURATION_MS
    ) {
      return;
    }

    try {
      const { data, error } = await this.supabase
        .from('ai_coach_patterns')
        .select('*')
        .eq('is_active', true)
        .order('severity', { ascending: false });

      if (error) {
        console.error('Errore caricamento patterns:', error);
        return;
      }

      this.patterns = (data || []).map(p => ({
        ...p,
        detection_rules: this.parseDetectionRules(p),
        confidence_threshold: p.min_confidence || 0.6,
      }));

      this.lastPatternLoad = new Date();
    } catch (err) {
      console.error('Errore loadPatterns:', err);
    }
  }

  /**
   * Analizza una risposta AI per rilevare pattern problematici
   */
  async analyzeResponse(
    aiResponse: string,
    userMessage: string,
    context?: AnalysisContext
  ): Promise<DetectionResult[]> {
    await this.loadPatterns();

    if (!aiResponse || this.patterns.length === 0) {
      return [];
    }

    const results: DetectionResult[] = [];

    for (const pattern of this.patterns) {
      const result = this.checkPattern(pattern, aiResponse, userMessage, context);
      if (result && result.confidence >= pattern.confidence_threshold) {
        results.push(result);
      }
    }

    // Ordina per confidence decrescente
    results.sort((a, b) => b.confidence - a.confidence);

    return results;
  }

  /**
   * Salva un match rilevato nel database
   */
  async saveMatch(
    result: DetectionResult,
    conversationId: string,
    messageId: string | null,
    aiResponse: string,
    userMessage: string,
    feedbackType?: string,
    feedbackText?: string
  ): Promise<string | null> {
    try {
      // Estrai testo matchato per preview
      const matchedText = this.extractMatchedText(aiResponse, result.triggered_by);

      const { data, error } = await this.supabase
        .from('ai_coach_pattern_matches')
        .insert({
          pattern_id: result.pattern_id,
          conversation_id: conversationId,
          message_id: messageId,
          confidence: result.confidence,
          matched_text: matchedText,
          match_details: result.match_details,
          feedback_type: feedbackType || null,
          feedback_text: feedbackText || null,
          reviewed: false,
        })
        .select('id')
        .single();

      if (error) {
        // Ignora errore duplicato
        if (error.code !== '23505') {
          console.error('Errore saveMatch:', error);
        }
        return null;
      }

      // Incrementa contatore pattern
      await this.incrementPatternCounter(result.pattern_id, 'times_detected');

      return data?.id || null;
    } catch (err) {
      console.error('Errore saveMatch:', err);
      return null;
    }
  }

  /**
   * Processa un thumbs down: analizza e salva tutti i match
   */
  async processThumbsDown(
    conversationId: string,
    messageId: string | null,
    aiResponse: string,
    userMessage: string,
    feedbackText?: string
  ): Promise<DetectionResult[]> {
    // Analizza con contesto frustrazione
    const results = await this.analyzeResponse(aiResponse, userMessage, {
      user_frustrated: true,
      user_sentiment: 'negative',
    });

    // Salva tutti i match trovati
    for (const result of results) {
      await this.saveMatch(
        result,
        conversationId,
        messageId,
        aiResponse,
        userMessage,
        'thumbs_down',
        feedbackText
      );
    }

    return results;
  }

  /**
   * Ottiene statistiche sui pattern
   */
  async getPatternStats(): Promise<Record<string, number>> {
    await this.loadPatterns();

    const stats: Record<string, number> = {
      total_patterns: this.patterns.length,
      active_patterns: this.patterns.filter(p => p.is_active).length,
      high_severity: this.patterns.filter(p => p.severity === 'high' || p.severity === 'critical').length,
    };

    return stats;
  }

  // ============================================================
  // PRIVATE METHODS
  // ============================================================

  /**
   * Verifica se un pattern matcha la risposta
   */
  private checkPattern(
    pattern: Pattern,
    aiResponse: string,
    userMessage: string,
    context?: AnalysisContext
  ): DetectionResult | null {
    const rules = Array.isArray(pattern.detection_rules)
      ? pattern.detection_rules
      : [pattern.detection_rules];

    let totalConfidence = 0;
    let totalWeight = 0;
    const triggeredBy: string[] = [];
    const matchDetails: Record<string, unknown> = {};

    // Normalizza testo per matching
    const normalizedResponse = aiResponse.toLowerCase();
    const normalizedUserMsg = userMessage.toLowerCase();

    // Verifica trigger_keywords
    if (pattern.trigger_keywords && pattern.trigger_keywords.length > 0) {
      const keywordMatches = this.checkKeywords(normalizedResponse, pattern.trigger_keywords);
      if (keywordMatches.count > 0) {
        totalConfidence += 0.2 * keywordMatches.count;
        totalWeight += 1;
        triggeredBy.push(...keywordMatches.matched.map(k => `keyword:${k}`));
        matchDetails.keyword_matches = keywordMatches.matched;
      }
    }

    // Verifica trigger_phrases
    if (pattern.trigger_phrases && pattern.trigger_phrases.length > 0) {
      const phraseMatches = this.checkPhrases(normalizedResponse, pattern.trigger_phrases);
      if (phraseMatches.count > 0) {
        totalConfidence += 0.25 * phraseMatches.count;
        totalWeight += 1;
        triggeredBy.push(...phraseMatches.matched.map(p => `phrase:${p}`));
        matchDetails.phrase_matches = phraseMatches.matched;
      }
    }

    // Verifica regex_patterns
    if (pattern.regex_patterns && pattern.regex_patterns.length > 0) {
      const regexMatches = this.checkRegexPatterns(aiResponse, pattern.regex_patterns);
      if (regexMatches.count > 0) {
        totalConfidence += 0.3 * regexMatches.count;
        totalWeight += 1;
        triggeredBy.push(...regexMatches.matched.map(r => `regex:${r}`));
        matchDetails.regex_matches = regexMatches.matched;
      }
    }

    // Verifica detection_rules
    for (const rule of rules) {
      const ruleResult = this.evaluateRule(rule, aiResponse, userMessage, normalizedResponse, normalizedUserMsg);
      if (ruleResult.matched) {
        const weight = rule.weight || 1;
        totalConfidence += ruleResult.confidence * weight;
        totalWeight += weight;
        triggeredBy.push(`rule:${rule.type}`);
        matchDetails[`rule_${rule.type}`] = ruleResult.details;
      }
    }

    // Aggiusta confidence basato sul contesto
    if (context?.user_frustrated) {
      totalConfidence *= 1.2; // Boost se utente frustrato
    }
    if (context?.previous_thumbs_down) {
      totalConfidence *= 1.1;
    }

    // Calcola confidence finale
    const finalConfidence = totalWeight > 0
      ? Math.min(totalConfidence / totalWeight, 1.0)
      : 0;

    if (finalConfidence <= 0 || triggeredBy.length === 0) {
      return null;
    }

    return {
      pattern_id: pattern.id,
      pattern_name: pattern.pattern_name,
      pattern_type: pattern.pattern_type,
      severity: pattern.severity,
      confidence: Math.round(finalConfidence * 100) / 100,
      match_details: matchDetails,
      triggered_by: triggeredBy,
      suggested_fix: pattern.suggested_fix,
    };
  }

  /**
   * Valuta una singola regola di detection
   */
  private evaluateRule(
    rule: PatternRule,
    aiResponse: string,
    userMessage: string,
    normalizedResponse: string,
    normalizedUserMsg: string
  ): { matched: boolean; confidence: number; details: unknown } {
    const targetText = rule.context === 'user_message'
      ? normalizedUserMsg
      : rule.context === 'both'
        ? `${normalizedUserMsg} ${normalizedResponse}`
        : normalizedResponse;

    const originalText = rule.context === 'user_message'
      ? userMessage
      : rule.context === 'both'
        ? `${userMessage} ${aiResponse}`
        : aiResponse;

    switch (rule.type) {
      case 'word_count': {
        const wordCount = originalText.split(/\s+/).filter(w => w.length > 0).length;
        const threshold = typeof rule.value === 'number' ? rule.value : 300;
        let matched = false;

        if (rule.condition === 'greater_than') {
          matched = wordCount > threshold;
        } else if (rule.condition === 'less_than') {
          matched = wordCount < threshold;
        } else if (rule.condition === 'equals') {
          matched = wordCount === threshold;
        }

        return {
          matched,
          confidence: matched ? Math.min((wordCount / threshold) * 0.5, 1) : 0,
          details: { word_count: wordCount, threshold },
        };
      }

      case 'text_length': {
        const length = originalText.length;
        const threshold = typeof rule.value === 'number' ? rule.value : 1500;
        let matched = false;

        if (rule.condition === 'greater_than') {
          matched = length > threshold;
        } else if (rule.condition === 'less_than') {
          matched = length < threshold;
        }

        return {
          matched,
          confidence: matched ? Math.min((length / threshold) * 0.4, 1) : 0,
          details: { length, threshold },
        };
      }

      case 'keyword_match': {
        if (!rule.keywords || rule.keywords.length === 0) {
          return { matched: false, confidence: 0, details: null };
        }

        const matches = this.checkKeywords(targetText, rule.keywords);
        const minMatches = rule.min_matches || 1;
        const matched = matches.count >= minMatches;

        return {
          matched,
          confidence: matched ? Math.min(matches.count * 0.2, 0.8) : 0,
          details: { matched_keywords: matches.matched, count: matches.count },
        };
      }

      case 'pattern_match': {
        if (!rule.patterns || rule.patterns.length === 0) {
          return { matched: false, confidence: 0, details: null };
        }

        const matches = this.checkPhrases(targetText, rule.patterns);
        const matched = matches.count > 0;

        return {
          matched,
          confidence: matched ? Math.min(matches.count * 0.25, 0.9) : 0,
          details: { matched_patterns: matches.matched },
        };
      }

      case 'regex': {
        if (!rule.patterns || rule.patterns.length === 0) {
          return { matched: false, confidence: 0, details: null };
        }

        const matches = this.checkRegexPatterns(originalText, rule.patterns);
        const matched = matches.count > 0;

        return {
          matched,
          confidence: matched ? Math.min(matches.count * 0.3, 0.95) : 0,
          details: { matched_regex: matches.matched },
        };
      }

      case 'sentiment': {
        // Analisi sentiment semplificata
        const negativeWords = ['sbagliato', 'errore', 'problema', 'fallito', 'impossibile', 'mai', 'niente'];
        const positiveWords = ['bravo', 'ottimo', 'perfetto', 'eccellente', 'fantastico'];

        const negCount = this.checkKeywords(targetText, negativeWords).count;
        const posCount = this.checkKeywords(targetText, positiveWords).count;

        const sentiment = posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral';
        const expectedSentiment = rule.value as string || 'negative';
        const matched = sentiment === expectedSentiment;

        return {
          matched,
          confidence: matched ? 0.4 + Math.abs(negCount - posCount) * 0.1 : 0,
          details: { sentiment, negative_count: negCount, positive_count: posCount },
        };
      }

      default:
        return { matched: false, confidence: 0, details: null };
    }
  }

  /**
   * Verifica keywords nel testo
   */
  private checkKeywords(
    text: string,
    keywords: string[]
  ): { count: number; matched: string[] } {
    const matched: string[] = [];

    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        matched.push(keyword);
      }
    }

    return { count: matched.length, matched };
  }

  /**
   * Verifica frasi nel testo
   */
  private checkPhrases(
    text: string,
    phrases: string[]
  ): { count: number; matched: string[] } {
    const matched: string[] = [];

    for (const phrase of phrases) {
      if (text.includes(phrase.toLowerCase())) {
        matched.push(phrase);
      }
    }

    return { count: matched.length, matched };
  }

  /**
   * Verifica pattern regex nel testo
   */
  private checkRegexPatterns(
    text: string,
    patterns: string[]
  ): { count: number; matched: string[] } {
    const matched: string[] = [];

    for (const pattern of patterns) {
      try {
        const regex = new RegExp(pattern, 'gi');
        if (regex.test(text)) {
          matched.push(pattern);
        }
      } catch {
        // Ignora regex non valide
        console.warn('Regex non valida:', pattern);
      }
    }

    return { count: matched.length, matched };
  }

  /**
   * Estrae il testo matchato per preview
   */
  private extractMatchedText(text: string, triggeredBy: string[]): string {
    const excerpts: string[] = [];
    const lowerText = text.toLowerCase();

    for (const trigger of triggeredBy.slice(0, 3)) {
      const [type, value] = trigger.split(':');
      if (!value) continue;

      const searchValue = value.toLowerCase();
      const index = lowerText.indexOf(searchValue);

      if (index !== -1) {
        const start = Math.max(0, index - 20);
        const end = Math.min(text.length, index + searchValue.length + 20);
        const excerpt = (start > 0 ? '...' : '') +
          text.slice(start, end) +
          (end < text.length ? '...' : '');
        excerpts.push(excerpt);
      }
    }

    return excerpts.join(' | ').slice(0, 200);
  }

  /**
   * Incrementa un contatore del pattern
   */
  private async incrementPatternCounter(
    patternId: string,
    field: 'times_detected' | 'times_confirmed' | 'times_rejected'
  ): Promise<void> {
    try {
      // Prova RPC function
      const { error: rpcError } = await this.supabase.rpc('increment_pattern_counter', {
        p_pattern_id: patternId,
        p_field: field,
      });

      if (rpcError) {
        // Fallback: update manuale
        const { data: pattern } = await this.supabase
          .from('ai_coach_patterns')
          .select(field)
          .eq('id', patternId)
          .single();

        if (pattern) {
          const currentValue = (pattern as any)[field] || 0;
          const updates: Record<string, unknown> = {
            [field]: currentValue + 1,
            updated_at: new Date().toISOString(),
          };

          if (field === 'times_detected') {
            updates.last_detected_at = new Date().toISOString();
          }

          await this.supabase
            .from('ai_coach_patterns')
            .update(updates)
            .eq('id', patternId);
        }
      }
    } catch (err) {
      console.error('Errore incrementPatternCounter:', err);
    }
  }

  /**
   * Parsing delle regole di detection dal DB
   */
  private parseDetectionRules(pattern: any): PatternRule | PatternRule[] {
    // Se ha detection_rules in JSON, usale
    if (pattern.detection_rules) {
      try {
        return typeof pattern.detection_rules === 'string'
          ? JSON.parse(pattern.detection_rules)
          : pattern.detection_rules;
      } catch {
        // Ignora errori parsing
      }
    }

    // Genera regole base dal pattern_type
    const rules: PatternRule[] = [];

    switch (pattern.pattern_type) {
      case 'troppo_lungo':
        rules.push({
          type: 'word_count',
          condition: 'greater_than',
          value: 400,
          weight: 1.5,
        });
        rules.push({
          type: 'text_length',
          condition: 'greater_than',
          value: 2000,
          weight: 1,
        });
        break;

      case 'manca_validazione':
        rules.push({
          type: 'keyword_match',
          keywords: ['dovresti', 'ti manca', 'non hai', 'il problema è', 'purtroppo'],
          weight: 1.5,
        });
        rules.push({
          type: 'pattern_match',
          patterns: ['non sei', 'non riesci', 'ti manca', 'devi imparare'],
          weight: 2,
        });
        break;

      case 'troppo_prescrittivo':
        rules.push({
          type: 'keyword_match',
          keywords: ['devi', 'è necessario', 'assolutamente', 'obbligatorio', 'imperativo'],
          weight: 2,
        });
        break;

      case 'linguaggio_complesso':
        rules.push({
          type: 'keyword_match',
          keywords: ['paradigma', 'framework', 'implementare', 'ottimizzare', 'scalare', 'stakeholder'],
          weight: 1.5,
        });
        break;

      case 'cita_fonti':
        rules.push({
          type: 'pattern_match',
          patterns: ['secondo', 'come dice', 'la ricerca mostra', 'gli studi dimostrano', 'come scritto in'],
          weight: 1.5,
        });
        break;

      case 'tono_giudicante':
        rules.push({
          type: 'keyword_match',
          keywords: ['sbagliato', 'errore grave', 'non avresti dovuto', 'colpa tua'],
          weight: 2.5,
        });
        rules.push({
          type: 'sentiment',
          value: 'negative',
          weight: 1,
        });
        break;

      default:
        // Regola generica basata su trigger_phrases
        if (pattern.trigger_phrases && pattern.trigger_phrases.length > 0) {
          rules.push({
            type: 'pattern_match',
            patterns: pattern.trigger_phrases,
            weight: 1,
          });
        }
    }

    return rules.length > 0 ? rules : { type: 'keyword_match', keywords: [], weight: 1 };
  }
}

// ============================================================
// FACTORY FUNCTION
// ============================================================

let serviceInstance: PatternDetectionService | null = null;

/**
 * Ottiene l'istanza singleton del servizio
 */
export function getPatternDetectionService(supabase: SupabaseClient): PatternDetectionService {
  if (!serviceInstance) {
    serviceInstance = new PatternDetectionService(supabase);
  }
  return serviceInstance;
}

/**
 * Crea una nuova istanza del servizio (per test o uso isolato)
 */
export function createPatternDetectionService(supabase: SupabaseClient): PatternDetectionService {
  return new PatternDetectionService(supabase);
}
