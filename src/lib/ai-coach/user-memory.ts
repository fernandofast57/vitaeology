/**
 * AI Coach Learning System - User Memory
 * Personalizzazione basata sulla storia dell'utente
 */

import { getSupabaseClient } from '@/lib/supabase/service';
import {
  AICoachUserMemory,
  CommunicationStyle,
  ResponseLength,
  UpdateUserMemoryInput,
  UserKeyContext,
} from '@/types/ai-coach-learning';

/**
 * Recupera memoria utente esistente
 */
export async function getUserMemory(userId: string): Promise<AICoachUserMemory | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('ai_coach_user_memory')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Nessun record trovato
      return null;
    }
    console.error('Errore recupero memoria utente:', error);
    return null;
  }

  return data;
}

/**
 * Crea memoria utente iniziale
 */
export async function createUserMemory(userId: string): Promise<AICoachUserMemory | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('ai_coach_user_memory')
    .insert({
      user_id: userId,
      communication_style: null,
      preferred_response_length: null,
      common_challenges: [],
      successful_approaches: [],
      trigger_topics: [],
      key_context: {},
      coach_notes: [],
    })
    .select()
    .single();

  if (error) {
    console.error('Errore creazione memoria utente:', error);
    return null;
  }

  return data;
}

/**
 * Aggiorna memoria utente
 */
export async function updateUserMemory(
  userId: string,
  updates: UpdateUserMemoryInput
): Promise<AICoachUserMemory | null> {
  const supabase = getSupabaseClient();

  // Recupera memoria esistente per merge
  const existing = await getUserMemory(userId);

  if (!existing) {
    // Crea nuova memoria se non esiste
    const newMemory = await createUserMemory(userId);
    if (!newMemory) return null;
  }

  // Prepara aggiornamenti con merge degli array
  const updatePayload: Partial<AICoachUserMemory> = {};

  if (updates.communication_style) {
    updatePayload.communication_style = updates.communication_style;
  }

  if (updates.preferred_response_length) {
    updatePayload.preferred_response_length = updates.preferred_response_length;
  }

  if (updates.common_challenges) {
    // Merge con esistenti, rimuovi duplicati
    const existingChallenges = existing?.common_challenges || [];
    const merged = Array.from(new Set([...existingChallenges, ...updates.common_challenges]));
    updatePayload.common_challenges = merged.slice(-10); // Max 10
  }

  if (updates.successful_approaches) {
    const existingApproaches = existing?.successful_approaches || [];
    const merged = Array.from(new Set([...existingApproaches, ...updates.successful_approaches]));
    updatePayload.successful_approaches = merged.slice(-10);
  }

  if (updates.trigger_topics) {
    const existingTopics = existing?.trigger_topics || [];
    const merged = Array.from(new Set([...existingTopics, ...updates.trigger_topics]));
    updatePayload.trigger_topics = merged.slice(-10);
  }

  if (updates.key_context) {
    const existingContext = existing?.key_context || {};
    updatePayload.key_context = { ...existingContext, ...updates.key_context } as UserKeyContext;
  }

  if (updates.coach_notes) {
    const existingNotes = existing?.coach_notes || [];
    updatePayload.coach_notes = [...existingNotes, ...updates.coach_notes].slice(-20);
  }

  const { data, error } = await supabase
    .from('ai_coach_user_memory')
    .update(updatePayload)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Errore aggiornamento memoria utente:', error);
    return null;
  }

  return data;
}

/**
 * Analizza stile comunicazione preferito basato su cronologia
 */
export function detectCommunicationStyle(
  messageHistory: string[]
): CommunicationStyle | null {
  if (messageHistory.length < 3) return null;

  // Calcola media lunghezza messaggi utente
  const avgLength = messageHistory.reduce((sum, m) => sum + m.length, 0) / messageHistory.length;

  // Conta domande dirette vs domande elaborate
  const directQuestions = messageHistory.filter(m =>
    m.split(' ').length < 15 && m.includes('?')
  ).length;

  const requestsExamples = messageHistory.filter(m =>
    m.toLowerCase().includes('esempio') ||
    m.toLowerCase().includes('pratico') ||
    m.toLowerCase().includes('concreto')
  ).length;

  // Determina stile preferito
  if (requestsExamples > messageHistory.length * 0.3) {
    return 'esempi_pratici';
  } else if (directQuestions > messageHistory.length * 0.5 || avgLength < 50) {
    return 'diretto';
  } else if (avgLength > 100) {
    return 'elaborato';
  }

  return null;
}

/**
 * Analizza lunghezza risposta preferita basato su feedback
 */
export function detectPreferredLength(
  feedbackHistory: { responseLength: number; isHelpful: boolean }[]
): ResponseLength | null {
  if (feedbackHistory.length < 3) return null;

  const helpfulResponses = feedbackHistory.filter(f => f.isHelpful);
  if (helpfulResponses.length === 0) return null;

  const avgHelpfulLength =
    helpfulResponses.reduce((sum, f) => sum + f.responseLength, 0) / helpfulResponses.length;

  if (avgHelpfulLength < 300) {
    return 'breve';
  } else if (avgHelpfulLength > 800) {
    return 'dettagliato';
  } else {
    return 'medio';
  }
}

/**
 * Estrai sfide comuni dai messaggi
 */
export function extractChallenges(messages: string[]): string[] {
  const challengeKeywords = [
    'difficile', 'problema', 'sfida', 'non riesco', 'fatico',
    'ostacolo', 'bloccato', 'frustrato', 'confuso', 'stress',
    'team', 'collaboratori', 'dipendenti', 'clienti', 'tempo',
    'delegare', 'comunicare', 'motivare', 'gestire', 'organizzare',
  ];

  const challenges: string[] = [];

  for (const message of messages) {
    const words = message.toLowerCase().split(/\s+/);
    const matchedKeywords = words.filter(w =>
      challengeKeywords.some(k => w.includes(k))
    );

    if (matchedKeywords.length > 0) {
      // Estrai contesto intorno alla keyword
      const context = message.substring(0, 100);
      if (!challenges.some(c => c.includes(context.substring(0, 30)))) {
        challenges.push(context);
      }
    }
  }

  return challenges.slice(0, 5);
}

/**
 * Genera prompt addendum basato su memoria utente
 */
export function generateMemoryContext(memory: AICoachUserMemory | null): string {
  if (!memory) return '';

  const parts: string[] = [];

  // Stile comunicazione
  if (memory.communication_style) {
    switch (memory.communication_style) {
      case 'diretto':
        parts.push('Questo utente preferisce risposte dirette e concise.');
        break;
      case 'elaborato':
        parts.push('Questo utente apprezza spiegazioni approfondite e dettagliate.');
        break;
      case 'esempi_pratici':
        parts.push('Questo utente trova particolarmente utili gli esempi pratici e concreti.');
        break;
    }
  }

  // Lunghezza preferita
  if (memory.preferred_response_length) {
    switch (memory.preferred_response_length) {
      case 'breve':
        parts.push('Mantieni le risposte brevi (max 150 parole).');
        break;
      case 'dettagliato':
        parts.push('Puoi fornire risposte dettagliate quando appropriato.');
        break;
    }
  }

  // Contesto chiave
  if (memory.key_context) {
    const ctx = memory.key_context;
    if (ctx.azienda) parts.push(`Lavora in: ${ctx.azienda}.`);
    if (ctx.ruolo) parts.push(`Ruolo: ${ctx.ruolo}.`);
    if (ctx.team_size) parts.push(`Gestisce un team di ${ctx.team_size} persone.`);
    if (ctx.sfida_principale) parts.push(`Sfida principale: ${ctx.sfida_principale}.`);
  }

  // Sfide comuni
  if (memory.common_challenges && memory.common_challenges.length > 0) {
    parts.push(`Sfide ricorrenti: ${memory.common_challenges.slice(0, 3).join('; ')}.`);
  }

  // Approcci vincenti
  if (memory.successful_approaches && memory.successful_approaches.length > 0) {
    parts.push(`Approcci che hanno funzionato: ${memory.successful_approaches.slice(0, 2).join('; ')}.`);
  }

  if (parts.length === 0) return '';

  return `\n\n---\nCONTESTO UTENTE (usa per personalizzare):\n${parts.join('\n')}`;
}

/**
 * Aggiorna memoria dopo conversazione con feedback positivo
 */
export async function updateMemoryFromSuccess(
  userId: string,
  userMessage: string,
  aiResponse: string
): Promise<void> {
  // Estrai approccio vincente dalla risposta
  const approach = aiResponse.substring(0, 100) + '...';

  await updateUserMemory(userId, {
    successful_approaches: [approach],
  });
}

/**
 * Aggiorna memoria con nuovo contesto chiave
 */
export async function updateKeyContext(
  userId: string,
  context: Partial<UserKeyContext>
): Promise<void> {
  await updateUserMemory(userId, {
    key_context: context,
  });
}
