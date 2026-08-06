import { Fingerprint, MapPin, PenTool, LineChart, GraduationCap, Lock } from 'lucide-react'

const features = [
  {
    icon: Fingerprint,
    title: 'Automated KYC',
    body: 'Aadhaar, PAN and GSTIN verified against source in minutes — no couriered photocopies.',
  },
  {
    icon: LineChart,
    title: 'Financial due diligence',
    body: 'Net-worth and bank-statement analysis handled digitally, so approvals don’t stall for weeks.',
  },
  {
    icon: MapPin,
    title: 'Geo-tagged site check',
    body: 'Validate your showroom remotely with GPS-stamped photos and video — no first-round site visit needed.',
  },
  {
    icon: PenTool,
    title: 'Aadhaar e-signatures',
    body: 'Sign the LOI and dealer agreement from anywhere with legally binding OTP-based e-sign.',
  },
  {
    icon: GraduationCap,
    title: 'Staff training & LMS',
    body: 'Track high-voltage safety and systems certification for your team before go-live.',
  },
  {
    icon: Lock,
    title: 'One secure record',
    body: 'Every document and stage transition is stored against your application — nothing lost in email.',
  },
]

export function WhyPartner() {
  return (
    <section className="border-y border-ink/[0.06] bg-sand/10 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-14 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-slate">
            Why apply here
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Built to move you forward, not slow you down
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/[0.08] bg-ink/[0.06] sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="bg-brand-white p-7 transition-colors hover:bg-sand/[0.15]">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate/10">
                <f.icon className="h-5 w-5 text-slate" />
              </span>
              <h3 className="mt-5 text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
