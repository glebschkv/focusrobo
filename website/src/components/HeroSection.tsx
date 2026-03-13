import { SkyBackground } from './SkyBackground';
import { IslandScene } from './IslandScene';
import { WaitlistForm } from './WaitlistForm';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <SkyBackground className="min-h-[calc(100dvh-80px)] flex flex-col items-center justify-center px-5 pt-20 md:pt-24 pb-12 relative">
      {/* Hero text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center mb-8 relative z-10"
      >
        <div className="section-label" style={{ marginBottom: 16 }}>
          THE FOCUS APP THAT REWARDS YOU
        </div>
        <h1
          style={{
            fontSize: 'clamp(40px, 10vw, 72px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: 'var(--fg-deep)',
            marginBottom: 16,
          }}
        >
          Put Your Phone Down.
          <br />
          <span style={{ color: 'var(--primary)' }}>Get a Pet.</span>
        </h1>
        <p
          style={{
            fontSize: 'clamp(16px, 3.5vw, 19px)',
            color: 'var(--fg-muted)',
            maxWidth: 480,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Complete focus sessions to earn pixel art pets and build your own floating island paradise.
        </p>
      </motion.div>

      {/* Waitlist Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-lg mb-10"
      >
        <WaitlistForm variant="hero" />
      </motion.div>

      {/* Island */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10"
      >
        <IslandScene gridSize={10} />
      </motion.div>

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
