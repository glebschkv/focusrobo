import { SkyBackground } from './SkyBackground';
import { IslandScene } from './IslandScene';
import { WaitlistForm } from './WaitlistForm';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <SkyBackground className="md:min-h-[calc(100dvh-80px)] flex items-center justify-center px-5 pt-12 md:pt-0 pb-12 relative">
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
            Put Your Phone Down.
            <br />
            <span className="text-primary">Get a Pet.</span>
          </h1>
          <p className="hero-subtitle" style={{ margin: '0 0 32px', maxWidth: 480 }}>
            Focus sessions earn pixel art pets that live on your floating island. No willpower required.
          </p>
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

        {/* Right col: island */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-shrink-0 w-full md:w-auto"
        >
          <IslandScene gridSize={10} />
        </motion.div>
      </div>

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
