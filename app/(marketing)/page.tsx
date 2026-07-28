import Navbar from '@/components/marketing/Navbar'
import Hero from '@/components/marketing/Hero'
import StatsBar from '@/components/marketing/StatsBar'
import ProblemSection from '@/components/marketing/ProblemSection'
import FeaturesSection from '@/components/marketing/FeaturesSection'
import HowItWorks from '@/components/marketing/HowItWorks'
import FinalCTA from '@/components/marketing/FinalCTA'
import Footer from '@/components/marketing/Footer'
import dynamic from 'next/dynamic'

const PricingSection = dynamic(() => import('@/components/marketing/PricingSection'), {
  loading: () => <div className="py-24 md:py-32 border-t border-line" />,
  ssr: false,
})

const FaqSection = dynamic(() => import('@/components/marketing/FaqSection'), {
  loading: () => <div className="py-24 md:py-32 border-t border-line" />,
  ssr: false,
})

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg">
      <Navbar />
      <Hero />
      <StatsBar />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <FaqSection />
      <FinalCTA />
      <Footer />
    </main>
  )
}
