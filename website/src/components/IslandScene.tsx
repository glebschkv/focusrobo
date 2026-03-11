import { IslandSVG } from './IslandSVG';
import { getIslandPosition, getDepthScale, getDepthZIndex, getAvailableCellIndices } from '../data/islandPositions';
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

// Curated pets for the hero island
const HERO_PETS: PetOnIsland[] = [
  { speciesId: 'bunny', rarity: 'common', cellIndex: 0 },
  { speciesId: 'fox', rarity: 'uncommon', cellIndex: 0 },
  { speciesId: 'cat', rarity: 'uncommon', cellIndex: 0 },
  { speciesId: 'capybara', rarity: 'common', cellIndex: 0 },
  { speciesId: 'owl', rarity: 'rare', cellIndex: 0 },
  { speciesId: 'corgi', rarity: 'uncommon', cellIndex: 0 },
  { speciesId: 'panda', rarity: 'rare', cellIndex: 0 },
  { speciesId: 'dragon', rarity: 'epic', cellIndex: 0 },
  { speciesId: 'hedgehog', rarity: 'common', cellIndex: 0 },
  { speciesId: 'penguin', rarity: 'uncommon', cellIndex: 0 },
];

function assignPetPositions(pets: PetOnIsland[], gridSize: number): PetOnIsland[] {
  const available = Array.from(getAvailableCellIndices(gridSize));
  // Spread pets evenly across available cells
  const step = Math.floor(available.length / pets.length);
  return pets.map((pet, i) => ({
    ...pet,
    cellIndex: available[Math.min(i * step + Math.floor(step / 2), available.length - 1)],
  }));
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
