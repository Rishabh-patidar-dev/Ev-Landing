'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2, User, Mail, Phone, MapPin, CheckCircle2, ArrowRight, ArrowLeft,
  UploadCloud, FileCheck2, Loader2, X,
} from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { validateGSTIN, formatGSTIN } from '@/lib/validators/gstin'
import { validatePAN, formatPAN } from '@/lib/validators/pan'
import { APPLICATION_DOCS } from '@/lib/content/onboarding'

type Uploaded = { docKey: string; label: string; path: string; url?: string }

type Form = {
  contactName: string
  legalName: string
  tradeName: string
  email: string
  phone: string
  city: string
  state: string
  pincode: string
  gstin: string
  pan: string
  investmentCapacity: string
}

const empty: Form = {
  contactName: '', legalName: '', tradeName: '', email: '', phone: '',
  city: '', state: '', pincode: '', gstin: '', pan: '', investmentCapacity: '',
}

const STEPS = ['Your business', 'Location & compliance', 'Documents', 'Review'] as const

function getUtm() {
  if (typeof window === 'undefined') return {}
  const p = new URLSearchParams(window.location.search)
  return {
    utm_source: p.get('utm_source') || undefined,
    utm_medium: p.get('utm_medium') || undefined,
    utm_campaign: p.get('utm_campaign') || undefined,
  }
}

export function ApplicationWizard() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Form>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const [uid, setUid] = useState<string | null>(null)
  const [uploads, setUploads] = useState<Uploaded[]>([])
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [result, setResult] = useState<{ publicId: string | null; message: string } | null>(null)

  // Prefill name from the signed-in account if present.
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.user) {
          setUid(data.user.id)
          setForm((f) => ({ ...f, contactName: f.contactName || data.user.fullName || '' }))
        }
      })
      .catch(() => {})
  }, [])

  const set = (k: keyof Form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  function validateStep(s: number): boolean {
    const e: Partial<Record<keyof Form, string>> = {}
    if (s === 0) {
      if (form.contactName.trim().length < 2) e.contactName = 'Enter the primary contact name'
      if (form.legalName.trim().length < 2) e.legalName = 'Enter your registered business name'
      if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email'
      if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit mobile'
    }
    if (s === 1) {
      if (form.gstin && !validateGSTIN(form.gstin)) e.gstin = 'Check the 15-character GSTIN'
      if (form.pan && !validatePAN(form.pan)) e.pan = 'Invalid PAN format'
      if (form.pincode && !/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a 6-digit pincode'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const back = () => setStep((s) => Math.max(s - 1, 0))

  async function handleUpload(docKey: string, label: string, file: File) {
    if (!uid) return
    setUploadingKey(docKey)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('docKey', docKey)
      const res = await fetch('/api/apply/upload', { method: 'POST', body })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Upload failed')
      setUploads((u) => [...u.filter((x) => x.docKey !== docKey), { docKey, label, path: data.path, url: data.url }])
    } catch {
      setServerError('That file could not be uploaded. Try again or continue without it.')
    } finally {
      setUploadingKey(null)
    }
  }

  const removeUpload = (docKey: string) =>
    setUploads((u) => u.filter((x) => x.docKey !== docKey))

  async function submit() {
    setSubmitting(true)
    setServerError(null)
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, documents: uploads, ...getUtm() }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setServerError(
          typeof data.error === 'string' ? data.error : 'Could not submit. Check your details and try again.'
        )
        return
      }
      setResult({ publicId: data.publicId ?? null, message: data.message })
    } catch {
      setServerError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ---- Success ----
  if (result) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-ink/[0.08] bg-brand-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate/10">
          <CheckCircle2 className="h-8 w-8 text-slate" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold text-ink">Application submitted</h2>
        <p className="mt-2 text-sm text-ink/60">{result.message}</p>
        {result.publicId && (
          <p className="mt-4 rounded-lg bg-sand/15 px-4 py-3 font-mono text-sm text-ink">
            Reference: <span className="font-semibold">{result.publicId}</span>
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-brand-white hover:bg-ink2"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Stepper */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs',
                  i < step ? 'bg-slate text-brand-white' : i === step ? 'bg-stone text-ink' : 'bg-sand/25 text-ink/40',
                ].join(' ')}
              >
                {i < step ? <FileCheck2 className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={['hidden text-xs sm:inline', i === step ? 'text-ink' : 'text-ink/40'].join(' ')}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-ink/10" />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-ink/[0.08] bg-brand-white p-6 shadow-sm sm:p-8">
        {serverError && (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        {/* Step 0 — business */}
        {step === 0 && (
          <div className="space-y-4">
            <Input label="Primary contact name" placeholder="Your name" prefix={<User className="h-4 w-4" />}
              value={form.contactName} onChange={(e) => set('contactName', e.target.value)}
              error={errors.contactName} required />
            <Input label="Registered business name" placeholder="EV Motors Pvt Ltd" prefix={<Building2 className="h-4 w-4" />}
              value={form.legalName} onChange={(e) => set('legalName', e.target.value)}
              error={errors.legalName} required />
            <Input label="Trade / brand name" placeholder="Optional"
              value={form.tradeName} onChange={(e) => set('tradeName', e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Email" type="email" placeholder="you@company.com" prefix={<Mail className="h-4 w-4" />}
                value={form.email} onChange={(e) => set('email', e.target.value)}
                error={errors.email} required />
              <Input label="Mobile" placeholder="9876543210" prefix={<Phone className="h-4 w-4" />}
                value={form.phone} onChange={(e) => set('phone', e.target.value)}
                error={errors.phone} required />
            </div>
          </div>
        )}

        {/* Step 1 — location & compliance */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="City" placeholder="City" prefix={<MapPin className="h-4 w-4" />}
                value={form.city} onChange={(e) => set('city', e.target.value)} />
              <Input label="State" placeholder="State"
                value={form.state} onChange={(e) => set('state', e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Pincode" placeholder="452001"
                value={form.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                error={errors.pincode} />
              <Select label="Investment capacity" placeholder="Select range"
                value={form.investmentCapacity}
                onChange={(e) => set('investmentCapacity', e.target.value)}
                options={[
                  { value: '50L-1Cr', label: '₹50L – ₹1 Cr' },
                  { value: '1Cr-2Cr', label: '₹1 Cr – ₹2 Cr' },
                  { value: '2Cr-5Cr', label: '₹2 Cr – ₹5 Cr' },
                  { value: '5Cr+', label: '₹5 Cr+' },
                ]} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="GSTIN" placeholder="22AAAAA0000A1ZC" className="font-mono uppercase"
                value={form.gstin} onChange={(e) => set('gstin', formatGSTIN(e.target.value))}
                hint="Optional now — required during vetting" error={errors.gstin} />
              <Input label="PAN" placeholder="AAAAA1234A" className="font-mono"
                value={form.pan} onChange={(e) => set('pan', formatPAN(e.target.value))}
                error={errors.pan} />
            </div>
          </div>
        )}

        {/* Step 2 — documents */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-ink/60">
              Optional — attach anything you have ready. The rest is requested stage by
              stage, so you can submit without uploading now.
            </p>
            {!uid && (
              <div className="rounded-lg border border-stone/40 bg-stone/[0.12] px-4 py-3 text-sm text-ink/70">
                <Link href="/login" className="font-medium text-slate underline">Sign in</Link>{' '}
                to attach documents securely. You can still submit the application without them.
              </div>
            )}
            <div className="space-y-2.5">
              {APPLICATION_DOCS.map((doc) => {
                const done = uploads.find((u) => u.docKey === doc.docKey)
                const busy = uploadingKey === doc.docKey
                return (
                  <div key={doc.docKey}
                    className="flex items-center justify-between gap-3 rounded-lg border border-ink/[0.08] px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">{doc.label}</p>
                      {doc.required && <span className="font-mono text-[10px] text-ink/40">RECOMMENDED</span>}
                    </div>
                    {done ? (
                      <button onClick={() => removeUpload(doc.docKey)}
                        className="flex items-center gap-1.5 rounded-md bg-slate/10 px-3 py-1.5 text-xs font-medium text-slate">
                        <FileCheck2 className="h-3.5 w-3.5" /> Attached <X className="h-3 w-3" />
                      </button>
                    ) : (
                      <label className={[
                        'flex cursor-pointer items-center gap-1.5 rounded-md border border-ink/12 px-3 py-1.5 text-xs font-medium text-ink/60 hover:border-ink/30',
                        !uid ? 'pointer-events-none opacity-40' : '',
                      ].join(' ')}>
                        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                        {busy ? 'Uploading' : 'Upload'}
                        <input type="file" className="hidden" disabled={!uid || busy}
                          accept="image/*,application/pdf"
                          onChange={(e) => e.target.files?.[0] && handleUpload(doc.docKey, doc.label, e.target.files[0])} />
                      </label>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 3 — review */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="rounded-lg bg-sand/10 p-5">
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {[
                  ['Contact', form.contactName],
                  ['Business', form.legalName],
                  ['Email', form.email],
                  ['Mobile', form.phone],
                  ['City', form.city || '—'],
                  ['State', form.state || '—'],
                  ['GSTIN', form.gstin || '—'],
                  ['PAN', form.pan || '—'],
                  ['Investment', form.investmentCapacity || '—'],
                  ['Documents', `${uploads.length} attached`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-mono text-[11px] uppercase tracking-wide text-ink/40">{k}</dt>
                    <dd className="truncate text-sm text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <p className="text-xs text-ink/50">
              By submitting, your application is sent to the Voltmark Network Development
              team and enters Stage 1. You’ll be contacted to continue verification.
            </p>
          </div>
        )}

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <button onClick={back}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : <span />}

          {step < STEPS.length - 1 ? (
            <Button onClick={next}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} loading={submitting}>
              Submit application
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
