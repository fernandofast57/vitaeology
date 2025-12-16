'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardCheck, BookOpen, TrendingUp, User, CreditCard, LogOut, X, Sparkles } from 'lucide-react';

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
  { name: 'Profilo', href: '/profile', icon: User },
  { name: 'Abbonamento', href: '/subscription', icon: CreditCard },
];

export default function Sidebar({ isOpen, onClose, userEmail, userName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-petrol-600 text-white transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-petrol-600" />
          </div>
          <span className="text-xl font-bold">Vitaeology</span>
        </Link>
        <button onClick={onClose} className="lg:hidden p-2 hover:bg-white/10 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-500/20 rounded-full flex items-center justify-center">
            <span className="text-gold-500 font-bold">{userName?.charAt(0) || userEmail?.charAt(0) || 'U'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName || userEmail?.split('@')[0] || 'Utente'}</p>
            <p className="text-xs text-white/60 truncate">{userEmail}</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        <p className="text-xs font-semibold text-white/40 uppercase mb-3 px-3">Principale</p>
        {navigation.map((item) => (
          <Link key={item.name} href={item.href} onClick={onClose} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${pathname === item.href ? 'bg-gold-500 text-petrol-600 font-medium' : 'text-white/80 hover:bg-white/10'}`}>
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
            {item.badge && <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">{item.badge}</span>}
          </Link>
        ))}
        <div className="pt-6">
          <p className="text-xs font-semibold text-white/40 uppercase mb-3 px-3">Account</p>
          {accountNav.map((item) => (
            <Link key={item.name} href={item.href} onClick={onClose} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${pathname === item.href ? 'bg-gold-500 text-petrol-600 font-medium' : 'text-white/80 hover:bg-white/10'}`}>
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <Link href="/auth/signout" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-red-500/20 hover:text-red-300">
          <LogOut className="w-5 h-5" />
          <span>Esci</span>
        </Link>
      </div>
    </aside>
  );
}
