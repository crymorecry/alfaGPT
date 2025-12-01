import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/middleware-auth'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        user: { id: userId }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении сообщений' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Сообщения обязательны' },
        { status: 400 }
      )
    }

    const lastMessage = messages[messages.length - 1]

    // Проверка модерации перед отправкой
    if (lastMessage && lastMessage.role === 'user') {
      try {
        const moderationResponse = await fetch('https://openrouter.ai/api/v1/moderations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': OPENROUTER_API_KEY ? `Bearer ${OPENROUTER_API_KEY}` : '',
          },
          body: JSON.stringify({
            input: lastMessage.content
          })
        })

        if (moderationResponse.ok) {
          const moderationData = await moderationResponse.json()
          if (moderationData.results?.[0]?.flagged) {
            return NextResponse.json(
              { error: 'Ваше сообщение содержит недопустимый контент. Пожалуйста, переформулируйте запрос.' },
              { status: 400 }
            )
          }
        }
      } catch (moderationError) {
        console.error('Ошибка проверки модерации:', moderationError)
      }

      await prisma.chatMessage.create({
        data: {
          user: { connect: { id: userId } },
          role: 'user',
          content: lastMessage.content
        }
      })
    }

    const systemPrompt = `Ты универсальный ИИ-помощник для бизнеса. Твоя задача - помогать пользователям с различными вопросами: бизнес-советы, финансы, маркетинг, юридические вопросы, управление задачами и другие бизнес-задачи. Отвечай на русском языке, будь профессиональным, дружелюбным и полезным. Предоставляй конкретные и практичные советы.`

    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free'

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': OPENROUTER_API_KEY ? `Bearer ${OPENROUTER_API_KEY}` : '',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Volency'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenRouter API error:', errorData)
      return NextResponse.json(
        { error: 'Ошибка при генерации ответа' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const generatedText = data.choices?.[0]?.message?.content || ''

    await prisma.chatMessage.create({
      data: {
        user: { connect: { id: userId } },
        role: 'assistant',
        content: generatedText
      }
    })

    return NextResponse.json({
      message: generatedText
    })
  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json(
      { error: 'Ошибка при обработке запроса' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.chatMessage.deleteMany({
      where: {
        user: { id: userId }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting messages:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении сообщений' },
      { status: 500 }
    )
  }
}

