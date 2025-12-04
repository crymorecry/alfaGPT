import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/middleware-auth'
import { chatWithAI, moderateContent } from '@/lib/ai'

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
      const isFlagged = await moderateContent(lastMessage.content)
      if (isFlagged) {
        return NextResponse.json(
          { error: 'Ваше сообщение содержит недопустимый контент. Пожалуйста, переформулируйте запрос.' },
          { status: 400 }
        )
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

    try {
      const aiResponse = await chatWithAI({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        systemPrompt,
        temperature: 0.7,
        maxTokens: 2000,
        endpoint: '/api/chat'
      })

      const generatedText = aiResponse.content

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
        { error: 'Ошибка при генерации ответа' },
        { status: 500 }
      )
    }
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

