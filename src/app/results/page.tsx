'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

// Tipi
interface Characteristic {
  id: number
  book_id: number
  pillar: string
  name: string
  description: string
  order_index: number
}

interface CharacteristicScore {
  id: number
  name: string
  pillar: string
  score: number
  maxScore: number
  percentage: number
  level: string
}

interface PillarScore {
  name: string
  score: number
  color: string
  characteristics: CharacteristicScore[]
}

// Colori pilastri
const PILLAR_COLORS: Record<string, string> = {
  'Vision': '#0F4C81',
  'Action': '#C1272D',
  'Relations': '#2D9B6D',
  'Adaptation': '#E87722'
}

// Livelli interpretazione
function getLevel(percentage: number): string {
  if (percentage <= 20) return 'Area Prioritaria'
  if (percentage <= 40) return 'Transizione Consapevole'
  if (percentage <= 60) return 'Causativo Emergente'
  if (percentage <= 80) return 'Padronanza Funzionale'
  return 'Padronanza Naturale'
}

function getLevelColor(percentage: number): string {
  if (percentage <= 20) return '#EF4444'
  if (percentage <= 40) return '#F97316'
  if (percentage <= 60) return '#EAB308'
  if (percentage <= 80) return '#22C55E'
  return '#10B981'
}

export default function ResultsPage() {
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalScore, setTotalScore] = useState(0)
  const [characteristicScores, setCharacteristicScores] = useState<CharacteristicScore[]>([])
  const [pillarScores, setPillarScores] = useState<PillarScore[]>([])
  const [radarData, setRadarData] = useState<any[]>([])
  const [completedAt, setCompletedAt] = useState<string>('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadResults() {
      try {
        // Verifica auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login?redirectTo=/results')
          return
        }

        // Carica assessment completato
        const { data: assessment, error: assessmentError } = await supabase
          .from('user_assessments')
          .select('*')
          .eq('user_id', user.id)
          .eq('book_id', 1)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(1)
          .single()

        if (assessmentError || !assessment) {
          setError('Nessun assessment completato trovato. Completa prima il test.')
          setLoading(false)
          return
        }

        setTotalScore(assessment.total_score || 0)
        setCompletedAt(assessment.completed_at || '')

        // Carica caratteristiche
        const { data: characteristics } = await supabase
          .from('characteristics')
          .select('*')
          .eq('book_id', 1)
          .order('order_index', { ascending: true })

        if (!characteristics) {
          setError('Errore nel caricamento delle caratteristiche')
          setLoading(false)
          return
        }

        // Carica risposte con domande
        const { data: answers } = await supabase
          .from('user_answers')
          .select(`
            question_id,
            answer,
            points_earned,
            assessment_questions (
              id,
              characteristic_id,
              scoring_type
            )
          `)
          .eq('assessment_id', assessment.id)

        if (!answers || answers.length === 0) {
          setError('Nessuna risposta trovata per questo assessment')
          setLoading(false)
          return
        }

        // Calcola punteggi per caratteristica
        const scoresByCharacteristic: Record<number, { points: number; count: number }> = {}
        
        answers.forEach((answer: any) => {
          const charId = answer.assessment_questions?.characteristic_id
          if (charId) {
            if (!scoresByCharacteristic[charId]) {
              scoresByCharacteristic[charId] = { points: 0, count: 0 }
            }
            scoresByCharacteristic[charId].points += answer.points_earned
            scoresByCharacteristic[charId].count += 1
          }
        })

        // Costruisci array punteggi caratteristiche
        const charScores: CharacteristicScore[] = characteristics.map((char: Characteristic) => {
          const scores = scoresByCharacteristic[char.id] || { points: 0, count: 0 }
          const maxScore = scores.count * 2 // Max 2 punti per domanda
          const percentage = maxScore > 0 ? Math.round((scores.points / maxScore) * 100) : 0
          
          return {
            id: char.id,
            name: char.name,
            pillar: char.pillar,
            score: scores.points,
            maxScore: maxScore,
            percentage: percentage,
            level: getLevel(percentage)
          }
        })

        setCharacteristicScores(charScores)

        // Calcola punteggi pilastri
        const pillarData: Record<string, CharacteristicScore[]> = {
          'Vision': [],
          'Action': [],
          'Relations': [],
          'Adaptation': []
        }

        charScores.forEach(score => {
          if (pillarData[score.pillar]) {
            pillarData[score.pillar].push(score)
          }
        })

        const pillars: PillarScore[] = Object.entries(pillarData).map(([name, chars]) => {
          const avgScore = chars.length > 0 
            ? Math.round(chars.reduce((sum, c) => sum + c.percentage, 0) / chars.length)
            : 0
          
          return {
            name,
            score: avgScore,
            color: PILLAR_COLORS[name],
            characteristics: chars
          }
        })

        setPillarScores(pillars)

        // Prepara dati radar chart
        const radar = charScores.map(score => ({
          characteristic: score.name.length > 15 
            ? score.name.substring(0, 15) + '...' 
            : score.name,
          fullName: score.name,
          score: score.percentage,
          pillar: score.pillar,
          fill: PILLAR_COLORS[score.pillar]
        }))

        setRadarData(radar)

      } catch (err: any) {
        console.error('Error loading results:', err)
        setError(err.message || 'Errore nel caricamento dei risultati')
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [router, supabase])

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Elaborazione risultati...</p>
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Attenzione</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/test')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Vai al Test
          </button>
        </div>
      </div>
    )
  }

  // Ordina caratteristiche per identificare top e bottom
  const sortedByScore = [...characteristicScores].sort((a, b) => b.percentage - a.percentage)
  const top3 = sortedByScore.slice(0, 3)
  const bottom3 = sortedByScore.slice(-3).reverse()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            I Tuoi Risultati
          </h1>
          <p className="text-slate-600 mb-6">
            Assessment Leadership Autentica
            {completedAt && (
              <span className="block text-sm mt-1">
                Completato il {new Date(completedAt).toLocaleDateString('it-IT')}
              </span>
            )}
          </p>
          
          {/* Score totale */}
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8"
            style={{ borderColor: getLevelColor(totalScore) }}
          >
            <div className="text-center">
              <div className="text-4xl font-bold" style={{ color: getLevelColor(totalScore) }}>
                {totalScore}
              </div>
              <div className="text-sm text-slate-500">su 100</div>
            </div>
          </div>
          
          <div className="mt-4">
            <span 
              className="px-4 py-2 rounded-full text-white font-medium"
              style={{ backgroundColor: getLevelColor(totalScore) }}
            >
              {getLevel(totalScore)}
            </span>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Mappa delle 24 Caratteristiche
          </h2>
          
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="characteristic" 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Radar
                  name="Punteggio"
                  dataKey="score"
                  stroke="#0F4C81"
                  fill="#0F4C81"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border">
                          <div className="font-semibold text-slate-900">{data.fullName}</div>
                          <div className="text-sm text-slate-600">Pilastro: {data.pillar}</div>
                          <div className="text-lg font-bold" style={{ color: PILLAR_COLORS[data.pillar] }}>
                            {data.score}%
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda pilastri */}
          <div className="flex justify-center gap-6 mt-6 flex-wrap">
            {Object.entries(PILLAR_COLORS).map(([name, color]) => (
              <div key={name} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: color }}></div>
                <span className="text-sm text-slate-600">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pilastri Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {pillarScores.map(pillar => (
            <div 
              key={pillar.name}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div 
                className="p-4 text-white"
                style={{ backgroundColor: pillar.color }}
              >
                <h3 className="font-bold text-lg">{pillar.name}</h3>
                <div className="text-3xl font-bold mt-1">{pillar.score}%</div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {pillar.characteristics.map(char => (
                    <div key={char.id} className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 truncate mr-2">
                        {char.name}
                      </span>
                      <span 
                        className="text-sm font-semibold"
                        style={{ color: getLevelColor(char.percentage) }}
                      >
                        {char.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top e Bottom caratteristiche */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Top 3 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">⭐</span>
              Le Tue Forze
            </h3>
            <div className="space-y-4">
              {top3.map((char, idx) => (
                <div key={char.id} className="flex items-center">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3"
                    style={{ backgroundColor: PILLAR_COLORS[char.pillar] }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{char.name}</div>
                    <div className="text-sm text-slate-500">{char.pillar}</div>
                  </div>
                  <div 
                    className="text-xl font-bold"
                    style={{ color: getLevelColor(char.percentage) }}
                  >
                    {char.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom 3 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              Aree di Sviluppo
            </h3>
            <div className="space-y-4">
              {bottom3.map((char, idx) => (
                <div key={char.id} className="flex items-center">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3"
                    style={{ backgroundColor: PILLAR_COLORS[char.pillar] }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{char.name}</div>
                    <div className="text-sm text-slate-500">{char.pillar}</div>
                  </div>
                  <div 
                    className="text-xl font-bold"
                    style={{ color: getLevelColor(char.percentage) }}
                  >
                    {char.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Azioni */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Vai alla Dashboard
          </button>
          <button
            onClick={() => router.push('/test')}
            className="px-8 py-3 bg-white text-slate-700 font-semibold rounded-lg shadow hover:shadow-md transition-all"
          >
            Rifai il Test
          </button>
        </div>

      </div>
    </div>
  )
}
