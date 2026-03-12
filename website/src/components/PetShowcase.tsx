import { PET_DATABASE, RARITY_STYLES, type PetSpecies } from '../data/PetDatabase';
import { AnimatedSection, AnimatedItem } from './AnimatedSection';

// Curated: 3 common, 2 uncommon, 2 rare, 1 epic, 1 legendary (mystery)
const SHOWCASE_IDS = [
  'bunny', 'capybara', 'hedgehog',
  'fox', 'corgi',
  'owl', 'panda',
  'dragon',
  'unicorn',
];

function PetCard({ pet, isMystery }: { pet: PetSpecies; isMystery: boolean }) {
  const style = RARITY_STYLES[pet.rarity];
  const isEpicOrAbove = pet.rarity === 'epic' || pet.rarity === 'legendary';

  return (
    <div
      className={`rarity-card rarity-${pet.rarity} ${isMystery ? 'rarity-card--mystery' : ''}`}
      style={{
        width: isEpicOrAbove ? 160 : 140,
      }}
    >
      <div className="rarity-card-inner" style={{ padding: isEpicOrAbove ? '20px 16px' : '16px' }}>
        {isMystery ? (
          <>
            <img
              src={pet.imagePath}
              alt="???"
              className="pixel-art"
              style={{ width: 64, height: 64, objectFit: 'contain' }}
            />
            <div
              className="display-font"
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--rarity-legendary)',
                textShadow: '0 0 12px rgba(234,179,8,0.5)',
                marginTop: 8,
              }}
            >
              ???
            </div>
            <div className={`rarity-badge rarity-badge--legendary`}>Legendary</div>
          </>
        ) : (
          <>
            <img
              src={pet.imagePath}
              alt={pet.name}
              className={`pixel-art sprite--${pet.rarity}`}
              style={{
                width: isEpicOrAbove ? 72 : 64,
                height: isEpicOrAbove ? 72 : 64,
                objectFit: 'contain',
              }}
              loading="lazy"
            />
            <div
              className="display-font"
              style={{ fontSize: 14, fontWeight: 700, marginTop: 8, color: 'var(--fg-deep)' }}
            >
              {pet.name}
            </div>
            <div className={`rarity-badge rarity-badge--${pet.rarity}`}>
              {style.label}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function PetShowcase() {
  const legendaryIds = new Set(['unicorn', 'koi-fish']);

  const showcasePets = SHOWCASE_IDS
    .map(id => PET_DATABASE.find(p => p.id === id))
    .filter((p): p is PetSpecies => !!p);

  return (
    <section className="section-textured py-20 px-5">
      <div className="max-w-4xl mx-auto">
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
              41 species. 5 rarities.<br />Infinite heart-eyes.
            </h2>
          </AnimatedItem>
          <AnimatedItem>
            <p style={{ fontSize: 16, color: 'var(--fg-muted)', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
              From common bunnies to legendary unicorns, every focus session is a chance to discover someone new.
            </p>
          </AnimatedItem>
        </AnimatedSection>

        {/* Desktop: centered grid */}
        <AnimatedSection className="hidden md:flex flex-wrap gap-5 justify-center" stagger={0.08}>
          {showcasePets.map((pet) => (
            <AnimatedItem key={pet.id}>
              <PetCard pet={pet} isMystery={legendaryIds.has(pet.id)} />
            </AnimatedItem>
          ))}
        </AnimatedSection>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden scroll-container">
          <div className="scroll-track">
            {showcasePets.map(pet => (
              <PetCard key={pet.id} pet={pet} isMystery={legendaryIds.has(pet.id)} />
            ))}
          </div>
        </div>

        <AnimatedSection className="text-center mt-10">
          <AnimatedItem>
            <p style={{ fontSize: 15, color: 'var(--fg-muted)', fontStyle: 'italic' }}>
              And yes, there's a capybara.
            </p>
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </section>
  );
}
