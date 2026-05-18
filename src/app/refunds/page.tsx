import Link from 'next/link';

export const metadata = {
  title: 'Refund Policy | RankMind AI',
  description: 'RankMind AI refund and cancellation policy.',
};

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <Link href="/" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">← Back to Home</Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Refund Policy</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: May 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">1. Overview</h2>
            <p>
              RankMind AI is operated by JEEM AND CO FZE LLC. We offer a 7-day money-back guarantee on all paid subscription plans. If you are not satisfied with your purchase for any reason, you may request a full refund within 7 days of your initial subscription payment.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">2. Eligibility for Refunds</h2>
            <p className="mb-3">You are eligible for a refund if:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Your refund request is submitted within 7 days of the initial charge</li>
              <li>You have not previously received a refund for a RankMind AI subscription</li>
              <li>Your account is in good standing (not suspended for abuse or policy violations)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">3. Non-Refundable Items</h2>
            <p className="mb-3">The following are not eligible for refunds:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Renewal charges after the initial 7-day period</li>
              <li>Partial months of service after cancellation</li>
              <li>Add-on credits or one-time purchases</li>
              <li>Accounts terminated due to violations of our Terms of Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">4. How to Request a Refund</h2>
            <p className="mb-3">To request a refund, please contact us at:</p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p><strong className="text-white">Email:</strong> <a href="mailto:support@rank-mind.com" className="text-violet-400 hover:text-violet-300">support@rank-mind.com</a></p>
              <p className="mt-1"><strong className="text-white">Subject:</strong> Refund Request — [Your Account Email]</p>
              <p className="mt-1 text-white/50 text-sm">Please include your account email address and the reason for your refund request. We aim to respond within 1 business day.</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">5. Processing Time</h2>
            <p>
              Approved refunds are processed within 5–10 business days. The refund will be credited to the original payment method used at the time of purchase. Processing times may vary depending on your bank or card issuer.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">6. Cancellation</h2>
            <p>
              You may cancel your subscription at any time from your account Settings page or by contacting support. Cancellation stops future billing but does not automatically trigger a refund. Your access continues until the end of the current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">7. Contact</h2>
            <p>
              For any questions about this refund policy, please contact us at{' '}
              <a href="mailto:support@rank-mind.com" className="text-violet-400 hover:text-violet-300">support@rank-mind.com</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex gap-6 text-sm text-white/30">
          <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
        </div>
      </div>
    </div>
  );
}
