import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { businessType, platform, userRequest } = body

        if (!businessType || !platform || !userRequest) {
            return NextResponse.json(
                { error: 'Не указаны обязательные поля' },
                { status: 400 }
            )
        }

        const platformNames: Record<string, string> = {
            instagram: 'Instagram',
            vk: 'ВКонтакте',
            telegram: 'Telegram'
        }

        const platformName = platformNames[platform] || platform

        const systemPrompt = `Ты эксперт по маркетингу и созданию контента для социальных сетей. Твоя задача - генерировать креативные и эффективные идеи для постов в социальных сетях.`

        const userPrompt = `Создай 5 детальных идей для постов в ${platformName} для бизнеса типа "${businessType}".

Запрос пользователя: ${userRequest}

Требования:
- Каждая идея должна быть подробной и конкретной
- Учитывай специфику платформы ${platformName}
- Идеи должны быть релевантны для бизнеса "${businessType}"
- Учитывай запрос пользователя: "${userRequest}"
- Идеи должны быть практичными и применимыми
- Формат: каждая идея на отдельной строке, начинай с эмодзи и краткого названия

Верни только список идей, без дополнительных комментариев.`

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
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8,
                max_tokens: 1000
            })
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error('OpenRouter API error:', errorData)
            return NextResponse.json(
                { error: 'Ошибка при генерации идей' },
                { status: 500 }
            )
        }

        const data = await response.json()
        const generatedText = data.choices?.[0]?.message?.content || ''
        console.log(generatedText)
        const ideas = generatedText
            .split('\n')
            .filter((line: string) => line.trim().length > 0)
            .map((line: string) => line.trim())
            .filter((line: string) => !line.match(/^(идея|idea|\d+[\.\)])/i))
            .slice(0, 5)

        if (ideas.length < 5) {
            const fallbackIdeas = [
                `📸 История создания: Расскажите, как началась ваша история в бизнесе ${businessType}`,
                `💡 Совет дня: Поделитесь полезным советом для ваших клиентов`,
                `🎉 Акция недели: Специальное предложение для подписчиков`,
                `👥 Команда: Познакомьте аудиторию с вашей командой`,
                `📊 Результаты клиентов: Покажите примеры успешных кейсов`
            ]
            ideas.push(...fallbackIdeas.slice(ideas.length))
        }

        return NextResponse.json({ ideas: ideas.slice(0, 5) })
    } catch (error) {
        console.error('Error generating post ideas:', error)
        return NextResponse.json(
            { error: 'Ошибка при генерации идей' },
            { status: 500 }
        )
    }
}

