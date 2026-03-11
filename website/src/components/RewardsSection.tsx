import { motion } from 'framer-motion';

const TIERS = [
  {
    count: 0,
    reward: 'Legendary Egg',
    desc: 'Guaranteed. Worth 3,000 coins.',
    color: 'var(--rarity-legendary)',
    glow: 'rgba(234, 179, 8, 0.3)',
    eggStyle: { background: 'linear-gradient(135deg, #FFF3C4 0%, #FFE082 40%, #FFD54F 100%)', borderColor: 'var(--rarity-legendary)' },
  },
  {
    count: 3,
    reward: 'Rare Egg',
    desc: 'Worth 400 coins.',
    color: 'var(--rarity-rare)',
    glow: 'rgba(59, 130, 246, 0.2)',
    eggStyle: { background: 'linear-gradient(135deg, #DBEAFE 0%, #93C5FD 50%, #60A5FA 100%)', borderColor: 'var(--rarity-rare)' },
  },
  {
    count: 5,
    reward: 'Epic Egg',
    desc: 'Worth 1,200 coins.',
    color: 'var(--rarity-epic)',
    glow: 'rgba(168, 85, 247, 0.2)',
    eggStyle: { background: 'linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 50%, #A78BFA 100%)', borderColor: 'var(--rarity-epic)' },
  },
  {
    count: 10,
    reward: 'Founder Fox',
    desc: 'Exclusive pet. Never available again.',
    color: 'var(--rarity-legendary)',
    glow: 'rgba(234, 179, 8, 0.3)',
    isSpecial: true,
  },
  {
    count: 25,
    reward: 'Pioneer Island',
    desc: 'Exclusive island theme.',
    color: 'var(--primary)',
    glow: 'rgba(64, 133, 106, 0.2)',
    isSpecial: true,
  },
];

export function RewardsSection() {
  return (
    <section className="section-cream py-20 px-5">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Join Early. Hatch Something Legendary.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--fg-muted)', maxWidth: 480, margin: '0 auto' }}>
            Every waitlist member gets a free Legendary Egg on launch day. Refer friends to unlock even more.
          </p>
        </motion.div>

        {/* Big golden egg */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.1] }}
          className="flex justify-center mb-12"
        >
          <div
            style={{
              width: 100,
              height: 120,
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

        {/* Tier path */}
        <div className="relative">
          {/* Vertical connector */}
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5"
            style={{ background: 'var(--border)', transform: 'translateX(-50%)' }}
          />

          <div className="space-y-4 md:space-y-6">
            {TIERS.map((tier, i) => (
              <motion.div
                key={tier.count}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`game-card flex items-center gap-4 md:w-4/5 ${i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}
                style={{ borderColor: tier.count === 0 ? 'var(--rarity-legendary)' : undefined }}
              >
                {/* Egg/icon */}
                <div className="flex-shrink-0">
                  {tier.eggStyle ? (
                    <div
                      style={{
                        width: 44,
                        height: 52,
                        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                        border: `2px solid ${tier.eggStyle.borderColor}`,
                        ...tier.eggStyle,
                        boxShadow: `0 0 12px ${tier.glow}`,
                      }}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: `${tier.glow}`,
                        border: `2px solid ${tier.color}`,
                        fontSize: 20,
                      }}
                    >
                      {tier.count === 10 ? '🦊' : '🏝️'}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{tier.reward}</span>
                    {tier.count === 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          background: 'hsl(42, 60%, 88%)',
                          color: 'hsl(42, 75%, 35%)',
                          padding: '2px 6px',
                          borderRadius: 8,
                          letterSpacing: '0.05em',
                        }}
                      >
                        FREE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{tier.desc}</div>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: tier.color,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tier.count === 0 ? 'Sign up' : `${tier.count} friends`}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <a
            href="#waitlist"
            className="nav-cta inline-block"
            style={{ padding: '12px 32px', fontSize: 16 }}
          >
            Claim Your Egg
          </a>
        </motion.div>
      </div>
    </section>
  );
}
