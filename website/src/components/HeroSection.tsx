import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { SkyBackground } from './SkyBackground';
import { IslandScene } from './IslandScene';
import { WaitlistForm } from './WaitlistForm';

export const HeroSection = forwardRef<HTMLElement>(function HeroSection(_, ref) {
  return (
    <SkyBackground className="min-h-screen flex flex-col items-center justify-center px-5 pt-20 pb-8 relative">
      <section ref={ref} className="w-full max-w-2xl mx-auto flex flex-col items-center relative z-10">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center"
          style={{
            fontSize: 'clamp(36px, 10vw, 60px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: 'var(--fg-deep)',
            marginBottom: 16,
          }}
        >
          Your Focus Grows<br />a Little World.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center"
          style={{
            fontSize: 'clamp(15px, 3.5vw, 18px)',
            color: 'var(--fg-body)',
            maxWidth: 480,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Every minute off your phone earns adorable pixel art pets for your floating island. The coziest reason to actually focus.
        </motion.p>

        {/* Waitlist Form — ABOVE the island */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-md mt-8"
        >
          <WaitlistForm variant="hero" />
        </motion.div>

        {/* Island — below the form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-8 w-full"
          style={{ maxWidth: 440 }}
        >
          <IslandScene gridSize={10} />
        </motion.div>
      </section>
    </SkyBackground>
  );
});
