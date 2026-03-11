import { motion } from 'framer-motion';

const STEPS = [
  {
    number: '01',
    title: 'Set Your Focus',
    description: 'Choose your duration. Put your phone down. That\'s it.',
    icon: '⏱️',
    detail: '25-180 min sessions',
  },
  {
    number: '02',
    title: 'Earn a Pet',
    description: 'Complete your session. A random pet hatches — commons, rares, even legendaries.',
    icon: '🥚',
    detail: '41 species across 5 rarities',
  },
  {
    number: '03',
    title: 'Build Your Island',
    description: 'Your pets live on a floating island. Fill it up, watch it grow, start a new one.',
    icon: '🏝️',
    detail: 'Expands from 5×5 to 12×12',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export function LoopSection() {
  return (
    <section className="section-cream pixel-texture py-20 px-5">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
          style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em' }}
        >
          How It Works
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Dashed connector line (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0 border-t-2 border-dashed" style={{ borderColor: 'var(--border)', zIndex: 0 }} />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="game-card text-center relative z-10"
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                style={{ background: 'hsla(152, 44%, 45%, 0.1)', fontSize: 24 }}
              >
                {step.icon}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: 'var(--primary)',
                  marginBottom: 4,
                }}
              >
                STEP {step.number}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
                {step.description}
              </p>
              <div
                className="mt-3 inline-block"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--primary)',
                  background: 'hsla(152, 44%, 45%, 0.08)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {step.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
