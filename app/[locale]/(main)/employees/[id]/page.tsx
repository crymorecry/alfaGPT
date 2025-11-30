'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useBusiness } from '@/components/business/BusinessProvider'
import EmployeeDaysView from '@/components/employees/EmployeeDaysView'
import Title from '@/components/ui/title'
import { Loader2 } from 'lucide-react'

interface Employee {
  id: string
  name: string
  dailyRate: number
  workSchedule: string
}

export default function EmployeeDaysPage() {
  const params = useParams()
  const router = useRouter()
  const { currentBusiness } = useBusiness()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentBusiness) {
      fetchEmployee()
    }
  }, [params.id, currentBusiness])

  const fetchEmployee = async () => {
    if (!currentBusiness) return
    
    try {
      const res = await fetch(`/api/employees?businessId=${currentBusiness.id}`)
      if (res.ok) {
        const employees = await res.json()
        const found = employees.find((e: Employee) => e.id === params.id)
        if (found) {
          setEmployee(found)
        } else {
          router.push('/employees')
        }
      }
    } catch (error) {
      console.error('Error fetching employee:', error)
      router.push('/employees')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!employee) {
    return null
  }

  return (
    <div>
      <Title>Employees</Title>
      <EmployeeDaysView employee={employee} />
    </div>
  )
}

