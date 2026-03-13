import { motion } from 'framer-motion';

const TESTIMONIALS = [
  {
    quote: "Finally, a focus app that doesn't feel like punishment. I actually look forward to my sessions now.",
    name: 'Sarah K.',
    role: 'Beta Tester',
  },
  {
    quote: "I've tried Forest, Flora, and every timer app out there. PhoNo is the first one that made me forget my phone existed.",
    name: 'Marcus T.',
    role: 'Early Access',
  },
  {
    quote: "My kids are obsessed with collecting the pets. Our whole family does focus sessions together now.",
    name: 'Jamie L.',
    role: 'Beta Tester',
  },
];

const STATS = [
  { value: '50,000+', label: 'Focus Minutes' },
  { value: '10,000+', label: 'Pets Collected' },
  { value: '500+', label: 'Islands Built' },
];

export function SocialProof() {
  return (
    <section className="section-dark py-20 px-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="feature-card feature-card--dark"
              style={{ padding: '24px' }}
            >
              <div style={{ fontSize: 24, marginBottom: 12, opacity: 0.3 }}>"</div>
              <p style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: 'var(--fg-dark-secondary)',
                marginBottom: 16,
                fontStyle: 'italic',
              }}>
                {t.quote}
              </p>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-dark-primary)' }}>
                  {t.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-dark-muted)' }}>
                  {t.role}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-6 md:gap-16"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-dark-muted)', marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
