import Navbar from '@/components/marketing/Navbar'
import Hero from '@/components/marketing/Hero'
import StatsBar from '@/components/marketing/StatsBar'
import ProblemSection from '@/components/marketing/ProblemSection'
import FeaturesSection from '@/components/marketing/FeaturesSection'
import HowItWorks from '@/components/marketing/HowItWorks'
import Testimonials from '@/components/marketing/Testimonials'
import PricingSection from '@/components/marketing/PricingSection'
import FaqSection from '@/components/marketing/FaqSection'
import FinalCTA from '@/components/marketing/FinalCTA'
import Footer from '@/components/marketing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg">
      <Navbar />
      <Hero />
      <StatsBar />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorks />
      <Testimonials />
      <PricingSection />
      <FaqSection />
      <FinalCTA />
      <Footer />
    </main>
  )
}
