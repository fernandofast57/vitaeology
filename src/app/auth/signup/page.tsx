'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, User, AlertCircle, Loader2, BookOpen, Shield } from 'lucide-react'
import Turnstile from '@/components/Turnstile'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parametri da URL (da pagina /libro)
  const bookCode = searchParams.get('book_code')
  const prefillEmail = searchParams.get('email')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState(prefillEmail || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileExpired, setTurnstileExpired] = useState(false)
  const [turnstileKey, setTurnstileKey] = useState(0)

  // Pre-compila email se presente nell'URL
  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail)
    }
  }, [prefillEmail])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validazioni frontend
    if (!fullName.trim()) {
      setError('Inserisci il tuo nome')
      return
    }

    if (!email.trim()) {
      setError('Inserisci la tua email')
      return
    }

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }

    if (!turnstileToken) {
      setError('Completa la verifica di sicurezza')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          turnstileToken,
          bookCode: bookCode || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Errore durante la registrazione')
        setLoading(false)
        return
      }

      // Salva dati per la pagina di verifica
      sessionStorage.setItem('signupData', JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
        bookCode: bookCode || undefined,
      }))

      // Redirect alla pagina di verifica OTP
      router.push(`/auth/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`)

    } catch {
      setError('Errore di connessione. Riprova.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <Image
            src="/logo-vitaeology.png"
            alt="Vitaeology"
            width={360}
            height={144}
            className="h-36 w-auto mx-auto"
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
          {/* Banner codice libro */}
          {bookCode && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Registrati per attivare il tuo libro
                </p>
                <p className="text-xs text-amber-600">
                  Codice: <span className="font-mono">{bookCode}</span>
                </p>
              </div>
            </div>
          )}

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

            {/* Turnstile CAPTCHA */}
            <div className="flex flex-col items-center gap-2">
              <Turnstile
                key={turnstileKey}
                onVerify={(token) => {
                  setTurnstileToken(token)
                  setTurnstileExpired(false)
                }}
                onError={() => setError('Verifica di sicurezza fallita. Ricarica la pagina.')}
                onExpire={() => {
                  setTurnstileToken(null)
                  setTurnstileExpired(true)
                  // Auto-refresh widget dopo 1 secondo
                  setTimeout(() => {
                    setTurnstileKey(prev => prev + 1)
                    setTurnstileExpired(false)
                  }, 1000)
                }}
                theme="light"
                size="normal"
              />
              {turnstileExpired && (
                <p className="text-sm text-amber-600">
                  Verifica di sicurezza scaduta. Rinnovo in corso...
                </p>
              )}
              {turnstileToken && !turnstileExpired && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Shield className="h-3 w-3" />
                  Verificato
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !turnstileToken}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Invio codice di verifica...
                </>
              ) : (
                'Continua'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Ti invieremo un codice di verifica via email.
              <br />
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

// Loading fallback
function SignupLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    </div>
  )
}

// Componente principale wrappato in Suspense
export default function SignupPage() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupForm />
    </Suspense>
  )
}
