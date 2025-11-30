import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/middleware-auth'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const startDate = month && year 
      ? new Date(parseInt(year), parseInt(month) - 1, 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    
    const endDate = month && year
      ? new Date(parseInt(year), parseInt(month), 0)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

    const [tasks, reminders, payments] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          deadline: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          id: true,
          title: true,
          deadline: true,
          priority: true,
          status: true
        }
      }),
      prisma.reminder.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          id: true,
          title: true,
          date: true,
          completed: true
        }
      }),
      prisma.payment.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          id: true,
          contractor: true,
          date: true,
          amount: true,
          status: true
        }
      }),
    ])

    const events = [
      ...tasks.map((task: any) => ({
        id: task.id,
        type: 'task' as const,
        title: task.title,
        date: task.deadline,
        data: {
          priority: task.priority,
          status: task.status
        }
      })),
      ...reminders.map((reminder: any) => ({
        id: reminder.id,
        type: 'reminder' as const,
        title: reminder.title,
        date: reminder.date,
        data: {
          completed: reminder.completed
        }
      })),
      ...payments.map((payment: any) => ({
        id: payment.id,
        type: 'payment' as const,
        title: `Платеж: ${payment.contractor}`,
        date: payment.date,
        data: {
          amount: payment.amount,
          status: payment.status
        }
      })),
    ]

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

