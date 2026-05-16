import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — RankMind AI',
  description: 'RankMind AI Privacy Policy. Learn how we collect, use, and protect your data.',
};

const LAST_UPDATED = 'May 15, 2026';

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-invert max-w-none space-y-8 text-white/70 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>RankMind AI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at <a href="https://www.rank-mind.com" className="text-violet-400 hover:underline">www.rank-mind.com</a>.</p>
            <p className="mt-3">This policy is compliant with the EU General Data Protection Regulation (GDPR), the UAE Personal Data Protection Law (PDPL Federal Decree-Law No. 45 of 2021), and other applicable data protection laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Data Controller</h2>
            <p>The data controller responsible for your personal data is RankMind AI. For any data-related inquiries, contact us at: <a href="mailto:privacy@rankmind.ai" className="text-violet-400 hover:underline">privacy@rankmind.ai</a></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Information We Collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-white">Account Data:</strong> Name, email address, password (hashed), and profile information provided during registration.</li>
              <li><strong className="text-white">Usage Data:</strong> Pages visited, features used, agent runs, timestamps, and interaction logs.</li>
              <li><strong className="text-white">Technical Data:</strong> IP address, browser type, device information, operating system, and referral URLs.</li>
              <li><strong className="text-white">Payment Data:</strong> Billing information processed securely by Stripe. We do not store full card numbers.</li>
              <li><strong className="text-white">Content Data:</strong> URLs, keywords, and content you submit to our AI agents for analysis.</li>
              <li><strong className="text-white">Communications:</strong> Emails and support messages you send us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. How We Use Your Data</h2>
            <p>We process your personal data for the following purposes and legal bases:</p>
            <div className="mt-3 space-y-3">
              {[
                ['Service Delivery', 'To provide, operate, and maintain the RankMind AI platform and its AI agents.', 'Contract performance'],
                ['Account Management', 'To create and manage your user account, authenticate you, and send transactional emails.', 'Contract performance'],
                ['Billing & Payments', 'To process subscription payments, issue invoices, and manage plan upgrades.', 'Contract performance'],
                ['Product Improvement', 'To analyze usage patterns and improve our AI models, features, and user experience.', 'Legitimate interests'],
                ['Security', 'To detect fraud, prevent abuse, and protect the integrity of our platform.', 'Legitimate interests'],
                ['Legal Compliance', 'To comply with applicable laws, regulations, and legal processes.', 'Legal obligation'],
                ['Marketing (with consent)', 'To send product updates and promotional emails. You may opt out at any time.', 'Consent'],
              ].map(([purpose, desc, basis]) => (
                <div key={purpose} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-white font-medium text-sm">{purpose}</div>
                      <div className="text-white/50 text-sm mt-1">{desc}</div>
                    </div>
                    <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">{basis}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Cookies and Tracking</h2>
            <p>We use cookies and similar tracking technologies to operate and improve our service. Categories of cookies we use:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-white">Strictly Necessary:</strong> Required for authentication, session management, and security. Cannot be disabled.</li>
              <li><strong className="text-white">Analytics:</strong> Help us understand how users interact with our platform (e.g., page views, feature usage). Only activated after your consent.</li>
              <li><strong className="text-white">Preferences:</strong> Remember your settings and preferences (e.g., theme, language).</li>
            </ul>
            <p className="mt-3">You can manage your cookie preferences at any time via our cookie consent banner or your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Third-Party Services</h2>
            <p>We share data with the following trusted third-party processors:</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 text-white/50 font-medium">Service</th>
                    <th className="text-left py-2 pr-4 text-white/50 font-medium">Purpose</th>
                    <th className="text-left py-2 text-white/50 font-medium">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ['Supabase', 'Authentication & database', 'USA (AWS)'],
                    ['Stripe', 'Payment processing', 'USA'],
                    ['OpenAI', 'AI content generation', 'USA'],
                    ['Resend', 'Transactional email delivery', 'USA'],
                    ['Vercel', 'Hosting & infrastructure', 'USA/Global CDN'],
                    ['Google', 'OAuth login, Search API', 'USA/Global'],
                  ].map(([svc, purpose, loc]) => (
                    <tr key={svc}>
                      <td className="py-2 pr-4 text-white">{svc}</td>
                      <td className="py-2 pr-4 text-white/60">{purpose}</td>
                      <td className="py-2 text-white/60">{loc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active or as needed to provide services. Upon account deletion:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Account data is deleted within 30 days.</li>
              <li>Billing records are retained for 7 years as required by financial regulations.</li>
              <li>Anonymized analytics data may be retained indefinitely.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong className="text-white">Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong className="text-white">Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong className="text-white">Erasure:</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;).</li>
              <li><strong className="text-white">Portability:</strong> Receive your data in a structured, machine-readable format.</li>
              <li><strong className="text-white">Objection:</strong> Object to processing based on legitimate interests.</li>
              <li><strong className="text-white">Restriction:</strong> Request restriction of processing in certain circumstances.</li>
              <li><strong className="text-white">Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, email us at <a href="mailto:privacy@rankmind.ai" className="text-violet-400 hover:underline">privacy@rankmind.ai</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. International Data Transfers</h2>
            <p>Your data may be transferred to and processed in countries outside your jurisdiction, including the United States. We ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) approved by the European Commission where applicable.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Security</h2>
            <p>We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest, bcrypt password hashing, and regular security audits. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Children&apos;s Privacy</h2>
            <p>Our service is not directed to individuals under the age of 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or via a prominent notice on our platform. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Contact Us</h2>
            <p>For privacy-related inquiries or to exercise your rights:</p>
            <div className="mt-3 bg-white/5 rounded-xl p-4 border border-white/10 space-y-1 text-sm">
              <div><span className="text-white/40">Email:</span> <a href="mailto:privacy@rankmind.ai" className="text-violet-400 hover:underline">privacy@rankmind.ai</a></div>
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
