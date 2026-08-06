// Optional-document upload for the Apply wizard — single-step multipart,
// unlike /api/upload's two-step signed-URL dance (that one preserves an
// existing widget's XHR-PUT contract; this one is new code with no such
// constraint). Local disk, gated by session — see src/lib/storage/localBlob.ts.
import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { getSession } from '@/lib/auth/session'
import { resolveUploadPath } from '@/lib/storage/localBlob'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Sign in to attach documents' }, { status: 401 })
  }

  try {
    const form = await req.formData()
    const file = form.get('file')
    const docKey = form.get('docKey')
    if (!(file instanceof File) || typeof docKey !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing file or docKey' }, { status: 400 })
    }

    const relativePath = `${session.sub}/application/${docKey}/${Date.now()}_${file.name}`
    const absolute = resolveUploadPath(relativePath)
    await mkdir(path.dirname(absolute), { recursive: true })
    await writeFile(absolute, Buffer.from(await file.arrayBuffer()))

    const url = `${req.nextUrl.origin}/api/upload?path=${encodeURIComponent(relativePath)}`
    return NextResponse.json({ ok: true, path: relativePath, url })
  } catch (error) {
    console.error('[POST /api/apply/upload]', error)
    return NextResponse.json({ ok: false, error: 'That file could not be uploaded' }, { status: 500 })
  }
}
