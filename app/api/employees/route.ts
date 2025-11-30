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

    const employees = await prisma.employee.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { businessId, name, email, phone, position, dailyRate, workSchedule, notes } = body

    if (!businessId || typeof businessId !== 'string') {
      return NextResponse.json(
        { error: 'businessId обязателен' },
        { status: 400 }
      )
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Имя работника обязательно' },
        { status: 400 }
      )
    }

    if (!dailyRate || typeof dailyRate !== 'number' || dailyRate <= 0) {
      return NextResponse.json(
        { error: 'Оплата за день обязательна и должна быть больше 0' },
        { status: 400 }
      )
    }

    if (!workSchedule || typeof workSchedule !== 'string') {
      return NextResponse.json(
        { error: 'График работы обязателен' },
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

    const employee = await prisma.employee.create({
      data: {
        businessId,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        position: position?.trim() || null,
        dailyRate: parseFloat(dailyRate.toString()),
        workSchedule: workSchedule.trim(),
        notes: notes?.trim() || null,
      }
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

