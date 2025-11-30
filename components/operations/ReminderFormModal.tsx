'use client'

import { useState } from 'react'
import { Dialog, Portal } from '@chakra-ui/react'
import { toaster } from '@/components/ui/toaster'
import { useTranslations } from 'next-intl'
import { XIcon } from 'lucide-react'
import { useBusiness } from '@/components/business/BusinessProvider'

interface ReminderFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ReminderFormModal({ isOpen, onClose, onSuccess }: ReminderFormModalProps) {
  const t = useTranslations("operations")
  const { currentBusiness } = useBusiness()
  const [form, setForm] = useState({
    title: '',
    date: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentBusiness) {
      toaster.create({ title: t('error'), description: t('no_business_selected'), type: 'error' })
      return
    }

    if (!form.date) {
      toaster.create({ title: t('error'), description: t('date_required'), type: 'error' })
      return
    }

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: currentBusiness.id,
          ...form
        })
      })

      if (res.ok) {
        toaster.create({ title: t('success'), description: t('reminder_added'), type: 'success' })
        setForm({ title: '', date: '', description: '' })
        onSuccess()
        onClose()
      } else {
        toaster.create({ title: t('error'), description: t('failed_to_add_reminder'), type: 'error' })
      }
    } catch (error) {
      toaster.create({ title: t('error'), description: t('error_adding_reminder'), type: 'error' })
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
                <Dialog.Title className="text-xl font-semibold">{t('add_reminder')}</Dialog.Title>
              </div>
              <div className='flex p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all duration-200 rounded-md items-center justify-center cursor-pointer'>
                <XIcon className="w-5 h-5" onClick={onClose} />
              </div>
            </Dialog.Header>
            <Dialog.Body className="flex flex-col px-4 py-0">
              <form onSubmit={handleSubmit} id="reminder-form">
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">{t('reminder_title')}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">{t('date_time')}</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">{t('description')}</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 min-h-[100px]"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <button type="button" onClick={onClose} className="bg-red-500 text-white hover:bg-red-600 transition-all duration-200 px-4 py-2 rounded-md">
                {t('cancel')}
              </button>
              <button type="submit" form="reminder-form" className="bg-[#1161EF] text-white hover:bg-[#1161EF]/80 transition-all duration-200 px-4 py-2 rounded-md">
                {t('add')}
              </button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

