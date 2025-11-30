'use client'

import { useState, useMemo } from 'react'
import { Dialog, Portal, Select, createListCollection } from '@chakra-ui/react'
import { toaster } from '@/components/ui/toaster'
import { useTranslations } from 'next-intl'
import { XIcon } from 'lucide-react'
import { DateInput } from '@/components/ui/date-input'
import { useBusiness } from '@/components/business/BusinessProvider'

interface TaskFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function TaskFormModal({ isOpen, onClose, onSuccess }: TaskFormModalProps) {
  const t = useTranslations("operations")
  const { currentBusiness } = useBusiness()
  const [form, setForm] = useState({
    title: '',
    priority: 'medium',
    deadline: new Date() as Date | null
  })

  const priorityCollection = useMemo(() => createListCollection({
    items: [
      { value: 'low', label: t('priority_low') },
      { value: 'medium', label: t('priority_medium') },
      { value: 'high', label: t('priority_high') }
    ]
  }), [t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentBusiness) {
      toaster.create({ title: t('error'), description: t('no_business_selected'), type: 'error' })
      return
    }

    if (!form.deadline) {
      toaster.create({ title: t('error'), description: t('deadline_required'), type: 'error' })
      return
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: currentBusiness.id,
          ...form,
          deadline: form.deadline.toISOString().split('T')[0]
        })
      })

      if (res.ok) {
        toaster.create({ title: t('success'), description: t('task_added'), type: 'success' })
        setForm({ title: '', priority: 'medium', deadline: new Date() })
        onSuccess()
        onClose()
      } else {
        toaster.create({ title: t('error'), description: t('failed_to_add_task'), type: 'error' })
      }
    } catch (error) {
      toaster.create({ title: t('error'), description: t('error_adding_task'), type: 'error' })
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
                <Dialog.Title className="text-xl font-semibold">{t('add_task')}</Dialog.Title>
              </div>
              <div className='flex p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all duration-200 rounded-md items-center justify-center cursor-pointer'>
                <XIcon className="w-5 h-5" onClick={onClose} />
              </div>
            </Dialog.Header>
            <Dialog.Body className="flex flex-col px-4 py-0">
              <form onSubmit={handleSubmit} id="task-form">
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">{t('task_title')}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <Select.Root
                    collection={priorityCollection}
                    value={[form.priority]}
                    onValueChange={(e) => setForm({ ...form, priority: e.value[0] })}
                  >
                    <Select.HiddenSelect />
                    <Select.Label className="block mb-2 text-sm font-medium">{t('priority')}</Select.Label>
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
                        <Select.Item item="low">
                          <Select.ItemText>{t('priority_low')}</Select.ItemText>
                        </Select.Item>
                        <Select.Item item="medium">
                          <Select.ItemText>{t('priority_medium')}</Select.ItemText>
                        </Select.Item>
                        <Select.Item item="high">
                          <Select.ItemText>{t('priority_high')}</Select.ItemText>
                        </Select.Item>
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">{t('deadline')}</label>
                  <DateInput
                    value={form.deadline || undefined}
                    onChange={(date) => setForm({ ...form, deadline: date || new Date() })}
                    className="w-full"
                  />
                </div>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <button type="button" onClick={onClose} className="bg-red-500 text-white hover:bg-red-600 transition-all duration-200 px-4 py-2 rounded-md">
                {t('cancel')}
              </button>
              <button type="submit" form="task-form" className="bg-[#1161EF] text-white hover:bg-[#1161EF]/80 transition-all duration-200 px-4 py-2 rounded-md">
                {t('add')}
              </button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

