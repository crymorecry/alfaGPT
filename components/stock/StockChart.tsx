'use client'

import { Stock } from './types'
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface StockChartProps {
  stock: Stock
}

// Кастомный Tooltip компонент
const CustomTooltip = (props: any) => {
  const { active, payload, label } = props
  if (active && payload && payload.length) {
    const data = payload[0]
    const value = data.value as number
    const isPositive = value >= (data.payload as any)?.prevPrice || true

    return (
      <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg p-3 backdrop-blur-sm">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
          {label}
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-base font-semibold text-zinc-900 dark:text-white ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
           Цена: ₽{value.toFixed(2)}
          </div>
        </div>
      </div>
    )
  }
  return null
}

export default function StockChart({ stock }: StockChartProps) {
  const isPositive = stock.change >= 0
  const chartColor = isPositive ? '#10b981' : '#ef4444'
  const gradientId = `gradient-${stock.ticker}`
  const areaGradientId = `areaGradient-${stock.ticker}`

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getDate()}.${date.getMonth() + 1}`
  }

  const chartData = stock.history.map((point, index) => ({
    date: formatDate(point.date),
    price: point.price,
    prevPrice: index > 0 ? stock.history[index - 1].price : point.price
  }))

  if (chartData.length === 0) {
    return (
      <div className="w-full h-64 bg-white dark:bg-zinc-900 rounded-xl p-4 flex items-center justify-center border border-gray-200 dark:border-zinc-800">
        <div className="text-gray-500 dark:text-gray-400">Нет данных</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-transparent rounded-xl p-4 relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <defs>
            {/* Градиент для линии */}
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity={1} />
              <stop offset="100%" stopColor={chartColor} stopOpacity={0.8} />
            </linearGradient>
            {/* Градиент для области под линией (эффект свечения) */}
            <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="50%" stopColor={chartColor} stopOpacity={0.15} />
              <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
            {/* Фильтр для эффекта свечения */}
            <filter id={`glow-${stock.ticker}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.2} />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            fontSize={12}
            tick={{ fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tick={{ fill: '#9ca3af' }}
            domain={['dataMin - 10', 'dataMax + 10']}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `₽${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Область под линией для эффекта свечения */}
          <Area
            type="monotone"
            dataKey="price"
            fill={`url(#${areaGradientId})`}
            stroke="none"
          />
          {/* Основная линия с эффектом свечения */}
          <Line
            type="monotone"
            dataKey="price"
            stroke={`url(#${gradientId})`}
            strokeWidth={3}
            dot={false}
            activeDot={{ 
              r: 6, 
              fill: chartColor,
              stroke: '#fff',
              strokeWidth: 2,
              filter: `url(#glow-${stock.ticker})`
            }}
            filter={`url(#glow-${stock.ticker})`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

