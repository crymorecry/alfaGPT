import LegalView from '@/components/legal/LegalView'
import { generateMetadata } from '@/utils/seo-head'

export const metadata = generateMetadata({
  title: 'Юридика',
  description: 'База ответов на юридические вопросы и ИИ-помощник по праву. Помощь с налогами, регистрацией бизнеса и юридическими вопросами.',
  url: '/legal'
})

export default function LegalPage() {
  return <LegalView />
}

