/**
 * Модуль для работы с ИИ провайдерами
 * 
 * Поддерживаемые провайдеры:
 * - openrouter (по умолчанию) - OpenRouter API
 * - openai - OpenAI API
 * - local - Локальное развертывание (например, Ollama)
 * 
 * Переключение провайдера через переменные окружения:
 * 
 * Для OpenRouter (по умолчанию):
 *   AI_PROVIDER=openrouter (или не указывать)
 *   OPENROUTER_API_KEY=your_key
 *   OPENROUTER_MODEL=openai/gpt-oss-20b:free
 * 
 * Для OpenAI:
 *   AI_PROVIDER=openai
 *   OPENAI_API_KEY=your_key
 *   OPENAI_MODEL=gpt-3.5-turbo
 * 
 * Для локального развертывания (Ollama):
 *   AI_PROVIDER=local
 *   AI_LOCAL_URL=http://localhost:11434
 *   AI_LOCAL_MODEL=llama2
 *   AI_LOCAL_API_KEY= (опционально, если требуется)
 * 
 * Пример использования:
 *   import { chatWithAI } from '@/lib/ai'
 *   
 *   const response = await chatWithAI({
 *     messages: [{ role: 'user', content: 'Привет!' }],
 *     systemPrompt: 'Ты помощник',
 *     temperature: 0.7,
 *     maxTokens: 2000,
 *     endpoint: '/api/chat'
 *   })
 *   
 *   console.log(response.content)
 */


export interface AIMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

export interface AIChatOptions {
    messages: AIMessage[]
    model?: string
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
    endpoint?: string
}

export interface AIResponse {
    content: string
    tokensUsed?: number
    tokensPrompt?: number
    tokensResponse?: number
}

export type AIProvider = 'openrouter' | 'local' | 'openai'

function getAIProvider(): AIProvider {
    const provider = process.env.AI_PROVIDER?.toLowerCase() || 'openrouter'
    if (provider === 'local' || provider === 'openai' || provider === 'openrouter') {
        return provider
    }
    return 'openrouter'
}

function getAIBaseURL(): string {
    const provider = getAIProvider()

    switch (provider) {
        case 'local':
            return process.env.AI_LOCAL_URL || 'http://localhost:11434'
        case 'openai':
            return 'https://api.openai.com/v1'
        case 'openrouter':
        default:
            return 'https://openrouter.ai/api/v1'
    }
}

function getAPIKey(): string {
    const provider = getAIProvider()

    switch (provider) {
        case 'local':
            return process.env.AI_LOCAL_API_KEY || ''
        case 'openai':
            return process.env.OPENAI_API_KEY || ''
        case 'openrouter':
        default:
            return process.env.OPENROUTER_API_KEY || ''
    }
}

function getDefaultModel(): string {
    const provider = getAIProvider()

    switch (provider) {
        case 'local':
            return process.env.AI_LOCAL_MODEL || 'llama2'
        case 'openai':
            return process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
        case 'openrouter':
        default:
            return process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free'
    }
}

export async function chatWithAI(options: AIChatOptions): Promise<AIResponse> {
    const provider = getAIProvider()
    const baseURL = getAIBaseURL()
    const apiKey = getAPIKey()
    const model = options.model || getDefaultModel()
    const temperature = options.temperature ?? 0.7
    const maxTokens = options.maxTokens ?? 2000

    const messages: AIMessage[] = []
    if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt })
    }
    messages.push(...options.messages)

    const endpoint = options.endpoint || '/api/ai'
    const aiStartTime = Date.now()

    try {
        let url: string
        let body: any
        let headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }

        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`
        }

        switch (provider) {
            case 'local':
                url = `${baseURL}/api/chat`
                body = {
                    model,
                    messages: messages.map(m => ({ role: m.role, content: m.content })),
                    stream: false,
                    options: {
                        temperature,
                        num_predict: maxTokens
                    }
                }
                break

            case 'openai':
                url = `${baseURL}/chat/completions`
                body = {
                    model,
                    messages: messages.map(m => ({ role: m.role, content: m.content })),
                    temperature,
                    max_tokens: maxTokens
                }
                break

            case 'openrouter':
            default:
                url = `${baseURL}/chat/completions`
                body = {
                    model,
                    messages: messages.map(m => ({ role: m.role, content: m.content })),
                    temperature,
                    max_tokens: maxTokens
                }
                headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                headers['X-Title'] = 'Volency'
                break
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error(`AI API error (${provider}):`, response.status, errorData)

            throw new Error(`AI API error: ${response.status}`)
        }

        const data = await response.json()

        let content = ''
        let tokensUsed = 0
        let tokensPrompt = 0
        let tokensResponse = 0

        switch (provider) {
            case 'local':
                content = data.message?.content || data.response || ''
                tokensUsed = data.eval_count || 0
                tokensPrompt = data.prompt_eval_count || 0
                tokensResponse = data.eval_count || 0
                break

            case 'openai':
            case 'openrouter':
            default:
                content = data.choices?.[0]?.message?.content || ''
                tokensUsed = data.usage?.total_tokens || 0
                tokensPrompt = data.usage?.prompt_tokens || 0
                tokensResponse = data.usage?.completion_tokens || 0
                break
        }


        return {
            content,
            tokensUsed,
            tokensPrompt,
            tokensResponse
        }
    } catch (error) {
        throw error
    }
}


export async function moderateContent(content: string): Promise<boolean> {
    if (getAIProvider() === 'local') {
        return false
    }

    try {
        const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || ''
        if (!apiKey) {
            return false
        }

        const response = await fetch('https://api.openai.com/v1/moderations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey ? `Bearer ${apiKey}` : '',
            },
            body: JSON.stringify({
                input: content
            })
        })

        if (response.ok) {
            const data = await response.json()
            return data.results?.[0]?.flagged || false
        }

        return false
    } catch (error) {
        console.error('Ошибка проверки модерации:', error)
        return false
    }
}

