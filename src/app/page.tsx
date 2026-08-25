import { LandingNav } from '@/components/landing/LandingNav'
import { Hero } from '@/components/landing/Hero'
import { StatStrip } from '@/components/landing/StatStrip'
import { ProcessRail } from '@/components/landing/ProcessRail'
import { WhyPartner } from '@/components/landing/WhyPartner'
import { DarkCTABanner, PreFooterCTA, LandingFooter } from '@/components/landing/FinalCTA'
import { Requirements } from '@/components/landing/Requirements'
import { Testimonial } from '@/components/landing/Testimonial'
import { FAQ } from '@/components/landing/FAQ'
import { EnquiryForm } from '@/components/landing/EnquiryForm'

export default function Home() {
  return (
    <main className="bg-brand-white">
      <LandingNav />
      <Hero />
      <StatStrip />
      <ProcessRail />
      <WhyPartner />
      <DarkCTABanner />
      <Requirements />
      <Testimonial />
      <FAQ />
      <EnquiryForm />
      <PreFooterCTA />
      <LandingFooter />
    </main>
  )
}
