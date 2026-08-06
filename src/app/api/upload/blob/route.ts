// The signed-URL target DocumentUploadZone's XHR PUT actually writes to —
// mirrors Supabase Storage's createSignedUploadUrl contract closely enough
// that the upload widget didn't need to change, just what it points at.
import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { resolveUploadPath, verifyBlobPath } from '@/lib/storage/localBlob'

export async function PUT(req: NextRequest) {
  const relativePath = req.nextUrl.searchParams.get('path')
  const token = req.nextUrl.searchParams.get('token')
  if (!relativePath || !token || !verifyBlobPath(relativePath, token)) {
    return NextResponse.json({ error: 'Invalid or expired upload link' }, { status: 403 })
  }

  try {
    const absolute = resolveUploadPath(relativePath)
    await mkdir(path.dirname(absolute), { recursive: true })
    const bytes = Buffer.from(await req.arrayBuffer())
    await writeFile(absolute, bytes)
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('[PUT /api/upload/blob]', error)
    return NextResponse.json({ error: 'Could not store file' }, { status: 500 })
  }
}
