import { NextResponse } from 'next/server'
import { generateSwaggerSpec } from '@/lib/swagger-auto'

export async function GET() {
  const spec = await generateSwaggerSpec()
  return NextResponse.json(spec)
}

