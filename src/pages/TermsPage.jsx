import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { LegalHero } from '@/components/legal/LegalHero'
import { LegalMeta } from '@/components/legal/LegalMeta'
import { LegalTableOfContents } from '@/components/legal/LegalTableOfContents'
import { LegalSection } from '@/components/legal/LegalSection'
import { LegalContactCta } from '@/components/legal/LegalContactCta'

const TERMS_SECTIONS = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'about-cardom', title: 'About Cardom' },
  { id: 'user-accounts', title: 'User Accounts' },
  { id: 'marketplace-listings', title: 'Marketplace Listings' },
  { id: 'buying-selling', title: 'Buying & Selling Vehicles' },
  { id: 'vehicle-services', title: 'Vehicle Services' },
  { id: 'insurance-finance', title: 'Insurance & Financing Information' },
  { id: 'subscriptions', title: 'Subscriptions' },
  { id: 'parts-marketplace', title: 'Spare Parts Marketplace' },
  { id: 'roadside-assist', title: 'Roadside Assistance' },
  { id: 'user-responsibilities', title: 'User Responsibilities' },
  { id: 'prohibited-activities', title: 'Prohibited Activities' },
  { id: 'third-party-providers', title: 'Third-Party Providers' },
  { id: 'payments-transactions', title: 'Payments & Transactions' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'disclaimers', title: 'Disclaimers' },
  { id: 'limitation-liability', title: 'Limitation of Liability' },
  { id: 'changes-terms', title: 'Changes to These Terms' },
  { id: 'contact-info', title: 'Contact Information' },
]

export function TermsPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-600/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-96 -left-48 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[180px] pointer-events-none" />

        {/* Hero Section */}
        <LegalHero
          badge="CARDOM TERMS"
          title="The Rules Behind the Road Ahead."
          subtitle="These terms govern your access to and interaction with the Cardom automotive platform concept, its discovery tools, and digital simulation workflows."
          lastUpdated="October 2024"
          effectiveDate="October 28, 2024"
          visualType="terms"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LegalMeta
            version="v2.4-PROTOTYPE"
            documentCode="CDM-TOS-2024"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Table of Contents Column */}
            <div className="lg:col-span-4">
              <LegalTableOfContents sections={TERMS_SECTIONS} />
            </div>

            {/* Content Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* 01. Acceptance of Terms */}
              <LegalSection
                id="acceptance"
                number="01"
                title="Acceptance of Terms"
                highlightText="By navigating, testing, or submitting simulated inputs on the Cardom platform, you acknowledge that you have read and agreed to these terms."
              >
                <p>
                  These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and Cardom regarding your use of the website, mobile-responsive interfaces, and automotive services directory.
                </p>
              </LegalSection>

              {/* 02. About Cardom */}
              <LegalSection
                id="about-cardom"
                number="02"
                title="About Cardom"
              >
                <p>
                  Cardom is an automotive technology platform concept engineered to unify buying, selling, financing, insurance comparisons, subscription tiers, workshop servicing, roadside emergency support, and spare parts discovery into a single digital interface.
                </p>
                <p className="text-zinc-400">
                  Unless explicitly specified otherwise, Cardom acts as an aggregator and technology interface connecting consumers with independent third-party automotive providers, rather than serving as an underwriter or dealership.
                </p>
              </LegalSection>

              {/* 03. User Accounts */}
              <LegalSection
                id="user-accounts"
                number="03"
                title="User Accounts"
              >
                <p>
                  In a production release, access to specific features may require registering an account. Users remain responsible for preserving the confidentiality of their credentials and for all activities initiated under their account profile.
                </p>
              </LegalSection>

              {/* 04. Marketplace Listings */}
              <LegalSection
                id="marketplace-listings"
                number="04"
                title="Marketplace Listings"
              >
                <p>
                  All vehicle listings, technical specifications, mileage figures, and price benchmarks featured across the Car Marketplace are compiled from seller data and illustrative catalog parameters.
                </p>
                <p className="text-zinc-400">
                  Prospective buyers are advised to physically inspect vehicles and conduct independent mechanical verifications prior to completing financial transfers.
                </p>
              </LegalSection>

              {/* 05. Buying & Selling Vehicles */}
              <LegalSection
                id="buying-selling"
                number="05"
                title="Buying & Selling Vehicles"
              >
                <p>
                  Cardom provides digital tools to streamline price discovery and buyer-seller matchmaking. Legal title transfer, statutory tax liabilities, registration endorsements, and physical delivery remain the contractual responsibility of the transacting parties.
                </p>
              </LegalSection>

              {/* 06. Vehicle Services */}
              <LegalSection
                id="vehicle-services"
                number="06"
                title="Vehicle Services"
              >
                <p>
                  Scheduled maintenance packages, oil services, and mechanical overhauls booked through Cardom are fulfilled by certified independent partner workshops. Cardom establishes verified operating standards but does not directly operate maintenance garages.
                </p>
              </LegalSection>

              {/* 07. Insurance & Financing Information */}
              <LegalSection
                id="insurance-finance"
                number="07"
                title="Insurance & Financing Information"
                highlightText="Calculators, interest rates, and loan EMIs shown on Cardom are illustrative approximations and do not constitute a guaranteed credit offer or underwritten policy."
              >
                <p>
                  Insurance policy options, premium quotes, and loan schedules displayed within our calculators are generated based on user input parameters and representative market rates. Formal approvals remain subject to lender credit assessments and underwriter verification.
                </p>
              </LegalSection>

              {/* 08. Subscriptions */}
              <LegalSection
                id="subscriptions"
                number="08"
                title="Subscriptions"
              >
                <p>
                  Vehicle subscription models represent all-inclusive driving arrangements. Subscription agreements, mileage allowance caps, security deposits, and return condition assessments are governed by specific vehicle provider contracts.
                </p>
              </LegalSection>

              {/* 09. Spare Parts Marketplace */}
              <LegalSection
                id="parts-marketplace"
                number="09"
                title="Spare Parts Marketplace"
              >
                <p>
                  Product specifications, OEM SKUs, and vehicle fitment tables provided within the Spare Parts catalog are intended for guidance. Cardom recommends confirming vehicle chassis numbers with workshop technicians before component installation.
                </p>
              </LegalSection>

              {/* 10. Roadside Assistance */}
              <LegalSection
                id="roadside-assist"
                number="10"
                title="Roadside Assistance"
              >
                <p>
                  Roadside assistance response times (such as 24–45 minutes) displayed across the prototype are demo/illustrative estimates. Actual arrival times depend on traffic conditions, weather severity, and vehicle patrol proximity.
                </p>
              </LegalSection>

              {/* 11. User Responsibilities */}
              <LegalSection
                id="user-responsibilities"
                number="11"
                title="User Responsibilities"
              >
                <p>
                  Users agree to provide accurate information when utilizing valuation engines, service booking wizards, and contact channels, and to uphold respectful communication with service staff and partner mechanics.
                </p>
              </LegalSection>

              {/* 12. Prohibited Activities */}
              <LegalSection
                id="prohibited-activities"
                number="12"
                title="Prohibited Activities"
              >
                <p>
                  Users may not engage in automated scraping, reverse engineering, fraudulent listing submissions, transmission of malicious code, or unauthorized interference with Cardom’s telemetry or routing systems.
                </p>
              </LegalSection>

              {/* 13. Third-Party Providers */}
              <LegalSection
                id="third-party-providers"
                number="13"
                title="Third-Party Providers"
              >
                <p>
                  Cardom interacts with independent workshops, recovery towing operators, financial institutions, and insurance companies. Cardom is not responsible for the acts, errors, omissions, warranties, or breaches of independent third-party partners.
                </p>
              </LegalSection>

              {/* 14. Payments & Transactions */}
              <LegalSection
                id="payments-transactions"
                number="14"
                title="Payments & Transactions"
              >
                <p>
                  In this interactive frontend demonstration, no real monetary transactions or banking gateway calls take place. Real payment processing, escrow terms, and invoice settlements will be introduced upon backend launch.
                </p>
              </LegalSection>

              {/* 15. Intellectual Property */}
              <LegalSection
                id="intellectual-property"
                number="15"
                title="Intellectual Property"
              >
                <p>
                  All visual designs, Cardom logos, proprietary cockpit layouts, animations, vector schematics, and text content are the intellectual property of Cardom and are protected by applicable copyright and trademark statutes.
                </p>
              </LegalSection>

              {/* 16. Disclaimers */}
              <LegalSection
                id="disclaimers"
                number="16"
                title="Disclaimers"
              >
                <p>
                  The Cardom platform is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express, implied, or statutory, including warranties of merchantability, fitness for a particular purpose, and non-infringement.
                </p>
              </LegalSection>

              {/* 17. Limitation of Liability */}
              <LegalSection
                id="limitation-liability"
                number="17"
                title="Limitation of Liability"
              >
                <p>
                  To the maximum extent permitted by governing law, Cardom and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or inability to use the platform.
                </p>
              </LegalSection>

              {/* 18. Changes to These Terms */}
              <LegalSection
                id="changes-terms"
                number="18"
                title="Changes to These Terms"
              >
                <p>
                  Cardom reserves the right to amend these Terms at its sole discretion. Continued usage of the platform subsequent to any modifications signifies your full acceptance of the amended Terms.
                </p>
              </LegalSection>

              {/* 19. Contact Information */}
              <LegalSection
                id="contact-info"
                number="19"
                title="Contact Information"
              >
                <p>
                  Questions regarding these Terms of Service may be directed to our team through the official Cardom contact portal.
                </p>
              </LegalSection>
            </div>
          </div>

          <LegalContactCta
            title="Questions regarding our Terms of Service?"
            description="Our legal and operations desk is available to assist with inquiries regarding platform usage rules and provider guidelines."
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

