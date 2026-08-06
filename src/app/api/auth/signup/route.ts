import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma/client'
import { signSession, sessionMaxAge, SESSION_COOKIE } from '@/lib/auth/session'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  username: z.string().min(3, 'At least 3 characters').max(50),
  password: z.string().min(8, 'Use at least 8 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const { fullName, username, password } = parsed.data

    const existing = await prisma.account.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({ ok: false, error: 'That username is taken' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const account = await prisma.account.create({
      data: { fullName, username, passwordHash, role: 'dealer' },
    })

    const token = signSession({ sub: account.id, username: account.username, fullName: account.fullName, role: account.role })
    const res = NextResponse.json({ ok: true, user: { id: account.id, username: account.username, fullName: account.fullName, role: account.role } })
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionMaxAge(true) / 1000,
      path: '/',
    })
    return res
  } catch (error) {
    console.error('[POST /api/auth/signup]', error)
    return NextResponse.json({ ok: false, error: 'Something went wrong. Try again.' }, { status: 500 })
  }
}
