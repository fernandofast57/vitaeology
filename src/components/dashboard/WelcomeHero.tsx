'use client';

import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface WelcomeHeroProps {
  userName: string;
  hasCompletedAssessment: boolean;
  customTitle?: string;
}

export default function WelcomeHero({ userName, hasCompletedAssessment, customTitle }: WelcomeHeroProps) {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Buongiorno' : currentHour < 18 ? 'Buon pomeriggio' : 'Buonasera';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-petrol-600 via-petrol-600 to-petrol-500 rounded-2xl p-6 md:p-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-gold-500 flex-shrink-0" />
              <span className="text-gold-500 text-xs md:text-sm font-medium">Vitaeology</span>
            </div>

            <h1 className="text-xl md:text-3xl font-display font-bold text-white mb-2 truncate">
              {greeting}, {userName}!
            </h1>

            <p className="text-white/80 text-sm md:text-base line-clamp-2 md:line-clamp-none">
              {hasCompletedAssessment
                ? "Ottimo lavoro! Hai completato l'assessment. Esplora i tuoi risultati."
                : "Completa l'assessment per scoprire il tuo profilo di leadership."
              }
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link
              href={hasCompletedAssessment ? "/results" : "/test"}
              className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-petrol-600 px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-medium transition-colors text-sm md:text-base w-full md:w-auto"
            >
              {hasCompletedAssessment ? "Vedi Risultati" : "Inizia Assessment"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
