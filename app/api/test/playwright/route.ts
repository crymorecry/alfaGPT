import { join } from "path"
import { readFile } from "fs/promises"
import { NextResponse } from "next/server"

export async function GET() {
    const htmlReportPath = join(process.cwd(), 'playwright-report', 'index.html')
    const htmlContent = await readFile(htmlReportPath, 'utf-8')
    return new NextResponse(htmlContent, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}