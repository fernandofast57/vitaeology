'use client';

/**
 * Breadcrumb Component
 *
 * Componente riutilizzabile per la navigazione breadcrumb.
 * Supporta percorsi statici e dinamici con icone personalizzabili.
 */

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { ReactNode } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  homeLabel?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

export default function Breadcrumb({
  items,
  homeHref = '/dashboard',
  homeLabel = 'Dashboard',
  className = '',
  variant = 'light'
}: BreadcrumbProps) {
  const textColor = variant === 'dark'
    ? 'text-white/60 hover:text-white'
    : 'text-gray-500 hover:text-gray-700';

  const activeColor = variant === 'dark'
    ? 'text-white'
    : 'text-gray-900';

  const separatorColor = variant === 'dark'
    ? 'text-white/40'
    : 'text-gray-400';

  const allItems: BreadcrumbItem[] = [
    { label: homeLabel, href: homeHref, icon: <Home className="w-4 h-4" /> },
    ...items
  ];

  return (
    <nav className={`flex items-center ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center">
              {!isFirst && (
                <ChevronRight className={`w-4 h-4 mx-1 flex-shrink-0 ${separatorColor}`} />
              )}

              {isLast ? (
                <span className={`text-sm font-medium ${activeColor} flex items-center gap-1.5`}>
                  {item.icon}
                  <span className="truncate max-w-[200px]">{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className={`text-sm ${textColor} transition-colors flex items-center gap-1.5`}
                >
                  {item.icon}
                  <span className="truncate max-w-[150px]">{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Configurazione percorsi predefiniti per l'applicazione
export const BREADCRUMB_CONFIG: Record<string, BreadcrumbItem[]> = {
  // Dashboard area
  '/dashboard': [],
  '/test': [{ label: 'Assessment' }],
  '/results': [{ label: 'Risultati' }],
  '/exercises': [{ label: 'Esercizi' }],
  '/profile': [{ label: 'Profilo' }],
  '/progress': [{ label: 'Progressi' }],
  '/subscription': [{ label: 'Abbonamento' }],

  // Admin area
  '/admin/ai-coach': [{ label: 'Admin', href: '/admin/ai-coach' }, { label: 'AI Coach' }],
  '/admin/analytics': [{ label: 'Admin', href: '/admin/ai-coach' }, { label: 'Analytics' }],
  '/admin/quality-audit': [{ label: 'Admin', href: '/admin/ai-coach' }, { label: 'Quality Audit' }],
  '/admin/feedback-patterns': [{ label: 'Admin', href: '/admin/ai-coach' }, { label: 'Pattern Feedback' }],
  '/admin/corrections': [{ label: 'Admin', href: '/admin/ai-coach' }, { label: 'Ottimizzazione' }],
  '/admin/performance': [{ label: 'Admin', href: '/admin/ai-coach' }, { label: 'Performance' }],
  '/admin/api-costs': [{ label: 'Admin', href: '/admin/ai-coach' }, { label: 'Costi API' }],
  '/admin/users': [{ label: 'Admin', href: '/admin/ai-coach' }, { label: 'Utenti' }],
};

// Helper per ottenere breadcrumb da pathname
export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  // Check exact match first
  if (BREADCRUMB_CONFIG[pathname]) {
    return BREADCRUMB_CONFIG[pathname];
  }

  // Check dynamic routes
  if (pathname.startsWith('/exercises/')) {
    return [
      { label: 'Esercizi', href: '/exercises' },
      { label: 'Dettaglio Esercizio' }
    ];
  }

  if (pathname.startsWith('/admin/users/')) {
    return [
      { label: 'Admin', href: '/admin/ai-coach' },
      { label: 'Utenti', href: '/admin/users' },
      { label: 'Dettaglio Utente' }
    ];
  }

  return [];
}
