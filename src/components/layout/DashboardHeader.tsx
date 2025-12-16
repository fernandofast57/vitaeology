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
          <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 hover:bg-neutral-100 rounded-lg" aria-label="Apri menu">
            <Menu className="w-6 h-6 text-neutral-700" />
          </button>
          <h1 className="text-lg font-semibold text-neutral-900 hidden md:block">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
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
