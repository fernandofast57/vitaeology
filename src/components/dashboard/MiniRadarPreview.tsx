'use client';

import { Eye, Lock } from 'lucide-react';
import Link from 'next/link';

interface PillarScore {
  pillar: string;
  score: number;
}

interface MiniRadarPreviewProps {
  pillarScores: PillarScore[];
  hasResults: boolean;
  assessmentId?: string;
}

const PILLAR_COLORS: Record<string, string> = {
  'Essere': '#3B82F6',
  'Agire': '#F59E0B',
  'Sentire': '#10B981',
  'Pensare': '#8B5CF6',
};

export default function MiniRadarPreview({ pillarScores, hasResults, assessmentId }: MiniRadarPreviewProps) {
  if (!hasResults) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6">
        <h3 className="text-lg font-bold text-neutral-900 mb-4">Il Tuo Profilo</h3>
        <div className="relative">
          <div className="h-48 bg-neutral-100 rounded-xl opacity-50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="p-3 bg-neutral-100 rounded-full mb-3">
              <Lock className="w-6 h-6 text-neutral-400" />
            </div>
            <p className="text-sm text-neutral-600 text-center mb-3 px-4">Completa l assessment per vedere il radar</p>
            <Link href="/test" className="text-sm font-medium text-petrol-600">Inizia ora</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-neutral-900">Il Tuo Profilo</h3>
        <Link href="/results" className="inline-flex items-center gap-1 text-sm text-petrol-600">
          <Eye className="w-4 h-4" /> Dettagli
        </Link>
      </div>
      <div className="space-y-3">
        {pillarScores.map((ps) => (
          <div key={ps.pillar}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-neutral-600">{ps.pillar}</span>
              <span className="text-sm font-medium">{ps.score}%</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${ps.score}%`, backgroundColor: PILLAR_COLORS[ps.pillar] || '#6b7280' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
