import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma/client'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 })
  }

  const dealer = await prisma.dealer.findFirst({
    where: { authId: session.sub },
    select: { id: true },
  })

  return NextResponse.json({
    ok: true,
    user: {
      id: session.sub,
      username: session.username,
      fullName: session.fullName,
      role: session.role,
      dealerId: dealer?.id ?? null,
    },
  })
}
