import { motion } from 'framer-motion';
import { IslandSVG } from './IslandSVG';

const GROWTH_STAGES = [
  { gridSize: 5, label: 'First Steps', petCount: '25 pets', scale: 0.7 },
  { gridSize: 7, label: 'Growing Strong', petCount: '49 pets', scale: 0.8 },
  { gridSize: 10, label: 'Thriving', petCount: '100 pets', scale: 0.9 },
  { gridSize: 12, label: 'Paradise', petCount: '144 pets', scale: 1.0 },
];

export function IslandGrowth() {
  return (
    <section className="section-green py-24 px-5">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="section-label">WATCH IT GROW</div>
          <h2 className="section-title">From Tiny Plot to Massive Paradise</h2>
          <p className="section-subtitle">
            Your island expands as you collect more pets. Fill it up, archive it, and start a brand new one.
          </p>
        </motion.div>

        {/* Desktop: grid with arrows. Mobile: scroll */}
        <div className="hidden md:grid md:grid-cols-4 gap-4 items-end">
          {GROWTH_STAGES.map((stage, i) => (
            <motion.div
              key={stage.gridSize}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.175, 0.885, 0.32, 1.1] }}
              className="text-center relative"
            >
              {/* Arrow between stages */}
              {i > 0 && (
                <div
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-10"
                  style={{ color: 'var(--primary)', opacity: 0.3 }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </div>
              )}
              <div
                className="feature-card p-4 mb-4"
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${stage.scale})`,
                  transformOrigin: 'bottom center',
                }}
              >
                <div style={{ width: '100%', animation: 'island-bob 4s ease-in-out infinite', animationDelay: `${i * 0.5}s` }}>
                  <IslandSVG gridSize={stage.gridSize} />
                </div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{stage.label}</div>
              <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>{stage.petCount}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
                {stage.gridSize}×{stage.gridSize} grid
              </div>
            </motion.div>
          ))}
        </div>

        <div className="md:hidden scroll-track">
          {GROWTH_STAGES.map((stage) => (
            <div key={stage.gridSize} className="text-center" style={{ width: 200, flexShrink: 0 }}>
              <div
                className="feature-card p-3 mb-3"
                style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <div style={{ width: '100%', animation: 'island-bob 4s ease-in-out infinite' }}>
                  <IslandSVG gridSize={stage.gridSize} />
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{stage.label}</div>
              <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>{stage.petCount}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{stage.gridSize}×{stage.gridSize} grid</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
