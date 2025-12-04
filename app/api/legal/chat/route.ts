import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/middleware-auth'
import { chatWithAI, moderateContent } from '@/lib/ai'

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
    }

    const systemPrompt = `Ты профессиональный юридический консультант и помощник для бизнеса. Твоя задача - помогать пользователям с юридическими вопросами: регистрация бизнеса, налоги, трудовое право, договоры, лицензирование, защита интеллектуальной собственности и другие юридические аспекты ведения бизнеса в России.

Отвечай на русском языке, будь профессиональным, точным и полезным. Предоставляй конкретные и практичные советы. Если вопрос требует консультации с живым юристом, обязательно укажи это. Всегда предупреждай, что твои советы носят информационный характер и не заменяют профессиональную юридическую консультацию.`

    try {
      const aiResponse = await chatWithAI({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        systemPrompt,
        temperature: 0.7,
        maxTokens: 2000,
        endpoint: '/api/legal/chat'
      })

      const generatedText = aiResponse.content

      return NextResponse.json({
        message: generatedText
      })
    } catch (error) {
      console.error('Error in legal chat:', error)
      return NextResponse.json(
        { error: 'Ошибка при генерации ответа' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in legal chat:', error)
    return NextResponse.json(
      { error: 'Ошибка при обработке запроса' },
      { status: 500 }
    )
  }
}

