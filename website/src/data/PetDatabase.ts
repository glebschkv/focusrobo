/**
 * Pet Database — ported from main app for marketing website.
 * Stripped of game logic (pity, rolling, etc.) — just species data + rarity info.
 */

export type PetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type GrowthSize = 'baby' | 'adolescent' | 'adult';

export interface PetSpecies {
  id: string;
  name: string;
  rarity: PetRarity;
  unlockLevel: number;
  description: string;
  imagePath: string;
}

export const PET_DATABASE: PetSpecies[] = [
  // Common (16)
  { id: 'bunny', name: 'Bunny', rarity: 'common', unlockLevel: 0, description: 'A fluffy little bunny that loves peaceful meadows.', imagePath: '/pets/bunny.png' },
  { id: 'chick', name: 'Chick', rarity: 'common', unlockLevel: 0, description: 'A cheerful baby chick always ready to explore.', imagePath: '/pets/chick.png' },
  { id: 'frog', name: 'Frog', rarity: 'common', unlockLevel: 2, description: 'A chill frog who thrives in calm environments.', imagePath: '/pets/frog.png' },
  { id: 'hamster', name: 'Hamster', rarity: 'common', unlockLevel: 3, description: 'A busy little hamster always on the go.', imagePath: '/pets/hamster.png' },
  { id: 'duckling', name: 'Duckling', rarity: 'common', unlockLevel: 5, description: 'A wobbly duckling with big dreams.', imagePath: '/pets/duckling.png' },
  { id: 'capybara', name: 'Capybara', rarity: 'common', unlockLevel: 6, description: 'The chillest pet — radiates calm focus energy.', imagePath: '/pets/capybara.png' },
  { id: 'hedgehog', name: 'Hedgehog', rarity: 'common', unlockLevel: 7, description: 'A spiky friend who curls up during breaks.', imagePath: '/pets/hedgehog.png' },
  { id: 'turtle', name: 'Turtle', rarity: 'common', unlockLevel: 8, description: 'Slow and steady wins the focus race.', imagePath: '/pets/turtle.png' },
  { id: 'bee', name: 'Bee', rarity: 'common', unlockLevel: 9, description: 'A busy bee that buzzes with productivity.', imagePath: '/pets/bee.png' },
  { id: 'mouse', name: 'Mouse', rarity: 'common', unlockLevel: 10, description: 'A tiny mouse who nibbles through study notes.', imagePath: '/pets/mouse.png' },
  { id: 'butterfly', name: 'Butterfly', rarity: 'common', unlockLevel: 11, description: 'A colorful butterfly that transforms with dedication.', imagePath: '/pets/butterfly.png' },
  { id: 'elephant', name: 'Elephant', rarity: 'common', unlockLevel: 12, description: 'An elephant that never forgets a focus session.', imagePath: '/pets/elephant.png' },
  { id: 'monkey', name: 'Monkey', rarity: 'common', unlockLevel: 13, description: 'A clever monkey that swings into action.', imagePath: '/pets/monkey.png' },
  { id: 'sparrow', name: 'Sparrow', rarity: 'common', unlockLevel: 14, description: 'A cheerful sparrow that sings during focus time.', imagePath: '/pets/sparrow.png' },
  { id: 'jellyfish', name: 'Jellyfish', rarity: 'common', unlockLevel: 15, description: 'A glowing jellyfish that drifts through deep focus.', imagePath: '/pets/jellyfish.png' },
  { id: 'sloth', name: 'Sloth', rarity: 'common', unlockLevel: 16, description: 'A peaceful sloth that masters the art of patience.', imagePath: '/pets/sloth.png' },

  // Uncommon (10)
  { id: 'fox', name: 'Fox', rarity: 'uncommon', unlockLevel: 4, description: 'A clever fox with a keen sense of focus.', imagePath: '/pets/fox.png' },
  { id: 'cat', name: 'Cat', rarity: 'uncommon', unlockLevel: 8, description: 'A curious cat who watches over your work.', imagePath: '/pets/cat.png' },
  { id: 'corgi', name: 'Corgi', rarity: 'uncommon', unlockLevel: 10, description: 'A loyal corgi that guards your focus time.', imagePath: '/pets/corgi.png' },
  { id: 'penguin', name: 'Penguin', rarity: 'uncommon', unlockLevel: 12, description: 'A determined penguin who never gives up.', imagePath: '/pets/penguin.png' },
  { id: 'shiba-inu', name: 'Shiba Inu', rarity: 'uncommon', unlockLevel: 14, description: 'Much focus. Very wow. Such dedication.', imagePath: '/pets/shiba-inu.png' },
  { id: 'koala', name: 'Koala', rarity: 'uncommon', unlockLevel: 16, description: 'A cuddly koala that clings to good habits.', imagePath: '/pets/koala.png' },
  { id: 'raccoon', name: 'Raccoon', rarity: 'uncommon', unlockLevel: 18, description: 'A crafty raccoon with nimble paws.', imagePath: '/pets/raccoon.png' },
  { id: 'parrot', name: 'Parrot', rarity: 'uncommon', unlockLevel: 20, description: 'A colorful parrot that cheers you on.', imagePath: '/pets/parrot.png' },
  { id: 'otter', name: 'Otter', rarity: 'uncommon', unlockLevel: 22, description: 'A playful otter who rewards your persistence.', imagePath: '/pets/otter.png' },
  { id: 'seal', name: 'Seal', rarity: 'uncommon', unlockLevel: 24, description: 'A playful seal that claps for your achievements.', imagePath: '/pets/seal.png' },

  // Rare (9)
  { id: 'deer', name: 'Deer', rarity: 'rare', unlockLevel: 9, description: 'A graceful deer that appears only to the dedicated.', imagePath: '/pets/deer.png' },
  { id: 'owl', name: 'Owl', rarity: 'rare', unlockLevel: 16, description: 'A wise owl that rewards late-night focus.', imagePath: '/pets/owl.png' },
  { id: 'panda', name: 'Panda', rarity: 'rare', unlockLevel: 20, description: 'A zen panda that embodies focused calm.', imagePath: '/pets/panda.png' },
  { id: 'red-panda', name: 'Red Panda', rarity: 'rare', unlockLevel: 23, description: 'An adorable red panda with a fiery spirit.', imagePath: '/pets/red-panda.png' },
  { id: 'wolf', name: 'Wolf', rarity: 'rare', unlockLevel: 25, description: 'A loyal wolf drawn to focused discipline.', imagePath: '/pets/wolf.png' },
  { id: 'arctic-fox', name: 'Arctic Fox', rarity: 'rare', unlockLevel: 27, description: 'A rare white fox from the frozen tundra.', imagePath: '/pets/arctic-fox.png' },
  { id: 'polar-bear', name: 'Polar Bear', rarity: 'rare', unlockLevel: 28, description: 'A mighty polar bear that thrives in long focus sessions.', imagePath: '/pets/polar-bear.png' },
  { id: 'flamingo', name: 'Flamingo', rarity: 'rare', unlockLevel: 30, description: 'A fabulous flamingo that stands out from the crowd.', imagePath: '/pets/flamingo.png' },
  { id: 'crane', name: 'Crane', rarity: 'rare', unlockLevel: 32, description: 'An elegant crane symbolizing patience.', imagePath: '/pets/crane.png' },

  // Epic (4)
  { id: 'dragon', name: 'Dragon', rarity: 'epic', unlockLevel: 20, description: 'A baby dragon forged by deep focus.', imagePath: '/pets/dragon.png' },
  { id: 'tiger', name: 'Tiger', rarity: 'epic', unlockLevel: 30, description: 'A fierce tiger that prowls with intense focus.', imagePath: '/pets/tiger.png' },
  { id: 'axolotl', name: 'Axolotl', rarity: 'epic', unlockLevel: 33, description: 'A magical axolotl that regenerates your motivation.', imagePath: '/pets/axolotl.png' },
  { id: 'phoenix', name: 'Phoenix', rarity: 'epic', unlockLevel: 35, description: 'A mythical bird reborn from streak flames.', imagePath: '/pets/phoenix.png' },

  // Legendary (2)
  { id: 'unicorn', name: 'Unicorn', rarity: 'legendary', unlockLevel: 40, description: 'The rarest pet — proof of legendary dedication.', imagePath: '/pets/unicorn.png' },
  { id: 'koi-fish', name: 'Koi Fish', rarity: 'legendary', unlockLevel: 45, description: 'A golden koi that symbolizes perseverance and fortune.', imagePath: '/pets/koi-fish.png' },
];

export const RARITY_WEIGHTS: Record<PetRarity, number> = {
  common: 45, uncommon: 28, rare: 17, epic: 8, legendary: 2,
};

export const GROWTH_SCALES: Record<GrowthSize, number> = {
  baby: 0.65, adolescent: 0.82, adult: 1.0,
};

export const RARITY_GLOW: Record<PetRarity, string | null> = {
  common: null,
  uncommon: 'rgba(255, 255, 255, 0.6)',
  rare: 'rgba(59, 130, 246, 0.7)',
  epic: 'rgba(168, 85, 247, 0.7)',
  legendary: 'rgba(234, 179, 8, 0.8)',
};

export const RARITY_COLORS: Record<PetRarity, { tooltip: string }> = {
  common: { tooltip: '#9E9E9E' },
  uncommon: { tooltip: '#66BB6A' },
  rare: { tooltip: '#42A5F5' },
  epic: { tooltip: '#AB47BC' },
  legendary: { tooltip: '#FFA726' },
};

export const RARITY_STYLES: Record<PetRarity, {
  label: string; color: string; bg: string; bgEnd: string;
  accent: string; border: string; text: string;
}> = {
  common: { label: 'Common', color: 'hsl(200 10% 55%)', bg: 'hsl(200 10% 92%)', bgEnd: 'hsl(200 10% 85%)', accent: 'hsl(200 10% 65%)', border: 'hsl(200 10% 75%)', text: 'hsl(200 10% 40%)' },
  uncommon: { label: 'Uncommon', color: 'hsl(140 40% 42%)', bg: 'hsl(140 40% 92%)', bgEnd: 'hsl(140 40% 82%)', accent: 'hsl(140 40% 55%)', border: 'hsl(140 40% 68%)', text: 'hsl(140 40% 35%)' },
  rare: { label: 'Rare', color: 'hsl(210 70% 50%)', bg: 'hsl(210 70% 93%)', bgEnd: 'hsl(210 70% 83%)', accent: 'hsl(210 70% 60%)', border: 'hsl(210 70% 70%)', text: 'hsl(210 70% 35%)' },
  epic: { label: 'Epic', color: 'hsl(280 60% 55%)', bg: 'hsl(280 60% 94%)', bgEnd: 'hsl(280 60% 82%)', accent: 'hsl(280 60% 60%)', border: 'hsl(280 60% 72%)', text: 'hsl(280 60% 40%)' },
  legendary: { label: 'Legendary', color: 'hsl(42 80% 50%)', bg: 'hsl(42 80% 93%)', bgEnd: 'hsl(42 80% 82%)', accent: 'hsl(42 80% 55%)', border: 'hsl(42 80% 68%)', text: 'hsl(42 80% 35%)' },
};

export function getPetById(id: string): PetSpecies | undefined {
  return PET_DATABASE.find(p => p.id === id);
}

export function getSizeSpritePath(speciesId: string, size: GrowthSize): string {
  return `/pets/${speciesId}-${size}.png`;
}

export function getPetsByRarity(rarity: PetRarity): PetSpecies[] {
  return PET_DATABASE.filter(p => p.rarity === rarity);
}
