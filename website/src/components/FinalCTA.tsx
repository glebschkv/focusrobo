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
      <section ref={ref} style={{ padding: '100px 20px' }}>
        <div className="max-w-2xl mx-auto text-center">
          <AnimatedSection>
            <AnimatedItem>
              <h2 className="section-heading display-font">
                Your island is waiting
              </h2>
            </AnimatedItem>
            <AnimatedItem>
              <p className="section-desc" style={{ marginBottom: 12 }}>
                Block distracting apps, earn pixel art pets, and build your own floating island. Launching soon on iOS.
              </p>
            </AnimatedItem>
            <AnimatedItem>
              <p className="accent-label" style={{ marginBottom: 32 }}>
                Early members get a free Legendary Egg on launch day.
              </p>
            </AnimatedItem>
          </AnimatedSection>

          <div style={{ maxWidth: 400, margin: '0 auto 40px' }}>
            <div style={{ animation: 'island-bob 5s ease-in-out infinite' }}>
              <IslandScene gridSize={8} pets={SMALL_ISLAND_PETS} />
            </div>
          </div>

          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <WaitlistForm variant="cta" />
          </div>
        </div>
      </section>
    </SkyBackground>
  );
});
