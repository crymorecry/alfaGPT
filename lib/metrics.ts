interface AIMetric {
  timestamp: number
  endpoint: string
  model: string
  responseTime: number
  tokensUsed: number
  tokensPrompt: number
  tokensResponse: number
  success: boolean
}

interface DBMetric {
  timestamp: number
  query: string
  table: string
  responseTime: number
  success: boolean
}

interface PageMetric {
  timestamp: number
  path: string
  ttfb: number
  loadTime: number
  renderTime: number
}

class MetricsStore {
  private aiMetrics: AIMetric[] = []
  private dbMetrics: DBMetric[] = []
  private pageMetrics: PageMetric[] = []
  private maxSize = 1000

  addAIMetric(metric: AIMetric) {
    this.aiMetrics.push(metric)
    if (this.aiMetrics.length > this.maxSize) {
      this.aiMetrics.shift()
    }
  }

  addDBMetric(metric: DBMetric) {
    this.dbMetrics.push(metric)
    if (this.dbMetrics.length > this.maxSize) {
      this.dbMetrics.shift()
    }
  }

  addPageMetric(metric: PageMetric) {
    this.pageMetrics.push(metric)
    if (this.pageMetrics.length > this.maxSize) {
      this.pageMetrics.shift()
    }
  }

  getAIMetrics(limit = 100) {
    return this.aiMetrics.slice(-limit)
  }

  getDBMetrics(limit = 100) {
    return this.dbMetrics.slice(-limit)
  }

  getPageMetrics(limit = 100) {
    return this.pageMetrics.slice(-limit)
  }

  getAISummary() {
    const recent = this.aiMetrics.slice(-100)
    if (recent.length === 0) return null

    const avgResponseTime = recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length
    const avgTokens = recent.reduce((sum, m) => sum + m.tokensUsed, 0) / recent.length
    const successRate = (recent.filter(m => m.success).length / recent.length) * 100

    return {
      totalRequests: recent.length,
      avgResponseTime: Math.round(avgResponseTime),
      avgTokens: Math.round(avgTokens),
      successRate: Math.round(successRate * 100) / 100,
      requestsPerMinute: this.getRequestsPerMinute(recent)
    }
  }

  getDBSummary() {
    const recent = this.dbMetrics.slice(-100)
    if (recent.length === 0) return null

    const avgResponseTime = recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length
    const successRate = (recent.filter(m => m.success).length / recent.length) * 100
    const queriesByTable = recent.reduce((acc, m) => {
      acc[m.table] = (acc[m.table] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalQueries: recent.length,
      avgResponseTime: Math.round(avgResponseTime),
      successRate: Math.round(successRate * 100) / 100,
      queriesPerMinute: this.getRequestsPerMinute(recent),
      queriesByTable
    }
  }

  getPageSummary() {
    const recent = this.pageMetrics.slice(-100)
    if (recent.length === 0) return null

    const avgTTFB = recent.reduce((sum, m) => sum + m.ttfb, 0) / recent.length
    const avgLoadTime = recent.reduce((sum, m) => sum + m.loadTime, 0) / recent.length
    const avgRenderTime = recent.reduce((sum, m) => sum + m.renderTime, 0) / recent.length

    return {
      totalPages: recent.length,
      avgTTFB: Math.round(avgTTFB),
      avgLoadTime: Math.round(avgLoadTime),
      avgRenderTime: Math.round(avgRenderTime)
    }
  }

  private getRequestsPerMinute(metrics: any[]) {
    if (metrics.length < 2) return 0
    const timeSpan = (metrics[metrics.length - 1].timestamp - metrics[0].timestamp) / 1000 / 60
    return timeSpan > 0 ? Math.round(metrics.length / timeSpan) : 0
  }

  clear() {
    this.aiMetrics = []
    this.dbMetrics = []
    this.pageMetrics = []
  }
}

export const metricsStore = new MetricsStore()

