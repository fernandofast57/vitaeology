'use client';

import { useState, useEffect, useCallback } from 'react';

interface Conversation {
  sessionId: string;
  title: string;
  updatedAt: string;
  messagesCount: number;
  matchedContent?: string;
}

interface ConversationHistoryProps {
  currentSessionId?: string | null;
  onSelectConversation: (sessionId: string) => void;
  onNewConversation: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

// Helper per formattare la distanza temporale in italiano
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'ora';
  if (diffMins < 60) return `${diffMins} min fa`;
  if (diffHours < 24) return `${diffHours}h fa`;
  if (diffDays === 1) return 'ieri';
  if (diffDays < 7) return `${diffDays} giorni fa`;
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

// Helper per raggruppare conversazioni per periodo
function groupByPeriod(conversations: Conversation[]): Record<string, Conversation[]> {
  const groups: Record<string, Conversation[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  conversations.forEach(conv => {
    const date = new Date(conv.updatedAt);
    let period: string;

    if (date >= today) {
      period = 'Oggi';
    } else if (date >= yesterday) {
      period = 'Ieri';
    } else if (date >= weekAgo) {
      period = 'Questa settimana';
    } else if (date >= monthStart) {
      period = 'Questo mese';
    } else {
      // Raggruppa per mese
      const monthName = date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
      period = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    }

    if (!groups[period]) groups[period] = [];
    groups[period].push(conv);
  });

  return groups;
}

// Helper per evidenziare termine cercato
function highlightMatch(text: string, searchTerm: string): string {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 rounded px-0.5">$1</mark>');
}

export default function ConversationHistory({
  currentSessionId,
  onSelectConversation,
  onNewConversation,
  onClose,
  isMobile = false,
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch conversazioni
  const fetchConversations = useCallback(async (reset = false, searchQuery = '') => {
    const newOffset = reset ? 0 : offset;
    const params = new URLSearchParams({
      limit: '20',
      offset: newOffset.toString(),
    });
    if (searchQuery) {
      params.set('search', searchQuery);
    }

    try {
      setLoading(reset);
      const res = await fetch(`/api/ai-coach/conversations?${params}`);
      if (!res.ok) throw new Error('Errore caricamento');

      const data = await res.json();

      if (reset) {
        setConversations(data.conversations);
        setOffset(20);
      } else {
        setConversations(prev => [...prev, ...data.conversations]);
        setOffset(newOffset + 20);
      }
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Errore caricamento conversazioni:', error);
    } finally {
      setLoading(false);
    }
  }, [offset]);

  // Initial load
  useEffect(() => {
    fetchConversations(true);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations(true, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Elimina conversazione
  const handleDelete = async (sessionId: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/ai-coach/conversations?sessionId=${sessionId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setConversations(prev => prev.filter(c => c.sessionId !== sessionId));
        setDeleteConfirm(null);

        // Se era la conversazione attiva, crea nuova
        if (sessionId === currentSessionId) {
          onNewConversation();
        }
      }
    } catch (error) {
      console.error('Errore eliminazione:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Raggruppa per periodo
  const groupedConversations = groupByPeriod(conversations);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header con close button per mobile */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cronologia</span>
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Chiudi cronologia"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => {
            onNewConversation();
            if (isMobile && onClose) onClose();
          }}
          className="w-full py-2 px-4 bg-[#0A2540] text-white rounded-lg hover:bg-[#0A2540]/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuova conversazione
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Cerca conversazioni..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Lista conversazioni */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="w-5 h-5 border-2 border-[#0A2540] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Caricamento...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            {search ? 'Nessun risultato' : 'Nessuna conversazione'}
          </div>
        ) : (
          <>
            {Object.entries(groupedConversations).map(([period, convs]) => (
              <div key={period}>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                  {period}
                </div>
                {convs.map(conv => (
                  <ConversationItem
                    key={conv.sessionId}
                    conversation={conv}
                    isActive={conv.sessionId === currentSessionId}
                    isDeleting={deleteConfirm === conv.sessionId}
                    deletingInProgress={deleting && deleteConfirm === conv.sessionId}
                    onSelect={() => {
                      onSelectConversation(conv.sessionId);
                      if (isMobile && onClose) onClose();
                    }}
                    onDeleteClick={() => setDeleteConfirm(conv.sessionId)}
                    onDeleteConfirm={() => handleDelete(conv.sessionId)}
                    onDeleteCancel={() => setDeleteConfirm(null)}
                    searchTerm={search}
                  />
                ))}
              </div>
            ))}

            {hasMore && (
              <button
                onClick={() => fetchConversations(false, search)}
                className="w-full py-3 text-sm text-[#0A2540] dark:text-[#F4B942] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
                Carica altre
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Componente singola conversazione
function ConversationItem({
  conversation,
  isActive,
  isDeleting,
  deletingInProgress,
  onSelect,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
  searchTerm,
}: {
  conversation: Conversation;
  isActive: boolean;
  isDeleting: boolean;
  deletingInProgress: boolean;
  onSelect: () => void;
  onDeleteClick: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  searchTerm: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative px-3 py-2.5 cursor-pointer transition-colors ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-[#0A2540] dark:border-[#F4B942]'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-l-2 border-transparent'
      }`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isDeleting ? (
        // Conferma eliminazione
        <div className="flex items-center justify-between py-1">
          <span className="text-xs text-red-600 dark:text-red-400">Eliminare questa conversazione?</span>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteCancel(); }}
              disabled={deletingInProgress}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            >
              No
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteConfirm(); }}
              disabled={deletingInProgress}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-medium disabled:opacity-50"
            >
              {deletingInProgress ? '...' : 'Si'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
            <div className="flex-1 min-w-0 pr-6">
              <p
                className="text-sm text-gray-800 dark:text-gray-200 truncate"
                dangerouslySetInnerHTML={{
                  __html: highlightMatch(
                    conversation.title || 'Nuova conversazione',
                    searchTerm
                  )
                }}
              />
              {/* Mostra contenuto matchato durante ricerca */}
              {searchTerm && conversation.matchedContent && (
                <p
                  className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate"
                  dangerouslySetInnerHTML={{
                    __html: highlightMatch(
                      conversation.matchedContent,
                      searchTerm
                    )
                  }}
                />
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                <span>{formatTimeAgo(conversation.updatedAt)}</span>
                {conversation.messagesCount > 0 && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span>{conversation.messagesCount} msg</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Pulsante elimina - visibile su hover */}
          {isHovered && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Elimina conversazione"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
}
