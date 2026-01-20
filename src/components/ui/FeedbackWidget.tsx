'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ============================================================================
// CONFIGURAZIONE TALLY.SO
// Sostituire XXXXXX con l'ID del form Tally
// Per ottenere l'ID: crea un form su tally.so e copia l'ID dall'URL
// Esempio: https://tally.so/r/ABC123 → ID = ABC123
// ============================================================================
const TALLY_FORM_URL = 'https://tally.so/r/XXXXXX';

interface FeedbackWidgetProps {
  // Se true, mostra sempre il widget (per testing)
  forceShow?: boolean;
}

export default function FeedbackWidget({ forceShow = false }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

      {/* Modal con Tally.so Form */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg h-[80vh] max-h-[700px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="font-semibold text-gray-900">Invia Feedback</h3>
                <p className="text-xs text-gray-500">Aiutaci a migliorare Vitaeology</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tally.so iframe */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={TALLY_FORM_URL}
                width="100%"
                height="100%"
                frameBorder="0"
                title="Feedback Form"
                className="w-full h-full"
                loading="lazy"
              />
            </div>

            {/* Footer info */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center shrink-0">
              <p className="text-xs text-gray-400">
                Il tuo feedback viene salvato in modo anonimo
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
