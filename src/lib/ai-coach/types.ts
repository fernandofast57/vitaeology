export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Info percorso attivo per multi-pathway
export interface ActivePathway {
  slug: string;
  name: string;
  progressPercentage: number;
  hasAssessment: boolean;
}

export interface UserContext {
  userId: string;
  userName?: string;
  assessmentResults?: {
    characteristicSlug: string;
    score: number;
    pillar: string;
  }[];
  currentExercise?: {
    id: number;
    title: string;
    weekNumber: number;
    characteristicSlug: string;
  };
  completedExercisesCount: number;
  currentWeek: number;
  // Multi-pathway support
  activePathways?: ActivePathway[];
}

export interface ChatRequest {
  messages: Message[];
  userContext: UserContext;
  sessionId?: string;  // Per tracciare sessione conversazione
  currentPath?: 'leadership' | 'problemi' | 'benessere';  // Valori compatibili con RAG PathType
}

export interface ChatResponse {
  message: string;
  isSafetyAlert?: boolean;
  conversationId?: string;  // Per feedback tracking
  sessionId?: string;       // Ritorna session per client
}
