'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Title from '@/components/ui/title'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { Activity, Database, Zap, RefreshCw, Trash2 } from 'lucide-react'

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics?type=all&limit=100')
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearMetrics = async () => {
    try {
      const res = await fetch('/api/metrics', { method: 'DELETE' })
      if (res.ok) {
        fetchMetrics()
      }
    } catch (error) {
      console.error('Error clearing metrics:', error)
    }
  }

  useEffect(() => {
    fetchMetrics()
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 5000) // Обновление каждые 5 секунд
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  if (loading || !metrics) {
    return (
      <div>
        <Title>Metrics</Title>
        <div className="text-center py-8">Загрузка...</div>
      </div>
    )
  }

  // Подготовка данных для графиков
  const aiChartData = metrics.ai?.recent?.slice(-20).map((m: any, index: number) => ({
    time: new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timeLabel: `${new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
    timestamp: m.timestamp,
    index: index,
    responseTime: m.responseTime,
    tokens: m.tokensUsed
  })) || []

  const dbChartData = metrics.db?.recent?.slice(-20).map((m: any, index: number) => {
    // Добавляем индекс к timestamp для уникальности (в миллисекундах)
    const uniqueTime = m.timestamp + index
    return {
      time: uniqueTime, // Используем уникальное время для оси X
      originalTime: m.timestamp, // Оригинальное время для отображения
      timeLabel: new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }),
      timestamp: m.timestamp,
      index: index,
      responseTime: m.responseTime,
      table: m.table,
      query: m.query,
      uniqueKey: `${m.timestamp}-${index}-${m.table}-${m.query}` // Уникальный ключ для каждой точки
    }
  }) || []

  const pageChartData = metrics.page?.recent?.slice(-20).map((m: any, index: number) => ({
    time: new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timeLabel: `${new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
    timestamp: m.timestamp,
    index: index,
    ttfb: m.ttfb,
    loadTime: m.loadTime,
    renderTime: m.renderTime
  })) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Title>Metrics</Title>
        <div className="flex items-center gap-3">
          <button
            onClick={clearMetrics}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Очистить
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
            } text-white`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Автообновление' : 'Включить автообновление'}
          </button>
        </div>
      </div>

      {/* AI Метрики */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Метрики нейросети
        </h2>
        {metrics.ai?.summary ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Всего запросов</p>
                  <p className="text-2xl font-bold">{metrics.ai.summary.totalRequests}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Среднее время ответа</p>
                  <p className="text-2xl font-bold">{metrics.ai.summary.avgResponseTime}мс</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Среднее токенов</p>
                  <p className="text-2xl font-bold">{metrics.ai.summary.avgTokens}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Запросов/мин</p>
                  <p className="text-2xl font-bold">{metrics.ai.summary.requestsPerMinute}</p>
                </div>
              </div>
              {aiChartData.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={aiChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700">
                              <p className="font-semibold mb-2">{data.timeLabel}</p>
                              <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                                Время ответа: {data.responseTime}мс
                              </p>
                              <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                                Токены: {data.tokens}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="#3b82f6" 
                      name="Время ответа (мс)"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="tokens" 
                      stroke="#10b981" 
                      name="Токены"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Нет данных. Используйте чат или AI анализ для генерации метрик.</p>
          )}
      </div>

      {/* БД Метрики */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Метрики базы данных
        </h2>
        {metrics.db?.summary ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Всего запросов</p>
                  <p className="text-2xl font-bold">{metrics.db.summary.totalQueries}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Среднее время</p>
                  <p className="text-2xl font-bold">{metrics.db.summary.avgResponseTime}мс</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Успешность</p>
                  <p className="text-2xl font-bold">{metrics.db.summary.successRate}%</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Запросов/мин</p>
                  <p className="text-2xl font-bold">{metrics.db.summary.queriesPerMinute}</p>
                </div>
              </div>
              {metrics.db.summary.queriesByTable && Object.keys(metrics.db.summary.queriesByTable).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Запросы по таблицам</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(metrics.db.summary.queriesByTable).map(([table, count]: [string, any]) => (
                      <div key={table} className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{table}</p>
                        <p className="text-xl font-bold">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {dbChartData.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dbChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time"
                      type="number"
                      scale="time"
                      domain={['dataMin', 'dataMax']}
                      tickFormatter={(value) => new Date(value).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          // Получаем данные из payload[0], который содержит информацию о точке
                          const pointData = payload[0]
                          const data = pointData.payload as any
                          
                          // Используем оригинальное время из данных, а не label
                          const timeLabel = data.timeLabel || (data.originalTime ? new Date(data.originalTime).toLocaleTimeString('ru-RU', { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            second: '2-digit',
                            fractionalSecondDigits: 3
                          }) : '')
                          
                          return (
                            <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700">
                              <p className="font-semibold mb-2">{timeLabel}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Таблица: <span className="font-medium">{data.table || 'unknown'}</span>
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Операция: <span className="font-medium">{data.query || 'unknown'}</span>
                              </p>
                              <p className="text-sm text-red-600 dark:text-red-400 font-semibold mt-1">
                                Время: {pointData.value}мс
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                #{data.index + 1}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                      labelFormatter={(value) => {
                        // Находим данные по времени
                        const dataPoint = dbChartData.find((d: any) => d.time === value)
                        if (dataPoint) {
                          return dataPoint.timeLabel || new Date(dataPoint.originalTime).toLocaleTimeString('ru-RU', { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            second: '2-digit',
                            fractionalSecondDigits: 3
                          })
                        }
                        return new Date(value).toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          second: '2-digit',
                          fractionalSecondDigits: 3
                        })
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="#ef4444" 
                      name="Время запроса (мс)"
                      dot={{ r: 4, fill: '#ef4444' }}
                      activeDot={{ r: 6, fill: '#dc2626' }}
                      isAnimationActive={false}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Нет данных. Метрики будут собираться автоматически при выполнении запросов к базе данных.</p>
          )}
      </div>

      {/* Метрики страниц */}
      {metrics.page && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Метрики загрузки страниц
          </h2>
          {metrics.page.summary ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">TTFB (мс)</p>
                  <p className="text-2xl font-bold">{metrics.page.summary.avgTTFB}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Время загрузки</p>
                  <p className="text-2xl font-bold">{metrics.page.summary.avgLoadTime}мс</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Время рендера</p>
                  <p className="text-2xl font-bold">{metrics.page.summary.avgRenderTime}мс</p>
                </div>
              </div>
              {pageChartData.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pageChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="ttfb" 
                      stroke="#3b82f6" 
                      name="TTFB (мс)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="loadTime" 
                      stroke="#10b981" 
                      name="Время загрузки (мс)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="renderTime" 
                      stroke="#f59e0b" 
                      name="Время рендера (мс)" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Нет данных</p>
          )}
        </div>
      )}
    </div>
  )
}

