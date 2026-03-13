import { useEffect, useState } from 'react';

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="sticky-mobile-cta">
      <a
        href="#waitlist"
        className="cta-primary"
      >
        Join the Waitlist — Free Legendary Egg
      </a>
    </div>
  );
}
