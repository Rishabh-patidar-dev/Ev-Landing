import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendToCrm } from '@/lib/crm/ingest'

// Matches the fields the CRM's extractApplicant() understands. Only legalName
// (or contactName) + email are strictly required by the CRM; everything else
// enriches the application. We validate the applicant-facing fields here so we
// can show friendly errors before the round-trip.
const applySchema = z.object({
  contactName: z.string().min(2, 'Enter the primary contact name'),
  legalName: z.string().min(2, 'Enter your registered business name'),
  tradeName: z.string().optional(),
  email: z.string().email('Enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode').optional().or(z.literal('')),
  investmentCapacity: z.string().optional(),
  // File paths already uploaded to Supabase storage (optional). Stored on the
  // CRM side inside rawPayload so the network team can pull them.
  documents: z
    .array(z.object({ docKey: z.string(), label: z.string(), path: z.string(), url: z.string().optional() }))
    .optional(),
  // Attribution — captured from the URL by the client, passed straight through.
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  landing_page_campaign_id: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = applySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const d = parsed.data

    const result = await sendToCrm({
      intent: 'dealership_application',
      contactName: d.contactName,
      legalName: d.legalName,
      tradeName: d.tradeName || undefined,
      email: d.email,
      phone: d.phone,
      gstin: d.gstin || undefined,
      pan: d.pan || undefined,
      city: d.city || undefined,
      state: d.state || undefined,
      pincode: d.pincode || undefined,
      investmentCapacity: d.investmentCapacity || undefined,
      // rawPayload passthrough — the CRM stores the full body.
      uploadedDocuments: d.documents ?? [],
      utm_source: d.utm_source,
      utm_medium: d.utm_medium,
      utm_campaign: d.utm_campaign,
      landing_page_campaign_id: d.landing_page_campaign_id,
    })

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            (result.data.message as string) ||
            'We couldn’t reach the dealership network right now. Please try again in a moment.',
        },
        { status: result.status || 502 }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        applicationId: result.data.applicationId ?? null,
        publicId: result.data.publicId ?? null,
        stage: result.data.stage ?? 'APPLICATION',
        duplicate: result.data.duplicate ?? false,
        message: (result.data.message as string) || 'Application received.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/apply]', error)
    return NextResponse.json(
      { ok: false, error: 'Something went wrong submitting your application.' },
      { status: 500 }
    )
  }
}
