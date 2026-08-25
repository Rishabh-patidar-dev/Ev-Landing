import { Star, Quote } from 'lucide-react'

const testimonial = {
  quote:
    'We went from account creation to a signed dealer agreement in under three weeks. The geo-tagged site check alone saved us two site visits — everything just moved.',
  name: 'Rajeev Malhotra',
  role: 'Owner, Malhotra Mobility — Indore',
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export function Testimonial() {
  return (
    <section className="bg-brand-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-5">
        <div className="relative rounded-3xl border border-ink/[0.06] bg-sand/[0.06] p-8 sm:p-10">
          <Quote className="h-9 w-9 text-mint" fill="currentColor" strokeWidth={0} aria-hidden />
          <p className="mt-4 text-xl font-medium leading-relaxed text-ink sm:text-2xl">
            &ldquo;{testimonial.quote}&rdquo;
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone text-sm font-semibold text-white">
                {initials(testimonial.name)}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{testimonial.name}</p>
                <p className="text-xs text-ink/50">{testimonial.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 text-stone" fill="currentColor" strokeWidth={0} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
