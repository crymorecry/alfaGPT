'use client'

import { useState, useEffect, useMemo } from 'react'
import { Select, createListCollection } from '@chakra-ui/react'
import { Transaction } from './types'
import TransactionFormModal from './TransactionFormModal'
import { useTranslations } from 'next-intl'
import { XIcon } from 'lucide-react'
import { toaster } from '@/components/ui/toaster'
import { useBusiness } from '@/components/business/BusinessProvider'

interface TransactionsViewProps {
  onRefresh?: () => void
}

export default function TransactionsView({ onRefresh }: TransactionsViewProps = {}) {
  const t = useTranslations("finance")
  const { currentBusiness } = useBusiness()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const categoryCollection = useMemo(() => createListCollection({
    items: [
      { value: 'all', label: t('all_categories') },
      { value: 'Продажи', label: t('sales') },
      { value: 'Зарплата', label: t('salary') },
      { value: 'Маркетинг', label: t('marketing') },
      { value: 'Оборудование', label: t('equipment') },
      { value: 'Коммунальные', label: t('utilities') },
      { value: 'Прочие', label: t('other') }
    ]
  }), [t])

  const typeCollection = useMemo(() => createListCollection({
    items: [
      { value: 'all', label: t('all_types') },
      { value: 'income', label: t('income') },
      { value: 'expense', label: t('expense') }
    ]
  }), [t])

  useEffect(() => {
    if (currentBusiness) {
      fetchTransactions()
    }
  }, [currentBusiness])

  useEffect(() => {
    if (currentBusiness) {
      fetchTransactions()
    }
  }, [filterCategory, filterType, currentBusiness])

  const fetchTransactions = async () => {
    if (!currentBusiness) return
    try {
      const params = new URLSearchParams()
      params.append('businessId', currentBusiness.id)
      if (filterCategory !== 'all') params.append('category', filterCategory)
      if (filterType !== 'all') params.append('type', filterType)
      
      const res = await fetch(`/api/transactions?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toaster.create({ title: t('success'), description: t('transaction_deleted') })
        fetchTransactions()
      }
    } catch (error) {
      toaster.create({ title: t('error'), description: t('error_deleting_transaction') })
    }
  }

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthTransactions = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })
  
  const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = income - expense

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between lg:items-center gap-4">
        <h2 className="text-2xl font-semibold">{t('finance_transactions')}</h2>
        <button className="bg-[#1161EF] text-white hover:bg-[#1161EF]/80 transition-all duration-200 px-4 py-2 rounded-md lg:w-fit w-full" onClick={() => setIsModalOpen(true)}>{t('add_transaction')}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('income_month')}</p>
          <p className="text-2xl font-semibold text-green-500">{income.toLocaleString('ru-RU')} ₽</p>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('expense_month')}</p>
          <p className="text-2xl font-semibold text-red-500">{expense.toLocaleString('ru-RU')} ₽</p>
        </div>
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('balance')}</p>
          <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {balance.toLocaleString('ru-RU')} ₽
          </p>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{t('transaction_history')}</h2>
        <div className="flex gap-4 mb-4 max-w-md">
          <Select.Root
            collection={categoryCollection}
            value={[filterCategory]}
            onValueChange={(e) => setFilterCategory(e.value[0])}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-zinc-600">
                <Select.ValueText />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                <Select.Item item="all">
                  <Select.ItemText>{t('all_categories')}</Select.ItemText>
                </Select.Item>
                <Select.Item item="Продажи">
                  <Select.ItemText>{t('sales')}</Select.ItemText>
                </Select.Item>
                <Select.Item item="Зарплата">
                  <Select.ItemText>{t('salary')}</Select.ItemText>
                </Select.Item>
                <Select.Item item="Маркетинг">
                  <Select.ItemText>{t('marketing')}</Select.ItemText>
                </Select.Item>
                <Select.Item item="Оборудование">
                  <Select.ItemText>{t('equipment')}</Select.ItemText>
                </Select.Item>
                <Select.Item item="Коммунальные">
                  <Select.ItemText>{t('utilities')}</Select.ItemText>
                </Select.Item>
                <Select.Item item="Прочие">
                  <Select.ItemText>{t('other')}</Select.ItemText>
                </Select.Item>
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
          <Select.Root
            collection={typeCollection}
            value={[filterType]}
            onValueChange={(e) => setFilterType(e.value[0])}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-zinc-600">
                <Select.ValueText />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                <Select.Item item="all">
                  <Select.ItemText>{t('all_types')}</Select.ItemText>
                </Select.Item>
                <Select.Item item="income">
                  <Select.ItemText>{t('income')}</Select.ItemText>
                </Select.Item>
                <Select.Item item="expense">
                  <Select.ItemText>{t('expense')}</Select.ItemText>
                </Select.Item>
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('date')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('category')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('description')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('type')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('amount')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((m) => (
                <tr key={m.id} className="border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <td className="px-4 py-3">{new Date(m.date).toLocaleDateString('ru-RU')}</td>
                  <td className="px-4 py-3">{m.category}</td>
                  <td className="px-4 py-3">{m.description}</td>
                  <td className="px-4 py-3">
                    <div className={`${m.type === 'income' ? 'text-green-500' : 'text-red-500'} px-2 py-1 rounded-md`}>
                      {m.type === 'income' ? t('income') : t('expense')}
                    </div>
                  </td>
                  <td className={`px-4 py-3 font-semibold ${m.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {m.amount.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-4 py-3">
                    <button className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md" onClick={() => deleteTransaction(m.id)}><XIcon className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          fetchTransactions()
          onRefresh?.()
        }}
      />
    </div>
  )
}

