import { motion } from 'framer-motion';
import { IslandSVG } from './IslandSVG';

const GROWTH_STAGES = [
  { gridSize: 5, label: 'Your first island', petCount: '25 cells', caption: 'A cozy start' },
  { gridSize: 7, label: 'Growing strong', petCount: '49 cells', caption: 'More room to explore' },
  { gridSize: 10, label: 'Thriving paradise', petCount: '100 cells', caption: 'A bustling community' },
  { gridSize: 12, label: 'Paradise achieved', petCount: '144 cells', caption: 'Archive & start anew' },
];

export function IslandGrowth() {
  return (
    <section className="section-cream pixel-texture py-20 px-5">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Watch Your Island Grow
          </h2>
          <p style={{ fontSize: 15, color: 'var(--fg-muted)', maxWidth: 420, margin: '0 auto' }}>
            Every focus session fills your island. When it's complete, archive it and start fresh.
          </p>
        </motion.div>

        {/* Desktop: grid. Mobile: scroll */}
        <div className="hidden md:grid md:grid-cols-4 gap-6">
          {GROWTH_STAGES.map((stage, i) => (
            <motion.div
              key={stage.gridSize}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.175, 0.885, 0.32, 1.1] }}
              className="text-center"
            >
              <div
                className="game-card p-4 mb-3"
                style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <div style={{ width: '100%', animation: 'island-bob 4s ease-in-out infinite', animationDelay: `${i * 0.5}s` }}>
                  <IslandSVG gridSize={stage.gridSize} />
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{stage.label}</div>
              <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{stage.petCount}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{stage.caption}</div>
            </motion.div>
          ))}
        </div>

        <div className="md:hidden scroll-track">
          {GROWTH_STAGES.map((stage) => (
            <div key={stage.gridSize} className="text-center" style={{ width: 200, flexShrink: 0 }}>
              <div
                className="game-card p-3 mb-3"
                style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <div style={{ width: '100%', animation: 'island-bob 4s ease-in-out infinite' }}>
                  <IslandSVG gridSize={stage.gridSize} />
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{stage.label}</div>
              <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{stage.petCount}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{stage.caption}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
