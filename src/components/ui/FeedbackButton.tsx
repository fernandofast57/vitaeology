'use client';

import { useState } from 'react';
import { MessageSquarePlus, X, Send, Bug, Lightbulb, HelpCircle } from 'lucide-react';

type FeedbackType = 'bug' | 'idea' | 'question' | null;

interface FeedbackButtonProps {
  userEmail?: string;
}

export default function FeedbackButton({ userEmail }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!feedbackType || !message.trim()) return;

    // Costruisci l'URL mailto con tutti i dettagli
    const subject = encodeURIComponent(
      `[Vitaeology Beta] ${feedbackType === 'bug' ? 'Bug Report' : feedbackType === 'idea' ? 'Idea/Suggerimento' : 'Domanda'}`
    );

    const body = encodeURIComponent(
      `Tipo: ${feedbackType === 'bug' ? 'Bug Report' : feedbackType === 'idea' ? 'Idea/Suggerimento' : 'Domanda'}\n\n` +
      `Messaggio:\n${message}\n\n` +
      `---\n` +
      `Da: ${userEmail || 'Non specificato'}\n` +
      `Pagina: ${typeof window !== 'undefined' ? window.location.pathname : ''}\n` +
      `Data: ${new Date().toLocaleString('it-IT')}`
    );

    // Apri il client email
    window.location.href = `mailto:feedback@vitaeology.com?subject=${subject}&body=${body}`;

    // Reset e mostra conferma
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setFeedbackType(null);
      setMessage('');
    }, 2000);
  };

  const feedbackTypes = [
    { type: 'bug' as const, icon: Bug, label: 'Bug', color: 'text-red-500 bg-red-50 border-red-200 hover:bg-red-100' },
    { type: 'idea' as const, icon: Lightbulb, label: 'Idea', color: 'text-amber-500 bg-amber-50 border-amber-200 hover:bg-amber-100' },
    { type: 'question' as const, icon: HelpCircle, label: 'Domanda', color: 'text-blue-500 bg-blue-50 border-blue-200 hover:bg-blue-100' },
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-petrol-600 text-white rounded-full shadow-lg hover:bg-petrol-700 hover:shadow-xl transition-all flex items-center justify-center group"
        aria-label="Invia Feedback"
      >
        <MessageSquarePlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">Invia Feedback</h3>
                <p className="text-xs text-gray-500">Aiutaci a migliorare Vitaeology</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              // Success State
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-gray-900">Grazie per il feedback!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Completa l&apos;invio nella tua app email
                </p>
              </div>
            ) : (
              // Form
              <div className="p-4 space-y-4">
                {/* Feedback Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo di feedback
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {feedbackTypes.map(({ type, icon: Icon, label, color }) => (
                      <button
                        key={type}
                        onClick={() => setFeedbackType(type)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          feedbackType === type
                            ? color.replace('hover:', '') + ' ring-2 ring-offset-1'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        style={feedbackType === type ? { '--tw-ring-color': color.includes('red') ? '#ef4444' : color.includes('amber') ? '#f59e0b' : '#3b82f6' } as React.CSSProperties : {}}
                      >
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${feedbackType === type ? color.split(' ')[0] : 'text-gray-400'}`} />
                        <span className={`text-xs font-medium ${feedbackType === type ? 'text-gray-900' : 'text-gray-600'}`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Il tuo messaggio
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      feedbackType === 'bug'
                        ? 'Descrivi cosa non funziona e come riprodurre il problema...'
                        : feedbackType === 'idea'
                        ? 'Condividi la tua idea per migliorare Vitaeology...'
                        : 'Scrivi la tua domanda...'
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent resize-none text-sm"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!feedbackType || !message.trim()}
                  className="w-full py-3 bg-petrol-600 text-white font-medium rounded-lg hover:bg-petrol-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Invia Feedback
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Si aprirà la tua app email per completare l&apos;invio
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
