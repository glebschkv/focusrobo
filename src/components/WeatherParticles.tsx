/**
 * WeatherParticles — Lightweight weather effects for the island sky.
 * Rain, cherry blossoms, fireflies, or stars depending on time + seed.
 * Biome-aware: each biome can override default weather behavior.
 */

import { useMemo } from 'react';

export type WeatherType = 'clear' | 'rain' | 'petals' | 'fireflies';
export type TimePeriod = 'dawn' | 'day' | 'dusk' | 'night';

/** Deterministic seed from date string */
function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Seeded pseudo-random from hash */
function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export function getTimePeriod(): TimePeriod {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

export function getWeatherType(timePeriod: TimePeriod): WeatherType {
  const seed = hashDate(new Date().toDateString());
  const roll = seededRandom(seed, 0);
  if (roll < 0.10) return 'rain';
  if (roll < 0.15) return 'petals';
  if (roll < 0.20 && timePeriod === 'night') return 'fireflies';
  return 'clear';
}

/** Returns null to always use the theme's own sky colors. */
export function getSkyColors(_timePeriod: TimePeriod) {
  return null;
}

interface WeatherParticlesProps {
  timePeriod: TimePeriod;
  weather: WeatherType;
  biomeId?: string;
}

export const WeatherParticles = ({ timePeriod, weather, biomeId }: WeatherParticlesProps) => {
  // Biome overrides for weather type
  const effectiveWeather = useMemo(() => {
    if (biomeId === 'night') return 'fireflies';
    if (biomeId === 'sakura') return 'petals';
    if (biomeId === 'winter' && weather === 'clear') return 'clear'; // snow handled by CSS petal-stream
    if (biomeId === 'beach' && weather === 'clear') return 'clear'; // sparkles via sky animations
    return weather;
  }, [weather, biomeId]);

  // Night biome always shows stars; other biomes only at real night
  const showStars = timePeriod === 'night' || biomeId === 'night';

  const particles = useMemo(() => {
    if (!showStars) return [];
    const seed = hashDate(new Date().toDateString());
    const count = biomeId === 'night' ? 30 : 20;
    return Array.from({ length: count }, (_, i) => ({
      type: 'star' as const,
      key: `star-${i}`,
      left: `${seededRandom(seed, i * 3) * 95}%`,
      top: `${seededRandom(seed, i * 3 + 1) * 60}%`,
      delay: `${seededRandom(seed, i * 3 + 2) * 4}s`,
      duration: `${2 + seededRandom(seed, i * 5) * 3}s`,
    }));
  }, [showStars, biomeId]);

  const weatherParticles = useMemo(() => {
    const seed = hashDate(new Date().toDateString());

    switch (effectiveWeather) {
      case 'rain':
        return Array.from({ length: 15 }, (_, i) => ({
          type: 'rain' as const,
          key: `rain-${i}`,
          left: `${seededRandom(seed, i * 7) * 100}%`,
          delay: `${seededRandom(seed, i * 7 + 1) * 2}s`,
          duration: `${1 + seededRandom(seed, i * 7 + 2)}s`,
        }));
      case 'petals': {
        // Sakura biome gets denser, slower petals
        const count = biomeId === 'sakura' ? 18 : 10;
        return Array.from({ length: count }, (_, i) => ({
          type: 'petal' as const,
          key: `petal-${i}`,
          left: `${seededRandom(seed, i * 11) * 100}%`,
          delay: `${seededRandom(seed, i * 11 + 1) * 5}s`,
          duration: `${(biomeId === 'sakura' ? 5 : 3) + seededRandom(seed, i * 11 + 2) * 3}s`,
        }));
      }
      case 'fireflies': {
        // Night biome gets denser fireflies
        const count = biomeId === 'night' ? 14 : 8;
        return Array.from({ length: count }, (_, i) => ({
          type: 'firefly' as const,
          key: `fly-${i}`,
          left: `${10 + seededRandom(seed, i * 13) * 80}%`,
          top: `${20 + seededRandom(seed, i * 13 + 1) * 50}%`,
          delay: `${seededRandom(seed, i * 13 + 2) * 4}s`,
          duration: `${3 + seededRandom(seed, i * 13 + 3) * 3}s`,
        }));
      }
      default:
        return [];
    }
  }, [effectiveWeather, biomeId]);

  return (
    <>
      {/* Stars */}
      {particles.map(p => (
        <div
          key={p.key}
          className="weather-star"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      {/* Weather effects */}
      {weatherParticles.map(p => {
        if (p.type === 'rain') {
          return (
            <div
              key={p.key}
              className="weather-rain"
              style={{
                left: p.left,
                animationDelay: p.delay,
                '--rain-dur': p.duration,
              } as React.CSSProperties}
            />
          );
        }
        if (p.type === 'petal') {
          return (
            <div
              key={p.key}
              className={`weather-petal${biomeId === 'sakura' ? ' weather-petal--sakura' : ''}`}
              style={{
                left: p.left,
                animationDelay: p.delay,
                '--petal-dur': p.duration,
              } as React.CSSProperties}
            />
          );
        }
        if (p.type === 'firefly') {
          return (
            <div
              key={p.key}
              className={`weather-firefly${biomeId === 'night' ? ' weather-firefly--bioluminescent' : ''}`}
              style={{
                left: p.left,
                top: (p as any).top,
                animationDelay: p.delay,
                '--firefly-dur': p.duration,
              } as React.CSSProperties}
            />
          );
        }
        return null;
      })}
    </>
  );
};
