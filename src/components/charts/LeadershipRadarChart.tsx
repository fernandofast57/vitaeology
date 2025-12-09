'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface CharacteristicData {
  characteristic: string
  score: number
  pillar: 'ESSERE' | 'SENTIRE' | 'PENSARE' | 'AGIRE'
  fullMark: number
}

interface LeadershipRadarChartProps {
  data: CharacteristicData[]
  showLegend?: boolean
  height?: number
}

const PILLAR_COLORS = {
  ESSERE: '#3B82F6',   // blue
  SENTIRE: '#10B981',  // green
  PENSARE: '#8B5CF6',  // purple
  AGIRE: '#F59E0B',    // orange
}

export default function LeadershipRadarChart({
  data,
  showLegend = true,
  height = 500,
}: LeadershipRadarChartProps) {
  // Format data for radar chart
  const chartData = data.map((item) => ({
    subject: item.characteristic,
    score: item.score,
    fullMark: item.fullMark,
    pillar: item.pillar,
  }))

  // Custom tick for axis labels
  const renderPolarAngleAxisTick = (props: any) => {
    const { payload, x, y, cx, cy } = props
    const item = data.find((d) => d.characteristic === payload.value)
    const color = item ? PILLAR_COLORS[item.pillar] : '#6B7280'
    
    // Calculate position for label
    const radius = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
    const angle = Math.atan2(y - cy, x - cx)
    const labelRadius = radius + 15
    const labelX = cx + labelRadius * Math.cos(angle)
    const labelY = cy + labelRadius * Math.sin(angle)

    return (
      <text
        x={labelX}
        y={labelY}
        fill={color}
        textAnchor={labelX > cx ? 'start' : 'end'}
        dominantBaseline="middle"
        fontSize={11}
        fontWeight={500}
      >
        {payload.value.length > 12 
          ? `${payload.value.substring(0, 12)}...` 
          : payload.value}
      </text>
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const item = chartData.find((d) => d.subject === data.subject)
      const pillarColor = item ? PILLAR_COLORS[item.pillar as keyof typeof PILLAR_COLORS] : '#6B7280'
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-petrol-600">{data.subject}</p>
          <p className="text-sm text-gray-600 mt-1">
            Punteggio: <span className="font-bold" style={{ color: pillarColor }}>{data.score}%</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Pilastro: {item?.pillar}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis
            dataKey="subject"
            tick={renderPolarAngleAxisTick}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name="Punteggio"
            dataKey="score"
            stroke="#0A2540"
            fill="#0A2540"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={() => (
                <span className="text-sm text-gray-600">
                  Il tuo profilo di leadership
                </span>
              )}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Example data for testing
export const EXAMPLE_RADAR_DATA: CharacteristicData[] = [
  { characteristic: 'Autenticità', score: 75, pillar: 'ESSERE', fullMark: 100 },
  { characteristic: 'Integrità', score: 82, pillar: 'ESSERE', fullMark: 100 },
  { characteristic: 'Consapevolezza', score: 68, pillar: 'ESSERE', fullMark: 100 },
  { characteristic: 'Presenza', score: 71, pillar: 'ESSERE', fullMark: 100 },
  { characteristic: 'Resilienza', score: 79, pillar: 'ESSERE', fullMark: 100 },
  { characteristic: 'Umiltà', score: 65, pillar: 'ESSERE', fullMark: 100 },
  { characteristic: 'Empatia', score: 88, pillar: 'SENTIRE', fullMark: 100 },
  { characteristic: 'Intel. Emotiva', score: 72, pillar: 'SENTIRE', fullMark: 100 },
  { characteristic: 'Ascolto', score: 81, pillar: 'SENTIRE', fullMark: 100 },
  { characteristic: 'Compassione', score: 76, pillar: 'SENTIRE', fullMark: 100 },
  { characteristic: 'Fiducia', score: 69, pillar: 'SENTIRE', fullMark: 100 },
  { characteristic: 'Gratitudine', score: 84, pillar: 'SENTIRE', fullMark: 100 },
  { characteristic: 'Visione', score: 91, pillar: 'PENSARE', fullMark: 100 },
  { characteristic: 'Pensiero Critico', score: 78, pillar: 'PENSARE', fullMark: 100 },
  { characteristic: 'Creatività', score: 85, pillar: 'PENSARE', fullMark: 100 },
  { characteristic: 'Adattabilità', score: 73, pillar: 'PENSARE', fullMark: 100 },
  { characteristic: 'Apprendimento', score: 89, pillar: 'PENSARE', fullMark: 100 },
  { characteristic: 'Problem Solving', score: 77, pillar: 'PENSARE', fullMark: 100 },
  { characteristic: 'Decisionalità', score: 70, pillar: 'AGIRE', fullMark: 100 },
  { characteristic: 'Comunicazione', score: 83, pillar: 'AGIRE', fullMark: 100 },
  { characteristic: 'Delega', score: 62, pillar: 'AGIRE', fullMark: 100 },
  { characteristic: 'Motivazione', score: 86, pillar: 'AGIRE', fullMark: 100 },
  { characteristic: 'Accountability', score: 74, pillar: 'AGIRE', fullMark: 100 },
  { characteristic: 'Execution', score: 80, pillar: 'AGIRE', fullMark: 100 },
]
