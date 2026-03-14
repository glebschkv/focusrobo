import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useAnimation, type PanInfo } from 'framer-motion';
import { PET_DATABASE, RARITY_STYLES, type PetSpecies } from '../data/PetDatabase';

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

function PetCard({ pet, isFlipped, onFlip }: { pet: PetSpecies; isFlipped: boolean; onFlip: () => void }) {
  const style = RARITY_STYLES[pet.rarity];

  return (
    <div
      className={`pet-card pet-card--${pet.rarity} ${isFlipped ? 'pet-card--flipped' : ''}`}
      onClick={(e) => { e.stopPropagation(); onFlip(); }}
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const isDragging = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const CARD_W = isMobile ? 152 : 192;
  const GAP = 12;
  const STEP = CARD_W + GAP;
  const visibleCards = isMobile ? 2 : 4;
  const maxIndex = Math.max(0, showcasePets.length - visibleCards);

  const snapTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, maxIndex));
    setCurrentIndex(clamped);
    controls.start({ x: -clamped * STEP, transition: { type: 'spring', stiffness: 300, damping: 30 } });
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    isDragging.current = false;
    const threshold = STEP * 0.3;
    if (info.offset.x < -threshold) {
      snapTo(currentIndex + 1);
    } else if (info.offset.x > threshold) {
      snapTo(currentIndex - 1);
    } else {
      snapTo(currentIndex);
    }
  };

  const handleFlip = (i: number) => {
    if (isDragging.current) return;
    setFlippedIndex(flippedIndex === i ? null : i);
  };

  return (
    <section id="pets" className="section-cream" style={{ padding: '80px 20px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div className="section-label">MEET YOUR PETS</div>
          <h2 className="section-title">
            41 Species. 5 Rarities. Infinite Cuteness.
          </h2>
          <p className="section-subtitle">
            Swipe to explore. Tap any card to see growth stages.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="carousel-container" ref={containerRef}>
          {/* Left arrow — desktop only */}
          {!isMobile && currentIndex > 0 && (
            <button className="carousel-arrow carousel-arrow--left" onClick={() => snapTo(currentIndex - 1)} aria-label="Previous">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 4l-6 6 6 6" /></svg>
            </button>
          )}
          {!isMobile && currentIndex < maxIndex && (
            <button className="carousel-arrow carousel-arrow--right" onClick={() => snapTo(currentIndex + 1)} aria-label="Next">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 4l6 6-6 6" /></svg>
            </button>
          )}

          <div className="carousel-viewport">
            <motion.div
              className="carousel-track"
              drag="x"
              dragConstraints={{ left: -maxIndex * STEP, right: 0 }}
              dragElastic={0.12}
              onDragStart={() => { isDragging.current = true; }}
              onDragEnd={handleDragEnd}
              animate={controls}
              style={{ x, gap: GAP }}
            >
              {showcasePets.map((pet, i) => (
                <div key={pet.id} style={{ flex: `0 0 ${CARD_W}px` }}>
                  <PetCard
                    pet={pet}
                    isFlipped={flippedIndex === i}
                    onFlip={() => handleFlip(i)}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="carousel-dots" style={{ marginTop: 20 }}>
          {Array.from({ length: Math.ceil(showcasePets.length / visibleCards) }).map((_, i) => {
            const pageStart = i * visibleCards;
            const isActive = currentIndex >= pageStart && currentIndex < pageStart + visibleCards;
            return (
              <button
                key={i}
                className={`carousel-dot ${isActive ? 'carousel-dot--active' : ''}`}
                onClick={() => snapTo(pageStart)}
                aria-label={`Page ${i + 1}`}
              />
            );
          })}
        </div>

        {/* Rarity legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 20px', marginTop: 28 }}
        >
          {RARITY_LEGEND.map(r => (
            <div key={r.rarity} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
