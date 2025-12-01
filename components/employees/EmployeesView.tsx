'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useBusiness } from '@/components/business/BusinessProvider'
import EmployeeFormModal from './EmployeeFormModal'
import { Trash2, Edit, Calendar, InfoIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toaster } from '@/components/ui/toaster'
import { Button } from '@chakra-ui/react'
import { ToggleTip } from '@/components/ui/toggle-tip'

interface Employee {
  id: string
  name: string
  email: string | null
  phone: string | null
  position: string | null
  dailyRate: number
  workSchedule: string
  notes: string | null
}

export default function EmployeesView() {
  const t = useTranslations('employees')
  const { currentBusiness } = useBusiness()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentBusiness) {
      fetchEmployees()
    }
  }, [currentBusiness])

  const fetchEmployees = async () => {
    if (!currentBusiness) return

    setLoading(true)
    try {
      const res = await fetch(`/api/employees?businessId=${currentBusiness.id}`)
      if (res.ok) {
        const data = await res.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('delete_confirm'))) return

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toaster.create({
          title: t('success'),
          description: t('employee_deleted'),
          type: 'success'
        })
        fetchEmployees()
      } else {
        throw new Error(t('error_deleting_employee'))
      }
    } catch (error: any) {
      toaster.create({
        title: t('error'),
        description: error.message || t('error_deleting_employee'),
        type: 'error'
      })
    }
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingEmployee(null)
    setIsModalOpen(true)
  }

  if (!currentBusiness) {
    return (
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
        <p className="text-gray-600 dark:text-gray-400">{t('no_business_selected')}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
        <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('employees_list')}</h2>
        <button
          className="bg-[#1161EF] text-white hover:bg-[#1161EF]/80 transition-all duration-200 px-4 py-2 rounded-md"
          onClick={handleAdd}
        >
          {t('add_employee')}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
        {employees.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            {t('no_employees')}
          </p>
        ) : (
          <>
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="p-4 border border-gray-200 dark:border-zinc-700 rounded-xl dark:hover:bg-zinc-800 transition-all duration-200 bg-white"
              >
                <div className='flex flex-col gap-y-2 w-full'>
                  <div className="flex lg:flex-row flex-col items-start justify-between">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100  min-w-0 max-w-52 truncate">
                          {employee.name}
                        </h3>
                        {employee.position && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full border border-blue-500/40">
                            {employee.position}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                        {employee.email && (
                          <div>{t('email')}: {employee.email}</div>
                        )}
                        {employee.phone && (
                          <div>{t('phone')}: {employee.phone}</div>
                        )}
                        <div>{t('daily_rate')}: {employee.dailyRate.toLocaleString('ru-RU')} ₽</div>
                      </div>
                      {employee.notes && (
                        <ToggleTip content={<div className="text-sm text-gray-700 dark:text-gray-300">{employee.notes}</div>} >
                          <Button size="xs" variant="ghost" className="mt-2 text-sm text-gray-700 dark:text-gray-300 bg-zinc-100 w-full flex px-2 py-1 rounded-md lg:hidden justify-between">
                            <span className="text-sm ">{t('comment')}</span>
                            <InfoIcon />
                          </Button>
                        </ToggleTip>
                      )}
                    </div>
                    <div className="flex gap-2 lg:ml-4 lg:mt-0 mt-4">
                      <button
                        onClick={() => router.push(`/employees/${employee.id}`)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title={t('manage_days')}
                      >
                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded transition-colors"
                        title={t('edit')}
                      >
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                  {employee.notes && (
                    <ToggleTip content={<div className="text-sm text-gray-700 dark:text-gray-300">{employee.notes}</div>} >
                      <Button size="xs" variant="ghost" className="mt-2 text-sm text-gray-700 dark:text-gray-300 bg-zinc-100 w-full lg:flex px-2 py-1 rounded-md hidden justify-between">
                        <span className="text-sm ">{t('comment')}</span>
                        <InfoIcon />
                      </Button>
                    </ToggleTip>

                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingEmployee(null)
        }}
        onSuccess={() => {
          fetchEmployees()
          setIsModalOpen(false)
          setEditingEmployee(null)
        }}
        employee={editingEmployee}
      />
    </div>
  )
}

