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
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
      >
        <img src="/icons/egg-legendary.png" alt="" width="20" height="20" style={{ imageRendering: 'pixelated' }} />
        Join Waitlist — Free Legendary Egg
      </a>
    </div>
  );
}
