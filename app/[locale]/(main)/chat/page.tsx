import ChatView from '@/components/chat/ChatView'
import { generateMetadata } from '@/utils/seo-head'

export const metadata = generateMetadata({
  title: 'Чат с ИИ агентом',
  description: 'Универсальный ИИ-помощник для бизнеса. Получайте советы по финансам, маркетингу, юридическим вопросам и управлению задачами.',
  url: '/chat'
})

export default function ChatPage() {
  return <ChatView />
}

