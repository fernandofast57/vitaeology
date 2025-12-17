export interface Message {
  role: 'user' | 'assistant';
  content: string;
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
}

export interface ChatRequest {
  messages: Message[];
  userContext: UserContext;
  sessionId?: string;  // Per tracciare sessione conversazione
  currentPath?: 'leadership' | 'problemi' | 'benessere';
}

export interface ChatResponse {
  message: string;
  isSafetyAlert?: boolean;
  conversationId?: string;  // Per feedback tracking
  sessionId?: string;       // Ritorna session per client
}
