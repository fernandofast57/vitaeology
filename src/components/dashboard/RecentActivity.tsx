'use client';

import { Calendar } from 'lucide-react';

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6">
      <h3 className="text-lg font-bold text-neutral-900 mb-4">Attività Recente</h3>
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6 text-neutral-400" />
        </div>
        <p className="text-neutral-600 mb-2">Nessuna attività recente</p>
        <p className="text-sm text-neutral-400">Inizia il tuo assessment per vedere la tua attività qui</p>
      </div>
    </div>
  );
}
