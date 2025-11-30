import AnalyticsView from '@/components/analytics/AnalyticsView'
import { generateMetadata } from '@/utils/seo-head'

export const metadata = generateMetadata({
  title: 'Аналитика',
  description: 'Аналитика бизнеса с графиками и ИИ анализом',
  url: '/analytics'
})

export default function AnalyticsPage() {
  return <AnalyticsView />
}

