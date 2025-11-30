import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/middleware-auth'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

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

    const expenses = await prisma.recurringExpense.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching recurring expenses:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении постоянных расходов' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const { businessId, name, amount, frequency, description } = body

    if (!businessId || typeof businessId !== 'string') {
      return NextResponse.json(
        { error: 'businessId обязателен' },
        { status: 400 }
      )
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Название расхода обязательно' },
        { status: 400 }
      )
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Сумма обязательна и должна быть больше 0' },
        { status: 400 }
      )
    }

    if (!frequency || !['monthly', 'weekly', 'yearly'].includes(frequency)) {
      return NextResponse.json(
        { error: 'Частота должна быть: monthly, weekly или yearly' },
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

    const expense = await prisma.recurringExpense.create({
      data: {
        businessId,
        name: name.trim(),
        amount: parseFloat(amount.toString()),
        frequency,
        description: description?.trim() || null
      }
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error creating recurring expense:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании постоянного расхода' },
      { status: 500 }
    )
  }
}

