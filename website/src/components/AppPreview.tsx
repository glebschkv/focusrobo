import { motion } from 'framer-motion';
import { IslandScene } from './IslandScene';

const FEATURES = [
  {
    icon: '🎯',
    title: 'Block Distracting Apps',
    desc: 'iOS Screen Time integration keeps you focused.',
  },
  {
    icon: '🥚',
    title: 'Hatch Eggs from 5 Rarity Tiers',
    desc: 'Common to Legendary — every session is a surprise.',
  },
  {
    icon: '🏝️',
    title: 'Explore 6 Themed Islands',
    desc: 'Coral Reef, Snow Peak, Desert Oasis, and more.',
  },
];

export function AppPreview() {
  return (
    <section className="section-dark py-24 px-5">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="section-label section-label--light">SEE IT IN ACTION</div>
          <h2 className="section-title section-title--light">
            Your Island Comes to Life
          </h2>
          <p className="section-subtitle section-subtitle--light">
            Every focus session brings new pets, grows your island, and unlocks rare discoveries.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.1] }}
            className="flex-shrink-0 order-2 md:order-none mx-auto"
          >
            <div className="phone-mockup">
              <div className="phone-mockup__notch" />
              <div className="phone-mockup__content">
                <div style={{ width: '100%', transform: 'scale(0.55)', transformOrigin: 'center center' }}>
                  <IslandScene gridSize={8} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature bullets */}
          <div className="flex flex-col gap-6 flex-1 order-1 md:order-none">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="feature-card feature-card--dark flex items-start gap-4"
                style={{ padding: '20px 24px' }}
              >
                <div
                  style={{
                    fontSize: 28,
                    flexShrink: 0,
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(52, 211, 153, 0.1)',
                    borderRadius: 12,
                  }}
                >
                  {feature.icon}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--fg-dark-primary)',
                      marginBottom: 4,
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--fg-dark-secondary)', lineHeight: 1.5 }}>
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
