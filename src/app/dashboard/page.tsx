'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  LogOut, Check, Lock, Loader2, UploadCloud, Eye, Clock, Building2, IndianRupee, AlertTriangle, ScanText,
} from 'lucide-react'
import { crmFetch, clearStoredToken } from '@/lib/crm/dealerAuth'

const STAGE_ORDER = ['APPLICATION', 'SCREENING_NDA', 'BUSINESS_PROPOSAL', 'DUE_DILIGENCE', 'LEGAL_AGREEMENT'] as const

const STAGE_META: Record<string, { n: number; title: string; dept: string; timeline: string; cost: string; blurb: string }> = {
  APPLICATION: { n: 1, title: 'KYC & Entity Verification', dept: 'Compliance Team', timeline: '3–5 days', cost: 'Free', blurb: 'Submit identity and entity documents for KYC verification.' },
  SCREENING_NDA: { n: 2, title: 'Screening & NDA', dept: 'Compliance Team', timeline: '3–5 days', cost: 'Free', blurb: 'Sign the NDA and Expression of Interest, and clear a CIBIL check.' },
  BUSINESS_PROPOSAL: { n: 3, title: 'Business Proposal', dept: 'Finance & Risk', timeline: '5–7 days', cost: 'Free', blurb: 'Submit your business plan, projections, and proof of funding.' },
  DUE_DILIGENCE: { n: 4, title: 'Due Diligence', dept: 'Finance & Infrastructure', timeline: '7–10 days', cost: '₹5K–₹15K', blurb: 'Financial verification plus a geo-tagged site walkthrough.' },
  LEGAL_AGREEMENT: { n: 5, title: 'Legal Agreement (LOI)', dept: 'Legal & Commercial', timeline: '3–5 days', cost: '₹50K–₹2L', blurb: 'Review and sign your Letter of Intent and dealer agreement.' },
  OPERATIONAL: { n: 6, title: 'Operational', dept: 'Network Development', timeline: '—', cost: '—', blurb: 'Certified and live on the network.' },
}

type Document = {
  id: number
  docKey: string
  label: string
  required: boolean
  status: 'PENDING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED'
  fileUrl: string | null
  notes: string | null
  ocrExtractedText: string | null
}

type Application = {
  id: number
  publicId: string
  legalName: string
  contactName: string
  email: string
  stage: string
  status: string
  rejectionReason: string | null
  documents: Document[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [app, setApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  const load = useCallback(async () => {
    const { ok, data } = await crmFetch('/api/v1/dealer-auth/application')
    if (!ok || !data.ok) {
      clearStoredToken()
      router.push('/login')
      return
    }
    setApp(data.application)
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  // Lightweight polling so a staff-side reject/hold/advance shows up here
  // without a manual refresh — no websockets, just a periodic re-fetch of
  // the same endpoint the initial load already uses.
  useEffect(() => {
    const interval = setInterval(load, 20000)
    return () => clearInterval(interval)
  }, [load])

  async function handleUpload(docKey: string, file: File) {
    setUploadingKey(docKey)
    setError(null)
    try {
      const body = new FormData()
      body.append('docKey', docKey)
      body.append('file', file)
      const { ok, data } = await crmFetch('/api/v1/dealer-auth/documents', { method: 'POST', body })
      if (!ok || !data.ok) throw new Error(data.message || 'Upload failed')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That file could not be uploaded.')
    } finally {
      setUploadingKey(null)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    await crmFetch('/api/v1/dealer-auth/logout', { method: 'POST' })
    clearStoredToken()
    router.push('/login')
  }

  if (loading || !app) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-white">
        <Loader2 className="h-5 w-5 animate-spin text-ink/40" />
      </div>
    )
  }

  const currentIdx = STAGE_ORDER.indexOf(app.stage as (typeof STAGE_ORDER)[number])
  const currentMeta = STAGE_META[app.stage] ?? STAGE_META.OPERATIONAL
  const currentDocs = app.documents.filter((d) => d.docKey && STAGE_META[app.stage])
  const requiredDocs = currentDocs.filter((d) => d.required)
  const verifiedCount = requiredDocs.filter((d) => d.status === 'VERIFIED').length
  const allVerified = requiredDocs.length > 0 && verifiedCount === requiredDocs.length
  const isOperational = app.stage === 'OPERATIONAL'
  const isRejected = app.status === 'REJECTED'
  const isOnHold = app.status === 'ON_HOLD'

  return (
    <div className="min-h-screen bg-brand-white">
      {/* Top bar */}
      <header className="bg-ink">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
              <Image src="/luxus-green-logo.webp" alt="Luxus Green Mobility" width={20} height={20} className="object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-brand-white">Luxus Green Onboarding Portal</p>
              <p className="mt-0.5 text-xs leading-tight text-sand/50">{app.legalName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium leading-tight text-brand-white">{app.contactName}</p>
              <p className="text-xs leading-tight text-sand/50">{app.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-sand/60 transition-colors hover:bg-white/10 hover:text-brand-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      {/* Stage rail */}
      <div className="border-b border-ink/[0.07] bg-sand/10 px-6 py-6">
        <div className="mx-auto flex max-w-6xl items-start gap-2">
          {STAGE_ORDER.map((key, i) => {
            const meta = STAGE_META[key]
            const isDone = i < currentIdx || isOperational
            const isCurrent = key === app.stage
            const isLocked = i > currentIdx
            return (
              <div key={key} className="flex flex-1 items-start">
                <div className="flex flex-1 flex-col items-center text-center">
                  <span
                    className={[
                      'flex h-10 w-10 items-center justify-center rounded-full font-mono text-sm font-semibold',
                      isDone ? 'bg-slate text-brand-white' : isCurrent ? 'border-2 border-stone bg-brand-white text-ink' : 'border border-ink/15 bg-brand-white text-ink/30',
                    ].join(' ')}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : isLocked ? <Lock className="h-3.5 w-3.5" /> : meta.n}
                  </span>
                  <p className={['mt-2 text-xs font-medium', isLocked ? 'text-ink/35' : 'text-ink'].join(' ')}>{meta.title}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-ink/35">
                    {isDone ? 'Completed' : isCurrent ? 'In progress' : 'Upcoming'}
                  </p>
                </div>
                {i < STAGE_ORDER.length - 1 && <span className="mt-5 h-px flex-1 bg-ink/10" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stage detail */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        {isRejected ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
            <h1 className="mt-3 text-2xl font-semibold text-ink">Your application was not approved</h1>
            {app.rejectionReason && (
              <p className="mx-auto mt-3 max-w-md rounded-lg bg-white px-4 py-3 text-sm text-red-700">{app.rejectionReason}</p>
            )}
            <p className="mt-3 text-sm text-ink/60">If you have questions, please reach out to our Network Expansion team.</p>
          </div>
        ) : isOperational ? (
          <div className="rounded-2xl border border-slate/30 bg-slate/5 p-8 text-center">
            <Check className="mx-auto h-8 w-8 text-slate" />
            <h1 className="mt-3 text-2xl font-semibold text-ink">You&rsquo;re fully onboarded</h1>
            <p className="mt-2 text-sm text-ink/60">All 5 stages are complete. Welcome to the network.</p>
          </div>
        ) : (
          <>
            {isOnHold && (
              <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Your application is currently on hold.</p>
                  {app.rejectionReason && <p className="mt-0.5 text-amber-700">{app.rejectionReason}</p>}
                </div>
              </div>
            )}
            <div className="mb-6">
              <p className="font-mono text-xs uppercase tracking-wide text-ink/40">Step {currentMeta.n} of 5</p>
              <h1 className="mt-1 text-2xl font-semibold text-ink">{currentMeta.title}</h1>
              <p className="mt-1 text-sm text-ink/60">{currentMeta.blurb}</p>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-3">
              {[
                { Icon: Building2, label: 'Department', value: currentMeta.dept },
                { Icon: Clock, label: 'Timeline', value: currentMeta.timeline },
                { Icon: IndianRupee, label: 'Cost', value: currentMeta.cost },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="rounded-xl border border-ink/[0.08] bg-brand-white px-4 py-3">
                  <div className="mb-1 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-slate" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/40">{label}</span>
                  </div>
                  <p className="text-sm font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>

            <div className="mb-4 flex items-baseline gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Documents</h2>
              <span className="text-sm font-medium text-slate">{verifiedCount} / {requiredDocs.length} verified</span>
              <div className="ml-1 h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
                <div className="h-full rounded-full bg-slate transition-all" style={{ width: requiredDocs.length ? `${(verifiedCount / requiredDocs.length) * 100}%` : '0%' }} />
              </div>
            </div>

            {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {currentDocs.map((doc) => (
                <DocumentCard key={doc.docKey} doc={doc} busy={uploadingKey === doc.docKey} onUpload={(f) => handleUpload(doc.docKey, f)} />
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-ink/[0.08] bg-sand/10 px-5 py-4 text-sm text-ink/60">
              {allVerified
                ? 'All required documents are verified. Our team will advance you to the next stage shortly.'
                : 'Upload your documents above — our team reviews and verifies each one, then moves you to the next stage.'}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function DocumentCard({ doc, busy, onUpload }: { doc: Document; busy: boolean; onUpload: (file: File) => void }) {
  const [showOcr, setShowOcr] = useState(false)
  const statusStyle: Record<Document['status'], string> = {
    PENDING: 'bg-sand/20 text-ink/50',
    UPLOADED: 'bg-amber-100 text-amber-700',
    VERIFIED: 'bg-slate/15 text-slate',
    REJECTED: 'bg-red-100 text-red-600',
  }

  return (
    <div className="rounded-xl border border-ink/[0.08] bg-brand-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{doc.label}</p>
          {doc.required && <span className="font-mono text-[10px] uppercase text-ink/35">Required</span>}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyle[doc.status]}`}>
          {doc.status}
        </span>
      </div>

      {doc.status === 'REJECTED' && doc.notes && (
        <p className="mt-1.5 text-xs text-red-600">{doc.notes}</p>
      )}

      <div className="mt-3">
        {doc.status === 'VERIFIED' || doc.status === 'UPLOADED' || doc.status === 'REJECTED' ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink/50">{doc.status === 'REJECTED' ? 'Please re-upload' : 'Attached'}</span>
            {doc.fileUrl && (
              <a
                href={`${process.env.NEXT_PUBLIC_CRM_API_URL || 'http://localhost:4000'}${doc.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-slate hover:underline"
              >
                <Eye className="h-3 w-3" /> View
              </a>
            )}
          </div>
        ) : null}
        {(doc.status === 'PENDING' || doc.status === 'REJECTED') && (
          <label className="mt-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink/15 py-2.5 text-xs font-medium text-ink/60 hover:border-slate/40">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
            {busy ? 'Uploading…' : 'Upload'}
            <input type="file" className="hidden" disabled={busy} accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
          </label>
        )}
        {doc.ocrExtractedText && (
          <div className="mt-2">
            <button onClick={() => setShowOcr((s) => !s)} className="flex items-center gap-1 text-[11px] font-medium text-ink/40 hover:text-ink/60">
              <ScanText className="h-3 w-3" /> {showOcr ? 'Hide' : 'Show'} extracted text
            </button>
            {showOcr && (
              <p className="mt-1.5 max-h-24 overflow-y-auto rounded-md bg-sand/10 p-2 text-[11px] text-ink/50">{doc.ocrExtractedText}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
