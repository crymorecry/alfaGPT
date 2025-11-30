'use client'

import { useState, useEffect } from 'react'
import { useBusiness } from '@/components/business/BusinessProvider'
import { useTranslations } from 'next-intl'
import { toaster } from '@/components/ui/toaster'
import { Dialog, Portal } from '@chakra-ui/react'
import { XIcon, Plus, Edit, Trash2 } from 'lucide-react'

interface RecurringExpense {
  id: string
  name: string
  amount: number
  frequency: 'monthly' | 'weekly' | 'yearly'
  description: string | null
}

interface RecurringExpensesViewProps {
  onRefresh?: () => void
}

export default function RecurringExpensesView({ onRefresh }: RecurringExpensesViewProps = {}) {
  const t = useTranslations('finance')
  const { currentBusiness } = useBusiness()
  const [expenses, setExpenses] = useState<RecurringExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (currentBusiness) {
      fetchExpenses()
    }
  }, [currentBusiness])

  const fetchExpenses = async () => {
    if (!currentBusiness) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/recurring-expenses?businessId=${currentBusiness.id}`)
      if (res.ok) {
        const data = await res.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingExpense(null)
    setName('')
    setAmount('')
    setFrequency('monthly')
    setDescription('')
    setIsModalOpen(true)
  }

  const handleEdit = (expense: RecurringExpense) => {
    setEditingExpense(expense)
    setName(expense.name)
    setAmount(expense.amount.toString())
    setFrequency(expense.frequency)
    setDescription(expense.description || '')
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!currentBusiness) return

    if (!name.trim()) {
      toaster.create({
        title: t('error'),
        description: t('name_required'),
        type: 'error'
      })
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toaster.create({
        title: t('error'),
        description: t('amount_required'),
        type: 'error'
      })
      return
    }

    try {
      const url = editingExpense
        ? `/api/recurring-expenses/${editingExpense.id}`
        : '/api/recurring-expenses'
      
      const method = editingExpense ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: currentBusiness.id,
          name: name.trim(),
          amount: parseFloat(amount),
          frequency,
          description: description.trim() || null
        })
      })

      if (res.ok) {
        toaster.create({
          title: t('success'),
          description: editingExpense ? t('expense_updated') : t('expense_added'),
          type: 'success'
        })
        fetchExpenses()
        setIsModalOpen(false)
        onRefresh?.()
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toaster.create({
        title: t('error'),
        description: t('error_saving_expense'),
        type: 'error'
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('delete_expense_confirm'))) return

    try {
      const res = await fetch(`/api/recurring-expenses/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toaster.create({
          title: t('success'),
          description: t('expense_deleted'),
          type: 'success'
        })
        fetchExpenses()
        onRefresh?.()
      }
    } catch (error) {
      toaster.create({
        title: t('error'),
        description: t('error_deleting_expense'),
        type: 'error'
      })
    }
  }

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'monthly': return t('monthly')
      case 'weekly': return t('weekly')
      case 'yearly': return t('yearly')
      default: return freq
    }
  }

  const calculateMonthlyAmount = (expense: RecurringExpense) => {
    switch (expense.frequency) {
      case 'monthly': return expense.amount
      case 'weekly': return expense.amount * 4.33
      case 'yearly': return expense.amount / 12
      default: return expense.amount
    }
  }

  const totalMonthly = expenses.reduce((sum, exp) => sum + calculateMonthlyAmount(exp), 0)

  if (loading) {
    return <div className="text-center py-8">{t('loading')}</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">{t('recurring_expenses')}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('total_monthly')}: <span className="font-semibold text-red-600 dark:text-red-400">
              {totalMonthly.toLocaleString('ru-RU')} ₽
            </span>
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-[#1161EF] text-white hover:bg-[#1161EF]/80 transition-all duration-200 px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('add_recurring_expense')}
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          {t('no_recurring_expenses')}
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="p-4 border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-lg">{expense.name}</h4>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded">
                      {getFrequencyLabel(expense.frequency)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('amount')}: <span className="font-semibold">{expense.amount.toLocaleString('ru-RU')} ₽</span>
                    {' / '}
                    <span className="text-xs">
                      {t('monthly')}: ~{calculateMonthlyAmount(expense).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  {expense.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {expense.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded transition-colors"
                    title={t('edit')}
                  >
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog.Root open={isModalOpen} onOpenChange={(e) => !e.open && setIsModalOpen(false)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="xl" className="rounded-3xl">
              <Dialog.Header className="flex items-center justify-between mb-4 gap-2">
                <Dialog.Title className="text-xl font-semibold">
                  {editingExpense ? t('edit_recurring_expense') : t('add_recurring_expense')}
                </Dialog.Title>
                <div className='flex p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all duration-200 rounded-md items-center justify-center cursor-pointer'>
                  <XIcon className="w-5 h-5" onClick={() => setIsModalOpen(false)} />
                </div>
              </Dialog.Header>
              <Dialog.Body className="flex flex-col px-4 py-0">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('expense_name_placeholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('amount')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={t('amount_placeholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('frequency')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                    >
                      <option value="monthly">{t('monthly')}</option>
                      <option value="weekly">{t('weekly')}</option>
                      <option value="yearly">{t('yearly')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('description')}
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('description_placeholder')}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                    />
                  </div>
                </div>
              </Dialog.Body>
              <Dialog.Footer className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingExpense ? t('update') : t('add')}
                </button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </div>
  )
}

