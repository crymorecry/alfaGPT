'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ReminderFormModal from './ReminderFormModal'

interface Reminder {
  id: string
  title: string
  date: string
  description: string
  completed: boolean
}

export default function RemindersView() {
  const t = useTranslations("operations")
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const res = await fetch('/api/reminders')
      if (res.ok) {
        const data = await res.json()
        setReminders(data)
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
    }
  }

  const toggleReminder = async (id: string, completed: boolean) => {
    try {
      const res = await fetch('/api/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: !completed })
      })
      if (res.ok) {
        fetchReminders()
      }
    } catch (error) {
      console.error('Error updating reminder:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('reminders_events')}</h2>
        <button className="bg-[#1161EF] text-white hover:bg-[#1161EF]/80 transition-all duration-200 px-4 py-2 rounded-md" onClick={() => setIsModalOpen(true)}>{t('add_reminder')}</button>
      </div>
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
        {reminders
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((reminder) => (
            <div key={reminder.id} className="p-4 mb-3 border border-gray-200 dark:border-zinc-700 rounded-md">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={reminder.completed}
                  onChange={() => toggleReminder(reminder.id, reminder.completed)}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <p className={`font-semibold mb-1 ${reminder.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                    {reminder.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    📅 {new Date(reminder.date).toLocaleString('ru-RU')}
                  </p>
                  {reminder.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">{reminder.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      <ReminderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchReminders()
        }}
      />
    </div>
  )
}

