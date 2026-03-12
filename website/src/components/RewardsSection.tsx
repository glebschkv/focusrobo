import { AnimatedSection, AnimatedItem } from './AnimatedSection';

const RARITY_BG: Record<string, string> = {
  common: 'rgba(180, 170, 155, 0.12)',
  uncommon: 'rgba(134, 197, 134, 0.12)',
  rare: 'rgba(59, 130, 246, 0.12)',
  epic: 'rgba(168, 85, 247, 0.12)',
  legendary: 'rgba(234, 179, 8, 0.12)',
};

const TIERS = [
  {
    count: 0,
    reward: 'Legendary Egg',
    desc: 'Guaranteed on launch day.',
    badge: 'FREE',
    rarity: 'legendary' as const,
    emoji: '🥚',
  },
  {
    count: 3,
    reward: 'Rare Egg',
    desc: 'Worth 400 coins.',
    rarity: 'rare' as const,
    emoji: '🥚',
  },
  {
    count: 5,
    reward: 'Epic Egg',
    desc: 'Worth 1,200 coins.',
    rarity: 'epic' as const,
    emoji: '🥚',
  },
  {
    count: 10,
    reward: 'Founder Fox',
    desc: 'Exclusive pet. Never again.',
    badge: 'Exclusive',
    rarity: 'legendary' as const,
    emoji: '🦊',
  },
  {
    count: 25,
    reward: 'Pioneer Island',
    desc: 'Exclusive island theme.',
    badge: 'Exclusive',
    rarity: 'uncommon' as const,
    emoji: '🏝️',
  },
];

export function RewardsSection() {
  return (
    <section className="section-textured section-standard">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection className="text-center mb-14">
          <AnimatedItem>
            <h2 className="section-heading display-font">
              Bring a friend, get a head start
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p className="section-desc">
              Share your invite link. When friends join, you both unlock exclusive rewards.
            </p>
          </AnimatedItem>
        </AnimatedSection>

        {/* Desktop: horizontal tier path */}
        <AnimatedSection className="hidden md:flex items-start justify-center gap-4 relative" stagger={0.1}>
          {/* Dotted connector line */}
          <div
            className="absolute top-[52px] left-[12%] right-[12%] h-0"
            style={{ borderTop: '2px dashed rgba(234, 179, 8, 0.2)', zIndex: 0 }}
          />

          {TIERS.map((tier) => (
            <AnimatedItem key={tier.count}>
              <div
                className={`rarity-card rarity-${tier.rarity}`}
                style={{ width: 156, position: 'relative', zIndex: 1 }}
              >
                <div className="rarity-card-inner" style={{ padding: '24px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{tier.emoji}</div>
                  <div
                    className="display-font"
                    style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-deep)', marginBottom: 6 }}
                  >
                    {tier.reward}
                  </div>
                  <div className="card-desc" style={{ fontSize: 11, marginBottom: 10 }}>
                    {tier.desc}
                  </div>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: `var(--rarity-${tier.rarity})`,
                        background: RARITY_BG[tier.rarity],
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-pill)',
                      }}
                    >
                      {tier.count === 0 ? 'Sign up' : `${tier.count} friends`}
                    </span>
                    {tier.badge && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--accent-warm)',
                          background: 'rgba(234, 179, 8, 0.1)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-pill)',
                        }}
                      >
                        {tier.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedSection>

        {/* Mobile: vertical list */}
        <div className="md:hidden space-y-3">
          {TIERS.map((tier) => (
            <div key={tier.count} className="glass-warm flex items-center gap-4 p-4">
              <div style={{ fontSize: 28, flexShrink: 0 }}>{tier.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="display-font" style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-deep)' }}>
                    {tier.reward}
                  </span>
                  {tier.badge && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: 'var(--accent-warm)',
                        background: 'rgba(234, 179, 8, 0.1)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-pill)',
                      }}
                    >
                      {tier.badge}
                    </span>
                  )}
                </div>
                <div className="card-desc" style={{ fontSize: 12 }}>{tier.desc}</div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: `var(--rarity-${tier.rarity})`,
                  whiteSpace: 'nowrap',
                }}
              >
                {tier.count === 0 ? 'Sign up' : `${tier.count} friends`}
              </div>
            </div>
          ))}
        </div>

        <AnimatedSection className="text-center mt-12">
          <AnimatedItem>
            <a
              href="#waitlist"
              className="warm-form-button"
              style={{ display: 'inline-flex', padding: '14px 36px', fontSize: 15, textDecoration: 'none' }}
            >
              Claim Your Free Egg
            </a>
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </section>
  );
}
