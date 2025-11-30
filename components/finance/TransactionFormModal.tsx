'use client'

import { useState, useMemo } from 'react'
import { Button, CloseButton, Dialog, Portal, Select, createListCollection } from '@chakra-ui/react'
import { toaster } from '@/components/ui/toaster'
import { useTranslations } from 'next-intl'
import { XIcon } from 'lucide-react'
import { DateInput } from '@/components/ui/date-input'
import { useBusiness } from '@/components/business/BusinessProvider'
interface TransactionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function TransactionFormModal({ isOpen, onClose, onSuccess }: TransactionFormModalProps) {
  const t = useTranslations("finance")
  const { currentBusiness } = useBusiness()

  const [form, setForm] = useState({
    date: new Date(),
    category: 'Продажи',
    type: 'income',
    amount: '',
    description: ''
  })

  const categoryCollection = useMemo(() => createListCollection({
    items: [
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
      { value: 'income', label: t('income') },
      { value: 'expense', label: t('expense') }
    ]
  }), [t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentBusiness) {
      toaster.create({ title: t('error'), description: t('no_business_selected') })
      return
    }
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: form.date.toISOString().split('T')[0],
          businessId: currentBusiness.id
        })
      })

      if (res.ok) {
        toaster.create({ title: t('success'), description: t('transaction_added') })
        setForm({
          date: new Date(),
          category: 'Продажи',
          type: 'income',
          amount: '',
          description: ''
        })
        onSuccess()
        onClose()
      } else {
        toaster.create({ title: t('error'), description: t('failed_to_add_transaction') })
      }
    } catch (error) {
      toaster.create({ title: t('error'), description: t('error_adding_transaction') })
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="2xl" className="rounded-3xl">
            <Dialog.Header className="flex items-center justify-between mb-4 gap-2">
              <div className="flex-1 flex items-center">
                <Dialog.Title className="text-xl font-semibold">{t('add_transaction')}</Dialog.Title>
              </div>
              <div className='flex p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all duration-200 rounded-md items-center justify-center cursor-pointer'>
                <XIcon className="w-5 h-5" onClick={onClose} />
              </div>
            </Dialog.Header>
            <Dialog.Body className="flex flex-col px-4 py-0">
              <form onSubmit={handleSubmit} id="transaction-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">{t('date')}</label>
                    <DateInput
                      value={form.date}
                      onChange={(date) => setForm({ ...form, date: date || new Date() })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Select.Root
                      collection={categoryCollection}
                      value={[form.category]}
                      onValueChange={(e) => setForm({ ...form, category: e.value[0] })}
                    >
                      <Select.HiddenSelect />
                      <Select.Label className="block text-sm font-medium">{t('category')}</Select.Label>
                      <Select.Control>
                        <Select.Trigger className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-zinc-600">
                          <Select.ValueText />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
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
                  </div>
                  <div>
                    <Select.Root
                      collection={typeCollection}
                      value={[form.type]}
                      onValueChange={(e) => setForm({ ...form, type: e.value[0] })}
                    >
                      <Select.HiddenSelect />
                      <Select.Label className="block text-sm font-medium">{t('type')}</Select.Label>
                      <Select.Control>
                        <Select.Trigger className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-zinc-600">
                          <Select.ValueText />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
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
                  <div>
                    <label className="block mb-2 text-sm font-medium">{t('amount')}</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">{t('description')}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" onClick={onClose} className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md">{t('cancel_transaction')}</Button>
              </Dialog.ActionTrigger>
              <Button type="submit" form="transaction-form" className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md">{t('add')}</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

