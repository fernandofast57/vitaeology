import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Download, Share2, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'I Tuoi Risultati',
}

export default async function ResultsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/results')
  }

  // TODO: Fetch user's assessment results
  const hasResults = false

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className="flex items-center text-gray-600 hover:text-petrol-600"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Torna alla Dashboard
          </Link>
          {hasResults && (
            <div className="flex items-center gap-2">
              <button className="btn-outline text-sm py-2">
                <Share2 className="h-4 w-4 mr-2" />
                Condividi
              </button>
              <button className="btn-primary text-sm py-2">
                <Download className="h-4 w-4 mr-2" />
                Scarica PDF
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {hasResults ? (
          <>
            {/* Results content will go here */}
            <div className="text-center">
              <h1 className="text-3xl font-display font-bold text-petrol-600">
                I Tuoi Risultati
              </h1>
            </div>
          </>
        ) : (
          /* No Results State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-display font-bold text-petrol-600 mb-4">
              Nessun risultato disponibile
            </h1>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Per visualizzare i tuoi risultati e il radar chart personalizzato, 
              devi prima completare il test diagnostico con 240 domande.
            </p>
            <Link href="/test" className="btn-primary">
              Inizia il Test Diagnostico
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
