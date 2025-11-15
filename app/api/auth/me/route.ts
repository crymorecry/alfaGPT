import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Токен не предоставлен' },
        { status: 401 }
      )
    }

    const result = await verifyToken(token)

    if (!result.valid || !result.user) {
      return NextResponse.json(
        { error: 'Неверный или истекший токен' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        createdAt: result.user.createdAt,
      },
    })
  } catch (error) {
    console.error('Ошибка при проверке токена:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

