'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, AlertCircle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Dati dalla pagina signup (passati via URL o sessionStorage)
  const emailParam = searchParams.get('email')

  const [email, setEmail] = useState(emailParam || '')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Refs per gli input del codice
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Recupera dati da sessionStorage
  const [signupData, setSignupData] = useState<{
    password: string
    fullName: string
    bookCode?: string
  } | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('signupData')
    if (stored) {
      const data = JSON.parse(stored)
      setSignupData(data)
      if (data.email) setEmail(data.email)
    } else if (!emailParam) {
      // Se non ci sono dati, torna al signup
      router.push('/auth/signup')
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

    // Auto-submit quando completo
    if (digit && index === 5) {
      const fullCode = newCode.join('')
      if (fullCode.length === 6) {
        handleVerify(fullCode)
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
      handleVerify(pasted)
    }
  }

  // Verifica OTP
  const handleVerify = async (fullCode?: string) => {
    const codeToVerify = fullCode || code.join('')

    if (codeToVerify.length !== 6) {
      setError('Inserisci il codice completo')
      return
    }

    if (!signupData) {
      setError('Sessione scaduta. Torna alla registrazione.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: codeToVerify,
          password: signupData.password,
          fullName: signupData.fullName,
          bookCode: signupData.bookCode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Codice non valido')
        // Reset codice su errore
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        setLoading(false)
        return
      }

      // Successo!
      setSuccess(true)
      sessionStorage.removeItem('signupData')

      // Redirect al login dopo 2 secondi
      setTimeout(() => {
        router.push('/auth/login?verified=true')
      }, 2000)

    } catch {
      setError('Errore di connessione. Riprova.')
      setLoading(false)
    }
  }

  // Reinvia codice
  const handleResend = async () => {
    if (!signupData || countdown > 0) return

    setResending(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: signupData.password,
          fullName: signupData.fullName,
          bookCode: signupData.bookCode,
          turnstileToken: 'resend', // Skip turnstile per resend (rate limited)
        }),
      })

      if (res.ok) {
        setCountdown(60) // 60 secondi prima di poter reinviare
        setCode(['', '', '', '', '', ''])
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
              Account creato!
            </h2>
            <p className="text-gray-600 mb-6">
              La tua email è stata verificata. Verrai reindirizzato al login...
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
          Verifica la tua email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Abbiamo inviato un codice a 6 cifre a
        </p>
        <p className="text-center text-sm font-medium text-petrol-600">
          {email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-10">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

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
                disabled={loading}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-petrol-600 focus:ring-2 focus:ring-petrol-100 transition-colors disabled:bg-gray-100"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={loading || code.join('').length !== 6}
            className="btn-primary w-full mb-4"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Verifica in corso...
              </>
            ) : (
              'Verifica Codice'
            )}
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

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/auth/signup"
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna alla registrazione
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback
function VerifyLoading() {
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

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyForm />
    </Suspense>
  )
}
