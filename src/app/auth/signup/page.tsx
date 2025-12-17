'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Questa email è già registrata. Prova ad accedere.')
      } else {
        setError('Errore durante la registrazione. Riprova.')
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Controlla la tua email
            </h2>
            <p className="text-gray-600 mb-6">
              Ti abbiamo inviato un link di conferma a <strong>{email}</strong>. 
              Clicca sul link per attivare il tuo account.
            </p>
            <p className="text-sm text-gray-500">
              Non hai ricevuto l&apos;email? Controlla la cartella spam o{' '}
              <button 
                onClick={() => setSuccess(false)} 
                className="text-petrol-600 hover:text-petrol-700"
              >
                riprova
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <Image
            src="/logo-vitaeology.png"
            alt="Vitaeology"
            width={200}
            height={80}
            className="h-20 w-auto mx-auto"
            priority
          />
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Crea il tuo account gratuito
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Hai già un account?{' '}
          <Link href="/auth/login" className="text-petrol-600 hover:text-petrol-700 font-medium">
            Accedi
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="label">
                Nome completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input pl-10"
                  placeholder="Mario Rossi"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email aziendale
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="mario@azienda.it"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="Minimo 6 caratteri"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Registrazione in corso...
                </>
              ) : (
                'Crea Account Gratuito'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Registrandoti accetti i nostri{' '}
              <Link href="/terms" className="text-petrol-600 hover:underline">
                Termini di Servizio
              </Link>{' '}
              e la{' '}
              <Link href="/privacy" className="text-petrol-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
