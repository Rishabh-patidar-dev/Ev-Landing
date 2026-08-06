import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendToCrm } from '@/lib/crm/ingest'

// A lightweight "talk to us" form. Routes to the CRM Leads module as a
// retail_inquiry (Lead + Enquiry + lead scoring). Deliberately low-friction:
// name + email required, everything else optional.
const enquirySchema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number').optional().or(z.literal('')),
  company: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  message: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  landing_page_campaign_id: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = enquirySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const d = parsed.data

    const result = await sendToCrm({
      intent: 'retail_inquiry',
      name: d.name,
      email: d.email,
      phone: d.phone || undefined,
      company: d.company || undefined,
      city: d.city || undefined,
      state: d.state || undefined,
      message: d.message || undefined,
      utm_source: d.utm_source,
      utm_medium: d.utm_medium,
      utm_campaign: d.utm_campaign,
      landing_page_campaign_id: d.landing_page_campaign_id,
    })

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: (result.data.message as string) || 'Could not submit right now. Please try again.' },
        { status: result.status || 502 }
      )
    }

    return NextResponse.json({ ok: true, leadId: result.data.leadId ?? null }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/enquiry]', error)
    return NextResponse.json({ ok: false, error: 'Something went wrong.' }, { status: 500 })
  }
}
