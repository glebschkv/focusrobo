import { IslandScene } from './IslandScene';
import { AnimatedSection, AnimatedItem } from './AnimatedSection';
import type { PetRarity } from '../data/PetDatabase';

interface StagePet {
  speciesId: string;
  rarity: PetRarity;
  cellIndex: number;
}

const GROWTH_STAGES: {
  gridSize: number;
  label: string;
  tagline: string;
  pets: StagePet[];
}[] = [
  {
    gridSize: 5,
    label: 'First Steps',
    tagline: 'A cozy 5x5 patch and your very first pet.',
    pets: [
      { speciesId: 'bunny', rarity: 'common', cellIndex: 0 },
    ],
  },
  {
    gridSize: 7,
    label: 'Growing',
    tagline: 'More sessions, more pets, more room.',
    pets: [
      { speciesId: 'bunny', rarity: 'common', cellIndex: 0 },
      { speciesId: 'chick', rarity: 'common', cellIndex: 0 },
      { speciesId: 'fox', rarity: 'uncommon', cellIndex: 0 },
    ],
  },
  {
    gridSize: 10,
    label: 'Thriving',
    tagline: 'Your island expands as your focus deepens.',
    pets: [
      { speciesId: 'bunny', rarity: 'common', cellIndex: 0 },
      { speciesId: 'capybara', rarity: 'common', cellIndex: 0 },
      { speciesId: 'fox', rarity: 'uncommon', cellIndex: 0 },
      { speciesId: 'owl', rarity: 'rare', cellIndex: 0 },
      { speciesId: 'corgi', rarity: 'uncommon', cellIndex: 0 },
      { speciesId: 'hedgehog', rarity: 'common', cellIndex: 0 },
    ],
  },
  {
    gridSize: 12,
    label: 'Complete',
    tagline: 'A full island. Archive it. Start fresh.',
    pets: [
      { speciesId: 'bunny', rarity: 'common', cellIndex: 0 },
      { speciesId: 'chick', rarity: 'common', cellIndex: 0 },
      { speciesId: 'fox', rarity: 'uncommon', cellIndex: 0 },
      { speciesId: 'cat', rarity: 'uncommon', cellIndex: 0 },
      { speciesId: 'owl', rarity: 'rare', cellIndex: 0 },
      { speciesId: 'panda', rarity: 'rare', cellIndex: 0 },
      { speciesId: 'dragon', rarity: 'epic', cellIndex: 0 },
      { speciesId: 'capybara', rarity: 'common', cellIndex: 0 },
      { speciesId: 'hedgehog', rarity: 'common', cellIndex: 0 },
      { speciesId: 'penguin', rarity: 'uncommon', cellIndex: 0 },
    ],
  },
];

export function IslandGrowth() {
  return (
    <section className="section-textured py-20 px-5">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection className="text-center mb-12">
          <AnimatedItem>
            <h2
              className="display-font"
              style={{
                fontSize: 'clamp(26px, 6vw, 40px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                marginBottom: 10,
                color: 'var(--fg-deep)',
              }}
            >
              Watch your island come alive
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p style={{ fontSize: 16, color: 'var(--fg-muted)', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
              Every pet you earn finds a home. Fill it up, archive your masterpiece, start fresh.
            </p>
          </AnimatedItem>
        </AnimatedSection>

        {/* Desktop: grid */}
        <AnimatedSection className="hidden md:grid md:grid-cols-4 gap-6" stagger={0.12}>
          {GROWTH_STAGES.map((stage) => (
            <AnimatedItem key={stage.gridSize}>
              <div className="glass-warm p-4 mb-3">
                <div style={{ animation: 'island-bob 5s ease-in-out infinite' }}>
                  <IslandScene gridSize={stage.gridSize} pets={stage.pets} />
                </div>
              </div>
              <div className="text-center mt-2">
                <div className="display-font" style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg-deep)' }}>
                  {stage.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2, lineHeight: 1.4 }}>
                  {stage.tagline}
                </div>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedSection>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden scroll-container">
          <div className="scroll-track">
            {GROWTH_STAGES.map((stage) => (
              <div key={stage.gridSize} style={{ width: 220, flexShrink: 0 }}>
                <div className="glass-warm p-3 mb-3">
                  <div style={{ animation: 'island-bob 5s ease-in-out infinite' }}>
                    <IslandScene gridSize={stage.gridSize} pets={stage.pets} />
                  </div>
                </div>
                <div className="text-center">
                  <div className="display-font" style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-deep)' }}>
                    {stage.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
                    {stage.tagline}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
