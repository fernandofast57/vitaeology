'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export type ChallengeType = 'leadership' | 'ostacoli' | 'microfelicita';

interface DayProgress {
  completed: boolean;
  responses: number;
}

interface DiscoveryProgress {
  isUnlocked: boolean;
  isCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface FullChallengeProgress {
  dayProgress: Record<number, DayProgress>;
  currentUnlockedDay: number;
  totalResponses: number;
  completionPercentage: number;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook per verificare lo stato di sblocco e completamento di un singolo giorno
 */
export function useDiscoveryProgress(
  challengeType: ChallengeType,
  dayNumber: number
): DiscoveryProgress {
  const [isUnlocked, setIsUnlocked] = useState(dayNumber === 1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const checkProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Mappa challenge type frontend → database (come in lib/challenges.ts)
    const CHALLENGE_TYPE_MAP: Record<string, string> = {
      'leadership': 'leadership-autentica',
      'ostacoli': 'oltre-ostacoli',
      'microfelicita': 'microfelicita'
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !user.email) {
        setError('Utente non autenticato');
        setIsLoading(false);
        return;
      }

      const dbChallengeType = CHALLENGE_TYPE_MAP[challengeType] || challengeType;

      // Trova subscriber in challenge_subscribers (fonte unica di verità, come dashboard)
      const { data: subscriber, error: subscriberError } = await supabase
        .from('challenge_subscribers')
        .select('id, current_day, status')
        .eq('email', user.email.toLowerCase())
        .eq('challenge', dbChallengeType)
        .single();

      if (subscriberError || !subscriber) {
        // Utente non iscritto a questa challenge - giorno 1 sbloccato, nessun completamento
        setIsUnlocked(dayNumber === 1);
        setIsCompleted(false);
        setIsLoading(false);
        return;
      }

      // Logica allineata alla dashboard (vedi ChallengeCard in dashboard/challenges/page.tsx):
      // - current_day indica l'ultimo giorno completato
      // - Il prossimo giorno da fare è current_day + 1
      // - Day N è sbloccato se: N <= current_day + 1 (o N === 1)
      // - Day N è completato se: N <= current_day

      const currentDay = subscriber.current_day || 0;

      // Giorno 1 sempre sbloccato, altri sbloccati se <= current_day + 1
      setIsUnlocked(dayNumber === 1 || dayNumber <= currentDay + 1);

      // Completato se abbiamo già superato questo giorno
      setIsCompleted(dayNumber <= currentDay);

    } catch (err) {
      console.error('Error checking discovery progress:', err);
      setError('Errore nel caricamento del progresso');
    } finally {
      setIsLoading(false);
    }
  }, [challengeType, dayNumber, supabase]);

  useEffect(() => {
    checkProgress();
  }, [checkProgress]);

  return {
    isUnlocked,
    isCompleted,
    isLoading,
    error,
    refresh: checkProgress
  };
}

/**
 * Hook per ottenere il progresso completo di una challenge (tutti i 7 giorni)
 */
export function useFullChallengeProgress(
  challengeType: ChallengeType
): FullChallengeProgress {
  const [dayProgress, setDayProgress] = useState<Record<number, DayProgress>>({});
  const [currentUnlockedDay, setCurrentUnlockedDay] = useState(1);
  const [totalResponses, setTotalResponses] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/challenge/check-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeType })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();

      setDayProgress(data.dayProgress);
      setCurrentUnlockedDay(data.currentUnlockedDay);
      setTotalResponses(data.totalResponses);
      setCompletionPercentage(data.completionPercentage);
      setIsComplete(data.isComplete);
    } catch (err) {
      console.error('Error fetching challenge progress:', err);
      setError('Errore nel caricamento del progresso');
    } finally {
      setIsLoading(false);
    }
  }, [challengeType]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    dayProgress,
    currentUnlockedDay,
    totalResponses,
    completionPercentage,
    isComplete,
    isLoading,
    error,
    refresh: fetchProgress
  };
}

/**
 * Hook per ottenere le risposte esistenti di un giorno specifico
 */
export function useExistingResponses(
  challengeType: ChallengeType,
  dayNumber: number
) {
  const [responses, setResponses] = useState<Record<number, 'A' | 'B' | 'C'>>({});
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchResponses() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('challenge_discovery_responses')
          .select('question_number, response')
          .eq('user_id', user.id)
          .eq('challenge_type', challengeType)
          .eq('day_number', dayNumber);

        if (data) {
          const responseMap: Record<number, 'A' | 'B' | 'C'> = {};
          data.forEach(r => {
            responseMap[r.question_number] = r.response as 'A' | 'B' | 'C';
          });
          setResponses(responseMap);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchResponses();
  }, [challengeType, dayNumber, supabase]);

  return { responses, isLoading };
}
