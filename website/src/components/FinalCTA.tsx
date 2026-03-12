import { forwardRef } from 'react';
import { SkyBackground } from './SkyBackground';
import { IslandScene } from './IslandScene';
import { WaitlistForm } from './WaitlistForm';
import { AnimatedSection, AnimatedItem } from './AnimatedSection';

const SMALL_ISLAND_PETS = [
  { speciesId: 'chick', rarity: 'common' as const, cellIndex: 0 },
  { speciesId: 'fox', rarity: 'uncommon' as const, cellIndex: 0 },
  { speciesId: 'owl', rarity: 'rare' as const, cellIndex: 0 },
];

export const FinalCTA = forwardRef<HTMLElement>(function FinalCTA(_, ref) {
  return (
    <SkyBackground>
      <section ref={ref} className="py-20 px-5">
        <div className="max-w-lg mx-auto text-center">
          <AnimatedSection>
            <AnimatedItem>
              <h2
                className="display-font"
                style={{
                  fontSize: 'clamp(26px, 6vw, 40px)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg-deep)',
                  marginBottom: 10,
                }}
              >
                Your island is waiting
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p style={{ fontSize: 16, color: 'var(--fg-muted)', maxWidth: 400, margin: '0 auto 8px', lineHeight: 1.6 }}>
                PhoNo is launching soon on iOS. Join the waitlist and start building your world.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--accent-warm)',
                  marginBottom: 24,
                }}
              >
                Early members get a free Legendary Egg on launch day.
              </p>
            </AnimatedItem>
          </AnimatedSection>

          <div style={{ maxWidth: 260, margin: '0 auto 32px' }}>
            <div style={{ animation: 'island-bob 5s ease-in-out infinite' }}>
              <IslandScene gridSize={6} pets={SMALL_ISLAND_PETS} />
            </div>
          </div>

          <WaitlistForm variant="cta" />
        </div>
      </section>
    </SkyBackground>
  );
});
