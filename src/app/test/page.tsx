'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Clock, ChevronRight, ChevronLeft, Check } from 'lucide-react'

interface Question {
  id: number
  question_text: string
  scoring_type: string
  order_index: number
  characteristic_id: number
}

interface Answer {
  question_id: number
  value: number // 0 = FALSO, 1 = INCERTO, 2 = VERO
}

export default function TestPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Map<number, number>>(new Map())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const supabase = createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?redirect=/test')
      return
    }
    setUser(user)

    // Load questions
    const { data: questionsData, error } = await supabase
      .from('assessment_questions')
      .select('id, question_text, scoring_type, order_index, characteristic_id')
      .eq('book_id', 1)
      .order('order_index')

    if (error) {
      console.error('Error loading questions:', error)
      return
    }

    setQuestions(questionsData || [])

    // Load existing answers
    const { data: existingAnswers } = await supabase
      .from('user_responses')
      .select('question_id, response_value')
      .eq('user_id', user.id)

    if (existingAnswers && existingAnswers.length > 0) {
      const answersMap = new Map<number, number>()
      existingAnswers.forEach(a => {
        answersMap.set(a.question_id, a.response_value)
      })
      setAnswers(answersMap)
      
      // Find first unanswered question
      const firstUnanswered = questionsData?.findIndex(q => !answersMap.has(q.id)) ?? 0
      setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0)
    }

    setLoading(false)
  }

  async function handleAnswer(value: number) {
    if (!user || !questions[currentIndex]) return

    const question = questions[currentIndex]
    const newAnswers = new Map(answers)
    newAnswers.set(question.id, value)
    setAnswers(newAnswers)

    // Save to database
    setSaving(true)
    const supabase = createClient()
    
    await supabase
      .from('user_responses')
      .upsert({
        user_id: user.id,
        question_id: question.id,
        response_value: value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,question_id'
      })

    setSaving(false)

    // Auto-advance to next question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  async function handleComplete() {
    if (answers.size < questions.length) {
      alert(`Hai risposto a ${answers.size} domande su ${questions.length}. Completa tutte le domande prima di vedere i risultati.`)
      return
    }

    // Mark test as completed
    const supabase = createClient()
    await supabase
      .from('user_test_progress')
      .upsert({
        user_id: user.id,
        book_id: 1,
        completed: true,
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,book_id'
      })

    router.push('/results')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento domande...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nessuna domanda trovata.</p>
          <Link href="/dashboard" className="text-petrol-600 mt-4 inline-block">
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers.get(currentQuestion.id)
  const progress = (answers.size / questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link 
              href="/dashboard" 
              className="flex items-center text-gray-600 hover:text-petrol-600"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Salva ed esci
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {answers.size} / {questions.length} risposte
              </span>
              {saving && (
                <span className="text-sm text-petrol-600">Salvataggio...</span>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-petrol-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Question number */}
        <div className="text-center mb-2">
          <span className="text-sm font-medium text-petrol-600">
            Domanda {currentIndex + 1} di {questions.length}
          </span>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <p className="text-xl text-gray-800 text-center leading-relaxed">
            {currentQuestion.question_text}
          </p>
        </div>

        {/* Answer buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => handleAnswer(2)}
            className={`px-8 py-4 rounded-lg font-medium text-lg transition-all ${
              currentAnswer === 2
                ? 'bg-green-600 text-white'
                : 'bg-white border-2 border-green-600 text-green-600 hover:bg-green-50'
            }`}
          >
            VERO
          </button>
          <button
            onClick={() => handleAnswer(1)}
            className={`px-8 py-4 rounded-lg font-medium text-lg transition-all ${
              currentAnswer === 1
                ? 'bg-yellow-500 text-white'
                : 'bg-white border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50'
            }`}
          >
            INCERTO
          </button>
          <button
            onClick={() => handleAnswer(0)}
            className={`px-8 py-4 rounded-lg font-medium text-lg transition-all ${
              currentAnswer === 0
                ? 'bg-red-600 text-white'
                : 'bg-white border-2 border-red-600 text-red-600 hover:bg-red-50'
            }`}
          >
            FALSO
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-petrol-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Precedente
          </button>

          {currentIndex === questions.length - 1 && answers.size === questions.length ? (
            <button
              onClick={handleComplete}
              className="flex items-center px-6 py-3 bg-petrol-600 text-white rounded-lg hover:bg-petrol-700 font-medium"
            >
              <Check className="h-5 w-5 mr-2" />
              Completa il Test
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-petrol-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Successiva
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          )}
        </div>

        {/* Question navigator */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Vai alla domanda:</h3>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  idx === currentIndex
                    ? 'bg-petrol-600 text-white'
                    : answers.has(q.id)
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
