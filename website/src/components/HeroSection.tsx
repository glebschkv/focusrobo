import { SkyBackground } from './SkyBackground';
import { IslandScene } from './IslandScene';
import { WaitlistForm } from './WaitlistForm';

export function HeroSection() {
  return (
    <SkyBackground className="min-h-screen flex flex-col items-center justify-center px-5 pt-16 pb-8 relative">
      {/* Hero text */}
      <div className="text-center mb-8 relative z-10">
        <h1
          style={{
            fontSize: 'clamp(36px, 8vw, 52px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: 'var(--fg-deep)',
            marginBottom: 12,
          }}
        >
          Focus. Grow. Collect.
        </h1>
        <p
          style={{
            fontSize: 'clamp(15px, 3.5vw, 18px)',
            color: 'var(--fg-muted)',
            maxWidth: 440,
            margin: '0 auto',
            lineHeight: 1.5,
          }}
        >
          Put your phone down. Earn pixel art pets. Build your floating island.
        </p>
      </div>

      {/* Island */}
      <div className="relative z-10 mb-8">
        <IslandScene gridSize={10} />
      </div>

      {/* Waitlist Form */}
      <div className="relative z-10 w-full max-w-md">
        <WaitlistForm variant="hero" />
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        style={{ animation: 'scroll-bounce 2s ease-in-out infinite' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" strokeWidth="2" strokeLinecap="round">
          <path d="M7 10l5 5 5-5" />
        </svg>
      </div>
    </SkyBackground>
  );
}
