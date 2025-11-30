import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/middleware-auth'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const { businessId } = body

    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId обязателен' },
        { status: 400 }
      )
    }

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

    const [employees, transactions, recurringExpenses] = await Promise.all([
      prisma.employee.findMany({
        where: { businessId },
        include: {
          days: {
            where: {
              date: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1)
              }
            }
          }
        }
      }),
      prisma.transaction.findMany({
        where: { businessId },
        orderBy: { date: 'desc' },
        take: 100
      }),
      prisma.recurringExpense.findMany({
        where: { businessId }
      })
    ])

    const employeeData = employees.map(emp => {
      const workDays = emp.days.filter(d => d.type === 'work_override' || d.type === 'vacation_paid').length
      const sickDays = emp.days.filter(d => d.type === 'sick').length
      const vacationDays = emp.days.filter(d => d.type === 'vacation_paid' || d.type === 'vacation_unpaid').length

      return {
        name: emp.name,
        position: emp.position,
        dailyRate: emp.dailyRate,
        workSchedule: emp.workSchedule,
        workDays,
        sickDays,
        vacationDays
      }
    })

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyRecurring = recurringExpenses.reduce((sum, exp) => {
      let monthly = 0
      switch (exp.frequency) {
        case 'monthly': monthly = exp.amount; break
        case 'weekly': monthly = exp.amount * 4.33; break
        case 'yearly': monthly = exp.amount / 12; break
      }
      return sum + monthly
    }, 0)

    const employeeMonthlyCost = employees.reduce((sum, emp) => {
      const [workDays, restDays] = emp.workSchedule.split('/').map(Number)
      const totalCycle = workDays + restDays
      const workDaysPerMonth = (30 / totalCycle) * workDays
      return sum + (emp.dailyRate * workDaysPerMonth)
    }, 0)

    const prompt = `Ты финансовый аналитик. Проанализируй бизнес и предоставь подробный анализ.

Данные бизнеса:
- Название: ${business.name}
- ИП: ${business.ip || 'не указано'}
- Адрес: ${business.address || 'не указан'}

Сотрудники (${employees.length}):
${employeeData.map((e, i) => `
${i + 1}. ${e.name} (${e.position || 'без должности'})
   - Дневная ставка: ${e.dailyRate} ₽
   - График: ${e.workSchedule}
   - Рабочих дней за последние 3 месяца: ${e.workDays}
   - Больничных: ${e.sickDays}
   - Отпускных: ${e.vacationDays}
`).join('')}

Финансы:
- Доходы (последние транзакции): ${totalIncome.toLocaleString('ru-RU')} ₽
- Расходы (последние транзакции): ${totalExpense.toLocaleString('ru-RU')} ₽
- Постоянные расходы в месяц: ${monthlyRecurring.toLocaleString('ru-RU')} ₽
- Зарплаты в месяц (примерно): ${employeeMonthlyCost.toLocaleString('ru-RU')} ₽

Предоставь подробный анализ в формате Markdown (на русском языке). Используй заголовки (###), списки, таблицы, блоки цитат (>), жирный текст (**текст**) и другие элементы Markdown для структурирования.

Структура анализа:
### 1. Краткое резюме бизнеса
(2-3 предложения о текущем состоянии бизнеса)

### 2. Прогноз на год
(Сколько примерно заработает бизнес за год, учитывая текущие показатели. Можно использовать таблицы для сравнения сценариев)

### 3. Оценка прибыльности
(Рентабелен ли бизнес, какие показатели хорошие/плохие, что влияет на прибыльность)

### 4. Рекомендации
(3-5 пунктов с конкретными рекомендациями по улучшению бизнеса)

### 5. Риски
(2-3 пункта о потенциальных рисках и как их минимизировать)

Ответ должен быть подробным, структурированным и полезным для владельца малого бизнеса. Используй Markdown форматирование для лучшей читаемости.`

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Alfa Copilot'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!openRouterResponse.ok) {
      throw new Error('Ошибка при обращении к ИИ')
    }

    const aiData = await openRouterResponse.json()
    const aiResponse = aiData.choices[0]?.message?.content || ''

    return NextResponse.json({
      summary: aiResponse,
      yearlyProjection: '',
      profitability: '',
      recommendations: [],
      risks: []
    })
  } catch (error) {
    console.error('Error in AI analysis:', error)
    return NextResponse.json(
      { error: 'Ошибка при анализе бизнеса' },
      { status: 500 }
    )
  }
}

