import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { LegalHero } from '@/components/legal/LegalHero'
import { LegalMeta } from '@/components/legal/LegalMeta'
import { LegalTableOfContents } from '@/components/legal/LegalTableOfContents'
import { LegalSection } from '@/components/legal/LegalSection'
import { LegalContactCta } from '@/components/legal/LegalContactCta'

const PRIVACY_SECTIONS = [
  { id: 'info-collect', title: 'Information We Collect' },
  { id: 'how-use', title: 'How We Use Information' },
  { id: 'vehicle-data', title: 'Vehicle & Marketplace Data' },
  { id: 'service-data', title: 'Service & Assistance Information' },
  { id: 'cookies-tech', title: 'Cookies & Similar Technologies' },
  { id: 'data-sharing', title: 'Data Sharing' },
  { id: 'data-security', title: 'Data Security' },
  { id: 'data-retention', title: 'Data Retention' },
  { id: 'privacy-rights', title: 'Your Privacy Rights' },
  { id: 'children-privacy', title: "Children's Privacy" },
  { id: 'third-party', title: 'Third-Party Services' },
  { id: 'policy-updates', title: 'Policy Updates' },
  { id: 'contact-us', title: 'Contact Us' },
]

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-600/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-96 -left-48 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[180px] pointer-events-none" />

        {/* Hero Section */}
        <LegalHero
          badge="CARDOM PRIVACY"
          title="Your Data. Your Control."
          subtitle="This document describes how user, vehicle, and communication data is intended to be handled within the Cardom platform architecture."
          lastUpdated="October 2024"
          effectiveDate="October 28, 2024"
          visualType="privacy"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LegalMeta
            version="v2.4-PROTOTYPE"
            documentCode="CDM-PRV-2024"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Table of Contents Column (4 cols) */}
            <div className="lg:col-span-4">
              <LegalTableOfContents sections={PRIVACY_SECTIONS} />
            </div>

            {/* Content Column (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* 01. Information We Collect */}
              <LegalSection
                id="info-collect"
                number="01"
                title="Information We Collect"
                highlightText="In this interactive prototype, data submitted across forms is stored in local browser state and is never transmitted to external databases."
              >
                <p>
                  Cardom is designed around an integrated automotive model. In a production architecture, the platform would collect various categories of data to provide personalized discovery, financing estimates, workshop scheduling, and roadside dispatch.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-white">Directly Provided Account Data:</strong> Name, email address, telephone contact details, and preferences provided through inquiries or vehicle registration.
                  </li>
                  <li>
                    <strong className="text-white">Vehicle Specifications:</strong> Vehicle Identification Numbers (VIN), registration plates, make, model generation, odometer readings, and service requirements.
                  </li>
                  <li>
                    <strong className="text-white">Interaction Telemetry:</strong> Search queries, viewed listings, selected insurance parameters, and preferred workshop centers.
                  </li>
                </ul>
              </LegalSection>

              {/* 02. How We Use Information */}
              <LegalSection
                id="how-use"
                number="02"
                title="How We Use Information"
              >
                <p>
                  Information handled by Cardom is utilized strictly to deliver connected automotive workflows, facilitate transparent communication between vehicle owners and verified service providers, and refine user interface experiences.
                </p>
                <p>
                  Specifically, data is applied to calculate instant loan EMIs, estimate maintenance packages, map roadside patrol proximity, and deliver verified vehicle history dossiers.
                </p>
              </LegalSection>

              {/* 03. Vehicle & Marketplace Data */}
              <LegalSection
                id="vehicle-data"
                number="03"
                title="Vehicle & Marketplace Data"
              >
                <p>
                  When listing a vehicle for sale or evaluating certified pre-owned cars, information concerning vehicle condition, past inspection records, registration territory, and ownership history is compiled into public marketplace listings.
                </p>
                <p className="text-zinc-400">
                  Personal identifying information of individual sellers (such as residential addresses or private contact numbers) is shielded until a verified buyer appointment is confirmed.
                </p>
              </LegalSection>

              {/* 04. Service & Assistance Information */}
              <LegalSection
                id="service-data"
                number="04"
                title="Service & Assistance Information"
              >
                <p>
                  When utilizing our Service & Repair or 24/7 Roadside Assistance modules, location coordinates, reported breakdown symptoms, and appointment timestamps are routed exclusively to assigned recovery crews and certified partner workshop bays.
                </p>
                <p className="text-zinc-400">
                  Location data collected during roadside emergencies is used solely for the duration of incident dispatch and is not used for persistent user tracking.
                </p>
              </LegalSection>

              {/* 05. Cookies & Similar Technologies */}
              <LegalSection
                id="cookies-tech"
                number="05"
                title="Cookies & Similar Technologies"
              >
                <p>
                  Cardom utilizes temporary session cookies and local storage tokens to retain vehicle filter choices, shopping cart components, and preferred currency views. Detailed categorization of our cookie architecture can be inspected in our dedicated Cookie Policy.
                </p>
              </LegalSection>

              {/* 06. Data Sharing */}
              <LegalSection
                id="data-sharing"
                number="06"
                title="Data Sharing"
                highlightText="Cardom does not sell, rent, or trade personal user information to third-party data brokers."
              >
                <p>
                  To fulfill automotive requests, data is shared strictly on a need-to-know basis with:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
                  <li>Verified partner automotive service centers for scheduled mechanical maintenance.</li>
                  <li>Independent roadside assistance recovery fleets responding to active incident pins.</li>
                  <li>Authorized banking and insurance underwriting partners when you request quote calculations.</li>
                </ul>
              </LegalSection>

              {/* 07. Data Security */}
              <LegalSection
                id="data-security"
                number="07"
                title="Data Security"
              >
                <p>
                  While this current environment functions as a frontend product demonstration without live server databases, Cardom’s production security blueprint specifies end-to-end TLS 1.3 encryption, role-based access control (RBAC), and tokenized credential storage.
                </p>
              </LegalSection>

              {/* 08. Data Retention */}
              <LegalSection
                id="data-retention"
                number="08"
                title="Data Retention"
              >
                <p>
                  Personal data will only be retained for as long as necessary to fulfill the purposes for which it was captured, comply with statutory tax and automotive reporting standards, and preserve active service warranty passports.
                </p>
              </LegalSection>

              {/* 09. Your Privacy Rights */}
              <LegalSection
                id="privacy-rights"
                number="09"
                title="Your Privacy Rights"
              >
                <p>
                  Depending on your jurisdiction, drivers possess rights regarding their personal data, including the right to request access, rectification, portability, and permanent deletion of stored vehicle profile records.
                </p>
              </LegalSection>

              {/* 10. Children's Privacy */}
              <LegalSection
                id="children-privacy"
                number="10"
                title="Children's Privacy"
              >
                <p>
                  Cardom provides services designed exclusively for licensed drivers and automotive vehicle owners of legal age. We do not knowingly collect personal data from minors under the age of 18.
                </p>
              </LegalSection>

              {/* 11. Third-Party Services */}
              <LegalSection
                id="third-party"
                number="11"
                title="Third-Party Services"
              >
                <p>
                  The platform may feature external hyperlinks or integrations with partner financiers, insurers, and component suppliers. Cardom is not responsible for the privacy policies or content practices of external websites.
                </p>
              </LegalSection>

              {/* 12. Policy Updates */}
              <LegalSection
                id="policy-updates"
                number="12"
                title="Policy Updates"
              >
                <p>
                  We may periodically revise this Privacy Policy to reflect platform evolution or legal developments. Revised versions will display an updated Effective Date at the top of this page.
                </p>
              </LegalSection>

              {/* 13. Contact Us */}
              <LegalSection
                id="contact-us"
                number="13"
                title="Contact Us"
              >
                <p>
                  If you have inquiries, feedback, or data privacy requests regarding this conceptual policy, please reach out through our official support portal.
                </p>
              </LegalSection>
            </div>
          </div>

          <LegalContactCta
            title="Have a question about our Privacy Policy?"
            description="Our compliance and data architecture desk is available to clarify platform specifications and information handling practices."
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

