'use client'

import { useState, useEffect } from 'react'
import { useBusiness } from '@/components/business/BusinessProvider'
import { useTranslations } from 'next-intl'
import Title from '../ui/title'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { Dialog, Portal } from '@chakra-ui/react'
import { XIcon, Sparkles, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { toaster } from '@/components/ui/toaster'
import ReactMarkdown from 'react-markdown'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import remarkGfm from 'remark-gfm'

interface MonthlyData {
  month: string
  income: number
  expense: number
  profit: number
}

interface CategoryData {
  category: string
  amount: number
}

interface AnalyticsData {
  monthlyData: MonthlyData[]
  expenseByCategory: CategoryData[]
  incomeByCategory: CategoryData[]
  expensesBreakdown: {
    fixed: number
    variable: number
    salaries: number
  }
  metrics: {
    totalIncome: number
    totalExpenses: number
    efficiency: number
    trend: number
  }
}

interface AIAnalysis {
  summary: string
  yearlyProjection: string
  profitability: string
  recommendations: string[]
  risks: string[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function AnalyticsView() {
  const t = useTranslations('analytics')
  const { currentBusiness } = useBusiness()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 11)
    date.setDate(1)
    return date
  })
  const [endDate, setEndDate] = useState<Date>(new Date())

  useEffect(() => {
    if (currentBusiness) {
      fetchAnalytics()
    }
  }, [currentBusiness, startDate, endDate])

  const fetchAnalytics = async () => {
    if (!currentBusiness) return

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('businessId', currentBusiness.id)
      params.append('startDate', startDate.toISOString().split('T')[0])
      params.append('endDate', endDate.toISOString().split('T')[0])
      
      const res = await fetch(`/api/analytics?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAIAnalysis = async () => {
    if (!currentBusiness) return

    setAnalyzing(true)
    try {
      const res = await fetch('/api/analytics/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          businessId: currentBusiness.id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        })
      })

      if (res.ok) {
        const analysis = await res.json()
        setAiAnalysis(analysis)
        setIsAnalysisModalOpen(true)
      } else {
        throw new Error('Failed to get analysis')
      }
    } catch (error) {
      toaster.create({
        title: t('error'),
        description: t('error_analyzing'),
        type: 'error'
      })
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading || !analyticsData) {
    return (
      <div>
        <Title>Analytics</Title>
        <div className="text-center py-8">{t('loading')}</div>
      </div>
    )
  }

  const { monthlyData, expenseByCategory, incomeByCategory, expensesBreakdown, metrics } = analyticsData

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Title>Analytics</Title>
        <button
          onClick={handleAIAnalysis}
          disabled={analyzing}
          className=" bg-blue-600 hover:bg-blue-500 transition-all duration-200 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold disabled:opacity-50 whitespace-nowrap text-white text-sm"
        >
          <Sparkles className="w-5 h-5" />
          {analyzing ? t('analyzing') : t('request_ai_analysis')}
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">{t('date_range')}:</span>
          </div>
          <div className="flex-1">
            <DateRangePicker
              initialDateFrom={startDate}
              initialDateTo={endDate}
              onUpdate={({ range }) => {
                if (range.from && range.to) {
                  setStartDate(range.from)
                  setEndDate(range.to)
                }
              }}
              showCompare={false}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
          <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
            {t('total_income')}
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {metrics.totalIncome.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
          <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
            {t('total_expenses')}
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {metrics.totalExpenses.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
            {t('efficiency')}
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {metrics.efficiency.toFixed(1)}%
          </p>
        </div>
        <div className={`bg-gradient-to-br p-6 rounded-xl border ${
          metrics.trend >= 0
            ? 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800'
            : 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <p className={`text-sm font-medium ${
              metrics.trend >= 0
                ? 'text-purple-700 dark:text-purple-300'
                : 'text-orange-700 dark:text-orange-300'
            }`}>
              {t('trend')}
            </p>
            {metrics.trend >= 0 ? (
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            )}
          </div>
          <p className={`text-2xl font-bold ${
            metrics.trend >= 0
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {metrics.trend >= 0 ? '+' : ''}{metrics.trend.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t('income_expense_chart')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name={t('income')} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name={t('expense')} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t('profit_chart')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`} />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
                name={t('profit')} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t('expense_by_category')}</h3>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseByCategory as any}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : '0'}%`
                  }
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              {t('no_data')}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t('income_by_category')}</h3>
          {incomeByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeByCategory as any}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : '0'}%`
                  }
                >
                  {incomeByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              {t('no_data')}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t('expenses_breakdown')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: t('fixed'), value: expensesBreakdown.fixed },
              { name: t('variable'), value: expensesBreakdown.variable },
              { name: t('salaries'), value: expensesBreakdown.salaries }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`} />
              <Bar dataKey="value" fill="#8b5cf6" name={t('amount')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t('monthly_comparison')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData.slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name={t('income')} />
              <Bar dataKey="expense" fill="#ef4444" name={t('expense')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {expenseByCategory.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('expense_categories_detail')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('category')}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('amount')}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">{t('percentage')}</th>
                </tr>
              </thead>
              <tbody>
                {expenseByCategory
                  .sort((a, b) => b.amount - a.amount)
                  .map((item, index) => {
                    const total = expenseByCategory.reduce((sum, i) => sum + i.amount, 0)
                    const percentage = (item.amount / total) * 100
                    return (
                      <tr key={index} className="border-b border-gray-200 dark:border-zinc-700">
                        <td className="px-4 py-3">{item.category}</td>
                        <td className="px-4 py-3 font-semibold">{item.amount.toLocaleString('ru-RU')} ₽</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              />
                            </div>
                            <span className="text-sm">{percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog.Root open={isAnalysisModalOpen} onOpenChange={(e) => !e.open && setIsAnalysisModalOpen(false)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="4xl" className="rounded-3xl max-h-[90vh] overflow-y-auto">
              <Dialog.Header className="flex items-center justify-between mb-4 gap-2 sticky top-0 bg-white dark:bg-zinc-900 z-10 pb-4 border-b">
                <Dialog.Title className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  {t('ai_analysis')}
                </Dialog.Title>
                <div className='flex p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all duration-200 rounded-md items-center justify-center cursor-pointer'>
                  <XIcon className="w-5 h-5" onClick={() => setIsAnalysisModalOpen(false)} />
                </div>
              </Dialog.Header>
              <Dialog.Body className="flex flex-col px-4 py-0">
                {aiAnalysis && (
                  <div className="space-y-6 prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-p:text-gray-700 dark:prose-p:text-gray-300">
                    <div className="markdown-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-gray-100">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-5 text-gray-900 dark:text-gray-100">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-gray-100">{children}</h3>,
                          h4: ({ children }) => <h4 className="text-base font-semibold mb-2 mt-3 text-gray-900 dark:text-gray-100">{children}</h4>,
                          p: ({ children, ...props }) => <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300" {...props}>{children}</p>,
                          ul: ({ children, ...props }) => <ul className="list-disc mb-4 space-y-2 ml-6 list-outside" {...props}>{children}</ul>,
                          ol: ({ children, ...props }) => <ol className="list-decimal mb-4 space-y-2 ml-6 list-outside" {...props}>{children}</ol>,
                          li: ({ children, ...props }) => <li className="mb-2 text-gray-700 dark:text-gray-300 leading-relaxed" {...props}>{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 py-2 rounded-r">
                              {children}
                            </blockquote>
                          ),
                          table: ({ children, ...props }) => (
                            <div className="overflow-x-auto my-6 -mx-2">
                              <div className="inline-block min-w-full align-middle">
                                <div className="overflow-hidden shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl bg-white dark:bg-zinc-900">
                                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
                                    {children}
                                  </table>
                                </div>
                              </div>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-zinc-800 dark:via-zinc-800 dark:to-zinc-800">
                              {children}
                            </thead>
                          ),
                          tbody: ({ children }) => (
                            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-100 dark:divide-gray-800">
                              {children}
                            </tbody>
                          ),
                          tr: ({ children }) => (
                            <tr className="hover:bg-blue-50/50 dark:hover:bg-zinc-800/70 transition-colors duration-200 even:bg-gray-50/50 dark:even:bg-zinc-900/50">
                              {children}
                            </tr>
                          ),
                          th: ({ children, ...props }) => (
                            <th className="px-3 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider border-b-2 border-gray-300 dark:border-gray-600 whitespace-nowrap" {...props}>
                              {children}
                            </th>
                          ),
                          td: ({ children, ...props }) => (
                            <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300 leading-relaxed align-top whitespace-nowrap" {...props}>
                              {children}
                            </td>
                          ),
                          code: ({ children, className }) => {
                            const isInline = !className
                            return isInline ? (
                              <code className="bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-100">
                                {children}
                              </code>
                            ) : (
                              <code className="block bg-gray-100 dark:bg-zinc-800 p-3 rounded text-sm font-mono overflow-x-auto my-3 text-gray-900 dark:text-gray-100">
                                {children}
                              </code>
                            )
                          },
                          hr: () => <hr className="my-6 border-gray-300 dark:border-gray-600" />,
                        }}
                      >
                        {aiAnalysis.summary}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </Dialog.Body>
              <Dialog.Footer className="mt-4">
                <button
                  onClick={() => setIsAnalysisModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('close')}
                </button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </div>
  )
}
