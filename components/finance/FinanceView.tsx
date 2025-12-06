'use client'

import { useState, useEffect, useMemo } from 'react'
import { useBusiness } from '@/components/business/BusinessProvider'
import { useTranslations } from 'next-intl'
import Title from '../ui/title'
import { TrendingUp, TrendingDown, Wallet, Calendar, Plus, ArrowUpRight, ArrowDownRight, Upload } from 'lucide-react'
import TransactionsView from './TransactionsView'
import RecurringExpensesView from './RecurringExpensesView'
import TransactionFormModal from './TransactionFormModal'
import ImportTransactionsModal from './ImportTransactionsModal'

interface Transaction {
  id: string
  date: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
}

interface RecurringExpense {
  id: string
  name: string
  amount: number
  frequency: 'monthly' | 'weekly' | 'yearly'
}

export default function FinanceView() {
  const t = useTranslations('finance')
  const { currentBusiness } = useBusiness()
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'recurring'>('overview')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)

  useEffect(() => {
    if (currentBusiness) {
      fetchData()
    }
  }, [currentBusiness])

  const fetchData = async () => {
    if (!currentBusiness) return
    setLoading(true)
    try {
      const [transactionsRes, expensesRes] = await Promise.all([
        fetch(`/api/transactions?businessId=${currentBusiness.id}`),
        fetch(`/api/recurring-expenses?businessId=${currentBusiness.id}`)
      ])

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData)
      }

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json()
        setRecurringExpenses(expensesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
  }, [transactions, currentMonth, currentYear])

  const income = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [monthTransactions])

  const expenses = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [monthTransactions])

  const monthlyRecurringExpenses = useMemo(() => {
    return recurringExpenses.reduce((sum, exp) => {
      switch (exp.frequency) {
        case 'monthly': return sum + exp.amount
        case 'weekly': return sum + (exp.amount * 4.33)
        case 'yearly': return sum + (exp.amount / 12)
        default: return sum
      }
    }, 0)
  }, [recurringExpenses])

  const balance = income - expenses
  const projectedBalance = balance - monthlyRecurringExpenses

  const last6Months = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const monthTransactions = transactions.filter(t => {
        const d = new Date(t.date)
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
      })
      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      months.push({
        month: date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }),
        income: monthIncome,
        expenses: monthExpenses,
        balance: monthIncome - monthExpenses
      })
    }
    return months
  }, [transactions, currentMonth, currentYear])

  const maxAmount = Math.max(
    ...last6Months.map(m => Math.max(m.income, m.expenses)),
    1
  )

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [transactions])

  if (loading) {
    return (
      <div>
        <Title>Finance</Title>
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          {t('loading')}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Title>Finance</Title>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportOpen(true)}
            className="bg-white text-[#1161EF] border border-[#1161EF]/50 hover:bg-blue-50 transition-all duration-200 px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            {t('import_data')}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1161EF] text-white hover:bg-[#1161EF]/80 transition-all duration-200 px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            {t('add_transaction')}
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-zinc-700 mb-6">
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'overview'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            onClick={() => setActiveTab('overview')}
          >
            {t('overview')}
          </button>
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'transactions'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            onClick={() => setActiveTab('transactions')}
          >
            {t('transactions')}
          </button>
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'recurring'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            onClick={() => setActiveTab('recurring')}
          >
            {t('recurring_expenses')}
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {t('income_month')}
                </span>
                <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {income.toLocaleString('ru-RU')} ₽
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  {t('expense_month')}
                </span>
                <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {expenses.toLocaleString('ru-RU')} ₽
              </p>
            </div>

            <div className={`p-6 bg-gradient-to-br rounded-xl border ${balance >= 0
              ? 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800'
              : 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${balance >= 0
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-orange-700 dark:text-orange-300'
                  }`}>
                  {t('balance')}
                </span>
                <Wallet className={`w-5 h-5 ${balance >= 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-orange-600 dark:text-orange-400'
                  }`} />
              </div>
              <p className={`text-3xl font-bold ${balance >= 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-orange-600 dark:text-orange-400'
                }`}>
                {balance.toLocaleString('ru-RU')} ₽
              </p>
            </div>

            <div className={`p-6 bg-gradient-to-br rounded-xl border ${projectedBalance >= 0
              ? 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800'
              : 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${projectedBalance >= 0
                  ? 'text-purple-700 dark:text-purple-300'
                  : 'text-red-700 dark:text-red-300'
                  }`}>
                  {t('projected_balance')}
                </span>
                <TrendingUp className={`w-5 h-5 ${projectedBalance >= 0
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-red-600 dark:text-red-400'
                  }`} />
              </div>
              <p className={`text-3xl font-bold ${projectedBalance >= 0
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-red-600 dark:text-red-400'
                }`}>
                {projectedBalance.toLocaleString('ru-RU')} ₽
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {t('after_recurring_expenses')}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">{t('last_6_months')}</h3>
            <div className="space-y-4">
              {last6Months.map((month, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{month.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-green-600 dark:text-green-400">
                        +{month.income.toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="text-red-600 dark:text-red-400">
                        -{month.expenses.toLocaleString('ru-RU')} ₽
                      </span>
                      <span className={`font-semibold ${month.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                        }`}>
                        {month.balance >= 0 ? '+' : ''}{month.balance.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 h-4">
                    <div
                      className="bg-green-500 rounded-l"
                      style={{ width: `${(month.income / maxAmount) * 100}%` }}
                    />
                    <div
                      className="bg-red-500 rounded-r"
                      style={{ width: `${(month.expenses / maxAmount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('recent_transactions')}</h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('view_all')}
                </button>
              </div>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  {t('no_transactions')}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'income'
                          ? 'bg-green-100 dark:bg-green-900/20'
                          : 'bg-red-100 dark:bg-red-900/20'
                          }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{transaction.description || transaction.category}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString('ru-RU')} • {transaction.category}
                          </p>
                        </div>
                      </div>
                      <p className={`font-semibold text-lg ${transaction.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                        }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {transaction.amount.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>  
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('recurring_expenses')}</h3>
                <button
                  onClick={() => setActiveTab('recurring')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('manage')}
                </button>
              </div>
              {recurringExpenses.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  {t('no_recurring_expenses')}
                </div>
              ) : (
                <div className="space-y-3">
                  {recurringExpenses.slice(0, 5).map((expense) => {
                    const monthlyAmount = expense.frequency === 'monthly'
                      ? expense.amount
                      : expense.frequency === 'weekly'
                        ? expense.amount * 4.33
                        : expense.amount / 12
                    return (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-700 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{expense.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t(expense.frequency)} • ~{monthlyAmount.toLocaleString('ru-RU')} ₽/мес
                          </p>
                        </div>
                        <p className="font-semibold text-red-600 dark:text-red-400">
                          {expense.amount.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                    )
                  })}
                  {recurringExpenses.length > 5 && (
                    <p className="text-sm text-center text-gray-600 dark:text-gray-400 pt-2">
                      +{recurringExpenses.length - 5} {t('more')}
                    </p>
                  )}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('total_monthly')}:
                  </span>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">
                    {monthlyRecurringExpenses.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      )}


      {activeTab === 'transactions' && (
        <TransactionsView onRefresh={fetchData} />
      )}

      {activeTab === 'recurring' && (
        <RecurringExpensesView onRefresh={fetchData} />
      )}

      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchData()
          setIsModalOpen(false)
        }}
      />
      <ImportTransactionsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          fetchData()
          setIsImportOpen(false)
        }}
      />
    </div>
  )
}
