'use client';

/**
 * Modal di benvenuto per Founding Tester
 * Appare UNA sola volta al primo accesso alla dashboard dopo approvazione beta.
 *
 * Requisiti:
 * - Visivamente coerente con stile Vitaeology (gradient petrol, design premium)
 * - Max 10 secondi di lettura
 * - UN solo pulsante di azione "Iniziamo!"
 * - Tono: caldo, esclusivo, NON commerciale
 * - Linguaggio validante: enfasi su cosa il FT HA
 */

import { useState, useEffect } from 'react';

interface FoundingTesterWelcomeProps {
  userName: string;
  premiumUntil?: string; // Data formattata in italiano (es. "6 agosto 2026")
  challengeUrl?: string; // URL della challenge attiva (se esiste)
  onComplete: () => Promise<void>; // Callback per marcare onboarding come completato
}

export default function FoundingTesterWelcome({
  userName,
  premiumUntil,
  challengeUrl,
  onComplete,
}: FoundingTesterWelcomeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animazione fade-in morbida al mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Gestione chiusura con animazione
  const handleClose = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await onComplete();
      setIsClosing(true);

      // Aspetta fine animazione prima di rimuovere dal DOM
      setTimeout(() => {
        // Il componente sarà rimosso dal parent
      }, 300);
    } catch (error) {
      console.error('Errore chiusura onboarding:', error);
      setIsSubmitting(false);
    }
  };

  // Nome visualizzato (solo primo nome)
  const firstName = userName.split(' ')[0] || 'Founding Tester';

  // Calcola mesi premium rimanenti per il messaggio
  const getPremiumMonthsText = () => {
    if (!premiumUntil) return '6 mesi';
    return '6 mesi'; // Semplificato: mostriamo sempre "6 mesi" come indicativo
  };

  // URL destinazione per il pulsante
  const ctaUrl = challengeUrl || '/dashboard';
  const ctaText = challengeUrl ? 'Iniziamo!' : 'Esplora la Dashboard';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      {/* Overlay scuro semi-trasparente */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Card modale */}
      <div
        className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
          isVisible && !isClosing ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Header con gradient Vitaeology */}
        <div className="bg-gradient-to-br from-[#0A2540] to-[#1a3a5c] px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F4B942]/20 rounded-full mb-4">
            <span className="text-3xl">🏆</span>
          </div>
          <h2
            id="onboarding-title"
            className="text-2xl font-bold text-white mb-2"
          >
            Benvenuto, {firstName}!
          </h2>
          <p className="text-[#F4B942] font-medium">
            Sei un Founding Tester di Vitaeology
          </p>
        </div>

        {/* Contenuto - 3 blocchi */}
        <div className="px-6 py-6 space-y-5">
          {/* Blocco 1: Identità */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#F4B942]/10 rounded-lg flex items-center justify-center">
              <span className="text-xl">🌟</span>
            </div>
            <div>
              <h3 className="font-semibold text-[#0A2540] mb-1">
                Fai parte dei primi 100
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Stai costruendo Vitaeology insieme a noi. Il tuo feedback e la tua esperienza contano.
              </p>
            </div>
          </div>

          {/* Blocco 2: Cosa hai */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🎁</span>
            </div>
            <div>
              <h3 className="font-semibold text-[#0A2540] mb-1">
                I tuoi benefici sono già attivi
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Accesso Premium gratuito per {getPremiumMonthsText()}, AI Coach Fernando, Assessment completo e tutti gli esercizi.
                {premiumUntil && (
                  <span className="block mt-1 text-emerald-600 font-medium">
                    Valido fino al {premiumUntil}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Blocco 3: Primo passo */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🚀</span>
            </div>
            <div>
              <h3 className="font-semibold text-[#0A2540] mb-1">
                Da dove iniziare
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {challengeUrl
                  ? 'La tua Challenge ti aspetta. Completa i 7 giorni per sbloccare il tuo profilo completo.'
                  : 'Esplora la dashboard e inizia il tuo percorso di leadership.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer con CTA */}
        <div className="px-6 pb-6">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full py-4 bg-[#F4B942] hover:bg-[#e5a93a] text-[#0A2540] font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Un momento...
              </span>
            ) : (
              ctaText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
