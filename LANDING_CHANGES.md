# Voltmark Dealers — new marketing landing + application flow

This adds a public, non-dashboard marketing site on top of the existing EV
dealer portal, and wires account creation + dealership applications straight
into the manufacturer's CRM.

## What changed

**New public landing page** — `src/app/page.tsx` (previously a redirect) now
renders a full marketing site:
`src/components/landing/` → `LandingNav`, `Hero`, `StatStrip`, `ProcessRail`
(the 5-stage journey), `WhyPartner`, `Requirements`, `FAQ`, `EnquiryForm`,
`FinalCTA` / `LandingFooter`.

**Account creation** — a real self-service signup (email + password) via
Supabase: `src/app/(auth)/signup/page.tsx` + `src/components/auth/SignupForm.tsx`.
(The existing `/register` lead form and `/login` are untouched.)

**Apply flow** — `src/app/apply/page.tsx` +
`src/components/apply/ApplicationWizard.tsx`: a 4-step form (business →
location/compliance → optional documents → review). Optional documents upload
directly to the existing `dealer-documents` Supabase bucket under the signed-in
user's folder (`{uid}/application/{docKey}/...`), matching the bucket's RLS.

**CRM integration** — the landing sends everything to the CRM's dual-intent
ingestion webhook (`POST /api/v1/ingest/landing-page`), never touching the CRM
DB directly, so its dedup, lead-scoring, stage-seeding and UTM attribution all
run as designed:
- `src/lib/crm/ingest.ts` — shared forwarder (adds HMAC signature if a secret is set).
- `src/app/api/apply/route.ts` — `intent: dealership_application` → creates a
  `DealerApplication` + `Lead` + Stage-1 document checklist in the CRM.
- `src/app/api/enquiry/route.ts` — `intent: retail_inquiry` → creates a
  `Lead` + `Enquiry` (with scoring) in the CRM.

Shared copy lives in `src/lib/content/onboarding.ts` (the applicant-facing
5-stage journey, and the Stage-1 doc keys that mirror the CRM catalog).

## Run it

```bash
cp .env.example .env.local   # fill in Supabase + CRM_INGEST_URL
npm install
npm run dev                  # http://localhost:3000
```

Make sure the CRM API is running and `CRM_INGEST_URL` points at it. Quick check:
`GET {CRM_INGEST_URL}/test` should return `{ success: true }`.

## Flow summary

1. Visitor lands on `/` → creates an account at `/signup`.
2. Signs in, opens `/apply`, fills the form, optionally uploads docs.
3. Submit → `/api/apply` → CRM webhook → application appears in the CRM
   onboarding pipeline for the Network Development team.
4. "Talk to our network team" on the landing → `/api/enquiry` → CRM Leads.
