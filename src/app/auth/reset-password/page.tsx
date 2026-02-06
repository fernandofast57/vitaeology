'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Lock, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Email da URL o sessionStorage
  const emailParam = searchParams.get('email')

  const [email, setEmail] = useState(emailParam || '')
  const [step, setStep] = useState<'otp' | 'password'>('otp')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Refs per gli input del codice
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Recupera email da sessionStorage se non presente nell'URL
  useEffect(() => {
    if (!emailParam) {
      const stored = sessionStorage.getItem('resetPasswordEmail')
      if (stored) {
        setEmail(stored)
      } else {
        // Se non c'è email, torna al forgot-password
        router.push('/auth/forgot-password')
      }
    }
  }, [emailParam, router])

  // Countdown per resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Gestione input codice OTP
  const handleCodeChange = (index: number, value: string) => {
    // Solo numeri
    const digit = value.replace(/\D/g, '').slice(-1)

    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-proceed quando completo
    if (digit && index === 5) {
      const fullCode = newCode.join('')
      if (fullCode.length === 6) {
        // Passa al form password
        setStep('password')
      }
    }
  }

  // Gestione backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Paste handler
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newCode = pasted.split('')
      setCode(newCode)
      inputRefs.current[5]?.focus()
      setStep('password')
    }
  }

  // Reinvia codice
  const handleResend = async () => {
    if (countdown > 0 || !email) return

    setResending(true)
    setError(null)

    try {
      // Chiama di nuovo forgot-password API per generare nuovo OTP
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          turnstileToken: 'resend', // Skip turnstile per resend
        }),
      })

      if (res.ok) {
        setCountdown(60)
        setCode(['', '', '', '', '', ''])
        setStep('otp')
        inputRefs.current[0]?.focus()
      } else {
        const data = await res.json()
        setError(data.error || 'Impossibile reinviare il codice')
      }
    } catch {
      setError('Errore di connessione')
    } finally {
      setResending(false)
    }
  }

  // Submit password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('Inserisci il codice completo')
      setStep('otp')
      return
    }

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }

    if (password !== confirmPassword) {
      setError('Le password non corrispondono')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: fullCode,
          newPassword: password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Errore durante il reset')
        // Se codice errato, torna al form OTP
        if (data.error?.includes('Codice')) {
          setStep('otp')
          setCode(['', '', '', '', '', ''])
          inputRefs.current[0]?.focus()
        }
        setLoading(false)
        return
      }

      // Successo!
      setSuccess(true)
      sessionStorage.removeItem('resetPasswordEmail')

      // Redirect al login dopo 2 secondi
      setTimeout(() => {
        router.push('/auth/login?reset=true')
      }, 2000)

    } catch {
      setError('Errore di connessione. Riprova.')
      setLoading(false)
    }
  }

  // Successo
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Password aggiornata!
            </h2>
            <p className="text-gray-600 mb-6">
              La tua password è stata reimpostata con successo. Verrai reindirizzato al login...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-petrol-600" />
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
            width={360}
            height={144}
            className="h-36 w-auto mx-auto"
            priority
          />
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          {step === 'otp' ? 'Verifica il codice' : 'Nuova password'}
        </h2>
        {step === 'otp' && (
          <>
            <p className="mt-2 text-center text-sm text-gray-600">
              Abbiamo inviato un codice a 6 cifre a
            </p>
            <p className="text-center text-sm font-medium text-petrol-600">
              {email}
            </p>
          </>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {step === 'otp' ? (
            <>
              {/* Input codice OTP */}
              <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-petrol-600 focus:ring-2 focus:ring-petrol-100 transition-colors"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <button
                onClick={() => code.join('').length === 6 && setStep('password')}
                disabled={code.join('').length !== 6}
                className="btn-primary w-full mb-4"
              >
                Continua
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Non hai ricevuto il codice?
                </p>
                <button
                  onClick={handleResend}
                  disabled={resending || countdown > 0}
                  className="text-sm text-petrol-600 hover:text-petrol-700 font-medium disabled:text-gray-400"
                >
                  {resending ? (
                    'Invio in corso...'
                  ) : countdown > 0 ? (
                    `Reinvia tra ${countdown}s`
                  ) : (
                    'Invia nuovo codice'
                  )}
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mostra codice inserito */}
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Codice verificato</p>
                <p className="font-mono text-lg font-bold text-petrol-600 tracking-widest">
                  {code.join('')}
                </p>
                <button
                  type="button"
                  onClick={() => setStep('otp')}
                  className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                >
                  Modifica codice
                </button>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Nuova password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent transition-all"
                    placeholder="Minimo 6 caratteri"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Conferma password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent transition-all"
                    placeholder="Ripeti la password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-petrol-600 hover:bg-petrol-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Aggiornamento...
                  </>
                ) : (
                  'Aggiorna password'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/auth/forgot-password"
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna indietro
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback
function ResetPasswordLoading() {
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
