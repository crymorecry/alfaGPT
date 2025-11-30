import { prisma } from './prisma'
import crypto from 'crypto'

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createAuthToken(email: string) {
  const code = generateCode()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await prisma.authToken.deleteMany({
    where: {
      email,
      verified: false,
    },
  })

  const authToken = await prisma.authToken.create({
    data: {
      email,
      code,
      expiresAt,
      verified: false,
    },
  })

  return { code, authToken }
}

export async function verifyCode(email: string, code: string) {
  const authToken = await prisma.authToken.findFirst({
    where: {
      email,
      code,
      verified: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!authToken) {
    return { success: false, error: 'Неверный код' }
  }

  const codeAge = Date.now() - authToken.createdAt.getTime()
  const tenMinutes = 10 * 60 * 1000

  if (codeAge > tenMinutes) {
    await prisma.authToken.delete({
      where: { id: authToken.id },
    })
    return { success: false, error: 'Код истек' }
  }

  let user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    user = await prisma.user.create({
      data: { email },
    })
  }

  const token = generateToken()
  const tokenExpiresAt = new Date()
  tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7) 

  await prisma.authToken.update({
    where: { id: authToken.id },
    data: {
      token,
      userId: user.id,
      verified: true,
      expiresAt: tokenExpiresAt,
    },
  })

  return { success: true, token, user }
}

export async function verifyToken(token: string) {
  const authToken = await prisma.authToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!authToken || !authToken.verified) {
    return { valid: false, user: null }
  }

  if (authToken.expiresAt < new Date()) {
    await prisma.authToken.delete({
      where: { id: authToken.id },
    })
    return { valid: false, user: null }
  }

  return { valid: true, user: authToken.user }
}

export async function getUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const result = await verifyToken(token)

  if (!result.valid || !result.user) {
    return null
  }

  return result.user
}

export async function getUserIdFromToken(request: Request) {
  const authHeader = request.headers.get('authorization')
  const user = await getUserFromToken(authHeader)
  return user?.id || null
}

