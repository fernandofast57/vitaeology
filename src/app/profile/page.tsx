'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getUserPathways, type UserPathwayWithDetails, PATHWAY_COLORS, PATHWAY_NAMES, type PathwaySlug } from '@/lib/pathways';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { User, Mail, Shield, Save, Compass, Crown, Target, Heart, ChevronRight } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';

// Mappa pathway slug → dashboard path
const PATHWAY_TO_DASHBOARD: Record<string, string> = {
  'leadership': 'leadership',
  'risolutore': 'ostacoli',
  'microfelicita': 'microfelicita',
};

// Icone per percorso
const PATHWAY_ICONS: Record<string, React.ElementType> = {
  'leadership': Crown,
  'risolutore': Target,
  'microfelicita': Heart,
};

export default function ProfilePage() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [userPathways, setUserPathways] = useState<UserPathwayWithDetails[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    role: ''
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserId(user.id);
        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
        setCreatedAt(user.created_at || '');

        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, company, role')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFormData({
            fullName: profile.full_name || user.user_metadata?.full_name || '',
            company: profile.company || '',
            role: profile.role || ''
          });
        }

        // Fetch user pathways
        const pathways = await getUserPathways(supabase, user.id);
        setUserPathways(pathways);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          company: formData.company,
          role: formData.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Update auth metadata
      await supabase.auth.updateUser({
        data: { full_name: formData.fullName }
      });

      setUserName(formData.fullName);
      setMessage('Profilo aggiornato con successo!');
    } catch (error) {
      console.error('Error:', error);
      setMessage('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-petrol-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userEmail={userEmail} userName={userName} />
      <div className="lg:pl-64">
        <DashboardHeader userName={userName} userEmail={userEmail} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Breadcrumb items={[{ label: 'Profilo' }]} />
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Il tuo Profilo</h1>
              <p className="text-neutral-600 mt-1">Gestisci le tue informazioni personali</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              {/* Avatar Section */}
              <div className="bg-gradient-to-r from-petrol-500 to-petrol-600 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {formData.fullName?.charAt(0) || userEmail?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="text-white">
                    <h2 className="text-xl font-semibold">{formData.fullName || 'Utente'}</h2>
                    <p className="text-white/80">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    <User className="w-4 h-4 inline mr-2" />
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent"
                    placeholder="Il tuo nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-500"
                  />
                  <p className="text-xs text-neutral-500 mt-1">L&apos;email non può essere modificata</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Azienda
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent"
                    placeholder="Nome della tua azienda"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Ruolo
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent"
                    placeholder="Il tuo ruolo in azienda"
                  />
                </div>

                {message && (
                  <div className={`p-3 rounded-lg text-sm ${
                    message.includes('successo') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {message}
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-petrol-600 text-white py-2.5 rounded-lg font-medium hover:bg-petrol-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salva modifiche
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-petrol-600" />
                Informazioni account
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">ID Utente</span>
                  <span className="text-neutral-900 font-mono text-xs">{userId.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Membro dal</span>
                  <span className="text-neutral-900">{formatDate(createdAt)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-neutral-500">Stato account</span>
                  <span className="text-green-600 font-medium">Attivo</span>
                </div>
              </div>
            </div>

            {/* I Tuoi Percorsi */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Compass className="w-5 h-5 text-petrol-600" />
                I Tuoi Percorsi
              </h3>

              {userPathways.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-neutral-500 mb-3">Non hai ancora attivato nessun percorso.</p>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-petrol-600 hover:text-petrol-700 font-medium"
                  >
                    Esplora i percorsi disponibili
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {userPathways.map((pathway) => {
                    const slug = pathway.pathway.slug;
                    const Icon = PATHWAY_ICONS[slug] || Compass;
                    const color = PATHWAY_COLORS[slug as PathwaySlug] || '#6B7280';
                    const name = PATHWAY_NAMES[slug as PathwaySlug] || pathway.pathway.name;
                    const dashboardPath = PATHWAY_TO_DASHBOARD[slug] || 'leadership';
                    const progress = pathway.progress_percentage || 0;

                    return (
                      <Link
                        key={pathway.id}
                        href={`/dashboard/${dashboardPath}`}
                        className="flex items-center gap-4 p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all group"
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <Icon className="w-6 h-6" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900">{name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${progress}%`, backgroundColor: color }}
                              />
                            </div>
                            <span className="text-xs text-neutral-500 font-medium">{progress}%</span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-1">
                            Attivato il {formatDate(pathway.created_at)}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                      </Link>
                    );
                  })}

                  {/* Riepilogo percorsi */}
                  {userPathways.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Percorsi attivi</span>
                        <span className="font-medium text-neutral-900">{userPathways.length}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
