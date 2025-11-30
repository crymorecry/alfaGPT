import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/middleware-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const expenseId = params.id
    const body = await request.json()
    const { name, amount, frequency, description } = body

    const existingExpense = await prisma.recurringExpense.findUnique({
      where: { id: expenseId },
      include: { business: true }
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Постоянный расход не найден' },
        { status: 404 }
      )
    }

    if (existingExpense.business.userId !== userId) {
      return NextResponse.json(
        { error: 'Нет доступа' },
        { status: 403 }
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

    const expense = await prisma.recurringExpense.update({
      where: { id: expenseId },
      data: {
        name: name.trim(),
        amount: parseFloat(amount.toString()),
        frequency,
        description: description?.trim() || null
      }
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error updating recurring expense:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении постоянного расхода' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const expenseId = params.id

    const existingExpense = await prisma.recurringExpense.findUnique({
      where: { id: expenseId },
      include: { business: true }
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Постоянный расход не найден' },
        { status: 404 }
      )
    }

    if (existingExpense.business.userId !== userId) {
      return NextResponse.json(
        { error: 'Нет доступа' },
        { status: 403 }
      )
    }

    await prisma.recurringExpense.delete({
      where: { id: expenseId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recurring expense:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении постоянного расхода' },
      { status: 500 }
    )
  }
}

