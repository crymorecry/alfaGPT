'use client'

import { useState, useEffect } from 'react'
import { Dialog, Portal } from '@chakra-ui/react'
import { XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useBusiness } from '@/components/business/BusinessProvider'
import { toaster } from '@/components/ui/toaster'

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

interface EmployeeFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  employee?: Employee | null
}

export default function EmployeeFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  employee
}: EmployeeFormModalProps) {
  const { currentBusiness } = useBusiness()
  const [name, setName] = useState(employee?.name || '')
  const [email, setEmail] = useState(employee?.email || '')
  const [phone, setPhone] = useState(employee?.phone || '')
  const [position, setPosition] = useState(employee?.position || '')
  const [dailyRate, setDailyRate] = useState(employee?.dailyRate?.toString() || '')
  const [workSchedule, setWorkSchedule] = useState(employee?.workSchedule || '5/2')
  const [notes, setNotes] = useState(employee?.notes || '')
  const [loading, setLoading] = useState(false)
  const t = useTranslations('employees')

  useEffect(() => {
    if (employee) {
      setName(employee.name || '')
      setEmail(employee.email || '')
      setPhone(employee.phone || '')
      setPosition(employee.position || '')
      setDailyRate(employee.dailyRate?.toString() || '')
      setWorkSchedule(employee.workSchedule || '5/2')
      setNotes(employee.notes || '')
    } else {
      setName('')
      setEmail('')
      setPhone('')
      setPosition('')
      setDailyRate('')
      setWorkSchedule('5/2')
      setNotes('')
    }
  }, [employee, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentBusiness) {
      toaster.create({ title: t('error'), description: t('no_business_selected'), type: 'error' })
      return
    }

    if (!name.trim()) {
      toaster.create({ title: t('error'), description: t('name_required'), type: 'error' })
      return
    }

    if (!dailyRate || parseFloat(dailyRate) <= 0) {
      toaster.create({ title: t('error'), description: t('daily_rate_required'), type: 'error' })
      return
    }

    setLoading(true)
    try {
      const url = employee 
        ? `/api/employees/${employee.id}`
        : '/api/employees'
      
      const method = employee ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: currentBusiness.id,
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          position: position.trim() || null,
          dailyRate: parseFloat(dailyRate),
          workSchedule: workSchedule.trim(),
          notes: notes.trim() || null,
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('error_adding_employee'))
      }

      toaster.create({ 
        title: t('success'), 
        description: employee ? t('employee_updated') : t('employee_added'),
        type: 'success' 
      })
      
      onSuccess()
      onClose()
    } catch (error: any) {
      toaster.create({ 
        title: t('error'), 
        description: error.message || t('error_adding_employee'),
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="2xl" className="rounded-3xl px-2">
            <Dialog.Header className="flex items-center justify-between mb-4 gap-2">
              <div className="flex-1 flex items-center">
                <Dialog.Title className="text-xl font-semibold">
                  {employee ? t('edit_employee') : t('add_employee')}
                </Dialog.Title>
              </div>
              <div className='flex p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all duration-200 rounded-md items-center justify-center cursor-pointer'>
                <XIcon className="w-5 h-5" onClick={onClose} />
              </div>
            </Dialog.Header>
            <Dialog.Body className="flex flex-col px-4 py-0">
              <form onSubmit={handleSubmit} id="employee-form">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('name_placeholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('email')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('email_placeholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('phone')}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.startsWith('8')) val = '7' + val.slice(1);
                        if (val.length > 11) val = val.slice(0, 11);
                        let formatted = '';
                        if (val.length > 0) formatted = '+7';
                        if (val.length > 1) formatted += ' (' + val.slice(1, 4);
                        if (val.length >= 4) formatted += ') ' + val.slice(4, 7);
                        if (val.length >= 7) formatted += '-' + val.slice(7, 9);
                        if (val.length >= 9) formatted += '-' + val.slice(9, 11);
                        setPhone(formatted.trim());
                      }}
                      placeholder={t('phone_placeholder')}
                      maxLength={18}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('position')}
                    </label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder={t('position_placeholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('daily_rate')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(e.target.value)}
                      placeholder={t('daily_rate_placeholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('work_schedule')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={workSchedule}
                      onChange={(e) => setWorkSchedule(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                      required
                    >
                      <option value="5/2">5/2 (5 рабочих, 2 выходных)</option>
                      <option value="2/2">2/2 (2 рабочих, 2 выходных)</option>
                      <option value="6/1">6/1 (6 рабочих, 1 выходной)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('notes')}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('notes_placeholder')}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                    />
                  </div>
                </div>
              </form>
            </Dialog.Body>
            <Dialog.Footer className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                form="employee-form"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('saving') : (employee ? t('update') : t('add'))}
              </button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

