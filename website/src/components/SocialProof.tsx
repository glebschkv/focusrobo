import { motion } from 'framer-motion';

export function SocialProof() {
  return (
    <section className="section-cream py-20 px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div
          style={{
            fontSize: 'clamp(20px, 4vw, 28px)',
            fontWeight: 600,
            lineHeight: 1.4,
            color: 'var(--fg-deep)',
            fontStyle: 'italic',
            marginBottom: 16,
          }}
        >
          "We built PhoNo because every focus app felt like a chore. We wanted something
          that made you excited to put your phone down."
        </div>
        <div style={{ fontSize: 14, color: 'var(--fg-muted)', fontWeight: 500 }}>
          — The PhoNo Team
        </div>
      </motion.div>
    </section>
  );
}
