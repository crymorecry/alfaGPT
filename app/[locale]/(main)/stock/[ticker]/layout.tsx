import { generateMetadata as generateSEOMetadata } from '@/utils/seo-head'

export async function generateMetadata({ params }: { params: { ticker: string } }) {
  const ticker = params.ticker.toUpperCase()
  return generateSEOMetadata({
    title: `Акция ${ticker}`,
    description: `Детальная информация об акции ${ticker}: цена, график, капитализация, объем торгов и другая аналитика.`,
    url: `/stock/${ticker}`
  })
}

export default function StockDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

