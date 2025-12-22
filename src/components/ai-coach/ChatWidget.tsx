'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Message, UserContext, ChatResponse } from '@/lib/ai-coach/types';
import { SignalType } from '@/types/ai-coach-learning';
import ConversationHistory from './ConversationHistory';
import ExportButton from './ExportButton';

// Componente indicatore di pensiero con messaggi dinamici
function ThinkingIndicator({ startTime }: { startTime: number }) {
  const [dots, setDots] = useState('.');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Animazione dots
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev === '...' ? '.' : prev + '.'));
    }, 400);
    return () => clearInterval(dotsInterval);
  }, []);

  // Tracker tempo trascorso
  useEffect(() => {
    const timeInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);
    return () => clearInterval(timeInterval);
  }, [startTime]);

  // Messaggio dinamico basato su tempo
  const getMessage = () => {
    if (elapsedSeconds < 3) {
      return 'Fernando sta pensando';
    } else if (elapsedSeconds < 6) {
      return 'Sto elaborando una risposta completa';
    } else {
      return 'Ancora qualche secondo, grazie per la pazienza';
    }
  };

  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-md">
        <div className="w-6 h-6 bg-[#0A2540] rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">F</span>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {getMessage()}<span className="inline-block w-4 text-left">{dots}</span>
        </span>
      </div>
    </div>
  );
}

// Messaggio esteso con metadati per tracking
interface ExtendedMessage extends Message {
  conversationId?: string;
  feedback?: 'positive' | 'negative' | null;
  timestamp?: number;
  reformulationCount?: number;
  isReformulated?: boolean;
  isEdited?: boolean;
}

interface ChatWidgetProps {
  userContext: UserContext;
}

// Soglie per segnali impliciti
const LONG_PAUSE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minuti
const IMMEDIATE_REPLY_THRESHOLD_MS = 30 * 1000; // 30 secondi
const EDIT_TIME_LIMIT_MS = 5 * 60 * 1000; // 5 minuti per modificare un messaggio

export default function ChatWidget({ userContext }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number>(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [reformulatingId, setReformulatingId] = useState<string | null>(null);
  // Star rating states
  const [starRatingMessageId, setStarRatingMessageId] = useState<string | null>(null);
  const [starHoverValue, setStarHoverValue] = useState<number>(0);
  const [starThanksMessageId, setStarThanksMessageId] = useState<string | null>(null);
  // Message editing states
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null);
  // Sidebar history states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const lastAssistantTimestamp = useRef<number | null>(null);
  const lastConversationId = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carica cronologia conversazioni quando il widget si apre
  const loadConversationHistory = useCallback(async () => {
    if (!userContext.userId || historyLoaded) return;

    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/ai-coach/history');
      if (response.ok) {
        const data = await response.json();

        if (data.conversations && data.conversations.length > 0) {
          // Converti le conversazioni in messaggi
          const historyMessages: ExtendedMessage[] = [];
          data.conversations.forEach((conv: {
            id: string;
            user_message: string;
            ai_response: string;
            created_at: string;
            is_edited?: boolean;
          }) => {
            historyMessages.push({
              role: 'user',
              content: conv.user_message,
              timestamp: new Date(conv.created_at).getTime(),
              conversationId: conv.id, // Aggiungi conversationId anche al messaggio utente
              isEdited: conv.is_edited || false,
            });
            historyMessages.push({
              role: 'assistant',
              content: conv.ai_response,
              conversationId: conv.id,
              feedback: null,
              timestamp: new Date(conv.created_at).getTime(),
            });
          });

          setMessages(historyMessages);

          // Imposta sessionId dalla cronologia
          if (data.sessionId) {
            setSessionId(data.sessionId);
          }

          // Aggiorna timestamp ultimo messaggio
          const lastMsg = historyMessages[historyMessages.length - 1];
          if (lastMsg?.role === 'assistant' && lastMsg.timestamp) {
            lastAssistantTimestamp.current = lastMsg.timestamp;
            lastConversationId.current = lastMsg.conversationId || null;
          }
        }

        setHistoryLoaded(true);
      }
    } catch (error) {
      console.error('Errore caricamento cronologia:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userContext.userId, historyLoaded]);

  // Carica messaggi di una sessione specifica
  const loadSessionMessages = useCallback(async (selectedSessionId: string) => {
    if (!userContext.userId) return;

    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/ai-coach/history?sessionId=${selectedSessionId}`);
      if (response.ok) {
        const data = await response.json();

        if (data.conversations && data.conversations.length > 0) {
          const historyMessages: ExtendedMessage[] = [];
          data.conversations.forEach((conv: {
            id: string;
            user_message: string;
            ai_response: string;
            created_at: string;
            is_edited?: boolean;
          }) => {
            historyMessages.push({
              role: 'user',
              content: conv.user_message,
              timestamp: new Date(conv.created_at).getTime(),
              conversationId: conv.id,
              isEdited: conv.is_edited || false,
            });
            historyMessages.push({
              role: 'assistant',
              content: conv.ai_response,
              conversationId: conv.id,
              feedback: null,
              timestamp: new Date(conv.created_at).getTime(),
            });
          });

          setMessages(historyMessages);
          setSessionId(selectedSessionId);

          // Aggiorna tracking
          const lastMsg = historyMessages[historyMessages.length - 1];
          if (lastMsg?.role === 'assistant' && lastMsg.timestamp) {
            lastAssistantTimestamp.current = lastMsg.timestamp;
            lastConversationId.current = lastMsg.conversationId || null;
          }
        }
      }
    } catch (error) {
      console.error('Errore caricamento sessione:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userContext.userId]);

  // Handler per selezionare una conversazione dalla sidebar
  const handleSelectConversation = useCallback((selectedSessionId: string) => {
    loadSessionMessages(selectedSessionId);
    setIsMobileMenuOpen(false);
  }, [loadSessionMessages]);

  // Handler per nuova conversazione
  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setHistoryLoaded(false);
    lastAssistantTimestamp.current = null;
    lastConversationId.current = null;
    setIsMobileMenuOpen(false);
  }, []);

  // Carica cronologia quando il widget viene aperto
  useEffect(() => {
    if (isOpen && !historyLoaded) {
      loadConversationHistory();
    }
  }, [isOpen, historyLoaded, loadConversationHistory]);

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
        // Mostra star rating dopo il feedback thumbs
        setStarRatingMessageId(conversationId);
      }
    } catch (error) {
      console.error('Errore invio feedback:', error);
    } finally {
      setFeedbackLoading(null);
    }
  }, [userContext.userId, feedbackLoading]);

  // Funzione per inviare star rating
  const sendStarRating = useCallback(async (
    conversationId: string,
    rating: number
  ) => {
    if (!userContext.userId) return;

    try {
      await fetch('/api/ai-coach/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          user_id: userContext.userId,
          rating,
        }),
      });

      // Nascondi stars e mostra "Grazie!"
      setStarRatingMessageId(null);
      setStarHoverValue(0);
      setStarThanksMessageId(conversationId);

      // Nascondi "Grazie!" dopo 2 secondi
      setTimeout(() => {
        setStarThanksMessageId(null);
      }, 2000);
    } catch (error) {
      console.error('Errore invio star rating:', error);
    }
  }, [userContext.userId]);

  // Verifica se un messaggio utente è modificabile
  const isMessageEditable = useCallback((msg: ExtendedMessage, index: number): boolean => {
    // Solo messaggi utente
    if (msg.role !== 'user') return false;
    // Non già modificato
    if (msg.isEdited) return false;
    // Deve avere conversationId (messaggio salvato nel DB)
    if (!msg.conversationId) return false;
    // Entro 5 minuti
    const messageTime = msg.timestamp || 0;
    if (Date.now() - messageTime > EDIT_TIME_LIMIT_MS) return false;
    // Tra gli ultimi 2 messaggi utente
    const userMessages = messages
      .map((m, idx) => ({ ...m, originalIndex: idx }))
      .filter(m => m.role === 'user');
    const lastTwoUserMsgs = userMessages.slice(-2);
    return lastTwoUserMsgs.some(m => m.originalIndex === index);
  }, [messages]);

  // Focus textarea quando entra in editing
  useEffect(() => {
    if (editingMessageIndex !== null && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.setSelectionRange(
        editContent.length,
        editContent.length
      );
    }
  }, [editingMessageIndex, editContent.length]);

  // Inizia editing
  const startEditing = useCallback((index: number, content: string) => {
    setEditingMessageIndex(index);
    setEditContent(content);
  }, []);

  // Annulla editing
  const cancelEditing = useCallback(() => {
    setEditingMessageIndex(null);
    setEditContent('');
  }, []);

  // Invia modifica
  const handleEditSubmit = useCallback(async () => {
    if (editingMessageIndex === null || !editContent.trim()) {
      cancelEditing();
      return;
    }

    const messageToEdit = messages[editingMessageIndex];
    if (!messageToEdit?.conversationId) {
      cancelEditing();
      return;
    }

    // Se il contenuto non è cambiato, annulla
    if (editContent.trim() === messageToEdit.content) {
      cancelEditing();
      return;
    }

    setIsSubmittingEdit(true);

    try {
      // Costruisci messaggi precedenti per contesto (tutti i messaggi prima di quello da modificare)
      const previousMessages = messages
        .slice(0, editingMessageIndex)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/ai-coach/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: messageToEdit.conversationId,
          newContent: editContent.trim(),
          userContext,
          previousMessages,
        }),
      });

      const data = await response.json();

      if (data.success && data.newAiResponse) {
        // Aggiorna messaggi: modifica messaggio utente e risposta AI
        setMessages(prev => prev.map((msg, idx) => {
          if (idx === editingMessageIndex) {
            // Messaggio utente modificato
            return {
              ...msg,
              content: editContent.trim(),
              isEdited: true,
            };
          }
          if (idx === editingMessageIndex + 1 && msg.role === 'assistant') {
            // Risposta AI rigenerata
            return {
              ...msg,
              content: data.newAiResponse,
              feedback: null, // Reset feedback per nuova risposta
              reformulationCount: 0,
              isReformulated: false,
            };
          }
          return msg;
        }));
      } else {
        console.error('Errore modifica:', data.error);
      }
    } catch (error) {
      console.error('Errore modifica messaggio:', error);
    } finally {
      setIsSubmittingEdit(false);
      cancelEditing();
    }
  }, [editingMessageIndex, editContent, messages, userContext, cancelEditing]);

  // Gestione tasti durante editing
  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      cancelEditing();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleEditSubmit();
    }
  }, [cancelEditing, handleEditSubmit]);

  // Funzione per riformulare una risposta
  const handleReformulate = useCallback(async (
    conversationId: string,
    originalContent: string,
    messageIndex: number
  ) => {
    const currentMessage = messages[messageIndex];
    const currentCount = currentMessage?.reformulationCount || 0;

    // Verifica limite
    if (currentCount >= 2) return;

    setReformulatingId(conversationId);

    try {
      const response = await fetch('/api/ai-coach/reformulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          originalResponse: originalContent,
        }),
      });

      const data = await response.json();

      if (data.success && data.newResponse) {
        // Aggiorna il messaggio con la nuova risposta
        setMessages(prev => prev.map((msg, idx) =>
          idx === messageIndex
            ? {
                ...msg,
                content: data.newResponse,
                reformulationCount: data.reformulationCount,
                isReformulated: true,
              }
            : msg
        ));
      } else {
        console.error('Errore riformulazione:', data.error);
      }
    } catch (error) {
      console.error('Errore riformulazione:', error);
    } finally {
      setReformulatingId(null);
    }
  }, [messages]);

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
    setLoadingStartTime(Date.now());

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
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50"
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
    <>
      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Sidebar panel */}
          <div className="absolute left-0 top-0 bottom-0 w-72 animate-slideInLeft">
            <ConversationHistory
              currentSessionId={sessionId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              onClose={() => setIsMobileMenuOpen(false)}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {/* Main chat container */}
      <div className={`fixed inset-x-2 bottom-2 sm:inset-auto sm:bottom-6 sm:right-6 h-[85vh] sm:h-[520px] max-h-[650px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex z-50 border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        sidebarOpen ? 'sm:w-[680px]' : 'sm:w-96'
      }`}>
        {/* Desktop sidebar */}
        {sidebarOpen && (
          <div className="hidden sm:block w-64 border-r border-gray-200 dark:border-gray-700 rounded-l-2xl overflow-hidden">
            <ConversationHistory
              currentSessionId={sessionId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
            />
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className={`flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 ${sidebarOpen ? 'rounded-tr-2xl' : 'rounded-t-2xl'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">F</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">Fernando</h3>
            <p className="text-xs text-indigo-200">Il tuo coach Vitaeology</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Pulsante cronologia mobile (hamburger) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="sm:hidden text-white/80 hover:text-white transition-colors p-1"
            aria-label="Cronologia conversazioni"
            title="Cronologia"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          {/* Pulsante cronologia desktop */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden sm:block text-white/80 hover:text-white transition-colors p-1"
            aria-label={sidebarOpen ? 'Chiudi cronologia' : 'Apri cronologia'}
            title={sidebarOpen ? 'Chiudi cronologia' : 'Cronologia'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </button>
          {/* Pulsante export */}
          {sessionId && messages.length > 0 && (
            <ExportButton
              sessionId={sessionId}
              disabled={messages.length === 0}
            />
          )}
          {messages.length > 0 && (
            <button
              onClick={handleNewConversation}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Nuova conversazione"
              title="Nuova conversazione"
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
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </button>
          )}
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
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-x-hidden">
        {isLoadingHistory && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <div className="flex justify-center mb-2">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm">Caricamento conversazioni...</p>
          </div>
        )}
        {!isLoadingHistory && messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p className="text-lg font-medium mb-2">Ciao! Sono Fernando</p>
            <p className="text-sm">
              Come posso aiutarti oggi nel tuo percorso Vitaeology?
            </p>
          </div>
        )}
        {!isLoadingHistory && messages.length > 0 && historyLoaded && (
          <div className="flex items-center gap-2 py-2">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
            <span className="text-xs text-gray-400 dark:text-gray-500 px-2">Conversazione precedente</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            onMouseEnter={() => msg.role === 'user' && setHoveredMessageIndex(index)}
            onMouseLeave={() => msg.role === 'user' && setHoveredMessageIndex(null)}
          >
            <div className="flex flex-col max-w-[85%] sm:max-w-[80%]">
              {/* Messaggio utente - con supporto editing */}
              {msg.role === 'user' && editingMessageIndex === index ? (
                // Stato editing
                <div className="flex flex-col gap-2">
                  <textarea
                    ref={editTextareaRef}
                    value={editContent}
                    onChange={(e) => {
                      setEditContent(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={handleEditKeyDown}
                    disabled={isSubmittingEdit}
                    className="w-full p-3 rounded-lg border-2 border-[#0A2540] resize-none text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20 disabled:opacity-50"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEditing}
                      disabled={isSubmittingEdit}
                      className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Annulla
                    </button>
                    <button
                      onClick={handleEditSubmit}
                      disabled={isSubmittingEdit || !editContent.trim()}
                      className="px-3 py-1.5 text-sm text-white bg-[#0A2540] rounded-md hover:bg-[#0A2540]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingEdit ? 'Invio...' : 'Invia modifica'}
                    </button>
                  </div>
                </div>
              ) : (
                // Stato normale messaggio
                <div
                  className={`relative p-3 rounded-2xl break-words ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words overflow-hidden pr-6">{msg.content}</p>

                  {/* Icona modifica - solo per messaggi utente editabili e on hover */}
                  {msg.role === 'user' && isMessageEditable(msg, index) && hoveredMessageIndex === index && (
                    <button
                      onClick={() => startEditing(index, msg.content)}
                      className="absolute top-2 right-2 p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      title="Modifica messaggio"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Badge "Modificato" per messaggi utente editati */}
              {msg.role === 'user' && msg.isEdited && editingMessageIndex !== index && (
                <span className="text-[11px] text-gray-400 mt-1 mr-1 text-right">
                  Modificato
                </span>
              )}
              {/* Feedback e riformula buttons per messaggi assistant */}
              {msg.role === 'assistant' && msg.conversationId && (
                <div className="flex flex-col gap-1 mt-1 ml-1">
                  <div className="flex items-center gap-2">
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
                    ) : starThanksMessageId === msg.conversationId ? (
                      <span className="text-xs text-[#F4B942] font-medium animate-fadeIn">
                        Grazie!
                      </span>
                    ) : (
                      <span className={`text-xs ${msg.feedback === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                        {msg.feedback === 'positive' ? '👍' : '👎'}
                      </span>
                    )}

                    {/* Pulsante Riformula */}
                    <button
                      onClick={() => handleReformulate(msg.conversationId!, msg.content, index)}
                      disabled={reformulatingId === msg.conversationId || (msg.reformulationCount || 0) >= 2}
                      className={`p-1 transition-colors ${
                        (msg.reformulationCount || 0) >= 2
                          ? 'text-gray-300 cursor-not-allowed opacity-50'
                          : 'text-gray-400 hover:text-[#0A2540]'
                      }`}
                      aria-label={(msg.reformulationCount || 0) >= 2 ? 'Limite riformulazioni raggiunto' : 'Riformula questa risposta'}
                      title={(msg.reformulationCount || 0) >= 2 ? 'Limite riformulazioni raggiunto' : 'Riformula questa risposta'}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className={`w-4 h-4 ${reformulatingId === msg.conversationId ? 'animate-spin' : ''}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </button>
                  </div>

                  {/* Badge Riformulato */}
                  {msg.isReformulated && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.932.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-1.242l.842.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44 1.241l-.84-.84v1.371a.75.75 0 0 1-1.5 0V9.591a.75.75 0 0 1 .75-.75H5.35a.75.75 0 0 1 0 1.5H3.98l.841.841a4.5 4.5 0 0 0 7.08-.932.75.75 0 0 1 1.025-.273Z" clipRule="evenodd" />
                      </svg>
                      Riformulato{(msg.reformulationCount || 0) > 1 ? ` (${msg.reformulationCount}x)` : ''}
                    </span>
                  )}

                  {/* Star Rating - appare dopo feedback thumbs */}
                  {starRatingMessageId === msg.conversationId && (
                    <div className="animate-fadeIn flex flex-col gap-1 mt-1">
                      <span className="text-xs text-gray-500">Quanto è stata utile?</span>
                      <div
                        className="flex gap-0.5"
                        onMouseLeave={() => setStarHoverValue(0)}
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => sendStarRating(msg.conversationId!, star)}
                            onMouseEnter={() => setStarHoverValue(star)}
                            className="p-0.5 transition-transform hover:scale-110"
                            aria-label={`Valuta ${star} stelle`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill={star <= starHoverValue ? '#F4B942' : '#D1D5DB'}
                              className="w-5 h-5 transition-colors"
                            >
                              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <ThinkingIndicator startTime={loadingStartTime} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrivi un messaggio..."
            className="flex-1 min-w-0 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-full transition-colors"
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
      </div>
    </>
  );
}
