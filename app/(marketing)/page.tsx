/*
<ai_context>
This server page is the marketing homepage.
</ai_context>
*/

"use client"

import { FeaturesSection } from "@/components/landing/features"
import { HeroSection } from "@/components/landing/hero"

export const metadata = {
  title: 'Home | Tech Recruiter CRM',
  description: 'A CRM system designed specifically for tech recruiters'
}

export default function HomePage() {
  return (
    <div className="pb-20">
      <HeroSection />
      {/* social proof */}
      <FeaturesSection />
      {/* pricing */}
      {/* faq */}
      {/* blog */}
      {/* footer */}
    </div>
  )
}
