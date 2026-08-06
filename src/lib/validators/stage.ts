export type DocType =
  | 'aadhaar' | 'pan' | 'gstin' | 'incorporation' | 'balance_sheet'
  | 'itr' | 'bank_stmt' | 'net_worth' | 'lease' | 'floor_plan'
  | 'geo_photo' | 'geo_video' | 'loi' | 'dealer_agreement' | 'nda'
  | 'cancelled_cheque' | 'lms_cert' | 'safety_checklist' | 'po'

export type VerifyApi = 'sandbox' | 'perfios' | 'whitebooks' | 'eko' | 'manual' | 'none'

export interface DocRequirement {
  docType: DocType
  label: string
  hint: string
  verifyApi: VerifyApi
  required: boolean
  accept: string
}

export interface StageConfig {
  stage: number
  name: string
  dept: string
  estimatedDays: string
  costRange: string
  description: string
  docs: DocRequirement[]
}

export const STAGE_CONFIGS: StageConfig[] = [
  {
    stage: 1,
    name: 'KYC & Entity Verification',
    dept: 'Compliance Team',
    estimatedDays: '3-5 days',
    costRange: '₹0',
    description: 'Submit identity and entity documents for KYC verification.',
    docs: [
      { docType: 'aadhaar', label: 'Aadhaar Card', hint: 'Promoter Aadhaar (front & back)', verifyApi: 'sandbox', required: true, accept: 'image/jpeg,image/png,application/pdf' },
      { docType: 'pan', label: 'PAN Card', hint: 'Business or Proprietor PAN', verifyApi: 'sandbox', required: true, accept: 'image/jpeg,image/png,application/pdf' },
      { docType: 'gstin', label: 'GSTIN Certificate', hint: 'GST registration certificate', verifyApi: 'whitebooks', required: true, accept: 'image/jpeg,image/png,application/pdf' },
      { docType: 'incorporation', label: 'Incorporation / Registration', hint: 'MOA, AOA or Partnership deed', verifyApi: 'none', required: true, accept: 'application/pdf' },
    ],
  },
  {
    stage: 2,
    name: 'Financial Due Diligence',
    dept: 'Finance Team',
    estimatedDays: '5-7 days',
    costRange: '₹0',
    description: 'Submit financial documents to verify net worth and business health.',
    docs: [
      { docType: 'balance_sheet', label: 'Balance Sheet (Last 3 Years)', hint: 'CA-certified balance sheets', verifyApi: 'perfios', required: true, accept: 'application/pdf' },
      { docType: 'itr', label: 'Income Tax Returns (Last 3 Years)', hint: 'ITR filings for last 3 FYs', verifyApi: 'perfios', required: true, accept: 'application/pdf' },
      { docType: 'bank_stmt', label: 'Bank Statement (12 months)', hint: 'Primary business account statement', verifyApi: 'perfios', required: true, accept: 'application/pdf' },
      { docType: 'net_worth', label: 'Net Worth Certificate', hint: 'CA-certified net worth certificate', verifyApi: 'perfios', required: true, accept: 'application/pdf' },
      { docType: 'cancelled_cheque', label: 'Cancelled Cheque', hint: 'Business account cancelled cheque', verifyApi: 'eko', required: true, accept: 'image/jpeg,image/png,application/pdf' },
    ],
  },
  {
    stage: 3,
    name: 'Site Assessment',
    dept: 'Infrastructure Team',
    estimatedDays: '7-10 days',
    costRange: '₹5,000 - ₹15,000',
    description: 'Submit site documents and geo-tagged photos for location assessment.',
    docs: [
      { docType: 'lease', label: 'Lease / Ownership Agreement', hint: 'Property lease or ownership deed', verifyApi: 'none', required: true, accept: 'application/pdf' },
      { docType: 'floor_plan', label: 'Floor Plan', hint: 'Showroom and workshop layout plan', verifyApi: 'none', required: true, accept: 'image/jpeg,image/png,application/pdf' },
      { docType: 'geo_photo', label: 'Geo-tagged Site Photos', hint: 'Min 5 photos with GPS metadata', verifyApi: 'none', required: true, accept: 'image/jpeg,image/png' },
      { docType: 'geo_video', label: 'Site Walkthrough Video', hint: 'Video with GPS metadata (max 100MB)', verifyApi: 'none', required: false, accept: 'video/mp4,video/quicktime' },
    ],
  },
  {
    stage: 4,
    name: 'Contract & Agreements',
    dept: 'Legal Team',
    estimatedDays: '3-5 days',
    costRange: '₹50,000 - ₹2,00,000',
    description: 'Review and e-sign dealership agreements via Aadhaar OTP.',
    docs: [
      { docType: 'loi', label: 'Letter of Intent (LOI)', hint: 'Signed via Aadhaar OTP on Leegality', verifyApi: 'none', required: true, accept: 'application/pdf' },
      { docType: 'dealer_agreement', label: 'Dealer Agreement', hint: 'Main dealership agreement', verifyApi: 'none', required: true, accept: 'application/pdf' },
      { docType: 'nda', label: 'Non-Disclosure Agreement', hint: 'Confidentiality agreement', verifyApi: 'none', required: true, accept: 'application/pdf' },
    ],
  },
  {
    stage: 5,
    name: 'Training & Go-Live',
    dept: 'Operations Team',
    estimatedDays: '14-21 days',
    costRange: '₹1,00,000 - ₹5,00,000',
    description: 'Complete staff training, LMS certification, and safety checklist.',
    docs: [
      { docType: 'lms_cert', label: 'LMS Training Certificates', hint: 'Staff training completion certificates', verifyApi: 'none', required: true, accept: 'application/pdf,image/jpeg,image/png' },
      { docType: 'safety_checklist', label: 'Safety Checklist', hint: 'Signed safety compliance checklist', verifyApi: 'none', required: true, accept: 'application/pdf' },
      { docType: 'po', label: 'Purchase Order', hint: 'Initial vehicle purchase order', verifyApi: 'none', required: true, accept: 'application/pdf' },
    ],
  },
]

export function getStageConfig(stage: number): StageConfig | undefined {
  return STAGE_CONFIGS.find(s => s.stage === stage)
}

export function getRequiredDocs(stage: number): DocRequirement[] {
  return getStageConfig(stage)?.docs.filter(d => d.required) ?? []
}
