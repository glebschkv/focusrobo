import { IslandSVG } from './IslandSVG';
import { getIslandPosition, getDepthScale, getDepthZIndex } from '../data/islandPositions';
import type { PetRarity } from '../data/PetDatabase';

export interface PetOnIsland {
  speciesId: string;
  rarity: PetRarity;
  cellIndex: number;
}

interface IslandSceneProps {
  gridSize?: number;
  pets?: PetOnIsland[];
  compact?: boolean;
  showParticles?: boolean;
}

// Curated pets for the hero island — fewer pets, looks more natural
const HERO_PETS: PetOnIsland[] = [
  { speciesId: 'bunny', rarity: 'common', cellIndex: 0 },
  { speciesId: 'fox', rarity: 'uncommon', cellIndex: 0 },
  { speciesId: 'cat', rarity: 'uncommon', cellIndex: 0 },
  { speciesId: 'owl', rarity: 'rare', cellIndex: 0 },
  { speciesId: 'dragon', rarity: 'epic', cellIndex: 0 },
  { speciesId: 'hedgehog', rarity: 'common', cellIndex: 0 },
  { speciesId: 'corgi', rarity: 'uncommon', cellIndex: 0 },
];

// Three idle animation variants so pets feel individually alive
const IDLE_ANIMATIONS = [
  'pet-idle-bounce',
  'pet-idle-wiggle',
  'pet-idle-look',
];

function assignPetPositions(pets: PetOnIsland[], gridSize: number): PetOnIsland[] {
  const size = Math.max(5, Math.min(12, gridSize));
  const offset = Math.floor((20 - size) / 2);

  const scatterPattern = [
    [0.25, 0.50],
    [0.50, 0.20],
    [0.70, 0.75],
    [0.15, 0.80],
    [0.55, 0.50],
    [0.80, 0.30],
    [0.35, 0.70],
    [0.65, 0.15],
    [0.40, 0.35],
    [0.85, 0.60],
    [0.20, 0.30],
    [0.60, 0.85],
  ];

  return pets.map((pet, i) => {
    const pattern = scatterPattern[i % scatterPattern.length];
    const row = offset + Math.floor(pattern[0] * (size - 1));
    const col = offset + Math.floor(pattern[1] * (size - 1));
    return {
      ...pet,
      cellIndex: row * 20 + col,
    };
  });
}

// Floating particles around the island
const PARTICLES = [
  { top: '15%', left: '10%', delay: 0, size: 4 },
  { top: '25%', left: '85%', delay: 1.2, size: 3 },
  { top: '60%', left: '5%', delay: 2.5, size: 3 },
  { top: '45%', left: '92%', delay: 0.8, size: 4 },
  { top: '75%', left: '15%', delay: 3.1, size: 2 },
  { top: '20%', left: '70%', delay: 1.8, size: 3 },
];

export function IslandScene({ gridSize = 10, pets, compact, showParticles }: IslandSceneProps) {
  const displayPets = assignPetPositions(pets || HERO_PETS, gridSize);

  return (
    <div className={`island-wrapper ${compact ? 'island-wrapper--compact' : ''}`}>
      <IslandSVG gridSize={gridSize} />

      {/* Cloud shadow drifting across island surface */}
      <div className="island-cloud-shadow" />

      <div className="island-pets">
        {displayPets.map((pet, i) => {
          const pos = getIslandPosition(pet.cellIndex, gridSize);
          if (!pos) return null;
          const depthScale = getDepthScale(pet.cellIndex);
          const zIndex = getDepthZIndex(pet.cellIndex);
          const idleAnim = IDLE_ANIMATIONS[i % IDLE_ANIMATIONS.length];
          const animDuration = [2.5, 3.2, 4][i % 3];
          const animDelay = (i % 11) * 0.27;

          return (
            <div
              key={`${pet.speciesId}-${i}`}
              className={`island-pet island-pet--${pet.rarity} ${i === 2 ? 'island-pet--sparkle' : ''}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                zIndex,
                transform: `translate(-50%, -60%) scale(${depthScale})`,
                animation: `${idleAnim} ${animDuration}s ease-in-out ${animDelay}s infinite`,
              }}
            >
              <img
                src={`/pets/${pet.speciesId}-baby.png`}
                alt={pet.speciesId}
                loading={i < 5 ? 'eager' : 'lazy'}
              />
            </div>
          );
        })}
      </div>

      {/* Floating particles */}
      {showParticles && (
        <div className="island-particles">
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              className="island-particle"
              style={{
                top: p.top,
                left: p.left,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="island-shadow" />
    </div>
  );
}
