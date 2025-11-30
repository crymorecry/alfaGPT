import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/middleware-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employeeId = params.id
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') 
    const year = searchParams.get('year') 

    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        business: {
          userId
        }
      }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Работник не найден' },
        { status: 404 }
      )
    }

    let whereClause: any = { employeeId }

    if (month && year) {
      const startDate = new Date(`${year}-${month}-01`)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(0) 

      whereClause.date = {
        gte: startDate,
        lte: endDate
      }
    }

    const days = await prisma.employeeDay.findMany({
      where: whereClause,
      orderBy: { date: 'asc' }
    })

    return NextResponse.json(days)
  } catch (error) {
    console.error('Error fetching employee days:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
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
    const { date, type, notes } = body

    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        business: {
          userId
        }
      }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Работник не найден' },
        { status: 404 }
      )
    }

    if (!date || !type) {
      return NextResponse.json(
        { error: 'Дата и тип обязательны' },
        { status: 400 }
      )
    }

    if (!['sick', 'vacation_paid', 'vacation_unpaid', 'work_override'].includes(type)) {
      return NextResponse.json(
        { error: 'Неверный тип исключения' },
        { status: 400 }
      )
    }

    const day = await prisma.employeeDay.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(date)
        }
      },
      update: {
        type,
        notes: notes?.trim() || null
      },
      create: {
        employeeId,
        date: new Date(date),
        type,
        notes: notes?.trim() || null
      }
    })

    return NextResponse.json(day, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating employee day:', error)
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
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Дата обязательна' },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        business: {
          userId
        }
      }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Работник не найден' },
        { status: 404 }
      )
    }

    await prisma.employeeDay.delete({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(date)
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting employee day:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

