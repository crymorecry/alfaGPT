'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/swagger')
      .then((res) => res.json())
      .then((data) => {
        setSpec(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading Swagger spec:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка документации API...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <SwaggerUI spec={spec} />
    </div>
  )
}

