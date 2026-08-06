import { Check } from 'lucide-react'

const groups = [
  {
    title: 'Identity & entity',
    items: [
      'Aadhaar & PAN of promoters/directors',
      'Company PAN',
      'GSTIN registration certificate',
      'Certificate of incorporation / partnership deed',
      'Shop & establishment / trade licence',
    ],
  },
  {
    title: 'Financial standing',
    items: [
      'Audited balance sheets & P&L (last 3 years)',
      'CA-certified net-worth certificate',
      'Bank statements (last 6 months)',
      'Income tax returns (last 3 years)',
    ],
  },
  {
    title: 'Premises & legal',
    items: [
      'Property title deed or registered lease (3–5 yr)',
      'Geo-tagged photos & video walkthrough',
      'CAD / blueprint floor plan',
      'Cancelled cheque for payout mapping',
    ],
  },
  {
    title: 'Team & readiness',
    items: [
      'Staff details & digital KYC',
      'LMS course completion (battery safety)',
      'Workshop safety compliance checklist',
      'Initial inventory indent',
    ],
  },
]

export function Requirements() {
  return (
    <section id="requirements" className="bg-brand-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-14 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-slate">
            Come prepared
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            What you’ll need along the way
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink/60">
            You don’t need everything on day one — documents are requested stage by
            stage. Here’s the full picture so there are no surprises.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.title} className="rounded-xl border border-ink/[0.08] bg-brand-white p-6">
              <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-ink/50">
                {g.title}
              </h3>
              <ul className="space-y-2.5">
                {g.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink/75">
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-slate/15">
                      <Check className="h-3 w-3 text-slate" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
