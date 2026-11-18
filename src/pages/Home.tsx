import { Hero } from '@/components/site/Hero'
import { FeaturedItineraries } from '@/components/site/FeaturedItineraries'
import { CtaBanner } from '@/components/site/CtaBanner'
import { TrendingDestinations } from '@/components/site/TrendingDestinations'
import { Evolved } from '@/components/site/Evolved'
import { AppSection } from '@/components/site/AppSection'
import { SEO } from '@/components/SEO'
import { seoText } from '@/lib/text'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seoText.home.title}
        description={seoText.home.description}
        canonical="/"
        appendSiteName={false}
      />
      <Hero />
      <FeaturedItineraries />
      <CtaBanner />
      <TrendingDestinations />
      <Evolved />
      <AppSection />
    </div>
  )
}
