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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employeeId = params.id
    const body = await request.json()
    const { name, email, phone, position, dailyRate, workSchedule, notes } = body

    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        business: {
          userId
        }
      }
    })

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Работник не найден' },
        { status: 404 }
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

    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        position: position?.trim() || null,
        dailyRate: parseFloat(dailyRate.toString()),
        workSchedule: workSchedule.trim(),
        notes: notes?.trim() || null,
      }
    })

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employeeId = params.id

    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        business: {
          userId
        }
      }
    })

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Работник не найден' },
        { status: 404 }
      )
    }

    await prisma.employee.delete({
      where: { id: employeeId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

