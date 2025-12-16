'use client';

import { Clock, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface TrialBannerProps {
  daysRemaining: number;
}

export default function TrialBanner({ daysRemaining }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const isUrgent = daysRemaining <= 3;

  return (
    <div className={`relative rounded-xl border p-4 ${isUrgent ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 ${isUrgent ? 'text-amber-500' : 'text-blue-500'}`} />
          <p className={`text-sm font-medium ${isUrgent ? 'text-amber-800' : 'text-blue-800'}`}>
            Il tuo periodo di prova scade tra {daysRemaining} giorni.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/pricing" className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white ${isUrgent ? 'bg-amber-600' : 'bg-blue-600'}`}>
            Scegli Piano <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button onClick={() => setDismissed(true)} className="p-1.5 rounded-lg hover:bg-black/5">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
