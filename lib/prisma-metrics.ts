import { Prisma } from '@prisma/client'
import { metricsStore } from './metrics'

// Обертка для Prisma запросов для сбора метрик
export async function trackDBQuery<T>(
  queryName: string,
  table: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()
  try {
    const result = await queryFn()
    const responseTime = Date.now() - startTime
    
    metricsStore.addDBMetric({
      timestamp: Date.now(),
      query: queryName,
      table: table,
      responseTime,
      success: true
    })
    
    return result
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    metricsStore.addDBMetric({
      timestamp: Date.now(),
      query: queryName,
      table: table,
      responseTime,
      success: false
    })
    
    throw error
  }
}

