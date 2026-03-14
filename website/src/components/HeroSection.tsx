import { SkyBackground } from './SkyBackground';
import { IslandScene } from './IslandScene';
import { WaitlistForm } from './WaitlistForm';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <SkyBackground className="min-h-dvh flex items-center justify-center px-5 pt-20 md:pt-24 pb-12 relative">
      {/* Two-column layout: text+form left, island right on desktop */}
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">

        {/* Left col: text + form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1 text-center md:text-left min-w-0"
        >
          <div className="section-label">
            THE FOCUS APP THAT REWARDS YOU
          </div>
          <h1 className="hero-title">
            Every Minute of Focus
            <br />
            <span className="text-primary">Grows Something Beautiful.</span>
          </h1>
          <p className="hero-subtitle" style={{ margin: '0 0 20px', maxWidth: 480 }}>
            Put your phone down. Earn adorable pixel art pets. Watch your floating island come to life — no willpower required.
          </p>
          <div className="hero-reward-badge">
            <img src="/icons/egg-legendary.png" alt="" className="hero-reward-badge__egg" />
            <span>Free <strong>Legendary Egg</strong> for early signups</span>
          </div>
          <div className="hero-form-highlight">
            <WaitlistForm variant="hero" />
          </div>
          <div className="trust-pills">
            <span className="trust-pill">
              <span className="trust-pill-dot" /> 41 collectible pets
            </span>
            <span className="trust-pill">
              <span className="trust-pill-dot" /> 6 themed islands
            </span>
            <span className="trust-pill">
              <span className="trust-pill-dot" /> Coming to iOS
            </span>
          </div>
        </motion.div>

        {/* Right col: full island (desktop) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="hidden md:flex flex-shrink-0 justify-center"
        >
          <IslandScene gridSize={10} showParticles />
        </motion.div>
      </div>

      {/* Compact island for mobile — shown below form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="md:hidden flex justify-center mt-4 relative z-10"
      >
        <div className="hero-island-mobile">
          <IslandScene gridSize={8} compact showParticles />
        </div>
      </motion.div>

      {/* Scroll indicator — desktop only */}
      <div
        className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        style={{ animation: 'scroll-bounce 2s ease-in-out infinite' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" strokeWidth="2" strokeLinecap="round">
          <path d="M7 10l5 5 5-5" />
        </svg>
      </div>
    </SkyBackground>
  );
}
