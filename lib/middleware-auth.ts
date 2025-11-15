import { NextRequest } from 'next/server'
import { verifyToken } from './auth'

export async function getAuthUser(request: NextRequest) {
  const token =
    request.cookies.get('auth_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return null
  }

  const result = await verifyToken(token)

  if (!result.valid || !result.user) {
    return null
  }

  return result.user
}

