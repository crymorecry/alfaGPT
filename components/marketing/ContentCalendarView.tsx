'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@chakra-ui/react'
import { useTranslations } from 'next-intl'
import ContentFormModal from './ContentFormModal'
import { toaster } from '../ui/toaster'
import { Trash2 } from 'lucide-react'

interface ContentPost {
  id: string
  date: string
  platform: string
  type: string
  description: string
}

export default function ContentCalendarView() {
  const t = useTranslations("marketing")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const res = await fetch(`/api/content-calendar?month=${month}&year=${year}`)
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      toaster.create({ title: t('error'), description: t('error_loading_posts'), type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [currentDate])

  const handleDelete = async (id: string) => {
    if (!confirm(t('delete_post_confirm'))) return

    try {
      const res = await fetch(`/api/content-calendar?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toaster.create({ title: t('success'), description: t('post_deleted'), type: 'success' })
        fetchPosts()
      } else {
        toaster.create({ title: t('error'), description: t('error_deleting_post'), type: 'error' })
      }
    } catch (error) {
      toaster.create({ title: t('error'), description: t('error_deleting_post'), type: 'error' })
    }
  }

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

  const postsByDate = useMemo(() => {
    const grouped: Record<string, ContentPost[]> = {}
    posts.forEach(post => {
      const dateKey = new Date(post.date).toISOString().split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(post)
    })
    return grouped
  }, [posts])

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

  const getPostsForDate = (date: Date | null): ContentPost[] => {
    if (!date) return []
    const dateKey = date.toISOString().split('T')[0]
    return postsByDate[dateKey] || []
  }

  const isToday = (date: Date | null): boolean => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div>
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('content_calendar_title')}</h2>
          <Button colorScheme="blue" onClick={() => setIsModalOpen(true)}>{t('add_post')}</Button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 rounded text-sm transition-colors"
            >
              ←
            </button>
            <h3 className="text-lg font-semibold capitalize">{monthName}</h3>
            <button
              onClick={() => navigateMonth('next')}
              className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 rounded text-sm transition-colors"
            >
              →
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
              {calendarDays.map((date, idx) => {
                const dayPosts = getPostsForDate(date)
                const hasPosts = dayPosts.length > 0
                const today = isToday(date)

                return (
                  <div
                    key={idx}
                    className={`
                      min-h-[80px] p-1 border border-gray-200 dark:border-zinc-700 rounded
                      ${date ? 'bg-white dark:bg-zinc-800' : 'bg-gray-50 dark:bg-zinc-900'}
                      ${today ? 'ring-2 ring-blue-500' : ''}
                      ${hasPosts ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                    `}
                  >
                    {date && (
                      <>
                        <div className={`text-xs font-medium mb-1 ${today ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {date.getDate()}
                        </div>
                        {hasPosts && (
                          <div className="space-y-1">
                            {dayPosts.slice(0, 2).map(post => (
                              <div
                                key={post.id}
                                className="text-xs p-1 bg-blue-100 dark:bg-blue-800/30 rounded truncate"
                                title={post.description}
                              >
                                {post.platform}
                              </div>
                            ))}
                            {dayPosts.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                +{dayPosts.length - 2}
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
          )}
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{t('posts')}</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : posts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">{t('content_calendar_description')}</p>
        ) : (
          <div className="space-y-4">
            {posts
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(post => (
                <div
                  key={post.id}
                  className="p-4 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {new Date(post.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                          {post.platform}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded">
                          {post.type === 'text' ? t('text') : post.type === 'image' ? t('image') : t('video')}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{post.description}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="ml-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <ContentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchPosts()
        }}
      />
    </div>
  )
}

