import MarketingView from '@/components/marketing/MarketingView'
import { generateMetadata } from '@/utils/seo-head'

export const metadata = generateMetadata({
  title: 'Маркетинг',
  description: 'Генерация идей для контента и контент-план. ИИ-помощник для создания постов и планирования публикаций в социальных сетях.',
  url: '/marketing'
})

export default function MarketingPage() {
  return <MarketingView />
}

