import { useState } from 'react';
import { motion } from 'framer-motion';
import { PET_DATABASE, RARITY_STYLES, type PetSpecies, type PetRarity } from '../data/PetDatabase';

// Curated showcase: 6 common, 4 uncommon, 3 rare, 2 epic, 2 legendary (mystery)
const SHOWCASE_IDS = [
  'bunny', 'chick', 'capybara', 'frog', 'hedgehog', 'turtle',
  'fox', 'cat', 'corgi', 'penguin',
  'owl', 'panda', 'deer',
  'dragon', 'phoenix',
  'unicorn', 'koi-fish',
];

function PetCard({ pet, isMystery }: { pet: PetSpecies; isMystery: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const style = RARITY_STYLES[pet.rarity];

  return (
    <div
      className={`pet-card pet-card--${pet.rarity} ${flipped ? 'pet-card--flipped' : ''} ${isMystery ? 'pet-card--mystery' : ''}`}
      onClick={() => !isMystery && setFlipped(!flipped)}
      style={{ perspective: 800 }}
    >
      <div className="pet-card__inner">
        <div className="pet-card__front">
          {isMystery ? (
            <>
              <img src={pet.imagePath} alt="???" className="pet-card__sprite" />
              <div className="pet-card__mystery-label">???</div>
            </>
          ) : (
            <>
              <img
                src={pet.imagePath}
                alt={pet.name}
                className={`pet-card__sprite sprite--${pet.rarity}`}
                loading="lazy"
              />
              <div className="pet-card__name">{pet.name}</div>
              <div className={`rarity-badge rarity-badge--${pet.rarity}`}>
                {style.label}
              </div>
            </>
          )}
        </div>
        <div className="pet-card__back">
          <div className="pet-card__desc">{pet.description}</div>
          <div className="mt-2 flex gap-1">
            {['baby', 'adolescent', 'adult'].map(size => (
              <img
                key={size}
                src={`/pets/${pet.id}-${size}.png`}
                alt={`${pet.name} ${size}`}
                style={{ width: 32, height: 32, opacity: size === 'baby' ? 1 : 0.6 }}
                loading="lazy"
              />
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--fg-muted)', marginTop: 4 }}>
            baby · adolescent · adult
          </div>
        </div>
      </div>
    </div>
  );
}

function RarityFilter({ active, onChange }: { active: PetRarity | 'all'; onChange: (r: PetRarity | 'all') => void }) {
  const rarities: (PetRarity | 'all')[] = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
  return (
    <div className="flex gap-2 justify-center flex-wrap mb-6">
      {rarities.map(r => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
          style={{
            background: active === r ? 'var(--primary)' : 'var(--muted)',
            color: active === r ? 'white' : 'var(--fg-muted)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {r === 'all' ? 'All' : RARITY_STYLES[r].label}
        </button>
      ))}
    </div>
  );
}

export function PetShowcase() {
  const [filter, setFilter] = useState<PetRarity | 'all'>('all');
  const legendaryIds = new Set(['unicorn', 'koi-fish']);

  const showcasePets = SHOWCASE_IDS
    .map(id => PET_DATABASE.find(p => p.id === id))
    .filter((p): p is PetSpecies => !!p)
    .filter(p => filter === 'all' || p.rarity === filter);

  return (
    <section className="section-cream py-20 px-5">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            41 Species to Discover
          </h2>
          <p style={{ fontSize: 15, color: 'var(--fg-muted)', maxWidth: 420, margin: '0 auto' }}>
            From common critters to legendary creatures. Tap a card to flip it.
          </p>
        </motion.div>

        <RarityFilter active={filter} onChange={setFilter} />

        {/* Desktop: grid. Mobile: horizontal scroll */}
        <div className="hidden md:flex flex-wrap gap-4 justify-center">
          {showcasePets.map((pet, i) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <PetCard pet={pet} isMystery={legendaryIds.has(pet.id)} />
            </motion.div>
          ))}
        </div>
        <div className="md:hidden scroll-track">
          {showcasePets.map(pet => (
            <PetCard key={pet.id} pet={pet} isMystery={legendaryIds.has(pet.id)} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <p style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
            + {PET_DATABASE.length - SHOWCASE_IDS.length} more species to discover in the app
          </p>
        </motion.div>
      </div>
    </section>
  );
}
