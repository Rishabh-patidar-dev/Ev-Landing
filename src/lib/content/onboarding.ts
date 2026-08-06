// Applicant-facing 5-stage journey — the narrative a prospective dealer sees.
// Sourced from the EV Dealer Onboarding process map (the 5 lifecycle stages),
// used by the landing page's process section. This is the story of the journey,
// not the CRM's internal pipeline enum.

export type JourneyStage = {
  n: number
  title: string
  dept: string
  blurb: string
  docs: string[]
  cost: string
}

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    n: 1,
    title: 'Application & E-KYC',
    dept: 'Network Development',
    blurb:
      'Register your interest and validate your identity and business online. No capital deployed — just proof you are who you say you are.',
    docs: ['Aadhaar & PAN', 'GSTIN certificate', 'Incorporation / partnership deed', 'Trade licence'],
    cost: 'Processing fee only',
  },
  {
    n: 2,
    title: 'Financial Vetting',
    dept: 'Finance & Risk',
    blurb:
      'We confirm the working capital and financial health to sustain the franchise, using audited statements and banking data.',
    docs: ['3-yr audited financials', 'CA net-worth certificate', '6-month bank statements', 'ITR (3 years)'],
    cost: 'Prove ₹50L – ₹2Cr+ net worth',
  },
  {
    n: 3,
    title: 'Virtual Site Assessment',
    dept: 'Retail Infrastructure',
    blurb:
      'Your proposed showroom is validated remotely with geo-tagged media and satellite imagery against brand guidelines.',
    docs: ['Geo-tagged walkthrough', 'Title deed / lease (3–5 yr)', 'CAD floor plan'],
    cost: 'Layout design fees',
  },
  {
    n: 4,
    title: 'Digital LOI & E-Sign',
    dept: 'Legal & Commercial',
    blurb:
      'Contracts are executed remotely via Aadhaar-linked e-signature, and initial commercial deposits are placed.',
    docs: ['Signed LOI & dealer agreement', 'NDA', 'Cancelled cheque for payouts'],
    cost: 'Franchise fee & deposit (₹12L – ₹35L)',
  },
  {
    n: 5,
    title: 'Certification & Handover',
    dept: 'Training & Dispatch',
    blurb:
      'Your team completes EV safety and systems training. Once certified, your first inventory is dispatched.',
    docs: ['Staff KYC & roles', 'LMS completion certificates', 'Initial inventory indent'],
    cost: 'Initial inventory (₹25L – ₹1Cr+)',
  },
]

// The document checklist the CRM seeds when an application enters Stage 1
// (OnboardingStage.APPLICATION). Keys match ONBOARDING_DOC_CATALOG.APPLICATION
// so anything uploaded here lines up with what the network team sees.
export type ApplicationDoc = {
  docKey: string
  label: string
  required: boolean
}

export const APPLICATION_DOCS: ApplicationDoc[] = [
  { docKey: 'IDENTITY_PROOF', label: 'Identity proof (Aadhaar / Passport / Voter ID)', required: true },
  { docKey: 'PAN_INDIVIDUAL', label: 'Individual PAN card', required: true },
  { docKey: 'PAN_CORPORATE', label: 'Corporate PAN (if existing entity)', required: false },
  { docKey: 'ENTITY_PROOF', label: 'Incorporation certificate / partnership deed', required: false },
  { docKey: 'GSTIN_CERTIFICATE', label: 'GST registration certificate', required: true },
  { docKey: 'PROMOTER_PROFILE', label: 'Profile / resume of primary investor', required: false },
]
