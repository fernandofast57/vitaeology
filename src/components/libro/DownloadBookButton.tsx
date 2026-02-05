'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface DownloadBookButtonProps {
  bookSlug: string;
  color?: string;
  className?: string;
}

/**
 * Bottone per download protetto del libro PDF.
 * Verifica auth e ownership, poi avvia il download con watermark.
 */
export default function DownloadBookButton({
  bookSlug,
  color = '#0A2540',
  className = '',
}: DownloadBookButtonProps) {
  const [state, setState] = useState<'checking' | 'ready' | 'loading' | 'error' | 'no-book'>('checking');
  const [errorMsg, setErrorMsg] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const checkOwnership = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setState('no-book');
      return;
    }

    const { data: userBook } = await supabase
      .from('user_books')
      .select('id')
      .eq('user_id', user.id)
      .eq('book_slug', bookSlug)
      .maybeSingle();

    if (userBook) {
      setState('ready');
    } else if (retryCount < 2) {
      // Webhook potrebbe non essere ancora arrivato
      setTimeout(() => setRetryCount(prev => prev + 1), 3000);
    } else {
      setState('no-book');
    }
  }, [supabase, bookSlug, retryCount]);

  useEffect(() => {
    checkOwnership();
  }, [checkOwnership]);

  const handleDownload = async () => {
    setState('loading');
    setErrorMsg('');

    try {
      const response = await fetch(`/api/libro/download?book=${bookSlug}`);

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || `Errore ${response.status}`);
      }

      // Converti response in blob e avvia download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')
        ?.match(/filename="(.+)"/)?.[1] || `${bookSlug}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setState('ready');
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Errore durante il download');
    }
  };

  if (state === 'checking') {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-sm text-gray-500">
          {retryCount > 0 ? 'Preparazione in corso...' : 'Verifica acquisto...'}
        </p>
      </div>
    );
  }

  if (state === 'no-book') {
    return null;
  }

  return (
    <div className={className}>
      <button
        onClick={handleDownload}
        disabled={state === 'loading'}
        className="w-full py-3 px-6 rounded-lg font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-wait"
        style={{ backgroundColor: color }}
      >
        {state === 'loading' ? 'Generazione PDF...' : 'Scarica il tuo libro (PDF)'}
      </button>

      {state === 'error' && (
        <p className="text-sm text-red-600 mt-2 text-center">
          {errorMsg}
          <button
            onClick={handleDownload}
            className="ml-2 underline hover:no-underline"
          >
            Riprova
          </button>
        </p>
      )}
    </div>
  );
}
