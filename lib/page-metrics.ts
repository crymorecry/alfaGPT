import { metricsStore } from './metrics'

export function trackPageLoad(path: string) {
  if (typeof window === 'undefined') return

  if (document.readyState === 'complete') {
    sendMetrics(path)
  } else {
    window.addEventListener('load', () => {
      sendMetrics(path)
    })
  }
}

function sendMetrics(path: string) {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (navigation) {
    const ttfb = navigation.responseStart - navigation.requestStart
    const loadTime = navigation.loadEventEnd - navigation.fetchStart
    const renderTime = navigation.domContentLoadedEventEnd - navigation.fetchStart

    fetch('/api/metrics/page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        ttfb: Math.round(ttfb),
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime)
      })
    }).catch(err => {
      console.error('Error sending page metrics:', err)
    })
  }
}

