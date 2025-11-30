'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, Portal } from '@chakra-ui/react'
import { XIcon } from 'lucide-react'
import { toaster } from '@/components/ui/toaster'
import { DateInput } from '@/components/ui/date-input'

interface EmployeeDay {
  id: string
  date: string
  type: 'sick' | 'vacation_paid' | 'vacation_unpaid' | 'work_override'
  notes: string | null
}

interface Employee {
  id: string
  name: string
  dailyRate: number
  workSchedule: string
}

interface EmployeeDaysViewProps {
  employee: Employee
}

function isWorkDayBySchedule(date: Date, schedule: string): boolean {
  const [workDays, restDays] = schedule.split('/').map(Number)
  const totalCycle = workDays + restDays
  
  const referenceDate = new Date(2024, 0, 1) 
  const dayOfWeek = referenceDate.getDay()
  const daysToMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7
  const firstMonday = new Date(referenceDate)
  firstMonday.setDate(referenceDate.getDate() + daysToMonday)
  
  const daysDiff = Math.floor((date.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24))
  
  const normalizedDiff = ((daysDiff % totalCycle) + totalCycle) % totalCycle
  
  return normalizedDiff < workDays
}

export default function EmployeeDaysView({ employee }: EmployeeDaysViewProps) {
  const t = useTranslations('employees')
  const [days, setDays] = useState<EmployeeDay[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dayType, setDayType] = useState<'sick' | 'vacation_paid' | 'vacation_unpaid' | 'work_override'>('sick')
  const [dayNotes, setDayNotes] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDays()
  }, [selectedMonth, selectedYear, employee.id])

  const fetchDays = async () => {
    setLoading(true)
    try {
      const monthStr = String(selectedMonth).padStart(2, '0')
      const res = await fetch(`/api/employees/${employee.id}/days?month=${monthStr}&year=${selectedYear}`)
      if (res.ok) {
        const data = await res.json()
        setDays(data)
      }
    } catch (error) {
      console.error('Error fetching days:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDayClick = (date: Date) => {
    const dayStr = date.toISOString().split('T')[0]
    const existingDay = days.find(d => d.date.startsWith(dayStr))
    
    if (existingDay) {
      setSelectedDate(date)
      setDayType(existingDay.type)
      setDayNotes(existingDay.notes || '')
    } else {
      setSelectedDate(date)
      setDayType('sick')
      setDayNotes('')
    }
    setIsModalOpen(true)
  }

  const handleSaveDay = async () => {
    if (!selectedDate) return

    try {
      const res = await fetch(`/api/employees/${employee.id}/days`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          type: dayType,
          notes: dayNotes.trim() || null
        })
      })

      if (res.ok) {
        toaster.create({
          title: t('success'),
          description: t('day_saved'),
          type: 'success'
        })
        fetchDays()
        setIsModalOpen(false)
        setSelectedDate(null)
        setDayNotes('')
      } else {
        throw new Error(t('error_saving_day'))
      }
    } catch (error: any) {
      toaster.create({
        title: t('error'),
        description: error.message || t('error_saving_day'),
        type: 'error'
      })
    }
  }

  const handleDeleteDay = async (date: string) => {
    if (!confirm(t('delete_day_confirm'))) return

    try {
      const res = await fetch(`/api/employees/${employee.id}/days?date=${date}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toaster.create({
          title: t('success'),
          description: t('day_deleted'),
          type: 'success'
        })
        fetchDays()
      } else {
        throw new Error(t('error_deleting_day'))
      }
    } catch (error: any) {
      toaster.create({
        title: t('error'),
        description: error.message || t('error_deleting_day'),
        type: 'error'
      })
    }
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay()
  }

  const getDayDisplayType = (date: Date): 'work' | 'dayoff' | 'sick' | 'vacation_paid' | 'vacation_unpaid' | 'work_override' => {
    const dayStr = date.toISOString().split('T')[0]
    const exception = days.find(d => d.date.startsWith(dayStr))
    
    if (exception) {
      if (exception.type === 'work_override') return 'work_override'
      if (exception.type === 'sick') return 'sick'
      if (exception.type === 'vacation_paid') return 'vacation_paid'
      if (exception.type === 'vacation_unpaid') return 'vacation_unpaid'
    }
    
    return isWorkDayBySchedule(date, employee.workSchedule) ? 'work' : 'dayoff'
  }

  const calculateSalary = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
    let workDays = 0
    let paidVacationDays = 0

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth - 1, day)
      const dayStr = date.toISOString().split('T')[0]
      const exception = days.find(d => d.date.startsWith(dayStr))
      
      if (exception) {
        if (exception.type === 'work_override') {
          workDays++
        } else if (exception.type === 'vacation_paid') {
          paidVacationDays++
        }
      } else {
        if (isWorkDayBySchedule(date, employee.workSchedule)) {
          workDays++
        }
      }
    }

    return (workDays + paidVacationDays) * employee.dailyRate
  }

  const getDayTypeColor = (type: string) => {
    switch (type) {
      case 'work':
      case 'work_override':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
      case 'dayoff':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
      case 'sick':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
      case 'vacation_paid':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
      case 'vacation_unpaid':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700'
      default:
        return 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
    }
  }

  const getDayTypeLabel = (type: string) => {
    switch (type) {
      case 'work': return t('work_day')
      case 'dayoff': return t('dayoff')
      case 'sick': return t('sick')
      case 'vacation_paid': return t('vacation_paid')
      case 'vacation_unpaid': return t('vacation_unpaid')
      case 'work_override': return t('work_override')
      default: return ''
    }
  }

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear)
  
  let workDaysCount = 0
  let dayoffDaysCount = 0
  let sickDaysCount = 0
  let vacationPaidCount = 0
  let vacationUnpaidCount = 0

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(selectedYear, selectedMonth - 1, day)
    const displayType = getDayDisplayType(date)
    
    switch (displayType) {
      case 'work':
      case 'work_override':
        workDaysCount++
        break
      case 'dayoff':
        dayoffDaysCount++
        break
      case 'sick':
        sickDaysCount++
        break
      case 'vacation_paid':
        vacationPaidCount++
        break
      case 'vacation_unpaid':
        vacationUnpaidCount++
        break
    }
  }

  const totalSalary = calculateSalary()

  return (
    <div>
      <div className="mb-6 p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{employee.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('daily_rate')}</div>
            <div className="text-lg font-semibold">{employee.dailyRate.toLocaleString('ru-RU')} ₽</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('work_schedule')}</div>
            <div className="text-lg font-semibold">{employee.workSchedule}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('work_days')}</div>
            <div className="text-lg font-semibold">{workDaysCount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('total_salary')}</div>
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {totalSalary.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div>{t('statistics')}: {t('dayoff')} - {dayoffDaysCount}, {t('sick')} - {sickDaysCount}, {t('vacation_paid')} - {vacationPaidCount}, {t('vacation_unpaid')} - {vacationUnpaidCount}</div>
        </div>
      </div>

      <div className="mb-4 flex gap-4 items-center">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
            <option key={month} value={month}>
              {new Date(2000, month - 1).toLocaleString('ru-RU', { month: 'long' })}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-4 mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {t('calendar_hint')}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')].map(day => (
            <div key={day} className="text-center font-semibold text-sm text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => (
            <div key={`empty-${i}`}></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const date = new Date(selectedYear, selectedMonth - 1, day)
            const displayType = getDayDisplayType(date)
            const dayStr = date.toISOString().split('T')[0]
            const exception = days.find(d => d.date.startsWith(dayStr))
            
            return (
              <div
                key={day}
                onClick={() => handleDayClick(date)}
                className={`
                  p-2 border-2 rounded cursor-pointer hover:border-blue-500 transition-colors
                  ${getDayTypeColor(displayType)}
                `}
              >
                <div className="text-center font-medium">{day}</div>
                {exception && exception.notes && (
                  <div className="text-xs mt-1 truncate" title={exception.notes}>
                    {exception.notes}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Dialog.Root open={isModalOpen} onOpenChange={(e) => !e.open && setIsModalOpen(false)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="md" className="rounded-3xl">
              <Dialog.Header className="flex items-center justify-between mb-4 gap-2">
                <div className="flex-1 flex items-center">
                  <Dialog.Title className="text-xl font-semibold">
                    {t('mark_exception')}
                  </Dialog.Title>
                </div>
                <div className='flex p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all duration-200 rounded-md items-center justify-center cursor-pointer'>
                  <XIcon className="w-5 h-5" onClick={() => setIsModalOpen(false)} />
                </div>
              </Dialog.Header>
              <Dialog.Body className="flex flex-col px-4 py-0">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('date')}
                    </label>
                    <DateInput
                      value={selectedDate || undefined}
                      onChange={setSelectedDate}
                      disabled
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedDate && (isWorkDayBySchedule(selectedDate, employee.workSchedule) 
                        ? t('default_work_day') 
                        : t('default_dayoff'))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('exception_type')}
                    </label>
                    <select
                      value={dayType}
                      onChange={(e) => setDayType(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                    >
                      <option value="sick">{t('sick')}</option>
                      <option value="vacation_paid">{t('vacation_paid')}</option>
                      <option value="vacation_unpaid">{t('vacation_unpaid')}</option>
                      {selectedDate && !isWorkDayBySchedule(selectedDate, employee.workSchedule) && (
                        <option value="work_override">{t('work_override')}</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('notes')}
                    </label>
                    <textarea
                      value={dayNotes}
                      onChange={(e) => setDayNotes(e.target.value)}
                      placeholder={t('notes_placeholder')}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                    />
                  </div>

                  {selectedDate && days.find(d => d.date.startsWith(selectedDate.toISOString().split('T')[0])) && (
                    <button
                      onClick={() => {
                        const dayStr = selectedDate.toISOString().split('T')[0]
                        const day = days.find(d => d.date.startsWith(dayStr))
                        if (day) {
                          handleDeleteDay(day.date)
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      {t('delete_day')}
                    </button>
                  )}
                </div>
              </Dialog.Body>
              <Dialog.Footer className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSaveDay}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('save')}
                </button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </div>
  )
}
