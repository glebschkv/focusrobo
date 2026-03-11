import { SkyBackground } from './SkyBackground';
import { IslandScene } from './IslandScene';
import { WaitlistForm } from './WaitlistForm';

const SMALL_ISLAND_PETS = [
  { speciesId: 'chick', rarity: 'common' as const, cellIndex: 0 },
  { speciesId: 'frog', rarity: 'common' as const, cellIndex: 0 },
  { speciesId: 'fox', rarity: 'uncommon' as const, cellIndex: 0 },
  { speciesId: 'deer', rarity: 'rare' as const, cellIndex: 0 },
];

export function FinalCTA() {
  return (
    <SkyBackground className="py-20 px-5">
      <div className="max-w-lg mx-auto text-center">
        <h2
          style={{
            fontSize: 'clamp(24px, 5vw, 36px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--fg-deep)',
            marginBottom: 16,
          }}
        >
          Your island is waiting.
        </h2>

        <div className="mb-8" style={{ maxWidth: 280, margin: '0 auto 32px' }}>
          <IslandScene gridSize={7} pets={SMALL_ISLAND_PETS} />
        </div>

        <WaitlistForm variant="cta" />

        <div className="mt-8 flex items-center justify-center gap-3" style={{ opacity: 0.5 }}>
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
