# ============================================
# VITAEOLOGY DASHBOARD - Setup Script
# Esegui dalla root del progetto
# ============================================

Write-Host "🚀 Vitaeology Dashboard Setup" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# 1. Backup del file dashboard esistente (se esiste come file)
if (Test-Path ".\src\components\dashboard" -PathType Leaf) {
    Write-Host "📦 Backup file dashboard esistente..." -ForegroundColor Yellow
    Move-Item ".\src\components\dashboard" ".\src\components\dashboard-backup.tsx" -Force
}

# 2. Crea le cartelle necessarie
Write-Host "📁 Creazione cartelle..." -ForegroundColor Green
New-Item -ItemType Directory -Path ".\src\components\dashboard" -Force | Out-Null
New-Item -ItemType Directory -Path ".\src\components\layout" -Force | Out-Null

# 3. Crea i file dei componenti Dashboard

# === WelcomeHero.tsx ===
Write-Host "  ✓ WelcomeHero.tsx" -ForegroundColor Gray
@'
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
    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-light rounded-2xl p-6 md:p-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-accent text-sm font-medium">Vitaeology</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
              {greeting}, {userName}! 👋
            </h1>
            
            <p className="text-white/80 text-sm md:text-base max-w-xl">
              {hasCompletedAssessment 
                ? "Ottimo lavoro! Hai completato l'assessment. Esplora i tuoi risultati e scopri le aree dove puoi crescere come leader."
                : "Sei a un passo dall'iniziare il tuo percorso verso una leadership più autentica. Completa l'assessment per scoprire il tuo profilo."
              }
            </p>
          </div>

          <div className="hidden md:block">
            {hasCompletedAssessment ? (
              <Link 
                href="/results"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-primary 
                           px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                Vedi Risultati
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link 
                href="/test"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-primary 
                           px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                Inizia Assessment
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="mt-4 md:hidden">
          {hasCompletedAssessment ? (
            <Link 
              href="/results"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-primary 
                         px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Vedi Risultati
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link 
              href="/test"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-primary 
                         px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Inizia Assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
'@ | Set-Content ".\src\components\dashboard\WelcomeHero.tsx" -Encoding UTF8

# === AssessmentCard.tsx ===
Write-Host "  ✓ AssessmentCard.tsx" -ForegroundColor Gray
@'
'use client';

import { ClipboardCheck, Play, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface AssessmentData {
  id: string;
  status: string;
  questions_answered: number;
  total_score: number | null;
  completed_at: string | null;
  created_at: string;
}

interface AssessmentCardProps {
  assessment: AssessmentData | null;
}

export default function AssessmentCard({ assessment }: AssessmentCardProps) {
  const totalQuestions = 240;
  const progress = assessment ? (assessment.questions_answered / totalQuestions) * 100 : 0;
  const isCompleted = assessment?.status === 'completed';
  const isInProgress = assessment?.status === 'in_progress' || (assessment && !isCompleted && assessment.questions_answered > 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!assessment) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-petrol-600/10 rounded-xl">
              <ClipboardCheck className="w-8 h-8 text-petrol-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-display font-bold text-neutral-900 mb-1">
                Assessment Leadership Autentica
              </h2>
              <p className="text-neutral-600 mb-4">
                Scopri i tuoi punti di forza e le aree dove puoi crescere come leader. 
                240 domande, circa 30 minuti per completarlo.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
                  <Clock className="w-4 h-4" />
                  ~30 minuti
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
                  <ClipboardCheck className="w-4 h-4" />
                  240 domande
                </span>
              </div>

              <Link
                href="/test"
                className="inline-flex items-center gap-2 bg-petrol-600 hover:bg-petrol-700 text-white 
                           px-6 py-3 rounded-xl font-medium transition-colors"
              >
                <Play className="w-5 h-5" />
                Inizia il Test
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 border-t border-neutral-200 divide-x divide-neutral-200">
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-petrol-600">24</p>
            <p className="text-xs text-neutral-500">Caratteristiche</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-petrol-600">4</p>
            <p className="text-xs text-neutral-500">Pilastri</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-petrol-600">1</p>
            <p className="text-xs text-neutral-500">Radar Chart</p>
          </div>
        </div>
      </div>
    );
  }

  if (isInProgress) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-display font-bold text-neutral-900">
                  Assessment in Corso
                </h2>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  In corso
                </span>
              </div>
              <p className="text-neutral-600 mb-4">
                Ottimo lavoro! Continua per scoprire il tuo profilo leadership completo.
              </p>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-600">Progresso</span>
                  <span className="font-medium text-neutral-900">
                    {assessment.questions_answered}/{totalQuestions} domande
                  </span>
                </div>
                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {Math.round(progress)}% completato
                </p>
              </div>

              <Link
                href="/test"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white 
                           px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Riprendi Test
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-display font-bold text-neutral-900">
                Assessment Completato! 🎉
              </h2>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                Completato
              </span>
            </div>
            <p className="text-neutral-600 mb-2">
              Hai completato l assessment il {formatDate(assessment.completed_at || assessment.created_at)}.
            </p>
            
            {assessment.total_score !== null && (
              <div className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg mb-4">
                <span className="text-emerald-700 font-medium">
                  Punteggio: {assessment.total_score}%
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/results/${assessment.id}`}
                className="inline-flex items-center gap-2 bg-petrol-600 hover:bg-petrol-700 text-white 
                           px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Vedi Risultati Completi
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/test?new=true"
                className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 
                           px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Rifai il Test
              </Link>
            </div>
          </div>
        </div>
      </div>

      {assessment.total_score !== null && (
        <div className="grid grid-cols-3 border-t border-neutral-200 divide-x divide-neutral-200 bg-neutral-50">
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{assessment.total_score}%</p>
            <p className="text-xs text-neutral-500">Score Totale</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-petrol-600">240</p>
            <p className="text-xs text-neutral-500">Domande</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-petrol-600">24</p>
            <p className="text-xs text-neutral-500">Caratteristiche</p>
          </div>
        </div>
      )}
    </div>
  );
}
'@ | Set-Content ".\src\components\dashboard\AssessmentCard.tsx" -Encoding UTF8

# === QuickStats.tsx ===
Write-Host "  ✓ QuickStats.tsx" -ForegroundColor Gray
@'
'use client';

import { ClipboardCheck, Target, BookOpen, Flame } from 'lucide-react';

interface QuickStatsProps {
  assessmentsCompleted: number;
  totalScore: number | null;
  exercisesCompleted: number;
  currentStreak: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}

function StatCard({ icon, label, value, subtext, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
        <p className="text-sm text-neutral-600">{label}</p>
        {subtext && (
          <p className="text-xs text-neutral-400 mt-1">{subtext}</p>
        )}
      </div>
    </div>
  );
}

export default function QuickStats({ 
  assessmentsCompleted, 
  totalScore, 
  exercisesCompleted, 
  currentStreak 
}: QuickStatsProps) {
  const getScoreLevel = (score: number | null) => {
    if (score === null) return { text: '-', level: '' };
    if (score >= 80) return { text: `${score}%`, level: 'Eccellente' };
    if (score >= 60) return { text: `${score}%`, level: 'Solido' };
    if (score >= 40) return { text: `${score}%`, level: 'In crescita' };
    return { text: `${score}%`, level: 'Emergente' };
  };

  const scoreInfo = getScoreLevel(totalScore);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={<ClipboardCheck className="w-5 h-5 text-blue-600" />}
        label="Test Completati"
        value={assessmentsCompleted}
        color="bg-blue-100"
      />
      <StatCard
        icon={<Target className="w-5 h-5 text-emerald-600" />}
        label="Punteggio Leadership"
        value={scoreInfo.text}
        subtext={scoreInfo.level}
        color="bg-emerald-100"
      />
      <StatCard
        icon={<BookOpen className="w-5 h-5 text-purple-600" />}
        label="Esercizi Completati"
        value={`${exercisesCompleted}/52`}
        subtext="Prossimamente"
        color="bg-purple-100"
      />
      <StatCard
        icon={<Flame className="w-5 h-5 text-orange-600" />}
        label="Streak Attuale"
        value={currentStreak > 0 ? `${currentStreak} giorni` : '-'}
        subtext={currentStreak > 0 ? 'Continua così!' : 'Inizia oggi'}
        color="bg-orange-100"
      />
    </div>
  );
}
'@ | Set-Content ".\src\components\dashboard\QuickStats.tsx" -Encoding UTF8

# === TrialBanner.tsx ===
Write-Host "  ✓ TrialBanner.tsx" -ForegroundColor Gray
@'
'use client';

import { Clock, ArrowRight, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface TrialBannerProps {
  daysRemaining: number;
}

export default function TrialBanner({ daysRemaining }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isUrgent = daysRemaining <= 3;
  const isCritical = daysRemaining <= 1;

  const bgColor = isCritical 
    ? 'bg-red-50 border-red-200' 
    : isUrgent 
      ? 'bg-amber-50 border-amber-200' 
      : 'bg-blue-50 border-blue-200';

  const textColor = isCritical 
    ? 'text-red-800' 
    : isUrgent 
      ? 'text-amber-800' 
      : 'text-blue-800';

  const iconColor = isCritical 
    ? 'text-red-500' 
    : isUrgent 
      ? 'text-amber-500' 
      : 'text-blue-500';

  const getMessage = () => {
    if (isCritical) {
      return "🚨 Ultimo giorno di prova! Attiva il tuo abbonamento per mantenere accesso ai tuoi risultati.";
    }
    if (isUrgent) {
      return `⚠️ Il tuo periodo di prova scade tra ${daysRemaining} giorni. Non perdere i tuoi progressi!`;
    }
    return `Il tuo periodo di prova scade tra ${daysRemaining} giorni. Scegli il tuo piano per continuare.`;
  };

  return (
    <div className={`relative rounded-xl border p-4 ${bgColor}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isUrgent ? (
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
          ) : (
            <Clock className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
          )}
          <p className={`text-sm font-medium ${textColor}`}>
            {getMessage()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/pricing"
            className={`
              inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg
              text-sm font-medium transition-colors
              ${isCritical 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : isUrgent
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            {isCritical ? 'Attiva Subito' : 'Scegli Piano'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {!isCritical && (
            <button
              onClick={() => setDismissed(true)}
              className={`p-1.5 rounded-lg hover:bg-black/5 transition-colors ${textColor}`}
              aria-label="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
'@ | Set-Content ".\src\components\dashboard\TrialBanner.tsx" -Encoding UTF8

# === MiniRadarPreview.tsx ===
Write-Host "  ✓ MiniRadarPreview.tsx" -ForegroundColor Gray
@'
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
  'Vision': '#3B82F6',
  'Action': '#F59E0B',
  'Relations': '#10B981',
  'Adaptation': '#8B5CF6',
  'Essere': '#3B82F6',
  'Agire': '#F59E0B',
  'Sentire': '#10B981',
  'Pensare': '#8B5CF6',
};

const PILLAR_NAMES_IT: Record<string, string> = {
  'Vision': 'Visione',
  'Action': 'Azione',
  'Relations': 'Relazioni',
  'Adaptation': 'Adattamento',
  'Essere': 'Essere',
  'Agire': 'Agire',
  'Sentire': 'Sentire',
  'Pensare': 'Pensare',
};

export default function MiniRadarPreview({ pillarScores, hasResults, assessmentId }: MiniRadarPreviewProps) {
  if (!hasResults) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 h-full">
        <h3 className="text-lg font-display font-bold text-neutral-900 mb-4">
          Il Tuo Profilo
        </h3>
        
        <div className="relative">
          <div className="h-48 bg-neutral-100 rounded-xl opacity-50" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="p-3 bg-neutral-100 rounded-full mb-3">
              <Lock className="w-6 h-6 text-neutral-400" />
            </div>
            <p className="text-sm text-neutral-600 text-center mb-3">
              Completa l assessment per vedere il tuo radar chart
            </p>
            <Link
              href="/test"
              className="text-sm font-medium text-petrol-600 hover:text-petrol-700 transition-colors"
            >
              Inizia ora →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-bold text-neutral-900">
          Il Tuo Profilo
        </h3>
        <Link
          href={`/results/${assessmentId}`}
          className="inline-flex items-center gap-1 text-sm text-petrol-600 hover:text-petrol-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Dettagli
        </Link>
      </div>

      <div className="space-y-3">
        {pillarScores.map((ps) => (
          <div key={ps.pillar}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-neutral-600">
                {PILLAR_NAMES_IT[ps.pillar] || ps.pillar}
              </span>
              <span className="text-sm font-medium text-neutral-900">
                {ps.score}%
              </span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${ps.score}%`,
                  backgroundColor: PILLAR_COLORS[ps.pillar] || '#6b7280'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
'@ | Set-Content ".\src\components\dashboard\MiniRadarPreview.tsx" -Encoding UTF8

# === RecentActivity.tsx ===
Write-Host "  ✓ RecentActivity.tsx" -ForegroundColor Gray
@'
'use client';

import { ClipboardCheck, BookOpen, Trophy, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'assessment_started' | 'assessment_completed' | 'exercise_completed' | 'milestone';
  title: string;
  description?: string;
  timestamp: Date;
}

const mockActivities: Activity[] = [];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'assessment_started':
    case 'assessment_completed':
      return <ClipboardCheck className="w-4 h-4" />;
    case 'exercise_completed':
      return <BookOpen className="w-4 h-4" />;
    case 'milestone':
      return <Trophy className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'assessment_completed':
      return 'bg-emerald-100 text-emerald-600';
    case 'assessment_started':
      return 'bg-blue-100 text-blue-600';
    case 'exercise_completed':
      return 'bg-purple-100 text-purple-600';
    case 'milestone':
      return 'bg-amber-100 text-amber-600';
    default:
      return 'bg-neutral-100 text-neutral-600';
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Oggi';
  if (diffDays === 1) return 'Ieri';
  if (diffDays < 7) return `${diffDays} giorni fa`;
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
};

export default function RecentActivity() {
  const activities = mockActivities;

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h3 className="text-lg font-display font-bold text-neutral-900 mb-4">
          Attività Recente
        </h3>
        
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-neutral-400" />
          </div>
          <p className="text-neutral-600 mb-2">Nessuna attività recente</p>
          <p className="text-sm text-neutral-400">
            Inizia il tuo assessment per vedere la tua attività qui
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-bold text-neutral-900">
          Attività Recente
        </h3>
        <Link
          href="/progress"
          className="inline-flex items-center gap-1 text-sm text-petrol-600 hover:text-petrol-700 transition-colors"
        >
          Vedi tutto
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative flex gap-4">
            {index < activities.length - 1 && (
              <div className="absolute left-5 top-10 w-px h-full bg-neutral-200" />
            )}
            <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-neutral-900">{activity.title}</p>
                  {activity.description && (
                    <p className="text-sm text-neutral-500">{activity.description}</p>
                  )}
                </div>
                <span className="text-xs text-neutral-400 whitespace-nowrap">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
'@ | Set-Content ".\src\components\dashboard\RecentActivity.tsx" -Encoding UTF8

# === index.ts (exports) ===
Write-Host "  ✓ index.ts" -ForegroundColor Gray
@'
export { default as WelcomeHero } from './WelcomeHero';
export { default as AssessmentCard } from './AssessmentCard';
export { default as TrialBanner } from './TrialBanner';
export { default as QuickStats } from './QuickStats';
export { default as MiniRadarPreview } from './MiniRadarPreview';
export { default as RecentActivity } from './RecentActivity';
'@ | Set-Content ".\src\components\dashboard\index.ts" -Encoding UTF8

# 4. Crea componenti Layout

# === Sidebar.tsx ===
Write-Host "  ✓ Sidebar.tsx" -ForegroundColor Gray
@'
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  BookOpen, 
  TrendingUp,
  User as UserIcon,
  CreditCard,
  LogOut,
  X,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Assessment', href: '/test', icon: ClipboardCheck },
  { name: 'Esercizi', href: '/exercises', icon: BookOpen, badge: 'Presto' },
  { name: 'Progressi', href: '/progress', icon: TrendingUp },
];

const accountNav = [
  { name: 'Profilo', href: '/profile', icon: UserIcon },
  { name: 'Abbonamento', href: '/subscription', icon: CreditCard },
];

export default function Sidebar({ isOpen, onClose, userEmail, userName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={`
        fixed top-0 left-0 z-50 h-full w-64 
        bg-petrol-600 text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-petrol-600" />
          </div>
          <span className="font-display text-xl font-bold">Vitaeology</span>
        </Link>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-500/20 rounded-full flex items-center justify-center">
            <span className="text-gold-500 font-bold text-lg">
              {userName?.charAt(0).toUpperCase() || userEmail?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {userName || userEmail?.split('@')[0] || 'Utente'}
            </p>
            <p className="text-xs text-white/60 truncate">{userEmail}</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-3">
          Principale
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200
                ${isActive 
                  ? 'bg-gold-500 text-petrol-600 font-medium' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-3">
            Account
          </p>
          {accountNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-gold-500 text-petrol-600 font-medium' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <Link
          href="/auth/logout"
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg
                     text-white/80 hover:bg-red-500/20 hover:text-red-300
                     transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Esci</span>
        </Link>
      </div>
    </aside>
  );
}
'@ | Set-Content ".\src\components\layout\Sidebar.tsx" -Encoding UTF8

# === DashboardHeader.tsx ===
Write-Host "  ✓ DashboardHeader.tsx" -ForegroundColor Gray
@'
'use client';

import { Menu, Bell } from 'lucide-react';

interface DashboardHeaderProps {
  userName?: string;
  userEmail?: string;
  onMenuClick: () => void;
}

export default function DashboardHeader({ userName, userEmail, onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Apri menu"
          >
            <Menu className="w-6 h-6 text-neutral-700" />
          </button>
          <h1 className="text-lg font-semibold text-neutral-900 hidden md:block">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Notifiche"
          >
            <Bell className="w-5 h-5 text-neutral-600" />
          </button>

          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-neutral-200">
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-900">
                {userName || userEmail?.split('@')[0] || 'Utente'}
              </p>
              <p className="text-xs text-neutral-500">Piano Free</p>
            </div>
            <div className="w-10 h-10 bg-petrol-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {userName?.charAt(0).toUpperCase() || userEmail?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
'@ | Set-Content ".\src\components\layout\DashboardHeader.tsx" -Encoding UTF8

# 5. Crea la pagina dashboard
Write-Host "📄 Creazione pagina dashboard..." -ForegroundColor Green

# Assicurati che la cartella esista
New-Item -ItemType Directory -Path ".\src\app\dashboard" -Force | Out-Null

@'
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import WelcomeHero from '@/components/dashboard/WelcomeHero';
import AssessmentCard from '@/components/dashboard/AssessmentCard';
import QuickStats from '@/components/dashboard/QuickStats';
import TrialBanner from '@/components/dashboard/TrialBanner';
import RecentActivity from '@/components/dashboard/RecentActivity';
import MiniRadarPreview from '@/components/dashboard/MiniRadarPreview';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

interface AssessmentData {
  id: string;
  status: string;
  questions_answered: number;
  total_score: number | null;
  completed_at: string | null;
  created_at: string;
}

interface PillarScore {
  pillar: string;
  score: number;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [pillarScores, setPillarScores] = useState<PillarScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');

        // Fetch latest assessment
        const { data: assessmentData } = await supabase
          .from('user_assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (assessmentData) {
          setAssessment(assessmentData);

          // If completed, fetch pillar scores
          if (assessmentData.status === 'completed') {
            const { data: resultsData } = await supabase
              .from('assessment_results')
              .select('pillar_scores')
              .eq('assessment_id', assessmentData.id)
              .single();

            if (resultsData?.pillar_scores) {
              setPillarScores(resultsData.pillar_scores);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-petrol-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-600 font-medium">Caricamento...</p>
        </div>
      </div>
    );
  }

  const trialDaysRemaining = 14; // Placeholder
  const isTrialActive = true; // Placeholder

  return (
    <div className="min-h-screen bg-neutral-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        userEmail={userEmail}
        userName={userName}
      />

      <div className="lg:pl-64">
        <DashboardHeader 
          userName={userName}
          userEmail={userEmail}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6 max-w-7xl mx-auto">
            {isTrialActive && (
              <TrialBanner daysRemaining={trialDaysRemaining} />
            )}

            <WelcomeHero 
              userName={userName || 'Leader'}
              hasCompletedAssessment={assessment?.status === 'completed'}
            />

            <QuickStats 
              assessmentsCompleted={assessment?.status === 'completed' ? 1 : 0}
              totalScore={assessment?.total_score || null}
              exercisesCompleted={0}
              currentStreak={0}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AssessmentCard assessment={assessment} />
              </div>
              <div className="lg:col-span-1">
                <MiniRadarPreview 
                  pillarScores={pillarScores}
                  hasResults={assessment?.status === 'completed'}
                  assessmentId={assessment?.id}
                />
              </div>
            </div>

            <RecentActivity />
          </div>
        </main>
      </div>
    </div>
  );
}
'@ | Set-Content ".\src\app\dashboard\page.tsx" -Encoding UTF8

Write-Host ""
Write-Host "✅ Setup completato!" -ForegroundColor Green
Write-Host ""
Write-Host "Esegui: npm run dev" -ForegroundColor Cyan
Write-Host "Poi vai a: http://localhost:3000/dashboard" -ForegroundColor Cyan
