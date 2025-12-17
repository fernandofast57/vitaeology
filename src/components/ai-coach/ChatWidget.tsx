'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Message, UserContext, ChatResponse } from '@/lib/ai-coach/types';
import { SignalType } from '@/types/ai-coach-learning';

// Messaggio esteso con metadati per tracking
interface ExtendedMessage extends Message {
  conversationId?: string;
  feedback?: 'positive' | 'negative' | null;
  timestamp?: number;
}

interface ChatWidgetProps {
  userContext: UserContext;
}

// Soglie per segnali impliciti
const LONG_PAUSE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minuti
const IMMEDIATE_REPLY_THRESHOLD_MS = 30 * 1000; // 30 secondi

export default function ChatWidget({ userContext }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAssistantTimestamp = useRef<number | null>(null);
  const lastConversationId = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Funzione per registrare segnali impliciti
  const recordSignal = useCallback(async (
    signalType: SignalType,
    conversationId: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!userContext.userId || !sessionId) return;

    try {
      await fetch('/api/ai-coach/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          user_id: userContext.userId,
          session_id: sessionId,
          signal_type: signalType,
          metadata,
        }),
      });
    } catch (error) {
      console.error('Errore registrazione segnale:', error);
    }
  }, [userContext.userId, sessionId]);

  // Traccia abbandono conversazione
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Se c'e una conversazione attiva e l'ultima risposta non ha ricevuto interazione
      if (lastConversationId.current && lastAssistantTimestamp.current) {
        const timeSinceLastResponse = Date.now() - lastAssistantTimestamp.current;
        // Se l'utente esce entro 2 minuti dalla risposta senza interagire
        if (timeSinceLastResponse < 2 * 60 * 1000) {
          // Usa sendBeacon per garantire l'invio
          navigator.sendBeacon('/api/ai-coach/signals', JSON.stringify({
            conversation_id: lastConversationId.current,
            user_id: userContext.userId,
            session_id: sessionId,
            signal_type: 'abandoned_conversation',
            metadata: { timeSinceLastResponse },
          }));
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userContext.userId, sessionId]);

  // Funzione per inviare feedback
  const sendFeedback = useCallback(async (
    conversationId: string,
    isHelpful: boolean,
    messageIndex: number
  ) => {
    if (!userContext.userId || feedbackLoading) return;

    setFeedbackLoading(conversationId);

    try {
      const response = await fetch('/api/ai-coach/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          user_id: userContext.userId,
          is_helpful: isHelpful,
        }),
      });

      if (response.ok) {
        // Aggiorna lo stato del feedback nel messaggio
        setMessages(prev => prev.map((msg, idx) =>
          idx === messageIndex
            ? { ...msg, feedback: isHelpful ? 'positive' : 'negative' }
            : msg
        ));
      }
    } catch (error) {
      console.error('Errore invio feedback:', error);
    } finally {
      setFeedbackLoading(null);
    }
  }, [userContext.userId, feedbackLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const now = Date.now();

    // Traccia segnali impliciti basati sul tempo
    if (lastAssistantTimestamp.current && lastConversationId.current) {
      const timeSinceLastResponse = now - lastAssistantTimestamp.current;

      if (timeSinceLastResponse >= LONG_PAUSE_THRESHOLD_MS) {
        // Lunga pausa prima di rispondere
        recordSignal('long_pause_before_reply', lastConversationId.current, {
          pauseDurationMs: timeSinceLastResponse,
        });
      } else if (timeSinceLastResponse <= IMMEDIATE_REPLY_THRESHOLD_MS) {
        // Risposta immediata (possibile insoddisfazione)
        recordSignal('immediate_new_question', lastConversationId.current, {
          replyTimeMs: timeSinceLastResponse,
        });
      }
    }

    const userMessage: ExtendedMessage = { role: 'user', content: input, timestamp: now };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userContext,
          sessionId,
        }),
      });

      const data: ChatResponse = await response.json();

      // Salva sessionId se non ancora settato
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      const responseTimestamp = Date.now();

      // Aggiorna tracking per prossimo messaggio
      if (data.conversationId) {
        lastAssistantTimestamp.current = responseTimestamp;
        lastConversationId.current = data.conversationId;
      }

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: data.message,
          conversationId: data.conversationId,
          feedback: null,
          timestamp: responseTimestamp,
        },
      ]);

      if (data.isSafetyAlert) {
        console.warn('Safety alert triggered');
      }
    } catch (error) {
      console.error('Errore invio messaggio:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Mi dispiace, si e verificato un errore. Riprova tra poco.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50"
        aria-label="Apri chat con Fernando"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">F</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">Fernando</h3>
            <p className="text-xs text-indigo-200">Il tuo coach Vitaeology</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Chiudi chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p className="text-lg font-medium mb-2">Ciao! Sono Fernando</p>
            <p className="text-sm">
              Come posso aiutarti oggi nel tuo percorso Vitaeology?
            </p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex flex-col">
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {/* Feedback buttons per messaggi assistant */}
              {msg.role === 'assistant' && msg.conversationId && (
                <div className="flex items-center gap-2 mt-1 ml-1">
                  {msg.feedback === null ? (
                    <>
                      <button
                        onClick={() => sendFeedback(msg.conversationId!, true, index)}
                        disabled={feedbackLoading === msg.conversationId}
                        className="p-1 text-gray-400 hover:text-green-500 transition-colors disabled:opacity-50"
                        aria-label="Risposta utile"
                        title="Risposta utile"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => sendFeedback(msg.conversationId!, false, index)}
                        disabled={feedbackLoading === msg.conversationId}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        aria-label="Risposta non utile"
                        title="Risposta non utile"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs ${msg.feedback === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                      {msg.feedback === 'positive' ? 'Grazie!' : 'Grazie per il feedback'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrivi un messaggio..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-full transition-colors"
            aria-label="Invia messaggio"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
