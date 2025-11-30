'use client'

import { useState, useRef, useEffect } from 'react'
import { Button, Dialog, Portal } from '@chakra-ui/react'
import { useTranslations } from 'next-intl'
import { Send, Bot, User, XIcon, Trash2 } from 'lucide-react'
import { toaster } from '../ui/toaster'
import { useChat } from './ChatProvider'

export default function ChatModal() {
  const t = useTranslations('chat')
  const { messages, addMessage, clearMessages, isOpen, setIsOpen } = useChat()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user' as const, content: input.trim() }
    addMessage(userMessage)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (res.ok) {
        const data = await res.json()
        addMessage({ role: 'assistant', content: data.message })
      } else {
        const errorData = await res.json()
        toaster.create({
          title: t('error'),
          description: errorData.error || t('error_chat'),
          type: 'error'
        })
        addMessage({
          role: 'assistant',
          content: t('error_message')
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toaster.create({
        title: t('error'),
        description: t('error_chat'),
        type: 'error'
      })
      addMessage({
        role: 'assistant',
        content: t('error_message')
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    if (confirm(t('clear_chat_confirm'))) {
      clearMessages()
      toaster.create({
        title: t('success'),
        description: t('chat_cleared'),
        type: 'success'
      })
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="2xl" className="rounded-3xl flex flex-col h-[80vh] max-h-[800px]">
            <Dialog.Header className="flex items-center justify-between mb-0 pb-4 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-semibold">
                    {t('title')}
                  </Dialog.Title>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClear}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  title={t('clear_chat')}
                >
                  <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <div className='flex p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 rounded-lg items-center justify-center cursor-pointer'>
                  <XIcon className="w-5 h-5" onClick={() => setIsOpen(false)} />
                </div>
              </div>
            </Dialog.Header>
            <Dialog.Body className="flex-1 overflow-hidden flex flex-col p-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 dark:border-gray-400"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{t('typing')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-gray-200 dark:border-zinc-700 p-4 flex gap-2 flex-shrink-0">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('placeholder')}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 resize-none min-h-[60px] max-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  colorScheme="blue"
                  className="self-end px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

