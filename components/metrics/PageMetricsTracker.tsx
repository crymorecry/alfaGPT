'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageLoad } from '@/lib/page-metrics'

export function PageMetricsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      trackPageLoad(pathname)
    }
  }, [pathname])

  return null
}

