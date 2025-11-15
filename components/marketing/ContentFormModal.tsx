'use client'

import { useState, useMemo } from 'react'
import { Button, CloseButton, Dialog, Portal, Select, createListCollection } from '@chakra-ui/react'
import { toaster } from '@/components/ui/toaster'
import { useTranslations } from 'next-intl'
import { XIcon } from 'lucide-react'
import { DateInput } from '@/components/ui/date-input'

interface ContentFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ContentFormModal({ isOpen, onClose, onSuccess }: ContentFormModalProps) {
  const t = useTranslations("marketing")
  const [form, setForm] = useState({
    date: new Date() as Date | null,
    platform: 'instagram',
    type: 'text',
    description: ''
  })

  const platformCollection = useMemo(() => createListCollection({
    items: [
      { value: 'instagram', label: 'Instagram' },
      { value: 'vk', label: 'ВКонтакте' },
      { value: 'telegram', label: 'Telegram' }
    ]
  }), [])

  const contentTypeCollection = useMemo(() => createListCollection({
    items: [
      { value: 'text', label: t('text') },
      { value: 'image', label: t('image') },
      { value: 'video', label: t('video') }
    ]
  }), [t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.date) {
      toaster.create({ title: t('error'), description: 'Дата обязательна', type: 'error' })
      return
    }

    try {
      const res = await fetch('/api/content-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: form.date.toISOString().split('T')[0]
        })
      })

      if (res.ok) {
        toaster.create({ title: t('success'), description: t('post_added_to_calendar'), type: 'success' })
        setForm({ date: new Date(), platform: 'instagram', type: 'text', description: '' })
        onSuccess()
        onClose()
      } else {
        toaster.create({ title: t('error'), description: t('failed_to_add_post'), type: 'error' })
      }
    } catch (error) {
      toaster.create({ title: t('error'), description: t('failed_to_add_post'), type: 'error' })
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
                <Dialog.Title className="text-xl font-semibold">{t('add_post_to_calendar')}</Dialog.Title>
              </div>
              <div className='flex p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all duration-200 rounded-md items-center justify-center cursor-pointer'>
                <XIcon className="w-5 h-5" onClick={onClose} />
              </div>
            </Dialog.Header>
            <Dialog.Body className="flex flex-col px-4 py-0">
              <form onSubmit={handleSubmit} id="content-form">
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">{t('publication_date')}</label>
                  <DateInput
                    value={form.date || undefined}
                    onChange={(date) => setForm({ ...form, date: date || new Date() })}
                    className="w-full"
                  />
                </div>
                <div className="mb-4">
                  <Select.Root
                    collection={platformCollection}
                    value={[form.platform]}
                    onValueChange={(e) => setForm({ ...form, platform: e.value[0] })}
                  >
                    <Select.HiddenSelect />
                    <Select.Label className="block mb-2 text-sm font-medium">{t('platform')}</Select.Label>
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
                        <Select.Item item="instagram">
                          <Select.ItemText>Instagram</Select.ItemText>
                        </Select.Item>
                        <Select.Item item="vk">
                          <Select.ItemText>ВКонтакте</Select.ItemText>
                        </Select.Item>
                        <Select.Item item="telegram">
                          <Select.ItemText>Telegram</Select.ItemText>
                        </Select.Item>
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                </div>
                <div className="mb-4">
                  <Select.Root
                    collection={contentTypeCollection}
                    value={[form.type]}
                    onValueChange={(e) => setForm({ ...form, type: e.value[0] })}
                  >
                    <Select.HiddenSelect />
                    <Select.Label className="block mb-2 text-sm font-medium">{t('content_type')}</Select.Label>
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
                        <Select.Item item="text">
                          <Select.ItemText>{t('text')}</Select.ItemText>
                        </Select.Item>
                        <Select.Item item="image">
                          <Select.ItemText>{t('image')}</Select.ItemText>
                        </Select.Item>
                        <Select.Item item="video">
                          <Select.ItemText>{t('video')}</Select.ItemText>
                        </Select.Item>
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">{t('description')}</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 min-h-[100px]"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={onClose} className="px-4 py-2 rounded-md">
                {t('cancel')}
              </Button>
              <Button type="submit" form="content-form" colorScheme="blue" className="px-4 py-2 rounded-md">
                {t('add')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

