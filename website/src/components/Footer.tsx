import { Link } from 'react-router-dom';

const PARADE_PETS_ROW1 = ['bunny', 'chick', 'frog', 'capybara', 'cat', 'hedgehog', 'fox', 'corgi'];
const PARADE_PETS_ROW2 = ['owl', 'penguin', 'turtle', 'deer', 'shiba-inu', 'dragon', 'panda', 'koala'];

export function Footer() {
  return (
    <footer className="site-footer py-16 px-5">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-12">
          {/* Brand */}
          <div className="text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start gap-2 mb-3" style={{ textDecoration: 'none' }}>
              <img src="/app-icon.png" alt="PhoNo" style={{ width: 28, height: 28, borderRadius: 6 }} />
              <span style={{ fontWeight: 800, color: 'rgba(255,255,255,0.85)', fontSize: 18 }}>PhoNo</span>
            </Link>
            <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 240 }}>
              The focus app that rewards you with pixel art pets and floating islands.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, color: 'rgba(255,255,255,0.3)' }}>
              Quick Links
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <a href="#how-it-works">How It Works</a>
              <a href="#rewards">Rewards</a>
              <a href="#pets">Pets</a>
              <Link to="/support">Support</Link>
            </div>
          </div>

          {/* Legal */}
          <div className="text-center md:text-left">
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, color: 'rgba(255,255,255,0.3)' }}>
              Legal
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <a href="mailto:hello@phono.app">Contact</a>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 20,
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          &copy; {new Date().getFullYear()} PhoNo Inc. All rights reserved.
        </div>
      </div>

      {/* Pet parade — two rows going opposite directions */}
      <div className="pet-parade">
        {PARADE_PETS_ROW1.map((pet, i) => (
          <img
            key={pet}
            src={`/pets/${pet}-baby.png`}
            alt=""
            className="pet-parade__pet"
            style={{ animationDelay: `${i * 2.5}s`, left: `${i * -50}px` }}
            loading="lazy"
          />
        ))}
      </div>
      <div className="pet-parade pet-parade--reverse">
        {PARADE_PETS_ROW2.map((pet, i) => (
          <img
            key={pet}
            src={`/pets/${pet}-baby.png`}
            alt=""
            className="pet-parade__pet"
            style={{ animationDelay: `${i * 2.5}s`, right: `${i * -50}px` }}
            loading="lazy"
          />
        ))}
      </div>
    </footer>
  );
}
