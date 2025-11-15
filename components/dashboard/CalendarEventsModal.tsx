'use client'

import { Dialog, Portal } from '@chakra-ui/react'
import { useTranslations } from 'next-intl'
import { XIcon, Calendar as CalendarIcon, CheckCircle2, Clock, DollarSign, FileText } from 'lucide-react'

interface CalendarEvent {
  id: string
  type: 'task' | 'reminder' | 'payment' | 'content'
  title: string
  date: string
  data: any
}

interface CalendarEventsModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date | null
  events: CalendarEvent[]
}

export default function CalendarEventsModal({ isOpen, onClose, date, events }: CalendarEventsModalProps) {
  const t = useTranslations("dashboard")

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task': return <Clock className="w-4 h-4" />
      case 'reminder': return <CheckCircle2 className="w-4 h-4" />
      case 'payment': return <DollarSign className="w-4 h-4" />
      case 'content': return <FileText className="w-4 h-4" />
      default: return <CalendarIcon className="w-4 h-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'reminder': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      case 'payment': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
      case 'content': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'task': return t('tasks')
      case 'reminder': return t('reminders')
      case 'payment': return t('payments')
      case 'content': return t('content')
      default: return type
    }
  }

  const formatEventDetails = (event: CalendarEvent) => {
    switch (event.type) {
      case 'task':
        return `${t('priority')}: ${event.data.priority === 'high' ? t('priority_high') : event.data.priority === 'medium' ? t('priority_medium') : t('priority_low')} | ${t('status')}: ${event.data.status}`
      case 'reminder':
        return event.data.completed ? t('completed') : t('pending')
      case 'payment':
        return `${t('amount')}: ${event.data.amount}₽ | ${t('status')}: ${event.data.status === 'completed' ? t('completed') : t('pending')}`
      case 'content':
        return `${t('platform')}: ${event.data.platform}`
      default:
        return ''
    }
  }

  if (!date) return null

  const dateString = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long'
  })

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="lg" className="rounded-3xl">
            <Dialog.Header className="flex items-center justify-between gap-2">
              <div className="flex-1 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <Dialog.Title className="text-xl font-semibold">{dateString}</Dialog.Title>
              </div>
              <div className='flex p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all duration-200 rounded-md items-center justify-center cursor-pointer'>
                <XIcon className="w-5 h-5" onClick={onClose} />
              </div>
            </Dialog.Header>
            <Dialog.Body className="flex flex-col px-4 pb-4 overflow-y-auto">
              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {t('no_events')}
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getEventColor(event.type)} flex-shrink-0`}>
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded ${getEventColor(event.type)}`}>
                              {getEventTypeLabel(event.type)}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {event.title}
                          </h4>
                          {formatEventDetails(event) && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatEventDetails(event)}
                            </p>
                          )}
                          {event.type === 'content' && event.data.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                              {event.data.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

