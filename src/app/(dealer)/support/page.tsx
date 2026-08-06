import { MessageCircle, Mail, Phone } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Support — EV Dealer Hub' }

export default function SupportPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-ink">Support</h1>
      <p className="text-sand">Need help with your onboarding? Contact our team.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: MessageCircle, title: 'Live Chat', desc: 'Mon–Fri, 9am–6pm IST', action: 'Start Chat' },
          { icon: Mail, title: 'Email Support', desc: 'dealer-support@evhub.in', action: 'Send Email' },
          { icon: Phone, title: 'Phone', desc: '+91 1800-XXX-XXXX', action: 'Call Now' },
        ].map(({ icon: Icon, title, desc, action }) => (
          <Card key={title} className="text-center">
            <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon className="w-5 h-5 text-stone" />
            </div>
            <h3 className="font-semibold text-ink mb-1">{title}</h3>
            <p className="text-xs text-sand mb-3">{desc}</p>
            <button className="text-sm text-slate hover:underline cursor-pointer">{action} →</button>
          </Card>
        ))}
      </div>
    </div>
  )
}
