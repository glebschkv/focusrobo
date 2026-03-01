import { memo, useMemo } from 'react';

/**
 * AmbientParticles — Floating butterflies, sparkles, and leaves
 * that make the village feel alive. All CSS-animated for GPU performance.
 */
export const AmbientParticles = memo(function AmbientParticles() {
  const particles = useMemo(() => generateParticles(), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 800 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `${p.animation} ${p.duration}s ${p.easing} infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.type === 'butterfly' && <Butterfly color={p.color} size={p.size} />}
          {p.type === 'sparkle' && <Sparkle size={p.size} />}
          {p.type === 'leaf' && <Leaf size={p.size} />}
        </div>
      ))}
    </div>
  );
});

// ── Particle types ─────────────────────────────────────────────────

const Butterfly = memo(function Butterfly({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* Left wing */}
      <ellipse cx="5" cy="7" rx="4" ry="5" fill={color} opacity="0.8">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 8 8;15 8 8;0 8 8;-15 8 8;0 8 8"
          dur="0.6s"
          repeatCount="indefinite"
        />
      </ellipse>
      {/* Right wing */}
      <ellipse cx="11" cy="7" rx="4" ry="5" fill={color} opacity="0.8">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 8 8;-15 8 8;0 8 8;15 8 8;0 8 8"
          dur="0.6s"
          repeatCount="indefinite"
        />
      </ellipse>
      {/* Body */}
      <rect x="7" y="4" width="2" height="8" rx="1" fill="#333" />
    </svg>
  );
});

const Sparkle = memo(function Sparkle({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,220,0.9) 0%, rgba(255,255,180,0.4) 50%, transparent 100%)',
        animation: `sparkle-twinkle ${2 + Math.random() * 2}s ease-in-out infinite`,
      }}
    />
  );
});

const Leaf = memo(function Leaf({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12">
      <ellipse cx="6" cy="6" rx="4" ry="2.5" fill="#78B856" opacity="0.7"
        transform="rotate(-30 6 6)"
      />
      <line x1="3" y1="7" x2="9" y2="5" stroke="#5DA03A" strokeWidth="0.5" />
    </svg>
  );
});

// ── Particle generator ─────────────────────────────────────────────

interface Particle {
  id: string;
  type: 'butterfly' | 'sparkle' | 'leaf';
  x: number;
  y: number;
  size: number;
  color: string;
  animation: string;
  duration: number;
  delay: number;
  easing: string;
}

const BUTTERFLY_COLORS = ['#FF7EB3', '#FFD93D', '#B088F9', '#7EC8E3', '#FF9F43'];

function generateParticles(): Particle[] {
  const particles: Particle[] = [];

  // Butterflies (4-5)
  for (let i = 0; i < 5; i++) {
    particles.push({
      id: `butterfly-${i}`,
      type: 'butterfly',
      x: 15 + Math.random() * 70,
      y: 45 + Math.random() * 35,
      size: 14 + Math.random() * 6,
      color: BUTTERFLY_COLORS[i % BUTTERFLY_COLORS.length],
      animation: 'butterfly-float',
      duration: 6 + Math.random() * 4,
      delay: Math.random() * 3,
      easing: 'ease-in-out',
    });
  }

  // Sparkles (6-8)
  for (let i = 0; i < 7; i++) {
    particles.push({
      id: `sparkle-${i}`,
      type: 'sparkle',
      x: 10 + Math.random() * 80,
      y: 40 + Math.random() * 40,
      size: 4 + Math.random() * 4,
      color: '',
      animation: 'sparkle-twinkle',
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 4,
      easing: 'ease-in-out',
    });
  }

  // Falling leaves (3-4)
  for (let i = 0; i < 4; i++) {
    particles.push({
      id: `leaf-${i}`,
      type: 'leaf',
      x: 20 + Math.random() * 60,
      y: 35 + Math.random() * 15,
      size: 10 + Math.random() * 6,
      color: '',
      animation: 'leaf-fall',
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 5,
      easing: 'linear',
    });
  }

  return particles;
}
