'use client'

import { useEffect, useState } from "react"

export default function PlaywrightReportPage() {
    const [htmlContent, setHtmlContent] = useState('')

    useEffect(() => {
        fetch('/api/test/playwright')
            .then(response => response.text())
            .then(text => setHtmlContent(text))
    }, [])

    return (
        <iframe
            className="w-full h-full border-0 bg-white"
            src="/api/test/playwright"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    )
}