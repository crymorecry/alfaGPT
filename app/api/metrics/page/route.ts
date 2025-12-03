import { NextRequest, NextResponse } from 'next/server'
import { metricsStore } from '@/lib/metrics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    metricsStore.addPageMetric({
      timestamp: Date.now(),
      ...body
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

