import { motion } from 'framer-motion';

const TIERS = [
  {
    count: 0,
    reward: 'Legendary Egg',
    desc: 'Guaranteed. Worth 3,000 coins.',
    emoji: '🥚',
    borderColor: 'var(--rarity-legendary)',
    glow: 'rgba(234, 179, 8, 0.15)',
    badge: 'FREE',
  },
  {
    count: 3,
    reward: 'Rare Egg',
    desc: 'Worth 400 coins.',
    emoji: '🔵',
    borderColor: 'var(--rarity-rare)',
    glow: 'rgba(59, 130, 246, 0.1)',
  },
  {
    count: 5,
    reward: 'Epic Egg',
    desc: 'Worth 1,200 coins.',
    emoji: '🟣',
    borderColor: 'var(--rarity-epic)',
    glow: 'rgba(168, 85, 247, 0.1)',
  },
  {
    count: 10,
    reward: 'Founder Fox',
    desc: 'Exclusive pet. Never available again.',
    emoji: '🦊',
    borderColor: 'var(--rarity-legendary)',
    glow: 'rgba(234, 179, 8, 0.1)',
  },
  {
    count: 25,
    reward: 'Pioneer Island',
    desc: 'Exclusive island theme.',
    emoji: '🏝️',
    borderColor: 'var(--accent)',
    glow: 'rgba(52, 211, 153, 0.1)',
  },
];

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

        {/* Big golden egg */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.1] }}
          className="flex justify-center mb-14"
        >
          <div
            style={{
              width: 90,
              height: 108,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              background: 'linear-gradient(135deg, #FFF3C4 0%, #FFE082 40%, #FFD54F 100%)',
              border: '3px solid var(--rarity-legendary)',
              animation: 'egg-rock 2.5s ease-in-out infinite, golden-pulse 3s ease-in-out infinite',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: -6,
                borderRadius: 'inherit',
                background: 'linear-gradient(105deg, transparent 0%, rgba(234,179,8,0.25) 45%, rgba(234,179,8,0.1) 55%, transparent 70%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer-slide 2s ease-in-out infinite',
              }}
            />
          </div>
        </motion.div>

        {/* Tier cards — horizontal scroll on mobile, grid on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {TIERS.map((tier, i) => (
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
              <div style={{ fontSize: 32, marginBottom: 8 }}>{tier.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-dark-primary)', marginBottom: 4 }}>
                {tier.reward}
              </div>
              {tier.badge && (
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 10,
                    fontWeight: 800,
                    background: 'rgba(52, 211, 153, 0.2)',
                    color: 'var(--accent)',
                    padding: '2px 8px',
                    borderRadius: 8,
                    letterSpacing: '0.05em',
                    marginBottom: 6,
                  }}
                >
                  {tier.badge}
                </span>
              )}
              <div style={{ fontSize: 12, color: 'var(--fg-dark-muted)', lineHeight: 1.4, marginBottom: 8 }}>
                {tier.desc}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: tier.borderColor }}>
                {tier.count === 0 ? 'Sign up' : `${tier.count} friends`}
              </div>
            </motion.div>
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
