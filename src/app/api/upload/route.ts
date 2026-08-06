import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma/client'
import { resolveUploadPath, signBlobPath } from '@/lib/storage/localBlob'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { dealerId, stage, docType, fileName, contentType } = body

    if (!dealerId || !stage || !docType || !fileName || !contentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify dealer belongs to this user
    const dealer = await prisma.dealer.findFirst({
      where: { id: dealerId, authId: session.sub },
    })

    if (!dealer) {
      return NextResponse.json({ error: 'Dealer not found or access denied' }, { status: 403 })
    }

    const relativePath = `${session.sub}/${dealerId}/${stage}/${docType}/${Date.now()}_${fileName}`
    const token = signBlobPath(relativePath)
    const signedUrl = `${req.nextUrl.origin}/api/upload/blob?path=${encodeURIComponent(relativePath)}&token=${token}`

    // Create or update document record using the unique compound key
    const doc = await prisma.document.upsert({
      where: { dealerId_stage_docType: { dealerId, stage, docType } },
      update: {
        storagePath: relativePath,
        verifyStatus: 'verifying',
        uploadedAt: new Date(),
      },
      create: {
        dealerId,
        stage,
        docType,
        storagePath: relativePath,
        verifyStatus: 'verifying',
        uploadedAt: new Date(),
      },
    })

    return NextResponse.json({
      signedUrl,
      documentId: doc.id,
      path: relativePath,
    })
  } catch (error) {
    console.error('[POST /api/upload]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: stream the file back (auth-gated + path-signature-gated, matching
// the level of access the old Supabase signed-URL redirect gave).
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const relativePath = searchParams.get('path')

    if (!relativePath) {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 })
    }

    const absolute = resolveUploadPath(relativePath)
    await stat(absolute) // throws if missing
    const bytes = await readFile(absolute)
    return new NextResponse(bytes, { headers: { 'Content-Disposition': 'inline' } })
  } catch (error) {
    console.error('[GET /api/upload]', error)
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
