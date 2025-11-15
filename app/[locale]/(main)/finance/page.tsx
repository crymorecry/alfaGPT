import FinanceView from '@/components/finance/FinanceView'
import { generateMetadata } from '@/utils/seo-head'

export const metadata = generateMetadata({
  title: 'Финансы',
  description: 'Учет доходов, расходов и платежей. Управление финансами вашего бизнеса с удобной аналитикой и отчетностью.',
  url: '/finance'
})

export default function FinancePage() {
  return <FinanceView />
}

