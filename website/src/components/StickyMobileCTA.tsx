import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StickyMobileCTAProps {
  heroRef: React.RefObject<HTMLElement | null>;
  footerCtaRef: React.RefObject<HTMLElement | null>;
  children: ReactNode;
}

export function StickyMobileCTA({ heroRef, footerCtaRef, children }: StickyMobileCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      const heroBottom = heroRef.current?.getBoundingClientRect().bottom ?? 0;
      const footerTop = footerCtaRef.current?.getBoundingClientRect().top ?? Infinity;
      const viewportHeight = window.innerHeight;

      const pastHero = heroBottom < -100;
      const footerVisible = footerTop < viewportHeight + 100;

      setVisible(pastHero && !footerVisible);
    };

    checkVisibility();
    window.addEventListener('scroll', checkVisibility, { passive: true });
    return () => window.removeEventListener('scroll', checkVisibility);
  }, [heroRef, footerCtaRef]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="sticky-cta-bar"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
