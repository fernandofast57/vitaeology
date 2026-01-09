'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface ExportAssessmentButtonProps {
  assessmentId: string;
}

export default function ExportAssessmentButton({ assessmentId }: ExportAssessmentButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch(`/api/assessment/export?id=${assessmentId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Export fallito');
      }

      // Ottieni blob e scarica
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `vitaeology-assessment.pdf`;

      // Crea link download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Errore export:', err);
      setError(err instanceof Error ? err.message : 'Errore durante l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generazione PDF...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Scarica PDF</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
