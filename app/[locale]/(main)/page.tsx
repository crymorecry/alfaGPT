import DashboardView from '@/components/dashboard/DashboardView'
import { generateMetadata } from '@/utils/seo-head'

export const metadata = generateMetadata({
  title: 'Главная',
  description: 'Alfa Copilot — универсальный бизнес-помощник с ИИ. Управление финансами, работники, задачи и аналитика в одном месте.',
  url: '/'
})

export default function Home() {
  return <DashboardView />
}
