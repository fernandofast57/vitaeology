'use client';

import { Menu, Bell, FlaskConical } from 'lucide-react';

interface DashboardHeaderProps {
  userName?: string;
  userEmail?: string;
  onMenuClick: () => void;
  // Flag per mostrare badge Founding Tester (collegato a profiles.is_founding_tester)
  isBetaTester?: boolean;
}

export default function DashboardHeader({ userName, userEmail, onMenuClick, isBetaTester = false }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 hover:bg-neutral-100 rounded-lg" aria-label="Apri menu">
            <Menu className="w-6 h-6 text-neutral-700" />
          </button>
          <h1 className="text-lg font-semibold text-neutral-900 hidden md:block">Dashboard</h1>

          {/* Founding Tester Badge */}
          {isBetaTester && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium cursor-help"
              title="Grazie per essere un Founding Tester di Vitaeology!"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Founding Tester</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Founding Tester Badge Mobile */}
          {isBetaTester && (
            <div
              className="sm:hidden flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 rounded-full cursor-help"
              title="Founding Tester - Grazie per il tuo supporto!"
            >
              <FlaskConical className="w-4 h-4" />
            </div>
          )}

          <button className="relative p-2 hover:bg-neutral-100 rounded-lg" aria-label="Notifiche">
            <Bell className="w-5 h-5 text-neutral-600" />
          </button>
          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-neutral-200">
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-900">{userName || userEmail?.split('@')[0] || 'Utente'}</p>
              <p className="text-xs text-neutral-500">Piano Free</p>
            </div>
            <div className="w-10 h-10 bg-petrol-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{userName?.charAt(0) || userEmail?.charAt(0) || 'U'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
