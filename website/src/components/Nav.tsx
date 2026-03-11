import { useEffect, useState } from 'react';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`site-nav ${scrolled ? 'site-nav--scrolled' : ''}`}>
      <a href="#" className="nav-logo">
        <img src="/app-icon.png" alt="PhoNo" />
        PhoNo
      </a>
      <a href="#waitlist" className="nav-cta">Join Waitlist</a>
    </nav>
  );
}
