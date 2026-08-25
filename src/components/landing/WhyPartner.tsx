import { Fingerprint, MapPin, PenTool, LineChart, GraduationCap, Lock, ArrowUpRight } from 'lucide-react'

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
    <section className="bg-brand-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-14 max-w-2xl text-center sm:mx-auto">
          <span className="inline-flex items-center rounded-full bg-mint px-3.5 py-1.5 font-mono text-xs font-medium tracking-widest text-slate">
            WHY APPLY HERE
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Built to move you forward, not slow you down
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group flex flex-col rounded-2xl border border-ink/[0.06] bg-brand-white p-6 transition-all hover:-translate-y-1 hover:border-stone/30 hover:shadow-[0_20px_40px_-24px_rgba(11,23,16,0.25)]"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${i % 2 === 0 ? 'bg-mint text-slate' : 'bg-ink text-stone'}`}>
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/60">{f.body}</p>
              <a href="#process" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-ink">
                Learn more
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint text-slate transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
