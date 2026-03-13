import { useState } from 'react';
import { motion } from 'framer-motion';
import { PET_DATABASE, RARITY_STYLES, type PetSpecies } from '../data/PetDatabase';

// Curated showcase for the marquee
const SHOWCASE_IDS = [
  'bunny', 'chick', 'capybara', 'frog', 'hedgehog', 'turtle',
  'fox', 'cat', 'corgi', 'penguin',
  'owl', 'panda', 'deer',
  'dragon', 'phoenix',
];

const RARITY_LEGEND = [
  { rarity: 'common', label: 'Common', color: 'var(--rarity-common)' },
  { rarity: 'uncommon', label: 'Uncommon', color: 'var(--rarity-uncommon)' },
  { rarity: 'rare', label: 'Rare', color: 'var(--rarity-rare)' },
  { rarity: 'epic', label: 'Epic', color: 'var(--rarity-epic)' },
  { rarity: 'legendary', label: 'Legendary', color: 'var(--rarity-legendary)' },
];

function PetCard({ pet }: { pet: PetSpecies }) {
  const [flipped, setFlipped] = useState(false);
  const style = RARITY_STYLES[pet.rarity];

  return (
    <div
      className={`pet-card pet-card--${pet.rarity} ${flipped ? 'pet-card--flipped' : ''}`}
      onClick={() => setFlipped(!flipped)}
      style={{ perspective: 800 }}
    >
      <div className="pet-card__inner">
        <div className="pet-card__front">
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

export function PetShowcase() {
  const showcasePets = SHOWCASE_IDS
    .map(id => PET_DATABASE.find(p => p.id === id))
    .filter((p): p is PetSpecies => !!p);

  // Double the pets for infinite marquee effect
  const marqueeItems = [...showcasePets, ...showcasePets];

  return (
    <section id="pets" className="section-cream py-24 px-5">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="section-label">MEET YOUR PETS</div>
          <h2 className="section-title">
            41 Species. 5 Rarities. Infinite Cuteness.
          </h2>
          <p className="section-subtitle">
            From common critters to legendary creatures. Tap any card to see growth stages.
          </p>
        </motion.div>

        {/* Auto-scrolling marquee */}
        <div className="marquee-container" style={{ marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20 }}>
          <div className="marquee-track" style={{ paddingTop: 8, paddingBottom: 8 }}>
            {marqueeItems.map((pet, i) => (
              <PetCard key={`${pet.id}-${i}`} pet={pet} />
            ))}
          </div>
        </div>

        {/* Rarity legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 md:gap-6 mt-10"
        >
          {RARITY_LEGEND.map(r => (
            <div key={r.rarity} className="flex items-center gap-2">
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: r.color,
                  boxShadow: r.rarity === 'legendary' ? `0 0 8px ${r.color}` : undefined,
                }}
              />
              <span style={{ fontSize: 13, color: 'var(--fg-muted)', fontWeight: 500 }}>
                {r.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
