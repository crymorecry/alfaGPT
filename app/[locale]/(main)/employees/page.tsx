import EmployeesView from '@/components/employees/EmployeesView'
import { generateMetadata } from '@/utils/seo-head'
import Title from '@/components/ui/title'

export const metadata = generateMetadata({
  title: 'Работники',
  description: 'Управление работниками вашего бизнеса. Добавление, редактирование и удаление сотрудников.',
  url: '/employees'
})

export default function EmployeesPage() {
  return (
    <div>
      <Title>Employees</Title>
      <EmployeesView />
    </div>
  )
}

