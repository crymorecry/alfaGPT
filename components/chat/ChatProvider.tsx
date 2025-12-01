'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatContextType {
  messages: Message[]
  addMessage: (message: Message) => void
  clearMessages: () => void
  loadMessages: () => Promise<void>
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      loadMessages()
      setIsInitialized(true)
    }
  }, [isInitialized])

  const loadMessages = async () => {
    try {
      const res = await fetch('/api/chat')
      if (res.ok) {
        const dbMessages = await res.json()
        if (dbMessages.length > 0) {
          setMessages(dbMessages.map((m: any) => ({
            role: m.role,
            content: m.content
          })))
        } else {
          const welcomeMessage: Message = {
            role: 'assistant',
            content: 'Здравствуйте! Я ваш ИИ-помощник. Могу помочь с вопросами по бизнесу, финансам, маркетингу, управлению задачами и другими бизнес-задачами. Чем могу помочь?'
          }
          setMessages([welcomeMessage])
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      const welcomeMessage: Message = {
        role: 'assistant',
        content: 'Здравствуйте! Я ваш ИИ-помощник. Могу помочь с вопросами по бизнесу, финансам, маркетингу, управлению задачами и другими бизнес-задачами. Чем могу помочь?'
      }
      setMessages([welcomeMessage])
    }
  }

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
  }

  const clearMessages = async () => {
    try {
      await fetch('/api/chat', { method: 'DELETE' })
      const welcomeMessage: Message = {
        role: 'assistant',
        content: 'Здравствуйте! Я ваш ИИ-помощник. Могу помочь с вопросами по бизнесу, финансам, маркетингу, управлению задачами и другими бизнес-задачами. Чем могу помочь?'
      }
      setMessages([welcomeMessage])
    } catch (error) {
      console.error('Error clearing messages:', error)
    }
  }

  return (
    <ChatContext.Provider value={{ messages, addMessage, clearMessages, loadMessages, isOpen, setIsOpen }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

