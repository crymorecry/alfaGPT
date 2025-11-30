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

    const insights = await prisma.insight.findMany({
      where: {
        userId,
        ...(businessId && { businessId })
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Error fetching insights:', error)
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
    const { businessId, icon, text, level } = body

    if (!businessId) {
      return NextResponse.json({ error: 'businessId обязателен' }, { status: 400 })
    }

    const insight = await prisma.insight.create({
      data: {
        userId,
        businessId,
        icon,
        text,
        level
      }
    })

    return NextResponse.json(insight, { status: 201 })
  } catch (error) {
    console.error('Error creating insight:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

