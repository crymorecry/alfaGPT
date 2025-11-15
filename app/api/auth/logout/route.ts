import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Удаляем cookie с токеном
  response.cookies.delete('auth_token')

  return response
}

