'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardCheck,
  BookOpen,
  TrendingUp,
  User,
  CreditCard,
  LogOut,
  X,
  Shield,
  Users,
  BarChart3,
  Target,
  Sparkles,
  ChevronDown,
  Mail,
  Filter,
  Crown,
  Heart,
  Compass,
  Zap
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getUserPathways, type UserPathwayWithDetails, PATHWAY_COLORS, PATHWAY_NAMES } from '@/lib/pathways';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

// Mappa pathway slug → dashboard path
const PATHWAY_TO_DASHBOARD: Record<string, string> = {
  'leadership': 'leadership',
  'risolutore': 'ostacoli',
  'microfelicita': 'microfelicita',
};

// Mappa pathway slug → assessment path
const PATHWAY_TO_ASSESSMENT: Record<string, string> = {
  'leadership': '/assessment/leadership',
  'risolutore': '/assessment/risolutore',
  'microfelicita': '/assessment/microfelicita',
};

// Icone per percorso
const PATHWAY_ICONS: Record<string, any> = {
  'leadership': Crown,
  'risolutore': Target,
  'microfelicita': Heart,
};

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Challenge', href: '/dashboard/challenges', icon: Zap },
  { name: 'Esercizi', href: '/exercises', icon: BookOpen },
  { name: 'Progressi', href: '/progress', icon: TrendingUp },
];

const accountNav = [
  { name: 'Profilo', href: '/profile', icon: User },
  { name: 'Abbonamento', href: '/subscription', icon: CreditCard },
];

const adminNav = [
  { name: 'Challenge Email', href: '/admin/challenges', icon: Mail },
  { name: 'Funnel Analysis', href: '/admin/funnel', icon: Filter },
  { name: 'Behavioral', href: '/admin/behavioral', icon: BarChart3 },
  { name: 'A/B Testing', href: '/admin/ab-testing', icon: Target },
  { name: 'AI Coach', href: '/admin/ai-coach', icon: Sparkles },
  { name: 'Utenti', href: '/admin/users', icon: Users },
];

export default function Sidebar({ isOpen, onClose, userEmail, userName }: SidebarProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [pathwaysOpen, setPathwaysOpen] = useState(true);
  const [assessmentOpen, setAssessmentOpen] = useState(pathname.startsWith('/assessment'));
  const [userPathways, setUserPathways] = useState<UserPathwayWithDetails[]>([]);
  const [loadingPathways, setLoadingPathways] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check admin status
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, role_id, roles(level)')
          .eq('id', user.id)
          .single();

        const roleLevel = (profile?.roles as any)?.level ?? 0;
        setIsAdmin(profile?.is_admin === true || roleLevel >= 40);

        // Fetch user pathways
        const pathways = await getUserPathways(supabase, user.id);
        setUserPathways(pathways);
        setLoadingPathways(false);
      }
    };
    fetchData();
  }, [supabase]);

  const hasMultiplePaths = userPathways.length > 1;

  // Determina assessment disponibili basati sui percorsi
  const availableAssessments = userPathways.length > 0
    ? userPathways.map(p => ({
        name: PATHWAY_NAMES[p.pathway.slug as keyof typeof PATHWAY_NAMES] || p.pathway.name,
        href: PATHWAY_TO_ASSESSMENT[p.pathway.slug] || '/assessment/leadership',
        icon: PATHWAY_ICONS[p.pathway.slug] || ClipboardCheck,
        color: PATHWAY_COLORS[p.pathway.slug as keyof typeof PATHWAY_COLORS] || '#D4AF37',
        slug: p.pathway.slug,
      }))
    : [
        // Default: solo leadership se nessun percorso
        { name: 'Leadership Autentica', href: '/assessment/leadership', icon: Crown, color: '#D4AF37', slug: 'leadership' },
      ];

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
        {/* Badge percorsi */}
        {hasMultiplePaths && (
          <div className="mt-3 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs text-gold-400 font-medium">
              {userPathways.length} percorsi attivi
            </span>
          </div>
        )}
      </div>

      <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        <p className="text-xs font-semibold text-white/40 uppercase mb-3 px-3">Principale</p>
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
              pathname === item.href || (item.href === '/dashboard' && pathname.startsWith('/dashboard'))
                ? 'bg-gold-500 text-petrol-600 font-medium'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        ))}

        {/* Sezione Percorsi (solo se multipli) */}
        {hasMultiplePaths && (
          <div className="pt-4">
            <button
              onClick={() => setPathwaysOpen(!pathwaysOpen)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <Compass className="w-5 h-5" />
                <span>I Tuoi Percorsi</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${pathwaysOpen ? 'rotate-180' : ''}`} />
            </button>
            {pathwaysOpen && (
              <div className="mt-1 ml-2 space-y-1">
                {userPathways.map((pathway) => {
                  const slug = pathway.pathway.slug;
                  const dashboardPath = PATHWAY_TO_DASHBOARD[slug];
                  const Icon = PATHWAY_ICONS[slug] || BookOpen;
                  const color = PATHWAY_COLORS[slug as keyof typeof PATHWAY_COLORS] || '#D4AF37';
                  const isActive = pathname === `/dashboard/${dashboardPath}`;
                  const progress = pathway.progress_percentage || 0;

                  return (
                    <Link
                      key={pathway.id}
                      href={`/dashboard/${dashboardPath}`}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-white/20 font-medium'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${color}30` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate" style={{ color: isActive ? color : 'inherit' }}>
                          {slug === 'leadership' ? 'Leadership' :
                           slug === 'risolutore' ? 'Ostacoli' : 'Microfelicità'}
                        </p>
                        {/* Mini progress bar */}
                        <div className="mt-1 w-full bg-white/10 rounded-full h-1">
                          <div
                            className="h-1 rounded-full transition-all"
                            style={{ width: `${progress}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-white/50">{progress}%</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Assessment Submenu */}
        <div className="pt-2">
          <button
            onClick={() => setAssessmentOpen(!assessmentOpen)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg ${
              pathname.startsWith('/assessment')
                ? 'bg-gold-500/20 text-gold-400'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <ClipboardCheck className="w-5 h-5" />
              <span>Assessment</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${assessmentOpen ? 'rotate-180' : ''}`} />
          </button>
          {assessmentOpen && (
            <div className="mt-1 ml-4 space-y-1">
              {loadingPathways ? (
                <div className="px-3 py-2 text-xs text-white/50">Caricamento...</div>
              ) : (
                availableAssessments.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.slug}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                        isActive
                          ? 'bg-gold-500 text-petrol-600 font-medium'
                          : 'hover:bg-white/10'
                      }`}
                      style={!isActive ? { color: item.color } : undefined}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="pt-6">
          <p className="text-xs font-semibold text-white/40 uppercase mb-3 px-3">Account</p>
          {accountNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                pathname === item.href
                  ? 'bg-gold-500 text-petrol-600 font-medium'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
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
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                  pathname.startsWith(item.href)
                    ? 'bg-amber-500 text-petrol-600 font-medium'
                    : 'text-amber-400/80 hover:bg-amber-500/20'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-petrol-600">
        <Link
          href="/auth/signout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-red-500/20 hover:text-red-300"
        >
          <LogOut className="w-5 h-5" />
          <span>Esci</span>
        </Link>
      </div>
    </aside>
  );
}
