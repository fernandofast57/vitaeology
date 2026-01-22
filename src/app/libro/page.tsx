'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const BOOK_INFO: Record<string, { name: string; color: string; questions: number }> = {
  leadership: {
    name: 'Leadership Autentica',
    color: '#D4AF37',
    questions: 72,
  },
  risolutore: {
    name: 'Oltre gli Ostacoli',
    color: '#10B981',
    questions: 48,
  },
  microfelicita: {
    name: 'Microfelicità Digitale',
    color: '#8B5CF6',
    questions: 47,
  },
};

export default function AttivaPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{
    message: string;
    assessmentType: string;
    redirectUrl: string;
    needsRegistration?: boolean;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/libro/attiva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore durante l\'attivazione');
        return;
      }

      setSuccess(data);

      // Redirect dopo 2 secondi se non serve registrazione
      if (!data.needsRegistration) {
        setTimeout(() => {
          router.push(data.redirectUrl);
        }, 2000);
      }
    } catch (err) {
      setError('Errore di connessione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const bookInfo = success?.assessmentType ? BOOK_INFO[success.assessmentType] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Attiva il tuo libro
          </h1>
          <p className="text-slate-600">
            Inserisci il codice che trovi nel libro per sbloccare l&apos;assessment
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  La tua email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@esempio.com"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>

              {/* Codice */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-1">
                  Codice del libro
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Es. LEADERSHIP2026"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition font-mono text-lg tracking-wider"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Trovi il codice nell&apos;appendice del libro
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !code || !email}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifica in corso...
                  </>
                ) : (
                  <>
                    Attiva il tuo percorso
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {success.needsRegistration ? 'Codice valido!' : 'Attivazione completata!'}
              </h2>

              <p className="text-slate-600 mb-4">
                {success.message}
              </p>

              {bookInfo && (
                <div
                  className="inline-block px-4 py-2 rounded-full text-white text-sm font-medium mb-4"
                  style={{ backgroundColor: bookInfo.color }}
                >
                  {bookInfo.name} - {bookInfo.questions} domande
                </div>
              )}

              {success.needsRegistration ? (
                <Link
                  href={success.redirectUrl}
                  className="block w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition text-center"
                >
                  Registrati per continuare
                </Link>
              ) : (
                <div className="text-sm text-slate-500">
                  Reindirizzamento all&apos;assessment...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            Non hai un libro?{' '}
            <Link href="/libro/leadership" className="text-amber-600 hover:underline">
              Acquistalo qui
            </Link>
          </p>
          <p className="mt-2">
            Hai già un account?{' '}
            <Link href="/auth/login" className="text-amber-600 hover:underline">
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
