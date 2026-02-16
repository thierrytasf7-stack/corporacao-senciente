'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface MetricData {
  time: string
  cpu: number
  memory: number
  disk: number
}

type MetricType = 'cpu' | 'memory' | 'disk'

interface MetricsChartProps {
  data: MetricData[]
  metric: MetricType
  loading?: boolean
}

const CHART_COLORS = {
  cpu: '#00f0ff',
  memory: '#bf00ff',
  disk: '#ffbb00',
} as const

const formatTime = (time: string) => 
  new Date(time).toLocaleTimeString('pt-PT', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  })

export const MetricsChart = React.memo(function MetricsChart({ 
  data, 
  metric,
  loading = false
}: MetricsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors[metric]} stopOpacity={0.3} />
            <stop offset="95%" stopColor={colors[metric]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="time" 
          stroke="rgba(255,255,255,0.5)"
          fontSize={12}
          tickFormatter={formatTime}
          aria-label="Eixo do tempo"
        />
        <YAxis 
          stroke="rgba(255,255,255,0.5)"
          fontSize={12}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0,0,0,0.9)',
            border: `1px solid ${colors[metric]}`,
            borderRadius: '4px',
          }}
          labelStyle={{ color: colors[metric] }}
        />
        <Area
          type="monotone"
          dataKey={metric}
          stroke={CHART_COLORS[metric]}
          fill={`url(#gradient-${metric})`}
          strokeWidth={2}
          isAnimationActive={!loading}
          aria-label={`Gráfico de ${metric}`}
          role="img"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
