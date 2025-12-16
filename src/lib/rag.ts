import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Lazy initialization per evitare errori durante il build
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
  });
}

// Mapping percorso → book_title
const PATH_TO_BOOK: Record<string, string> = {
  'leadership': 'Leadership Autentica',
  'problemi': 'Oltre gli Ostacoli',
  'benessere': 'Microfelicità'
};

export type PathType = 'leadership' | 'problemi' | 'benessere';

export interface BookChunk {
  id: number;
  book_title: string;
  chapter: string;
  section: string;
  content: string;
  chunk_type: string;
  keywords: string[];
  similarity?: number;
}

export interface SearchOptions {
  limit?: number;
  threshold?: number;
  currentPath?: PathType | null;
}

/**
 * Genera embedding per una query usando OpenAI
 */
async function getQueryEmbedding(query: string): Promise<number[] | null> {
  try {
    // DEBUG: verifica configurazione
    console.log('[RAG] OpenAI API Key presente:', process.env.OPENAI_API_KEY ? 'SI' : 'NO');
    console.log('[RAG] OpenAI Org ID:', process.env.OPENAI_ORG_ID || 'NON CONFIGURATO');

    const openai = getOpenAIClient();
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const embedding = response.data?.[0]?.embedding;
    console.log('[RAG] Embedding generato con successo, dimensioni:', embedding?.length);
    return embedding || null;
  } catch (error: any) {
    console.error('[RAG] Errore OpenAI embedding:', error?.message || error);
    return null;
  }
}

/**
 * Cerca chunk per similarita semantica usando pgvector
 * Filtra per percorso attivo se specificato
 */
export async function searchByEmbedding(
  query: string,
  options?: SearchOptions
): Promise<BookChunk[]> {
  const { limit = 3, threshold = 0.3, currentPath = null } = options || {};

  try {
    const embedding = await getQueryEmbedding(query);
    if (!embedding) {
      console.log('Embedding fallito, uso keyword search');
      return searchByKeywords(query, limit, currentPath);
    }

    // Mappa percorso a book_title per il filtro
    const filterBookTitle = currentPath ? PATH_TO_BOOK[currentPath] : null;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('match_book_chunks', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit,
      filter_book_title: filterBookTitle,
    });

    if (error) {
      console.error('Errore similarity search:', error);
      return searchByKeywords(query, limit, currentPath);
    }

    return data || [];
  } catch (error) {
    console.error('Errore RAG:', error);
    return [];
  }
}

/**
 * Fallback: cerca per keyword
 */
async function searchByKeywords(
  query: string,
  limit: number,
  currentPath?: PathType | null
): Promise<BookChunk[]> {
  const keywords = extractKeywords(query);
  if (keywords.length === 0) return [];

  const supabase = getSupabaseClient();
  let queryBuilder = supabase
    .from('book_knowledge')
    .select('*')
    .or(keywords.map(k => `content.ilike.%${k}%`).join(','));

  // Filtra per libro se percorso specificato
  if (currentPath) {
    const bookTitle = PATH_TO_BOOK[currentPath];
    queryBuilder = queryBuilder.eq('book_title', bookTitle);
  }

  const { data, error } = await queryBuilder.limit(limit);

  if (error) {
    console.error('Errore keyword search:', error);
    return [];
  }

  return data || [];
}

/**
 * Estrai keyword dalla query
 */
function extractKeywords(query: string): string[] {
  const stopwords = [
    'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una',
    'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
    'che', 'e', 'o', 'ma', 'se', 'come', 'quando', 'dove',
    'chi', 'cosa', 'quale', 'quanto', 'perche', 'non', 'sono',
    'ho', 'hai', 'ha', 'mi', 'ti', 'ci', 'vi', 'si',
  ];

  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopwords.includes(w))
    .slice(0, 5);
}

/**
 * Formatta chunks per il prompt
 */
export function formatRAGContext(chunks: BookChunk[]): string {
  if (chunks.length === 0) return '';

  let context = '\n\n---\nDAI TUOI LIBRI (usa se pertinente, senza citare la fonte):\n';

  for (const chunk of chunks) {
    const source = [chunk.book_title, chunk.chapter].filter(Boolean).join(' - ');
    context += `\n[${source}]\n${chunk.content.substring(0, 1500)}\n`;
  }

  return context;
}

/**
 * Funzione principale: cerca e formatta contesto RAG
 */
export async function getRAGContext(
  query: string,
  currentPath?: PathType | null
): Promise<string> {
  const chunks = await searchByEmbedding(query, {
    limit: 3,
    threshold: 0.3,
    currentPath,
  });
  return formatRAGContext(chunks);
}
