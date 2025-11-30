'use client'

import { useState } from 'react'
import { Dialog, Portal } from '@chakra-ui/react'
import { toaster } from '@/components/ui/toaster'
import { XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { DateInput } from '@/components/ui/date-input'
import { useBusiness } from '@/components/business/BusinessProvider'
  interface PaymentFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function PaymentFormModal({ isOpen, onClose, onSuccess }: PaymentFormModalProps) {
  const [form, setForm] = useState({ date: new Date() as Date | null, contractor: '', description: '', amount: '' })
  const t = useTranslations("finance")
  const { currentBusiness } = useBusiness()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!currentBusiness) {
        toaster.create({ title: t('error'), description: t('no_business_selected') })
        return
      }

      if (!form.date) {
        toaster.create({ title: t('error'), description: t('date_required') })
        return
      }

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: currentBusiness.id,
          ...form,
          date: form.date.toISOString().split('T')[0]
        })
      })

      if (res.ok) {
        toaster.create({ title: t('success'), description: t('payment_added') })
        setForm({ date: new Date(), contractor: '', description: '', amount: '' })
        onSuccess()
        onClose()
      } else {
        toaster.create({ title: t('error'), description: t('error_adding_payment') })
      }
    } catch (error) {
      toaster.create({ title: t('error'), description: t('error_adding_payment') })
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="md" className="rounded-3xl">
            <Dialog.Header className="flex items-center justify-between mb-4 gap-2">
              <div className="flex-1 flex items-center">
                <Dialog.Title className="text-xl font-semibold">{t('add_payment')}</Dialog.Title>
              </div>
              <div className='flex p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all duration-200 rounded-md items-center justify-center cursor-pointer'>
                <XIcon className="w-5 h-5" onClick={onClose} />
              </div>
            </Dialog.Header>
            <Dialog.Body className="flex flex-col px-4 py-0">
              <form onSubmit={handleSubmit} id="payment-form">
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">{t('date')}</label>
                  <DateInput
                    value={form.date || undefined}
                    onChange={(date) => setForm({ ...form, date: date || new Date() })}
                    className="w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">{t('contractor')}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    value={form.contractor}
                    onChange={(e) => setForm({ ...form, contractor: e.target.value })}
                    required
                  />
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
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">{t('amount')}</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <button className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md" onClick={onClose}>{t('cancel_payment')}</button>
              </Dialog.ActionTrigger>
              <button className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md" type="submit" form="payment-form">{t('add_payment')}</button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
