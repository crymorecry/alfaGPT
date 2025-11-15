import { generateMetadata } from '@/utils/seo-head'

export const metadata = generateMetadata({
  title: 'Акции',
  description: 'Мониторинг акций и биржи в реальном времени. Отслеживайте цены, изменения и капитализацию акций на Московской бирже.',
  url: '/stock'
})

export default function StockLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

