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
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const STORAGE_KEY = 'chat_messages'

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed)
          } else {
            const welcomeMessage: Message = {
              role: 'assistant',
              content: 'Здравствуйте! Я ваш ИИ-помощник. Могу помочь с вопросами по бизнесу, финансам, маркетингу, управлению задачами и другими бизнес-задачами. Чем могу помочь?'
            }
            setMessages([welcomeMessage])
          }
        } else {
          const welcomeMessage: Message = {
            role: 'assistant',
            content: 'Здравствуйте! Я ваш ИИ-помощник. Могу помочь с вопросами по бизнесу, финансам, маркетингу, управлению задачами и другими бизнес-задачами. Чем могу помочь?'
          }
          setMessages([welcomeMessage])
        }
      } catch (error) {
        console.error('Error loading chat messages:', error)
        const welcomeMessage: Message = {
          role: 'assistant',
          content: 'Здравствуйте! Я ваш ИИ-помощник. Могу помочь с вопросами по бизнесу, финансам, маркетингу, управлению задачами и другими бизнес-задачами. Чем могу помочь?'
        }
        setMessages([welcomeMessage])
      }
      setIsInitialized(true)
    }
  }, [isInitialized])

  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      } catch (error) {
        console.error('Error saving chat messages:', error)
      }
    }
  }, [messages, isInitialized])

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
  }

  const clearMessages = () => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: 'Здравствуйте! Я ваш ИИ-помощник. Могу помочь с вопросами по бизнесу, финансам, маркетингу, управлению задачами и другими бизнес-задачами. Чем могу помочь?'
    }
    setMessages([welcomeMessage])
  }

  return (
    <ChatContext.Provider value={{ messages, addMessage, clearMessages, isOpen, setIsOpen }}>
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

