import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — RankMind AI',
  description: 'RankMind AI Terms of Service. Read our terms before using the platform.',
  alternates: {
    canonical: 'https://www.rank-mind.com/terms',
  },
  openGraph: {
    url: 'https://www.rank-mind.com/terms',
    title: 'Terms of Service — RankMind AI',
    description: 'RankMind AI Terms of Service. Read our terms before using the platform.',
    images: [{ url: 'https://www.rank-mind.com/og-image.png', width: 1200, height: 630 }],
  },
};

const LAST_UPDATED = 'May 15, 2026';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo-icon-v2.png" alt="RankMind AI" className="w-8 h-8 object-contain" />
          <span className="font-bold text-white">RankMind AI</span>
        </Link>
        <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">← Back to Home</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8 text-white/70 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using RankMind AI (&quot;Service&quot;, &quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the Service. These Terms constitute a legally binding agreement between you and RankMind AI.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p>RankMind AI is an AI-powered SEO and GEO (Generative Engine Optimization) platform that provides automated tools including SEO auditing, backlink prospecting, AI visibility analysis, and content generation. The Service is provided on a subscription basis.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Account Registration</h2>
            <p>To use the Service, you must create an account. You agree to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Provide accurate, current, and complete information during registration.</li>
              <li>Maintain the security of your password and account credentials.</li>
              <li>Promptly notify us of any unauthorized use of your account.</li>
              <li>Be responsible for all activity that occurs under your account.</li>
              <li>Not create accounts for the purpose of abusing the Service or circumventing restrictions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Subscription Plans and Billing</h2>
            <p>RankMind AI offers the following subscription tiers: Free, Starter ($29/mo), Growth ($79/mo), and Enterprise ($149/mo). By subscribing to a paid plan, you agree that:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Subscription fees are billed in advance on a monthly or annual basis.</li>
              <li>All payments are processed securely by Stripe.</li>
              <li>Subscriptions automatically renew unless cancelled before the renewal date.</li>
              <li>Refunds are issued at our discretion within 7 days of the initial purchase for first-time subscribers.</li>
              <li>Downgrading your plan takes effect at the end of the current billing period.</li>
              <li>We reserve the right to change pricing with 30 days&apos; notice.</li>
            </ul>
            <div className="mt-5 bg-white/5 border border-white/10 rounded-xl p-4 text-sm space-y-1.5">
              <p>RankMind AI is marketed and operated by <strong className="text-white">Jeem &amp; Co FZE LLC</strong>, Dubai, UAE.</p>
              <p>Research and development is conducted by <strong className="text-white">Arabian AI Lab</strong>, Dubai, UAE.</p>
              <p>All subscription payments are processed by Jeem &amp; Co FZE LLC.</p>
              <p>The charge on your bank statement will appear as <strong className="text-white">&ldquo;JEEM AND CO FZE LLC&rdquo;</strong>.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Acceptable Use Policy</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Violate any applicable laws or regulations.</li>
              <li>Generate spam, unsolicited communications, or deceptive content.</li>
              <li>Conduct link schemes, cloaking, or other black-hat SEO practices.</li>
              <li>Scrape, crawl, or extract data from the platform in an automated manner without authorization.</li>
              <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts.</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service.</li>
              <li>Resell or sublicense access to the Service without written permission.</li>
              <li>Use the Service to harm, threaten, or harass others.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. AI-Generated Content</h2>
            <p>The Service uses artificial intelligence to generate content, analysis, and recommendations. You acknowledge that:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>AI-generated outputs may not always be accurate, complete, or suitable for your specific needs.</li>
              <li>You are solely responsible for reviewing, editing, and publishing any AI-generated content.</li>
              <li>RankMind AI does not guarantee specific SEO rankings or traffic outcomes.</li>
              <li>Content generated by the Service is provided &quot;as is&quot; without warranties of any kind.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Intellectual Property</h2>
            <p>The RankMind AI platform, including its design, code, trademarks, and proprietary AI models, is owned by RankMind AI and protected by intellectual property laws. You retain ownership of content you submit to the platform. By submitting content, you grant us a limited license to process it solely for the purpose of providing the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Privacy</h2>
            <p>Your use of the Service is also governed by our <Link href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Disclaimer of Warranties</h2>
            <p>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, RANKMIND AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or non-payment. You may cancel your account at any time through your account settings. Upon termination, your right to use the Service ceases immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes shall be resolved through binding arbitration in Dubai, UAE, except where prohibited by applicable law.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Changes to Terms</h2>
            <p>We may modify these Terms at any time. We will provide at least 14 days&apos; notice of material changes via email or in-app notification. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">14. Contact</h2>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-1 text-sm">
              <div><span className="text-white/40">Legal inquiries:</span> <a href="mailto:legal@rankmind.ai" className="text-violet-400 hover:underline">legal@rankmind.ai</a></div>
              <div><span className="text-white/40">Support:</span> <a href="mailto:support@rankmind.ai" className="text-violet-400 hover:underline">support@rankmind.ai</a></div>
            </div>
          </section>
        </div>
      </div>

      <footer className="border-t border-white/10 py-8 text-center text-white/30 text-sm">
        <Link href="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
        <span className="mx-3">·</span>
        <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
        <span className="mx-3">·</span>
        <Link href="/" className="hover:text-white/60 transition-colors">RankMind AI</Link>
      </footer>
    </div>
  );
}
