'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FactorMetric {
  value: number | string;
  trend: 'up' | 'down' | 'stable';
  label: string;
}

interface ProductMetrics {
  quantity: FactorMetric;
  quality: FactorMetric;
  viability: FactorMetric;
}

interface Props {
  institution: ProductMetrics;
  generated: ProductMetrics;
  repair: ProductMetrics;
  correction: ProductMetrics;
}

const TrendIcon = ({ trend }: { trend: string }) => {
  const icons = {
    up: <TrendingUp className="h-4 w-4 text-green-500" />,
    down: <TrendingDown className="h-4 w-4 text-red-500" />,
    stable: <Minus className="h-4 w-4 text-gray-400" />
  };
  return icons[trend as keyof typeof icons] || icons.stable;
};

const ProductCard = ({ title, metrics, color }: {
  title: string;
  metrics: ProductMetrics;
  color: string;
}) => (
  <div
    className="bg-white rounded-lg border border-gray-200 shadow-sm border-t-4"
    style={{ borderTopColor: color }}
  >
    <div className="px-4 py-3 border-b border-gray-100">
      <h3 className="text-sm font-semibold text-[#0A2540]">{title}</h3>
    </div>
    <div className="px-4 py-3 space-y-3">
      {(['quantity', 'quality', 'viability'] as const).map((factor) => (
        <div key={factor} className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {factor === 'quantity' ? 'Quantità' : factor === 'quality' ? 'Qualità' : 'Viability'}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{metrics[factor].value}</span>
            <TrendIcon trend={metrics[factor].trend} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export function TwelveFactorsGrid({ institution, generated, repair, correction }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#0A2540]">12 Fattori di Ottimizzazione</h2>
        <span className="text-xs text-gray-500">4 Prodotti × 3 Fattori</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProductCard
          title="1. Istituzione"
          metrics={institution}
          color="#0A2540"
        />
        <ProductCard
          title="2. Generazione"
          metrics={generated}
          color="#3B82F6"
        />
        <ProductCard
          title="3. Riparazione"
          metrics={repair}
          color="#F59E0B"
        />
        <ProductCard
          title="4. Correzione"
          metrics={correction}
          color="#10B981"
        />
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-6 text-xs text-gray-500 pt-2">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-green-500" />
          <span>Miglioramento</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown className="h-3 w-3 text-red-500" />
          <span>Peggioramento</span>
        </div>
        <div className="flex items-center gap-1">
          <Minus className="h-3 w-3 text-gray-400" />
          <span>Stabile</span>
        </div>
      </div>
    </div>
  );
}

export default TwelveFactorsGrid;
