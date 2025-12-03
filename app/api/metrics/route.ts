import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/middleware-auth'
import { metricsStore } from '@/lib/metrics'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '100')

    const data: any = {}

    if (type === 'all' || type === 'ai') {
      data.ai = {
        summary: metricsStore.getAISummary(),
        recent: metricsStore.getAIMetrics(limit)
      }
    }

    if (type === 'all' || type === 'db') {
      data.db = {
        summary: metricsStore.getDBSummary(),
        recent: metricsStore.getDBMetrics(limit)
      }
    }

    if (type === 'all' || type === 'page') {
      data.page = {
        summary: metricsStore.getPageSummary(),
        recent: metricsStore.getPageMetrics(limit)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении метрик' },
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

    metricsStore.clear()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при очистке метрик' },
      { status: 500 }
    )
  }
}

