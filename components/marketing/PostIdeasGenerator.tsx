'use client'

import { useState } from 'react'
import { Button, Select, createListCollection } from '@chakra-ui/react'
import { toaster } from '../ui/toaster'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

export default function PostIdeasGenerator() {
  const t = useTranslations("marketing")
  const [platform, setPlatform] = useState('instagram')
  const [businessType, setBusinessType] = useState('')
  const [userRequest, setUserRequest] = useState('')
  const [ideas, setIdeas] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const platformCollection = useMemo(() => createListCollection({
    items: [
      { value: 'instagram', label: 'Instagram' },
      { value: 'vk', label: 'ВКонтакте' },
      { value: 'telegram', label: 'Telegram' }
    ]
  }), [])

  const generatePostIdeas = async () => {
    if (!businessType.trim()) {
      toaster.create({ title: t('error'), description: t('business_type_required'), type: 'error' })
      return
    }

    if (!userRequest.trim()) {
      toaster.create({ title: t('error'), description: t('user_request_required'), type: 'error' })
      return
    }

    setIsGenerating(true)
    setIdeas([])

    try {
      const res = await fetch('/api/marketing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType,
          platform,
          userRequest
        })
      })

      if (res.ok) {
        const data = await res.json()
        setIdeas(data.ideas || [])
      } else {
        const errorData = await res.json()
        toaster.create({ title: t('error'), description: errorData.error || t('failed_to_generate_ideas'), type: 'error' })
      }
    } catch (error) {
      console.error('Error generating ideas:', error)
      toaster.create({ title: t('error'), description: t('failed_to_generate_ideas'), type: 'error' })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div>
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('post_ideas_title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Select.Root
              collection={platformCollection}
              value={[platform]}
              onValueChange={(e) => setPlatform(e.value[0])}
            >
              <Select.HiddenSelect />
              <Select.Label className="block mb-0.5 text-sm font-medium">{t('platform')}</Select.Label>
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
          <div>
            <label className="block mb-2 text-sm font-medium">{t('business_type')}</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              placeholder={t('business_type_placeholder')}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">{t('user_request_label')}</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 min-h-[100px]"
            value={userRequest}
            onChange={(e) => setUserRequest(e.target.value)}
            placeholder={t('user_request_placeholder')}
          />
        </div>
        <button
          onClick={generatePostIdeas}
          disabled={isGenerating || !businessType.trim() || !userRequest.trim()}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? t('generating') : t('generate_ideas')}
        </button>
      </div>

      {isGenerating && (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400">{t('generating_ideas')}</p>
            </div>
          </div>
        </div>
      )}

      {ideas.length > 0 && !isGenerating && (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {t('post_ideas_title')} {platform === 'instagram' ? t('instagram') : platform === 'vk' ? t('vk') : t('telegram')}
          </h2>
          {ideas.map((idea, idx) => (
            <div key={idx} className="p-4 mb-4 bg-gray-50 dark:bg-zinc-800 rounded-md border-l-4 border-blue-500">
              <p className="font-medium mb-2 text-gray-900 dark:text-gray-100">{t('idea')} {idx + 1}</p>
              <p className="mb-3 text-gray-700 dark:text-gray-300">{idea}</p>
              <button
                className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 rounded text-sm text-gray-900 dark:text-gray-100 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(idea)
                  toaster.create({ title: t('copied'), description: t('idea_copied_to_clipboard'), type: 'success' })
                }}
              >
                {t('copy')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

