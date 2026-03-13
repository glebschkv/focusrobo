import { IslandSVG } from './IslandSVG';
import { getIslandPosition, getDepthScale, getDepthZIndex } from '../data/islandPositions';
import type { PetRarity } from '../data/PetDatabase';

interface PetOnIsland {
  speciesId: string;
  rarity: PetRarity;
  cellIndex: number;
}

interface IslandSceneProps {
  gridSize?: number;
  pets?: PetOnIsland[];
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

function assignPetPositions(pets: PetOnIsland[], gridSize: number): PetOnIsland[] {
  const size = Math.max(5, Math.min(12, gridSize));
  const offset = Math.floor((20 - size) / 2);

  // Place pets in a natural scattered pattern across the island grid
  // Use hand-tuned (row, col) offsets within the active grid to avoid diagonal lines
  const scatterPattern = [
    [0.25, 0.50], // top-center
    [0.50, 0.20], // mid-left
    [0.70, 0.75], // lower-right
    [0.15, 0.80], // top-right
    [0.55, 0.50], // center
    [0.80, 0.30], // bottom-left
    [0.35, 0.70], // upper-right
    [0.65, 0.15], // mid-left-low
    [0.40, 0.35], // center-left
    [0.85, 0.60], // bottom-center
    [0.20, 0.30], // top-left
    [0.60, 0.85], // right
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

export function IslandScene({ gridSize = 10, pets }: IslandSceneProps) {
  const displayPets = assignPetPositions(pets || HERO_PETS, gridSize);

  return (
    <div className="island-wrapper">
      <IslandSVG gridSize={gridSize} />
      <div className="island-pets">
        {displayPets.map((pet, i) => {
          const pos = getIslandPosition(pet.cellIndex, gridSize);
          if (!pos) return null;
          const depthScale = getDepthScale(pet.cellIndex);
          const zIndex = getDepthZIndex(pet.cellIndex);
          const bobDelay = (i % 11) * 0.27;

          return (
            <div
              key={`${pet.speciesId}-${i}`}
              className={`island-pet island-pet--${pet.rarity}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                zIndex,
                transform: `translate(-50%, -60%) scale(${depthScale})`,
                animation: `pet-bob 3s ease-in-out ${bobDelay}s infinite`,
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
      <div className="island-shadow" />
    </div>
  );
}
