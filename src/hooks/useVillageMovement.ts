import { useRef, useCallback, useEffect, useState } from 'react';
import {
  type VillageCharacterConfig,
  type WalkableArea,
  VILLAGE_AREAS,
  MAP_WIDTH,
  MAP_HEIGHT,
} from '@/components/pixel-world/villageConfig';

// ── Types ──────────────────────────────────────────────────────────

export type Direction = 'down' | 'left' | 'right' | 'up';
export type CharacterState = 'walking' | 'idle';

export interface CharacterMovementState {
  id: string;
  x: number;           // position in CSS pixels (0 to MAP_WIDTH)
  y: number;           // position in CSS pixels (0 to MAP_HEIGHT)
  targetX: number;
  targetY: number;
  direction: Direction;
  state: CharacterState;
  speed: number;       // pixels per second
  idleTimer: number;   // ms remaining in idle
  spawned: boolean;    // true once spawn animation finished
}

// ── Constants ──────────────────────────────────────────────────────

const TICK_INTERVAL = 1000 / 30; // 30 fps
const MIN_IDLE_MS = 1500;
const MAX_IDLE_MS = 4500;
const MIN_SPEED = 18;
const MAX_SPEED = 35;
const ARRIVAL_THRESHOLD = 3; // px
const MIN_SEPARATION = 70;   // min px between character centers
const SEPARATION_FORCE = 60; // push-apart speed (px/s)

// ── Helpers ────────────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomIdleTime(): number {
  return randomBetween(MIN_IDLE_MS, MAX_IDLE_MS);
}

function randomSpeed(): number {
  return randomBetween(MIN_SPEED, MAX_SPEED);
}

/** Convert a walkable area (in % of map) to pixel coordinates */
function areaToPixels(area: WalkableArea): WalkableArea {
  return {
    minX: (area.minX / 100) * MAP_WIDTH,
    maxX: (area.maxX / 100) * MAP_WIDTH,
    minY: (area.minY / 100) * MAP_HEIGHT,
    maxY: (area.maxY / 100) * MAP_HEIGHT,
  };
}

function randomPointInArea(area: WalkableArea): { x: number; y: number } {
  return {
    x: randomBetween(area.minX, area.maxX),
    y: randomBetween(area.minY, area.maxY),
  };
}

function getDirection(dx: number, dy: number): Direction {
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx < 0 ? 'left' : 'right';
  }
  return dy < 0 ? 'up' : 'down';
}

function getWalkableAreaForCharacter(charConfig: VillageCharacterConfig): WalkableArea {
  const area = VILLAGE_AREAS.find(a => a.id === charConfig.areaId);
  if (!area) {
    // Fallback: center of map
    return areaToPixels({ minX: 20, maxX: 80, minY: 30, maxY: 70 });
  }
  return areaToPixels(area.walkable);
}

function getSpawnPoint(charConfig: VillageCharacterConfig): { x: number; y: number } {
  const area = VILLAGE_AREAS.find(a => a.id === charConfig.areaId);
  if (area && area.spawnPoints.length > 0) {
    const sp = area.spawnPoints[Math.floor(Math.random() * area.spawnPoints.length)];
    return {
      x: (sp.x / 100) * MAP_WIDTH,
      y: (sp.y / 100) * MAP_HEIGHT,
    };
  }
  const walkable = getWalkableAreaForCharacter(charConfig);
  return randomPointInArea(walkable);
}

// ── Hook ───────────────────────────────────────────────────────────

export function useVillageMovement(
  characters: VillageCharacterConfig[],
  paused = false,
): Map<string, CharacterMovementState> {
  const [states, setStates] = useState<Map<string, CharacterMovementState>>(new Map());
  const statesRef = useRef<Map<string, CharacterMovementState>>(new Map());
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);

  // Initialize / update character list
  const initCharacters = useCallback((chars: VillageCharacterConfig[]) => {
    const existing = statesRef.current;
    const newMap = new Map<string, CharacterMovementState>();

    for (const char of chars) {
      if (existing.has(char.id)) {
        // Keep existing state
        newMap.set(char.id, existing.get(char.id)!);
      } else {
        // New character — spawn
        const spawn = getSpawnPoint(char);
        const walkable = getWalkableAreaForCharacter(char);
        const target = randomPointInArea(walkable);

        newMap.set(char.id, {
          id: char.id,
          x: spawn.x,
          y: spawn.y,
          targetX: target.x,
          targetY: target.y,
          direction: 'down',
          state: 'idle',
          speed: randomSpeed(),
          idleTimer: randomIdleTime(),
          spawned: true,
        });
      }
    }

    statesRef.current = newMap;
    setStates(new Map(newMap));
  }, []);

  useEffect(() => {
    initCharacters(characters);
  }, [characters, initCharacters]);

  // Animation loop
  useEffect(() => {
    if (paused) return;

    const tick = (dt: number) => {
      const map = statesRef.current;
      let changed = false;

      for (const [id, bot] of map) {
        const charConfig = characters.find(c => c.id === id);
        if (!charConfig) continue;

        if (bot.state === 'idle') {
          bot.idleTimer -= dt;
          if (bot.idleTimer <= 0) {
            // Pick new target
            const walkable = getWalkableAreaForCharacter(charConfig);
            const target = randomPointInArea(walkable);
            bot.targetX = target.x;
            bot.targetY = target.y;
            bot.direction = getDirection(target.x - bot.x, target.y - bot.y);
            bot.state = 'walking';
            bot.speed = randomSpeed();
            changed = true;
          }
        } else {
          // Walking
          const dx = bot.targetX - bot.x;
          const dy = bot.targetY - bot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < ARRIVAL_THRESHOLD) {
            // Arrived
            bot.x = bot.targetX;
            bot.y = bot.targetY;
            bot.state = 'idle';
            bot.idleTimer = randomIdleTime();
            changed = true;
          } else {
            const moveX = (dx / dist) * bot.speed * (dt / 1000);
            const moveY = (dy / dist) * bot.speed * (dt / 1000);
            bot.x += moveX;
            bot.y += moveY;
            changed = true;
          }
        }
      }

      // Separation pass — push overlapping characters apart
      const entries = Array.from(map.values());
      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const a = entries[i];
          const b = entries[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MIN_SEPARATION && dist > 0.1) {
            const pushX = (dx / dist) * SEPARATION_FORCE * (dt / 1000);
            const pushY = (dy / dist) * SEPARATION_FORCE * (dt / 1000);
            a.x += pushX;
            a.y += pushY;
            b.x -= pushX;
            b.y -= pushY;
            changed = true;
          } else if (dist <= 0.1) {
            // Exactly overlapping — nudge randomly
            a.x += (Math.random() - 0.5) * 4;
            a.y += (Math.random() - 0.5) * 4;
            changed = true;
          }
        }
      }

      // Clamp all characters within map bounds (with margin for sprite size)
      for (const bot of entries) {
        bot.x = Math.max(20, Math.min(MAP_WIDTH - 20, bot.x));
        bot.y = Math.max(20, Math.min(MAP_HEIGHT - 20, bot.y));
      }

      if (changed) {
        setStates(new Map(map));
      }
    };

    const loop = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const delta = Math.min(time - lastTimeRef.current, 100); // cap at 100ms
      lastTimeRef.current = time;
      accumulatorRef.current += delta;

      while (accumulatorRef.current >= TICK_INTERVAL) {
        tick(TICK_INTERVAL);
        accumulatorRef.current -= TICK_INTERVAL;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
      accumulatorRef.current = 0;
    };
  }, [paused, characters]);

  // Pause when tab hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
        lastTimeRef.current = 0;
        accumulatorRef.current = 0;
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return states;
}
