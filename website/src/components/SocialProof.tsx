import { motion } from 'framer-motion';

const STATS = [
  { value: '50,000+', label: 'Focus minutes\nlogged in beta', pet: '/pets/bunny-adolescent.png' },
  { value: '10,000+', label: 'Pets collected\nby early users', pet: '/pets/dragon-baby.png' },
  { value: '500+', label: 'Islands built\nand archived', pet: '/pets/unicorn-baby.png' },
];

export function SocialProof() {
  return (
    <section className="section-dark py-24 px-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="section-label section-label--light">BUILT FOR REAL FOCUS</div>
          <h2 className="section-title section-title--light">
            Every session matters.
          </h2>
          <p className="section-subtitle section-subtitle--light">
            Numbers from our early access community.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="social-proof-stat"
            >
              <img src={stat.pet} alt="" className="social-proof-stat__pet" />
              <div className="social-proof-stat__number">{stat.value}</div>
              <div className="social-proof-stat__label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
