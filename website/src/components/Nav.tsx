import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`site-nav ${scrolled || !isHome ? 'site-nav--scrolled' : ''}`}>
      <Link to="/" className="nav-logo">
        <img src="/app-icon.png" alt="PhoNo" />
        PhoNo
      </Link>

      {isHome && (
        <div className="nav-links">
          <a href="#how-it-works">How It Works</a>
          <a href="#rewards">Rewards</a>
          <a href="#pets">Pets</a>
        </div>
      )}

      {isHome ? (
        <a href="#waitlist" className="nav-cta">Join Waitlist</a>
      ) : (
        <Link to="/" className="nav-cta">Home</Link>
      )}
    </nav>
  );
}
