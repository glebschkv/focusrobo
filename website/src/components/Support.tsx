import { Link } from 'react-router-dom';
import { Nav } from './Nav';
import { Footer } from './Footer';

export function Support() {
  return (
    <div style={{ background: 'var(--bg-cream)', minHeight: '100vh' }}>
      <Nav />
      <main className="max-w-3xl mx-auto px-5 pt-24 pb-20">
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}
        >
          Support
        </h1>
        <p
          style={{
            fontSize: 16,
            color: 'var(--fg-muted)',
            marginBottom: 40,
            maxWidth: 480,
          }}
        >
          Need help? We're here for you. Find answers below or reach out directly.
        </p>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <a
            href="mailto:hello@phono.app"
            className="game-card"
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>📧</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Email Us</h3>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)' }}>
              hello@phono.app
            </p>
            <p style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>
              We typically respond within 24 hours.
            </p>
          </a>

          <a
            href="mailto:privacy@phono.app"
            className="game-card"
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Privacy Requests</h3>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)' }}>
              privacy@phono.app
            </p>
            <p style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>
              Data access, deletion, or correction requests.
            </p>
          </a>
        </div>

        {/* FAQ */}
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <FaqItem
            question="How do I cancel my premium subscription?"
            answer="Open the App → Settings → Account → Manage Subscription. This will redirect you to your Apple ID subscription settings where you can cancel or change your plan. You can also manage subscriptions directly through Settings → Apple ID → Subscriptions on your iPhone."
          />

          <FaqItem
            question="I lost my progress. Can you recover it?"
            answer="If you were signed in with Apple Sign-In, your data is safely stored on our servers. Simply sign in again on any device. If you were using guest mode, unfortunately your data was stored only on your device and cannot be recovered after the app is deleted."
          />

          <FaqItem
            question="How do I delete my account and data?"
            answer="Open the App → Settings → Account → Delete Account. This will permanently delete your account and all associated data including pets, islands, XP, coins, and session history. This action cannot be undone. Alternatively, email privacy@phono.app to request account deletion."
          />

          <FaqItem
            question="How does Focus Mode / app blocking work?"
            answer="PhoNo uses Apple's Screen Time and DeviceActivity frameworks to help you block distracting apps during focus sessions. All blocking is processed locally on your device by iOS — we never see which apps you block. You configure which apps to block in the App's focus settings."
          />

          <FaqItem
            question="Can I get a refund for an in-app purchase?"
            answer="All in-app purchases are processed by Apple. To request a refund, visit reportaproblem.apple.com, sign in with your Apple ID, find the purchase, and submit a refund request. Apple handles all refund decisions."
          />

          <FaqItem
            question="How do waitlist rewards work?"
            answer="When you join the PhoNo waitlist, you're guaranteed a free Legendary Egg upon launch. If you refer friends using your unique link, you unlock additional rewards at milestones (3, 5, 10, and 25 referrals). Rewards will be delivered to your in-app account when you sign up with the same email."
          />

          <FaqItem
            question="What happens to my pets and island if I cancel premium?"
            answer="Your pets and island are yours forever, regardless of subscription status. Premium unlocks bonus coin and XP multipliers, extra streak freezes, and more sound mixer slots — but your collection, progress, and islands are never removed."
          />

          <FaqItem
            question="How is my data protected?"
            answer="Your data is encrypted in transit (TLS 1.2+) and at rest (AES-256). We use Supabase for secure cloud storage. Screen Time and focus data stays on your device — we never access it. See our Privacy Policy for full details."
          />

          <FaqItem
            question="What devices and iOS versions are supported?"
            answer="PhoNo requires iOS 16.0 or later. It works on iPhone and is optimized for all iPhone screen sizes. iPad compatibility is available but the app is designed primarily for iPhone."
          />

          <FaqItem
            question="I found a bug. How do I report it?"
            answer="Please email hello@phono.app with a description of the bug, your device model, iOS version, and steps to reproduce the issue. Screenshots or screen recordings are very helpful. We take all bug reports seriously and will follow up."
          />
        </div>

        {/* Additional Resources */}
        <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
            Additional Resources
          </h2>
          <div className="flex flex-col gap-2">
            <Link
              to="/privacy"
              style={{ fontSize: 14, color: 'var(--primary)', textDecoration: 'none' }}
            >
              Privacy Policy →
            </Link>
            <Link
              to="/terms"
              style={{ fontSize: 14, color: 'var(--primary)', textDecoration: 'none' }}
            >
              Terms of Service →
            </Link>
            <a
              href="https://reportaproblem.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 14, color: 'var(--primary)', textDecoration: 'none' }}
            >
              Apple Refund Requests →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="game-card" style={{ cursor: 'pointer' }}>
      <summary
        style={{
          fontSize: 15,
          fontWeight: 600,
          listStyle: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {question}
        <span
          style={{
            fontSize: 18,
            color: 'var(--fg-muted)',
            transition: 'transform 0.2s',
            flexShrink: 0,
            marginLeft: 8,
          }}
        >
          +
        </span>
      </summary>
      <p
        style={{
          fontSize: 14,
          color: 'var(--fg-muted)',
          lineHeight: 1.6,
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
        }}
      >
        {answer}
      </p>
    </details>
  );
}
