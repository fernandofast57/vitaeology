import { getSupabaseClient } from '@/lib/supabase/service';
import { getOpenAIClient } from '@/lib/ai-clients';

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
    const openai = getOpenAIClient();
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    return response.data?.[0]?.embedding || null;
  } catch {
    return null;
  }
}

/**
 * Cerca chunk per similarità semantica usando pgvector
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
      return searchByKeywords(query, limit, currentPath);
    }

    return data || [];
  } catch {
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

  if (error) return [];

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
    'chi', 'cosa', 'quale', 'quanto', 'perché', 'non', 'sono',
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
 * Risultato RAG con metadati per logging
 */
export interface RAGResult {
  context: string;
  chunkIds: string[];
  similarityScores: number[];
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

/**
 * Versione estesa che ritorna anche metadati per logging
 */
export async function getRAGContextWithMetadata(
  query: string,
  currentPath?: PathType | null
): Promise<RAGResult> {
  const chunks = await searchByEmbedding(query, {
    limit: 3,
    threshold: 0.3,
    currentPath,
  });

  return {
    context: formatRAGContext(chunks),
    chunkIds: chunks.map(c => String(c.id)),
    similarityScores: chunks.map(c => c.similarity || 0),
  };
}
