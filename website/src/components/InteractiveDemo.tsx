import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IslandScene, type PetOnIsland } from './IslandScene';
import type { PetRarity } from '../data/PetDatabase';

interface DemoPet {
  id: string;
  rarity: PetRarity;
}

// Curated pool ordered for visual variety — deterministic, not random
const DEMO_POOL: DemoPet[] = [
  { id: 'fox', rarity: 'uncommon' },
  { id: 'chick', rarity: 'common' },
  { id: 'owl', rarity: 'rare' },
  { id: 'cat', rarity: 'uncommon' },
  { id: 'dragon', rarity: 'epic' },
  { id: 'hedgehog', rarity: 'common' },
  { id: 'panda', rarity: 'rare' },
  { id: 'corgi', rarity: 'uncommon' },
  { id: 'unicorn', rarity: 'legendary' },
  { id: 'frog', rarity: 'common' },
  { id: 'penguin', rarity: 'uncommon' },
  { id: 'phoenix', rarity: 'epic' },
  { id: 'deer', rarity: 'rare' },
  { id: 'hamster', rarity: 'common' },
  { id: 'axolotl', rarity: 'epic' },
  { id: 'shiba-inu', rarity: 'uncommon' },
  { id: 'turtle', rarity: 'common' },
  { id: 'tiger', rarity: 'epic' },
  { id: 'koala', rarity: 'uncommon' },
  { id: 'bunny', rarity: 'common' },
  { id: 'wolf', rarity: 'rare' },
  { id: 'seal', rarity: 'uncommon' },
  { id: 'bee', rarity: 'common' },
  { id: 'flamingo', rarity: 'rare' },
  { id: 'capybara', rarity: 'common' },
];

const INITIAL_PETS: PetOnIsland[] = [
  { speciesId: 'bunny', rarity: 'common', cellIndex: 0 },
  { speciesId: 'fox', rarity: 'uncommon', cellIndex: 0 },
];

const RARITY_LABELS: Record<PetRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const MAX_DEMO_TIER = 7;

export function InteractiveDemo() {
  const [pets, setPets] = useState<PetOnIsland[]>(INITIAL_PETS);
  const [gridSize, setGridSize] = useState(5);
  const [poolIndex, setPoolIndex] = useState(0);
  const [isHatching, setIsHatching] = useState(false);
  const [hatchingPet, setHatchingPet] = useState<DemoPet | null>(null);
  const [showEgg, setShowEgg] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [demoComplete, setDemoComplete] = useState(false);

  const maxPets = gridSize * gridSize;
  const progress = Math.min(pets.length / maxPets, 1);

  const handleSession = useCallback(() => {
    if (isHatching || demoComplete) return;

    const nextPet = DEMO_POOL[poolIndex % DEMO_POOL.length];
    setIsHatching(true);
    setShowEgg(true);
    setHatchingPet(nextPet);

    // Egg drops in, wobbles
    setTimeout(() => {
      // Egg cracks, pet revealed
      setShowEgg(false);

      setTimeout(() => {
        // Add pet to island
        const newPet: PetOnIsland = {
          speciesId: nextPet.id,
          rarity: nextPet.rarity,
          cellIndex: 0,
        };
        const updatedPets = [...pets, newPet];
        setPets(updatedPets);
        setPoolIndex(prev => prev + 1);
        setHatchingPet(null);

        // Check if tier is full
        if (updatedPets.length >= maxPets) {
          if (gridSize < MAX_DEMO_TIER) {
            // Expand island
            setTimeout(() => {
              setShowCelebration(true);
              setGridSize(prev => prev + 1);
              setTimeout(() => {
                setShowCelebration(false);
                setIsHatching(false);
              }, 1200);
            }, 400);
          } else {
            // Demo complete
            setDemoComplete(true);
            setIsHatching(false);
          }
        } else {
          setIsHatching(false);
        }
      }, 300);
    }, 900);
  }, [isHatching, demoComplete, poolIndex, pets, maxPets, gridSize]);

  const handleReset = useCallback(() => {
    setPets(INITIAL_PETS);
    setGridSize(5);
    setPoolIndex(0);
    setIsHatching(false);
    setHatchingPet(null);
    setShowEgg(false);
    setShowCelebration(false);
    setDemoComplete(false);
  }, []);

  return (
    <section className="section-dark" style={{ padding: '80px 20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-label" style={{ color: 'var(--accent)' }}>TRY IT YOURSELF</div>
          <h2 className="section-title" style={{ color: '#fff' }}>Watch Your Island Come to Life</h2>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Tap the button to see what happens after each focus session.
          </p>
        </motion.div>

        {/* Island */}
        <div style={{ position: 'relative', margin: '32px auto 0' }}>
          <IslandScene gridSize={gridSize} pets={pets} />

          {/* Egg animation overlay */}
          <AnimatePresence>
            {showEgg && hatchingPet && (
              <motion.div
                initial={{ y: -40, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="demo-egg"
              >
                <img
                  src="/icons/egg.png"
                  alt="Hatching egg"
                  width="48"
                  height="48"
                  style={{ imageRendering: 'pixelated', animation: 'egg-rock 0.5s ease-in-out infinite' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pet reveal flash */}
          <AnimatePresence>
            {!showEgg && hatchingPet && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="demo-egg"
              >
                <img
                  src={`/pets/${hatchingPet.id}-baby.png`}
                  alt={hatchingPet.id}
                  width="48"
                  height="48"
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className={`demo-rarity-badge demo-rarity-badge--${hatchingPet.rarity}`}>
                  {RARITY_LABELS[hatchingPet.rarity]}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expansion celebration */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="demo-celebration"
              >
                Island Expanded!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="demo-progress" style={{ margin: '24px auto 0', maxWidth: 320 }}>
          <div className="demo-progress__bar">
            <motion.div
              className="demo-progress__fill"
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="demo-progress__label">
            {pets.length}/{maxPets} pets · {gridSize}×{gridSize} island
          </div>
        </div>

        {/* Action button */}
        {!demoComplete ? (
          <motion.button
            className="cta-accent demo-session-btn"
            onClick={handleSession}
            disabled={isHatching}
            whileTap={{ scale: 0.97 }}
            style={{ marginTop: 20 }}
          >
            <img src="/icons/egg.png" alt="" width="20" height="20" style={{ imageRendering: 'pixelated' }} />
            {isHatching ? 'Hatching...' : 'Complete a Session'}
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 24 }}
          >
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '0 0 12px' }}>
              Your island is full! Imagine 6 themed islands to fill...
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#waitlist" className="cta-accent">Join the Waitlist</a>
              <button
                onClick={handleReset}
                className="cta-secondary"
                style={{ fontSize: 14 }}
              >
                Reset Demo
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
