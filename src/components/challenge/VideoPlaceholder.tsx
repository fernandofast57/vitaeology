'use client';

import { useState, useEffect } from 'react';

/**
 * VideoPlaceholder - Componente per video challenge o placeholder
 *
 * Mostra un video HTML5 se videoUrl è fornito, altrimenti un placeholder
 * professionale con stile appropriato per il tipo di challenge.
 */

type ChallengeType = 'leadership' | 'ostacoli' | 'microfelicita';

interface VideoPlaceholderProps {
  challengeType: ChallengeType;
  videoUrl?: string;
  dayNumber?: number;
  posterUrl?: string;
}

// Stili per ogni tipo di challenge
const CHALLENGE_STYLES = {
  leadership: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    text: 'text-amber-600',
    iconBg: 'bg-amber-100',
    iconFill: 'fill-amber-500',
  },
  ostacoli: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-400',
    text: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    iconFill: 'fill-emerald-500',
  },
  microfelicita: {
    bg: 'bg-violet-50',
    border: 'border-violet-400',
    text: 'text-violet-600',
    iconBg: 'bg-violet-100',
    iconFill: 'fill-violet-500',
  },
};

export function VideoPlaceholder({
  challengeType,
  videoUrl,
  dayNumber,
  posterUrl,
}: VideoPlaceholderProps) {
  const [mounted, setMounted] = useState(false);
  const styles = CHALLENGE_STYLES[challengeType];

  // Evita hydration mismatch renderizzando solo sul client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Placeholder statico per SSR con stessa struttura del client
    return (
      <div className="w-full max-w-2xl mx-auto my-8 rounded-xl border-2 border-dashed p-12 bg-slate-100 border-slate-300">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white" />
          </div>
          <p className="text-lg font-medium text-slate-400">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Se videoUrl esiste, mostra il video player
  if (videoUrl) {
    return (
      <div className="w-full max-w-2xl mx-auto my-8 rounded-xl overflow-hidden shadow-lg">
        <video
          className="w-full"
          controls
          preload="metadata"
          poster={posterUrl}
        >
          <source src={videoUrl} type="video/mp4" />
          Il tuo browser non supporta il tag video.
        </video>
      </div>
    );
  }

  // Placeholder quando il video non è disponibile
  const placeholderText = dayNumber
    ? `Video Giorno ${dayNumber} in arrivo`
    : 'Video in arrivo';

  return (
    <div
      className={`w-full max-w-2xl mx-auto my-8 rounded-xl border-2 border-dashed p-12 ${styles.bg} ${styles.border}`}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Icona Play */}
        <div
          className={`w-20 h-20 rounded-full ${styles.iconBg} flex items-center justify-center shadow-sm`}
        >
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
            <svg
              className={`w-8 h-8 ${styles.iconFill} ml-1`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Testo */}
        <p className={`text-lg font-medium ${styles.text}`}>
          {placeholderText}
        </p>

        {/* Sottotesto */}
        <p className="text-sm text-slate-500">
          Il contenuto video sarà disponibile a breve
        </p>
      </div>
    </div>
  );
}
