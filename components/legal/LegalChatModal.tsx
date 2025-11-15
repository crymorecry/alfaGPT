'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, Portal, Button } from '@chakra-ui/react'
import { useTranslations } from 'next-intl'
import { XIcon, Send } from 'lucide-react'
import { toaster } from '../ui/toaster'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface LegalChatModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function LegalChatModal({ isOpen, onClose }: LegalChatModalProps) {
    const t = useTranslations("legal")
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Здравствуйте! Я ваш юридический помощник. Задайте мне любой вопрос по праву, налогам, регистрации бизнеса или другим юридическим вопросам.'
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage: Message = { role: 'user', content: input.trim() }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/legal/chat', {
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
                setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
            } else {
                const errorData = await res.json()
                toaster.create({
                    title: t('error'),
                    description: errorData.error || t('error_chat'),
                    type: 'error'
                })
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Извините, произошла ошибка. Попробуйте еще раз.'
                }])
            }
        } catch (error) {
            console.error('Error sending message:', error)
            toaster.create({
                title: t('error'),
                description: t('error_chat'),
                type: 'error'
            })
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Извините, произошла ошибка. Попробуйте еще раз.'
            }])
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

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content maxW="2xl" className="rounded-3xl flex flex-col h-[80vh]">
                        <Dialog.Header className="flex items-center justify-between mb-4 gap-2 flex-shrink-0">
                            <div className="flex-1 flex items-center">
                                <Dialog.Title className="text-xl font-semibold">{t('chat_title')}</Dialog.Title>
                            </div>
                            <div className='flex p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all duration-200 rounded-md items-center justify-center cursor-pointer'>
                                <XIcon className="w-5 h-5" onClick={onClose} />
                            </div>
                        </Dialog.Header>
                        <Dialog.Body className="flex flex-col flex-1 overflow-hidden px-4 py-0">
                            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                                {messages.map((message, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 dark:border-gray-400"></div>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Печатает...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="flex gap-2 flex-shrink-0 pb-4">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={t('chat_placeholder')}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 resize-none min-h-[60px] max-h-[120px]"
                                    rows={2}
                                    disabled={isLoading}
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    colorScheme="blue"
                                    className="self-end"
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

