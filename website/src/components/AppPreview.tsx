import { motion } from 'framer-motion';
import { IslandScene } from './IslandScene';
import type { ReactNode } from 'react';

function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function IslandIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20" />
      <path d="M12 4 L5 14 h14 Z" />
      <circle cx="12" cy="4" r="1" fill="var(--accent)" />
    </svg>
  );
}

function EggIcon() {
  return (
    <img
      src="/icons/egg.png"
      alt="Egg"
      style={{ width: 28, height: 28, imageRendering: 'pixelated' }}
    />
  );
}

const FEATURES: { icon: ReactNode; title: string; desc: string }[] = [
  {
    icon: <ShieldIcon />,
    title: 'Block Distracting Apps',
    desc: 'iOS Screen Time integration keeps you focused.',
  },
  {
    icon: <EggIcon />,
    title: 'Hatch Eggs from 5 Rarity Tiers',
    desc: 'Common to Legendary — every session is a surprise.',
  },
  {
    icon: <IslandIcon />,
    title: 'Explore 6 Themed Islands',
    desc: 'Coral Reef, Snow Peak, Desert Oasis, and more.',
  },
];

export function AppPreview() {
  return (
    <section className="section-dark py-24 px-5">
      <div className="max-w-6xl mx-auto">
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
          {/* Phone Mockup — hidden on mobile (island already in hero), shown on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.1] }}
            className="hidden md:flex flex-shrink-0 order-2 md:order-none mx-auto relative"
          >
            {/* Glow backdrop */}
            <div style={{
              position: 'absolute',
              inset: -40,
              background: 'radial-gradient(circle, rgba(59,232,168,0.08) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />
            <div className="phone-mockup" style={{ position: 'relative' }}>
              <div className="phone-mockup__notch" />
              <div className="phone-mockup__content">
                <div style={{ zoom: 0.55, flexShrink: 0 }}>
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
                  <h3 className="card-title card-title--light" style={{ fontSize: 16, marginBottom: 4 }}>
                    {feature.title}
                  </h3>
                  <p className="card-desc card-desc--light" style={{ fontSize: 14 }}>
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
