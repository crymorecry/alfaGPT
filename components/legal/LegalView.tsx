'use client'

import { useState } from 'react'
import { Accordion, Button } from '@chakra-ui/react'
import Title from '../ui/title'
import { useTranslations } from 'next-intl'
import LegalChatModal from './LegalChatModal'

export default function LegalView() {
  const t = useTranslations("legal")
  const [isChatOpen, setIsChatOpen] = useState(false)

  const faqs = [
    { q: t('faq_1_q'), a: t('faq_1_a') },
    { q: t('faq_2_q'), a: t('faq_2_a') },
    { q: t('faq_3_q'), a: t('faq_3_a') },
    { q: t('faq_4_q'), a: t('faq_4_a') },
    { q: t('faq_5_q'), a: t('faq_5_a') },
  ]

  return (
    <div>
      <Title>Legal</Title>

      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('faq_title')}</h2>
        <div>
          <Accordion.Root>
            {faqs.map((faq, idx) => (
              <Accordion.Item key={idx} value={String(idx)} className="mb-2 border border-gray-200 dark:border-zinc-700 rounded-md overflow-hidden">
                <Accordion.ItemTrigger className="w-full p-4 bg-gray-50 dark:bg-zinc-800 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-zinc-700">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{faq.q}</p>
                  <Accordion.ItemIndicator>
                    <span className="text-gray-600 dark:text-gray-400">▼</span>
                  </Accordion.ItemIndicator>
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <Accordion.ItemBody>
                    <div className="p-4 text-gray-700 dark:text-gray-300">
                      {faq.a}
                    </div>
                  </Accordion.ItemBody>
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('not_found_message')}</p>
          <button className="bg-[#1161EF] text-white hover:bg-[#1161EF]/80 transition-all duration-200 px-4 py-2 rounded-md" onClick={() => setIsChatOpen(true)}>
            {t('open_chat')}
          </button>
        </div>
      </div>

      <LegalChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  )
}
