import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma/client'
import { signSession, sessionMaxAge, SESSION_COOKIE } from '@/lib/auth/session'

const schema = z.object({
  username: z.string().min(1, 'Enter your username'),
  password: z.string().min(1, 'Enter your password'),
  remember: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Enter your username and password' }, { status: 400 })
    }
    const { username, password, remember } = parsed.data

    const account = await prisma.account.findUnique({ where: { username } })
    if (!account || !account.passwordHash) {
      return NextResponse.json({ ok: false, error: 'Invalid username or password' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, account.passwordHash)
    if (!valid) {
      return NextResponse.json({ ok: false, error: 'Invalid username or password' }, { status: 401 })
    }

    const maxAgeMs = sessionMaxAge(Boolean(remember))
    const token = signSession(
      { sub: account.id, username: account.username, fullName: account.fullName, role: account.role },
      maxAgeMs
    )

    const res = NextResponse.json({ ok: true, user: { id: account.id, username: account.username, fullName: account.fullName, role: account.role } })
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      ...(remember ? { maxAge: maxAgeMs / 1000 } : {}), // omit maxAge -> session cookie, dies with the browser
      path: '/',
    })
    return res
  } catch (error) {
    console.error('[POST /api/auth/login]', error)
    return NextResponse.json({ ok: false, error: 'Something went wrong. Try again.' }, { status: 500 })
  }
}
