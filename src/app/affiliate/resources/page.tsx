// ============================================================================
// PAGE: /affiliate/resources
// Descrizione: Materiali promozionali per affiliati
// Auth: Richiede autenticazione + status affiliato
// ============================================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  SWIPE_COPIES,
  EMAIL_TEMPLATES,
  BANNERS,
  UTM_TEMPLATES,
  buildAffiliateLink,
  getChallengeDisplayName,
  getChallengeColor,
  type SwipeCopy,
  type EmailTemplate,
  type UtmTemplate,
} from '@/lib/affiliate/resources-data';

type TabType = 'swipe' | 'email' | 'banner' | 'links';
type ChallengeType = 'leadership' | 'ostacoli' | 'microfelicita';

export default function AffiliateResourcesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('swipe');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Swipe copy filters
  const [swipeChallenge, setSwipeChallenge] = useState<ChallengeType>('leadership');

  // Link generator state
  const [linkChallenge, setLinkChallenge] = useState<ChallengeType>('leadership');
  const [selectedUtm, setSelectedUtm] = useState<UtmTemplate | null>(UTM_TEMPLATES[0]);

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login?redirect=/affiliate/resources');
        return;
      }

      const res = await fetch('/api/affiliate/stats');
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/affiliate');
          return;
        }
        throw new Error('Errore caricamento dati');
      }

      const data = await res.json();
      setRefCode(data.affiliate.ref_code);

    } catch (err) {
      console.error('Errore:', err);
      router.push('/affiliate');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  }

  function getGeneratedLink(): string {
    if (!refCode) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vitaeology.com';
    return buildAffiliateLink(baseUrl, refCode, linkChallenge, selectedUtm || undefined);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol-600"></div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'swipe', label: 'Testi Pronti', icon: '📝' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'banner', label: 'Banner', icon: '🖼️' },
    { id: 'links', label: 'Link Generator', icon: '🔗' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-display font-bold text-petrol-600">
                Materiali Promozionali
              </h1>
              <p className="text-gray-600 text-sm">
                Testi, email e banner pronti da usare
              </p>
            </div>
            <Link
              href="/affiliate/dashboard"
              className="text-petrol-600 hover:text-petrol-700 text-sm font-medium"
            >
              &larr; Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-petrol-600 text-petrol-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* SWIPE COPY TAB */}
            {activeTab === 'swipe' && (
              <div>
                {/* Challenge Filter */}
                <div className="flex gap-2 mb-6">
                  {(['leadership', 'ostacoli', 'microfelicita'] as ChallengeType[]).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setSwipeChallenge(ch)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        swipeChallenge === ch
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={swipeChallenge === ch ? { backgroundColor: getChallengeColor(ch) } : {}}
                    >
                      {getChallengeDisplayName(ch)}
                    </button>
                  ))}
                </div>

                {/* Swipe Copy Cards */}
                <div className="space-y-4">
                  {SWIPE_COPIES[swipeChallenge].map((copy: SwipeCopy) => (
                    <div key={copy.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                        <div>
                          <span className={`text-xs px-2 py-1 rounded-full mr-2 ${
                            copy.tipo === 'emotivo' ? 'bg-pink-100 text-pink-700' :
                            copy.tipo === 'pratico' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {copy.tipo.charAt(0).toUpperCase() + copy.tipo.slice(1)}
                          </span>
                          <span className="font-medium text-gray-800">{copy.titolo}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {copy.piattaforma === 'entrambi' ? 'Social + Email' :
                           copy.piattaforma === 'social' ? 'Social' : 'Email'}
                        </span>
                      </div>
                      <div className="p-4">
                        <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm mb-4 bg-gray-50 p-4 rounded-lg">
                          {copy.testo}
                        </pre>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-petrol-600 font-medium">{copy.cta}</span>
                          <button
                            onClick={() => copyToClipboard(copy.testo + '\n\n' + copy.cta, copy.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                              copySuccess === copy.id
                                ? 'bg-green-100 text-green-700'
                                : 'bg-petrol-600 text-white hover:bg-petrol-700'
                            }`}
                          >
                            {copySuccess === copy.id ? 'Copiato!' : 'Copia Testo'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Ricorda di aggiungere il tuo link affiliato alla fine del testo!
                </p>
              </div>
            )}

            {/* EMAIL TEMPLATES TAB */}
            {activeTab === 'email' && (
              <div className="space-y-4">
                {EMAIL_TEMPLATES.map((template: EmailTemplate) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3">
                      <h3 className="font-medium text-gray-800">{template.titolo}</h3>
                      <p className="text-sm text-gray-500">{template.descrizione}</p>
                    </div>
                    <div className="p-4">
                      <div className="mb-3">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Oggetto:</span>
                        <p className="font-medium text-gray-800">{template.oggetto}</p>
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm bg-gray-50 p-4 rounded-lg mb-4 max-h-64 overflow-y-auto">
                        {template.corpo}
                      </pre>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(template.oggetto, template.id + '-obj')}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            copySuccess === template.id + '-obj'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {copySuccess === template.id + '-obj' ? 'Copiato!' : 'Copia Oggetto'}
                        </button>
                        <button
                          onClick={() => copyToClipboard(template.corpo, template.id + '-body')}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            copySuccess === template.id + '-body'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-petrol-600 text-white hover:bg-petrol-700'
                          }`}
                        >
                          {copySuccess === template.id + '-body' ? 'Copiato!' : 'Copia Corpo'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Personalizza sempre:</strong> Sostituisci [NOME], [IL TUO LINK] e [LA TUA FIRMA]
                    con i dati reali prima di inviare.
                  </p>
                </div>
              </div>
            )}

            {/* BANNER TAB */}
            {activeTab === 'banner' && (
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Coming Soon:</strong> I banner grafici sono in fase di creazione.
                    Nel frattempo, puoi usare i testi pronti per creare i tuoi banner su Canva.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {BANNERS.map((banner) => (
                    <div key={banner.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">{banner.dimensione}</span>
                      </div>
                      <h3 className="font-medium text-gray-800 text-sm">{banner.nome}</h3>
                      <p className="text-xs text-gray-500 mt-1">{banner.piattaforma}</p>
                      <button
                        disabled={!banner.downloadUrl}
                        className={`mt-3 w-full px-3 py-2 rounded-lg text-sm font-medium ${
                          banner.downloadUrl
                            ? 'bg-petrol-600 text-white hover:bg-petrol-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {banner.downloadUrl ? 'Scarica' : 'Prossimamente'}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Crea i tuoi banner su Canva</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Usa queste dimensioni per creare banner ottimizzati:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Facebook/LinkedIn:</strong> 1200x628 px</li>
                    <li>• <strong>Instagram Feed:</strong> 1080x1080 px</li>
                    <li>• <strong>Instagram Stories:</strong> 1080x1920 px</li>
                  </ul>
                </div>
              </div>
            )}

            {/* LINK GENERATOR TAB */}
            {activeTab === 'links' && refCode && (
              <div>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Challenge Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Challenge
                    </label>
                    <div className="flex flex-col gap-2">
                      {(['leadership', 'ostacoli', 'microfelicita'] as ChallengeType[]).map((ch) => (
                        <button
                          key={ch}
                          onClick={() => setLinkChallenge(ch)}
                          className={`px-4 py-3 rounded-lg text-sm font-medium text-left transition border-2 ${
                            linkChallenge === ch
                              ? 'border-petrol-600 bg-petrol-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span
                            className="inline-block w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: getChallengeColor(ch) }}
                          ></span>
                          {getChallengeDisplayName(ch)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* UTM Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dove lo condividi?
                    </label>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                      {UTM_TEMPLATES.map((utm: UtmTemplate) => (
                        <button
                          key={utm.id}
                          onClick={() => setSelectedUtm(utm)}
                          className={`px-4 py-3 rounded-lg text-sm text-left transition border-2 ${
                            selectedUtm?.id === utm.id
                              ? 'border-petrol-600 bg-petrol-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="font-medium">{utm.nome}</span>
                          <span className="text-gray-500 text-xs block">{utm.descrizione}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generated Link */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Il tuo link personalizzato
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getGeneratedLink()}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm bg-white"
                    />
                    <button
                      onClick={() => copyToClipboard(getGeneratedLink(), 'generated-link')}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                        copySuccess === 'generated-link'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-petrol-600 text-white hover:bg-petrol-700'
                      }`}
                    >
                      {copySuccess === 'generated-link' ? 'Copiato!' : 'Copia'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Questo link include il tuo codice affiliato ({refCode}) e i parametri UTM per tracciare la provenienza.
                  </p>
                </div>

                {/* Quick Copy Links */}
                <div className="mt-6">
                  <h3 className="font-medium text-gray-800 mb-3">Link rapidi (senza UTM)</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {(['leadership', 'ostacoli', 'microfelicita'] as ChallengeType[]).map((ch) => {
                      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vitaeology.com';
                      const simpleLink = `${baseUrl}/challenge/${ch}?ref=${refCode}`;
                      return (
                        <div key={ch} className="border border-gray-200 rounded-lg p-3">
                          <p className="text-sm font-medium mb-2" style={{ color: getChallengeColor(ch) }}>
                            {getChallengeDisplayName(ch)}
                          </p>
                          <button
                            onClick={() => copyToClipboard(simpleLink, `quick-${ch}`)}
                            className={`w-full px-3 py-2 rounded text-sm transition ${
                              copySuccess === `quick-${ch}`
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {copySuccess === `quick-${ch}` ? 'Copiato!' : 'Copia Link'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips Box */}
        <div className="bg-gradient-to-r from-petrol-50 to-petrol-100 rounded-xl p-6 border border-petrol-200">
          <h3 className="font-semibold text-petrol-800 mb-3">Consigli per la promozione</h3>
          <ul className="text-sm text-petrol-700 space-y-2">
            <li>• <strong>Personalizza i testi:</strong> Aggiungi la tua esperienza personale per renderli più autentici</li>
            <li>• <strong>Usa gli UTM:</strong> Ti aiutano a capire da dove arrivano le conversioni</li>
            <li>• <strong>Non spammare:</strong> Condividi con persone che potrebbero davvero beneficiarne</li>
            <li>• <strong>Racconta la tua storia:</strong> Le testimonianze personali convertono meglio dei testi generici</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
