import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/middleware-auth'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId обязателен' },
        { status: 400 }
      )
    }

    const now = new Date()
    const startDate = startDateParam ? new Date(startDateParam) : new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const endDate = endDateParam ? new Date(endDateParam) : now

    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Бизнес не найден' },
        { status: 404 }
      )
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        businessId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const employees = await prisma.employee.findMany({
      where: { businessId },
      include: { days: true }
    })

    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: { businessId }
    })

    const isWorkDayBySchedule = (date: Date, schedule: string): boolean => {
      const [workDays, restDays] = schedule.split('/').map((n: string) => Number(n))
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

    const allRecords: Array<{
      date: Date
      type: string
      category: string
      amount: number
      description: string
    }> = []

    transactions.forEach((transaction: any) => {
      allRecords.push({
        date: new Date(transaction.date),
        type: transaction.type === 'income' ? 'Доход' : 'Расход',
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description
      })
    })

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dayStr = currentDate.toISOString().split('T')[0]
      
      employees.forEach((employee: any) => {
        const exception = employee.days.find((d: any) => d.date.toISOString().split('T')[0] === dayStr)
        let isWorkDay = false
        
        if (exception) {
          if (exception.type === 'work_override' || exception.type === 'vacation_paid') {
            isWorkDay = true
          }
        } else {
          isWorkDay = isWorkDayBySchedule(currentDate, employee.workSchedule)
        }
        
        if (isWorkDay) {
          allRecords.push({
            date: new Date(currentDate),
            type: 'Расход',
            category: 'Зарплата',
            amount: employee.dailyRate,
            description: `Зарплата: ${employee.name}${employee.position ? ` (${employee.position})` : ''}`
          })
        }
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    recurringExpenses.forEach((expense: any) => {
      const expenseStartDate = new Date(Math.max(expense.createdAt.getTime(), startDate.getTime()))
      const currentExpenseDate = new Date(expenseStartDate)
      
      while (currentExpenseDate <= endDate) {
        let shouldAdd = false
        let amount = expense.amount
        
        switch (expense.frequency) {
          case 'monthly':
            if (currentExpenseDate.getDate() === 1) {
              shouldAdd = true
            }
            break
          case 'weekly':
            if (currentExpenseDate.getDay() === 1) {
              shouldAdd = true
            }
            break
          case 'yearly':
            if (currentExpenseDate.getMonth() === 0 && currentExpenseDate.getDate() === 1) {
              shouldAdd = true
            }
            break
        }
        
        if (shouldAdd) {
          allRecords.push({
            date: new Date(currentExpenseDate),
            type: 'Расход',
            category: 'Постоянный расход',
            amount: amount,
            description: expense.name + (expense.description ? `: ${expense.description}` : '')
          })
        }
        
        if (expense.frequency === 'monthly') {
          currentExpenseDate.setMonth(currentExpenseDate.getMonth() + 1)
        } else if (expense.frequency === 'weekly') {
          currentExpenseDate.setDate(currentExpenseDate.getDate() + 7)
        } else if (expense.frequency === 'yearly') {
          currentExpenseDate.setFullYear(currentExpenseDate.getFullYear() + 1)
        } else {
          break
        }
      }
    })

    allRecords.sort((a, b) => a.date.getTime() - b.date.getTime())

    const excelData = allRecords.map((record: any) => ({
      'Дата': record.date.toLocaleDateString('ru-RU'),
      'Тип': record.type,
      'Категория': record.category,
      'Сумма': record.amount,
      'Описание': record.description
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    
    const columnWidths = [
      { wch: 12 }, 
      { wch: 10 }, 
      { wch: 20 }, 
      { wch: 15 },
      { wch: 40 } 
    ]
    worksheet['!cols'] = columnWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Транзакции')

    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    })

    const safeBusinessName = business.name
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50) 
    const fileName = `analytics_${safeBusinessName}_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.xlsx`

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })
  } catch (error) {
    console.error('Error exporting analytics:', error)
    return NextResponse.json(
      { error: 'Ошибка при экспорте данных' },
      { status: 500 }
    )
  }
}

