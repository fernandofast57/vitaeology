'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface DiscoveryOption {
  value: 'A' | 'B' | 'C';
  text: string;
}

interface DiscoveryQuestion {
  text: string;
  options: DiscoveryOption[];
}

interface DiscoveryConfirmationProps {
  challengeType: 'leadership' | 'ostacoli' | 'microfelicita';
  dayNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  title: string;
  intro: string;
  questions: DiscoveryQuestion[];
  ctaText: string;
  accentColor?: string;
  onComplete: () => void;
}

export default function DiscoveryConfirmation({
  challengeType,
  dayNumber,
  title,
  intro,
  questions,
  ctaText,
  accentColor = '#F4B942',
  onComplete
}: DiscoveryConfirmationProps) {
  const [responses, setResponses] = useState<Record<number, 'A' | 'B' | 'C'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const allAnswered = Object.keys(responses).length === 3;

  const handleSelect = (questionNumber: number, value: 'A' | 'B' | 'C') => {
    setResponses(prev => ({
      ...prev,
      [questionNumber]: value
    }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      setError('Rispondi a tutte le domande per proseguire');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Devi essere autenticato per continuare');
        return;
      }

      // Salva tutte le risposte
      const inserts = Object.entries(responses).map(([qNum, response]) => ({
        user_id: user.id,
        challenge_type: challengeType,
        day_number: dayNumber,
        question_number: parseInt(qNum),
        response
      }));

      const { error: insertError } = await supabase
        .from('challenge_discovery_responses')
        .upsert(inserts, {
          onConflict: 'user_id,challenge_type,day_number,question_number'
        });

      if (insertError) throw insertError;

      onComplete();

    } catch (err) {
      console.error('Error saving responses:', err);
      setError('Errore nel salvataggio. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      {/* Header */}
      <h3 className="text-xl font-semibold text-[#0A2540] mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-8">
        {intro}
      </p>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="space-y-4">
            <p className="font-medium text-[#0A2540]">
              {question.text}
            </p>

            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = responses[qIndex + 1] === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(qIndex + 1, option.value)}
                    className="w-full text-left p-4 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: isSelected ? accentColor : '#e5e7eb',
                      backgroundColor: isSelected ? `${accentColor}1a` : 'white',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = `${accentColor}80`; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: isSelected ? accentColor : '#d1d5db',
                          backgroundColor: isSelected ? accentColor : 'transparent',
                          color: isSelected ? 'white' : 'inherit',
                        }}
                      >
                        {isSelected && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span className="text-gray-700">{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleSubmit}
        disabled={!allAnswered || isSubmitting}
        className={`
          mt-8 w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all
          ${allAnswered && !isSubmitting
            ? 'text-[#0A2540] cursor-pointer shadow-lg hover:shadow-xl'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }
        `}
        style={allAnswered && !isSubmitting ? { backgroundColor: accentColor } : undefined}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Salvataggio...
          </span>
        ) : (
          ctaText
        )}
      </button>

      {/* Progress indicator */}
      <div className="mt-4 flex justify-center gap-2">
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            className="w-2 h-2 rounded-full transition-all"
            style={{ backgroundColor: responses[num] ? accentColor : '#d1d5db' }}
          />
        ))}
      </div>
      <p className="text-center text-sm text-gray-500 mt-2">
        {Object.keys(responses).length}/3 risposte completate
      </p>
    </div>
  );
}
