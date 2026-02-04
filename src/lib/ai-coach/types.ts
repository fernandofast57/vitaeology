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

// Contesto challenge per AI Coach
export interface ChallengeContext {
  challengeType: string;       // 'leadership-autentica' | 'oltre-ostacoli' | 'microfelicita'
  challengeName: string;       // Nome leggibile
  currentDay: number;          // 0-7
  status: string;              // 'active' | 'completed'
  hasAssessment: boolean;      // Ha fatto l'assessment corrispondente?
  hasSubscription: boolean;    // Ha un abbonamento Leader/Mentor?
}

// Dati Mini-Profilo per AI Coach
export interface MiniProfileContext {
  dimensionScores: Record<string, { percentage: number }>;
  strongestDimension: string;
  strongestPercentage: number;
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
  // Challenge context (P4.1)
  challengeContext?: ChallengeContext;
  // Mini-Profilo (P4.2)
  miniProfileContext?: MiniProfileContext;
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
