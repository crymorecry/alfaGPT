import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/middleware-auth'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const monthNames = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь'
    ]

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
      },
      orderBy: { date: 'asc' }
    })

    const monthlyMap = new Map<string, { income: number; expense: number }>()
    
    const current = new Date(startDate)
      current.setDate(1)
    
    while (current <= endDate) {
      const monthKey = `${monthNames[current.getMonth()]} ${current.getFullYear()}`
      monthlyMap.set(monthKey, { income: 0, expense: 0 })
      current.setMonth(current.getMonth() + 1)
    }

    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      const monthData = monthlyMap.get(monthKey)
      if (monthData) {
        if (transaction.type === 'income') {
          monthData.income += transaction.amount
        } else {
          monthData.expense += transaction.amount
        }
      }
    })

    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: { businessId }
    })

    recurringExpenses.forEach(expense => {
      let monthlyAmount = 0
      switch (expense.frequency) {
        case 'monthly':
          monthlyAmount = expense.amount
          break
        case 'weekly':
          monthlyAmount = expense.amount * 4.33
          break
        case 'yearly':
          monthlyAmount = expense.amount / 12
          break
      }

      monthlyMap.forEach((data, monthKey) => {
        data.expense += monthlyAmount
      })
    })

    const employees = await prisma.employee.findMany({
      where: { businessId },
      include: {
        days: true
      }
    })

    const isWorkDayBySchedule = (date: Date, schedule: string): boolean => {
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

    monthlyMap.forEach((data, monthKey) => {
      const [monthName, yearStr] = monthKey.split(' ')
      const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthName.toLowerCase())
      const year = parseInt(yearStr)
      
      if (monthIndex === -1) return
      
      const monthStart = new Date(year, monthIndex, 1)
      const monthEnd = new Date(year, monthIndex + 1, 0)
      const daysInMonth = monthEnd.getDate()
      
      employees.forEach(employee => {
        let workDays = 0
        let paidVacationDays = 0
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, monthIndex, day)
          
          if (date < startDate || date > endDate) continue
          
          const dayStr = date.toISOString().split('T')[0]
          const exception = employee.days.find(d => d.date.toISOString().split('T')[0] === dayStr)
          
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
        
        const salary = (workDays + paidVacationDays) * employee.dailyRate
        data.expense += salary
      })
    })

    const monthlyData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      income: Math.round(data.income),
      expense: Math.round(data.expense),
      profit: Math.round(data.income - data.expense)
    }))

    const expenseByCategory = new Map<string, number>()
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = expenseByCategory.get(t.category) || 0
        expenseByCategory.set(t.category, current + t.amount)
      })

    const incomeByCategory = new Map<string, number>()
    transactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        const current = incomeByCategory.get(t.category) || 0
        incomeByCategory.set(t.category, current + t.amount)
      })

    const fixedExpenses = recurringExpenses.reduce((sum, exp) => {
      let monthlyAmount = 0
      switch (exp.frequency) {
        case 'monthly': monthlyAmount = exp.amount; break
        case 'weekly': monthlyAmount = exp.amount * 4.33; break
        case 'yearly': monthlyAmount = exp.amount / 12; break
      }
      return sum + monthlyAmount
    }, 0)

    const variableExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const currentCalc = new Date(startDate)
    currentCalc.setDate(1)
    let totalSalaries = 0
    
    while (currentCalc <= endDate) {
      const year = currentCalc.getFullYear()
      const month = currentCalc.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      
      employees.forEach(employee => {
        let workDays = 0
        let paidVacationDays = 0
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day)
          if (date < startDate || date > endDate) continue
          
          const dayStr = date.toISOString().split('T')[0]
          const exception = employee.days.find(d => {
            const exceptionDate = new Date(d.date)
            return exceptionDate.toISOString().split('T')[0] === dayStr
          })
          
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
        
        totalSalaries += (workDays + paidVacationDays) * employee.dailyRate
      })
      
      currentCalc.setMonth(currentCalc.getMonth() + 1)
    }

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const monthsCount = monthlyMap.size
    const totalExpenses = variableExpenses + (fixedExpenses * monthsCount) + totalSalaries
    const efficiency = totalExpenses > 0 ? (totalIncome / totalExpenses) * 100 : 0

    const last3Months = monthlyData.slice(-3)
    const prev3Months = monthlyData.slice(-6, -3)
    const last3Avg = last3Months.reduce((sum, m) => sum + m.profit, 0) / 3
    const prev3Avg = prev3Months.length > 0 
      ? prev3Months.reduce((sum, m) => sum + m.profit, 0) / prev3Months.length 
      : 0
    const trend = prev3Avg !== 0 ? ((last3Avg - prev3Avg) / prev3Avg) * 100 : 0

    return NextResponse.json({
      monthlyData,
      expenseByCategory: Array.from(expenseByCategory.entries()).map(([category, amount]) => ({
        category,
        amount: Math.round(amount)
      })),
      incomeByCategory: Array.from(incomeByCategory.entries()).map(([category, amount]) => ({
        category,
        amount: Math.round(amount)
      })),
      expensesBreakdown: {
        fixed: Math.round(fixedExpenses),
        variable: Math.round(variableExpenses),
        salaries: Math.round(totalSalaries)
      },
      metrics: {
        totalIncome: Math.round(totalIncome),
        totalExpenses: Math.round(totalExpenses),
        efficiency: Math.round(efficiency * 100) / 100,
        trend: Math.round(trend * 100) / 100
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении аналитики' },
      { status: 500 }
    )
  }
}

