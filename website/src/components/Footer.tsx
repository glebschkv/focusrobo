import { Link } from 'react-router-dom';

const PARADE_PETS = ['bunny', 'chick', 'frog', 'capybara', 'cat', 'hedgehog', 'fox', 'corgi'];

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg-cream)',
        borderTop: '1px solid rgba(234, 179, 8, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="max-w-4xl mx-auto" style={{ padding: '48px 20px 56px' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <img src="/app-icon.png" alt="PhoNo" style={{ width: 24, height: 24, borderRadius: 6 }} />
            <span className="display-font" style={{ fontWeight: 700, color: 'var(--fg-deep)', fontSize: 16 }}>
              PhoNo
            </span>
          </Link>

          <div className="flex gap-6" style={{ fontSize: 14 }}>
            <Link to="/privacy" style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}>
              Privacy
            </Link>
            <Link to="/terms" style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}>
              Terms
            </Link>
            <Link to="/support" style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}>
              Support
            </Link>
            <a href="mailto:hello@phono.app" style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}>
              Contact
            </a>
          </div>

          <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
            &copy; {new Date().getFullYear()} PhoNo Inc.
          </div>
        </div>

        <div className="text-center" style={{ marginTop: 32 }}>
          <p style={{ fontSize: 13, color: 'var(--fg-muted)', opacity: 0.6 }}>
            Made with care by the PhoNo team
          </p>
        </div>
      </div>

      {/* Pet parade */}
      <div className="pet-parade" style={{ opacity: 0.25 }}>
        {PARADE_PETS.map((pet, i) => (
          <img
            key={pet}
            src={`/pets/${pet}-baby.png`}
            alt=""
            className="pet-parade__pet pixel-art"
            style={{ animationDelay: `${i * 2.5}s`, left: `${i * -50}px` }}
            loading="lazy"
          />
        ))}
      </div>
    </footer>
  );
}
