'use client';

import { useState, useRef, useEffect } from 'react';

interface ExportButtonProps {
  sessionId: string;
  disabled?: boolean;
}

export default function ExportButton({ sessionId, disabled }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'txt' | 'pdf' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Chiudi menu se click fuori
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: 'txt' | 'pdf') => {
    setIsExporting(true);
    setExportFormat(format);
    setIsOpen(false);

    try {
      const response = await fetch(
        `/api/ai-coach/export?sessionId=${sessionId}&format=${format}`
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Ottieni blob e scarica
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `vitaeology-chat-export.${format}`;

      // Crea link download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Errore export:', error);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
        className={`p-1.5 rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Esporta conversazione"
        aria-label="Esporta conversazione"
      >
        {isExporting ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[180px] z-50 animate-fadeIn">
          <div className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            Esporta conversazione
          </div>
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 disabled:opacity-50 text-gray-700 dark:text-gray-200"
          >
            {/* PDF icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
              <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
              <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
            </svg>
            <div className="flex-1">
              <span className="block font-medium">PDF</span>
              <span className="block text-xs text-gray-400">Formattato per stampa</span>
            </div>
            {exportFormat === 'pdf' && (
              <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => handleExport('txt')}
            disabled={isExporting}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 disabled:opacity-50 text-gray-700 dark:text-gray-200"
          >
            {/* TXT icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-500">
              <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
              <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
            </svg>
            <div className="flex-1">
              <span className="block font-medium">Testo (.txt)</span>
              <span className="block text-xs text-gray-400">Formato semplice</span>
            </div>
            {exportFormat === 'txt' && (
              <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
