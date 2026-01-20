'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, Bug, Lightbulb, HelpCircle, Heart, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface FeedbackWidgetProps {
  // Se true, mostra sempre il widget (per testing)
  forceShow?: boolean;
}

type FeedbackType = 'bug' | 'suggestion' | 'question' | 'praise';
type Severity = 'critical' | 'high' | 'medium' | 'low';

const feedbackTypes: { value: FeedbackType; label: string; icon: typeof Bug; color: string }[] = [
  { value: 'bug', label: 'Bug', icon: Bug, color: 'text-red-500 bg-red-50 border-red-200' },
  { value: 'suggestion', label: 'Suggerimento', icon: Lightbulb, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  { value: 'question', label: 'Domanda', icon: HelpCircle, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  { value: 'praise', label: 'Complimenti', icon: Heart, color: 'text-pink-500 bg-pink-50 border-pink-200' },
];

const severityOptions: { value: Severity; label: string }[] = [
  { value: 'critical', label: 'Critico - Blocca utilizzo' },
  { value: 'high', label: 'Alto - Problema serio' },
  { value: 'medium', label: 'Medio - Fastidioso' },
  { value: 'low', label: 'Basso - Minore' },
];

export default function FeedbackWidget({ forceShow = false }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  // Verifica se l'utente è loggato
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Sottoscrivi ai cambiamenti di auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Carica stato dismissed da localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('feedbackWidgetDismissed');
    if (dismissed) {
      const dismissedAt = new Date(dismissed);
      const now = new Date();
      // Reset dopo 24 ore
      if (now.getTime() - dismissedAt.getTime() < 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem('feedbackWidgetDismissed');
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('feedbackWidgetDismissed', new Date().toISOString());
  };

  const resetForm = () => {
    setFeedbackType(null);
    setDescription('');
    setSeverity('medium');
    setError('');
    setIsSubmitted(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset dopo un po' per animazione
    setTimeout(resetForm, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedbackType) {
      setError('Seleziona un tipo di feedback');
      return;
    }

    if (!description.trim()) {
      setError('Inserisci una descrizione');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/beta/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          description: description.trim(),
          page_url: window.location.href,
          severity: feedbackType === 'bug' ? severity : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante l\'invio');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'invio');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Non mostrare se loading, non loggato, o dismissed (a meno che forceShow)
  if (isLoading) return null;
  if (!forceShow && (!isLoggedIn || isDismissed)) return null;

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
        {/* Dismiss button (solo se non aperto) */}
        {!isOpen && !isDismissed && (
          <button
            onClick={handleDismiss}
            className="w-6 h-6 bg-gray-100 text-gray-400 rounded-full shadow hover:bg-gray-200 hover:text-gray-600 transition-colors flex items-center justify-center text-xs"
            aria-label="Nascondi pulsante feedback"
            title="Nascondi per 24h"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Main Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-petrol-600 text-white rounded-full shadow-lg hover:bg-petrol-700 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
          aria-label="Invia Feedback"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Modal con Form Nativo */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="font-semibold text-gray-900">Invia Feedback</h3>
                <p className="text-xs text-gray-500">Aiutaci a migliorare Vitaeology</p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isSubmitted ? (
                // Success state
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Grazie! Feedback ricevuto
                  </h4>
                  <p className="text-gray-500 text-sm mb-6">
                    Il tuo contributo ci aiuta a migliorare la piattaforma.
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-petrol-600 text-white rounded-lg hover:bg-petrol-700 transition-colors"
                  >
                    Chiudi
                  </button>
                </div>
              ) : (
                // Form
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Tipo feedback */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo di feedback
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {feedbackTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = feedbackType === type.value;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFeedbackType(type.value)}
                            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                              isSelected
                                ? type.color + ' border-current'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Severità (solo per bug) */}
                  {feedbackType === 'bug' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gravità del bug
                      </label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value as Severity)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-petrol-500 text-sm"
                      >
                        {severityOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Descrizione */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrizione
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={
                        feedbackType === 'bug'
                          ? 'Descrivi il problema: cosa stavi facendo, cosa ti aspettavi, cosa è successo...'
                          : feedbackType === 'suggestion'
                          ? 'Descrivi la tua idea o suggerimento...'
                          : feedbackType === 'question'
                          ? 'Qual è la tua domanda?'
                          : 'Cosa ti piace di Vitaeology?'
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-petrol-500 text-sm resize-none"
                    />
                  </div>

                  {/* Pagina corrente (auto-detect) */}
                  <div className="text-xs text-gray-400">
                    Pagina: {typeof window !== 'undefined' ? window.location.pathname : ''}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !feedbackType || !description.trim()}
                    className="w-full py-3 bg-petrol-600 text-white rounded-lg font-medium hover:bg-petrol-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Invio in corso...
                      </>
                    ) : (
                      'Invia Feedback'
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Footer info */}
            {!isSubmitted && (
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center shrink-0">
                <p className="text-xs text-gray-400">
                  Il feedback viene associato al tuo account per follow-up
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
