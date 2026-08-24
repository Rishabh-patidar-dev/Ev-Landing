// Optional-document upload for the Apply wizard. No account/session
// required — a dealer applicant shouldn't need to sign up just to attach a
// PDF. Files are namespaced by a random per-visit id the client generates
// (ApplicationWizard's `sessionId`), not a login identity.
//
// Uploads go through supabaseStorage.ts, which uploads to the same
// Supabase Storage bucket the rest of the app uses when configured, falling
// back to local disk (this app's own .uploads/, served via the GET handler
// below) for local dev with zero setup. Image uploads also get a plain-text
// OCR pass (ocr.ts) — the extracted text rides along in the response and is
// forwarded to the CRM alongside the file so staff/dealer views can show a
// preview, same as the purchase-invoice OCR feature.
import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/storage/supabaseStorage'
import { extractText } from '@/lib/ocr'
import { resolveUploadPath } from '@/lib/storage/localBlob'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file')
    const docKey = form.get('docKey')
    const sessionId = form.get('sessionId')
    if (!(file instanceof File) || typeof docKey !== 'string' || typeof sessionId !== 'string' || !sessionId) {
      return NextResponse.json({ ok: false, error: 'Missing file, docKey or sessionId' }, { status: 400 })
    }

    // sessionId is client-generated (crypto.randomUUID()) — validate shape
    // before using it in a storage path.
    if (!/^[0-9a-f-]{36}$/i.test(sessionId)) {
      return NextResponse.json({ ok: false, error: 'Invalid session id' }, { status: 400 })
    }

    const relativePath = `applications/${sessionId}/${docKey}/${Date.now()}_${file.name}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploaded = await uploadFile(buffer, relativePath, file.type)
    const url = uploaded.url || `${req.nextUrl.origin}/api/apply/upload?path=${encodeURIComponent(relativePath)}`

    let ocrExtractedText: string | null = null
    let ocrStatus: 'DONE' | 'FAILED' | 'SKIPPED' = 'SKIPPED'
    if (file.type?.startsWith('image/')) {
      try {
        ocrExtractedText = await extractText(buffer)
        ocrStatus = 'DONE'
      } catch {
        ocrStatus = 'FAILED'
      }
    }

    return NextResponse.json({ ok: true, path: relativePath, url, ocrExtractedText, ocrStatus })
  } catch (error) {
    console.error('[POST /api/apply/upload]', error)
    return NextResponse.json({ ok: false, error: 'That file could not be uploaded' }, { status: 500 })
  }
}

// GET: stream a previously uploaded file back (used only internally — the
// CRM's rawPayload stores the path, not a public link).
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const relativePath = searchParams.get('path')
    if (!relativePath || !relativePath.startsWith('applications/')) {
      return NextResponse.json({ error: 'Missing or invalid path' }, { status: 400 })
    }
    const { readFile } = await import('fs/promises')
    const absolute = resolveUploadPath(relativePath)
    const bytes = await readFile(absolute)
    return new NextResponse(bytes, { headers: { 'Content-Disposition': 'inline' } })
  } catch (error) {
    console.error('[GET /api/apply/upload]', error)
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
