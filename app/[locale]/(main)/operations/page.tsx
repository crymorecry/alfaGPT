import OperationsView from '@/components/operations/OperationsView'
import { generateMetadata } from '@/utils/seo-head'

export const metadata = generateMetadata({
  title: 'Операции',
  description: 'Планировщик задач и напоминаний. Управление задачами, дедлайнами и событиями для эффективной работы вашего бизнеса.',
  url: '/operations'
})

export default function OperationsPage() {
  return <OperationsView />
}

