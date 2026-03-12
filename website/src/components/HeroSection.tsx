import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { SkyBackground } from './SkyBackground';
import { IslandScene } from './IslandScene';
import { WaitlistForm } from './WaitlistForm';

export const HeroSection = forwardRef<HTMLElement>(function HeroSection(_, ref) {
  return (
    <SkyBackground className="min-h-screen flex flex-col items-center justify-start px-5 pt-32 pb-12 relative">
      <section ref={ref} className="w-full max-w-2xl mx-auto flex flex-col items-center relative z-10">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="hero-heading display-font text-center"
          style={{ marginBottom: 20 }}
        >
          Your Focus Grows<br />a Little World.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="section-desc text-center"
          style={{ fontSize: 'clamp(15px, 3.5vw, 18px)', color: 'var(--fg-body)' }}
        >
          Block distracting apps, stay focused, and earn adorable pixel art pets for your floating island. The coziest reason to actually put your phone down.
        </motion.p>

        {/* Urgency hook */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="accent-label text-center"
          style={{ marginTop: 14 }}
        >
          First 1,000 members get a free Legendary Egg on launch day
        </motion.p>

        {/* Waitlist Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full mt-8"
          style={{ maxWidth: 480 }}
        >
          <WaitlistForm variant="hero" />
        </motion.div>

        {/* Island */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-10 w-full"
          style={{ maxWidth: 520 }}
        >
          <IslandScene gridSize={10} />
        </motion.div>
      </section>
    </SkyBackground>
  );
});
