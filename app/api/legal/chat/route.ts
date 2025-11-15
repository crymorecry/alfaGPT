import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Сообщения обязательны' },
        { status: 400 }
      )
    }

    const systemPrompt = `Ты эксперт по юридическим вопросам и праву в России. Твоя задача - давать точные, полезные и понятные ответы на юридические вопросы. Отвечай на русском языке, будь профессиональным, но доступным. Если вопрос не связан с юриспруденцией, вежливо укажи на это.`

    const model = 'google/gemini-2.0-flash-001'

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': OPENROUTER_API_KEY ? `Bearer ${OPENROUTER_API_KEY}` : '',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Alfa Copilot'
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

    return NextResponse.json({ message: generatedText })
  } catch (error) {
    console.error('Error in legal chat:', error)
    return NextResponse.json(
      { error: 'Ошибка при обработке запроса' },
      { status: 500 }
    )
  }
}

