'use client'

import { useState } from 'react'
import Title from '../ui/title'
import { useTranslations } from 'next-intl'
import PostIdeasGenerator from './PostIdeasGenerator'
import ContentCalendarView from './ContentCalendarView'

export default function MarketingView() {
  const t = useTranslations("marketing")
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div>
      <Title>Marketing</Title>

      <div className="border-b border-gray-200 dark:border-zinc-700 mb-4">
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 0
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            onClick={() => setActiveTab(0)}
          >
            {t('post_ideas')}
          </button>
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 1
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            onClick={() => setActiveTab(1)}
          >
            {t('content_calendar')}
          </button>
        </div>
      </div>

      {activeTab === 0 && <PostIdeasGenerator />}
      {activeTab === 1 && <ContentCalendarView />}
    </div>
  )
}

