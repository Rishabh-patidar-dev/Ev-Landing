import { LandingNav } from '@/components/landing/LandingNav'
import { Hero } from '@/components/landing/Hero'
import { StatStrip } from '@/components/landing/StatStrip'
import { ProcessRail } from '@/components/landing/ProcessRail'
import { WhyPartner } from '@/components/landing/WhyPartner'
import { Requirements } from '@/components/landing/Requirements'
import { FAQ } from '@/components/landing/FAQ'
import { EnquiryForm } from '@/components/landing/EnquiryForm'
import { FinalCTA, LandingFooter } from '@/components/landing/FinalCTA'

export default function Home() {
  return (
    <main className="bg-brand-white">
      <LandingNav />
      <Hero />
      <StatStrip />
      <ProcessRail />
      <WhyPartner />
      <Requirements />
      <FAQ />
      <EnquiryForm />
      <FinalCTA />
      <LandingFooter />
    </main>
  )
}
