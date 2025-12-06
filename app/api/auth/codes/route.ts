import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)

    const codes = await prisma.authToken.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        email: true,
        code: true,
        verified: true,
        createdAt: true,
        expiresAt: true,
      },
    })

    return NextResponse.json(codes)
  } catch (error) {
    console.error('Error fetching auth codes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

