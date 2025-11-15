'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import CalendarEventsModal from './CalendarEventsModal'

interface CalendarEvent {
  id: string
  type: 'task' | 'reminder' | 'payment' | 'content'
  title: string
  date: string
  data: any
}

export default function CalendarView() {
  const t = useTranslations("dashboard")
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const res = await fetch(`/api/calendar?month=${month}&year=${year}`)
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = []
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))
    }
    return days
  }, [currentDate, adjustedFirstDay, daysInMonth])

  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {}
    events.forEach(event => {
      const dateKey = new Date(event.date).toISOString().split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    return grouped
  }, [events])

  const getEventsForDate = (date: Date | null): CalendarEvent[] => {
    if (!date) return []
    const dateKey = date.toISOString().split('T')[0]
    return eventsByDate[dateKey] || []
  }

  const isToday = (date: Date | null): boolean => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-500'
      case 'reminder': return 'bg-green-500'
      case 'payment': return 'bg-orange-500'
      case 'content': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const handleDateClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date)
      setIsModalOpen(true)
    }
  }

  const getEventsForSelectedDate = (): CalendarEvent[] => {
    if (!selectedDate) return []
    const dateKey = selectedDate.toISOString().split('T')[0]
    return eventsByDate[dateKey] || []
  }

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t('calendar')}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 rounded text-sm transition-colors"
          >
            ←
          </button>
          <h3 className="text-lg font-semibold capitalize min-w-[200px] text-center">{monthName}</h3>
          <button
            onClick={() => navigateMonth('next')}
            className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 rounded text-sm transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
            {calendarDays.map((date, idx) => {
              const dayEvents = getEventsForDate(date)
              const hasEvents = dayEvents.length > 0
              const today = isToday(date)

              return (
                <div
                  key={idx}
                  onClick={() => date && handleDateClick(date)}
                  className={`
                    min-h-[100px] p-1 border border-gray-200 dark:border-zinc-700 rounded
                    ${date ? 'bg-white dark:bg-zinc-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors' : 'bg-gray-50 dark:bg-zinc-900'}
                    ${today ? 'ring-2 ring-blue-500' : ''}
                  `}
                >
                  {date && (
                    <>
                      <div className={`text-xs font-medium mb-1 ${today ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {date.getDate()}
                      </div>
                      {hasEvents && (
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map(event => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 ${getEventColor(event.type)} text-white rounded truncate`}
                              title={event.title}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{dayEvents.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex gap-4 flex-wrap text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('tasks')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('reminders')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('payments')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('content')}</span>
            </div>
          </div>
        </>
      )}

      <CalendarEventsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate}
        events={getEventsForSelectedDate()}
      />
    </div>
  )
}

