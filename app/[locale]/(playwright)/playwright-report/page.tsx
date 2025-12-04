import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export const dynamic = 'force-dynamic'

export default async function PlaywrightReportPage() {
    
    return (
        <iframe
            className="w-full h-full border-0 bg-white"
            src={'/playwright-report/index.html'}
            style={{ width: '100%', height: '100vh', border: 'none' }}
        />
    )
}