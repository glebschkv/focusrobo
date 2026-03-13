import { motion } from 'framer-motion';

const STEPS = [
  {
    number: '01',
    title: 'Set Your Focus',
    description: 'Choose your duration. Put your phone down. That\'s it.',
    image: '/pets/hedgehog-baby.png',
    detail: '25-180 min sessions',
    bg: 'hsla(152, 44%, 45%, 0.08)',
  },
  {
    number: '02',
    title: 'Earn a Pet',
    description: 'Complete your session. A random pet hatches — commons, rares, even legendaries.',
    image: '/pets/fox-baby.png',
    detail: '41 species across 5 rarities',
    bg: 'hsla(42, 75%, 52%, 0.08)',
  },
  {
    number: '03',
    title: 'Build Your Island',
    description: 'Your pets live on a floating island. Fill it up, watch it grow, start a new one.',
    image: '/pets/dragon-baby.png',
    detail: 'Expands from 5×5 to 12×12',
    bg: 'hsla(200, 60%, 55%, 0.08)',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export function LoopSection() {
  return (
    <section id="how-it-works" className="section-cream pixel-texture py-24 px-5">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="section-label">HOW IT WORKS</div>
          <h2 className="section-title">Three Steps to Your First Pet</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Arrow connectors (desktop only) */}
          <div className="hidden md:flex absolute top-1/2 left-[33%] -translate-y-1/2 z-0" style={{ color: 'var(--primary)', opacity: 0.3 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </div>
          <div className="hidden md:flex absolute top-1/2 left-[66%] -translate-y-1/2 z-0" style={{ color: 'var(--primary)', opacity: 0.3 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </div>

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="feature-card text-center relative z-10"
            >
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                style={{ background: step.bg }}
              >
                <img
                  src={step.image}
                  alt={step.title}
                  style={{ width: 40, height: 40, imageRendering: 'pixelated' }}
                />
              </div>
              <div
                className="inline-flex items-center justify-center w-7 h-7 rounded-full mb-3"
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {step.number}
              </div>
              <h3 className="card-title">
                {step.title}
              </h3>
              <p className="card-desc" style={{ marginBottom: 12 }}>
                {step.description}
              </p>
              <div
                className="inline-block"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--primary)',
                  background: 'hsla(152, 44%, 45%, 0.08)',
                  padding: '5px 14px',
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
