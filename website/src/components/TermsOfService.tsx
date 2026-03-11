import { Nav } from './Nav';
import { Footer } from './Footer';

export function TermsOfService() {
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
          Terms of Service
        </h1>
        <p style={{ fontSize: 14, color: 'var(--fg-muted)', marginBottom: 32 }}>
          Last updated: March 11, 2026
        </p>

        <div className="legal-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By downloading, installing, or using the PhoNo mobile application ("App") or
              accessing the PhoNo website at phono.app ("Website") (collectively, the
              "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do
              not agree to these Terms, do not use the Service.
            </p>
            <p>
              The Service is operated by PhoNo Inc. ("PhoNo," "we," "us," or "our"). These
              Terms constitute a legally binding agreement between you and PhoNo.
            </p>
          </section>

          <section>
            <h2>2. Eligibility</h2>
            <p>
              You must be at least 13 years old to use the Service. If you are between 13 and
              18 years old (or the age of majority in your jurisdiction), you may only use the
              Service with the consent of a parent or legal guardian. By using the Service, you
              represent that you meet these eligibility requirements.
            </p>
          </section>

          <section>
            <h2>3. Account Registration</h2>
            <p>
              You may use the Service as a guest or by creating an account using Apple Sign-In.
              If you create an account, you are responsible for maintaining the security of your
              account credentials and for all activities that occur under your account.
            </p>
            <p>
              Guest mode data is stored locally on your device only. We are not responsible for
              the loss of guest mode data due to device changes, app deletion, or device failure.
            </p>
          </section>

          <section>
            <h2>4. The Service</h2>

            <h3>4.1 Description</h3>
            <p>
              PhoNo is a focus timer application that gamifies productivity. Users complete
              focus sessions to earn experience points (XP), coins, and collectible pixel art
              pets that populate a virtual floating island. The Service includes features such
              as pet collection, island building, achievement tracking, daily streaks, and
              ambient sound mixing.
            </p>

            <h3>4.2 Virtual Items</h3>
            <p>
              The Service includes virtual items such as pets, eggs, coins, XP, decorations,
              island themes, and power-ups ("Virtual Items"). Virtual Items have no real-world
              monetary value and cannot be exchanged, transferred, or redeemed for real currency
              or anything of value outside the Service. We reserve the right to modify, manage,
              control, or eliminate Virtual Items at our sole discretion.
            </p>

            <h3>4.3 Focus Mode and Screen Time</h3>
            <p>
              The App may integrate with Apple's Screen Time and DeviceActivity frameworks to
              help you block distracting apps during focus sessions. This functionality is
              provided "as-is" and depends on iOS system capabilities. We are not responsible
              for any inability to block specific apps or for any consequences arising from the
              use or failure of focus mode features. All Screen Time data is processed locally
              on your device by Apple's frameworks and is never transmitted to our servers.
            </p>
          </section>

          <section>
            <h2>5. In-App Purchases and Subscriptions</h2>

            <h3>5.1 Purchases</h3>
            <p>
              The Service offers in-app purchases including premium subscriptions, coin packs,
              and bundles (collectively, "Purchases"). All Purchases are processed through
              Apple's App Store and are subject to Apple's terms and conditions.
            </p>

            <h3>5.2 Subscriptions</h3>
            <p>
              Premium subscriptions are offered on weekly, monthly, and yearly billing cycles.
              Subscriptions automatically renew unless auto-renewal is turned off at least 24
              hours before the end of the current billing period. You can manage and cancel
              subscriptions through your Apple ID account settings. No refunds will be provided
              for any partial subscription periods.
            </p>

            <h3>5.3 Refund Policy</h3>
            <p>
              All purchases are processed by Apple. Refund requests must be submitted through
              Apple's support channels in accordance with Apple's refund policy. We do not
              process refunds directly.
            </p>

            <h3>5.4 Price Changes</h3>
            <p>
              We reserve the right to change pricing for subscriptions and in-app purchases at
              any time. Price changes for subscriptions will take effect at the start of the
              next billing cycle following notice of the price change.
            </p>
          </section>

          <section>
            <h2>6. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose</li>
              <li>
                Attempt to manipulate, exploit, or abuse the Service's game systems (including
                XP, coins, streaks, or pet generation) through unauthorized means
              </li>
              <li>
                Reverse engineer, decompile, disassemble, or otherwise attempt to derive the
                source code of the App
              </li>
              <li>
                Use automated scripts, bots, or other unauthorized means to interact with the
                Service
              </li>
              <li>
                Interfere with or disrupt the Service or servers or networks connected to the
                Service
              </li>
              <li>
                Create multiple accounts to abuse the waitlist referral system or any other
                promotional offers
              </li>
              <li>
                Impersonate any person or entity or falsely claim an affiliation with any
                person or entity
              </li>
            </ul>
          </section>

          <section>
            <h2>7. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the Service — including but not
              limited to the App design, pixel art assets, pet sprites, island graphics, user
              interface, text, code, and animations — are owned by PhoNo Inc. and are protected
              by copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You are granted a limited, non-exclusive, non-transferable, revocable license to
              use the Service for personal, non-commercial purposes in accordance with these
              Terms. You may not reproduce, distribute, modify, create derivative works of, or
              publicly display any content from the Service without our prior written consent.
            </p>
          </section>

          <section>
            <h2>8. Waitlist and Promotional Rewards</h2>
            <p>
              Waitlist members may be eligible for promotional rewards including, but not limited
              to, in-game eggs, exclusive pets, and island themes ("Promotional Rewards").
              Promotional Rewards are subject to the following conditions:
            </p>
            <ul>
              <li>
                Rewards will be delivered to your in-app account upon the public launch of the
                App, provided you create an account with the same email address used for the
                waitlist.
              </li>
              <li>
                Referral rewards require genuine referrals from unique individuals. Fraudulent,
                duplicate, or self-referrals will not count and may result in disqualification.
              </li>
              <li>
                We reserve the right to modify, suspend, or terminate the referral program at
                any time without prior notice.
              </li>
              <li>
                Promotional Rewards are non-transferable and have no cash value.
              </li>
              <li>
                "Exclusive" items (such as the Founder Fox pet or Pioneer Island theme) may be
                time-limited and will not be available for purchase or earning after the
                promotional period ends.
              </li>
            </ul>
          </section>

          <section>
            <h2>9. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY
              KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR
              FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. WE DO NOT GUARANTEE THAT FOCUS MODE
              WILL SUCCESSFULLY BLOCK ALL TARGETED APPS OR PREVENT ALL DISTRACTIONS.
            </p>
          </section>

          <section>
            <h2>10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PHONO INC., ITS OFFICERS,
              DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF
              PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF
              THE SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY,
              EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p>
              OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE
              SERVICE SHALL NOT EXCEED THE AMOUNT YOU HAVE PAID US IN THE TWELVE (12) MONTHS
              PRECEDING THE CLAIM, OR ONE HUNDRED U.S. DOLLARS ($100), WHICHEVER IS GREATER.
            </p>
          </section>

          <section>
            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless PhoNo Inc. and its officers,
              directors, employees, and agents from and against any claims, liabilities, damages,
              losses, costs, and expenses (including reasonable attorneys' fees) arising out of
              or relating to your use of the Service, your violation of these Terms, or your
              violation of any rights of another party.
            </p>
          </section>

          <section>
            <h2>12. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time, with or
              without cause, with or without notice. Upon termination, your right to use the
              Service will immediately cease. You may terminate your account at any time by
              deleting your account through the App settings.
            </p>
            <p>
              Provisions of these Terms that by their nature should survive termination shall
              survive, including but not limited to ownership provisions, warranty disclaimers,
              indemnity, and limitations of liability.
            </p>
          </section>

          <section>
            <h2>13. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              State of Delaware, United States, without regard to its conflict of law principles.
            </p>
            <p>
              Any dispute arising out of or relating to these Terms or the Service shall be
              resolved through binding arbitration administered by the American Arbitration
              Association (AAA) in accordance with its Consumer Arbitration Rules. The
              arbitration shall take place in the State of Delaware. YOU AGREE THAT ANY DISPUTE
              RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A
              CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION.
            </p>
          </section>

          <section>
            <h2>14. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of
              material changes by posting the updated Terms in the App or on the Website and
              updating the "Last updated" date. Your continued use of the Service after changes
              constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2>15. Apple-Specific Terms (EULA)</h2>
            <p>
              The following additional terms apply to your use of the App as downloaded from the
              Apple App Store:
            </p>
            <ul>
              <li>
                These Terms are between you and PhoNo Inc., not Apple Inc. PhoNo Inc. is solely
                responsible for the App and its content.
              </li>
              <li>
                The license granted to you for the App is limited to a non-transferable license
                to use the App on any Apple-branded device that you own or control, as permitted
                by the Usage Rules set forth in the App Store Terms of Service.
              </li>
              <li>
                PhoNo Inc. is solely responsible for providing any maintenance and support
                services for the App. Apple has no obligation to furnish any maintenance and
                support services with respect to the App.
              </li>
              <li>
                In the event of any failure of the App to conform to any applicable warranty,
                you may notify Apple, and Apple will refund the purchase price for the App (if
                any). To the maximum extent permitted by applicable law, Apple has no other
                warranty obligation with respect to the App.
              </li>
              <li>
                PhoNo Inc., not Apple, is responsible for addressing any claims relating to the
                App, including but not limited to product liability claims, any claim that the
                App fails to conform to any applicable legal or regulatory requirement, and
                claims arising under consumer protection or similar legislation.
              </li>
              <li>
                In the event of any third-party claim that the App infringes a third party's
                intellectual property rights, PhoNo Inc., not Apple, will be solely responsible
                for the investigation, defense, settlement, and discharge of any such
                intellectual property infringement claim.
              </li>
              <li>
                Apple and its subsidiaries are third-party beneficiaries of these Terms. Upon
                your acceptance of these Terms, Apple will have the right (and will be deemed to
                have accepted the right) to enforce these Terms against you as a third-party
                beneficiary.
              </li>
            </ul>
          </section>

          <section>
            <h2>16. Severability</h2>
            <p>
              If any provision of these Terms is held to be invalid or unenforceable, the
              remaining provisions will remain in full force and effect. The invalid or
              unenforceable provision will be modified to the minimum extent necessary to make
              it valid and enforceable.
            </p>
          </section>

          <section>
            <h2>17. Entire Agreement</h2>
            <p>
              These Terms, together with the Privacy Policy, constitute the entire agreement
              between you and PhoNo Inc. regarding the Service and supersede all prior
              agreements and understandings.
            </p>
          </section>

          <section>
            <h2>18. Contact Us</h2>
            <p>If you have questions about these Terms, please contact us:</p>
            <ul>
              <li>
                Email: <a href="mailto:legal@phono.app">legal@phono.app</a>
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
