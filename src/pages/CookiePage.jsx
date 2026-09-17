import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Lock, Save, ShieldCheck, Sparkles, Sliders } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { LegalHero } from '@/components/legal/LegalHero'
import { LegalMeta } from '@/components/legal/LegalMeta'
import { LegalTableOfContents } from '@/components/legal/LegalTableOfContents'
import { LegalSection } from '@/components/legal/LegalSection'
import { LegalContactCta } from '@/components/legal/LegalContactCta'
import { cn } from '@/lib/utils'

const COOKIE_SECTIONS = [
  { id: 'cookie-prefs', title: 'Interactive Cookie Preferences' },
  { id: 'what-are-cookies', title: 'What Are Cookies?' },
  { id: 'how-uses-cookies', title: 'How Cardom Uses Cookies' },
  { id: 'essential-cookies', title: 'Essential Cookies' },
  { id: 'analytics-cookies', title: 'Analytics Cookies' },
  { id: 'preference-cookies', title: 'Preference Cookies' },
  { id: 'marketing-cookies', title: 'Marketing Cookies' },
  { id: 'third-party-tech', title: 'Third-Party Technologies' },
  { id: 'managing-prefs', title: 'Managing Cookie Preferences' },
  { id: 'cookie-retention', title: 'Cookie Retention' },
  { id: 'policy-updates', title: 'Policy Updates' },
  { id: 'contact-us', title: 'Contact Us' },
]

export function CookiePage() {
  // ─── Interactive Cookie Preferences State ─────────────────────────────────
  const [cookiePrefs, setCookiePrefs] = useState({
    essential: true, // always true
    analytics: false,
    preferences: true,
    marketing: false,
  })
  const [savedMessage, setSavedMessage] = useState(false)

  const handleToggle = (key) => {
    if (key === 'essential') return // lock
    setCookiePrefs((prev) => ({ ...prev, [key]: !prev[key] }))
    setSavedMessage(false)
  }

  const handleSavePreferences = () => {
    setSavedMessage(true)
    setTimeout(() => {
      setSavedMessage(false)
    }, 4000)
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-600/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-96 -left-48 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[180px] pointer-events-none" />

        {/* Hero Section */}
        <LegalHero
          badge="CARDOM COOKIES"
          title="A Better Experience, One Signal at a Time."
          subtitle="Learn how cookies and digital telemetry retain your vehicle filter selections, streamline platform navigation, and respect your privacy choices."
          lastUpdated="October 2024"
          effectiveDate="October 28, 2024"
          visualType="cookies"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LegalMeta
            version="v2.4-PROTOTYPE"
            documentCode="CDM-CK-2024"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Table of Contents Column */}
            <div className="lg:col-span-4">
              <LegalTableOfContents sections={COOKIE_SECTIONS} />
            </div>

            {/* Content Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* INTERACTIVE COOKIE PREFERENCES PANEL */}
              <article
                id="cookie-prefs"
                className="scroll-mt-32 rounded-3xl border-2 border-orange-500/50 bg-[#0c0c0c]/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_40px_rgba(249,115,22,0.18)] space-y-6"
              >
                <div className="border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
                    <Sliders className="w-4 h-4" />
                    <span>Interactive Preference Manager</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mt-1">
                    Manage Your Cookie Choices
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Configure which telemetry tokens are stored in your browser session for this demo experience.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Essential */}
                  <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">Essential Cookies</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          ALWAYS ACTIVE
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Required for basic security, routing sessions, and keeping your vehicle selection in memory.
                      </p>
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-white block">Analytics Cookies</span>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Help us understand which automotive calculators and marketplace filters receive the most user interaction.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('analytics')}
                      className={cn(
                        'w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer',
                        cookiePrefs.analytics ? 'bg-orange-500' : 'bg-zinc-800'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full bg-white transition-transform',
                          cookiePrefs.analytics ? 'translate-x-6' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>

                  {/* Preferences */}
                  <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-white block">Preference Cookies</span>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Remembers your selected city for workshop centers, currency formatting (INR), and vehicle specifications.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('preferences')}
                      className={cn(
                        'w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer',
                        cookiePrefs.preferences ? 'bg-orange-500' : 'bg-zinc-800'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full bg-white transition-transform',
                          cookiePrefs.preferences ? 'translate-x-6' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>

                  {/* Marketing */}
                  <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-white block">Marketing Cookies</span>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Enables personalized automotive recommendations for new model launches and seasonal workshop promotions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('marketing')}
                      className={cn(
                        'w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer',
                        cookiePrefs.marketing ? 'bg-orange-500' : 'bg-zinc-800'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full bg-white transition-transform',
                          cookiePrefs.marketing ? 'translate-x-6' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Save Button & Feedback */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </button>

                  <AnimatePresence>
                    {savedMessage && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-mono text-emerald-400 flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Preferences saved locally for this demo.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <p className="text-[10px] text-zinc-500 italic pt-1">
                  *Demonstration control. Cardom does not install third-party advertising scripts or transfer tracking data in this environment.
                </p>
              </article>

              {/* 01. What Are Cookies? */}
              <LegalSection
                id="what-are-cookies"
                number="01"
                title="What Are Cookies?"
              >
                <p>
                  Cookies are compact alphanumeric text files stored on your computer, smartphone, or tablet browser when accessing digital platforms. They allow web applications to recognize your browser over time, retain navigation states, and secure sessions.
                </p>
              </LegalSection>

              {/* 02. How Cardom Uses Cookies */}
              <LegalSection
                id="how-uses-cookies"
                number="02"
                title="How Cardom Uses Cookies"
              >
                <p>
                  Cardom utilizes cookies to ensure platform continuity as you explore different automotive modules—such as preserving vehicles in your saved list, remembering parts in your shopping drawer, and avoiding repeated form entry.
                </p>
              </LegalSection>

              {/* 03. Essential Cookies */}
              <LegalSection
                id="essential-cookies"
                number="03"
                title="Essential Cookies"
              >
                <p>
                  These cookies are technically indispensable for the website to function. They enable core security protections, prevent cross-site request forgery (CSRF), and maintain page routing during active browsing.
                </p>
              </LegalSection>

              {/* 04. Analytics Cookies */}
              <LegalSection
                id="analytics-cookies"
                number="04"
                title="Analytics Cookies"
              >
                <p>
                  Analytics telemetry enables us to collect aggregated, de-identified statistical metrics regarding page load durations, broken links, and which automotive calculators are most frequently configured by visitors.
                </p>
              </LegalSection>

              {/* 05. Preference Cookies */}
              <LegalSection
                id="preference-cookies"
                number="05"
                title="Preference Cookies"
              >
                <p>
                  Preference tokens store your designated language, geographical city for service center recommendations (e.g. Mumbai, Delhi, Bangalore), and active view modes across car inventory tables.
                </p>
              </LegalSection>

              {/* 06. Marketing Cookies */}
              <LegalSection
                id="marketing-cookies"
                number="06"
                title="Marketing Cookies"
              >
                <p>
                  When enabled, marketing cookies measure the performance of platform campaigns and help surface relevant vehicle models or seasonal workshop discounts tailored to your browsing preferences.
                </p>
              </LegalSection>

              {/* 07. Third-Party Technologies */}
              <LegalSection
                id="third-party-tech"
                number="07"
                title="Third-Party Technologies"
              >
                <p>
                  In a production environment, Cardom may integrate verified third-party partners such as content delivery networks (CDNs) or secure payment gateways that deploy domain-specific operational cookies.
                </p>
              </LegalSection>

              {/* 08. Managing Cookie Preferences */}
              <LegalSection
                id="managing-prefs"
                number="08"
                title="Managing Cookie Preferences"
              >
                <p>
                  You can modify your preferences at any time using the Interactive Cookie Preference Manager at the top of this page. Furthermore, most modern browsers allow you to block, delete, or receive warnings before cookies are placed on your machine.
                </p>
              </LegalSection>

              {/* 09. Cookie Retention */}
              <LegalSection
                id="cookie-retention"
                number="09"
                title="Cookie Retention"
              >
                <p>
                  Session cookies expire automatically once you close your browser window. Persistent cookies remain stored for a predefined duration (typically between 30 and 180 days) or until manually purged through your browser settings.
                </p>
              </LegalSection>

              {/* 10. Policy Updates */}
              <LegalSection
                id="policy-updates"
                number="10"
                title="Policy Updates"
              >
                <p>
                  We may periodically revise our Cookie Policy to match evolving regulatory frameworks and technical enhancements across the Cardom ecosystem.
                </p>
              </LegalSection>

              {/* 11. Contact Us */}
              <LegalSection
                id="contact-us"
                number="11"
                title="Contact Us"
              >
                <p>
                  For any questions or clarification regarding how Cardom handles cookies and digital telemetry, please reach out to our team through the official contact portal.
                </p>
              </LegalSection>
            </div>
          </div>

          <LegalContactCta
            title="Have questions about cookies & tracking?"
            description="Our platform engineering and privacy desk is happy to provide technical clarifications regarding our telemetry architecture."
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

