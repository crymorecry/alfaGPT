'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@chakra-ui/react'
import { useTranslations } from 'next-intl'
import { Send, Bot, User, Trash2 } from 'lucide-react'
import { toaster } from '../ui/toaster'
import Title from '../ui/title'
import { useChat } from './ChatProvider'

export default function ChatView() {
    const t = useTranslations("chat")
    const { messages, addMessage, clearMessages } = useChat()
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

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <Title>Chat</Title>
                <button
                    onClick={handleClear}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors hover:bg-blue-700 whitespace-nowrap"
                >
                    <Trash2 className="w-4 h-4 text-white" />
                    {t('clear_chat')}
                </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
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
                                    <p className="whitespace-pre-wrap">{message.content}</p>
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
            </div>
        </div>
    )
}

