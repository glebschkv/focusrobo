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
        <div className="section-label">
          THE FOCUS APP THAT REWARDS YOU
        </div>
        <h1 className="hero-title">
          Put Your Phone Down.
          <br />
          <span className="text-primary">Get a Pet.</span>
        </h1>
        <p className="hero-subtitle">
          Focus sessions earn pixel art pets that live on your floating island. No willpower required.
        </p>
      </motion.div>

      {/* Waitlist Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-lg mb-10"
      >
        <div className="hero-form-highlight">
          <WaitlistForm variant="hero" />
        </div>
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
