'use client'

import { useState, useEffect, useMemo } from 'react'
import { Badge, Button, Select, createListCollection } from '@chakra-ui/react'
import { Payment } from './types'
import PaymentFormModal from './PaymentFormModal'
import { useTranslations } from 'next-intl'
import { toaster } from '@/components/ui/toaster'
import { XIcon } from 'lucide-react'
export default function PaymentsView() {
  const t = useTranslations("finance")
  const [payments, setPayments] = useState<Payment[]>([])
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const statusCollection = useMemo(() => createListCollection({
    items: [
      { value: 'all', label: t('all_statuses') },
      { value: 'pending', label: t('pending') },
      { value: 'completed', label: t('completed') }
    ]
  }), [t])

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [filterPaymentStatus])

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams()
      if (filterPaymentStatus !== 'all') params.append('status', filterPaymentStatus)
      
      const res = await fetch(`/api/payments?${params}`)
      if (res.ok) {
        const data = await res.json()
        setPayments(data)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    }
  }

  const completePayment = async (id: string) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'completed' })
      })
      if (res.ok) {
        toaster.create({ title: t('success'), description: t('payment_completed') })
        fetchPayments()
      }
    } catch (error) {
      toaster.create({ title: t('error'), description: t('error_updating_payment') })
    }
  }

  const deletePayment = async (id: string) => {
    try {
      const res = await fetch(`/api/payments?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toaster.create({ title: t('success'), description: t('payment_deleted') })
        fetchPayments()
      }
    } catch (error) {
      toaster.create({ title: t('error'), description: t('error_deleting_payment') })
    }
  }

  return (
    <div>
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('payments_reminders')}</h2>
          <button className="bg-[#1161EF] text-white hover:bg-[#1161EF]/80 transition-all duration-200 px-4 py-2 rounded-md" onClick={() => setIsModalOpen(true)}>{t('add_payment')}</button>
        </div>
        <div className="mb-4 max-w-md">
          <Select.Root
            collection={statusCollection}
            value={[filterPaymentStatus]}
            onValueChange={(e) => setFilterPaymentStatus(e.value[0])}
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
                  <Select.ItemText>{t('all_statuses')}</Select.ItemText>
                </Select.Item>
                <Select.Item item="pending">
                  <Select.ItemText>{t('pending')}</Select.ItemText>
                </Select.Item>
                <Select.Item item="completed">
                  <Select.ItemText>{t('completed')}</Select.ItemText>
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
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('contractor')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('description')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('amount')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('status')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <td className="px-4 py-3">{new Date(p.date).toLocaleDateString('ru-RU')}</td>
                  <td className="px-4 py-3">{p.contractor}</td>
                  <td className="px-4 py-3">{p.description}</td>
                  <td className="px-4 py-3 font-semibold">{p.amount.toLocaleString('ru-RU')} ₽</td>
                  <td className="px-4 py-3">
                    <div className={`${p.status === 'completed' ? 'text-green-500' : 'text-orange-500'} px-2 py-1 rounded-md`}>
                      {p.status === 'completed' ? t('completed') : t('pending')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {p.status === 'pending' && (
                        <button className="bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-md" onClick={() => completePayment(p.id)}>✓</button>
                      )}
                      <button className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md" onClick={() => deletePayment(p.id)}><XIcon className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchPayments}
      />
    </div>
  )
}

