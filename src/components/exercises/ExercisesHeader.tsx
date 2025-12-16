// src/components/exercises/ExercisesHeader.tsx
'use client';

interface ExerciseStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
}

interface ExercisesHeaderProps {
  stats: ExerciseStats;
}

export default function ExercisesHeader({ stats }: ExercisesHeaderProps) {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          I Tuoi 52 Esercizi Settimanali
        </h1>
        <p className="text-gray-600">
          Sviluppa la tua leadership autentica con esercizi pratici.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Completati</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">In corso</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Da iniziare</p>
          <p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Progresso</p>
          <p className="text-2xl font-bold text-blue-600">{stats.completionRate}%</p>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso annuale</span>
          <span className="text-sm text-gray-500">{stats.completed} di {stats.total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}