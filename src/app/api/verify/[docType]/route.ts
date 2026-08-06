import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { verifyAadhaar, verifyPAN, verifyBankAccount } from '@/lib/apis/kyc'
import { verifyGSTIN, verifyFinancials } from '@/lib/apis/gstin'
import { getSession } from '@/lib/auth/session'

type RouteContext = { params: Promise<{ docType: string }> }

const FINANCIAL_DOC_TYPES = ['balance_sheet', 'itr', 'bank_stmt', 'net_worth']

// GET: poll verification status
export async function GET(req: NextRequest, context: RouteContext) {
  const { docType } = await context.params
  const { searchParams } = new URL(req.url)
  const documentId = searchParams.get('documentId')

  if (!documentId) {
    return NextResponse.json({ error: 'Missing documentId' }, { status: 400 })
  }

  const doc = await prisma.document.findUnique({ where: { id: documentId } })
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  return NextResponse.json({
    documentId: doc.id,
    docType,
    verifyStatus: doc.verifyStatus,
    verifyApi: doc.verifyApi,
  })
}

// POST: trigger verification
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { docType } = await context.params
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { documentId, dealerId } = body

    if (!documentId || !dealerId) {
      return NextResponse.json({ error: 'Missing documentId or dealerId' }, { status: 400 })
    }

    const doc = await prisma.document.findUnique({ where: { id: documentId } })
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Update to verifying
    await prisma.document.update({
      where: { id: documentId },
      data: { verifyStatus: 'verifying' },
    })

    // Run verification async
    runVerification(docType, documentId, doc.storagePath ?? '').catch(console.error)

    return NextResponse.json({ documentId, verifyStatus: 'verifying' })
  } catch (error) {
    console.error(`[POST /api/verify/${(await context.params).docType}]`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function runVerification(docType: string, documentId: string, storagePath: string) {
  let result: { verifyStatus: 'verified' | 'failed'; payload: Record<string, unknown>; error?: string }

  try {
    switch (docType) {
      case 'aadhaar': {
        const r = await verifyAadhaar('mock-aadhaar')
        result = r
        break
      }
      case 'pan': {
        const r = await verifyPAN('MOCK1234A', 'Mock Name')
        result = r
        break
      }
      case 'gstin': {
        const r = await verifyGSTIN('22AAAAA0000A1Z5')
        result = r
        break
      }
      case 'cancelled_cheque': {
        const r = await verifyBankAccount('123456789', 'SBIN0001234')
        result = r
        break
      }
      default: {
        if (FINANCIAL_DOC_TYPES.includes(docType)) {
          const r = await verifyFinancials(storagePath, docType)
          result = r
        } else {
          // Manual docs: auto-mark as verified after mock delay
          await new Promise(resolve => setTimeout(resolve, 2000))
          result = {
            verifyStatus: 'verified',
            payload: { source: 'mock', docType, manuallyApproved: true },
          }
        }
      }
    }

    await prisma.document.update({
      where: { id: documentId },
      data: {
        verifyStatus: result.verifyStatus,
        verifyPayload: result.payload as object,
        verifyApi: getVerifyApi(docType),
      },
    })
  } catch (err) {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        verifyStatus: 'failed',
        verifyPayload: { error: err instanceof Error ? err.message : 'Unknown error' } as object,
      },
    })
  }
}

function getVerifyApi(docType: string): string {
  const map: Record<string, string> = {
    aadhaar: 'sandbox',
    pan: 'sandbox',
    gstin: 'whitebooks',
    balance_sheet: 'perfios',
    itr: 'perfios',
    bank_stmt: 'perfios',
    net_worth: 'perfios',
    cancelled_cheque: 'eko',
  }
  return map[docType] ?? 'manual'
}
