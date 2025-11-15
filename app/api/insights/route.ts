import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/middleware-auth'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const insights = await prisma.insight.findMany({
      where: { userId },
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
    const { icon, text, level } = body

    const insight = await prisma.insight.create({
      data: {
        userId,
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

