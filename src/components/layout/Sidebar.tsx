'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardCheck, BookOpen, TrendingUp, User, CreditCard, LogOut, X, Shield, Users, BarChart3, Target, Sparkles, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Esercizi', href: '/exercises', icon: BookOpen },
  { name: 'Progressi', href: '/progress', icon: TrendingUp },
];

const assessmentNav = [
  { name: 'Leadership Autentica', href: '/assessment/lite', icon: BookOpen, color: 'text-amber-400' },
  { name: 'Oltre gli Ostacoli', href: '/assessment/risolutore', icon: Target, color: 'text-emerald-400' },
  { name: 'Microfelicità', href: '/assessment/microfelicita', icon: Sparkles, color: 'text-violet-400' },
];

const accountNav = [
  { name: 'Profilo', href: '/profile', icon: User },
  { name: 'Abbonamento', href: '/subscription', icon: CreditCard },
];

const adminNav = [
  { name: 'Behavioral', href: '/admin/behavioral', icon: BarChart3 },
  { name: 'A/B Testing', href: '/admin/ab-testing', icon: Target },
  { name: 'AI Coach', href: '/admin/ai-coach', icon: Sparkles },
  { name: 'Utenti', href: '/admin/users', icon: Users },
];

export default function Sidebar({ isOpen, onClose, userEmail, userName }: SidebarProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(pathname.startsWith('/assessment'));
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, role_id, roles(level)')
          .eq('id', user.id)
          .single();

        const roleLevel = (profile?.roles as any)?.level ?? 0;
        setIsAdmin(profile?.is_admin === true || roleLevel >= 40);
      }
    };
    checkAdmin();
  }, [supabase]);

  return (
    <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-petrol-600 text-white transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/logo-horizontal-white.svg"
            alt="Vitaeology"
            width={180}
            height={26}
            className="h-8 w-auto"
          />
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
          </Link>
        ))}

        {/* Assessment Submenu */}
        <div>
          <button
            onClick={() => setAssessmentOpen(!assessmentOpen)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg ${pathname.startsWith('/assessment') ? 'bg-gold-500/20 text-gold-400' : 'text-white/80 hover:bg-white/10'}`}
          >
            <div className="flex items-center gap-3">
              <ClipboardCheck className="w-5 h-5" />
              <span>Assessment</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${assessmentOpen ? 'rotate-180' : ''}`} />
          </button>
          {assessmentOpen && (
            <div className="mt-1 ml-4 space-y-1">
              {assessmentNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${pathname === item.href || pathname.startsWith(item.href) ? 'bg-gold-500 text-petrol-600 font-medium' : `${item.color} hover:bg-white/10`}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="pt-6">
          <p className="text-xs font-semibold text-white/40 uppercase mb-3 px-3">Account</p>
          {accountNav.map((item) => (
            <Link key={item.name} href={item.href} onClick={onClose} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${pathname === item.href ? 'bg-gold-500 text-petrol-600 font-medium' : 'text-white/80 hover:bg-white/10'}`}>
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
        {isAdmin && (
          <div className="pt-6">
            <p className="text-xs font-semibold text-white/40 uppercase mb-3 px-3 flex items-center gap-2">
              <Shield className="w-3 h-3" />
              Admin
            </p>
            {adminNav.map((item) => (
              <Link key={item.name} href={item.href} onClick={onClose} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${pathname.startsWith(item.href) ? 'bg-amber-500 text-petrol-600 font-medium' : 'text-amber-400/80 hover:bg-amber-500/20'}`}>
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}
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
