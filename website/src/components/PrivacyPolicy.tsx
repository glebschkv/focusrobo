import { Nav } from './Nav';
import { Footer } from './Footer';

export function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: 'var(--fg-muted)', marginBottom: 32 }}>
          Last updated: March 11, 2026
        </p>

        <div className="legal-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              PhoNo Inc. ("PhoNo," "we," "us," or "our") operates the PhoNo mobile application
              (the "App") and the website at phono.app (the "Website"). This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you
              use our App and Website (collectively, the "Service").
            </p>
            <p>
              By using the Service, you agree to the collection and use of information in
              accordance with this policy. If you do not agree with the terms of this Privacy
              Policy, please do not access or use the Service.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>

            <h3>2.1 Information You Provide</h3>
            <ul>
              <li>
                <strong>Account Information:</strong> When you create an account, we collect
                your email address and authentication credentials. If you sign in with Apple,
                we receive your Apple ID and, optionally, your name and email address as
                permitted by Apple's sign-in service.
              </li>
              <li>
                <strong>Waitlist Information:</strong> When you join our waitlist, we collect
                your email address and referral information.
              </li>
              <li>
                <strong>Purchase Information:</strong> When you make in-app purchases, payment
                processing is handled entirely by Apple through the App Store. We do not
                collect or store your payment card information. We receive transaction
                confirmation data from Apple.
              </li>
              <li>
                <strong>Support Communications:</strong> When you contact us for support, we
                collect the information you provide in your communications.
              </li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <ul>
              <li>
                <strong>Usage Data:</strong> We collect information about how you use the App,
                including focus session durations, session completion rates, feature usage
                patterns, and in-app interactions. This data is used to improve the Service
                and provide you with personalized experiences.
              </li>
              <li>
                <strong>Device Information:</strong> We may collect device type, operating
                system version, unique device identifiers, and general diagnostic data to
                ensure App compatibility and performance.
              </li>
              <li>
                <strong>Error and Crash Data:</strong> We collect anonymized crash reports and
                error logs to identify and fix technical issues.
              </li>
            </ul>

            <h3>2.3 Information We Do NOT Collect</h3>
            <ul>
              <li>We do not access, collect, or store the content of your blocked apps.</li>
              <li>
                We do not track which specific apps you block during focus sessions. Screen
                Time and DeviceActivity data is processed entirely on your device by Apple's
                frameworks and is never transmitted to our servers.
              </li>
              <li>We do not collect precise location data.</li>
              <li>We do not access your contacts, photos, or other personal files.</li>
              <li>We do not sell your personal information to third parties.</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve the Service</li>
              <li>Process your account registration and manage your account</li>
              <li>Track your focus sessions, XP, coins, streaks, and pet collection progress</li>
              <li>Sync your game data across devices when you're signed in</li>
              <li>Process in-app purchases and validate subscription status</li>
              <li>Send you important service-related notifications (e.g., streak reminders)</li>
              <li>Respond to your support requests and communications</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Analyze usage patterns to improve features and user experience</li>
              <li>Manage the waitlist and referral reward program</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Storage and Security</h2>
            <p>
              Your game data (focus sessions, pets, islands, XP, coins, streaks) is stored
              using Supabase, a secure cloud database service. Data is encrypted in transit
              using TLS 1.2+ and at rest using AES-256 encryption.
            </p>
            <p>
              Guest mode data is stored locally on your device only and is not transmitted to
              our servers. If you use guest mode, your data cannot be recovered if you delete
              the App or change devices.
            </p>
            <p>
              We implement commercially reasonable security measures to protect your
              information. However, no method of electronic storage or transmission is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>5. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li>
                <strong>Supabase:</strong> Cloud database and authentication.{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                  Supabase Privacy Policy
                </a>
              </li>
              <li>
                <strong>Apple (App Store, Sign in with Apple, StoreKit):</strong> Authentication,
                payment processing, and app distribution.{' '}
                <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">
                  Apple Privacy Policy
                </a>
              </li>
              <li>
                <strong>Vercel:</strong> Website hosting.{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                  Vercel Privacy Policy
                </a>
              </li>
            </ul>
            <p>
              We do not use any third-party advertising networks or ad tracking services.
            </p>
          </section>

          <section>
            <h2>6. Children's Privacy</h2>
            <p>
              The Service is not directed to children under the age of 13. We do not knowingly
              collect personal information from children under 13. If you are a parent or
              guardian and believe your child has provided us with personal information, please
              contact us at{' '}
              <a href="mailto:privacy@phono.app">privacy@phono.app</a>, and we will delete
              such information.
            </p>
          </section>

          <section>
            <h2>7. Your Rights and Choices</h2>

            <h3>7.1 Access and Portability</h3>
            <p>
              You can request a copy of your personal data by contacting us at{' '}
              <a href="mailto:privacy@phono.app">privacy@phono.app</a>. We will provide your
              data in a commonly used, machine-readable format within 30 days.
            </p>

            <h3>7.2 Deletion</h3>
            <p>
              You can delete your account and all associated data at any time through the App
              (Settings → Account → Delete Account) or by contacting us. Account deletion is
              permanent and cannot be undone. We will process deletion requests within 30 days.
            </p>

            <h3>7.3 Correction</h3>
            <p>
              You can update your account information through the App settings. For other
              corrections, please contact us.
            </p>

            <h3>7.4 Opt-Out</h3>
            <p>
              You can opt out of non-essential notifications through the App settings or your
              device's notification settings.
            </p>

            <h3>7.5 California Residents (CCPA)</h3>
            <p>
              If you are a California resident, you have additional rights under the California
              Consumer Privacy Act (CCPA), including the right to know what personal information
              we collect, the right to delete your personal information, and the right to
              opt-out of the sale of personal information. We do not sell personal information.
            </p>

            <h3>7.6 European Residents (GDPR)</h3>
            <p>
              If you are a resident of the European Economic Area (EEA), you have rights under
              the General Data Protection Regulation (GDPR), including the right to access,
              rectify, erase, restrict processing, and port your data. Our legal basis for
              processing is contract performance (providing the Service) and legitimate
              interests (improving the Service). To exercise your GDPR rights, contact us at{' '}
              <a href="mailto:privacy@phono.app">privacy@phono.app</a>.
            </p>
          </section>

          <section>
            <h2>8. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as
              needed to provide the Service. If you delete your account, we will delete your
              personal information within 30 days, except where we are required to retain it
              for legal, regulatory, or legitimate business purposes (e.g., fraud prevention,
              resolving disputes).
            </p>
            <p>
              Anonymized, aggregated data (which cannot identify you) may be retained
              indefinitely for analytics and service improvement purposes.
            </p>
          </section>

          <section>
            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your
              country of residence. We ensure appropriate safeguards are in place for such
              transfers in compliance with applicable data protection laws.
            </p>
          </section>

          <section>
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by posting the new Privacy Policy in the App and updating the
              "Last updated" date. Your continued use of the Service after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2>11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please
              contact us:
            </p>
            <ul>
              <li>
                Email: <a href="mailto:privacy@phono.app">privacy@phono.app</a>
              </li>
              <li>
                General Support: <a href="mailto:hello@phono.app">hello@phono.app</a>
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
