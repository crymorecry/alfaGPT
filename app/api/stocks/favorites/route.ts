import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/middleware-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const favorites = await prisma.favoriteStock.findMany({
      where: { userId },
      select: { ticker: true }
    })

    const tickers = favorites.map(f => f.ticker)

    return NextResponse.json({ favorites: tickers })
  } catch (error) {
    console.error('Ошибка при получении избранных:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении избранных' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { ticker } = body

    if (!ticker || typeof ticker !== 'string') {
      return NextResponse.json(
        { error: 'Тикер не указан' },
        { status: 400 }
      )
    }

    const existing = await prisma.favoriteStock.findUnique({
      where: {
        userId_ticker: {
          userId,
          ticker
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Акция уже в избранном' },
        { status: 400 }
      )
    }

    const favorite = await prisma.favoriteStock.create({
      data: {
        userId,
        ticker
      }
    })

    return NextResponse.json({ success: true, favorite })
  } catch (error: any) {
    console.error('Ошибка при добавлении в избранное:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Акция уже в избранном' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Ошибка при добавлении в избранное' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { ticker } = body

    if (!ticker || typeof ticker !== 'string') {
      return NextResponse.json(
        { error: 'Тикер не указан' },
        { status: 400 }
      )
    }

    await prisma.favoriteStock.delete({
      where: {
        userId_ticker: {
          userId,
          ticker
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Ошибка при удалении из избранного:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Акция не найдена в избранном' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Ошибка при удалении из избранного' },
      { status: 500 }
    )
  }
}

