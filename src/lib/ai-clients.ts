/**
 * Centralized AI Client Factory
 *
 * Singleton pattern per evitare creazione multipla di client.
 * Da usare in tutti i file che necessitano di Anthropic o OpenAI.
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;

/**
 * Ottiene il client Anthropic (Claude)
 * Singleton per evitare creazione multipla
 */
export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

/**
 * Ottiene il client OpenAI (Embeddings, etc.)
 * Singleton per evitare creazione multipla
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });
  }
  return openaiClient;
}
