import { motion } from 'framer-motion';

const CARDS = [
  {
    title: 'The Pull',
    description: 'The average person checks their phone 96 times a day. Every glance breaks your flow.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="8" y="4" width="16" height="24" rx="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="22" cy="8" r="4" fill="var(--rarity-epic)" />
        <text x="22" y="10" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">3</text>
      </svg>
    ),
  },
  {
    title: 'The Guilt',
    description: 'Hours vanish. You meant to work for 30 minutes — then the scroll happened.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
        <path d="M16 10v7l4 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'The Fix',
    description: 'PhoNo turns putting your phone down into a game you actually want to play.',
    icon: (
      <img src="/pets/dragon-baby.png" alt="" width="32" height="32" style={{ imageRendering: 'pixelated' }} />
    ),
    highlight: true,
  },
];

const cardAnim = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export function WhySection() {
  return (
    <section className="section-cream" style={{ padding: '80px 20px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <div className="section-label">THE PROBLEM</div>
          <h2 className="section-title">Your Phone Wasn't Built to Let You Focus</h2>
          <p className="section-subtitle">Sound familiar?</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={cardAnim}
              className={`why-card ${card.highlight ? 'why-card--highlight' : ''}`}
            >
              <div className="why-card__icon">{card.icon}</div>
              <h3 className="why-card__title">{card.title}</h3>
              <p className="why-card__desc">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
