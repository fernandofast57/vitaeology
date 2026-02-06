'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft, AlertCircle, Loader2, Shield } from 'lucide-react'
import Turnstile from '@/components/Turnstile'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileExpired, setTurnstileExpired] = useState(false)
  const [turnstileKey, setTurnstileKey] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!turnstileToken) {
      setError('Completa la verifica di sicurezza')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          turnstileToken,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Errore durante l\'invio. Riprova.')
        setLoading(false)
        return
      }

      // Salva email per la pagina di reset
      sessionStorage.setItem('resetPasswordEmail', email.trim().toLowerCase())

      // Redirect alla pagina reset-password con input OTP
      router.push(`/auth/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`)
    } catch {
      setError('Errore di connessione. Riprova.')
    } finally {
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
            width={540}
            height={216}
            className="h-52 w-auto mx-auto"
            priority
          />
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Password dimenticata?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Inserisci la tua email e ti invieremo un link per reimpostarla.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent transition-all"
                  placeholder="la-tua@email.com"
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
              className="w-full py-3 px-4 bg-petrol-600 hover:bg-petrol-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Invio in corso...
                </>
              ) : (
                'Invia link di recupero'
              )}
            </button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-petrol-600 hover:text-petrol-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Torna al login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
