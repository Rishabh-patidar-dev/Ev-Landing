'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    q: 'Does it cost anything to apply?',
    a: 'Creating an account and submitting your application is free. A non-refundable processing fee applies at Stage 1 (Application & E-KYC). Larger commitments — franchise fee, security deposit, and inventory — only come at Stages 4 and 5, once you’ve advanced.',
  },
  {
    q: 'What net worth do I need to qualify?',
    a: 'It depends on the city tier and format, but you should be able to demonstrate liquidity to invest roughly ₹50 lakh to ₹2 crore or more. Financial vetting happens at Stage 2 using your audited statements and bank data.',
  },
  {
    q: 'Do I need to have premises ready before applying?',
    a: 'No. You can apply first. Site assessment is Stage 3, and it’s done remotely using geo-tagged photos and video, so you don’t need a finished showroom to get started — just a confirmed location and lease or ownership.',
  },
  {
    q: 'How are documents submitted?',
    a: 'Everything is uploaded online against your application. You can add optional documents while applying, and the rest are requested stage by stage. Nothing needs to be couriered.',
  },
  {
    q: 'What happens after I submit?',
    a: 'Your application lands directly with our Network Development team. They review your details, run initial verification, and reach out to guide you into the next stage.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="border-t border-ink/[0.06] bg-brand-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center rounded-full bg-mint px-3.5 py-1.5 font-mono text-xs font-medium tracking-widest text-slate">
            GOOD TO KNOW
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Questions, answered
          </h2>
        </div>

        <div className="divide-y divide-ink/[0.08] border-y border-ink/[0.08]">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-medium text-ink">{f.q}</span>
                  <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-colors ${isOpen ? 'bg-stone text-white' : 'bg-mint text-slate'}`}>
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                <div
                  className={[
                    'grid transition-all duration-300 ease-out',
                    isOpen ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0',
                  ].join(' ')}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl text-sm leading-relaxed text-ink/60">{f.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
