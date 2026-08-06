import crypto from 'crypto'

/**
 * Forwards a landing-page submission to the manufacturer's CRM ingestion webhook.
 *
 * The CRM exposes a single dual-intent endpoint:
 *   POST {CRM_INGEST_URL}   ->  default http://localhost:4000/api/v1/ingest/landing-page
 *
 * Intent routing (handled entirely by the CRM):
 *   - intent: "dealership_application"  ->  DealerApplication + Lead + Stage-1 doc checklist
 *   - intent: "retail_inquiry"          ->  Lead + Enquiry (+ lead scoring)
 *
 * If INGEST_WEBHOOK_SECRET is set, we sign the raw body with the same HMAC
 * scheme the CRM verifies (sha256=<hex>, header `x-signature`).
 */

export const CRM_INGEST_URL =
  process.env.CRM_INGEST_URL || 'http://localhost:4000/api/v1/ingest/landing-page'

export type CrmIngestResult = {
  ok: boolean
  status: number
  data: Record<string, unknown>
}

export async function sendToCrm(payload: Record<string, unknown>): Promise<CrmIngestResult> {
  const raw = JSON.stringify(payload)

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const secret = process.env.INGEST_WEBHOOK_SECRET || process.env.LANDINGI_WEBHOOK_SECRET
  if (secret) {
    headers['x-signature'] = `sha256=${crypto.createHmac('sha256', secret).update(raw).digest('hex')}`
  }

  const res = await fetch(CRM_INGEST_URL, {
    method: 'POST',
    headers,
    body: raw,
    // The webhook is a trusted server-to-server call; no caching.
    cache: 'no-store',
  })

  let data: Record<string, unknown> = {}
  try {
    data = (await res.json()) as Record<string, unknown>
  } catch {
    data = {}
  }

  // The CRM returns { ok: true, ... } on success (200) or { ok: false } (422).
  const ok = res.ok && data.ok !== false
  return { ok, status: res.status, data }
}
