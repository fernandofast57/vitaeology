'use client';

import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface WelcomeHeroProps {
  userName: string;
  hasCompletedAssessment: boolean;
}

export default function WelcomeHero({ userName, hasCompletedAssessment }: WelcomeHeroProps) {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Buongiorno' : currentHour < 18 ? 'Buon pomeriggio' : 'Buonasera';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-petrol-600 via-petrol-600 to-petrol-500 rounded-2xl p-6 md:p-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-gold-500" />
              <span className="text-gold-500 text-sm font-medium">Vitaeology</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
              {greeting}, {userName}!
            </h1>
            
            <p className="text-white/80 text-sm md:text-base max-w-xl">
              {hasCompletedAssessment 
                ? "Ottimo lavoro! Hai completato l'assessment. Esplora i tuoi risultati."
                : "Completa l'assessment per scoprire il tuo profilo di leadership."
              }
            </p>
          </div>

          <div className="hidden md:block">
            <Link 
              href={hasCompletedAssessment ? "/results" : "/test"}
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-petrol-600 px-5 py-2.5 rounded-lg font-medium transition-colors"
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
