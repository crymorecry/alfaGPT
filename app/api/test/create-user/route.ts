import { NextResponse } from 'next/server'
import { createAuthToken, verifyCode } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const email = 'test3@volency.ru'
  
  let user = await prisma.user.findUnique({
    where: { email }
  })
  
  if (!user) {
    const { code } = await createAuthToken(email)
    const result = await verifyCode(email, code)
    
    if (!result.success || !result.token) {
      return NextResponse.json(
        { error: 'Failed to create test user' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      email,
      token: result.token,
      user: result.user
    })
  }
  
  const existingToken = await prisma.authToken.findFirst({
    where: {
      userId: user.id,
      verified: true,
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  if (existingToken && existingToken.token) {
    return NextResponse.json({
      email,
      token: existingToken.token,
      user
    })
  }
  
  const { code } = await createAuthToken(email)
  const result = await verifyCode(email, code)
  
  if (!result.success || !result.token) {
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    )
  }
  
  return NextResponse.json({
    email,
    token: result.token,
    user: result.user
  })
}

