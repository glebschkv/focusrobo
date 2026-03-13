import { SkyBackground } from './SkyBackground';
import { IslandScene } from './IslandScene';
import { WaitlistForm } from './WaitlistForm';
import { motion } from 'framer-motion';

const SMALL_ISLAND_PETS = [
  { speciesId: 'chick', rarity: 'common' as const, cellIndex: 0 },
  { speciesId: 'frog', rarity: 'common' as const, cellIndex: 0 },
  { speciesId: 'fox', rarity: 'uncommon' as const, cellIndex: 0 },
  { speciesId: 'deer', rarity: 'rare' as const, cellIndex: 0 },
];

export function FinalCTA() {
  return (
    <SkyBackground className="py-24 px-5">
      <div className="max-w-lg mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2
            style={{
              fontSize: 'clamp(28px, 6vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--fg-deep)',
              marginBottom: 8,
              lineHeight: 1.1,
            }}
          >
            Your Island is Waiting.
          </h2>
          <p
            style={{
              fontSize: 16,
              color: 'var(--fg-muted)',
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Join the adventurers building their floating paradise. Free Legendary Egg included.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ maxWidth: 260, margin: '0 auto 32px' }}
        >
          <IslandScene gridSize={7} pets={SMALL_ISLAND_PETS} />
        </motion.div>

        <WaitlistForm variant="cta" />

        <div className="mt-10 flex items-center justify-center gap-4" style={{ opacity: 0.5 }}>
          <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Coming to iOS</span>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--fg-muted)',
              background: 'rgba(255,255,255,0.5)',
            }}
          >
            App Store
          </div>
        </div>
      </div>
    </SkyBackground>
  );
}
