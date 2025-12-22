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

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Utente non autenticato');
        setIsLoading(false);
        return;
      }

      // Check completamento giorno corrente
      const { count: currentCount, error: currentError } = await supabase
        .from('challenge_discovery_responses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('challenge_type', challengeType)
        .eq('day_number', dayNumber);

      if (currentError) throw currentError;

      setIsCompleted(currentCount === 3);

      // Check sblocco (giorno precedente completato)
      if (dayNumber > 1) {
        const { count: prevCount, error: prevError } = await supabase
          .from('challenge_discovery_responses')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('challenge_type', challengeType)
          .eq('day_number', dayNumber - 1);

        if (prevError) throw prevError;

        setIsUnlocked(prevCount === 3);
      } else {
        // Day 1 is always unlocked
        setIsUnlocked(true);
      }
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
