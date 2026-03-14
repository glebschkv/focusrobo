import { motion } from 'framer-motion';

const REFERRAL_TIERS = [
  { count: 3, reward: 'Rare Egg', image: '/icons/egg-rare.png', color: 'var(--rarity-rare)' },
  { count: 5, reward: 'Epic Egg', image: '/icons/egg-epic.png', color: 'var(--rarity-epic)' },
  { count: 10, reward: 'Founder Fox', image: '/pets/fox-adult.png', color: 'var(--rarity-legendary)' },
  { count: 25, reward: 'Pioneer Island', image: '/pets/koi-fish-adult.png', color: 'var(--accent)' },
];

export function RewardsSection() {
  return (
    <section id="rewards" className="section-dark" style={{ padding: '80px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-label" style={{ color: 'var(--accent)' }}>EARLY BIRD REWARDS</div>
          <h2 className="section-title" style={{ color: '#fff' }}>
            Sign Up Free. Get a Legendary Egg.
          </h2>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Every waitlist member receives one on launch day — worth 3,000 coins.
          </p>
        </motion.div>

        {/* Big legendary egg — the hero moment */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.1] }}
          style={{ margin: '36px 0 12px' }}
        >
          <img
            src="/icons/egg-legendary.png"
            alt="Legendary Egg"
            style={{
              width: 96,
              height: 'auto',
              imageRendering: 'pixelated',
              animation: 'egg-rock 2.5s ease-in-out infinite',
              filter: 'drop-shadow(0 0 16px rgba(234,179,8,0.7)) drop-shadow(0 0 32px rgba(234,179,8,0.3))',
            }}
          />
          <div style={{
            marginTop: 12,
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: 20,
            background: 'rgba(234,179,8,0.12)',
            color: 'var(--rarity-legendary)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}>
            FREE for early signups
          </div>
        </motion.div>

        {/* Compact referral tiers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rewards-tier-strip"
        >
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 16px', fontWeight: 500 }}>
            Refer friends for bonus rewards
          </p>
          <div className="rewards-tier-grid">
            {REFERRAL_TIERS.map(tier => (
              <div key={tier.count} className="rewards-tier-item">
                <img
                  src={tier.image}
                  alt={tier.reward}
                  style={{ width: 32, height: 32, imageRendering: 'pixelated' }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: tier.color }}>{tier.reward}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{tier.count} friends</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ marginTop: 32 }}
        >
          <a
            href="#waitlist"
            className="cta-accent"
            style={{ textDecoration: 'none', padding: '14px 36px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            Claim Your Egg
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
