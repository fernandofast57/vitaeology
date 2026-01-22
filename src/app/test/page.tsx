'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// Tipi
interface Question {
  id: number
  book_id: number
  characteristic_id: number
  question_text: string
  scoring_type: 'direct' | 'inverse'
  order_index: number
}

interface Answer {
  question_id: number
  answer: 'VERO' | 'INCERTO' | 'FALSO'
  points_earned: number
}

// Colori pilastri
const PILLAR_COLORS: Record<string, string> = {
  'Vision': '#0F4C81',
  'Action': '#C1272D',
  'Relations': '#2D9B6D',
  'Adaptation': '#E87722'
}

// Funzione calcolo punti
function calculatePoints(answer: 'VERO' | 'INCERTO' | 'FALSO', scoringType: 'direct' | 'inverse'): number {
  const directScoring: Record<string, number> = { 'VERO': 2, 'INCERTO': 1, 'FALSO': 0 }
  const inverseScoring: Record<string, number> = { 'VERO': 0, 'INCERTO': 1, 'FALSO': 2 }
  
  return scoringType === 'direct' ? directScoring[answer] : inverseScoring[answer]
}

// Funzione per determinare il pilastro dalla caratteristica
function getPillarFromCharacteristic(characteristicId: number): string {
  if (characteristicId >= 1 && characteristicId <= 6) return 'Vision'
  if (characteristicId >= 7 && characteristicId <= 12) return 'Action'
  if (characteristicId >= 13 && characteristicId <= 18) return 'Relations'
  return 'Adaptation'
}

export default function TestPage() {
  const router = useRouter()
  
  // State
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<number, Answer>>(new Map())
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [testStarted, setTestStarted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Carica dati iniziali
  useEffect(() => {
    async function initialize() {
      try {
        // Verifica auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login?redirectTo=/test')
          return
        }
        setUserId(user.id)

        // Carica domande
        const { data: questionsData, error: questionsError } = await supabase
          .from('assessment_questions')
          .select('*')
          .eq('book_id', 1)
          .order('order_index', { ascending: true })

        if (questionsError) throw questionsError
        if (!questionsData || questionsData.length === 0) {
          setError('Nessuna domanda trovata nel database')
          setLoading(false)
          return
        }
        setQuestions(questionsData)

        // Controlla assessment in corso
        const { data: existingAssessment } = await supabase
          .from('user_assessments')
          .select('*')
          .eq('user_id', user.id)
          .eq('book_id', 1)
          .eq('status', 'in_progress')
          .single()

        if (existingAssessment) {
          setAssessmentId(existingAssessment.id)
          setTestStarted(true)

          // Carica risposte esistenti
          const { data: existingAnswers } = await supabase
            .from('user_answers')
            .select('question_id, answer, points_earned')
            .eq('assessment_id', existingAssessment.id)

          if (existingAnswers && existingAnswers.length > 0) {
            const answersMap = new Map<number, Answer>()
            existingAnswers.forEach(a => {
              answersMap.set(a.question_id, {
                question_id: a.question_id,
                answer: a.answer as 'VERO' | 'INCERTO' | 'FALSO',
                points_earned: a.points_earned
              })
            })
            setAnswers(answersMap)
            
            // Trova prima domanda senza risposta
            const lastAnsweredIndex = questionsData.findIndex(
              q => !answersMap.has(q.id)
            )
            setCurrentIndex(lastAnsweredIndex >= 0 ? lastAnsweredIndex : questionsData.length - 1)
          }
        }
      } catch (err: any) {
        console.error('Error initializing:', err)
        setError(err.message || 'Errore durante il caricamento')
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [router, supabase])

  // Inizia test
  const startTest = async () => {
    if (!userId) return
    
    setSaving(true)
    try {
      const { data, error: insertError } = await supabase
        .from('user_assessments')
        .insert({
          user_id: userId,
          book_id: 1,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw insertError
      
      setAssessmentId(data.id)
      setTestStarted(true)
    } catch (err: any) {
      console.error('Error starting test:', err)
      setError('Errore nell\'avvio del test: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Salva risposta
  const saveAnswer = useCallback(async (answer: 'VERO' | 'INCERTO' | 'FALSO') => {
    if (!assessmentId || questions.length === 0) return

    const currentQuestion = questions[currentIndex]
    const points = calculatePoints(answer, currentQuestion.scoring_type)

    setSaving(true)
    try {
      // Upsert risposta
      const { error: upsertError } = await supabase
        .from('user_answers')
        .upsert({
          assessment_id: assessmentId,
          question_id: currentQuestion.id,
          answer: answer,
          points_earned: points,
          answered_at: new Date().toISOString()
        }, {
          onConflict: 'assessment_id,question_id'
        })

      if (upsertError) throw upsertError

      // Aggiorna state locale
      const newAnswers = new Map(answers)
      newAnswers.set(currentQuestion.id, {
        question_id: currentQuestion.id,
        answer,
        points_earned: points
      })
      setAnswers(newAnswers)

      // Vai alla prossima domanda
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1)
      }
    } catch (err: any) {
      console.error('Error saving answer:', err)
      setError('Errore nel salvataggio: ' + err.message)
    } finally {
      setSaving(false)
    }
  }, [assessmentId, questions, currentIndex, answers, supabase])

  // Completa test
  const completeTest = async () => {
    if (!assessmentId || answers.size < questions.length) {
      setError('Rispondi a tutte le domande prima di completare')
      return
    }

    setSaving(true)
    try {
      // Calcola punteggio totale
      let totalPoints = 0
      answers.forEach(a => {
        totalPoints += a.points_earned
      })
      const maxPoints = questions.length * 2
      const totalScore = Math.round((totalPoints / maxPoints) * 100)

      // Aggiorna assessment
      const { error: updateError } = await supabase
        .from('user_assessments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          total_score: totalScore
        })
        .eq('id', assessmentId)

      if (updateError) throw updateError

      // Redirect ai risultati
      router.push('/results')
    } catch (err: any) {
      console.error('Error completing test:', err)
      setError('Errore nel completamento: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Navigazione
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Caricamento assessment...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !testStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Errore</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  // Start screen
  if (!testStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Assessment Leadership Autentica
            </h1>
            <p className="text-slate-600 text-lg">
              Scopri il tuo profilo di leadership attraverso 72 domande sulle 24 caratteristiche fondamentali.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(PILLAR_COLORS).map(([pillar, color]) => (
              <div 
                key={pillar}
                className="p-4 rounded-lg text-center text-white"
                style={{ backgroundColor: color }}
              >
                <div className="font-bold">{pillar}</div>
                <div className="text-sm opacity-90">6 caratteristiche</div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-6 rounded-lg mb-8">
            <h3 className="font-semibold text-slate-900 mb-3">Come funziona:</h3>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>72 domande divise in 4 pilastri</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Rispondi VERO, INCERTO o FALSO</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Puoi interrompere e riprendere quando vuoi</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Tempo stimato: 25-35 minuti</span>
              </li>
            </ul>
          </div>

          <button
            onClick={startTest}
            disabled={saving}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Preparazione...' : 'Inizia Assessment'}
          </button>
        </div>
      </div>
    )
  }

  // Test in corso
  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers.get(currentQuestion?.id)
  const progress = Math.round((answers.size / questions.length) * 100)
  const pillar = getPillarFromCharacteristic(currentQuestion?.characteristic_id || 1)
  const pillarColor = PILLAR_COLORS[pillar]
  const allAnswered = answers.size === questions.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header con progresso */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-sm text-slate-500">Domanda</span>
              <span className="ml-2 text-2xl font-bold text-slate-900">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
            <div 
              className="px-4 py-2 rounded-full text-white font-medium"
              style={{ backgroundColor: pillarColor }}
            >
              {pillar}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="h-3 rounded-full transition-all duration-300"
              style={{ 
                width: `${progress}%`,
                backgroundColor: pillarColor
              }}
            />
          </div>
          <div className="mt-2 text-sm text-slate-600 text-right">
            {answers.size} risposte salvate ({progress}%)
          </div>
        </div>

        {/* Errore inline */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
            <button 
              onClick={() => setError('')}
              className="float-right text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Domanda */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <p className="text-xl text-slate-900 leading-relaxed mb-8">
            {currentQuestion?.question_text}
          </p>

          {/* Bottoni risposta */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {(['VERO', 'INCERTO', 'FALSO'] as const).map((option) => {
              const isSelected = currentAnswer?.answer === option
              const colors = {
                'VERO': 'bg-green-500 hover:bg-green-600 border-green-600',
                'INCERTO': 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600',
                'FALSO': 'bg-red-500 hover:bg-red-600 border-red-600'
              }

              return (
                <button
                  key={option}
                  onClick={() => saveAnswer(option)}
                  disabled={saving}
                  className={`
                    py-3 px-2 sm:py-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-lg transition-all whitespace-nowrap
                    ${isSelected
                      ? `${colors[option]} text-white ring-2 sm:ring-4 ring-offset-1 sm:ring-offset-2`
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200'
                    }
                    ${saving ? 'opacity-50 cursor-not-allowed' : ''}
                  `}

                >
                  {saving && isSelected ? '...' : option}
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigazione */}
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="px-3 sm:px-6 py-2 sm:py-3 bg-white text-slate-700 rounded-lg shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <span className="hidden sm:inline">← Precedente</span>
            <span className="sm:hidden">← Prec</span>
          </button>

          {allAnswered ? (
            <button
              onClick={completeTest}
              disabled={saving}
              className="px-4 sm:px-8 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              {saving ? '...' : <><span className="hidden sm:inline">✓ Completa Assessment</span><span className="sm:hidden">✓ Completa</span></>}
            </button>
          ) : (
            <button
              onClick={goToNext}
              disabled={currentIndex === questions.length - 1}
              className="px-3 sm:px-6 py-2 sm:py-3 bg-white text-slate-700 rounded-lg shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Successiva →</span>
              <span className="sm:hidden">Succ →</span>
            </button>
          )}
        </div>

        {/* Mini navigazione rapida */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-4">
          <div className="text-sm text-slate-500 mb-3">Navigazione rapida:</div>
          <div className="flex flex-wrap gap-1">
            {questions.map((q, idx) => {
              const answered = answers.has(q.id)
              const isCurrent = idx === currentIndex
              const qPillar = getPillarFromCharacteristic(q.characteristic_id)
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`
                    w-8 h-8 text-xs rounded transition-all
                    ${isCurrent 
                      ? 'ring-2 ring-offset-1 font-bold' 
                      : ''
                    }
                    ${answered 
                      ? 'text-white' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }
                  `}
                  style={answered ? { backgroundColor: PILLAR_COLORS[qPillar] } : {}}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
