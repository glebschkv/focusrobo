import { motion } from 'framer-motion';

const TIERS = [
  {
    count: 0,
    reward: 'Legendary Egg',
    desc: 'Guaranteed. Worth 3,000 coins.',
    image: '/icons/egg-legendary.png',
    borderColor: 'var(--rarity-legendary)',
    glow: 'rgba(234, 179, 8, 0.15)',
    badge: 'FREE',
  },
  {
    count: 3,
    reward: 'Rare Egg',
    desc: 'Worth 400 coins.',
    image: '/icons/egg-rare.png',
    borderColor: 'var(--rarity-rare)',
    glow: 'rgba(59, 130, 246, 0.1)',
  },
  {
    count: 5,
    reward: 'Epic Egg',
    desc: 'Worth 1,200 coins.',
    image: '/icons/egg-epic.png',
    borderColor: 'var(--rarity-epic)',
    glow: 'rgba(168, 85, 247, 0.1)',
  },
  {
    count: 10,
    reward: 'Founder Fox',
    desc: 'Exclusive pet. Never available again.',
    image: '/pets/fox-adult.png',
    borderColor: 'var(--rarity-legendary)',
    glow: 'rgba(234, 179, 8, 0.1)',
  },
  {
    count: 25,
    reward: 'Pioneer Island',
    desc: 'Exclusive island theme.',
    image: '/pets/koi-fish-adult.png',
    borderColor: 'var(--accent)',
    glow: 'rgba(52, 211, 153, 0.1)',
  },
];

function TierCard({ tier, i }: { tier: typeof TIERS[0]; i: number }) {
  return (
    <motion.div
      key={tier.count}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.4 }}
      className="feature-card feature-card--dark text-center"
      style={{
        padding: '20px 16px',
        borderTop: `3px solid ${tier.borderColor}`,
        background: tier.glow,
      }}
    >
      <img
        src={tier.image}
        alt={tier.reward}
        style={{ width: 44, height: 44, imageRendering: 'pixelated', marginBottom: 8, display: 'block', margin: '0 auto 8px' }}
      />
      <div className="card-title card-title--light" style={{ fontSize: 14, marginBottom: 4 }}>
        {tier.reward}
      </div>
      {tier.badge && (
        <span className="tier-badge">
          {tier.badge}
        </span>
      )}
      <div className="card-desc card-desc--light" style={{ fontSize: 12, lineHeight: 1.4, marginBottom: 8 }}>
        {tier.desc}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: tier.borderColor }}>
        {tier.count === 0 ? 'Sign up' : `${tier.count} friends`}
      </div>
    </motion.div>
  );
}

export function RewardsSection() {
  return (
    <section id="rewards" className="section-dark py-24 px-5">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="section-label section-label--light">EARLY BIRD REWARDS</div>
          <h2 className="section-title section-title--light">
            Join the Waitlist. Hatch Something Legendary.
          </h2>
          <p className="section-subtitle section-subtitle--light">
            Every member gets a free Legendary Egg on launch day. Refer friends to unlock exclusive rewards.
          </p>
        </motion.div>

        {/* Big legendary egg */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.1] }}
          className="flex justify-center mb-14"
        >
          <img
            src="/icons/egg-legendary.png"
            alt="Legendary Egg"
            style={{
              width: 90,
              height: 'auto',
              imageRendering: 'pixelated',
              animation: 'egg-rock 2.5s ease-in-out infinite',
              filter: 'drop-shadow(0 0 16px rgba(234,179,8,0.7)) drop-shadow(0 0 32px rgba(234,179,8,0.3))',
            }}
          />
        </motion.div>

        {/* Desktop: 5-column grid */}
        <div className="hidden md:grid md:grid-cols-5 gap-4 mb-12">
          {TIERS.map((tier, i) => <TierCard key={tier.count} tier={tier} i={i} />)}
        </div>

        {/* Mobile: horizontal scroll track */}
        <div className="md:hidden scroll-track mb-12">
          {TIERS.map((tier, i) => (
            <div key={tier.count} className="min-w-[140px]">
              <TierCard tier={tier} i={i} />
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <a
            href="#waitlist"
            className="cta-accent"
            style={{ textDecoration: 'none', padding: '14px 36px' }}
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
