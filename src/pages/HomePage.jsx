import { Navbar }              from '@/components/layout/Navbar'
import { Hero }                from '@/sections/Hero'
import { ServicesShowcase }    from '@/sections/ServicesShowcase'
import { FeaturedCars }        from '@/sections/FeaturedCars'
import { HowItWorks }          from '@/sections/HowItWorks'
import { AutomotiveEcosystem } from '@/sections/AutomotiveEcosystem'
import { FinalCTA }            from '@/sections/FinalCTA'
import { Footer }              from '@/sections/Footer'

/**
 * HomePage — Cardom landing page
 *
 * Sections (in order):
 *   1. Navbar              — fixed glass nav
 *   2. Hero                — full-viewport hero
 *   3. ServicesShowcase    — 8 service cards
 *   4. FeaturedCars        — 6 featured car listings (mock data)
 *   5. HowItWorks          — scroll-driven 4-step storytelling
 *   6. AutomotiveEcosystem — interactive network radial composition
 *   7. FinalCTA            — cinematic closing call to action
 *   8. Footer              — brand, 4-column nav, newsletter, copyright
 */
export function HomePage() {
  return (
    <div className="bg-[#080808] min-h-dvh">
      <Navbar />
      <main>
        <Hero />
        <ServicesShowcase />
        <FeaturedCars />
        <HowItWorks />
        <AutomotiveEcosystem />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
