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

    const businessId = params.id
    const body = await request.json()
    const { name, ip, address, yandexMapLink } = body

    const existingBusiness = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId
      }
    })

    if (!existingBusiness) {
      return NextResponse.json(
        { error: 'Бизнес не найден' },
        { status: 404 }
      )
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Название бизнеса обязательно' },
        { status: 400 }
      )
    }

    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        name: name.trim(),
        ip: ip?.trim() || null,
        address: address?.trim() || null,
        yandexMapLink: yandexMapLink?.trim() || null,
      }
    })

    return NextResponse.json(business)
  } catch (error) {
    console.error('Error updating business:', error)
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

    const businessId = params.id

    const existingBusiness = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId
      }
    })

    if (!existingBusiness) {
      return NextResponse.json(
        { error: 'Бизнес не найден' },
        { status: 404 }
      )
    }

    await prisma.business.delete({
      where: { id: businessId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting business:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

