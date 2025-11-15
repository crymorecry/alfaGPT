import { NextRequest, NextResponse } from 'next/server'
import { createAuthToken } from '@/lib/auth'
import { sendAuthCode } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email обязателен' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Неверный формат email' },
        { status: 400 }
      )
    }

    const { code, authToken } = await createAuthToken(email)

    const emailResult = await sendAuthCode(email, code)

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Не удалось отправить код' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Код отправлен на email',
    })
  } catch (error) {
    console.error('Ошибка при отправке кода:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

